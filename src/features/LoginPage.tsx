import { useState, type FormEvent } from "react";
import { useLazyFindUserByEmailQuery } from "../api/authApi";
import { useAppDispatch } from "../app/hooks";
import { useNavigate, Link } from "react-router-dom";
import { isValidEmail } from "../utils/validation";
import { addToast } from "../ui/uiSlice";
import { decryptPassword } from "../utils/encryption";
import { setSession } from "../auth/authSlice";
import FormField from "../components/FormField";
import { UserPlus } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; }>({});
    const [formError, setFormError] = useState("");
    const [accountNotFound, setAccountNotFound] = useState<string | null>(null);
    const [submission, setSubmission] = useState(false);

    const [findUserByEmail] = useLazyFindUserByEmailQuery();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError("")
        setAccountNotFound(null);

        if (!isValidEmail(email)) {
            setFieldErrors({ email: "Please enter a valid email address" });
            return;
        }
        setFieldErrors({});

        setSubmission(true);
        try {
            const matches = await findUserByEmail(email).unwrap();
            if (matches.length === 0) {
                setAccountNotFound(email);
                return;
            }

            const user = matches[0];
            const decrypted = decryptPassword(user.password);
            if (decrypted !== password) {
                setFormError("Incorrect email or password.");
                dispatch(addToast("Incorrect email or password", "error"));
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

                {accountNotFound && (
                    <div className="auth-alert">
                        <p>We couldn't find an account for <strong>{accountNotFound}</strong></p>
                        <Link to="/register" state={{ email: accountNotFound }} className="auth-alert-link">
                            <UserPlus size={14} /> Create acccount
                        </Link>
                    </div>
                )}

                {formError && !accountNotFound && <p className="form-error-banner">{formError}</p>}

                <FormField
                    label="email address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setAccountNotFound(null); }}
                    error={fieldErrors.email}
                    placeholder="example@gmail.com"
                />
                <FormField
                    label="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" disabled={submission}>
                    {submission ? "Logging in..." : "login"}
                </button>
                <p className="auth-switch">New here? <Link to="/register">Create account</Link></p>
            </form>
        </div>
    )
}

