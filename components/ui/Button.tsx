"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-[family-name:var(--font-heading)] font-semibold
      rounded-full cursor-pointer
      transition-all duration-300 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-2
    `;

    const variants = {
      primary: `
        text-white
        bg-gradient-to-r from-red via-red to-red-light
        shadow-[0_4px_20px_rgba(230,57,70,0.4)]
        hover:shadow-[0_8px_30px_rgba(230,57,70,0.5)]
        hover:scale-[1.02]
        active:scale-[0.98]
      `,
      secondary: `
        text-white
        bg-transparent
        border-2 border-[rgba(255,255,255,0.1)]
        hover:border-red hover:text-red
        hover:bg-[rgba(230,57,70,0.05)]
      `,
      ghost: `
        text-white
        bg-transparent
        hover:bg-[rgba(255,255,255,0.05)]
      `,
      danger: `
        text-white
        bg-gradient-to-r from-red-dark to-red
        shadow-[0_4px_20px_rgba(193,18,31,0.4)]
        hover:shadow-[0_8px_30px_rgba(193,18,31,0.5)]
      `,
      success: `
        text-white
        bg-gradient-to-r from-success to-blue-lighter
        shadow-[0_4px_20px_rgba(42,157,143,0.4)]
        hover:shadow-[0_8px_30px_rgba(42,157,143,0.5)]
      `,
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
