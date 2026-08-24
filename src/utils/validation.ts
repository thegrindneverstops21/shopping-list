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
    if(!values.name.trim()) errors.name = "Name is required";
    if(!values.surname.trim()) errors.surname = "Surname is required";
    if(!isValidEmail(values.email)) errors.email = "Please enter a valid email address";
    if(!isValidPhoneNumber(values.phoneNumber)) errors.phoneNumber = "Please enter a valid phone number";
    if(values.password.length < 6 ) errors.password = "Password must be at least 6 characters";
    if(values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match";
    return errors;
};
