// Small client-side checks for instant feedback. The Flask API validates everything again,
// because browser checks can always be bypassed.
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const rules = {
  required: (label) => (v) => (String(v ?? "").trim() ? "" : `${label} is required.`),
  email: (v) => (EMAIL_RE.test(String(v).trim()) ? "" : "Enter a valid email address."),
  minLength: (n) => (v) => (String(v).trim().length >= n ? "" : `Must be at least ${n} characters.`),
  password: (v) => {
    if (v.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return "Password needs at least one letter and one number.";
    return "";
  },
  phone: (v) => (!v || /^[0-9+()\-\s]{7,20}$/.test(v) ? "" : "Enter a valid phone number."),
};

// validate(values, { email: [rules.required("Email"), rules.email] }) -> { email: "message" }
export function validate(values, schema) {
  const errors = {};
  for (const [field, checks] of Object.entries(schema)) {
    for (const check of checks) {
      const message = check(values[field] ?? "", values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}
