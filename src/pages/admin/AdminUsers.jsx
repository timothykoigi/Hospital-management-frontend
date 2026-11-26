import { useState } from "react";
import { Plus, Power } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { useForm } from "../../hooks/useForm";
import { createAdminUser, listUsers, setUserStatus } from "../../services/adminService";
import { capitalize } from "../../utils/format";
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

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [toggle, setToggle] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const dq = useDebounce(q);
  const { values, errors, setErrors, handleChange, reset } = useForm({ full_name: "", email: "", password: "" });
  const { data, meta, loading, error, reload } = useApi(() => listUsers({ q: dq, role, page, per_page: 10 }), [dq, role, page]);

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values, { full_name: [rules.required("Full name")], email: [rules.required("Email"), rules.email], password: [rules.required("Password"), rules.password] });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError("");
    try {
      await createAdminUser({ ...values, full_name: values.full_name.trim(), email: values.email.trim() });
      toast.success("Administrator account created.");
      setCreating(false);
      reset();
      reload();
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  const confirmToggle = async () => {
    setBusy(true);
    try {
      await setUserStatus(toggle.id, !toggle.is_active);
      toast.success(toggle.is_active ? "Account deactivated." : "Account reactivated.");
      setToggle(null);
      reload();
    } catch (err) {
      toast.error(err.message);
      setToggle(null);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: "name", header: "User", render: (u) => (<div className="cell-person"><Avatar name={u.full_name} /><div><strong>{u.full_name}</strong><small>{u.email}</small></div></div>) },
    { key: "role", header: "Role", render: (u) => capitalize(u.role) },
    { key: "status", header: "Status", render: (u) => <ActiveBadge active={u.is_active} /> },
    {
      key: "actions", header: "", className: "cell-actions",
      render: (u) => u.id === me.id ? <span className="muted">This is you</span> : (
        <button className="btn btn-ghost btn-sm" onClick={() => setToggle(u)}><Power size={14} aria-hidden="true" /> {u.is_active ? "Deactivate" : "Reactivate"}</button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="User accounts" subtitle="Everyone who can log in. Create administrators and control access." actions={<button className="btn btn-primary" onClick={() => { reset(); setFormError(""); setCreating(true); }}><Plus size={16} aria-hidden="true" /> Add administrator</button>} />
      <div className="panel panel-flush">
        <div className="toolbar">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search by name or email" />
          <select aria-label="Filter by role" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="">All roles</option>
            <option value="admin">Administrators</option>
            <option value="doctor">Doctors</option>
            <option value="patient">Patients</option>
          </select>
        </div>
        <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} caption="User accounts" emptyTitle="No users found" />
        <Pagination meta={meta} onPage={setPage} />
      </div>
      <FormModal open={creating} title="Add an administrator" onClose={() => setCreating(false)} onSubmit={submit} busy={busy} error={formError} submitLabel="Create account">
        <Field className="span-2" label="Full name" name="full_name" value={values.full_name} onChange={handleChange} error={errors.full_name} required />
        <Field className="span-2" label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
        <Field className="span-2" label="Temporary password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange} error={errors.password} hint="At least 8 characters with a letter and a number." required />
      </FormModal>
      <ConfirmDialog
        open={Boolean(toggle)} busy={busy} danger={toggle?.is_active}
        title={toggle?.is_active ? `Deactivate ${toggle?.full_name}?` : `Reactivate ${toggle?.full_name}?`}
        message={toggle?.is_active ? "They will be logged out immediately and cannot log in until reactivated." : "They will be able to log in again."}
        confirmLabel={toggle?.is_active ? "Deactivate account" : "Reactivate account"}
        onCancel={() => setToggle(null)} onConfirm={confirmToggle}
      />
    </>
  );
}
