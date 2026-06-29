"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAdminContent } from "@/hooks/admin/content/useAdminContent";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { useToast } from "@/components/ui/ToastProvider";
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from "@/components/doctor/profile-settings/doctor-profile-form-field";
import StyledSelect from "@/components/ui/styled-select";
import { cn } from "@/lib/utils/utils";
import type { AdminContentBlock, AdminContentType } from "@/lib/admin/types";

/** جسم مبدئي تتوافق مع الـ API ويتجنّب أعطال التحقق عندما يتوقع الخادم مصفوفة بلوكات. */
const DRAFT_CONTENT_BLOCKS: AdminContentBlock[] = [
  { type: "heading", level: 2, text: "نظرة عامة" },
  {
    type: "paragraph",
    text: "أكمل تفاصيل المقال لاحقاً من صفحة عرض أو تحرير المحتوى.",
  },
];

const formSchema = z
  .object({
    type: z.enum([
      "CONDITION",
      "SYMPTOM",
      "GENERAL_ADVICE",
      "NEWS",
      "MEDICATION",
      "SETTINGS_PAGE",
    ]),
    title: z.string().min(1, "عنوان المحتوى مطلوب"),
    summary: z.string().optional(),
    language: z.enum(["ar", "en"]),
    slug: z
      .string()
      .optional()
      .refine((s) => !s || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s), {
        message: "المعرّف: أحرف لاتينية صغيرة وأرقام وشرطات",
      }),
    pageVersion: z.string().optional(),
  })
  .refine((data) => data.type !== "SETTINGS_PAGE" || data.pageVersion?.trim(), {
    message: "إصدار الصفحة مطلوب لصفحات الإعدادات",
    path: ["pageVersion"],
  });

type FormValues = z.infer<typeof formSchema>;

const typeOptions: { value: AdminContentType; label: string }[] = [
  { value: "CONDITION", label: "الحالات الطبية" },
  { value: "SYMPTOM", label: "الأعراض" },
  { value: "GENERAL_ADVICE", label: "نصائح عامة" },
  { value: "NEWS", label: "الأخبار" },
  { value: "MEDICATION", label: "الأدوية" },
  { value: "SETTINGS_PAGE", label: "صفحات الإعدادات" },
];

const EMPTY_FORM: FormValues = {
  type: "GENERAL_ADVICE",
  title: "",
  summary: "",
  language: "ar",
  slug: "",
  pageVersion: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateAdminContentDialog({
  open,
  onOpenChange,
}: Props) {
  const { toast } = useToast();
  const createMut = useCreateAdminContent();
  const submitting = createMut.isPending;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!open) {
      reset(EMPTY_FORM);
      createMut.reset();
    }
  }, [open, reset, createMut]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onOpenChange(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, submitting]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await createMut.mutateAsync({
        type: v.type,
        title: v.title.trim(),
        summary: v.summary?.trim() || undefined,
        language: v.language,
        slug: v.slug?.trim() || undefined,
        pageVersion: v.pageVersion?.trim() || undefined,
        contentBlocks: DRAFT_CONTENT_BLOCKS,
      });
      toast(
        `أُضيفت مسودة «${v.title.trim()}» إلى المحتوى الطبي. أكمل التحرير والمراجعة والنشر من نفس الصفحة.`,
        {
          title: "تم إضافة المحتوى",
          variant: "success",
          durationMs: 4200,
        },
      );
      onOpenChange(false);
    } catch {
      // الخطأ يظهر عبر createMut.isError ورسالة الـ API
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="إضافة محتوى طبي"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              onOpenChange(false);
            }
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[640px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-80"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  إضافة محتوى طبي
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]">
                  أنشئ مسودة محتوى جديدة ثم أكمل التحرير والمراجعة والنشر
                  لاحقاً.
                </p>
              </div>
            </div>

            <form dir="rtl" onSubmit={onSubmit}>
              <div className="max-h-[calc(92vh-240px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <DoctorProfileFormField label="نوع المحتوى" required>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <StyledSelect
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          options={typeOptions}
                          placeholder="اختر نوع المحتوى"
                          listboxAriaLabel="نوع المحتوى"
                        />
                      )}
                    />
                  </DoctorProfileFormField>

                  <DoctorProfileFormField
                    label="العنوان"
                    required
                    error={errors.title?.message}
                  >
                    <input
                      {...register("title")}
                      placeholder="عنوان واضح للمحتوى"
                      className={profileFieldClass(
                        cn(
                          profileInputClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.title),
                      )}
                    />
                  </DoctorProfileFormField>

                  <DoctorProfileFormField
                    label="ملخص"
                    error={errors.summary?.message}
                  >
                    <textarea
                      {...register("summary")}
                      rows={3}
                      placeholder="مقدمة قصيرة تصف المحتوى…"
                      className={profileFieldClass(
                        cn(
                          profileTextareaClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.summary),
                      )}
                    />
                  </DoctorProfileFormField>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DoctorProfileFormField
                      label="اللغة"
                      required
                      error={errors.language?.message}
                    >
                      <Controller
                        name="language"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            options={[
                              { value: "ar", label: "العربية" },
                              { value: "en", label: "English" },
                            ]}
                            placeholder="اختر اللغة"
                            listboxAriaLabel="لغة المحتوى"
                          />
                        )}
                      />
                    </DoctorProfileFormField>

                    <DoctorProfileFormField
                      label="Slug (اختياري)"
                      error={errors.slug?.message}
                    >
                      <input
                        {...register("slug")}
                        dir="ltr"
                        placeholder="my-article"
                        className={profileFieldClass(
                          cn(profileInputClass),
                          Boolean(errors.slug),
                        )}
                      />
                    </DoctorProfileFormField>

                    <DoctorProfileFormField
                      label="إصدار الصفحة (اختياري)"
                      hint="مطلوب لاعتماد صفحات الإعدادات (SETTINGS_PAGE)."
                      error={errors.pageVersion?.message}
                    >
                      <input
                        {...register("pageVersion")}
                        dir="ltr"
                        placeholder="v1"
                        className={profileFieldClass(
                          cn(profileInputClass),
                          Boolean(errors.pageVersion),
                        )}
                      />
                    </DoctorProfileFormField>
                  </div>

                  {createMut.isError ? (
                    <div className="rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[12px] font-bold text-red-600">
                      {userFacingErrorMessage(createMut.error, "تعذّر الإنشاء")}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {submitting ? "جارٍ الحفظ…" : "حفظ كمسودة"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
