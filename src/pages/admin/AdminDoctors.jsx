import { useEffect, useState } from "react";
import { Pencil, Plus, Power } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { useForm } from "../../hooks/useForm";
import { createDoctor, listDoctors, setDoctorStatus, updateDoctor } from "../../services/doctorService";
import { listDepartments } from "../../services/adminService";
import { formatDays, formatMoney, formatTime, WEEKDAYS } from "../../utils/format";
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

const EMPTY = {
  full_name: "", email: "", password: "", phone: "", department_id: "", speciality: "", years_experience: "0",
  consultation_fee: "", available_days: [0, 1, 2, 3, 4], work_start: "09:00", work_end: "17:00", bio: "",
};

function DoctorFormModal({ open, doctor, departments, onClose, onSaved }) {
  const toast = useToast();
  const { values, errors, setErrors, setValue, handleChange, reset } = useForm(EMPTY);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const editing = Boolean(doctor);

  useEffect(() => {
    if (!open) return;
    setFormError("");
    reset(doctor ? { ...EMPTY, ...doctor, years_experience: String(doctor.years_experience ?? 0), consultation_fee: doctor.consultation_fee ?? "", bio: doctor.bio || "", phone: doctor.phone || "" } : EMPTY);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const specialities = departments.find((d) => d.id === values.department_id)?.specialities || [];

  const toggleDay = (day) =>
    setValue("available_days", values.available_days.includes(day) ? values.available_days.filter((d) => d !== day) : [...values.available_days, day].sort());

  const submit = async (e) => {
    e.preventDefault();
    const schema = {
      full_name: [rules.required("Full name"), rules.minLength(2)],
      department_id: [rules.required("Department")],
      speciality: [rules.required("Speciality")],
      phone: [rules.phone],
      available_days: [(v) => (v.length ? "" : "Choose at least one working day.")],
      work_end: [(v, all) => (v > all.work_start ? "" : "End time must be after the start time.")],
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
      const payload = {
        full_name: values.full_name.trim(), phone: values.phone.trim(), department_id: values.department_id, speciality: values.speciality,
        years_experience: Number(values.years_experience || 0), available_days: values.available_days,
        work_start: values.work_start, work_end: values.work_end, bio: values.bio.trim(),
      };
      if (values.consultation_fee !== "") payload.consultation_fee = Number(values.consultation_fee);
      if (editing) {
        await updateDoctor(doctor.id, payload);
      } else {
        await createDoctor({ ...payload, email: values.email.trim(), password: values.password });
      }
      toast.success(editing ? "Doctor updated." : "Doctor registered.");
      onSaved();
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal open={open} size="lg" title={editing ? "Edit doctor" : "Register a doctor"} onClose={onClose} onSubmit={submit} busy={busy} error={formError} submitLabel={editing ? "Save changes" : "Register doctor"}>
      <Field className="span-2" label="Full name" name="full_name" value={values.full_name} onChange={handleChange} error={errors.full_name} required />
      {!editing && (
        <>
          <Field label="Login email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
          <Field label="Temporary password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange} error={errors.password} hint="The doctor can change it after logging in." required />
        </>
      )}
      <Field label="Phone" name="phone" type="tel" value={values.phone} onChange={handleChange} error={errors.phone} />
      <Field label="Years of experience" name="years_experience" type="number" min="0" max="60" value={values.years_experience} onChange={handleChange} error={errors.years_experience} />
      <Field as="select" label="Department" name="department_id" placeholder="Choose a department" options={departments.filter((d) => d.is_active).map((d) => ({ value: d.id, label: d.name }))} value={values.department_id} onChange={(e) => { handleChange(e); setValue("speciality", ""); }} error={errors.department_id} required />
      <Field as="select" label="Speciality" name="speciality" placeholder={values.department_id ? "Choose a speciality" : "Choose a department first"} options={specialities.map((s) => ({ value: s, label: s }))} value={values.speciality} onChange={handleChange} error={errors.speciality} required />
      <Field label="Consultation fee ($)" name="consultation_fee" type="number" min="0" step="0.01" value={values.consultation_fee} onChange={handleChange} error={errors.consultation_fee} />
      <span />
      <Field label="Starts work at" name="work_start" type="time" value={values.work_start} onChange={handleChange} error={errors.work_start} />
      <Field label="Finishes work at" name="work_end" type="time" value={values.work_end} onChange={handleChange} error={errors.work_end} />
      <div className="field span-2">
        <span style={{ fontWeight: 600, fontSize: ".9rem" }} id="days-label">Working days</span>
        <div className="check-row" role="group" aria-labelledby="days-label">
          {WEEKDAYS.map((name, i) => (
            <label className="check-chip" key={name}>
              <input type="checkbox" checked={values.available_days.includes(i)} onChange={() => toggleDay(i)} /> {name}
            </label>
          ))}
        </div>
        {errors.available_days && <p className="field-error">{errors.available_days}</p>}
      </div>
      <Field className="span-2" as="textarea" label="Professional bio" name="bio" value={values.bio} onChange={handleChange} error={errors.bio} />
    </FormModal>
  );
}

export default function AdminDoctors() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | "new" | doctor
  const [toggle, setToggle] = useState(null);
  const [busy, setBusy] = useState(false);
  const dq = useDebounce(q);

  const departments = useApi(listDepartments, []);
  const { data, meta, loading, error, reload } = useApi(
    () => listDoctors({ q: dq, department_id: department, is_active: status, page, per_page: 10 }),
    [dq, department, status, page],
  );

  const filter = (setter) => (v) => { setter(v); setPage(1); };

  const confirmToggle = async () => {
    setBusy(true);
    try {
      const res = await setDoctorStatus(toggle.id, !toggle.is_active);
      const n = res.data.cancelled_appointments;
      toast.success(toggle.is_active ? `Doctor deactivated.${n ? ` ${n} upcoming appointment(s) were cancelled.` : ""}` : "Doctor reactivated.");
      setToggle(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: "name", header: "Doctor", render: (d) => (<div className="cell-person"><Avatar name={d.full_name} /><div><strong>{d.full_name}</strong><small>{d.email}</small></div></div>) },
    { key: "department", header: "Department", render: (d) => (<>{d.department_name}<br /><span className="muted">{d.speciality}</span></>) },
    { key: "schedule", header: "Schedule", render: (d) => (<>{formatDays(d.available_days)}<br /><span className="muted">{formatTime(d.work_start)} - {formatTime(d.work_end)}</span></>) },
    { key: "fee", header: "Fee", render: (d) => formatMoney(d.consultation_fee) },
    { key: "status", header: "Status", render: (d) => <ActiveBadge active={d.is_active} /> },
    {
      key: "actions", header: "", className: "cell-actions",
      render: (d) => (
        <div className="btn-row">
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(d)}><Pencil size={14} aria-hidden="true" /> Edit</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setToggle(d)}><Power size={14} aria-hidden="true" /> {d.is_active ? "Deactivate" : "Reactivate"}</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Doctors" subtitle="Register doctors, manage their schedules and availability." actions={<button className="btn btn-primary" onClick={() => setEditing("new")} disabled={!departments.data}><Plus size={16} aria-hidden="true" /> Register doctor</button>} />
      <div className="panel panel-flush">
        <div className="toolbar">
          <SearchInput value={q} onChange={filter(setQ)} placeholder="Search by name, speciality or department" />
          <select aria-label="Filter by department" value={department} onChange={(e) => filter(setDepartment)(e.target.value)}>
            <option value="">All departments</option>
            {(departments.data || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select aria-label="Filter by status" value={status} onChange={(e) => filter(setStatus)(e.target.value)}>
            <option value="">Active and inactive</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
        </div>
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} caption="Doctors" emptyTitle="No doctors found" emptyText="Adjust the search or register a new doctor." />
        <Pagination meta={meta} onPage={setPage} />
      </div>

      <DoctorFormModal open={Boolean(editing)} doctor={editing === "new" ? null : editing} departments={departments.data || []} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      <ConfirmDialog
        open={Boolean(toggle)} busy={busy} danger={toggle?.is_active}
        title={toggle?.is_active ? `Deactivate ${toggle?.full_name}?` : `Reactivate ${toggle?.full_name}?`}
        message={toggle?.is_active ? "The doctor will no longer be able to log in or be booked, and all of their upcoming appointments will be cancelled. Medical history is kept." : "The doctor will be able to log in and receive bookings again."}
        confirmLabel={toggle?.is_active ? "Deactivate doctor" : "Reactivate doctor"}
        onCancel={() => setToggle(null)} onConfirm={confirmToggle}
      />
    </>
  );
}
