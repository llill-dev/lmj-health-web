"use client";

import { Check } from "lucide-react";
import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/utils";

export type AppCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  size?: "sm" | "md";
  boxClassName?: string;
};

const SIZE_CLASSES = {
  sm: {
    wrapper: "h-4 w-4",
    icon: "h-3 w-3",
    radius: "rounded-[4px]",
  },
  md: {
    wrapper: "h-5 w-5",
    icon: "h-3.5 w-3.5",
    radius: "rounded-[5px]",
  },
} as const;

export const AppCheckbox = forwardRef<HTMLInputElement, AppCheckboxProps>(
  ({ className, boxClassName, disabled, size = "sm", ...props }, ref) => {
    const config = SIZE_CLASSES[size];

    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center",
          config.wrapper,
          className,
        )}
      >
        <input
          {...props}
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className="peer absolute inset-0 z-[1] m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-flex h-full w-full items-center justify-center border bg-white text-white transition",
            config.radius,
            "border-[#D0D5DD] shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)]",
            "peer-checked:border-primary peer-checked:bg-primary",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/35 peer-focus-visible:ring-offset-2",
            "peer-disabled:opacity-60",
            boxClassName,
          )}
        >
          <Check
            className={cn(
              "scale-75 opacity-0 transition duration-150 ease-out peer-checked:scale-100 peer-checked:opacity-100",
              config.icon,
            )}
          />
        </span>
      </span>
    );
  },
);

AppCheckbox.displayName = "AppCheckbox";

export default AppCheckbox;
