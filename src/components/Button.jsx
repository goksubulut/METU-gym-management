const VARIANTS = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
  secondary:
    "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100",
  outline:
    "bg-white text-primary-700 border border-primary-200 hover:border-primary-400 hover:bg-primary-50",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  dark: "bg-gray-900 text-white hover:bg-gray-800 shadow-card",
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background-color,color,box-shadow,transform,opacity] duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
