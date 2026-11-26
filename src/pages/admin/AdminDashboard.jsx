import { Link } from "react-router-dom";
import { Building2, CalendarCheck, CalendarClock, Clock, Stethoscope, Users } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { getDashboardStats } from "../../services/adminService";
import { formatDate, formatTime } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import BarList from "../../components/BarList";
import StatusBadge from "../../components/StatusBadge";
import { ErrorState, LoadingState } from "../../components/Feedback";

export default function AdminDashboard() {
  const { data, loading, error, reload } = useApi(getDashboardStats, []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const statusItems = Object.entries(data.appointments_by_status).map(([label, value]) => ({ label: label[0].toUpperCase() + label.slice(1), value }));

  return (
    <>
      <PageHeader title="Administration dashboard" subtitle="A live overview of the hospital." />
      <div className="stat-grid">
        <StatCard icon={Stethoscope} label="Active doctors" value={data.active_doctors} />
        <StatCard icon={Users} label="Active patients" value={data.active_patients} tone="navy" />
        <StatCard icon={Building2} label="Departments" value={data.departments} tone="navy" />
        <StatCard icon={CalendarClock} label="Appointments today" value={data.appointments_today} tone="green" />
        <StatCard icon={Clock} label="Awaiting approval" value={data.pending_appointments} tone="amber" />
        <StatCard icon={CalendarCheck} label="All appointments" value={data.total_appointments} />
      </div>
      <div className="grid-2">
        <section className="panel">
          <h2>Appointments by status</h2>
          <BarList items={statusItems} />
        </section>
        <section className="panel">
          <h2>Latest requests</h2>
          {data.recent_appointments.length === 0 && <p className="muted">No appointments yet.</p>}
          {data.recent_appointments.map((a) => (
            <div className="appt-card" key={a.id}>
              <div className="appt-info">
                <p><strong>{a.patient_name}</strong> with {a.doctor_name}</p>
                <p className="muted">{formatDate(a.appointment_date)} at {formatTime(a.appointment_time)}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
          <p style={{ marginTop: 12 }}><Link to="/admin/appointments">Manage appointments</Link></p>
        </section>
      </div>
    </>
  );
}
