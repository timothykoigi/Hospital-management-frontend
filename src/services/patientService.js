import { get, patch, post, put } from "./api";

export const listPatients = (params) => get("/patients", params);
export const getPatient = (id) => get(`/patients/${id}`);
export const createPatient = (payload) => post("/patients", payload);
export const updatePatient = (id, payload) => put(`/patients/${id}`, payload);
export const setPatientStatus = (id, is_active) => patch(`/patients/${id}/status`, { is_active });
