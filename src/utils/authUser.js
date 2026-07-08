import { sessionKey } from "../api/client.js";

export function getAuthUser() {
  try {
    const raw = localStorage.getItem(sessionKey("authUser"));
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export function setAuthUser(user) {
  if (user) localStorage.setItem(sessionKey("authUser"), JSON.stringify(user));
}

/** Rolün varsayılan giriş sonrası sayfası. */
export function homePathForRole(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "RECEPTION") return "/reception";
  return "/home";
}

export function initialsFromName(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
