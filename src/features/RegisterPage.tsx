import { useState, type ChangeEvent, type FormEvent } from "react";
import { validateRegisterForm, type RegisterFormErrors } from "../utils/validation";
import { useLazyFindUserByEmailQuery, useRegisterUserMutation } from "../api/authApi";
import { useAppDispatch } from "../app/hooks";
import { Link, useNavigate } from "react-router-dom";
import { addToast } from "../ui/uiSlice";
import { setSession } from "../auth/authSlice";
import FormField from "../components/FormField";

interface RegisterFormValues {
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

const initialValues: RegisterFormValues = {
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
};

export default function RegisterPage() {
    const [values, setValues] = useState<RegisterFormValues>(initialValues);
    const [errors, setErrors] = useState<RegisterFormErrors>({});
    const [submission, setSubmission] = useState(false);

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
        const validationErrors = validateRegisterForm(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmission(true);
        try {
            const existing = await findUserByEmail(values.email).unwrap();
            if (existing.length > 0) {
                setErrors({ email: "This email is already registered" });
                dispatch(addToast("Email already registered", "error"));
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...payload } = values;
            const user = await registerUser(payload).unwrap();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars 
            const { password, ...safeUser } = user;

            dispatch(setSession(safeUser));
            dispatch(addToast("Account created successfully, welcome!", "success"));
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
                <h1>Registration Page</h1>
                <FormField label="name" name="name" value={values.name} onChange={onChange} error={errors?.name} required placeholder="Sam" />
                <FormField label="surname" name="surname" value={values.surname} onChange={onChange} error={errors?.surname} required placeholder="Junior" />
                <FormField label="email address" name="email" type="email" value={values.email} onChange={onChange} error={errors?.email} required placeholder="example@gmail.com" />
                <FormField label="phone number" name="phoneNumber" value={values.phoneNumber} onChange={onChange} error={errors?.phoneNumber} required placeholder="071 234 5678" />
                <FormField label="password" name="password" type="password" value={values.password} onChange={onChange} error={errors?.password} required />
                <FormField label="confirm password" name="confirmPassword" type="password" value={values.confirmPassword} onChange={onChange} error={errors?.confirmPassword} required />
                <button type="submit" disabled={submission}>
                    {submission ? "Signing up..." : "sign up"}
                </button>
                <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    )
}