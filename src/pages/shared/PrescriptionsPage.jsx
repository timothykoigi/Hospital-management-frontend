import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { listPrescriptions } from "../../services/clinicalService";
import { formatTimestamp } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import PrescriptionFormModal from "../../components/PrescriptionFormModal";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const isDoctor = user.role === "doctor";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const dq = useDebounce(q);
  const { data, meta, loading, error, reload } = useApi(() => listPrescriptions({ q: dq, page, per_page: 10 }), [dq, page]);

  const columns = [
    { key: "created_at", header: "Issued", render: (r) => formatTimestamp(r.created_at) },
    ...(isDoctor ? [{ key: "patient_name", header: "Patient" }] : [{ key: "doctor_name", header: "Doctor" }]),
    { key: "medication_name", header: "Medication", render: (r) => <strong>{r.medication_name}</strong> },
    { key: "dosage", header: "Dosage" },
    { key: "frequency", header: "Frequency" },
    { key: "duration", header: "Duration" },
    { key: "instructions", header: "Instructions", render: (r) => r.instructions || "-" },
  ];

  return (
    <>
      <PageHeader
        title="Prescriptions"
        subtitle={isDoctor ? "Prescriptions you have issued and those of your patients." : "Medication prescribed to you."}
        actions={isDoctor && <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} aria-hidden="true" /> New prescription</button>}
      />
      <div className="panel panel-flush">
        <div className="toolbar">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search medication or patient" />
        </div>
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} caption="Prescriptions" emptyTitle="No prescriptions" emptyText={dq ? "No prescriptions match your search." : "Nothing has been prescribed yet."} />
        <Pagination meta={meta} onPage={setPage} />
      </div>
      {isDoctor && <PrescriptionFormModal open={creating} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); reload(); }} />}
    </>
  );
}
