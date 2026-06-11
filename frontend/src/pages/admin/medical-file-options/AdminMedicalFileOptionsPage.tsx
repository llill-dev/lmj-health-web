import { Helmet } from 'react-helmet-async';
import {
  AlertTriangle,
  Droplets,
  FileCog,
  Heart,
  Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import { MedicalFileOptionCard } from '@/components/admin/medical-file-options/MedicalFileOptionCard';
import StyledSelect from '@/components/ui/styled-select';

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
        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title='خيارات الملف الطبي'
          subtitle='إضافة وإدارة الخيارات ضمن الملف الطبي للمريض'
          headerIcon={<FileCog className='h-8 w-8 text-white' />}
          kpiColumns={3}
          kpis={[
            {
              key: 'chronic',
              icon: <Heart className='h-5 w-5 shrink-0' />,
              value: chronicDiseases.length,
              label: 'أمراض مزمنة',
            },
            {
              key: 'allergies',
              icon: <AlertTriangle className='h-5 w-5 shrink-0' />,
              value: allergies.length,
              label: 'أنواع حساسية',
            },
            {
              key: 'blood',
              icon: <Droplets className='h-5 w-5 shrink-0' />,
              value: bloodTypes.length,
              label: 'فصائل دم',
            },
          ]}
        />

        <div>
          <div className='mt-2 grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <MedicalFileOptionCard
              title='الأمراض المزمنة'
              items={chronicDiseases}
              icon={Heart}
              addLabel='إضافة مرض'
              tone={{
                border: 'border-[#16C5C0]',
                headerBg: 'bg-[#E7FBFA]',
                titleText: 'text-primary',
                itemBg: 'bg-[#EFF6FF]',
                itemText: 'text-[#667085]',
                addText: 'text-primary',
              }}
            />
            <MedicalFileOptionCard
              title='أنواع الحساسية'
              items={allergies}
              icon={AlertTriangle}
              addLabel='إضافة حساسية'
              tone={{
                border: 'border-[#F59E0B]',
                headerBg: 'bg-[#FFF7ED]',
                titleText: 'text-[#F97316]',
                itemBg: 'bg-[#FFF7ED]',
                itemText: 'text-[#667085]',
                addText: 'text-[#F97316]',
              }}
            />
            <MedicalFileOptionCard
              title='فصائل الدم'
              items={bloodTypes}
              icon={Droplets}
              addLabel='إضافة فصيلة'
              variant='chips'
              tone={{
                border: 'border-[#FCA5A5]',
                headerBg: 'bg-[#FFF1F2]',
                titleText: 'text-[#EF4444]',
                itemBg: 'bg-[#FFE4E6]',
                itemText: 'text-[#EF4444]',
                addText: 'text-[#EF4444]',
              }}
            />
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
                <StyledSelect
                  value={selectedCategory}
                  onChange={(v) =>
                    setSelectedCategory(
                      v as
                        | 'الأمراض المزمنة'
                        | 'أنواع الحساسية'
                        | 'فصائل الدم',
                    )
                  }
                  options={[
                    { value: 'الأمراض المزمنة', label: 'الأمراض المزمنة' },
                    { value: 'أنواع الحساسية', label: 'أنواع الحساسية' },
                    { value: 'فصائل الدم', label: 'فصائل الدم' },
                  ]}
                  listboxAriaLabel='فئة الخيار'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
