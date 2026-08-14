import { useEffect, useState } from "react";

// Tema yönetimi — tek gerçek kaynak. Koyu varsayılan; tercih localStorage'da saklanır.
// data-theme, ilk boyamadan önce index.html'deki inline script ile ayarlanır (flash yok).

export const THEME_KEY = "metu-gym-theme";
const THEME_EVENT = "themechange";

export function getTheme() {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" ? "light" : "dark";
}

export function setTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* storage engellendiyse sessizce geç */
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

// Bileşenlerin temayı okuyup değiştirmesi için hook.
export function useTheme() {
  const [theme, setThemeState] = useState(getTheme);

  useEffect(() => {
    const handler = () => setThemeState(getTheme());
    window.addEventListener(THEME_EVENT, handler);
    return () => window.removeEventListener(THEME_EVENT, handler);
  }, []);

  return { theme, toggleTheme, setTheme };
}
