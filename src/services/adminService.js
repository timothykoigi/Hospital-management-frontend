import { del, get, patch, post, put } from "./api";

export const getDashboardStats = () => get("/dashboard/stats");

export const listDepartments = () => get("/departments");
export const listSpecialities = () => get("/specialities");
export const createDepartment = (payload) => post("/departments", payload);
export const updateDepartment = (id, payload) => put(`/departments/${id}`, payload);
export const deleteDepartment = (id) => del(`/departments/${id}`);

export const listUsers = (params) => get("/admin/users", params);
export const createAdminUser = (payload) => post("/admin/users", payload);
export const setUserStatus = (id, is_active) => patch(`/admin/users/${id}/status`, { is_active });

export const getReports = () => get("/admin/reports");
export const getActivityLog = (params) => get("/admin/activity-log", params);
