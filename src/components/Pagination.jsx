import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ meta, onPage }) {
  if (!meta || meta.total_pages <= 1) {
    return meta && meta.total > 0 ? <p className="muted pagination-note">{meta.total} result{meta.total === 1 ? "" : "s"}</p> : null;
  }
  const from = (meta.page - 1) * meta.per_page + 1;
  const to = Math.min(meta.page * meta.per_page, meta.total);
  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="muted">
        {from}-{to} of {meta.total}
      </span>
      <div className="pagination-buttons">
        <button className="btn btn-secondary btn-sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
          <ChevronLeft size={16} aria-hidden="true" /> Previous
        </button>
        <span aria-current="page">
          Page {meta.page} of {meta.total_pages}
        </span>
        <button className="btn btn-secondary btn-sm" disabled={meta.page >= meta.total_pages} onClick={() => onPage(meta.page + 1)}>
          Next <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
