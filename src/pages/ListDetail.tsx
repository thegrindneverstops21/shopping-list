
export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data: lists = [] } = useGetListsQuery(user?.id ?? "", { skip: !user });
  const list = lists.find((l) => l.id === id);

  return (
    <div className="detail-page">
      <button className="detail-page__back" onClick={() => navigate("/")}>
        <ArrowLeft size={18} /> Back
      </button>
      <h2>{list?.name ?? "List"}</h2>
      <p style={{ color: "var(--color-text-muted)" }}>
        Items coming in Phase 8.
      </p>
    </div>
  );
}