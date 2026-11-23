import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { useForm } from "../hooks/useForm";
import { bookAppointment } from "../services/appointmentService";
import { getAvailability } from "../services/doctorService";
import { formatTime, todayIso } from "../utils/format";
import { rules, validate } from "../utils/validation";
import Field from "./FormField";
import { Alert, Spinner } from "./Feedback";

// Booking flow: choose doctor -> choose date -> choose an available slot -> give a reason.
// Used by patients (own booking) and administrators (booking on behalf of a patient).
export default function BookingForm({ doctors, patients, initialDoctorId = "", onBooked, formId = "booking-form", hideSubmit = false, onBusyChange }) {
  const { values, errors, setErrors, setValue, handleChange } = useForm({
    doctor_id: initialDoctorId, patient_id: "", appointment_date: "", appointment_time: "", reason: "", approve: false,
  });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const ready = values.doctor_id && values.appointment_date;
  const availability = useApi(
    () => (ready ? getAvailability(values.doctor_id, values.appointment_date) : Promise.resolve({ data: null })),
    [values.doctor_id, values.appointment_date],
  );
  const slots = availability.data?.slots || [];

  const setBusyState = (b) => {
    setBusy(b);
    onBusyChange?.(b);
  };

  const submit = async (e) => {
    e.preventDefault();
    const schema = {
      doctor_id: [rules.required("Doctor")],
      appointment_date: [rules.required("Date")],
      appointment_time: [rules.required("Time slot")],
      reason: [rules.required("Reason for visit"), rules.minLength(3)],
    };
    if (patients) schema.patient_id = [rules.required("Patient")];
    const found = validate(values, schema);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusyState(true);
    setFormError("");
    try {
      const payload = {
        doctor_id: values.doctor_id,
        appointment_date: values.appointment_date,
        appointment_time: values.appointment_time,
        reason: values.reason.trim(),
      };
      if (patients) {
        payload.patient_id = values.patient_id;
        if (values.approve) payload.status = "approved";
      }
      const res = await bookAppointment(payload);
      onBooked(res.data);
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
      if (err.status === 409) {
        setValue("appointment_time", "");
        availability.reload(); // the slot was just taken: refresh the list
      }
    } finally {
      setBusyState(false);
    }
  };

  const doctorOptions = doctors.map((d) => ({ value: d.id, label: `${d.full_name} - ${d.speciality}` }));

  return (
    <form id={formId} onSubmit={submit} noValidate className="form-grid">
      <Alert>{formError}</Alert>
      {patients && (
        <Field className="span-2" as="select" label="Patient" name="patient_id" placeholder="Choose a patient" options={patients.map((p) => ({ value: p.id, label: `${p.full_name} (${p.email})` }))} value={values.patient_id} onChange={handleChange} error={errors.patient_id} required />
      )}
      <Field className="span-2" as="select" label="Doctor" name="doctor_id" placeholder="Choose a doctor" options={doctorOptions} value={values.doctor_id} onChange={(e) => { handleChange(e); setValue("appointment_time", ""); }} error={errors.doctor_id} required />
      <Field label="Date" name="appointment_date" type="date" min={todayIso()} value={values.appointment_date} onChange={(e) => { handleChange(e); setValue("appointment_time", ""); }} error={errors.appointment_date} required />
      <div className="field span-2">
        <span className="field-label" id="slot-label" style={{ fontWeight: 600, fontSize: ".9rem" }}>
          Available time {errors.appointment_time && <span className="field-error"> - {errors.appointment_time}</span>}
        </span>
        {!ready && <p className="muted">Choose a doctor and a date to see available times.</p>}
        {ready && availability.loading && <p className="muted"><Spinner /> Checking the doctor's calendar...</p>}
        {ready && availability.error && <Alert>{availability.error.message}</Alert>}
        {ready && !availability.loading && availability.data && !availability.data.works_this_day && (
          <Alert type="info">The doctor does not work on this day. Please choose another date.</Alert>
        )}
        {ready && !availability.loading && slots.length > 0 && (
          <div className="slot-grid" role="group" aria-labelledby="slot-label">
            {slots.map((s) => (
              <button type="button" key={s.time} className="slot" disabled={!s.available} aria-pressed={values.appointment_time === s.time} onClick={() => setValue("appointment_time", s.time)}>
                {formatTime(s.time)}
              </button>
            ))}
          </div>
        )}
      </div>
      <Field className="span-2" as="textarea" label="Reason for visit" name="reason" value={values.reason} onChange={handleChange} error={errors.reason} placeholder="Briefly describe your symptoms or the purpose of the visit" required />
      {patients && (
        <label className="check-chip span-2" style={{ width: "fit-content" }}>
          <input type="checkbox" name="approve" checked={values.approve} onChange={handleChange} /> Approve immediately
        </label>
      )}
      {!hideSubmit && (
        <button className="btn btn-primary span-2" disabled={busy}>
          {busy && <Spinner />} Request appointment
        </button>
      )}
    </form>
  );
}
