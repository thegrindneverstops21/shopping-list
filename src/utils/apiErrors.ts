// RTK Query rejects .unwrap() with an object, rather than always an Error instance.
export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null) {
        if ("status" in error && error.status === "FETCH_ERROR") {
            return "Cannot reach the API. Check your connection and that the backend is running.";
        }
        if ("data" in error && typeof error.data === "object" && error.data !== null &&
            "message" in error.data && typeof error.data.message === "string") return error.data.message;
        if ("message" in error && typeof error.message === "string") return error.message;
    }
    return fallback;
}
