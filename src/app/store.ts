import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import authReducer from '../auth/authSlice';
import uiReducer from '../ui/uiSlice';
import { unsplashApi } from "../api/unsplashApi";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        [baseApi.reducerPath]: baseApi.reducer,
        [unsplashApi.reducerPath]: unsplashApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware, unsplashApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;