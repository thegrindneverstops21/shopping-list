import { type User, type RegisterPayload } from "../types/users";
import { encryptPassword } from "../utils/encryption";
import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    findUserByEmail: builder.query<User[], string>({
      query: (email) => `/users?email=${encodeURIComponent(email)}`,
    }),
    registerUser: builder.mutation<User, RegisterPayload>({
      query: (payload) => ({
        url: "/users",
        method: "POST",
        // encryptPassword: Client-side encryption before sending to server
        // This prevents plain passwords from being sent over the network
        body: { ...payload, password: encryptPassword(payload.password) },
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
    deleteAccount: builder.mutation<void, { userId: string }>({
      async queryFn({ userId }, _api, _extra, baseQuery) {
        // Step 1: Get all lists owned by this user
        const listRes = await baseQuery(`/shoppingLists?userId=${userId}`);
        const lists = (listRes.data as { id: string }[]) ?? [];

        // Step 2: For each list, delete all items in it, then delete the list
        for (const list of lists) {
          // Get all items in this list
          const itemRes = await baseQuery(`/items?listId=${list.id}`);
          const items = (itemRes.data as { id: string }[]) ?? [];

          // Delete all items in parallel using Promise.all()
          // (This makes the operation faster than deleting one at a time)
          await Promise.all(
            items.map((item) =>
              baseQuery({ url: `/items/${item.id}`, method: "DELETE" }),
            ),
          );

          // Delete the list itself
          await baseQuery({
            url: `/shoppingLists/${list.id}`,
            method: "DELETE",
          });
        }
        // Step 3: Finally, delete the user
        await baseQuery({ url: `/users/${userId}`, method: "DELETE" });
        return { data: undefined };
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
