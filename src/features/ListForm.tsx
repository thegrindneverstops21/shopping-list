import { useState, type FormEvent } from "react";
import type { ShoppingList } from "../types/list";

const CATEGORIES = ["General", "Groceries", "Clothing", "Electronics", "Household", "Other"];

interface ListFormProps {
    initial?: Pick<ShoppingList, "name" | "category">;
    onSubmit: (data: {name: string; category: string }) => void;
    loading?: boolean;
    submitLabel?: string;
}

export default function ListForm({ initial, onSubmit, loading, submitLabel = "Add list" }: ListFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [nameError, setNameError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setNameError("List name is required"); return; }
    setNameError("");
    onSubmit({ name: name.trim(), category });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        label="List name"
        name="name"
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        error={nameError}
        required
        placeholder='e.g "Grocery list"'
      />
      <div className="form-field">
        <label htmlFor="list-category">Category</label>
        <select
          id="list-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}