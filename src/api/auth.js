import { apiFetch, clearSession, setSession } from "./client.js";
import { setAuthUser } from "../utils/authUser.js";

export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setSession(data);
  return data;
}

export async function register(name, email, phone, password) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, phone: phone || undefined, password }),
  });
  setSession(data);
  return data;
}

export async function fetchMe() {
  const user = await apiFetch("/auth/me");
  setAuthUser(user);
  return user;
}

export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    /* oturum zaten geçersiz olabilir */
  }
  clearSession();
}

export async function updateEmail(email) {
  const user = await apiFetch("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
  setAuthUser(user);
  return user;
}

export async function changePassword(currentPassword, newPassword) {
  return apiFetch("/auth/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function deleteAccount() {
  await apiFetch("/auth/me", { method: "DELETE" });
  clearSession();
}
