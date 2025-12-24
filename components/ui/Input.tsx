"use client";

import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={cn(
              `w-full px-4 py-3.5
              font-[family-name:var(--font-body)]
              text-white text-base
              bg-[rgba(255,255,255,0.05)]
              border-2 border-[rgba(255,255,255,0.1)]
              rounded-xl
              outline-none
              transition-all duration-300
              placeholder:text-muted
              focus:border-red
              focus:shadow-[0_0_0_4px_rgba(230,57,70,0.1)]
              disabled:opacity-50 disabled:cursor-not-allowed`,
              leftIcon && "pl-12",
              (rightIcon || isPassword) && "pr-12",
              error && "border-red-dark focus:border-red-dark focus:shadow-[0_0_0_4px_rgba(193,18,31,0.1)]",
              className
            )}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-sm text-red"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
        
        {hint && !error && (
          <p className="text-sm text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            `w-full px-4 py-3.5
            font-[family-name:var(--font-body)]
            text-white text-base
            bg-[rgba(255,255,255,0.05)]
            border-2 border-[rgba(255,255,255,0.1)]
            rounded-xl
            outline-none
            transition-all duration-300
            placeholder:text-muted
            focus:border-red
            focus:shadow-[0_0_0_4px_rgba(230,57,70,0.1)]
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none`,
            error && "border-red-dark focus:border-red-dark focus:shadow-[0_0_0_4px_rgba(193,18,31,0.1)]",
            className
          )}
          {...props}
        />
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-sm text-red"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
        
        {hint && !error && (
          <p className="text-sm text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
export type { InputProps, TextareaProps };
