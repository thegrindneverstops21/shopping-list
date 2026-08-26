import { useState, type FormEvent } from "react";
import type { ShoppingList } from "../types/list";

const CATEGORIES = ["General", "Groceries", "Clothing", "Electronics", "Household", "Other"];

interface ListFormProps {
    initial?: Pick<ShoppingList, "name" | "category">;
    onSubmit: (data: {name: string; category: string }) => void;
    loading?: boolean;
    submitLabel?: string;
}

export default function ListForm({initial, onSubmit, loading, submitLabel}: ListFormProps) {
    const [name, setName] = useState(initial?.name ?? "");
    const [category, setCategory] = useState(initial?.category ?? "General");
    const [nameError, setNameError] = useState("");

    function handleSubmit(e: FormEvent)

}