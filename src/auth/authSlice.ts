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

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setSession(state, action: PayloadAction<SafeUser>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem("currentUser", JSON.stringify(action.payload));
        },
        clearSession(state) {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem("currentUser");
        },
    },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;