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
                body: {...payload, password: encryptPassword(payload.password) },
            }),
            invalidatesTags: ["Users"],
        }),
        updateUser: builder.mutation<User, {id: string; changes: Partial<User> }>({
            query: ({id, changes }) => ({
                url: `/users/${id}`,
                method: "PATCH",
                body: changes }),
                invalidatesTags: ["Users"]
        }),
    }),
})

export const {
    useLazyFindUserByEmailQuery,
    useRegisterUserMutation,
    useUpdateUserMutation
} = authApi;