import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { listRecords } from "../../services/clinicalService";
import { formatDate } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { EmptyState, ErrorState, LoadingState } from "../../components/Feedback";

export default function PatientRecords() {
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useApi(() => listRecords({ page, per_page: 8 }), [page]);

  return (
    <>
      <PageHeader title="Medical records" subtitle="Notes from your visits, written by your doctors." />
      {error ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <LoadingState /> : !data?.length ? (
        <EmptyState title="No medical records yet" text="Records appear here after a doctor documents a visit." />
      ) : (
        <div className="record-list">
          {data.map((r) => (
            <article className="record-card" key={r.id}>
              <header>
                <div><h3>{r.diagnosis}</h3><span className="muted">{formatDate(r.visit_date)} with {r.doctor_name}</span></div>
              </header>
              <dl>
                <div><dt>Symptoms</dt><dd>{r.symptoms}</dd></div>
                {r.treatment_notes && <div><dt>Treatment notes</dt><dd>{r.treatment_notes}</dd></div>}
              </dl>
            </article>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPage={setPage} />
    </>
  );
}
