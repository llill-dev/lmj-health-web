import { Helmet } from 'react-helmet-async';
import {
  AlertTriangle,
  Droplets,
  FileCog,
  Heart,
  Plus,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export default function AdminMedicalFileOptionsPage() {
  const chronicDiseases = useMemo(
    () => ['السكري', 'الضغط', 'القلب', 'الربو', 'الكلى', 'الكبد'],
    [],
  );
  const allergies = useMemo(
    () => ['البنسلين', 'اللبان', 'الأسبرين', 'المكسرات', 'الحليب', 'القمح'],
    [],
  );
  const bloodTypes = useMemo(
    () => ['AB+', 'B-', 'B+', 'A-', 'A+', 'O-', 'O+', 'AB-'],
    [],
  );

  const [selectedCategory, setSelectedCategory] = useState<
    'الأمراض المزمنة' | 'أنواع الحساسية' | 'فصائل الدم'
  >('الأمراض المزمنة');
  const [newOption, setNewOption] = useState('');

  return (
    <>
      <Helmet>
        <title>خيارات الملف الطبي • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div>
          <div className='text-right'>
            <div className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>
              خيارات الملف الطبي
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[16px] text-[#667085]'>
              إضافة وإدارة الخيارات ضمن الملف الطبي للمريض
            </div>
          </div>

          <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <div className='rounded-[10px] border border-[#16C5C0] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)]'>
              <div className='flex items-center justify-between rounded-t-[10px] bg-[#E7FBFA] px-5 py-4'>
                <div className='font-cairo text-[14px] font-extrabold text-primary'>
                  الأمراض المزمنة
                </div>
                <Heart className='h-5 w-5 text-primary' />
              </div>

              <div className='px-5 py-4'>
                <div className='space-y-2'>
                  {chronicDiseases.map((d) => (
                    <div
                      key={d}
                      className='flex h-[40px] items-center justify-between rounded-[6px] bg-[#EFF6FF] px-4'
                    >
                      <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                        {d}
                      </div>
                      <button
                        type='button'
                        className='flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#EF4444]'
                        aria-label='حذف'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type='button'
                  className='mt-4 inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] font-cairo text-[12px] font-extrabold text-primary'
                >
                  <Plus className='h-4 w-4' />
                  إضافة مرض
                </button>
              </div>
            </div>

            <div className='rounded-[10px] border border-[#F59E0B] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)]'>
              <div className='flex items-center justify-between rounded-t-[10px] bg-[#FFF7ED] px-5 py-4'>
                <div className='font-cairo text-[14px] font-extrabold text-[#F97316]'>
                  أنواع الحساسية
                </div>
                <AlertTriangle className='h-5 w-5 text-[#F97316]' />
              </div>

              <div className='px-5 py-4'>
                <div className='space-y-2'>
                  {allergies.map((a) => (
                    <div
                      key={a}
                      className='flex h-[40px] items-center justify-between rounded-[6px] bg-[#FFF7ED] px-4'
                    >
                      <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                        {a}
                      </div>
                      <button
                        type='button'
                        className='flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#EF4444]'
                        aria-label='حذف'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type='button'
                  className='mt-4 inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] font-cairo text-[12px] font-extrabold text-[#F97316]'
                >
                  <Plus className='h-4 w-4' />
                  إضافة حساسية
                </button>
              </div>
            </div>

            <div className='rounded-[10px] border border-[#FCA5A5] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)]'>
              <div className='flex items-center justify-between rounded-t-[10px] bg-[#FFF1F2] px-5 py-4'>
                <div className='font-cairo text-[14px] font-extrabold text-[#EF4444]'>
                  فصائل الدم
                </div>
                <Droplets className='h-5 w-5 text-[#EF4444]' />
              </div>

              <div className='px-5 py-4'>
                <div className='flex flex-1 flex-wrap justify-end gap-2'>
                  {bloodTypes.map((b) => (
                    <span
                      key={b}
                      className='inline-flex h-[28px] items-center justify-center rounded-[8px] bg-[#FFE4E6] px-3 font-cairo text-[12px] font-extrabold text-[#EF4444]'
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <button
                  type='button'
                  className='mt-4 inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] font-cairo text-[12px] font-extrabold text-[#EF4444]'
                >
                  <Plus className='h-4 w-4' />
                  إضافة فصيلة
                </button>
              </div>
            </div>
          </div>

          <div className='mt-6 rounded-[10px] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.18)]'>
            <div className='flex items-center gap-2 justify-start'>
              <FileCog className='h-5 w-5 text-primary' />
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                إدارة الخيارات
              </div>
            </div>

            <div className='mt-6 grid grid-cols-1 items-center gap-4 lg:grid-cols-12'>
              <div className='lg:col-span-5'>
                <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                  إضافة خيار جديد
                </div>
                <input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder='ادخل الخيار الجديد...'
                  className='h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
                />
              </div>

              <div className='mt-6 lg:col-span-1'>
                <button
                  type='button'
                  className='mx-auto flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-primary text-white'
                  aria-label='إضافة'
                >
                  <Plus className='h-5 w-5' />
                </button>
              </div>

              <div className='lg:col-span-6'>
                <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                  اختر الفئة
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value as
                        | 'الأمراض المزمنة'
                        | 'أنواع الحساسية'
                        | 'فصائل الدم',
                    )
                  }
                  className='h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827]'
                >
                  <option value='الأمراض المزمنة'>الأمراض المزمنة</option>
                  <option value='أنواع الحساسية'>أنواع الحساسية</option>
                  <option value='فصائل الدم'>فصائل الدم</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
