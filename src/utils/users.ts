import type { SafeUser, User } from "../types/users";

// Pick public profile fields so passwords never enter the saved session.
export function toSafeUser(user: User): SafeUser {
    return { id: String(user.id), name: user.name, surname: user.surname,
        email: user.email, phoneNumber: user.phoneNumber };
}

// Treat emails as case-insensitive throughout the app.
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}
