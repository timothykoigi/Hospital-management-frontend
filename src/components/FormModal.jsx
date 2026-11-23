import Modal from "./Modal";
import { Alert, Spinner } from "./Feedback";

// Wraps a <form> in a modal with Save/Cancel buttons and a general error banner.
export default function FormModal({ open, title, onClose, onSubmit, busy, error, submitLabel = "Save", size = "md", children }) {
  const formId = "modal-form";
  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => {} : onClose}
      size={size}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={busy}>
            {busy && <Spinner />} {submitLabel}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="form-grid">
        <Alert>{error}</Alert>
        {children}
      </form>
    </Modal>
  );
}
