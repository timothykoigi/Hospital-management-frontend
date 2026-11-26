import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { listRecords } from "../../services/clinicalService";
import { formatDate } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import RecordFormModal from "../../components/RecordFormModal";

export default function DoctorRecords() {
  const { profile } = useAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(undefined); // undefined closed | null new | record
  const dq = useDebounce(q);
  const { data, meta, loading, error, reload } = useApi(() => listRecords({ q: dq, page, per_page: 10 }), [dq, page]);

  const columns = [
    { key: "visit_date", header: "Visit", render: (r) => formatDate(r.visit_date) },
    { key: "patient_name", header: "Patient" },
    { key: "diagnosis", header: "Diagnosis", render: (r) => <strong>{r.diagnosis}</strong> },
    { key: "symptoms", header: "Symptoms", render: (r) => <span className="truncate" title={r.symptoms}>{r.symptoms}</span> },
    { key: "doctor_name", header: "Recorded by" },
    {
      key: "actions", header: "", className: "cell-actions",
      render: (r) => r.doctor_id === profile?.id
        ? <button className="btn btn-secondary btn-sm" onClick={() => setEditing(r)}><Pencil size={14} aria-hidden="true" /> Edit</button>
        : <span className="muted">Read only</span>,
    },
  ];

  return (
    <>
      <PageHeader title="Medical records" subtitle="Create and update records for your patients. Only the author can edit a record." actions={<button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={16} aria-hidden="true" /> New record</button>} />
      <div className="panel panel-flush">
        <div className="toolbar">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search patient, symptoms or diagnosis" />
        </div>
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} caption="Medical records" emptyTitle="No medical records" emptyText={dq ? "No records match your search." : "Create the first record after seeing a patient."} />
        <Pagination meta={meta} onPage={setPage} />
      </div>
      <RecordFormModal open={editing !== undefined} record={editing || undefined} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); reload(); }} />
    </>
  );
}
