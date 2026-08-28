import { useState } from "react";
import type { ShoppingList } from "../types/list";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { useGetItemsQuery, useUpdateItemMutation } from "../api/itemsApi";
import { useDeleteListMutation, useUpdateListMutation } from "../api/listsApi";
import { addToast } from "../ui/uiSlice";
import { Pencil, Share2, Trash2, NotepadText, Ellipsis } from "lucide-react";
import Modal from "../components/Modal";
import ListForm from "./ListForm";
import ConfirmDialog from "../components/ConfirmDialog";
import ShareModal from "./ShareModal";

interface ListCardProps {
  list: ShoppingList;
}

export default function ListCard({ list }: ListCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: items = [] } = useGetItemsQuery({ listId: list.id });
  const [updateList, { isLoading: updating }] = useUpdateListMutation();
  const [deleteList, { isLoading: deleting }] = useDeleteListMutation();
  const [updateItem] = useUpdateItemMutation();

  async function handleEdit(data: { name: string; category: string }) {
    try {
      await updateList({ id: list.id, changes: data }).unwrap();
      dispatch(addToast("List updated", "success"));
      setEditOpen(false);
    } catch {
      dispatch(addToast("Failed to update list", "error"));
    }
  }

  async function handleDelete() {
    try {
      await deleteList(list.id).unwrap();
      dispatch(addToast(`"${list.name}" deleted`, "success"));
    } catch {
      dispatch(addToast("Failed to delete list", "error"));
    }
  }

  async function toggleItem(itemId: string, checked: boolean) {
    try {
      await updateItem({ id: itemId, changes: { checked: !checked } }).unwrap();
    } catch {
      dispatch(addToast("Failed to update item", "error"));
    }
  }

  function navigateToList() {
    navigate(`/list/${list.id}`);
  }

  return (
    <>
      <div className="list-card">
        <div className="list-card-body">
          {items.length === 0 ? (
            <p className="list-card-no-items">No items yet</p>
          ) : (
            <ul className="list-card-items">
              {items.slice(0, 6).map((item) => (
                <li key={item.id} className="list-card-item">
                  <label className="list-card-item-label">
                    <input
                      type="checkbox"
                      className="list-card-item-check"
                      checked={item.checked ?? false}
                      onChange={() => toggleItem(item.id, item.checked ?? false)}
                      aria-label={`Mark ${item.name} as ${item.checked ? "incomplete" : "complete"}`}
                      title={`Mark ${item.name} as ${item.checked ? "incomplete" : "complete"}`}
                    />
                    <span className={item.checked ? "list-card-item-name-checked" : ""}>
                      {item.name}
                    </span>
                  </label>
                </li>
              ))}
              {items.length > 6 && (
                <li className="list-card-more" onClick={navigateToList} role="button" tabIndex={0} title="Open list">
                  <Ellipsis size={8}/> {items.length - 6} more
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="list-card-actions">
          <button className="list-card-btn" onClick={navigateToList} aria-label="Open list" title="Open list">
            <NotepadText size={15} />
          </button>
          <button className="list-card-btn" onClick={() => setEditOpen(true)} aria-label="Edit list" title="Edit list">
            <Pencil size={15} />
          </button>
          <button className="list-card-btn list-card-btn-danger" onClick={() => setDeleteOpen(true)} aria-label="Delete list" title="Delete list">
            <Trash2 size={15} />
          </button>
          <button className="list-card-btn" onClick={() => setShareOpen(true)} aria-label="Share list" title="Share list">
            <Share2 size={15} />
          </button>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit list">
        <ListForm
          initial={{ name: list.name, category: list.category }}
          onSubmit={handleEdit}
          loading={updating}
          submitLabel="Save changes"
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete list"
        message={`Are you sure you want to delete "${list.name}" and all its items? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />

      <Modal isOpen={shareOpen} onClose={() => setShareOpen(false)} title="Share list">
        <ShareModal list={list} onClose={() => setShareOpen(false)} />
      </Modal>
    </>
  );
}