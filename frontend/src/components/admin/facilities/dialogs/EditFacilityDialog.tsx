'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, Building2, MapPin, Phone, FileText, User, Plus, Tag, Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import StyledSelect from '@/components/ui/styled-select';

const FACILITY_TYPE_OPTIONS = [
  { value: 'hospital', label: 'مستشفى' },
  { value: 'clinic', label: 'عيادة' },
  { value: 'laboratory', label: 'مختبر' },
  { value: 'radiology', label: 'أشعة' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'other', label: 'أخرى' },
];

const KIND_OPTIONS = [
  { value: 'public', label: 'حكومي' },
  { value: 'private', label: 'خاص' },
  { value: 'non_profit', label: 'غير ربحي' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'INACTIVE', label: 'معطّل' },
  { value: 'PENDING', label: 'قيد المراجعة' },
];

interface Facility {
  _id: string;
  name?: string;
  city?: string;
  facilityType?: string;
  kind?: string;
  country?: string;
  address?: string;
  phone?: string;
  description?: string;
  ownerDoctorId?: string;
  status?: string;
  attributes?: string[];
}

interface EditFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility: Facility | null;
  doctors: Array<{ _id: string; user?: { fullName?: string } }>;
  onSuccess?: () => void;
}

export default function EditFacilityDialog({
  open,
  onOpenChange,
  facility,
  doctors,
  onSuccess,
}: EditFacilityDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    facilityType: '',
    kind: '',
    country: '',
    address: '',
    phone: '',
    description: '',
    ownerDoctorId: '',
    attributes: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAttribute, setNewAttribute] = useState('');

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor._id,
    label: doctor.user?.fullName || doctor._id,
  }));

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || '',
        city: facility.city || '',
        facilityType: facility.facilityType || '',
        kind: facility.kind || '',
        country: facility.country || '',
        address: facility.address || '',
        phone: facility.phone || '',
        description: facility.description || '',
        ownerDoctorId: facility.ownerDoctorId || '',
        attributes: facility.attributes || [],
      });
      setErrors({});
    }
  }, [facility]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المنشأة مطلوب';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }

    if (!formData.facilityType) {
      newErrors.facilityType = 'يجب اختيار نوع المنشأة';
    }

    if (!formData.kind) {
      newErrors.kind = 'يجب اختيار نوع الملكية';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'البلد مطلوب';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صالح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addAttribute = () => {
    const trimmed = newAttribute.trim();
    if (trimmed && !formData.attributes.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        attributes: [...prev.attributes, trimmed],
      }));
      setNewAttribute('');
    }
  };

  const removeAttribute = (attribute: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((a) => a !== attribute),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facility || !validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await adminApi.facilities.update(facility._id, {
      //   name: formData.name,
      //   city: formData.city,
      //   facilityType: formData.facilityType,
      //   kind: formData.kind,
      //   country: formData.country,
      //   address: formData.address,
      //   phone: formData.phone,
      //   description: formData.description || undefined,
      //   ownerDoctorId: formData.ownerDoctorId || undefined,
      //   attributes: formData.attributes,
      // });

      toast('تم تحديث بيانات المنشأة بنجاح', {
        title: 'تم التحديث',
        variant: 'success',
        durationMs: 4200,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast('حدث خطأ أثناء تحديث البيانات. يرجى المحاولة مرة أخرى.', {
        title: 'فشلت العملية',
        variant: 'error',
        durationMs: 4200,
      });
    } finally {
      setIsSubmitting(false);
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
          >
            <div className="bg-white rounded-[16px] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                      تعديل بيانات المنشأة الطبية
                    </Dialog.Title>
                    <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      قم بتحديث بيانات المنشأة
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB]">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      اسم المنشأة *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, name: e.target.value }));
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="أدخل اسم المنشأة"
                      className={`w-full h-[44px] rounded-[10px] border bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                        errors.name ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      المدينة *
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, city: e.target.value }));
                          if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                        }}
                        placeholder="أدخل المدينة"
                        className={`w-full h-[44px] rounded-[10px] border bg-white pe-10 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                          errors.city ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
                        }`}
                      />
                    </div>
                    {errors.city && (
                      <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* Facility Type */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      نوع المنشأة *
                    </label>
                    <StyledSelect
                      value={formData.facilityType}
                      onChange={(value) => {
                        setFormData((prev) => ({ ...prev, facilityType: value }));
                        if (errors.facilityType) setErrors((prev) => ({ ...prev, facilityType: '' }));
                      }}
                      options={FACILITY_TYPE_OPTIONS}
                      placeholder="اختر نوع المنشأة"
                      size="sm"
                      tone="muted"
                    />
                    {errors.facilityType && (
                      <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.facilityType}
                      </p>
                    )}
                  </div>

                  {/* Kind */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      نوع الملكية *
                    </label>
                    <StyledSelect
                      value={formData.kind}
                      onChange={(value) => {
                        setFormData((prev) => ({ ...prev, kind: value }));
                        if (errors.kind) setErrors((prev) => ({ ...prev, kind: '' }));
                      }}
                      options={KIND_OPTIONS}
                      placeholder="اختر نوع الملكية"
                      size="sm"
                      tone="muted"
                    />
                    {errors.kind && (
                      <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.kind}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                      البلد *
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, country: e.target.value }));
                        if (errors.country) setErrors((prev) => ({ ...prev, country: '' }));
                      }}
                      placeholder="أدخل البلد"
                      className={`w-full h-[44px] rounded-[10px] border bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                        errors.country ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
                      }`}
                    />
                    {errors.country && (
                      <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                        {errors.country}
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
                </div>

                {/* Address */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    العنوان *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, address: e.target.value }));
                      if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                    }}
                    placeholder="أدخل العنوان الكامل"
                    className={`w-full h-[44px] rounded-[10px] border bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                      errors.address ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 font-cairo text-[11px] font-semibold text-[#DC2626]">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="أدخل وصفاً للمنشأة"
                    rows={3}
                    className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
                  />
                </div>

                {/* Owner Doctor */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    الطبيب المالك (اختياري)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                      <User className="h-4 w-4" />
                    </div>
                    <StyledSelect
                      value={formData.ownerDoctorId}
                      onChange={(value) => setFormData((prev) => ({ ...prev, ownerDoctorId: value }))}
                      options={[{ value: '', label: 'بدون طبيب مالك' }, ...doctorOptions]}
                      placeholder="اختر الطبيب المالك"
                      size="sm"
                      tone="muted"
                    />
                  </div>
                </div>

                {/* Attributes */}
                <div>
                  <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                    السمات والخصائص
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newAttribute}
                      onChange={(e) => setNewAttribute(e.target.value)}
                      placeholder="أضف سمة (مثال: طوارئ، ICU)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAttribute();
                        }
                      }}
                      className="flex-1 h-[44px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="h-[44px] w-[44px] flex items-center justify-center rounded-[10px] border border-primary bg-primary text-white transition hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.attributes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.attributes.map((attribute) => (
                        <span
                          key={attribute}
                          className="inline-flex items-center gap-1 rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1.5 font-cairo text-[11px] font-bold text-[#166534]"
                        >
                          <Tag className="h-3 w-3" />
                          {attribute}
                          <button
                            type="button"
                            onClick={() => removeAttribute(attribute)}
                            className="mr-1 text-[#166534] hover:text-[#DC2626] transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
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
                    {isSubmitting ? 'جارٍ التحديث...' : 'حفظ التغييرات'}
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
