import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { listSpecialities } from "../../services/adminService";
import { listDoctors } from "../../services/doctorService";
import { formatDays, formatMoney } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import Avatar from "../../components/Avatar";
import { EmptyState, ErrorState, LoadingState } from "../../components/Feedback";

export default function FindDoctor() {
  const [q, setQ] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const specs = useApi(listSpecialities, []);
  const { data, meta, loading, error, reload } = useApi(() => listDoctors({ q: dq, speciality, page, per_page: 9 }), [dq, speciality, page]);

  return (
    <>
      <PageHeader title="Find a doctor" subtitle="Search by name or speciality, then book a visit." />
      <div className="panel panel-flush" style={{ marginBottom: 20 }}>
        <div className="toolbar" style={{ borderBottom: 0 }}>
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Doctor name or speciality" label="Search doctors" />
          <select aria-label="Filter by speciality" value={speciality} onChange={(e) => { setSpeciality(e.target.value); setPage(1); }}>
            <option value="">All specialities</option>
            {(specs.data || []).map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>
      </div>
      {error ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <LoadingState /> : !data?.length ? (
        <EmptyState title="No doctors found" text="Try a different name or speciality." />
      ) : (
        <div className="doctor-grid">
          {data.map((d) => (
            <article className="doctor-card" key={d.id}>
              <header>
                <Avatar name={d.full_name} size={48} />
                <div><h3>{d.full_name}</h3><p className="muted">{d.speciality}</p></div>
              </header>
              <div className="doctor-meta">
                <span>{d.department_name}</span>
                <span>{d.years_experience} years of experience</span>
                <span>Available {formatDays(d.available_days)}</span>
                <span>Consultation {formatMoney(d.consultation_fee)}</span>
              </div>
              <div className="btn-row">
                <Link className="btn btn-secondary btn-sm" to={`/patient/doctors/${d.id}`}>View profile</Link>
                <Link className="btn btn-primary btn-sm" to={`/patient/book?doctor=${d.id}`}>Book</Link>
              </div>
            </article>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPage={setPage} />
    </>
  );
}
