// Central API client. Every request to Flask goes through here.
// - Adds the Authorization header automatically.
// - Turns every failure into an ApiError with a friendly message.
// - Calls the "unauthorized handler" when the session has expired (HTTP 401).
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

// The token lives in sessionStorage: it disappears when the tab closes, and it is never
// written to the URL or to the page. (Trade-off: JavaScript can read it, so XSS matters.)
const TOKEN_KEY = "hms_token";
export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor({ message, status, code, details }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details || {}; // { fieldName: "message" } for validation errors
  }
}

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data?.error;
    let message = body?.message;
    if (!error.response) {
      message =
        error.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : "Cannot reach the server. Check that the Flask backend is running.";
    } else if (!message) {
      message = "Something went wrong. Please try again.";
    }
    if (status === 401 && !error.config?.skipAuthRedirect && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(
      new ApiError({
        message,
        status,
        code: body?.code || (error.response ? "error" : "network_error"),
        details: body?.details,
      }),
    );
  },
);

// Remove empty filter values so URLs stay clean: {q: "", page: 2} -> {page: 2}
const clean = (params) =>
  Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== "" && v != null));

async function request(config) {
  const response = await client.request({ ...config, params: clean(config.params) });
  const { data, meta, message } = response.data;
  return { data, meta, message };
}

export const get = (url, params, config) => request({ method: "get", url, params, ...config });
export const post = (url, data, config) => request({ method: "post", url, data, ...config });
export const put = (url, data, config) => request({ method: "put", url, data, ...config });
export const patch = (url, data, config) => request({ method: "patch", url, data, ...config });
export const del = (url, config) => request({ method: "delete", url, ...config });
