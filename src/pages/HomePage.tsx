export default function HomePage() {
  const [addOpen, setAddOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const { data: lists = [], isLoading } = useGetListsQuery(user?.id ?? "", { skip: !user });
  const [addList, { isLoading: adding }] = useAddListMutation();

  const filteredLists = q
    ? lists.filter((l) => l.name.toLowerCase().includes(q))
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
      <div className="home-page__loader">
        <Loader size={28} className="spin" />
      </div>
    );
  }

  return (
    <div className="home-page">
      {filteredLists.length === 0 ? (
        <div className="home-page__empty">
          <p className="home-page__empty-text">
            {q ? `No lists matching "${q}"` : "oops, please add your first list"}
          </p>
          <ClipboardPlus size={88} strokeWidth={1} className="home-page__empty-icon" />
          {!q && (
            <Button onClick={() => setAddOpen(true)}>add shopping list</Button>
          )}
        </div>
      ) : (
        <>
          <div className="home-page__grid">
            {filteredLists.map((list) => (
              <div key={list.id} className="home-page__col">
                <h3 className="home-page__list-title">{list.name}</h3>
                <ListCard list={list} />
              </div>
            ))}
          </div>
          <div className="home-page__add-cta">
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