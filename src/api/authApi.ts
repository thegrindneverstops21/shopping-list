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
        body: { ...payload, password: encryptPassword(payload.password) },
      }),
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
        const listRes = await baseQuery(`/shoppingLists?userId=${userId}`);
        const lists = (listRes.data as { id: string }[]) ?? [];

        for (const list of lists) {
          const itemRes = await baseQuery(`/items?listId=${list.id}`);
          const items = (itemRes.data as { id: string }[]) ?? [];

          await Promise.all(
            items.map((item) =>
              baseQuery({ url: `/items/${item.id}`, method: "DELETE" }),
            ),
          );

          await baseQuery({
            url: `/shoppingLists/${list.id}`,
            method: "DELETE",
          });
        }
        await baseQuery({ url: `/users/${userId}`, method: "DELETE" });
        return { data: undefined };
      },
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
