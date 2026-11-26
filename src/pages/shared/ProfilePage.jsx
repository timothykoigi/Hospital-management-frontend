import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useForm } from "../../hooks/useForm";
import { changePassword } from "../../services/authService";
import { updateDoctor } from "../../services/doctorService";
import { updatePatient } from "../../services/patientService";
import { formatDate, formatDays, formatMoney, formatTime } from "../../utils/format";
import { rules, validate } from "../../utils/validation";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/FormField";
import { Alert, Spinner } from "../../components/Feedback";
import Avatar from "../../components/Avatar";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v }));

function ProfileEditor() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const isDoctor = user.role === "doctor";
  const { values, errors, setErrors, handleChange } = useForm(
    isDoctor
      ? { phone: profile.phone || "", bio: profile.bio || "" }
      : {
          full_name: profile.full_name || "", phone: profile.phone || "", address: profile.address || "", blood_group: profile.blood_group || "",
          emergency_contact_name: profile.emergency_contact_name || "", emergency_contact_phone: profile.emergency_contact_phone || "",
        },
  );
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values, isDoctor ? { phone: [rules.phone] } : { full_name: [rules.required("Full name")], phone: [rules.phone], emergency_contact_phone: [rules.phone] });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError("");
    try {
      await (isDoctor ? updateDoctor(profile.id, values) : updatePatient(profile.id, values));
      await refreshProfile();
      toast.success("Profile saved.");
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="form-grid">
      <Alert>{formError}</Alert>
      {!isDoctor && <Field className="span-2" label="Full name" name="full_name" value={values.full_name} onChange={handleChange} error={errors.full_name} required />}
      <Field label="Phone" name="phone" type="tel" value={values.phone} onChange={handleChange} error={errors.phone} />
      {isDoctor ? (
        <Field className="span-2" as="textarea" rows={4} label="Professional bio" name="bio" value={values.bio} onChange={handleChange} error={errors.bio} hint="Shown to patients on your public profile." />
      ) : (
        <>
          <Field as="select" label="Blood group" name="blood_group" placeholder="Not set" options={BLOOD} value={values.blood_group} onChange={handleChange} error={errors.blood_group} />
          <Field className="span-2" label="Address" name="address" value={values.address} onChange={handleChange} error={errors.address} />
          <Field label="Emergency contact name" name="emergency_contact_name" value={values.emergency_contact_name} onChange={handleChange} error={errors.emergency_contact_name} />
          <Field label="Emergency contact phone" name="emergency_contact_phone" type="tel" value={values.emergency_contact_phone} onChange={handleChange} error={errors.emergency_contact_phone} />
        </>
      )}
      <div className="span-2"><button className="btn btn-primary" disabled={busy}>{busy && <Spinner />} Save profile</button></div>
    </form>
  );
}

function PasswordForm() {
  const toast = useToast();
  const { values, errors, setErrors, handleChange, reset } = useForm({ current_password: "", new_password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values, {
      current_password: [rules.required("Current password")],
      new_password: [rules.required("New password"), rules.password],
      confirm: [(v, all) => (v === all.new_password ? "" : "Passwords do not match.")],
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError("");
    try {
      await changePassword(values.current_password, values.new_password);
      toast.success("Password changed. Other devices were logged out.");
      reset();
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="form-stack">
      <Alert>{formError}</Alert>
      <Field label="Current password" name="current_password" type="password" autoComplete="current-password" value={values.current_password} onChange={handleChange} error={errors.current_password} />
      <Field label="New password" name="new_password" type="password" autoComplete="new-password" value={values.new_password} onChange={handleChange} error={errors.new_password} hint="At least 8 characters with a letter and a number." />
      <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" value={values.confirm} onChange={handleChange} error={errors.confirm} />
      <div><button className="btn btn-primary" disabled={busy}>{busy && <Spinner />} Change password</button></div>
    </form>
  );
}

export default function ProfilePage() {
  const { user, profile } = useAuth();
  return (
    <>
      <PageHeader title={user.role === "patient" ? "My profile" : "Profile and settings"} subtitle="Your account details and security settings." />
      <section className="panel">
        <div className="cell-person" style={{ marginBottom: 18 }}>
          <Avatar name={user.full_name} size={52} />
          <div>
            <h2 style={{ margin: 0 }}>{user.full_name}</h2>
            <span className="muted">{user.email} - {user.role}</span>
          </div>
        </div>
        <dl className="detail-list">
          {user.role === "doctor" && profile && (
            <>
              <div><dt>Department</dt><dd>{profile.department_name}</dd></div>
              <div><dt>Speciality</dt><dd>{profile.speciality}</dd></div>
              <div><dt>Working days</dt><dd>{formatDays(profile.available_days)}</dd></div>
              <div><dt>Working hours</dt><dd>{formatTime(profile.work_start)} - {formatTime(profile.work_end)}</dd></div>
              <div><dt>Consultation fee</dt><dd>{formatMoney(profile.consultation_fee)}</dd></div>
            </>
          )}
          {user.role === "patient" && profile && (
            <>
              <div><dt>Date of birth</dt><dd>{formatDate(profile.date_of_birth)}</dd></div>
              <div><dt>Gender</dt><dd>{profile.gender || "-"}</dd></div>
            </>
          )}
          <div><dt>Member since</dt><dd>{formatDate(user.created_at?.slice(0, 10))}</dd></div>
        </dl>
        {user.role !== "admin" && !profile && <Alert type="info">No profile is linked to this account.</Alert>}
      </section>
      {user.role !== "admin" && profile && (
        <section className="panel">
          <h2>Edit details</h2>
          <ProfileEditor />
        </section>
      )}
      <section className="panel">
        <h2>Change password</h2>
        <PasswordForm />
      </section>
    </>
  );
}
