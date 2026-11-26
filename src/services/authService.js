import { get, post } from "./api";

export const login = (email, password) =>
  post("/auth/login", { email, password }, { skipAuthRedirect: true });
export const register = (payload) => post("/auth/register", payload, { skipAuthRedirect: true });
export const logout = () => post("/auth/logout", null, { skipAuthRedirect: true });
export const getMe = () => get("/auth/me");
export const changePassword = (current_password, new_password) =>
  post("/auth/change-password", { current_password, new_password });
