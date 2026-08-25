import Modal from "./Modal";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel: string;
    loading?: boolean;
}

export default function ConfirmDialog({isOpen, onClose, onConfirm, title, message, confirmLabel = "Delete", loading=false}: ConfirmDialogProps) {
    return(
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="confirm-dialog-message">{message}</p>
            <div className="confirm-dialog-actions">
                <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
                    Cancel 
                </button>
                <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                    {loading ? "Deleting..." : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}