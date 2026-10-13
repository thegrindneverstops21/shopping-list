import { type User, type RegisterPayload } from "../types/users";
import { encryptPassword } from "../utils/encryption";
import { baseApi } from "./baseApi";
import { normalizeEmail } from "../utils/users";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    findUserByEmail: builder.query<User[], string>({
      // Match legacy mixed-case emails too. Anchors mean the entire email must match.
      query: (email) => `/users?email_like=${encodeURIComponent(`^${normalizeEmail(email).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)}`,
      providesTags: ["Users"],
    }),
    registerUser: builder.mutation<User, RegisterPayload>({
      query: (payload) => ({
        url: "/users",
        method: "POST",
        // This is a classroom AES exercise, not a substitute for server authentication.
        body: { ...payload, email: normalizeEmail(payload.email), password: encryptPassword(payload.password) },
      }),
      // invalidatesTags: After registering, refresh User cache
      // This tells RTK Query to refetch any queries with "Users" tag
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation<User, { id: string; changes: Partial<User> }>({
      query: ({ id, changes }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: changes,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteAccount: builder.mutation<null, { userId: string }>({
      async queryFn({ userId }, _api, _extra, baseQuery) {
        // Step 1: Get all lists owned by this user
        const listRes = await baseQuery(`/shoppingLists?userId=${userId}`);
        if (listRes.error) return { error: listRes.error };
        const lists = (listRes.data as { id: string }[]) ?? [];

        // Step 2: For each list, delete all items in it, then delete the list
        for (const list of lists) {
          // Get all items in this list
          const itemRes = await baseQuery(`/items?listId=${list.id}`);
          if (itemRes.error) return { error: itemRes.error };
          const items = (itemRes.data as { id: string }[]) ?? [];

          // Delete all items in parallel using Promise.all()
          // (This makes the operation faster than deleting one at a time)
          const deletedItems = await Promise.all(
            items.map((item) =>
              baseQuery({ url: `/items/${item.id}`, method: "DELETE" }),
            ),
          );
          // A failed request must reach the caller; otherwise the UI reports false success.
          const failedItem = deletedItems.find((result) => result.error);
          if (failedItem?.error) return { error: failedItem.error };

          // Delete the list itself
          const deletedList = await baseQuery({
            url: `/shoppingLists/${list.id}`,
            method: "DELETE",
          });
          if (deletedList.error) return { error: deletedList.error };
        }
        // Step 3: Finally, delete the user
        const deletedUser = await baseQuery({ url: `/users/${userId}`, method: "DELETE" });
        if (deletedUser.error) return { error: deletedUser.error };
        return { data: null };
      },
      // Invalidate all these cache tags since user and all their data are gone
      invalidatesTags: ["Users", "Lists", "Items"],
    }),
  }),
});

export const {
  useLazyFindUserByEmailQuery,
  useRegisterUserMutation,
  useUpdateUserMutation,
  useDeleteAccountMutation
} = authApi;
