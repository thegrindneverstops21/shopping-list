import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../utils/useTheme";
import { useDeleteAccountMutation, useUpdateUserMutation } from "../api/authApi";
import { clearSession, setSession } from "../auth/authSlice";
import { isValidEmail, isValidPhoneNumber } from "../utils/validation";
import { addToast } from "../ui/uiSlice";
import { ClipboardList, LogOut, Moon, RefreshCcw, Sun, UserCircle, UserX } from "lucide-react";
import FormField from "../components/FormField";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";

type Section = "personal" | "update";

export default function ProfilePage() {
    const [section, setSection] = useState<Section>("personal");
    const [deleteOpen, setdeleteOpen] = useState(false);

    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
    const [deleteAccount, { isLoading: deletingAccount }] = useDeleteAccountMutation();

    const [form, setForm] = useState({
        name: user?.name ?? "",
        surname: user?.surname ?? "",
        email: user?.email ?? "",
        phoneNumber: user?.phoneNumber ?? "",
    });
    const [formErrors, setFormErrors] = useState<{ name?: string; surname?: string; email?: string; phoneNumber?: string }>({});

    if (!user) return null;
    const userId = user.id;

    function handleLogout() {
        dispatch(clearSession());
        navigate("/login");
    }

    async function handleUpdate() {
        const errors: typeof formErrors = {};
        if (!form.name.trim()) errors.name = "Name is required";
        if (!form.surname.trim()) errors.surname = "Surname is required";
        if (!isValidEmail(form.email)) errors.email = "Please enter a valid email addresss";
        if (!isValidPhoneNumber(form.phoneNumber)) errors.phoneNumber = "Please enter a valid phone number";
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            const updated = await updateUser({ id: userId, changes: form }).unwrap();
            //eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...safeUser } = updated;
            dispatch(setSession(safeUser));
            dispatch(addToast("Account updated", "success"));
        } catch {
            dispatch(addToast("Failed to update account", "error"));
        }
    }

    async function handleDeleteAccount() {
        try {
            await deleteAccount({ userId }).unwrap();
            dispatch(clearSession());
            dispatch(addToast("Account deleted", "success"));
            navigate("/register");
        } catch {
            dispatch(addToast("Failed to delete account", "error"));
        }
    }

    return (
        <div className="profile-page">
            <aside className="profile-sidebar">
                <button className={`profile-sidebar-item ${section === "personal" ? "profile-sidebar-item-active" : ""}`} onClick={() => setSection("personal")}>
                    <UserCircle size={18} /> Personal Info
                </button>
                <button className={`profile-sidebar-item ${section === "update" ? "profile-sidebar-item-active" : ""}`} onClick={() => setSection("update")}>
                    <RefreshCcw size={18} /> Update account
                </button>
                <button className="profile-sidebar-item" onClick={toggleTheme}>
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <button className="profile-sidebar-item profile-sidebar-item-danger" onClick={() => setdeleteOpen(true)}>
                    <UserX size={18} /> Delete account
                </button>
                <button className="profile-sidebar-item" onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            <div className="profile-contact">
                {section === "personal"} ? (
                <div className="profile-panel">
                    <h2>Personal info</h2>
                    <div className="profile-info-row">
                        <span className="profile-info-label">Full names</span>
                        <span>{user.name} {user.surname}</span>
                    </div>
                    <div className="profile-info-row">
                        <span className="profile-info-label">Email</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="profile-info-row">
                        <span className="profile-info-label">Phone number</span>
                        <span>{user.phoneNumber}</span>
                    </div>
                    <button className="profile-my-list-link" onClick={() => navigate("/")}>
                        <ClipboardList size={16} />My lists
                    </button>
                </div>
                ) : (
                <div className="profile-panel">
                    <h2>Update account</h2>
                    <FormField
                        label="Full name"
                        name="name"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        error={formErrors.name}
                        required
                    />

                    <FormField
                        label="Surname"
                        name="surname"
                        value={form.surname}
                        onChange={(e) => setForm((p) => ({ ...p, surname: e.target.value }))}
                        error={formErrors.surname}
                        required
                    />

                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        error={formErrors.email}
                        required
                    />

                    <FormField
                        label="Phone number"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                        error={formErrors.phoneNumber}
                        required
                    />

                    <div className="form-actions">
                        <Button onClick={handleUpdate} disabled={updating}>{updating ? "Saving..." : "Save changes"}</Button>
                    </div>
                </div>
                )
            </div>

            <ConfirmDialog
                isOpen={deleteOpen}
                onClose={() => setdeleteOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Delete account"
                message="This permanently deletes your account, all your shopping lists, and their items. This cannot be undone"
                confirmLabel={deletingAccount ? "Deleting..." : "Delete account"}
                loading={deletingAccount}
            />
        </div>
    )
}