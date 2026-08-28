import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Logo from "../components/Logo.jsx";
import AdminAmbientGlow from "../components/AdminAmbientGlow.jsx";
import { AdminSurfaceContext } from "../components/adminSurface.js";
import { logout } from "../api/auth.js";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "chart", end: true },
  { to: "/admin/preferences", label: "Tercih Analizi", icon: "trending" },
  { to: "/admin/quality", label: "Kalite Metrikleri", icon: "star" },
  { to: "/admin/matrix", label: "Tercih × Memnuniyet", icon: "target" },
  { to: "/admin/faults", label: "Arıza Bildirimleri", icon: "wrench" },
  { to: "/admin/feedback", label: "Geri Bildirim", icon: "message" },
  { to: "/admin/announcements", label: "Duyurular", icon: "bell" },
  { to: "/admin/inventory", label: "Makine Envanteri", icon: "clipboard" },
];

export default function AdminLayout() {
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav("/admin/login", { replace: true });
  };

  return (
    <AdminSurfaceContext.Provider value={true}>
    <div className="admin-scope relative flex min-h-screen">
      <AdminAmbientGlow />

      <aside className="glass fixed inset-y-0 left-0 z-10 flex w-64 flex-col border-r border-hairline">
        <div className="border-b border-hairline px-6 py-5">
          <Logo />
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Yönetici Paneli
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-pill px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[rgb(var(--admin-red))] text-white shadow-[0_6px_18px_rgb(var(--admin-red)/0.32)]"
                    : "text-muted hover:bg-surface-2 hover:text-content"
                }`
              }
            >
              <Icon name={n.icon} size={17} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-hairline p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-pill px-4 py-2.5 text-left text-sm font-medium text-muted hover:bg-surface-2 hover:text-content"
          >
            <Icon name="logout" size={17} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <div className="ml-64 flex-1">
        <header className="glass sticky top-0 z-10 flex items-center justify-between border-b border-hairline px-8 py-4">
          <div className="flex items-center gap-2.5 rounded-pill bg-surface-2/70 py-1.5 pl-2.5 pr-4">
            <span className="h-2 w-2 rounded-full bg-available shadow-[0_0_8px_rgb(var(--available)/0.7)]" />
            <div>
              <p className="text-[11px] leading-tight text-muted">METU GYM Merkez Şube</p>
              <p className="text-xs font-semibold leading-tight text-content">
                {new Date().toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">Admin</span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-ink-800 to-ink-950 text-xs font-bold text-white ring-1 ring-hairline">
              AD
            </div>
          </div>
        </header>
        <div className="relative p-8">
          <Outlet />
        </div>
      </div>
    </div>
    </AdminSurfaceContext.Provider>
  );
}
