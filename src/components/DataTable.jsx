import { EmptyState, ErrorState, LoadingState } from "./Feedback";

// columns: [{ key, header, render?(row), className? }]
// On phones each row turns into a small card (the header text is shown via data-label).
export default function DataTable({ columns, rows, loading, error, onRetry, rowKey = "id", emptyTitle, emptyText, emptyAction, caption }) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (loading && !rows?.length) return <LoadingState />;
  if (!rows?.length) return <EmptyState title={emptyTitle} text={emptyText} action={emptyAction} />;
  return (
    <div className={`table-wrap ${loading ? "is-refreshing" : ""}`}>
      <table className="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.className}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.header} className={c.className}>
                  {c.render ? c.render(row) : row[c.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
