import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { getPatient } from "../../services/patientService";
import { listAppointments } from "../../services/appointmentService";
import { listPrescriptions, listRecords } from "../../services/clinicalService";
import { formatDate, formatTime } from "../../utils/format";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import RecordFormModal from "../../components/RecordFormModal";
import PrescriptionFormModal from "../../components/PrescriptionFormModal";
import { Alert, ErrorState, LoadingState } from "../../components/Feedback";

export default function DoctorPatientDetail() {
  const { patientId } = useParams();
  const patient = useApi(() => getPatient(patientId), [patientId]);
  const appts = useApi(() => listAppointments({ patient_id: patientId, per_page: 50 }), [patientId]);
  const records = useApi(() => listRecords({ patient_id: patientId, per_page: 50 }), [patientId]);
  const rx = useApi(() => listPrescriptions({ patient_id: patientId, per_page: 50 }), [patientId]);
  const [editingRecord, setEditingRecord] = useState(undefined); // undefined closed | null new | record
  const [addingRx, setAddingRx] = useState(false);

  if (patient.loading) return <LoadingState />;
  if (patient.error) return <ErrorState error={patient.error} onRetry={patient.reload} />;
  const p = patient.data;
  const target = { id: p.id, name: p.full_name };

  return (
    <>
      <p><Link to="/doctor/patients"><ArrowLeft size={14} aria-hidden="true" /> Back to patients</Link></p>
      <PageHeader title={p.full_name} subtitle={p.email}
        actions={<><button className="btn btn-primary" onClick={() => setEditingRecord(null)}><Plus size={16} aria-hidden="true" /> New record</button><button className="btn btn-secondary" onClick={() => setAddingRx(true)}><Plus size={16} aria-hidden="true" /> Prescription</button></>} />

      <section className="panel">
        <h2>Patient details</h2>
        <dl className="detail-list">
          <div><dt>Date of birth</dt><dd>{formatDate(p.date_of_birth)}</dd></div>
          <div><dt>Gender</dt><dd>{p.gender || "-"}</dd></div>
          <div><dt>Blood group</dt><dd>{p.blood_group || "-"}</dd></div>
          <div><dt>Phone</dt><dd>{p.phone || "-"}</dd></div>
          <div><dt>Address</dt><dd>{p.address || "-"}</dd></div>
          <div><dt>Emergency contact</dt><dd>{p.emergency_contact_name || "-"} {p.emergency_contact_phone}</dd></div>
        </dl>
      </section>

      <div className="grid-2">
        <section className="panel">
          <h2>Appointment history</h2>
          {appts.loading && <LoadingState />}
          {appts.error && <Alert>{appts.error.message}</Alert>}
          {(appts.data || []).map((a) => (
            <div className="appt-card" key={a.id}>
              <div className="appt-info"><p><strong>{formatDate(a.appointment_date)}</strong> at {formatTime(a.appointment_time)}</p><p className="muted">{a.reason}</p></div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Prescriptions</h2>
          {rx.loading && <LoadingState />}
          {rx.error && <Alert type="info">{rx.error.message}</Alert>}
          {rx.data && rx.data.length === 0 && <p className="muted">No prescriptions yet.</p>}
          {(rx.data || []).map((r) => (
            <div className="appt-card" key={r.id}>
              <div className="appt-info"><p><strong>{r.medication_name}</strong> - {r.dosage}</p><p className="muted">{r.frequency} for {r.duration} (Dr. {r.doctor_name?.replace(/^Dr\.?\s*/, "")})</p></div>
            </div>
          ))}
        </section>
      </div>

      <section className="panel">
        <h2>Medical records</h2>
        {records.loading && <LoadingState />}
        {records.error && <Alert type="info">{records.error.message} Clinical records appear after an appointment is approved.</Alert>}
        {records.data && records.data.length === 0 && <p className="muted">No records yet.</p>}
        <div className="record-list">
          {(records.data || []).map((r) => (
            <article className="record-card" key={r.id}>
              <header>
                <div><h3>{r.diagnosis}</h3><span className="muted">{formatDate(r.visit_date)} - {r.doctor_name}</span></div>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingRecord(r)}><Pencil size={14} aria-hidden="true" /> Edit</button>
              </header>
              <dl>
                <div><dt>Symptoms</dt><dd>{r.symptoms}</dd></div>
                {r.treatment_notes && <div><dt>Treatment notes</dt><dd>{r.treatment_notes}</dd></div>}
              </dl>
            </article>
          ))}
        </div>
      </section>

      <RecordFormModal open={editingRecord !== undefined} record={editingRecord || undefined} patient={target} onClose={() => setEditingRecord(undefined)} onSaved={() => { setEditingRecord(undefined); records.reload(); }} />
      <PrescriptionFormModal open={addingRx} patient={target} onClose={() => setAddingRx(false)} onSaved={() => { setAddingRx(false); rx.reload(); }} />
    </>
  );
}
