import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useAddListMutation, useGetListQuery } from "../api/listsApi";
import { useAddItemMutation } from "../api/itemsApi";
import { addToast } from "../ui/uiSlice";
import Button from "../components/Button";
import ListCard from "../features/ListCard";
import Modal from "../components/Modal";
import ListForm from "../features/ListForm";
import ItemForm from "../features/ItemForm";
import { ListPlus, Loader, PackagePlus } from "lucide-react";

export default function HomePage() {
  const [addOpen, setAddOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState("");
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const { data: lists = [], isLoading } = useGetListQuery(user?.id ?? "", { skip: !user });
  const [addList, { isLoading: adding }] = useAddListMutation();
  const [addItem, { isLoading: addingItem }] = useAddItemMutation();

  const filteredLists = q
    ? lists.filter((l: { name: string }) => l.name.toLowerCase().includes(q))
    : lists;

  async function handleAddList(data: { name: string; category: string }) {
    if (!user) return;
    try {
      await addList({ ...data, userId: user.id }).unwrap();
      dispatch(addToast("List created", "success"));
      setAddOpen(false);
    } catch {
      dispatch(addToast("Failed to create list", "error"));
    }
  }

  function openAddItem() {
    setSelectedListId(String(lists[0]?.id ?? ""));
    setAddItemOpen(true);
  }

  async function handleAddItem(data: { name: string; quantity: number; notes: string; category: string; imageUrl: string }) {
    if (!selectedListId) return;
    try {
      await addItem({ ...data, listId: selectedListId }).unwrap();
      dispatch(addToast("Item added", "success"));
      setAddItemOpen(false);
    } catch {
      dispatch(addToast("Failed to add item", "error"));
    }
  }

  if (isLoading) {
    return (
      <div className="home-page-loader">
        <Loader size={28} className="spin" />
      </div>
    );
  }

  return (
    <div className="home-page">
      {filteredLists.length === 0 ? (
        <div className="home-page-empty">
          <p className="home-page-empty-text">
            {q ? `No lists match "${q}". Try another search.` : "Your next great shop starts here. Create your first list and make it yours."}
          </p>
          <img src="/empty-list-state.png" alt="A shopping list ready to be created" className="home-page-empty-image" />
  
          <div className="home-page-empty-actions">
            {!q && <Button className="home-page-add-button" onClick={() => setAddOpen(true)} title="Add shopping list"><ListPlus size={16} /> add shopping list</Button>}
            {lists.length > 0 && <Button className="home-page-add-button" onClick={openAddItem} title="Add item"><PackagePlus size={16} /> add item</Button>}
          </div>
        </div>
      ) : (
        <>
          <div className="home-page-grid">
            {filteredLists.map((list: (typeof filteredLists)[number]) => (
              <div key={list.id} className="home-page-col">
                <h3 className="home-page-list-title">{list.name}</h3>
                <ListCard list={list} />
              </div>
            ))}
          </div>
          <div className="home-page-add-cta">
            <Button className="home-page-add-button" onClick={() => setAddOpen(true)} title="Add shopping list"><ListPlus size={16} /> add shopping list</Button>
            <Button className="home-page-add-button" onClick={openAddItem} title="Add item"><PackagePlus size={16} /> add item</Button>
          </div>
        </>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="New shopping list">
        <ListForm onSubmit={handleAddList} loading={adding} />
      </Modal>

      <Modal isOpen={addItemOpen} onClose={() => setAddItemOpen(false)} title="Add item">
        <div className="home-page-item-list-picker">
          <label htmlFor="item-list">Add to list</label>
          <select id="item-list" value={selectedListId} onChange={(e) => setSelectedListId(e.target.value)}>
            {lists.map((list) => <option key={list.id} value={String(list.id)}>{list.name}</option>)}
          </select>
        </div>
        <ItemForm onSubmit={handleAddItem} loading={addingItem} />
      </Modal>
    </div>
  );
}