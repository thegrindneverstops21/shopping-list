import { useState, type ComponentProps } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useGetListQuery } from "../api/listsApi";
import { useGetItemsQuery } from "../api/itemsApi";
import { addToast } from "../ui/uiSlice";
import { useAddItemMutation } from "../api/itemsApi";
import { ArrowDown, ArrowLeft, ArrowUp, PackagePlus, Search } from "lucide-react";
import Button from "../components/Button";
import ItemCard from "../features/ItemCard";
import Modal from "../components/Modal";
import ItemForm from "../features/ItemForm";
import EmptyState from "../components/EmptyState";


const SORT_OPTIONS: { value: "name" | "category" | "createdAt"; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "createdAt", label: "Date added" },
];

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const { data: lists = [] } = useGetListQuery(user?.id ?? "", { skip: !user });
  const list = lists.find((list: (typeof lists)[number]) => String(list.id) === id);

  const q = searchParams.get("q") ?? "";
  const sortBy = (searchParams.get("sort") as "name" | "category" | "createdAt") ?? "name";
  const order = (searchParams.get("order") as "asc" | "desc") ?? "asc";

  const { data: items = [], isLoading } = useGetItemsQuery(
    { listId: id ?? "", q: q || undefined, sortBy, order },
    { skip: !id }
  );
  const [addItem, { isLoading: adding }] = useAddItemMutation();

  function onSearchChange(value: string) {
    setSearchParams((prev) => {
      if (value) prev.set("q", value); else prev.delete("q");
      return prev;
    });
  }

  function onSortChange(field: string) {
    setSearchParams((prev) => { prev.set("sort", field); return prev; });
  }

  function toggleOrder() {
    setSearchParams((prev) => { prev.set("order", order === "asc" ? "desc" : "asc"); return prev; });
  }

  async function handleAddItem(data: { name: string; quantity: number; notes: string; category: string; imageUrl: string }) {
    if (!id) return;
    try {
      await addItem({ ...data, listId: id }).unwrap();
      dispatch(addToast("Item added", "success"));
      setAddOpen(false);
    } catch {
      dispatch(addToast("Failed to add item", "error"));
    }
  }

  if (!list) {
    return (
      <div className="detail-page">
        <button className="detail-page-back" onClick={() => navigate("/")} title="Back to my lists"><ArrowLeft size={18} /> Back</button>
        <p>List not found.</p>
      </div>
    );
  }

  return (
    <div className="detail-page-shell">
      <div className="detail-page">
        <div className="detail-page-header">
          <div className="detail-page-heading">
            <button className="detail-page-back" onClick={() => navigate("/")} aria-label="Back to my lists" title="Back to my lists"><ArrowLeft size={20} /></button>
            <div>
            <h2>{list.name}</h2>
            <span className="detail-page-category-tag">{list.category}</span>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)}><PackagePlus size={16} /> Add item</Button>
        </div>
        
      <div className="detail-page-controls">
        <label className="detail-page-search" htmlFor="item-search">
          <Search size={16} />
          <input
            id="item-search"
            type="search"
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search in ${list.name}`}
          />
        </label>
        <div className="detail-page-sort">
          <label htmlFor="sort-by">Sort by</label>
          <select id="sort-by" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button className="detail-page-order-btn" onClick={toggleOrder} aria-label="Toggle sort order" title={`Sort ${order === "asc" ? "descending" : "ascending"}`}>
            {order === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="detail-page-loading">Loading items...</p>
      ) : items.length === 0 ? (
        <EmptyState
          className="detail-page-empty"
          title={q ? `No items match "${q}".` : "This list is ready for its first item."}
          description={q ? "Try another search or clear the search field." : "Add something you need for your next shop."}
        />
      ) : (
        <div className="detail-page-items">
          {items.map((item: ComponentProps<typeof ItemCard>["item"]) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add item">
        <ItemForm onSubmit={handleAddItem} loading={adding} />
      </Modal>
    </div>
    </div>
  );
}