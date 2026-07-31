import type { Query, Mutation } from "@tanstack/react-query";

import type { ToastOptions } from "@/components/ui/ToastProvider";
import { getUserFacingRequestErrorMessage } from "@/lib/api";

type ToastSink = (message: string, options?: ToastOptions) => void;

type QueryErrorMeta = {
  skipGlobalError?: boolean;
  globalErrorMessage?: string;
  globalErrorTitle?: string;
  globalErrorToast?: boolean;
};

let queryErrorToastSink: ToastSink | null = null;

function readMeta(value: unknown): QueryErrorMeta {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as QueryErrorMeta;
}

export function registerQueryErrorToastSink(sink: ToastSink | null): void {
  queryErrorToastSink = sink;
}

export function notifyGlobalQueryError(
  error: unknown,
  opts?: Pick<ToastOptions, "title"> & { message?: string },
): void {
  if (!queryErrorToastSink) return;
  queryErrorToastSink(
    opts?.message ?? getUserFacingRequestErrorMessage(error),
    {
      title: opts?.title ?? "تعذّر إكمال العملية",
      variant: "error",
      durationMs: 4200,
    },
  );
}

export function shouldHandleMutationErrorGlobally(
  mutation: Mutation<unknown, unknown, unknown, unknown>,
): boolean {
  const meta = readMeta(mutation.meta);
  return meta.skipGlobalError !== true;
}

export function shouldHandleQueryErrorGlobally(
  query: Query<unknown, unknown, unknown>,
): boolean {
  const meta = readMeta(query.meta);
  return meta.skipGlobalError !== true && meta.globalErrorToast === true;
}

export function getGlobalErrorToastOptions(
  metaValue: unknown,
  error: unknown,
): Pick<ToastOptions, "title"> & { message?: string } {
  const meta = readMeta(metaValue);
  return {
    title: meta.globalErrorTitle,
    message: meta.globalErrorMessage ?? getUserFacingRequestErrorMessage(error),
  };
}
