import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { getDoctor } from "../../services/doctorService";
import { formatDays, formatMoney, formatTime } from "../../utils/format";
import Avatar from "../../components/Avatar";
import { ErrorState, LoadingState } from "../../components/Feedback";

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const { data: d, loading, error, reload } = useApi(() => getDoctor(doctorId), [doctorId]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <>
      <p><Link to="/patient/doctors"><ArrowLeft size={14} aria-hidden="true" /> Back to doctors</Link></p>
      <section className="panel">
        <div className="cell-person" style={{ marginBottom: 18 }}>
          <Avatar name={d.full_name} size={64} />
          <div><h1 style={{ margin: 0 }}>{d.full_name}</h1><span className="muted">{d.speciality} - {d.department_name}</span></div>
        </div>
        <p style={{ maxWidth: "70ch" }}>{d.bio || "This doctor has not added a biography yet."}</p>
        <dl className="detail-list" style={{ margin: "18px 0" }}>
          <div><dt>Experience</dt><dd>{d.years_experience} years</dd></div>
          <div><dt>Working days</dt><dd>{formatDays(d.available_days)}</dd></div>
          <div><dt>Working hours</dt><dd>{formatTime(d.work_start)} - {formatTime(d.work_end)}</dd></div>
          <div><dt>Consultation fee</dt><dd>{formatMoney(d.consultation_fee)}</dd></div>
        </dl>
        <Link className="btn btn-primary" to={`/patient/book?doctor=${d.id}`}><CalendarPlus size={16} aria-hidden="true" /> Book an appointment</Link>
      </section>
    </>
  );
}
