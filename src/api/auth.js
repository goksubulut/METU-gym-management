import { apiFetch, setSession } from "./client.js";

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
