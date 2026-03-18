import { Helmet } from 'react-helmet-async';
import { Pencil, Settings, Trash2, Plus, Check, Edit } from 'lucide-react';

type ServiceType = {
  id: string;
  title: string;
  requiredFields: number;
  providersCount: number;
  active: boolean;
};

export default function AdminServiceTypesPage() {
  const serviceTypes: ServiceType[] = [
    {
      id: '1',
      title: 'مختبرات التحاليل',
      requiredFields: 8,
      providersCount: 45,
      active: true,
    },
    {
      id: '2',
      title: 'مراكز الأشعة',
      requiredFields: 12,
      providersCount: 32,
      active: true,
    },
    {
      id: '3',
      title: 'الصيدليات',
      requiredFields: 6,
      providersCount: 128,
      active: true,
    },
    {
      id: '4',
      title: 'المشافي',
      requiredFields: 15,
      providersCount: 67,
      active: true,
    },
    {
      id: '5',
      title: 'العيادات',
      requiredFields: 10,
      providersCount: 234,
      active: true,
    },
  ];

  return (
    <>
      <Helmet>
        <title>أنواع الخدمات • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              أنواع الخدمات
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة أنواع الخدمات والحقول المطلوبة
            </div>
          </div>

          <button
            type='button'
            className='inline-flex h-[36px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.20)]'
          >
            <Plus className='h-4 w-4' />
            إضافة نوع خدمة
          </button>
        </div>

        <section className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='divide-y divide-[#EEF2F6]'>
            {serviceTypes.map((s) => (
              <div
                key={s.id}
                className='flex items-center justify-between px-6 py-6'
              >
                <div className='flex-1 text-right'>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      className='flex h-[38px] w-[38px] items-center justify-center rounded-[6px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)]'
                      aria-label='إعدادات'
                    >
                      <Settings className='h-5 w-5' />
                    </button>
                    <div className=''>
                      <div className='font-cairo text-[14px] font-black text-[#111827]'>
                        {s.title}
                      </div>
                      <div className='mt-2 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                        {s.requiredFields} حقل مطلوب
                        <span className='mx-2'>•</span>
                        {s.providersCount} مزود
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#EF4444]'
                    aria-label='حذف'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                  <button
                    type='button'
                    className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-primary'
                    aria-label='تعديل'
                  >
                    <Edit className='h-4 w-4' />
                  </button>

                  {s.active ? (
                    <span className='ms-2 inline-flex h-[24px] items-center gap-2 rounded-[10px] bg-[#DCFCE7] px-3 font-cairo text-[12px] font-extrabold text-[#16A34A]'>
                      <Check className='h-4 w-4' />
                      نشط
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
