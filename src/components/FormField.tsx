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
            {/* Label for accessibility */}
            <label htmlFor={name}>
                {label}
                {/* Show asterisk for required fields */}
                {required && <span className="required-mark">*</span>}
            </label>
            
            {/* Input element */}
            <input
                id={name}
                name={name}
                required={required}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
                // Default to "text" if not specified (can override with "email", "password", etc)
                type={type}
                // Controlled component: value comes from parent state
                value={value}
                // Every keystroke calls parent's onChange handler
                onChange={onChange}
                placeholder={placeholder}
                // Add error styling if there's an error
                className={error ? "input-error" : ""}
            />
            
            {/* Display error message if present */}
            {error && <span id={`${name}-error`} className="field-error">{error}</span>}
        </div>
    )
}
