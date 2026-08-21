export interface ShoppingItem {
    id: string;
    listId: string;
    name: string;
    quantity: number;
    notes?: string;
    category: string;
    imageUrl?: string;
    createdAt: string;
}

export type NewShoppingItem = Omit<ShoppingItem, "id" | "createdAt">;

export interface ItemQueryParams {
    listId: string;
    q?: string;
    sortBy?: "name" | "category" | "createdAt";
    order?: "asc" | "desc";
}