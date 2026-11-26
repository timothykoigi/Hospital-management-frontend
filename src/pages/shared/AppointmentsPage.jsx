import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCheck, CalendarPlus, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { cancelAppointment, listAppointments, updateAppointmentStatus } from "../../services/appointmentService";
import { listDoctors } from "../../services/doctorService";
import { listPatients } from "../../services/patientService";
import { formatDate, formatTime } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import Modal from "../../components/Modal";
import BookingForm from "../../components/BookingForm";
import Field from "../../components/FormField";
import { Alert, LoadingState, Spinner } from "../../components/Feedback";

const STATUS_OPTIONS = ["pending", "approved", "completed", "cancelled"].map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }));

// Administrator "book for a patient" dialog. Loads its own lists when opened.
function AdminBookingModal({ onClose, onBooked }) {
  const doctors = useApi(() => listDoctors({ per_page: 100 }), []);
  const patients = useApi(() => listPatients({ is_active: "true", per_page: 100 }), []);
  const [busy, setBusy] = useState(false);
  const loading = doctors.loading || patients.loading;
  return (
    <Modal
      open
      size="lg"
      title="Book an appointment for a patient"
      onClose={busy ? () => {} : onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="admin-booking" disabled={busy || loading}>{busy && <Spinner />} Book appointment</button>
        </>
      }
    >
      {loading ? <LoadingState /> : doctors.error || patients.error ? <Alert>{(doctors.error || patients.error).message}</Alert> : (
        <BookingForm formId="admin-booking" hideSubmit doctors={doctors.data} patients={patients.data} onBusyChange={setBusy} onBooked={onBooked} />
      )}
    </Modal>
  );
}

export default function AppointmentsPage({ title, subtitle }) {
  const { user } = useAuth();
  const toast = useToast();
  const role = user.role;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [when, setWhen] = useState("");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null); // { appt, kind: "approved"|"completed"|"cancel" }
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState(false);
  const dq = useDebounce(q);

  const { data, meta, loading, error, reload } = useApi(
    () => listAppointments({ q: dq, status, when, page, per_page: 10 }),
    [dq, status, when, page],
  );

  const filter = (setter) => (value) => { setter(value); setPage(1); };

  const run = async (appt, kind, note) => {
    setBusy(true);
    try {
      if (kind === "cancel") await cancelAppointment(appt.id, note);
      else await updateAppointmentStatus(appt.id, kind);
      toast.success(kind === "cancel" ? "Appointment cancelled." : `Appointment marked as ${kind}.`);
      setPending(null);
      setReason("");
      reload();
    } catch (err) {
      toast.error(err.message);
      setPending(null);
      reload();
    } finally {
      setBusy(false);
    }
  };

  const actionsFor = (a) => {
    const buttons = [];
    if (role !== "patient" && a.status === "pending")
      buttons.push(<button key="ok" className="btn btn-primary btn-sm" onClick={() => run(a, "approved")} disabled={busy}><Check size={14} aria-hidden="true" /> Approve</button>);
    if (role !== "patient" && a.status === "approved")
      buttons.push(<button key="done" className="btn btn-secondary btn-sm" onClick={() => setPending({ appt: a, kind: "completed" })}><CheckCheck size={14} aria-hidden="true" /> Complete</button>);
    if (["pending", "approved"].includes(a.status))
      buttons.push(<button key="x" className="btn btn-ghost btn-sm" onClick={() => setPending({ appt: a, kind: "cancel" })}><X size={14} aria-hidden="true" /> Cancel</button>);
    return <div className="btn-row">{buttons}</div>;
  };

  const columns = [
    { key: "when", header: "Date & time", render: (a) => (<><strong>{formatDate(a.appointment_date)}</strong><br /><span className="muted">{formatTime(a.appointment_time)}</span></>) },
    ...(role !== "patient" ? [{ key: "patient_name", header: "Patient" }] : []),
    ...(role !== "doctor" ? [{ key: "doctor_name", header: "Doctor", render: (a) => (<>{a.doctor_name}<br /><span className="muted">{a.speciality}</span></>) }] : []),
    { key: "reason", header: "Reason", render: (a) => <span className="truncate" title={a.reason}>{a.reason}</span> },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { key: "actions", header: "", className: "cell-actions", render: actionsFor },
  ];

  const labels = {
    completed: { title: "Mark as completed?", message: "Use this once the visit has taken place. A completed appointment cannot be changed afterwards.", confirm: "Mark completed", danger: false },
    cancel: { title: "Cancel this appointment?", message: "The time slot will become available to other patients.", confirm: "Cancel appointment", danger: true },
  };
  const dialog = pending ? labels[pending.kind] : null;

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          role === "patient" ? <Link className="btn btn-primary" to="/patient/book"><CalendarPlus size={16} aria-hidden="true" /> Book appointment</Link>
          : role === "admin" ? <button className="btn btn-primary" onClick={() => setBooking(true)}><CalendarPlus size={16} aria-hidden="true" /> Book for a patient</button> : null
        }
      />
      <div className="panel panel-flush">
        <div className="toolbar">
          <SearchInput value={q} onChange={filter(setQ)} placeholder="Search by name or reason" />
          <select aria-label="Filter by status" value={status} onChange={(e) => filter(setStatus)(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select aria-label="Filter by time" value={when} onChange={(e) => filter(setWhen)(e.target.value)}>
            <option value="">Upcoming and past</option>
            <option value="upcoming">Upcoming only</option>
            <option value="past">Past only</option>
          </select>
        </div>
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} caption="Appointments" emptyTitle="No appointments found" emptyText="Try changing the filters, or book a new appointment." />
        <Pagination meta={meta} onPage={setPage} />
      </div>

      <ConfirmDialog
        open={Boolean(pending)} title={dialog?.title} message={dialog?.message} confirmLabel={dialog?.confirm} danger={dialog?.danger} busy={busy}
        onCancel={() => { setPending(null); setReason(""); }}
        onConfirm={() => run(pending.appt, pending.kind, reason.trim())}
      >
        {pending?.kind === "cancel" && (
          <div style={{ marginTop: 12 }}>
            <Field as="textarea" label="Reason (optional)" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}
      </ConfirmDialog>

      {booking && <AdminBookingModal onClose={() => setBooking(false)} onBooked={() => { setBooking(false); toast.success("Appointment booked."); reload(); }} />}
    </>
  );
}
