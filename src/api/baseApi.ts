import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: "https://;ocalhost:3001" }),
    tagTypes: ["Users", "Lists", "Items"],
    endpoints: () => ({}),
});