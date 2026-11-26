import { get, patch, post } from "./api";

export const listAppointments = (params) => get("/appointments", params);
export const getAppointment = (id) => get(`/appointments/${id}`);
export const bookAppointment = (payload) => post("/appointments", payload);
export const updateAppointmentStatus = (id, status, notes) =>
  patch(`/appointments/${id}/status`, { status, notes });
export const cancelAppointment = (id, reason) => patch(`/appointments/${id}/cancel`, { reason });
