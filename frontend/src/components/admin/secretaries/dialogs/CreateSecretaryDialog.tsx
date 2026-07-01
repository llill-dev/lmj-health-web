'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Lock, Shield, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import StyledSelect from '@/components/ui/styled-select';
import { AppCheckbox } from '@/components/ui';

const GENDER_OPTIONS = [
  { value: 'Male', label: 'ذكر' },
  { value: 'Female', label: 'أنثى' },
];

const PERMISSION_OPTIONS = [
  { value: 'appointments', label: 'إدارة المواعيد' },
  { value: 'patients', label: 'إدارة المرضى' },
  { value: 'prescriptions', label: 'إدارة الوصفات' },
  { value: 'medical_records', label: 'السجلات الطبية' },
  { value: 'billing', label: 'الفواتير والدفع' },
  { value: 'reports', label: 'التقارير' },
];

interface CreateSecretaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateSecretaryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSecretaryDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    permissions: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صالح';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'يجب اختيار صلاحية واحدة على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await adminApi.secretaries.create({
      //   fullName: formData.fullName,
      //   email: formData.email,
      //   password: formData.password,
      //   phone: formData.phone,
      //   gender: formData.gender,
      //   permissions: formData.permissions.join(','),
      // });

      toast('تم إنشاء حساب السكرتير بنجاح', {
        title: 'تم الإنشاء',
        variant: 'success',
        durationMs: 4200,
      });

      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        gender: 'Male',
        permissions: [],
      });
      setErrors({});
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.', {
        title: 'فشلت العملية',
        variant: 'error',
        durationMs: 4200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: '' }));
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-white rounded-[16px] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                      إنشاء حساب سكرتير جديد
                    </Dialog.Title>
                    <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      أدخل بيانات السكرتير لإنشاء حساب جديد
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB]">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    الاسم الكامل *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      placeholder="أدخل الاسم الكامل"
                      className={`w-full h-[44px] rounded-[10px] border bg-white pe-10 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                        errors.fullName ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, email: e.target.value }));
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="example@email.com"
                      className={`w-full h-[44px] rounded-[10px] border bg-white pe-10 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                        errors.email ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, password: e.target.value }));
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      placeholder="••••••••"
                      className={`w-full h-[44px] rounded-[10px] border bg-white pe-10 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                        errors.password ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    رقم الهاتف *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, phone: e.target.value }));
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="+963944000000"
                      className={`w-full h-[44px] rounded-[10px] border bg-white pe-10 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                        errors.phone ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    الجنس *
                  </label>
                  <StyledSelect
                    value={formData.gender}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, gender: value }))
                    }
                    options={GENDER_OPTIONS}
                    placeholder="اختر الجنس"
                    size="sm"
                    tone="muted"
                  />
                </div>

                {/* Permissions */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    الصلاحيات *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PERMISSION_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 rounded-[8px] border px-3 py-2 cursor-pointer transition ${
                          formData.permissions.includes(option.value)
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-[#E5E7EB] bg-white text-[#667085] hover:border-[#D1D5DB]'
                        }`}
                      >
                        <AppCheckbox
                          size="sm"
                          checked={formData.permissions.includes(option.value)}
                          onChange={() => togglePermission(option.value)}
                        />
                        <span className="font-cairo text-[12px] font-bold">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.permissions && (
                    <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                      {errors.permissions}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[12px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB]"
                    >
                      إلغاء
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-primary bg-primary font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
