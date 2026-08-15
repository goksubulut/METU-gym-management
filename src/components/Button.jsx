const VARIANTS = {
  // Ana CTA — derin ODTÜ kırmızısı dolgu, ölçülü hale (parlak glow değil)
  primary:
    "bg-primary-600 text-white shadow-cta hover:bg-primary-700 active:bg-primary-800",
  // Nötr ikincil eylem
  secondary:
    "bg-surface-2 text-content border border-line hover:bg-surface-3",
  outline:
    "bg-transparent text-accent border border-primary-200 hover:border-primary-400 hover:bg-primary-50",
  ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-content",
  // Link tarzı, sessiz
  quiet: "bg-transparent text-accent hover:bg-primary-50",
  // Yıkıcı — kırmızı dolgu (marka CTA'sından bağlamla ayrışır)
  danger: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
  // Yüksek vurgulu nötr — temaya göre tersine döner (koyuda açık buton)
  dark: "bg-content text-bg hover:opacity-90 active:opacity-80",
};

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 min-h-[3.25rem] px-6 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  full,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-smooth active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/45 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
