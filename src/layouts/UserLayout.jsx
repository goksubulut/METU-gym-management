import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Logo from "../components/Logo.jsx";
import { getAccessToken } from "../api/client.js";
import { loadActiveAnnouncements } from "../api/announcements.js";
import { loadMyNotifications, hasUnreadNotifications, NOTIFICATIONS_READ_EVENT } from "../api/notifications.js";
import { getAuthUser, initialsFromName } from "../utils/authUser.js";
import { hasUnreadAnnouncements } from "../utils/announcementRead.js";
import { useTheme } from "../utils/theme.js";

const NAV = [
  { to: "/home", label: "Ana Sayfa", icon: "home" },
  { to: "/machines", label: "Makineler", icon: "dumbbell" },
  { to: "/book", label: "Randevu", icon: "plus", primary: true },
  { to: "/muscle-groups", label: "Kas Grubu", icon: "body" },
  { to: "/profile", label: "Profil", icon: "user" },
];

export default function UserLayout() {
  const { pathname } = useLocation();
  const bare = pathname === "/" || pathname === "/auth" || pathname === "/qr-info" || pathname === "/scan";
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

  if (bare) return <Outlet />;

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

        <main className="flex-1 overflow-y-auto pb-28">
          <Outlet />
        </main>

        {/* Yüzen hap navigasyon — translucent (Apple malzeme) */}
        <nav className="glass fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 items-center justify-around rounded-3xl border border-hairline px-2 py-2 shadow-nav-float">
          {NAV.map((n) =>
            n.primary ? (
              <NavLink key={n.to} to={n.to} className="relative -mt-8 flex flex-col items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-600 text-white shadow-cta ring-4 ring-bg transition-transform active:scale-[0.92]">
                  <Icon name={n.icon} size={24} strokeWidth={2.2} />
                </span>
                <span className="mt-1 text-[10px] font-semibold text-accent">{n.label}</span>
              </NavLink>
            ) : (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-semibold transition-colors ${
                    isActive ? "text-accent" : "text-muted hover:text-content"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-xl transition-[background-color,transform] duration-200 active:scale-[0.88] ${
                        isActive ? "bg-primary-50" : ""
                      }`}
                    >
                      <Icon name={n.icon} size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                    </span>
                    <span className={isActive ? "font-bold" : ""}>{n.label}</span>
                  </>
                )}
              </NavLink>
            ),
          )}
        </nav>
      </div>
    </div>
  );
}
