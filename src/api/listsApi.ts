import { type NewShoppingList, type ShoppingList } from "../types/list";
import { baseApi } from "./baseApi";

export const listsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLists: builder.query<ShoppingList[], string>({
            query: (userId) => `/shoppingList?UserId=${userId}`,
            providesTags: ["Lists"],
        }),
        addList: builder.mutation<ShoppingList, NewShoppingList & {userId: string }>({
            query: (body) => ({
                url: "shoppingLists",
                method: "POST",
                body: {...body, createdAt: new Date().toISOString(), sharedWith: []},
            }),
            invalidatesTags: ["Lists"],
        }),
        updateList: builder.mutation<ShoppingList, { id: string; changes: Partial<ShoppingList> }>({
            query: ({id, changes }) => ({ url: `/shoppingLists/${id}`, method: "PATCH", body: changes }),
            invalidatesTags: ["Lists"],
        }),
        dleteList: builder.mutation<void, string>({
            async queryFn(id, _api, _extra, baseQuery){
                const items = await baseQuery(`/item?listId=${id}`);
                const itemList = (items.data as { id: string }[]) ?? [];
                await Promise.all(itemList.map((item) => baseQuery({ url: `/items/${item.id}`, method: "DELETE"})));
                await baseQuery({ url: `/shoppingLists/${id}`, method: "DELETE"});
                return { data: undefined };
            },
            invalidatesTags: ["Lists", "Items"],
        }),
        shareList: builder.mutation<ShoppingList, {id: string; sharedWith: string[]}>({
            query: ({ id, sharedWith }) => ({ url: `/shoppingLists/${id}`, method: "PATCH", body: {sharedWith} }),
            invalidatesTags: ["Lists"],
        }),
    }),
})

export const {
    useGetListQuery,
    useAddListMutation,
    useUpdateListMutation,
    useDeleteListMutation,
    useShareListMutation,
} = listsApi;