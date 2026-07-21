const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

/** Kimlik uçlarında 401 = yanlış parola vb.; oturum yenileme/çıkış tetiklenmez. */
const AUTH_NO_RECOVERY = /^\/auth\/(login|register|refresh|password-reset\/)/;

/**
 * Panel bazlı oturum ayrımı: admin, resepsiyon ve üye girişleri ayrı
 * localStorage anahtarlarında tutulur (alan, geçerli URL yoluna göre
 * otomatik seçilir). Böylece aynı tarayıcıda üç paneli farklı sekmelerde
 * açık tutmak mümkündür — biri diğerinin oturumunun üzerine yazmaz.
 */
function sessionKey(base) {
  const path = window.location.pathname;
  const area = path.startsWith("/admin") ? "admin" : path.startsWith("/reception") ? "reception" : "user";
  return area === "user" ? base : `${area}:${base}`;
}

function loginPathForArea() {
  const path = window.location.pathname;
  if (path.startsWith("/admin")) return "/admin/login";
  if (path.startsWith("/reception")) return "/reception/login";
  return "/auth";
}

export function getAccessToken() {
  return localStorage.getItem(sessionKey("accessToken"));
}

function getRefreshToken() {
  return localStorage.getItem(sessionKey("refreshToken"));
}

export function setSession({ accessToken, refreshToken, user }) {
  localStorage.setItem(sessionKey("accessToken"), accessToken);
  if (refreshToken) localStorage.setItem(sessionKey("refreshToken"), refreshToken);
  if (user) localStorage.setItem(sessionKey("authUser"), JSON.stringify(user));
  scheduleProactiveRefresh();
}

export function clearSession() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  localStorage.removeItem(sessionKey("accessToken"));
  localStorage.removeItem(sessionKey("refreshToken"));
  localStorage.removeItem(sessionKey("authUser"));
}

function parseJwtExpMs(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

let refreshTimer = null;
let refreshInFlight = null;

async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Refresh token yok");

  refreshInFlight = (async () => {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    let json;
    try {
      json = await res.json();
    } catch {
      throw new Error("Refresh yanıtı okunamadı");
    }
    if (!res.ok || json.success === false) {
      throw new Error(
        typeof json.error === "string" ? json.error : json.error?.message ?? "Refresh başarısız",
      );
    }
    setSession(json.data);
    return json.data;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

function handleSessionExpired() {
  clearSession();
  const loginPath = loginPathForArea();
  if (!window.location.pathname.startsWith(loginPath)) {
    window.location.assign(loginPath);
  }
}

/** Access token dolmadan 2 dk önce sessiz yenileme planlar. */
export function scheduleProactiveRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  const token = getAccessToken();
  if (!token || !getRefreshToken()) return;

  const expMs = parseJwtExpMs(token);
  if (!expMs) return;

  const delay = Math.max(30_000, expMs - Date.now() - 2 * 60_000);
  refreshTimer = setTimeout(() => {
    refreshAccessToken().catch(() => handleSessionExpired());
  }, delay);
}

export async function apiFetch(path, options = {}, retried = false) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };
  // FormData'da Content-Type'ı elle set etme — boundary tarayıcı ekler.
  if (isFormData && headers["Content-Type"]) {
    delete headers["Content-Type"];
  }
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error("Sunucu yanıtı okunamadı");
  }

  if (
    res.status === 401 &&
    !retried &&
    !AUTH_NO_RECOVERY.test(path) &&
    (token || getRefreshToken())
  ) {
    if (getRefreshToken()) {
      try {
        await refreshAccessToken();
        return apiFetch(path, options, true);
      } catch {
        handleSessionExpired();
        throw new Error("Oturum süresi doldu, lütfen tekrar giriş yapın");
      }
    }
    handleSessionExpired();
    throw new Error("Oturum süresi doldu, lütfen tekrar giriş yapın");
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
