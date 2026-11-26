import { del, get, patch, post, put } from "./api";

export const listDoctors = (params) => get("/doctors", params);
export const getDoctor = (id) => get(`/doctors/${id}`);
export const getAvailability = (id, date) => get(`/doctors/${id}/availability`, { date });
export const createDoctor = (payload) => post("/doctors", payload);
export const updateDoctor = (id, payload) => put(`/doctors/${id}`, payload);
export const setDoctorStatus = (id, is_active) => patch(`/doctors/${id}/status`, { is_active });
export const deleteDoctor = (id) => del(`/doctors/${id}`);
