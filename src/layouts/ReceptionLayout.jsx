import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../api/auth.js";
import { ReceptionShell } from "../components/reception/ReceptionUI.jsx";

// Vardiya saati — check-in masasında sürekli görünür, editoryal künye hissi.
function DeskClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <time
      dateTime={now.toISOString()}
      className="tabular-nums font-display text-[15px] font-semibold tracking-[0.02em] text-white/90"
    >
      {now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
    </time>
  );
}

export default function ReceptionLayout() {
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav("/reception/login", { replace: true });
  };

  return (
    <ReceptionShell>
      <header className="rc-topbar sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-8 py-4">
          {/* Künye — amblem + kelime markası + bölüm adı, ince ayraçlarla */}
          <div className="flex items-center gap-4">
            <img
              src="/images/metumotion.jpg"
              alt="METU Motion"
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-xl object-cover ring-1 ring-white/20"
            />
            <div className="leading-none">
              <p className="font-display text-[15px] font-semibold tracking-[-0.01em] text-white">
                METU Motion
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/60">
                ODTÜ Spor Merkezi
              </p>
            </div>
            <span className="hidden h-8 w-px bg-white/[0.12] sm:block" />
            <p className="hidden text-[10px] font-bold uppercase tracking-[0.28em] text-white/70 sm:block">
              Resepsiyon
            </p>
          </div>

          <div className="flex items-center gap-7">
            <nav className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.18em]">
              <NavLink
                to="/reception"
                end
                className={({ isActive }) => `rc-nav ${isActive ? "is-active" : ""}`}
              >
                Check-in
              </NavLink>
            </nav>

            <span className="hidden h-8 w-px bg-white/[0.12] md:block" />
            <div className="hidden md:block">
              <DeskClock />
            </div>

            <span className="h-8 w-px bg-white/[0.12]" />
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.18] bg-white/[0.08] text-[11px] font-semibold tracking-[0.08em] text-white/85">
                RS
              </div>
              <div className="leading-tight">
                <p className="text-[13px] font-bold text-white/95">Resepsiyon</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] font-medium text-white/60 transition-colors duration-fast hover:text-white/90"
                >
                  Çıkış yap
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 py-10">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-6xl px-8 pb-10">
        <div className="flex items-center justify-between border-t border-white/10 pt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">
          <span>ODTÜ Spor Merkezi · Check-in Masası</span>
          <span className="hidden sm:block">METU Motion</span>
        </div>
      </footer>
    </ReceptionShell>
  );
}
