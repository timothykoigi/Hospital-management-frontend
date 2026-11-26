import { useCallback, useState } from "react";

// Tiny form helper: values, per-field errors, and a way to show server-side validation errors.
export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setValue = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const handleChange = useCallback(
    (event) => {
      const { name, type, value, checked } = event.target;
      setValue(name, type === "checkbox" ? checked : value);
    },
    [setValue],
  );

  const reset = useCallback((next) => {
    setValues(next ?? initialValues);
    setErrors({});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { values, errors, setErrors, setValue, setValues, handleChange, reset };
}
