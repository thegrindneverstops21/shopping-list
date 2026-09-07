import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:3001" : "/api");

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: apiBaseUrl,
    }),
    tagTypes: ["Users", "Lists", "Items"],
    endpoints: () => ({}),
});