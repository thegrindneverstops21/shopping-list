import type { ChangeEvent } from "react";

interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
}

export default function FormField({ label, name, type = "text", value, onChange, error, required, placeholder }: FormFieldProps) {
    return (
        <div className="form-field">
            <label htmlFor={name}>
                {label}
                {required && <span className="required-mark">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={error ? "input-error" : ""}
            />
            {error && <span className="field-error">{error}</span>}
        </div>
    )
}