import {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";

  size?: "xs" | "sm" | "md" | "lg" | "xl";

  loading?: boolean;

  fullWidth?: boolean;

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95";

  const variantClasses = {
    primary:
      "bg-primary text-white hover:brightness-110 shadow-lg hover:shadow-xl focus:ring-primary/30",

    secondary:
      "bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl focus:ring-gray-500/30",

    outline:
      "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus:ring-gray-300",

    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",

    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-lg focus:ring-red-500/30",

    success:
      "bg-green-600 text-white hover:bg-green-700 shadow-lg focus:ring-green-500/30",
  };

  const sizeClasses = {
    xs: "h-8 px-3 text-xs",
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />

            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V2C6.477 2 2 6.477 2 12h2z"
            />
          </svg>

          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="flex items-center">
              {leftIcon}
            </span>
          )}

          <span>{children}</span>

          {rightIcon && (
            <span className="flex items-center">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}