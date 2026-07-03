import { NavLink, Outlet, useLocation } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { currentUser } from "../mock/user.js";

const NAV = [
  { to: "/home", label: "Ana Sayfa", icon: "🏠" },
  { to: "/machines", label: "Makineler", icon: "🏋️" },
  { to: "/book", label: "Randevu", icon: "➕", primary: true },
  { to: "/muscle-groups", label: "Kas Grubu", icon: "💪" },
  { to: "/appointments", label: "Profil", icon: "👤" },
];

export default function UserLayout() {
  const { pathname } = useLocation();
  const bare = pathname === "/" || pathname === "/auth" || pathname === "/qr-info";

  if (bare) return <Outlet />;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobil çerçeve: geniş ekranda ortada telefon görünümü */}
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-white shadow-xl">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
          <Logo size={26} />
          <div className="flex items-center gap-3 text-gray-400">
            <button className="relative text-lg">
              🔔
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary-600" />
            </button>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
              {currentUser.avatar}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-around border-t border-gray-100 bg-white px-2 py-2">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 text-[10px] font-semibold ${
                  n.primary
                    ? "relative"
                    : isActive
                      ? "text-primary-600"
                      : "text-gray-400"
                }`
              }
            >
              {n.primary ? (
                <span className="grid h-11 w-11 -translate-y-3 place-items-center rounded-full bg-primary-600 text-xl text-white shadow-lg shadow-primary-200">
                  {n.icon}
                </span>
              ) : (
                <span className="text-lg">{n.icon}</span>
              )}
              <span className={n.primary ? "-mt-2 text-primary-600" : ""}>
                {n.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
