import { useEffect, useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Logo from "../components/Logo.jsx";
import { getAccessToken } from "../api/client.js";
import { loadActiveAnnouncements } from "../api/announcements.js";
import { loadMyNotifications, hasUnreadNotifications, NOTIFICATIONS_READ_EVENT } from "../api/notifications.js";
import { getAuthUser, initialsFromName } from "../utils/authUser.js";
import { hasUnreadAnnouncements } from "../utils/announcementRead.js";
import { useTheme } from "../utils/theme.js";
import ScreenTransition from "../components/motion/ScreenTransition.jsx";

const NAV = [
  { to: "/home", label: "Ana Sayfa", icon: "home" },
  { to: "/machines", label: "Makineler", icon: "dumbbell" },
  { to: "/book", label: "Randevu", icon: "plus", primary: true },
  { to: "/muscle-groups", label: "Kas Grubu", icon: "body" },
  { to: "/profile", label: "Profil", icon: "user" },
];

export default function UserLayout() {
  const { pathname } = useLocation();
  // Onboarding ve tam ekran akışlarında uygulama kromu (header + tab bar) gizlenir.
  const bare =
    pathname === "/" ||
    pathname === "/auth" ||
    pathname === "/qr-info" ||
    pathname === "/scan" ||
    pathname.startsWith("/onboarding");
  const profile = getAuthUser();
  const avatar = initialsFromName(profile?.name);
  const [hasUnread, setHasUnread] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (bare || !getAccessToken()) {
      setHasUnread(false);
      return;
    }

    let cancelled = false;

    const refresh = async () => {
      const [announcements, personal] = await Promise.all([
        loadActiveAnnouncements(),
        loadMyNotifications(),
      ]);
      if (!cancelled) {
        setHasUnread(hasUnreadAnnouncements(announcements) || hasUnreadNotifications(personal));
      }
    };

    refresh();
    window.addEventListener("announcements-read", refresh);
    window.addEventListener(NOTIFICATIONS_READ_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("announcements-read", refresh);
      window.removeEventListener(NOTIFICATIONS_READ_EVENT, refresh);
    };
  }, [bare, pathname]);

  if (bare) return <ScreenTransition />;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobil çerçeve: geniş ekranda ortada telefon görünümü */}
      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col bg-bg shadow-xl">
        <header className="glass sticky top-0 z-20 flex items-center justify-between border-b border-hairline px-4 py-3">
          <Logo size={24} />
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
              className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-content active:scale-[0.92]"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
            </button>
            <Link
              to="/notifications"
              aria-label="Bildirimler"
              className="relative grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-content"
            >
              <Icon name="bell" size={19} />
              {hasUnread && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-600 ring-2 ring-surface" />
              )}
            </Link>
            <Link
              to="/profile"
              aria-label="Profil"
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-ink-800 to-ink-950 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
            >
              {avatar}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24">
          <ScreenTransition />
        </main>

        {/* METU MOTION §2.6 — Bottom Tab Bar.
            Yüzen translucent hap yerine düz bar: 56px + safe-area, üstte 1px
            border, opak --color-bg zemin. Aktif ikon+etiket --color-brand-red,
            pasif --color-text-secondary. Spec: "Ekstra efekt yok (sade
            tutulmalı, sık kullanılan alan; gösterişli animasyon dikkat dağıtır)". */}
        <nav
          className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-[430px] -translate-x-1/2 items-stretch border-t border-subtle bg-bg pb-[env(safe-area-inset-bottom)]"
          aria-label="Ana gezinme"
        >
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-tab transition-colors duration-150 ease-standard ${
                  isActive ? "text-primary-600" : "text-muted opacity-60 hover:opacity-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={n.icon} size={24} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className={isActive ? "font-semibold" : ""}>{n.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
