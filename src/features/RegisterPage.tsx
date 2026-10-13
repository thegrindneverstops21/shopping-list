import { useState, type ChangeEvent, type FormEvent } from "react";
import { validateRegisterForm, type RegisterFormErrors } from "../utils/validation";
import { useLazyFindUserByEmailQuery, useRegisterUserMutation } from "../api/authApi";
import { useAppDispatch } from "../app/hooks";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addToast } from "../ui/uiSlice";
import { setSession } from "../auth/authSlice";
import FormField from "../components/FormField";
import { ArrowRight, Check, ShoppingBasket } from "lucide-react";
import { normalizeEmail, toSafeUser } from "../utils/users";
import { getApiErrorMessage } from "../utils/apiErrors";

interface RegisterFormValues {
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}



export default function RegisterPage() {
    const location = useLocation();
    const prefillEmail = (location.state as { email?: string } | null)?.email ?? "";
    const [values, setValues] = useState<RegisterFormValues>({
        name: "",
        surname: "",
        email: prefillEmail,
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState<RegisterFormErrors>({});
    const [submission, setSubmission] = useState(false);
    const [formError, setFormError] = useState("");

    const [findUserByEmail] = useLazyFindUserByEmailQuery();
    const [registerUser] = useRegisterUserMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (submission) return;
        setFormError("");
        // Trim contact details, but preserve passwords exactly as typed.
        const payload = {
            name: values.name.trim(), surname: values.surname.trim(),
            email: normalizeEmail(values.email), phoneNumber: values.phoneNumber.trim(),
            password: values.password,
        };
        const validationErrors = validateRegisterForm({ ...payload, confirmPassword: values.confirmPassword });
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmission(true);
        try {
            const existing = await findUserByEmail(payload.email).unwrap();
            if (existing.length > 0) {
                setErrors({ email: "This email is already registered" });
                dispatch(addToast("Email already registered", "error"));
                return;
            }
            // .unwrap() returns the new user or throws an error for catch to handle.
            const user = await registerUser(payload).unwrap();
            dispatch(setSession(toSafeUser(user)));
            dispatch(addToast("Account created successfully, welcome!", "success"));
            navigate("/");
        } catch (error) {
            const message = getApiErrorMessage(error, "Registration failed. Please try again.");
            setFormError(message);
            dispatch(addToast(message, "error"));
        } finally {
            setSubmission(false);
        }
    }
    return (
        <div className="auth-page">
            <section className="auth-brand" aria-label="Shopper introduction">
                <div className="auth-brand-mark"><ShoppingBasket size={25} /></div>
                <p className="auth-eyebrow">a better way to shop</p>
                <h1>Make room for what matters.</h1>
                <p className="auth-brand-copy">Build a simple rhythm for the lists, errands, and little wins in between.</p>
                <ul className="auth-benefits">
                    <li><Check size={16} /> Create lists that fit your life</li>
                    <li><Check size={16} /> Share the load with your people</li>
                </ul>
            </section>
            <form className="auth-card" onSubmit={onSubmit} noValidate>
                {formError && <p className="form-error-banner" role="alert">{formError}</p>}
                <div className="auth-card-heading">
                    <p className="auth-eyebrow">start with a clean slate</p>
                    <h2>Create your account</h2>
                    <p>Set up your Shopper space in a couple of minutes.</p>
                </div>
                <FormField label="name" name="name" value={values.name} onChange={onChange} error={errors?.name} required placeholder="Sam" />
                <FormField label="surname" name="surname" value={values.surname} onChange={onChange} error={errors?.surname} required placeholder="Junior" />
                <FormField label="email address" name="email" type="email" value={values.email} onChange={onChange} error={errors?.email} required placeholder="example@gmail.com" />
                <FormField label="phone number" name="phoneNumber" value={values.phoneNumber} onChange={onChange} error={errors?.phoneNumber} required placeholder="071 234 5678" />
                <FormField label="password" name="password" type="password" value={values.password} onChange={onChange} error={errors?.password} required />
                <FormField label="confirm password" name="confirmPassword" type="password" value={values.confirmPassword} onChange={onChange} error={errors?.confirmPassword} required />
                <button type="submit" disabled={submission}>
                    {submission ? "Signing up..." : <>Create account <ArrowRight size={17} /></>}
                </button>
                <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    )
}
