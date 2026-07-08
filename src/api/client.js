const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

/**
 * Panel bazlı oturum ayrımı: admin, resepsiyon ve üye girişleri ayrı
 * localStorage anahtarlarında tutulur (alan, geçerli URL yoluna göre
 * otomatik seçilir). Böylece aynı tarayıcıda üç paneli farklı sekmelerde
 * açık tutmak mümkündür — biri diğerinin oturumunun üzerine yazmaz.
 * (Önceden üçü de aynı "accessToken" anahtarını paylaşıyordu; son giriş
 * yapan diğerini eziyor, RequireRole de o yüzden yanlış panele atıyordu.)
 */
function sessionKey(base) {
  const path = window.location.pathname;
  const area = path.startsWith("/admin") ? "admin" : path.startsWith("/reception") ? "reception" : "user";
  return area === "user" ? base : `${area}:${base}`;
}

export function getAccessToken() {
  return localStorage.getItem(sessionKey("accessToken"));
}

export function setSession({ accessToken, refreshToken, user }) {
  localStorage.setItem(sessionKey("accessToken"), accessToken);
  if (refreshToken) localStorage.setItem(sessionKey("refreshToken"), refreshToken);
  if (user) localStorage.setItem(sessionKey("authUser"), JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(sessionKey("accessToken"));
  localStorage.removeItem(sessionKey("refreshToken"));
  localStorage.removeItem(sessionKey("authUser"));
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error("Sunucu yanıtı okunamadı");
  }

  if (!res.ok || json.success === false) {
    const msg =
      typeof json.error === "string"
        ? json.error
        : json.error?.message ?? json.message ?? "İstek başarısız";
    throw new Error(msg);
  }
  return json.data;
}

/** Mock satırları (f1, s1, c1…) API kayıtlarından ayırır. */
export function isMockRowId(id) {
  return /^(f|s|c|a)\d+$/.test(id);
}

/** Mock + API listelerini birleştirir; API kayıtları önce gelir. */
export function mergeById(mockRows, apiRows) {
  const map = new Map(mockRows.map((r) => [r.id, r]));
  for (const row of apiRows) map.set(row.id, row);
  const apiIds = new Set(apiRows.map((r) => r.id));
  return [...apiRows, ...mockRows.filter((r) => !apiIds.has(r.id))];
}

export { sessionKey };
