import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Home, Dumbbell, Plus, BicepsFlexed, User } from "lucide-react";
import Icon from "../components/Icon.jsx";
import Logo from "../components/Logo.jsx";
import BottomNavBar from "@/components/ui/bottom-nav-bar";
import { getAccessToken } from "../api/client.js";
import { loadActiveAnnouncements } from "../api/announcements.js";
import { loadMyNotifications, hasUnreadNotifications, NOTIFICATIONS_READ_EVENT } from "../api/notifications.js";
import { getAuthUser, initialsFromName } from "../utils/authUser.js";
import { hasUnreadAnnouncements } from "../utils/announcementRead.js";
import { useTheme } from "../utils/theme.js";
import ScreenTransition from "../components/motion/ScreenTransition.jsx";

const NAV = [
  { to: "/home", label: "Ana Sayfa", icon: Home },
  { to: "/machines", label: "Makineler", icon: Dumbbell },
  { to: "/book", label: "Randevu", icon: Plus, primary: true },
  { to: "/muscle-groups", label: "Kas Grubu", icon: BicepsFlexed },
  { to: "/profile", label: "Profil", icon: User },
];

function navIndexForPath(pathname) {
  let best = -1;
  let bestLen = -1;
  NAV.forEach((item, i) => {
    if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
      if (item.to.length > bestLen) {
        best = i;
        bestLen = item.to.length;
      }
    }
  });
  return best;
}

export default function UserLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeNavIndex = navIndexForPath(pathname);
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

        <BottomNavBar
          items={NAV}
          activeIndex={activeNavIndex}
          onItemSelect={(_, item) => navigate(item.to)}
          stickyBottom
          ariaLabel="Ana gezinme"
          className="min-w-0 bottom-[calc(1rem+env(safe-area-inset-bottom))]"
        />
      </div>
    </div>
  );
}
