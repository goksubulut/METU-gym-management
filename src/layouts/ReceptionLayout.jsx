import { NavLink, Outlet } from "react-router-dom";
import Logo from "../components/Logo.jsx";

export default function ReceptionLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <Logo />
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
            Resepsiyon / Check-in
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <NavLink
            to="/reception"
            end
            className={({ isActive }) =>
              `text-sm font-semibold ${isActive ? "text-primary-600" : "text-gray-500"}`
            }
          >
            Check-in
          </NavLink>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-900 text-xs font-bold text-white">
              RS
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-800">Resepsiyon</p>
              <NavLink to="/reception/login" className="text-xs text-primary-600">
                Çıkış
              </NavLink>
            </div>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
