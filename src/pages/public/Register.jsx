import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useForm } from "../../hooks/useForm";
import { rules, validate } from "../../utils/validation";
import { roleHome } from "../../utils/navigation";
import { PulseLine, PulseMark } from "../../components/Pulse";
import Field from "../../components/FormField";
import { Alert, Spinner } from "../../components/Feedback";
import { todayIso } from "../../utils/format";

const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { values, errors, setErrors, handleChange } = useForm({
    full_name: "", email: "", password: "", confirm: "", date_of_birth: "", gender: "", phone: "",
  });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  if (user) return <Navigate to={roleHome(user.role)} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values, {
      full_name: [rules.required("Full name"), rules.minLength(2)],
      email: [rules.required("Email"), rules.email],
      password: [rules.required("Password"), rules.password],
      confirm: [(v, all) => (v === all.password ? "" : "Passwords do not match.")],
      date_of_birth: [rules.required("Date of birth")],
      phone: [rules.phone],
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError("");
    try {
      const { confirm, ...payload } = values;
      Object.keys(payload).forEach((k) => payload[k] === "" && delete payload[k]);
      const created = await register(payload);
      toast.success("Welcome! Your patient account is ready.");
      navigate(roleHome(created.role), { replace: true });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-aside">
        <div>
          <div className="auth-brand">
            <PulseMark size={32} /> Northgate HMS
          </div>
          <p className="auth-headline">Book visits and see your records online.</p>
          <p>Register as a patient to find a doctor, request appointments and view your prescriptions.</p>
        </div>
        <PulseLine />
        <p className="auth-disclaimer">Portfolio and learning project. Please do not enter real personal or medical information.</p>
      </section>
      <main className="auth-main">
        <div className="auth-card wide">
          <h1>Create a patient account</h1>
          <form onSubmit={onSubmit} noValidate className="form-grid">
            <Alert>{formError}</Alert>
            <Field className="span-2" label="Full name" name="full_name" autoComplete="name" value={values.full_name} onChange={handleChange} error={errors.full_name} required />
            <Field className="span-2" label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} error={errors.email} required />
            <Field label="Password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange} error={errors.password} hint="At least 8 characters with a letter and a number." required />
            <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={values.confirm} onChange={handleChange} error={errors.confirm} required />
            <Field label="Date of birth" name="date_of_birth" type="date" max={todayIso()} value={values.date_of_birth} onChange={handleChange} error={errors.date_of_birth} required />
            <Field label="Gender" name="gender" as="select" options={GENDERS} placeholder="Prefer not to say" value={values.gender} onChange={handleChange} error={errors.gender} />
            <Field className="span-2" label="Phone (optional)" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={handleChange} error={errors.phone} />
            <button className="btn btn-primary span-2" disabled={busy}>
              {busy && <Spinner />} Create account
            </button>
          </form>
          <p className="auth-switch">
            Already registered? <Link to="/login">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
