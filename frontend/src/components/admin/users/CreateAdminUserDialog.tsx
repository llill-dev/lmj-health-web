"use client";

import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  X,
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import StyledSelect from "@/components/ui/styled-select";
import { useToast } from "@/components/ui/ToastProvider";
import { useCreateAdminUser } from "@/hooks/admin/users/useAdminUsers";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import type { CreateAdminUserBody } from "@/lib/admin/types";
import { cn } from "@/lib/utils/utils";
import {
  PHONE_DIAL_CODE_OPTIONS,
  type PhoneDialCode,
} from "@/lib/phone/dialCodes";

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schema - Professional validation matching backend requirements
// ─────────────────────────────────────────────────────────────────────────────

const createAdminUserSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "الاسم يجب أن يكون حرفين على الأقل")
      .max(100, "الاسم يجب أن لا يتجاوز 100 حرف")
      .trim()
      .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, "الاسم يجب أن يحتوي على أحرف فقط"),

    email: z
      .string()
      .min(1, "البريد الإلكتروني مطلوب")
      .email("البريد الإلكتروني غير صالح")
      .max(255, "البريد الإلكتروني طويل جداً")
      .toLowerCase()
      .trim(),

    phoneDialCode: z.enum(
      PHONE_DIAL_CODE_OPTIONS.map((o) => o.value) as [
        PhoneDialCode,
        ...PhoneDialCode[],
      ],
      {
        message: "رمز النداء غير مدعوم",
      },
    ),
    phoneLocal: z
      .string()
      .min(1, "رقم الهاتف مطلوب")
      .max(9, "رقم الهاتف طويل جداً")
      .regex(/^\d+$/, "رقم الهاتف يجب أن يحتوي على أرقام فقط"),

    password: z
      .string()
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      .max(128, "كلمة المرور طويلة جداً")
      .regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل")
      .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل")
      .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل")
      .regex(/[^a-zA-Z0-9]/, "كلمة المرور يجب أن تحتوي على رمز واحد على الأقل"),

    role: z.enum(["data_entry"]),
  })
  .strict();

type CreateAdminUserFormValues = z.infer<typeof createAdminUserSchema>;

const DEFAULT_VALUES: CreateAdminUserFormValues = {
  fullName: "",
  email: "",
  phoneDialCode: "+963",
  phoneLocal: "",
  password: "",
  role: "data_entry",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface CreateAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAdminUserDialog({
  open,
  onOpenChange,
}: CreateAdminUserDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateAdminUser();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateAdminUserFormValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const inputClass =
    "h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]";

  const labelClass =
    "mb-1.5 block font-cairo text-[12px] font-bold text-[#344054]";

  const errorClass = "mt-1 font-cairo text-[11px] font-bold text-[#D92D20]";

  async function onSubmit(values: CreateAdminUserFormValues) {
    const payload: CreateAdminUserBody = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
      phoneNumber: `${values.phoneDialCode}${values.phoneLocal}`,
    };

    try {
      await createMutation.mutateAsync(payload);
      toast("تم إنشاء حساب إداري جديد بنجاح.", {
        title: "تمت الإضافة",
        variant: "success",
      });
      reset(DEFAULT_VALUES);
      onOpenChange(false);
    } catch (error) {
      toast(userFacingErrorMessage(error), {
        title: "تعذّر إنشاء الحساب",
        variant: "error",
      });
    }
  }

  useEffect(() => {
    if (!open) {
      reset(DEFAULT_VALUES);
      createMutation.reset();
      setShowPassword(false);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !createMutation.isPending) onOpenChange(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, createMutation.isPending]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="إنشاء مستخدم إدارة"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !createMutation.isPending)
              onOpenChange(false);
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[600px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header - Matching facility dialog design */}
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  إنشاء مستخدم إدارة
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
                  قم بملء البيانات التالية لإنشاء حساب إداري جديد في النظام
                </p>
              </div>
            </div>

            {/* Form */}
            <form dir="rtl" onSubmit={handleSubmit(onSubmit)}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className={labelClass}>
                      الاسم الكامل
                      <span className="mr-1 text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        id="fullName"
                        {...register("fullName")}
                        className={cn(inputClass, "pl-10")}
                        placeholder="أدخل الاسم الكامل للمستخدم"
                        disabled={createMutation.isPending}
                      />
                    </div>
                    {errors.fullName && (
                      <p className={errorClass}>{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      البريد الإلكتروني
                      <span className="mr-1 text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        id="email"
                        {...register("email")}
                        className={cn(inputClass, "pl-10")}
                        placeholder="name@example.com"
                        dir="ltr"
                        disabled={createMutation.isPending}
                      />
                    </div>
                    {errors.email && (
                      <p className={errorClass}>{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneLocal" className={labelClass}>
                      رقم الهاتف
                      <span className="mr-1 text-[#DC2626]">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Controller
                        name="phoneDialCode"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            {...field}
                            options={PHONE_DIAL_CODE_OPTIONS as any}
                            size="sm"
                            tone="muted"
                            disabled={createMutation.isPending}
                            className="w-[140px] shrink-0"
                          />
                        )}
                      />
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                          id="phoneLocal"
                          {...register("phoneLocal")}
                          className={cn(inputClass, "pl-10")}
                          placeholder="912345678"
                          dir="ltr"
                          inputMode="numeric"
                          maxLength={9}
                          disabled={createMutation.isPending}
                        />
                      </div>
                    </div>
                    {errors.phoneDialCode && (
                      <p className={errorClass}>
                        {errors.phoneDialCode.message}
                      </p>
                    )}
                    {errors.phoneLocal && (
                      <p className={errorClass}>{errors.phoneLocal.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className={labelClass}>
                      كلمة المرور
                      <span className="mr-1 text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-10 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        id="password"
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        className={cn(inputClass, "pl-10 pr-10")}
                        placeholder="••••••••"
                        dir="ltr"
                        disabled={createMutation.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] transition hover:text-[#111827]"
                        disabled={createMutation.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className={errorClass}>{errors.password.message}</p>
                    )}
                    {/* Password Requirements */}
                    <div className="mt-2 space-y-1">
                      <p className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                        يجب أن تحتوي كلمة المرور على:
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>8 أحرف على الأقل
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>
                        حرف كبير واحد على الأقل (A-Z)
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>
                        حرف صغير واحد على الأقل (a-z)
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>
                        رقم واحد على الأقل (0-9)
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>
                        رمز واحد على الأقل (!@#$%^&*)
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className={labelClass}>
                      الدور
                      <span className="mr-1 text-[#DC2626]">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="role"
                      render={({ field }) => (
                        <StyledSelect
                          id="role"
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            {
                              value: "data_entry",
                              label: "مدخل بيانات (Data Entry)",
                            },
                          ]}
                          placeholder="اختر الدور"
                          disabled={createMutation.isPending}
                          error={Boolean(errors.role)}
                          size="sm"
                          tone="muted"
                        />
                      )}
                    />
                    {errors.role && (
                      <p className={errorClass}>{errors.role.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer - Matching facility dialog design */}
              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="w-4 h-4" aria-hidden />
                  {createMutation.isPending ? "جارٍ الحفظ…" : "حفظ"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
