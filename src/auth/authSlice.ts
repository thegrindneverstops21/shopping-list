import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SafeUser } from "../types/users";

interface AuthState {
    user: SafeUser | null;
    isAuthenticated: boolean;
}

function readStoredUser(): SafeUser | null {
    // Saved browser data can be invalid or left over from an older app version.
    try {
        const saved: unknown = JSON.parse(localStorage.getItem("currentUser") ?? "null");
        if (typeof saved !== "object" || saved === null) return null;
        const fields = ["name", "surname", "email", "phoneNumber"] as const;
        if (!("id" in saved) || (typeof saved.id !== "string" && typeof saved.id !== "number")) return null;
        if (!fields.every((field) => field in saved && typeof saved[field as keyof typeof saved] === "string")) return null;
        const profile = saved as SafeUser;
        return { id: String(profile.id), name: profile.name, surname: profile.surname,
            email: profile.email, phoneNumber: profile.phoneNumber };
    } catch {
        return null;
    }
}

const storedUser = readStoredUser();

const initialState: AuthState = {
    user: storedUser,
    isAuthenticated: !!storedUser,
};

/**
 * Defines the auth state and how it changes
 */
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setSession(state, action: PayloadAction<SafeUser>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            // localStorage: Browser storage that persists across page refreshes
            try { localStorage.setItem("currentUser", JSON.stringify(action.payload)); } catch {
                // Keep the current session usable when browser storage is disabled.
            }
        },
        clearSession(state) {
            state.user = null;
            state.isAuthenticated = false;
            // Remove user data from localStorage
            try { localStorage.removeItem("currentUser"); } catch {
                // Redux still clears the session if browser storage is unavailable.
            }
        },
    },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
