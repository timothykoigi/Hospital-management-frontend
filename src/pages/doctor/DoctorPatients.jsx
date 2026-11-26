import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { listPatients } from "../../services/patientService";
import { formatDate } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import Avatar from "../../components/Avatar";

export default function DoctorPatients() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const { data, meta, loading, error, reload } = useApi(() => listPatients({ q: dq, page, per_page: 10 }), [dq, page]);

  const columns = [
    { key: "name", header: "Patient", render: (p) => (<div className="cell-person"><Avatar name={p.full_name} /><div><strong>{p.full_name}</strong><small>{p.email}</small></div></div>) },
    { key: "dob", header: "Date of birth", render: (p) => formatDate(p.date_of_birth) },
    { key: "blood_group", header: "Blood group", render: (p) => p.blood_group || "-" },
    { key: "phone", header: "Phone", render: (p) => p.phone || "-" },
    { key: "actions", header: "", className: "cell-actions", render: (p) => <Link className="btn btn-secondary btn-sm" to={`/doctor/patients/${p.id}`}>Open record</Link> },
  ];

  return (
    <>
      <PageHeader title="Patient records" subtitle="Patients who have an appointment with you." />
      <div className="panel panel-flush">
        <div className="toolbar">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search by name, email or phone" />
        </div>
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} caption="Your patients" emptyTitle="No patients yet" emptyText="Patients appear here once they book an appointment with you." />
        <Pagination meta={meta} onPage={setPage} />
      </div>
    </>
  );
}
