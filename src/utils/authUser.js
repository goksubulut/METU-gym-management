export function getAuthUser() {
  try {
    const raw = localStorage.getItem("authUser");
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export function setAuthUser(user) {
  if (user) localStorage.setItem("authUser", JSON.stringify(user));
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
