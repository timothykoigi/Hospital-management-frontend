import { get, post, put } from "./api";

export const listRecords = (params) => get("/medical-records", params);
export const createRecord = (payload) => post("/medical-records", payload);
export const updateRecord = (id, payload) => put(`/medical-records/${id}`, payload);

export const listPrescriptions = (params) => get("/prescriptions", params);
export const createPrescription = (payload) => post("/prescriptions", payload);
