import { useId } from "react";

// One labelled form control with an error message wired up for screen readers.
//   <Field label="Email" name="email" type="email" value={...} onChange={...} error={errors.email} required />
//   <Field as="select" options={[{value, label}]} .../>   <Field as="textarea" .../>
export default function Field({ label, name, error, hint, required, as = "input", options = [], placeholder, children, className = "", ...rest }) {
  const id = useId();
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  const common = { id, name, "aria-invalid": error ? "true" : undefined, "aria-describedby": describedBy, required, ...rest };

  let control;
  if (as === "select") {
    control = (
      <select {...common}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (as === "textarea") {
    control = <textarea rows={3} placeholder={placeholder} {...common} />;
  } else {
    control = <input placeholder={placeholder} {...common} />;
  }

  return (
    <div className={`field ${error ? "has-error" : ""} ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {control}
      {children}
      {hint && !error && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}
