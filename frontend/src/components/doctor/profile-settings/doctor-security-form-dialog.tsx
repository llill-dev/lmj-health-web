'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, X, type LucideIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormReturn,
} from 'react-hook-form';
import { cn } from '@/lib/utils/utils';
import { useToast } from '@/components/ui/ToastProvider';

export type SecurityFormFieldConfig<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: 'password' | 'email' | 'tel' | 'text';
  multiline?: boolean;
  hint?: string;
  autoComplete?: string;
};

const inputBaseClass =
  'h-[48px] w-full rounded-[12px] border bg-white px-4 font-cairo text-[13px] font-bold text-[#101828] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow,background] placeholder:font-semibold placeholder:text-[#98A2B3]';
const inputNormalBorder =
  'border-[#E4E7EC] hover:border-primary/35 focus-visible:border-primary focus-visible:bg-[#FAFFFE] focus-visible:shadow-[0_0_0_4px_rgba(15,143,139,0.11),inset_0_1px_2px_rgba(0,0,0,0.03)]';
const inputInvalidBorder =
  'border-[#F04438] bg-[#FFFBFB] shadow-[inset_0_1px_2px_rgba(240,68,56,0.06)] ring-2 ring-[#FECDCA]/70 focus-visible:border-[#F04438] focus-visible:shadow-[0_0_0_4px_rgba(240,68,56,0.12)]';

function SecurityFormField<T extends FieldValues>({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-right font-cairo text-[12px] font-extrabold text-[#344054]">
        {label}
      </label>
      {children}
      {error ? (
        <p
          role="alert"
          className="text-right font-cairo text-[11px] font-bold leading-[18px] text-[#D92D20]"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-right font-cairo text-[11px] font-semibold leading-[18px] text-[#667085]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default function DoctorSecurityFormDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  form,
  fields,
  submitLabel,
  onValidatedSubmit,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: LucideIcon;
  form: UseFormReturn<T>;
  fields: SecurityFormFieldConfig<T>[];
  submitLabel: string;
  onValidatedSubmit: (values: T) => void | Promise<void>;
  busy?: boolean;
}) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const fieldErrors = errors as FieldErrors<T>;
  const submitting = Boolean(busy || isSubmitting);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          reset();
          setVisibleFields({});
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
                transition: { duration: 0.22, ease: 'easeOut' },
              },
              closed: {
                opacity: 0,
                pointerEvents: 'none',
                transition: { duration: 0.2, ease: 'easeOut' },
                transitionEnd: { visibility: 'hidden' },
              },
            }}
            className="fixed inset-0 z-[9999] bg-slate-900/55 backdrop-blur-[3px]"
            style={{ touchAction: 'none' }}
          />
        </Dialog.Overlay>

        <div className="pointer-events-none fixed inset-0 z-[10000] grid place-items-center p-4 sm:p-6">
          <Dialog.Content forceMount asChild>
            <motion.div
              initial={false}
              animate={open ? 'open' : 'closed'}
              variants={{
                open: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  visibility: 'visible',
                  pointerEvents: 'auto',
                  transition: {
                    type: 'spring',
                    stiffness: 420,
                    damping: 34,
                    mass: 0.85,
                  },
                },
                closed: {
                  opacity: 0,
                  y: 18,
                  scale: 0.97,
                  pointerEvents: 'none',
                  transition: { duration: 0.2, ease: 'easeOut' },
                  transitionEnd: { visibility: 'hidden' },
                },
              }}
              className="pointer-events-auto relative w-full max-w-[min(96vw,520px)] origin-center overflow-hidden rounded-[22px] border border-[#E8ECF3] bg-gradient-to-br from-[#FAFFFE] via-white to-[#F8FAFC] shadow-[0_24px_64px_-12px_rgba(15,23,42,0.22)] outline-none"
              dir="rtl"
              lang="ar"
            >
              <div
                aria-hidden
                className="h-[4px] w-full shrink-0 bg-gradient-to-l from-[#0F766E] via-primary to-[#5EEAD4]"
              />

              <div className="relative border-b border-[#EEF2F6] px-6 pb-4 pt-5 sm:px-7 sm:pt-6">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4E7EC] bg-white/90 text-[#667085] shadow-sm transition-colors hover:bg-[#F9FAFB] hover:text-[#344054]"
                    aria-label="إغلاق"
                  >
                    <X className="h-5 w-5" strokeWidth={2.25} />
                  </button>
                </Dialog.Close>

                <div className="flex gap-3 text-right">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-[0_10px_24px_rgba(15,143,139,0.12)]">
                    <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1 ps-2">
                    <Dialog.Title className="font-cairo text-[clamp(1.05rem,2.6vw,1.35rem)] font-black tracking-tight text-[#101828]">
                      {title}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1.5 font-cairo text-[12.5px] font-semibold leading-relaxed text-[#667085]">
                      {description}
                    </Dialog.Description>
                  </div>
                </div>
              </div>

              <form
                className="space-y-4 px-6 py-5 sm:px-7 sm:pb-6"
                onSubmit={handleSubmit(onValidatedSubmit, () => {
                  toast('يرجى مراجعة الحقول المعلّمة قبل المتابعة.', {
                    title: 'بيانات ناقصة أو غير صحيحة',
                    variant: 'warning',
                    durationMs: 4200,
                  });
                })}
                noValidate
              >
                {fields.map((field) => {
                  const error = fieldErrors[field.name]?.message as
                    | string
                    | undefined;
                  const isPassword = field.type === 'password';
                  const isMultiline = Boolean(field.multiline);
                  const fieldKey = String(field.name);
                  const visible = visibleFields[fieldKey] ?? false;

                  return (
                    <SecurityFormField
                      key={fieldKey}
                      label={field.label}
                      error={error}
                      hint={!error ? field.hint : undefined}
                    >
                      <div className="relative">
                        {isMultiline ? (
                          <textarea
                            placeholder={field.placeholder}
                            aria-invalid={Boolean(error)}
                            rows={4}
                            {...register(field.name)}
                            className={cn(
                              'min-h-[110px] w-full resize-none rounded-[12px] border bg-white px-4 py-3 font-cairo text-[13px] font-bold text-[#101828] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow,background] placeholder:font-semibold placeholder:text-[#98A2B3]',
                              error ? inputInvalidBorder : inputNormalBorder,
                            )}
                          />
                        ) : (
                          <input
                            type={
                              isPassword
                                ? visible
                                  ? 'text'
                                  : 'password'
                                : (field.type ?? 'text')
                            }
                            placeholder={field.placeholder}
                            autoComplete={field.autoComplete}
                            aria-invalid={Boolean(error)}
                            {...register(field.name)}
                            className={cn(
                              inputBaseClass,
                              isPassword ? 'pe-12' : undefined,
                              error ? inputInvalidBorder : inputNormalBorder,
                            )}
                          />
                        )}
                        {isPassword ? (
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleFields((prev) => ({
                                ...prev,
                                [fieldKey]: !visible,
                              }))
                            }
                            className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#667085] transition hover:bg-[#F2F4F7]"
                            aria-label={
                              visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                            }
                          >
                            {visible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        ) : null}
                      </div>
                    </SecurityFormField>
                  );
                })}

                <div className="flex flex-col-reverse gap-3 border-t border-[#EAECF0] pt-5 sm:flex-row sm:justify-end">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      disabled={submitting}
                      className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#F04438] bg-white px-6 font-cairo text-[13px] font-extrabold text-[#F04438] transition hover:bg-[#FFF5F5] disabled:opacity-60"
                    >
                      إلغاء
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_14px_24px_rgba(15,143,139,0.22)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {submitLabel}
                  </button>
                </div>
              </form>
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
