import Modal from "./Modal";
import { Spinner } from "./Feedback";

// Used for every destructive or irreversible action. `children` can hold extra inputs (e.g. a reason).
export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger = false, busy = false, onConfirm, onCancel, children }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => {} : onCancel}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Keep as is
          </button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} disabled={busy}>
            {busy && <Spinner />} {confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
      {children}
    </Modal>
  );
}
