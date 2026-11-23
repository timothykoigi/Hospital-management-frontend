import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export function Spinner({ label = "Loading" }) {
  return (
    <span className="spinner" role="status">
      <Loader2 size={18} className="spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="state-box" role="status">
      <Loader2 size={26} className="spin" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", text, action }) {
  return (
    <div className="state-box">
      <Inbox size={30} aria-hidden="true" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-box state-error" role="alert">
      <AlertTriangle size={30} aria-hidden="true" />
      <h3>We could not load this</h3>
      <p>{error?.message || "Unexpected error."}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Alert({ type = "error", children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role={type === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
