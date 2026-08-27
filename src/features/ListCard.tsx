import { useState } from "react";
import type { ShoppingList } from "../types/list";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { useGetItemsQuery } from "../api/itemsApi";
import { useDeleteListMutation, useUpdateListMutation } from "../api/listsApi";
import { addToast } from "../ui/uiSlice";

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

  function navigateToList() {
    navigate(`/list/${list.id}`);
  }

  return (
    <>
      <div className="list-card">
        <div
          className="list-card-body"
          onClick={navigateToList}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigateToList()}
          aria-label={`Open ${list.name}`}
        >
          {items.length === 0 ? (
            <p className="list-card-no-items">No items yet</p>
          ) : (
            <ul className="list-card-items">
              {items.slice(0, 6).map((item: { id: string | number; name: string }) => (
                <li key={item.id}>- {item.name}</li>
              ))}
              {items.length > 6 && (
                <li className="list-card-more">+ {items.length - 6} more</li>
              )}
            </ul>
          )}
        </div>

        <div className="list-card__actions">
          <button
            className="list-card__btn"
            onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
            aria-label="Edit list"
          >
            <Pencil size={15} />
          </button>
          <button
            className="list-card__btn list-card__btn--danger"
            onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
            aria-label="Delete list"
          >
            <Trash2 size={15} />
          </button>
          <button
            className="list-card__btn"
            onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}
            aria-label="Share list"
          >
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
        loading={deleting}
      />

      <Modal isOpen={shareOpen} onClose={() => setShareOpen(false)} title="Share list">
        <ShareModal list={list} onClose={() => setShareOpen(false)} />
      </Modal>
    </>
  );
}