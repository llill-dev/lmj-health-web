"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export type StyledSelectOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  disabled?: boolean;
};

export type StyledSelectSize = "md" | "sm" | "xs";

export type StyledSelectProps<T extends string = string> = {
  id?: string;
  listboxId?: string;
  options: StyledSelectOption<T>[];
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: StyledSelectSize;
  tone?: "brand" | "muted" | "emphasis";
  className?: string;
  triggerClassName?: string;
  dropdownMaxHeight?: number;
  emptyState?: ReactNode;
  emptyTriggerLabel?: ReactNode;
  renderOptionTrailing?: (
    opt: StyledSelectOption<T>,
    isSelected: boolean,
  ) => ReactNode;
  listboxAriaLabel?: string;
  chevronAriaLabelOpen?: string;
  chevronAriaLabelClose?: string;
  dropdownResetKey?: string;
};

const ROW_H = "min-h-[44px]";

const TRIGGER_BY_SIZE: Record<StyledSelectSize, string> = {
  md: "h-[48px] rounded-[16px] text-[13px]",
  sm: "h-[42px] rounded-[10px] text-[12px] font-bold",
  xs: "h-[36px] rounded-xl text-[12px] font-extrabold",
};

const OUTER_RADIUS: Record<StyledSelectSize, string> = {
  md: "rounded-[16px]",
  sm: "rounded-[10px]",
  xs: "rounded-xl",
};

const PADDING_TRIGGER: Record<StyledSelectSize, string> = {
  md: "px-4",
  sm: "px-3.5",
  xs: "px-3",
};

const CHEVRON_BTN_W: Record<StyledSelectSize, string> = {
  md: "w-12",
  sm: "w-11",
  xs: "w-10",
};

function openShadow(
  tone: NonNullable<StyledSelectProps["tone"]>,
  open: boolean,
): string {
  if (!open) return "";
  if (tone === "brand") {
    return "shadow-[inset_0_0_0_1px_rgba(15,143,139,0.55),0_12px_28px_rgba(15,143,139,0.12)]";
  }
  if (tone === "muted") {
    return "shadow-[inset_0_0_0_1px_rgba(15,143,139,0.35),0_10px_22px_rgba(15,23,42,0.07)] ring-2 ring-primary/10";
  }
  return "shadow-sm ring-2 ring-primary/15";
}

export default function StyledSelect<T extends string = string>({
  id,
  listboxId: listboxIdProp,
  options,
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  disabled = false,
  error = false,
  size = "md",
  tone = "brand",
  className,
  triggerClassName,
  dropdownMaxHeight = 220,
  emptyState,
  emptyTriggerLabel,
  renderOptionTrailing,
  listboxAriaLabel,
  chevronAriaLabelOpen = "إغلاق القائمة",
  chevronAriaLabelClose = "فتح القائمة",
  dropdownResetKey,
}: StyledSelectProps<T>) {
  const autoId = useId();
  const listboxId = listboxIdProp ?? `${autoId}-listbox`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const optionsKey = useMemo(
    () => options.map((o) => `${o.value}:${Boolean(o.disabled)}`).join("|"),
    [options],
  );

  useEffect(() => {
    setOpen(false);
  }, [optionsKey, dropdownResetKey]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(event.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, onBlur]);

  const clickable = useMemo(() => options.filter((o) => !o.disabled), [options]);

  const mergedDisabled = disabled || clickable.length === 0;

  const labelForTrigger = useMemo(() => {
    const match = options.find((o) => String(o.value) === String(value));
    if (match) return match.label;
    return placeholder ?? "";
  }, [options, placeholder, value]);

  const selectedAndEnabled = options.some(
    (o) => String(o.value) === String(value) && !o.disabled,
  );

  const showPlaceholderStyle = !selectedAndEnabled;

  const borderClass = error
    ? "border-[#F04438]"
    : tone === "brand"
      ? "border-primary/60"
      : tone === "emphasis"
        ? "border-primary/25"
        : "border-[#E5E7EB]";

  const emphasisBg =
    tone === "emphasis" ? "bg-primary/10 text-primary" : "bg-white";

  const toggle = () => {
    if (mergedDisabled) return;
    setOpen((prev) => !prev);
  };

  const commit = (next: string, optDisabled?: boolean) => {
    if (optDisabled) return;
    onChange(next);
    setOpen(false);
    onBlur?.();
  };

  return (
    <div
      ref={rootRef}
      className={["relative font-cairo", className ?? ""].filter(Boolean).join(" ")}
    >
      <div
        className={[
          "relative border-[1.82px]",
          OUTER_RADIUS[size],
          borderClass,
          emphasisBg,
          openShadow(tone, open),
          mergedDisabled ? "opacity-60" : "",
          "transition-[box-shadow,border-color] duration-200",
        ].join(" ")}
      >
        <div
          className={[
            "flex w-full items-stretch overflow-hidden bg-transparent",
            TRIGGER_BY_SIZE[size],
            OUTER_RADIUS[size],
            triggerClassName ?? "",
          ].join(" ")}
        >
          <button
            type="button"
            id={id}
            name={name}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            disabled={mergedDisabled}
            className={`min-w-0 flex-1 text-right outline-none transition-colors hover:bg-[#FAFFFE]/80 focus-visible:bg-[#FAFFFE]/80 disabled:pointer-events-none ${PADDING_TRIGGER[size]}`}
            onClick={toggle}
          >
            <span
              className={
                showPlaceholderStyle && mergedDisabled && emptyTriggerLabel != null
                  ? "font-semibold text-[#667085]"
                  : showPlaceholderStyle
                    ? "font-semibold text-[#98A2B3]"
                    : tone === "emphasis"
                      ? "font-extrabold text-primary"
                      : "font-extrabold text-[#111827]"
              }
            >
              {mergedDisabled && emptyTriggerLabel != null ? emptyTriggerLabel : labelForTrigger}
            </span>
          </button>

          <div className="w-px shrink-0 self-stretch bg-[#E6F7F6]" aria-hidden />

          <button
            type="button"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-label={open ? chevronAriaLabelOpen : chevronAriaLabelClose}
            disabled={mergedDisabled}
            className={[
              "flex shrink-0 items-center justify-center text-[#667085] transition-colors hover:bg-[#F2FFFE] focus-visible:bg-[#F2FFFE] disabled:pointer-events-none",
              CHEVRON_BTN_W[size],
              open ? "text-primary" : "",
            ].join(" ")}
            onClick={toggle}
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex"
            >
              <ChevronDown className={size === "xs" ? "h-4 w-4" : "h-5 w-5"} />
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && !mergedDisabled ? (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-label={listboxAriaLabel}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 left-0 z-[80] mt-2 origin-top overflow-hidden rounded-[14px] border-[1.82px] border-primary/50 bg-white shadow-[0_22px_50px_rgba(2,6,23,0.14)]"
            style={{ transformOrigin: "top center" }}
          >
            {clickable.length === 0 ? (
              <div className="px-4 py-4 text-right text-[12px] font-semibold leading-6 text-[#667085]">
                {emptyState ?? emptyTriggerLabel ?? "لا توجد خيارات متاحة."}
              </div>
            ) : (
              <div
                className="space-y-1.5 overflow-y-auto p-2.5 [scrollbar-color:#0f8f8b_#dff6f5] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-track]:bg-[#E6F7F6] [&::-webkit-scrollbar]:w-2"
                style={{ maxHeight: dropdownMaxHeight }}
              >
                {options.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value);
                  const extra = renderOptionTrailing?.(opt, isSelected);

                  return (
                    <button
                      key={`${listboxId}-${String(opt.value)}-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => commit(String(opt.value), Boolean(opt.disabled))}
                      className={[
                        "flex w-full items-center justify-between gap-3 rounded-[11px] px-4 py-2.5 text-[13px] font-extrabold transition-[transform,box-shadow,background-color] duration-200 ease-out hover:translate-y-[0.5px]",
                        ROW_H,
                        opt.disabled
                          ? "cursor-not-allowed bg-[#F3F4F6] text-[#98A2B3]"
                          : isSelected
                            ? "bg-primary text-white shadow-[0_12px_20px_rgba(15,143,139,0.22)]"
                            : "bg-[#F9FAFB] text-[#344054] hover:bg-[#F2FFFE]",
                      ].join(" ")}
                    >
                      {!renderOptionTrailing ? (
                        <span className="min-w-0 flex-1 text-right truncate">
                          {opt.label}
                        </span>
                      ) : (
                        <>
                          <span className="shrink-0 font-bold">{extra ?? null}</span>
                          <span className="min-w-0 flex-1 truncate text-right tabular-nums">
                            {opt.label}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
