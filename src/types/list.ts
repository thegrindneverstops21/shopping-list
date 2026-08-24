export interface ShoppingList {
    id: string;
    userId: string;
    name: string;
    category: string;
    createdAt: string;
    sharedWith: string[];
}

export type NewShoppingList = Pick<ShoppingList, "name" | "category">;
