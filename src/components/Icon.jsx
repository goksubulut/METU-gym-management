// Uygulamanın tek ikon kaynağı: 24x24 çizgi (stroke) ikonlar, currentColor.
// Emoji kullanımı yasak — her görsel simge buradan gelir.

const PATHS = {
  home: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  dumbbell: (
    <>
      <rect x="4.5" y="8" width="3" height="8" rx="1" />
      <rect x="16.5" y="8" width="3" height="8" rx="1" />
      <path d="M7.5 12h9" />
      <path d="M2.5 10v4M21.5 10v4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  body: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <path d="M12 7.5V14M12 9.5 7.5 11.5M12 9.5l4.5 2M12 14l-3 6.5M12 14l3 6.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.4-3.4 3.9-5 7-5s5.6 1.6 7 5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 20c1.2-3 3.2-4.4 5.5-4.4s4.3 1.4 5.5 4.4" />
      <path d="M15.5 5.9a3 3 0 0 1 0 5.2M17.5 15.9c1.4.7 2.4 2 3 3.9" />
    </>
  ),
  bell: (
    <>
      <path d="M18 16H6c1.2-1.4 1.8-2.9 1.8-5.2a4.2 4.2 0 0 1 8.4 0c0 2.3.6 3.8 1.8 5.2Z" />
      <path d="M10.4 19a1.7 1.7 0 0 0 3.2 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  star: (
    <path d="m12 4 2.5 5 5.5.8-4 3.9.9 5.5L12 16.6l-4.9 2.6.9-5.5-4-3.9L9.5 9Z" />
  ),
  wrench: (
    <path d="M14.7 6.3a4.6 4.6 0 0 1 5.9-1l-3.2 3.2 1.4 1.4L22 6.7a4.6 4.6 0 0 1-6.2 6.2l-6.5 6.5a1.9 1.9 0 0 1-2.7-2.7l6.5-6.5a4.6 4.6 0 0 1 1.6-3.9Z" />
  ),
  message: (
    <path d="M4 7a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 7v7a2.5 2.5 0 0 1-2.5 2.5H9.5L4.5 20V7Z" />
  ),
  flame: (
    <path d="M12 3.5c.5 2.6-.2 4.6-1.8 6-1-.6-1.6-1.4-1.9-2.6-1.2 1.5-2 3.2-2 4.9a5.7 5.7 0 0 0 11.4 0c0-3.7-3-6.6-5.7-8.3Z" />
  ),
  snowflake: (
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.2" />
      <path d="m15.6 15.6 5 5" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  logout: (
    <>
      <path d="M14.5 4.5H7a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 7 19.5h7.5" />
      <path d="M10.5 12H21M17.5 8.5 21 12l-3.5 3.5" />
    </>
  ),
  phone: (
    <>
      <rect x="7.5" y="3" width="9" height="18" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5z" />
    </>
  ),
  chart: (
    <path d="M5 20v-6M10 20V8M15 20v-9M20 20V5M3.5 20.5h17" />
  ),
  trending: (
    <path d="m3.5 16.5 5.5-5.5 3.5 3.5 7.5-8M15.5 6.5H20V11" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5.5" y="5" width="13" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 11.5h6M9 15.5h4" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5a2 2 0 0 1 2-2h2l1.3-2h5.4L16 6.5h2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </>
  ),
  bulb: (
    <>
      <path d="M12 3.5a5.5 5.5 0 0 0-3.2 10c.7.5 1.2 1.6 1.2 2.5h4c0-.9.5-2 1.2-2.5a5.5 5.5 0 0 0-3.2-10Z" />
      <path d="M9.8 19h4.4M10.7 21.5h2.6" />
    </>
  ),
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4v4h-4" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10.5 5-2.5v8l-5-2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  chevronRight: <path d="m9 5 7 7-7 7" />,
  chevronLeft: <path d="m15 19-7-7 7-7" />,
  chevronUp: <path d="m5 15 7-7 7 7" />,
  chevronDown: <path d="m5 9 7 7 7-7" />,
  mapPin: (
    <>
      <path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  ban: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M6.2 6.2l11.6 11.6" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13.5h4.5l1.5 2.5h4l1.5-2.5H20" />
      <path d="M5.5 5.5h13a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V7a1.5 1.5 0 0 1 1.5-1.5Z" />
    </>
  ),
  wave: (
    <path d="M4 14c2-1.5 3-4 3.5-6M8.5 16c2.5-2 4-5.5 4.5-9M13 18c3-2.5 4.8-6.5 5.2-11M17 19.5c2-1.7 3.4-4 4-6.5" />
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
};

export default function Icon({ name, size = 20, strokeWidth = 1.8, className = "" }) {
  const paths = PATHS[name];
  if (!paths) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}
