

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

  const { data: lists = [] } = useGetListsQuery(user?.id ?? "", { skip: !user });
  const list = lists.find((l) => l.id === id);

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
        <button className="detail-page__back" onClick={() => navigate("/")}><ArrowLeft size={18} /> Back</button>
        <p>List not found.</p>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <button className="detail-page__back" onClick={() => navigate("/")}><ArrowLeft size={18} /> Back</button>

      <div className="detail-page__header">
        <div>
          <h2>{list.name}</h2>
          <span className="detail-page__category-tag">{list.category}</span>
        </div>
        <Button onClick={() => setAddOpen(true)}><PackagePlus size={16} /> Add item</Button>
      </div>

      <div className="detail-page__controls">
        <div className="detail-page__search">
          <Search size={16} />
          <input type="text" value={q} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search items in this list" />
        </div>

        <div className="detail-page__sort">
          <label htmlFor="sort-by">Sort by</label>
          <select id="sort-by" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button className="detail-page__order-btn" onClick={toggleOrder} aria-label="Toggle sort order">
            {order === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="detail-page__loading">Loading items...</p>
      ) : items.length === 0 ? (
        <p className="detail-page__empty">{q ? `No items matching "${q}"` : "No items in this list yet — add your first one."}</p>
      ) : (
        <div className="detail-page__items">
          {items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add item">
        <ItemForm onSubmit={handleAddItem} loading={adding} />
      </Modal>
    </div>
  );
}