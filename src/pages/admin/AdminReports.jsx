import { useApi } from "../../hooks/useApi";
import { getReports } from "../../services/adminService";
import { formatMonth } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import BarList from "../../components/BarList";
import { ErrorState, LoadingState } from "../../components/Feedback";

export default function AdminReports() {
  const { data, loading, error, reload } = useApi(getReports, []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Reports" subtitle="Appointment and staffing figures." />
      <div className="grid-2">
        <section className="panel">
          <h2>Appointments by status</h2>
          <BarList items={Object.entries(data.appointments_by_status).map(([label, value]) => ({ label: label[0].toUpperCase() + label.slice(1), value }))} />
        </section>
        <section className="panel">
          <h2>Appointments by department</h2>
          <BarList tone="navy" items={data.appointments_by_department.map((d) => ({ label: d.department_name, value: d.appointments }))} empty="No appointments yet." />
        </section>
        <section className="panel">
          <h2>Most completed visits</h2>
          <BarList tone="amber" items={data.top_doctors.map((d) => ({ label: d.doctor_name, value: d.completed }))} empty="No completed visits yet." />
        </section>
        <section className="panel">
          <h2>Active doctors per department</h2>
          <BarList items={data.doctors_per_department.map((d) => ({ label: d.department_name, value: d.doctors }))} />
        </section>
      </div>
      <section className="panel panel-flush" style={{ marginTop: 20 }}>
        <div className="panel-head"><h2>Last six months</h2></div>
        <div className="table-wrap">
          <table className="table month-table">
            <caption className="sr-only">Monthly activity</caption>
            <thead><tr><th scope="col">Month</th><th scope="col">Appointments</th><th scope="col">Completed</th><th scope="col">Cancelled</th><th scope="col">New patients</th></tr></thead>
            <tbody>
              {data.monthly_activity.map((m) => (
                <tr key={m.month}>
                  <td data-label="Month">{formatMonth(m.month)}</td>
                  <td data-label="Appointments">{m.appointments}</td>
                  <td data-label="Completed">{m.completed}</td>
                  <td data-label="Cancelled">{m.cancelled}</td>
                  <td data-label="New patients">{m.new_patients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
