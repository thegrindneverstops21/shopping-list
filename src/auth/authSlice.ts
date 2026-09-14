import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SafeUser } from "../types/users";

interface AuthState {
    user: SafeUser | null;
    isAuthenticated: boolean;
}

const storedUser = localStorage.getItem("currentUser");

const initialState: AuthState = {
    user: storedUser ? (JSON.parse(storedUser) as SafeUser) : null,
    isAuthenticated: !!storedUser,
};

/**
 * authSlice: Defines the auth state and how it changes
 */
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setSession(state, action: PayloadAction<SafeUser>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            // localStorage: Browser storage that persists across page refreshes
            localStorage.setItem("currentUser", JSON.stringify(action.payload));
        },
        clearSession(state) {
            state.user = null;
            state.isAuthenticated = false;
            // Remove user data from localStorage
            localStorage.removeItem("currentUser");
        },
    },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;