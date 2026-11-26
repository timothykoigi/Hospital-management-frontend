import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import { useForm } from "../../hooks/useForm";
import { createDepartment, deleteDepartment, listDepartments, updateDepartment } from "../../services/adminService";
import { rules, validate } from "../../utils/validation";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import { ActiveBadge } from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormModal from "../../components/FormModal";
import Field from "../../components/FormField";

function DepartmentFormModal({ open, department, onClose, onSaved }) {
  const toast = useToast();
  const { values, errors, setErrors, handleChange, reset } = useForm({ name: "", description: "", specialities: "", is_active: true });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const editing = Boolean(department);

  useEffect(() => {
    if (!open) return;
    setFormError("");
    reset(department ? { name: department.name, description: department.description || "", specialities: department.specialities.join("\n"), is_active: department.is_active } : { name: "", description: "", specialities: "", is_active: true });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values, {
      name: [rules.required("Name"), rules.minLength(2)],
      specialities: [rules.required("At least one speciality")],
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError("");
    try {
      const payload = {
        name: values.name.trim(), description: values.description.trim(),
        specialities: values.specialities.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
      };
      if (editing) await updateDepartment(department.id, { ...payload, is_active: values.is_active });
      else await createDepartment(payload);
      toast.success(editing ? "Department updated." : "Department created.");
      onSaved();
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal open={open} title={editing ? "Edit department" : "New department"} onClose={onClose} onSubmit={submit} busy={busy} error={formError}>
      <Field className="span-2" label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} required />
      <Field className="span-2" as="textarea" label="Description" name="description" value={values.description} onChange={handleChange} error={errors.description} />
      <Field className="span-2" as="textarea" rows={4} label="Specialities" name="specialities" value={values.specialities} onChange={handleChange} error={errors.specialities} hint="One per line (or separated by commas)." required />
      {editing && (
        <label className="check-chip span-2" style={{ width: "fit-content" }}>
          <input type="checkbox" name="is_active" checked={values.is_active} onChange={handleChange} /> Department is active (visible to patients)
        </label>
      )}
    </FormModal>
  );
}

export default function AdminDepartments() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(listDepartments, []);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await deleteDepartment(removing.id);
      toast.success("Department deleted.");
      setRemoving(null);
      reload();
    } catch (err) {
      toast.error(err.message);
      setRemoving(null);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: "name", header: "Department", render: (d) => (<><strong>{d.name}</strong><br /><span className="muted">{d.description}</span></>) },
    { key: "specialities", header: "Specialities", render: (d) => d.specialities.map((s) => <span className="chip" key={s}>{s}</span>) },
    { key: "doctor_count", header: "Active doctors" },
    { key: "status", header: "Status", render: (d) => <ActiveBadge active={d.is_active} /> },
    {
      key: "actions", header: "", className: "cell-actions",
      render: (d) => (
        <div className="btn-row">
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(d)}><Pencil size={14} aria-hidden="true" /> Edit</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setRemoving(d)}><Trash2 size={14} aria-hidden="true" /> Delete</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Departments and specialities" subtitle="The structure patients use to find a doctor." actions={<button className="btn btn-primary" onClick={() => setEditing("new")}><Plus size={16} aria-hidden="true" /> New department</button>} />
      <div className="panel panel-flush">
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} caption="Departments" emptyTitle="No departments yet" />
      </div>
      <DepartmentFormModal open={Boolean(editing)} department={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      <ConfirmDialog open={Boolean(removing)} busy={busy} danger title={`Delete ${removing?.name}?`} message="This cannot be undone. Departments that still have doctors cannot be deleted - deactivate them instead." confirmLabel="Delete department" onCancel={() => setRemoving(null)} onConfirm={remove} />
    </>
  );
}
