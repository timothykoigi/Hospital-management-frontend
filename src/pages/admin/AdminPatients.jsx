import { useEffect, useState } from "react";
import { Pencil, Plus, Power } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { useForm } from "../../hooks/useForm";
import { createPatient, listPatients, setPatientStatus, updatePatient } from "../../services/patientService";
import { formatDate, todayIso } from "../../utils/format";
import { rules, validate } from "../../utils/validation";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import Avatar from "../../components/Avatar";
import { ActiveBadge } from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormModal from "../../components/FormModal";
import Field from "../../components/FormField";

const GENDERS = ["female", "male", "other"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v }));
const EMPTY = { full_name: "", email: "", password: "", date_of_birth: "", gender: "", blood_group: "", phone: "", address: "", emergency_contact_name: "", emergency_contact_phone: "" };

function PatientFormModal({ open, patient, onClose, onSaved }) {
  const toast = useToast();
  const { values, errors, setErrors, handleChange, reset } = useForm(EMPTY);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const editing = Boolean(patient);

  useEffect(() => {
    if (!open) return;
    setFormError("");
    reset(patient ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, patient[k] ?? ""])) : EMPTY);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    const schema = {
      full_name: [rules.required("Full name"), rules.minLength(2)],
      date_of_birth: [rules.required("Date of birth")],
      phone: [rules.phone],
      emergency_contact_phone: [rules.phone],
    };
    if (!editing) {
      schema.email = [rules.required("Email"), rules.email];
      schema.password = [rules.required("Password"), rules.password];
    }
    const found = validate(values, schema);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError("");
    try {
      const { email, password, ...rest } = values;
      const payload = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
      if (editing) await updatePatient(patient.id, payload);
      else await createPatient({ ...payload, email: email.trim(), password });
      toast.success(editing ? "Patient updated." : "Patient registered.");
      onSaved();
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal open={open} size="lg" title={editing ? "Edit patient" : "Register a patient"} onClose={onClose} onSubmit={submit} busy={busy} error={formError} submitLabel={editing ? "Save changes" : "Register patient"}>
      <Field className="span-2" label="Full name" name="full_name" value={values.full_name} onChange={handleChange} error={errors.full_name} required />
      {!editing && (
        <>
          <Field label="Login email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
          <Field label="Temporary password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange} error={errors.password} required />
        </>
      )}
      <Field label="Date of birth" name="date_of_birth" type="date" max={todayIso()} value={values.date_of_birth} onChange={handleChange} error={errors.date_of_birth} required />
      <Field as="select" label="Gender" name="gender" placeholder="Not specified" options={GENDERS} value={values.gender} onChange={handleChange} error={errors.gender} />
      <Field as="select" label="Blood group" name="blood_group" placeholder="Unknown" options={BLOOD} value={values.blood_group} onChange={handleChange} error={errors.blood_group} />
      <Field label="Phone" name="phone" type="tel" value={values.phone} onChange={handleChange} error={errors.phone} />
      <Field className="span-2" label="Address" name="address" value={values.address} onChange={handleChange} error={errors.address} />
      <Field label="Emergency contact name" name="emergency_contact_name" value={values.emergency_contact_name} onChange={handleChange} error={errors.emergency_contact_name} />
      <Field label="Emergency contact phone" name="emergency_contact_phone" type="tel" value={values.emergency_contact_phone} onChange={handleChange} error={errors.emergency_contact_phone} />
    </FormModal>
  );
}

export default function AdminPatients() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [toggle, setToggle] = useState(null);
  const [busy, setBusy] = useState(false);
  const dq = useDebounce(q);
  const { data, meta, loading, error, reload } = useApi(() => listPatients({ q: dq, is_active: status, page, per_page: 10 }), [dq, status, page]);

  const confirmToggle = async () => {
    setBusy(true);
    try {
      const res = await setPatientStatus(toggle.id, !toggle.is_active);
      const n = res.data.cancelled_appointments;
      toast.success(toggle.is_active ? `Patient deactivated.${n ? ` ${n} upcoming appointment(s) were cancelled.` : ""}` : "Patient reactivated.");
      setToggle(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: "name", header: "Patient", render: (p) => (<div className="cell-person"><Avatar name={p.full_name} /><div><strong>{p.full_name}</strong><small>{p.email}</small></div></div>) },
    { key: "dob", header: "Date of birth", render: (p) => formatDate(p.date_of_birth) },
    { key: "phone", header: "Phone", render: (p) => p.phone || "-" },
    { key: "blood_group", header: "Blood", render: (p) => p.blood_group || "-" },
    { key: "status", header: "Status", render: (p) => <ActiveBadge active={p.is_active} /> },
    {
      key: "actions", header: "", className: "cell-actions",
      render: (p) => (
        <div className="btn-row">
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(p)}><Pencil size={14} aria-hidden="true" /> Edit</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setToggle(p)}><Power size={14} aria-hidden="true" /> {p.is_active ? "Deactivate" : "Reactivate"}</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Patients" subtitle="Register and manage patient accounts." actions={<button className="btn btn-primary" onClick={() => setEditing("new")}><Plus size={16} aria-hidden="true" /> Register patient</button>} />
      <div className="panel panel-flush">
        <div className="toolbar">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search by name, email or phone" />
          <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Active and inactive</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
        </div>
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} caption="Patients" emptyTitle="No patients found" emptyText="Adjust the search or register a new patient." />
        <Pagination meta={meta} onPage={setPage} />
      </div>
      <PatientFormModal open={Boolean(editing)} patient={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      <ConfirmDialog
        open={Boolean(toggle)} busy={busy} danger={toggle?.is_active}
        title={toggle?.is_active ? `Deactivate ${toggle?.full_name}?` : `Reactivate ${toggle?.full_name}?`}
        message={toggle?.is_active ? "The patient will be logged out and unable to log in, and their upcoming appointments will be cancelled. Medical history is kept." : "The patient will be able to log in again."}
        confirmLabel={toggle?.is_active ? "Deactivate patient" : "Reactivate patient"}
        onCancel={() => setToggle(null)} onConfirm={confirmToggle}
      />
    </>
  );
}
