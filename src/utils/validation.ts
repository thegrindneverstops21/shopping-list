export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^\d{9,10}$/.test(phone.replace(/[\s()-]/g, ""));
}

export interface RegisterFormErrors {
  name?: string;
  surname?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateRegisterForm(values: {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}): RegisterFormErrors {
    const errors: RegisterFormErrors = {};
    // Check name field
    if(!values.name.trim()) errors.name = "Name is required";
    // Check surname field
    if(!values.surname.trim()) errors.surname = "Surname is required";
    // Check email format using isValidEmail function
    if(!isValidEmail(values.email)) errors.email = "Please enter a valid email address";
    // Check phone number format using isValidPhoneNumber function
    if(!isValidPhoneNumber(values.phoneNumber)) errors.phoneNumber = "Please enter a valid phone number";
    // Check password length (minimum 6 characters for security)
    if(values.password.length < 6 ) errors.password = "Password must be at least 6 characters";
    // Check that passwords match (confirm password === password)
    if(values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match";
    return errors;
};
