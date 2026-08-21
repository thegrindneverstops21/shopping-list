export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    surname: string;
    phoneNumber: string;
}

export type SafeUser = Omit<User, "password">;

export interface RegisterPayload {
    email: string;
    password: string;
    name: string;
    surname: string;
    phoneNumber: string;
}