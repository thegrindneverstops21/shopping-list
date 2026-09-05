import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const UNSPLASH_ACCESS_KEY = import.meta.env
  .VITE_UNSPLASH_ACCESS_KEY as string;

export interface UnsplashPhoto {
  id: string;
  alt_description: string | null;
  urls: { thumb: string; small: string; regular: string };
  user: { name: string; links: { html: string } };
  links: {download_location: string};
}

interface UnsplashSearchResponse {
    results: UnsplashPhoto[];
}

export const unsplashApi = createApi({
    reducerPath: "unsplashApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://api.unsplash.com",
        prepareHeaders: (headers) => {
            headers.set("Authorization", `Client-ID ${UNSPLASH_ACCESS_KEY}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        searchPhotos: builder.query<UnsplashPhoto[], string>({
            query: (searchQuery) => `/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=9`,
            transformResponse: (response: UnsplashSearchResponse) => response.results,
        }),
    }),
});

export const {useLazySearchPhotosQuery} = unsplashApi;
