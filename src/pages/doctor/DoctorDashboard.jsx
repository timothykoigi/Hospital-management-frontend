import { Link } from "react-router-dom";
import { CalendarCheck, CalendarClock, CheckCheck, Clock, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { getDashboardStats } from "../../services/adminService";
import { formatDate, formatTime } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { ErrorState, LoadingState } from "../../components/Feedback";

export default function DoctorDashboard() {
  const { user, profile } = useAuth();
  const { data, loading, error, reload } = useApi(getDashboardStats, []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title={`Good day, ${user.full_name}`} subtitle={profile ? `${profile.speciality} - ${profile.department_name}` : undefined} />
      <div className="stat-grid">
        <StatCard icon={CalendarClock} label="Appointments today" value={data.appointments_today} tone="green" />
        <StatCard icon={CalendarCheck} label="Upcoming" value={data.upcoming_appointments} />
        <StatCard icon={Clock} label="Waiting for your approval" value={data.pending_requests} tone="amber" />
        <StatCard icon={CheckCheck} label="Completed visits" value={data.completed_appointments} tone="navy" />
        <StatCard icon={Users} label="Patients" value={data.total_patients} tone="navy" />
      </div>
      <section className="panel">
        <h2>Next appointments</h2>
        {data.next_appointments.length === 0 && <p className="muted">You have no upcoming appointments.</p>}
        {data.next_appointments.map((a) => (
          <div className="appt-card" key={a.id}>
            <div className="appt-date"><strong>{a.appointment_date.slice(8)}</strong><span>{formatDate(a.appointment_date).split(" ")[0]}</span></div>
            <div className="appt-info">
              <p><strong>{a.patient_name}</strong> at {formatTime(a.appointment_time)}</p>
              <p className="muted">{a.reason}</p>
            </div>
            <StatusBadge status={a.status} />
          </div>
        ))}
        <p style={{ marginTop: 12 }}><Link to="/doctor/appointments">See all appointments</Link></p>
      </section>
    </>
  );
}
