import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useAddListMutation, useGetListQuery } from "../api/listsApi";
import { addToast } from "../ui/uiSlice";
import Button from "../components/Button";
import ListCard from "../features/ListCard";
import Modal from "../components/Modal";
import ListForm from "../features/ListForm";
import { Loader } from "lucide-react";

export default function HomePage() {
  const [addOpen, setAddOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const { data: lists = [], isLoading } = useGetListQuery(user?.id ?? "", { skip: !user });
  const [addList, { isLoading: adding }] = useAddListMutation();

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
            {q ? `No lists matching "${q}"` : "oops, please add your first list"}
          </p>
          <img src="/empty-list-state.png" alt="No shopping lists yet" className="home-page-empty-image" />
  
          {!q && (
            <Button onClick={() => setAddOpen(true)}>add shopping list</Button>
          )}
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
            <Button onClick={() => setAddOpen(true)}>add shopping list</Button>
          </div>
        </>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="New shopping list">
        <ListForm onSubmit={handleAddList} loading={adding} />
      </Modal>
    </div>
  );
}