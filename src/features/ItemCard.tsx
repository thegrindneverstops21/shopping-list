import { useState } from "react";
import type { ShoppingItem } from "../types/item";
import { useDeleteItemMutation, useUpdateItemMutation } from "../api/itemsApi";
import { useAppDispatch } from "../app/hooks";
import { addToast } from "../ui/uiSlice";
import { Package, Pencil, Trash2 } from "lucide-react";
import Modal from "../components/Modal";
import ItemForm from "./ItemForm";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ItemCard({ item }: { item: ShoppingItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateItem, { isLoading: updating }] = useUpdateItemMutation();
  const [deleteItem, { isLoading: deleting }] = useDeleteItemMutation();
  const dispatch = useAppDispatch();

  async function handleEdit(data: { name: string; quantity: number; notes: string; category: string; imageUrl: string }) {
    try {
      await updateItem({ id: item.id, changes: data }).unwrap();
      dispatch(addToast("Item updated", "success"));
      setEditOpen(false);
    } catch {
      dispatch(addToast("Failed to update item", "error"));
    }
  }

  async function handleDelete() {
    try {
      await deleteItem(item.id).unwrap();
      dispatch(addToast(`"${item.name}" removed`, "success"));
    } catch {
      dispatch(addToast("Failed to delete item", "error"));
    }
  }

  return (
    <>
      <div className="item-card">
        <div className="item-card-image">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <Package size={24} className="item-card-placeholder" />}
        </div>

        <div className="item-card-info">
          <p className="item-card-name">
            {item.name} {item.quantity > 1 && <span className="item-card-qty">{item.quantity}</span>}
          </p>
          {item.notes && <p className="item-card-notes">{item.notes}</p>}
          <span className="item-card-category">{item.category}</span>
        </div>

        <div className="item-card-actions">
          <button onClick={() => setEditOpen(true)} aria-label="Edit item"><Pencil size={14} /></button>
          <button onClick={() => setDeleteOpen(true)} aria-label="Delete item" className="item-card__btn--danger"><Trash2 size={14} /></button>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit item">
        <ItemForm initial={item} onSubmit={handleEdit} loading={updating} submitLabel="Save changes" />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete item"
        message={`Remove "${item.name}" from this list?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  );
}