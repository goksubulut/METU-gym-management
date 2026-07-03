import { NavLink, Outlet } from "react-router-dom";
import Logo from "../components/Logo.jsx";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/preferences", label: "Tercih Analizi", icon: "📈" },
  { to: "/admin/quality", label: "Kalite Metrikleri", icon: "⭐" },
  { to: "/admin/matrix", label: "Tercih × Memnuniyet", icon: "🎯" },
  { to: "/admin/faults", label: "Arıza Bildirimleri", icon: "🔧" },
  { to: "/admin/feedback", label: "Geri Bildirim", icon: "💬" },
  { to: "/admin/inventory", label: "Makine Envanteri", icon: "🗂️" },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-6 py-5">
          <Logo />
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
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
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-primary-50"
                }`
              }
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <NavLink
            to="/admin/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
          >
            <span>🚪</span> Çıkış Yap
          </NavLink>
        </div>
      </aside>

      <div className="ml-64 flex-1">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
          <div>
            <p className="text-xs text-gray-400">FitBud Merkez Şube</p>
            <p className="text-sm font-semibold text-gray-800">2 Temmuz 2026, Perşembe</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Admin</span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-900 text-xs font-bold text-white">
              AD
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
