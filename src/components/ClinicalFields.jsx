import { useMemo } from "react";
import { useApi } from "../hooks/useApi";
import { listAppointments } from "../services/appointmentService";
import { formatDate, formatTime } from "../utils/format";
import Field from "./FormField";

// Patient + (optional) appointment pickers for records and prescriptions.
// A doctor may only write clinical data for patients with an APPROVED or COMPLETED appointment,
// so only those patients are offered here (the API checks the same rule).
export default function ClinicalFields({ values, errors, setValue, handleChange, lockedPatient }) {
  const { data, loading } = useApi(() => listAppointments({ per_page: 100 }), []);
  const eligible = useMemo(() => (data || []).filter((a) => ["approved", "completed"].includes(a.status)), [data]);

  const patientOptions = useMemo(() => {
    const map = new Map();
    eligible.forEach((a) => map.set(a.patient_id, a.patient_name));
    return [...map].map(([value, label]) => ({ value, label }));
  }, [eligible]);

  const appointmentOptions = eligible
    .filter((a) => a.patient_id === values.patient_id)
    .map((a) => ({ value: a.id, label: `${formatDate(a.appointment_date)} ${formatTime(a.appointment_time)} - ${a.reason}` }));

  return (
    <>
      {lockedPatient ? (
        <div className="field span-2">
          <label>Patient</label>
          <input value={lockedPatient} disabled readOnly />
        </div>
      ) : (
        <Field
          className="span-2" as="select" label="Patient" name="patient_id" required
          placeholder={loading ? "Loading patients..." : "Choose a patient"}
          options={patientOptions} value={values.patient_id}
          onChange={(e) => { handleChange(e); setValue("appointment_id", ""); }}
          error={errors.patient_id}
          hint={!loading && !patientOptions.length ? "You have no patients with an approved or completed appointment yet. Approve an appointment first." : undefined}
        />
      )}
      <Field
        className="span-2" as="select" label="Related appointment (optional)" name="appointment_id"
        placeholder="Not linked to an appointment" options={appointmentOptions}
        value={values.appointment_id} onChange={(e) => {
          handleChange(e);
          const chosen = eligible.find((a) => a.id === e.target.value);
          if (chosen && setValue) setValue("visit_date", chosen.appointment_date);
        }}
        error={errors.appointment_id}
      />
    </>
  );
}
