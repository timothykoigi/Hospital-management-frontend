import { useEffect, useState } from "react";
import { useForm } from "../hooks/useForm";
import { useToast } from "../context/ToastContext";
import { createRecord, updateRecord } from "../services/clinicalService";
import { rules, validate } from "../utils/validation";
import { todayIso } from "../utils/format";
import FormModal from "./FormModal";
import Field from "./FormField";
import ClinicalFields from "./ClinicalFields";

const EMPTY = { patient_id: "", appointment_id: "", visit_date: todayIso(), symptoms: "", diagnosis: "", treatment_notes: "" };

// Create a new medical record, or edit an existing one (pass `record`).
// `patient` ({id, name}) locks the patient (used on the patient detail page).
export default function RecordFormModal({ open, onClose, onSaved, record, patient }) {
  const toast = useToast();
  const form = useForm(EMPTY);
  const { values, errors, setErrors, setValue, handleChange, reset } = form;
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const editing = Boolean(record);

  useEffect(() => {
    if (!open) return;
    setFormError("");
    if (record) {
      reset({ ...EMPTY, ...record, appointment_id: record.appointment_id || "", treatment_notes: record.treatment_notes || "" });
    } else {
      reset({ ...EMPTY, patient_id: patient?.id || "" });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values, {
      patient_id: [rules.required("Patient")],
      visit_date: [rules.required("Visit date")],
      symptoms: [rules.required("Symptoms"), rules.minLength(2)],
      diagnosis: [rules.required("Diagnosis"), rules.minLength(2)],
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError("");
    try {
      const body = { visit_date: values.visit_date, symptoms: values.symptoms.trim(), diagnosis: values.diagnosis.trim(), treatment_notes: values.treatment_notes.trim() };
      if (editing) {
        await updateRecord(record.id, body);
      } else {
        await createRecord({ ...body, patient_id: values.patient_id, appointment_id: values.appointment_id || undefined });
      }
      toast.success(editing ? "Medical record updated." : "Medical record created.");
      onSaved();
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal open={open} title={editing ? "Edit medical record" : "New medical record"} size="lg" onClose={onClose} onSubmit={submit} busy={busy} error={formError} submitLabel={editing ? "Save changes" : "Create record"}>
      {editing ? (
        <div className="field span-2">
          <label>Patient</label>
          <input value={record.patient_name || ""} disabled readOnly />
        </div>
      ) : (
        <ClinicalFields values={values} errors={errors} setValue={setValue} handleChange={handleChange} lockedPatient={patient?.name} />
      )}
      <Field label="Visit date" name="visit_date" type="date" max={todayIso()} value={values.visit_date} onChange={handleChange} error={errors.visit_date} required />
      <span />
      <Field className="span-2" as="textarea" label="Symptoms" name="symptoms" value={values.symptoms} onChange={handleChange} error={errors.symptoms} required />
      <Field className="span-2" as="textarea" label="Diagnosis" name="diagnosis" value={values.diagnosis} onChange={handleChange} error={errors.diagnosis} required />
      <Field className="span-2" as="textarea" rows={4} label="Treatment notes" name="treatment_notes" value={values.treatment_notes} onChange={handleChange} error={errors.treatment_notes} />
    </FormModal>
  );
}
