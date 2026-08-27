import { useState, type FormEvent } from "react";
import { useLazyFindUserByEmailQuery } from "../api/authApi";
import { useAppDispatch } from "../app/hooks";
import { useNavigate, Link } from "react-router-dom";
import { isValidEmail } from "../utils/validation";
import { addToast } from "../ui/uiSlice";
import { decryptPassword } from "../utils/encryption";
import { setSession } from "../auth/authSlice";
import FormField from "../components/FormField";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string; }>({});
    const [submission, setSubmission] = useState(false);

    const [findUserByEmail] = useLazyFindUserByEmailQuery();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        const validationErrors: { email?: string; password?: string } = {};
        if (!isValidEmail(email)) validationErrors.email = "Please enter a valid email address";
        if (!password) validationErrors.password = "Password is required";
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmission(true);
        try {
            const matches = await findUserByEmail(email).unwrap();
            if (matches.length === 0) {
                dispatch(addToast("No account found with that email", "error"));
                return;
            }

            const user = matches[0];
            const decrypted = decryptPassword(user.password);
            if (decrypted !== password) {
                dispatch(addToast("Incorrect password", "error"));
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _p, ...safeUser } = user;
            dispatch(setSession(safeUser));
            dispatch(addToast("Welcome back", "success"));
            navigate("/");
        } catch {
            dispatch(addToast("Something went wrong. Please try again", "error"));
        } finally {
            setSubmission(false);
        }
    }
    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={onSubmit} noValidate>
                <h1>Login Page</h1>
                <FormField label="email address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="example@gmail.com" />
                <FormField label="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
                <button type="submit" disabled={submission}>
                    {submission ? "Logging in..." : "login"}
                </button>
                <p className="auth-switch">New here? <Link to="/register">Create account</Link></p>
            </form>
        </div>
    )
}

