import { useEffect } from "react";
import { removeToast, type Toast } from "../ui/uiSlice";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hooks";

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    useEffect(() => {
        // Set timer to dismiss after 4 seconds (4000 milliseconds)
        const timer = setTimeout(onDismiss, 4000);
        
        // Cleanup function: cancel timer if component unmounts early
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        // Toast styles based on type (success, error, info)
        <div className={`toast toast-${toast.type}`} role="alert">
            <span>{toast.message}</span>
            {/* Manual dismiss button */}
            <button className="toast-close" onClick={onDismiss} aria-label="Dismiss" title="Dismiss">
                <X size={14} />
            </button>
        </div>
    );
}

export default function ToastContainer() {
    const toasts = useAppSelector((state) => state.ui.toasts);
    const dispatch = useAppDispatch();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onDismiss={() => dispatch(removeToast(toast.id))}
                />
            ))}
        </div>
    )
}