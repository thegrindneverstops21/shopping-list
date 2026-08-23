import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

interface UiState { 
    toasts: Toast[];
}

const initialState: UiState = { toasts: [] };

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        addToast: {
            reducer(state, action: PayloadAction<Toast>) {
                state.toasts.push(action.payload);
            },
            prepare(message: string, type: Toast["type"] = "info"){
                return { payload: { id: crypto.randomUUID(), message, type} };
            },
        },
        removeToast(state, action: PayloadAction<string>) {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },
    },
});

export const { addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;