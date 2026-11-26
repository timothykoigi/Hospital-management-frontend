import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { HeartPulse, ShieldCheck, CalendarCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "../../hooks/useForm";
import { rules, validate } from "../../utils/validation";
import { roleHome } from "../../utils/navigation";
import { PulseLine, PulseMark } from "../../components/Pulse";
import Field from "../../components/FormField";
import { Alert, Spinner } from "../../components/Feedback";

export default function Login() {
  const { user, login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { values, errors, setErrors, handleChange } = useForm({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  if (user) return <Navigate to={roleHome(user.role)} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values, {
      email: [rules.required("Email"), rules.email],
      password: [rules.required("Password")],
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError("");
    try {
      const loggedIn = await login(values.email.trim(), values.password);
      const from = location.state?.from;
      const allowed = from && from.startsWith(`/${loggedIn.role}`);
      navigate(allowed ? from : roleHome(loggedIn.role), { replace: true });
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
          <p className="auth-headline">Care coordination, kept calm.</p>
          <p>Appointments, records and prescriptions for patients, doctors and administrators in one place.</p>
          <ul className="auth-points">
            <li><CalendarCheck size={16} aria-hidden="true" /> Conflict-free appointment booking</li>
            <li><ShieldCheck size={16} aria-hidden="true" /> Role-based access enforced by the API</li>
            <li><HeartPulse size={16} aria-hidden="true" /> Records visible only to the people who need them</li>
          </ul>
        </div>
        <PulseLine />
        <p className="auth-disclaimer">Portfolio and learning project. All people and records are fictional. This is not a certified clinical system.</p>
      </section>

      <main className="auth-main">
        <div className="auth-card">
          <h1>Log in</h1>
          <p className="muted">Use the account details printed by <code>python3 seed.py --demo</code>, or register as a patient.</p>
          {sessionExpired && <Alert type="info">Your session has expired. Please log in again.</Alert>}
          <form onSubmit={onSubmit} noValidate className="form-grid">
            <Alert>{formError}</Alert>
            <Field label="Email" name="email" type="email" autoComplete="username" value={values.email} onChange={handleChange} error={errors.email} required />
            <Field label="Password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={handleChange} error={errors.password} required />
            <button className="btn btn-primary" disabled={busy}>
              {busy && <Spinner />} Log in
            </button>
          </form>
          <p className="auth-switch">
            New patient? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
