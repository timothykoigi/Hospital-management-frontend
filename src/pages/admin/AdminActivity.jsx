import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { getActivityLog } from "../../services/adminService";
import { formatTimestamp } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";

export default function AdminActivity() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const { data, meta, loading, error, reload } = useApi(() => getActivityLog({ q: dq, page, per_page: 15 }), [dq, page]);

  const columns = [
    { key: "timestamp", header: "When", render: (e) => formatTimestamp(e.timestamp) },
    { key: "actor_name", header: "Administrator" },
    { key: "action", header: "Action", render: (e) => <code>{e.action}</code> },
    { key: "details", header: "Details", render: (e) => e.details || "-" },
  ];

  return (
    <>
      <PageHeader title="Activity log" subtitle="Important administrative actions. Medical details are never recorded here." />
      <div className="panel panel-flush">
        <div className="toolbar">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search by person, action or detail" />
        </div>
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} caption="Activity log" emptyTitle="No activity recorded yet" emptyText="Actions such as registering a doctor will appear here." />
        <Pagination meta={meta} onPage={setPage} />
      </div>
    </>
  );
}
