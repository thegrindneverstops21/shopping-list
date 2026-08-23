import { type ShoppingItem, type ItemQueryParams, type NewShoppingItem } from "../types/item";
import { baseApi } from "./baseApi";

function buildItemsQuery({ listId, q, sortBy, order }: ItemQueryParams): string {
    const params = new URLSearchParams({ listId });
    if (q) params.set("name_like", q);
    if (sortBy) params.set("_sort", sortBy);
    if (order) params.set("_order", order);
    return `/items?${params.toString()}`;
}

export const itemsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getItems: builder.query<ShoppingItem[], ItemQueryParams>({
            query: buildItemsQuery,
            providesTags: ["Items"],
        }),
        addItem: builder.mutation<ShoppingItem, NewShoppingItem>({
            query: (body) => ({ url: "/items", method: "POST", body: {...body, createdAt: new Date().toISOString()} }),
            invalidatesTags: ["Items"],
        }),
        updateItem: builder.mutation<ShoppingItem, { id: string; changes: Partial<ShoppingItem> }>({
            query: ({id, changes}) => ({url: `/items/${id}`, method: "PATCH", body: changes}),
            invalidatesTags: ["Items"],
        }),
        deleteItem: builder.mutation<void, string>({
            query: (id) => ({ url: `/items/${id}`, method: "DELETE" }),
            invalidatesTags: ["Items"],
        }),
    }),
})