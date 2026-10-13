import { type NewShoppingList, type ShoppingList } from "../types/list";
import { baseApi } from "./baseApi";
import { normalizeEmail } from "../utils/users";

export const listsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getList: builder.query<ShoppingList[], { userId: string; email: string }>({
            async queryFn({ userId, email }, _api, _extra, baseQuery) {
                const response = await baseQuery("/shoppingLists");
                if (response.error) return { error: response.error };
                // json-server has no permission system. Filter owned and shared lists for the UI.
                const lists = response.data as ShoppingList[];
                return { data: lists.filter((list) => String(list.userId) === String(userId) ||
                    (list.sharedWith ?? []).some((recipient) => normalizeEmail(recipient) === normalizeEmail(email))) };
            },
            providesTags: ["Lists"],
        }),
        addList: builder.mutation<ShoppingList, NewShoppingList & {userId: string }>({
            query: (body) => ({
                url: "/shoppingLists",
                method: "POST",
                body: {...body, createdAt: new Date().toISOString(), sharedWith: []},
            }),
            invalidatesTags: ["Lists"],
        }),
        updateList: builder.mutation<ShoppingList, { id: string; changes: Partial<ShoppingList> }>({
            query: ({id, changes }) => ({ url: `/shoppingLists/${id}`, method: "PATCH", body: changes }),
            invalidatesTags: ["Lists"],
        }),
        deleteList: builder.mutation<null, string>({
            async queryFn(id, _api, _extra, baseQuery){
                const items = await baseQuery(`/items?listId=${id}`);
                if (items.error) return { error: items.error };
                const itemList = (items.data as { id: string }[]) ?? [];
                // Remove children first and stop if a request fails. These are not a transaction.
                const deletedItems = await Promise.all(itemList.map((item) => baseQuery({ url: `/items/${item.id}`, method: "DELETE" })));
                const failedItem = deletedItems.find((result) => result.error);
                if (failedItem?.error) return { error: failedItem.error };
                const deletedList = await baseQuery({ url: `/shoppingLists/${id}`, method: "DELETE"});
                if (deletedList.error) return { error: deletedList.error };
                return { data: null };
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
