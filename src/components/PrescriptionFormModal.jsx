import { useEffect, useState } from "react";
import { useForm } from "../hooks/useForm";
import { useToast } from "../context/ToastContext";
import { createPrescription } from "../services/clinicalService";
import { rules, validate } from "../utils/validation";
import FormModal from "./FormModal";
import Field from "./FormField";
import ClinicalFields from "./ClinicalFields";

const EMPTY = { patient_id: "", appointment_id: "", medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" };

export default function PrescriptionFormModal({ open, onClose, onSaved, patient }) {
  const toast = useToast();
  const { values, errors, setErrors, setValue, handleChange, reset } = useForm(EMPTY);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      reset({ ...EMPTY, patient_id: patient?.id || "" });
      setFormError("");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values, {
      patient_id: [rules.required("Patient")],
      medication_name: [rules.required("Medication"), rules.minLength(2)],
      dosage: [rules.required("Dosage")],
      frequency: [rules.required("Frequency")],
      duration: [rules.required("Duration")],
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError("");
    try {
      await createPrescription({
        patient_id: values.patient_id,
        appointment_id: values.appointment_id || undefined,
        medication_name: values.medication_name.trim(),
        dosage: values.dosage.trim(),
        frequency: values.frequency.trim(),
        duration: values.duration.trim(),
        instructions: values.instructions.trim(),
      });
      toast.success("Prescription created.");
      onSaved();
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal open={open} title="New prescription" size="lg" onClose={onClose} onSubmit={submit} busy={busy} error={formError} submitLabel="Create prescription">
      <ClinicalFields values={values} errors={errors} setValue={setValue} handleChange={handleChange} lockedPatient={patient?.name} />
      <Field className="span-2" label="Medication" name="medication_name" value={values.medication_name} onChange={handleChange} error={errors.medication_name} required />
      <Field label="Dosage" name="dosage" placeholder="e.g. 5 mg" value={values.dosage} onChange={handleChange} error={errors.dosage} required />
      <Field label="Frequency" name="frequency" placeholder="e.g. Twice daily" value={values.frequency} onChange={handleChange} error={errors.frequency} required />
      <Field label="Duration" name="duration" placeholder="e.g. 7 days" value={values.duration} onChange={handleChange} error={errors.duration} required />
      <span />
      <Field className="span-2" as="textarea" label="Instructions" name="instructions" value={values.instructions} onChange={handleChange} error={errors.instructions} />
    </FormModal>
  );
}
