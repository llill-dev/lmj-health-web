"use client";

import { motion } from "framer-motion";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils/utils";

export type ToggleSwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
  id?: string;
  className?: string;
  size?: "sm" | "md";
  "aria-labelledby"?: string;
};

const SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 34,
  mass: 0.4,
};

const SIZE_CONFIG = {
  sm: {
    trackClassName: "h-5 w-9",
    thumbClassName: "h-4 w-4",
    trackWidth: 36,
    trackHeight: 20,
    thumbSize: 16,
    padding: 2,
  },
  md: {
    trackClassName: "h-6 w-11",
    thumbClassName: "h-5 w-5",
    trackWidth: 44,
    trackHeight: 24,
    thumbSize: 20,
    padding: 2,
  },
} as const;

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  id,
  className,
  size = "md",
  "aria-labelledby": ariaLabelledby,
}: ToggleSwitchProps) {
  const config = SIZE_CONFIG[size];
  const travelX = config.trackWidth - config.thumbSize - config.padding * 2;

  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      dir="ltr"
      aria-checked={checked}
      aria-label={label}
      aria-labelledby={ariaLabelledby}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        config.trackClassName,
        className,
      )}
    >
      <span
        className={cn(
          "relative block overflow-hidden rounded-full border border-black/[0.04]",
          config.trackClassName,
          checked
            ? "bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            : "bg-[#E5E7EB]",
        )}
      >
        <motion.span
          className={cn(
            "absolute rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)]",
            config.thumbClassName,
          )}
          style={{
            top: config.padding,
            left: config.padding,
          }}
          initial={false}
          animate={{ x: checked ? travelX : 0 }}
          transition={SPRING}
        />
      </span>
    </button>
  );
}

export default ToggleSwitch;
