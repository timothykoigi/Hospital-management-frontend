import { Link } from "react-router-dom";
import { CalendarCheck, CalendarPlus, FileText, History, Pill, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { getDashboardStats } from "../../services/adminService";
import { formatDate, formatTime } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { ErrorState, LoadingState } from "../../components/Feedback";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi(getDashboardStats, []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title={`Welcome, ${user.full_name.split(" ")[0]}`} subtitle="Your appointments, records and prescriptions." actions={<Link className="btn btn-primary" to="/patient/book"><CalendarPlus size={16} aria-hidden="true" /> Book appointment</Link>} />
      <div className="stat-grid">
        <StatCard icon={CalendarCheck} label="Upcoming appointments" value={data.upcoming_appointments} tone="green" />
        <StatCard icon={History} label="Past appointments" value={data.past_appointments} tone="navy" />
        <StatCard icon={FileText} label="Medical records" value={data.medical_records} />
        <StatCard icon={Pill} label="Prescriptions" value={data.prescriptions} tone="amber" />
      </div>
      <div className="grid-2">
        <section className="panel">
          <h2>Upcoming appointments</h2>
          {data.next_appointments.length === 0 && (
            <p className="muted">You have nothing booked. <Link to="/patient/doctors"><Search size={14} aria-hidden="true" /> Find a doctor</Link> to get started.</p>
          )}
          {data.next_appointments.map((a) => (
            <div className="appt-card" key={a.id}>
              <div className="appt-date"><strong>{a.appointment_date.slice(8)}</strong><span>{formatDate(a.appointment_date).split(" ")[0]}</span></div>
              <div className="appt-info"><p><strong>{a.doctor_name}</strong></p><p className="muted">{formatTime(a.appointment_time)} - {a.speciality}</p></div>
              <StatusBadge status={a.status} />
            </div>
          ))}
          <p style={{ marginTop: 12 }}><Link to="/patient/appointments">All my appointments</Link></p>
        </section>
        <section className="panel">
          <h2>Quick links</h2>
          <div className="btn-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <Link to="/patient/doctors">Browse doctors and specialities</Link>
            <Link to="/patient/records">View my medical records</Link>
            <Link to="/patient/prescriptions">View my prescriptions</Link>
            <Link to="/patient/profile">Update my details</Link>
          </div>
        </section>
      </div>
    </>
  );
}
