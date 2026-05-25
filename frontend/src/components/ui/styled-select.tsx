"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import {
  type ForwardedRef,
  type ReactNode,
  type RefAttributes,
  type RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
  listboxZIndex?: number;
  listboxPortalRef?: RefObject<Element | null>;
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

function StyledSelectInner(
  {
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
    listboxZIndex = 5000,
    listboxPortalRef,
  }: StyledSelectProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const autoId = useId();
  const listboxId = listboxIdProp ?? `${autoId}-listbox`;
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerMeasureRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const [listboxPos, setListboxPos] = useState<{
    mode: "viewport" | "portal";
    placement: "below" | "above";
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    innerMaxHeight: number;
  } | null>(null);

  const setWrapperRef = useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      if (!forwardedRef) return;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
        return;
      }
      forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const optionsKey = useMemo(
    () => options.map((o) => `${o.value}:${Boolean(o.disabled)}`).join("|"),
    [options],
  );

  useEffect(() => {
    setOpen(false);
  }, [optionsKey, dropdownResetKey]);

  const clickable = useMemo(
    () => options.filter((o) => !o.disabled),
    [options],
  );
  const mergedDisabled = disabled || clickable.length === 0;

  const updateListboxPosition = useCallback(() => {
    const triggerEl = triggerMeasureRef.current;
    if (!triggerEl || typeof window === "undefined") return;

    let portalRoot: HTMLElement | null = null;
    if (listboxPortalRef != null) {
      const host = listboxPortalRef.current;
      if (!(host instanceof HTMLElement)) return;
      portalRoot = host;
    }

    const rect = triggerEl.getBoundingClientRect();
    const edgePad = 8;
    const gap = listboxPortalRef != null ? 4 : 8;
    const floorPx = 72;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    let mode: "viewport" | "portal" = "viewport";
    let availBelowPx: number;
    let availAbovePx: number;
    let left: number;
    let clampedWidth: number;
    let placement: "below" | "above";
    let innerMaxHeight: number;
    let top: number | undefined;
    let bottom: number | undefined;

    const portalRect =
      portalRoot instanceof HTMLElement
        ? portalRoot.getBoundingClientRect()
        : null;

    if (portalRect) {
      mode = "portal";
      availBelowPx = Math.max(
        0,
        portalRect.bottom - rect.bottom - edgePad - gap,
      );
      availAbovePx = Math.max(0, rect.top - portalRect.top - edgePad - gap);
      clampedWidth = Math.min(rect.width, portalRect.width - 2 * edgePad);
      left = rect.left - portalRect.left;
      left = Math.max(
        edgePad,
        Math.min(left, portalRect.width - clampedWidth - edgePad),
      );

      // Prefer opening below the trigger inside dialogs unless space is clearly tighter.
      if (availBelowPx >= floorPx || availBelowPx >= availAbovePx) {
        placement = "below";
        innerMaxHeight = Math.min(
          dropdownMaxHeight,
          Math.max(floorPx, availBelowPx),
        );
      } else {
        placement = "above";
        innerMaxHeight = Math.min(
          dropdownMaxHeight,
          Math.max(floorPx, availAbovePx),
        );
      }
    } else {
      availBelowPx = Math.max(0, vh - rect.bottom - edgePad - gap);
      availAbovePx = Math.max(0, rect.top - edgePad - gap);
      clampedWidth = Math.min(rect.width, vw - 2 * edgePad);
      left = Math.max(
        edgePad,
        Math.min(rect.left, vw - clampedWidth - edgePad),
      );

      if (availAbovePx >= availBelowPx) {
        placement = "above";
        innerMaxHeight = Math.min(
          dropdownMaxHeight,
          Math.max(floorPx, availAbovePx),
        );
      } else {
        placement = "below";
        innerMaxHeight = Math.min(
          dropdownMaxHeight,
          Math.max(floorPx, availBelowPx),
        );
      }
    }

    innerMaxHeight = Math.floor(innerMaxHeight);

    if (mode === "portal" && portalRect) {
      top =
        placement === "below" ? rect.bottom - portalRect.top + gap : undefined;
      bottom =
        placement === "above" ? portalRect.bottom - rect.top + gap : undefined;
    } else {
      top = placement === "below" ? rect.bottom + gap : undefined;
      bottom =
        placement === "above"
          ? Math.max(edgePad, vh - rect.top + gap)
          : undefined;
    }

    setListboxPos({
      mode,
      placement,
      top,
      bottom,
      left,
      width: clampedWidth,
      innerMaxHeight,
    });
  }, [dropdownMaxHeight, listboxPortalRef]);

  useLayoutEffect(() => {
    if (!open || mergedDisabled) return;

    updateListboxPosition();
    window.addEventListener("resize", updateListboxPosition);
    window.addEventListener("scroll", updateListboxPosition, true);
    return () => {
      window.removeEventListener("resize", updateListboxPosition);
      window.removeEventListener("scroll", updateListboxPosition, true);
    };
  }, [open, mergedDisabled, updateListboxPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        wrapperRef.current?.contains(target) ||
        listboxRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      onBlur?.();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, onBlur]);

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

  const portalMountEl: HTMLElement | null =
    typeof document === "undefined"
      ? null
      : listboxPortalRef != null &&
          listboxPortalRef.current instanceof HTMLElement
        ? listboxPortalRef.current
        : listboxPortalRef != null
          ? null
          : document.body;

  const listboxPortal =
    typeof document !== "undefined" && portalMountEl
      ? createPortal(
          open && !mergedDisabled && listboxPos ? (
            <motion.div
              key={listboxId}
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-label={listboxAriaLabel}
              initial={{
                opacity: 0,
                y: listboxPos.placement === "below" ? -6 : 6,
                scale: 0.98,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={[
                "pointer-events-auto overflow-hidden rounded-[14px] border-[1.82px] border-primary/50 bg-white shadow-[0_22px_50px_rgba(2,6,23,0.14)]",
                listboxPos.mode === "viewport" ? "fixed" : "absolute",
                listboxPos.placement === "below"
                  ? "origin-top"
                  : "origin-bottom",
              ].join(" ")}
              style={{
                zIndex:
                  listboxPos.mode === "viewport" ? listboxZIndex : undefined,
                transformOrigin:
                  listboxPos.placement === "below"
                    ? "top center"
                    : "bottom center",
                top:
                  listboxPos.placement === "below" ? listboxPos.top : undefined,
                bottom:
                  listboxPos.placement === "above"
                    ? listboxPos.bottom
                    : undefined,
                left: listboxPos.left,
                width: listboxPos.width,
                touchAction: "manipulation",
              }}
            >
              {clickable.length === 0 ? (
                <div className="px-4 py-4 text-right text-[12px] font-semibold leading-6 text-[#667085]">
                  {emptyState ?? emptyTriggerLabel ?? "لا توجد خيارات متاحة."}
                </div>
              ) : (
                <div
                  className="touch-pan-y space-y-1.5 overflow-y-auto overscroll-contain p-2.5 [scrollbar-color:#0f8f8b_#dff6f5] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-track]:bg-[#E6F7F6] [&::-webkit-scrollbar]:w-2"
                  style={{ maxHeight: listboxPos.innerMaxHeight }}
                  onWheel={(e) => e.stopPropagation()}
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
                        onClick={() =>
                          commit(String(opt.value), Boolean(opt.disabled))
                        }
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
                          <span className="min-w-0 flex-1 truncate text-right">
                            {opt.label}
                          </span>
                        ) : (
                          <>
                            <span className="shrink-0 font-bold">
                              {extra ?? null}
                            </span>
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
          ) : null,
          portalMountEl,
        )
      : null;

  return (
    <div
      ref={setWrapperRef}
      className={["relative font-cairo", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        ref={triggerMeasureRef}
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
                showPlaceholderStyle &&
                mergedDisabled &&
                emptyTriggerLabel != null
                  ? "font-semibold text-[#667085]"
                  : showPlaceholderStyle
                    ? "font-semibold text-[#98A2B3]"
                    : tone === "emphasis"
                      ? "font-extrabold text-primary"
                      : "font-extrabold text-[#111827]"
              }
            >
              {mergedDisabled && emptyTriggerLabel != null
                ? emptyTriggerLabel
                : labelForTrigger}
            </span>
          </button>

          <div
            className="w-px shrink-0 self-stretch bg-[#E6F7F6]"
            aria-hidden
          />

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

      {listboxPortal}
    </div>
  );
}

const StyledSelectBase = forwardRef(StyledSelectInner);
StyledSelectBase.displayName = "StyledSelect";

const StyledSelect = StyledSelectBase as <T extends string = string>(
  props: StyledSelectProps<T> & RefAttributes<HTMLDivElement>,
) => JSX.Element | null;

export default StyledSelect;
