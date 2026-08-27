interface ShareModalProps {
  list: ShoppingList;
  onClose: () => void;
}

export default function ShareModal({ list, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [shareList, { isLoading }] = useShareListMutation();
  const dispatch = useAppDispatch();

  async function handleShare() {
    if (!isValidEmail(email)) { setEmailError("Enter a valid email address"); return; }
    if (list.sharedWith.includes(email)) { setEmailError("Already shared with this email"); return; }
    setEmailError("");
    try {
      await shareList({ id: list.id, sharedWith: [...list.sharedWith, email] }).unwrap();
      dispatch(addToast(`List shared with ${email}`, "success"));
      onClose();
    } catch {
      dispatch(addToast("Failed to share list", "error"));
    }
  }

  return (
    <div>
      {list.sharedWith.length > 0 && (
        <div className="share-modal__current">
          <p className="share-modal__label">Currently shared with:</p>
          <ul className="share-modal__list">
            {list.sharedWith.map((e) => (
              <li key={e}>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <FormField
        label="Email address"
        name="email"
        type="email"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        error={emailError}
        placeholder='"example@gmail.com"'
      />
      <div className="form-actions">
        <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="button" onClick={handleShare} disabled={isLoading}>
          {isLoading ? "Sharing..." : "Share"}
        </Button>
      </div>
    </div>
  );
}