import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Settings, Plus, Edit, Check, Loader2 } from 'lucide-react';
import {
  useServiceTypesList,
  useMutateServiceType,
} from '@/hooks/useAdminServices';
import type { ServiceType } from '@/lib/admin/services/types';
import { resolveLabel } from '@/lib/admin/services/types';
import {
  UpsertServiceTypeDialog,
  ServiceTypeStatusConfirmDialog,
  ServiceTypeActiveToggle,
} from '@/components/admin/service-types';

export default function AdminServiceTypesPage() {
  const { data, isLoading, isError, error, refetch } = useServiceTypesList();
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<ServiceType | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate'>(
    'deactivate',
  );
  const updateMut = useMutateServiceType();

  const serviceTypes = data?.serviceTypes ?? [];

  function openCreate() {
    setEditTarget(null);
    setUpsertOpen(true);
  }

  function openEdit(s: ServiceType) {
    setEditTarget(s);
    setUpsertOpen(true);
  }

  function openDeactivateConfirm(s: ServiceType) {
    setConfirmTarget(s);
    setConfirmAction('deactivate');
    setConfirmOpen(true);
  }

  function openActivateConfirm(s: ServiceType) {
    setConfirmTarget(s);
    setConfirmAction('activate');
    setConfirmOpen(true);
  }

  async function handleStatusConfirm() {
    if (!confirmTarget) return;
    const next = confirmAction === 'activate';
    await updateMut.mutateAsync({
      id: confirmTarget._id,
      body: { isActive: next },
    });
    setConfirmOpen(false);
    setConfirmTarget(null);
  }

  return (
    <>
      <Helmet>
        <title>أنواع الخدمات • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              أنواع الخدمات
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة أنواع الخدمات والـ schema الديناميكي (مربوط بالـ API)
            </div>
          </div>

          <button
            type='button'
            onClick={openCreate}
            className='inline-flex h-[40px] items-center justify-center gap-2 self-start rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.2)] transition hover:brightness-105'
          >
            <Plus className='h-4 w-4' />
            إضافة نوع خدمة
          </button>
        </div>

        {isLoading && (
          <div className='mt-8 flex items-center justify-center gap-2 rounded-[12px] border border-[#EEF2F6] bg-white py-16 font-cairo text-[14px] font-semibold text-[#667085]'>
            <Loader2 className='h-5 w-5 shrink-0 animate-spin text-primary' />
            جاري التحميل…
          </div>
        )}

        {isError && (
          <div className='mt-6 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-right'>
            <p className='font-cairo text-[13px] font-bold text-red-800'>
              تعذر تحميل الأنواع.
            </p>
            <p className='mt-1 font-cairo text-[12px] text-red-700'>
              {(error as Error)?.message ?? '—'}
            </p>
            <button
              type='button'
              onClick={() => void refetch()}
              className='mt-2 font-cairo text-[12px] font-extrabold text-primary underline'
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <section className='mt-6 overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            {serviceTypes.length === 0 ? (
              <p className='px-6 py-12 text-center font-cairo text-[14px] font-semibold text-[#98A2B3]'>
                لا توجد أنواع خدمات بعد. استخدم «إضافة نوع خدمة».
              </p>
            ) : (
              <div className='divide-y divide-[#EEF2F6]'>
                {serviceTypes.map((s) => {
                  const title = resolveLabel(
                    typeof s.name === 'string'
                      ? { en: s.name, ar: s.name }
                      : s.name,
                    'ar',
                  );
                  const nFields = s.fields?.length ?? 0;
                  return (
                    <div
                      key={s._id}
                      className='flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6'
                    >
                      <div className='min-w-0 flex-1 text-right'>
                        <div className='flex items-start gap-2 sm:items-center'>
                          <button
                            type='button'
                            onClick={() => openEdit(s)}
                            className='mt-0.5 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[6px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)] transition hover:brightness-105'
                            aria-label='الحقول'
                          >
                            <Settings className='h-5 w-5' />
                          </button>
                          <div className='min-w-0'>
                            <div className='font-cairo text-[14px] font-black text-[#111827]'>
                              {title || '—'}
                            </div>
                            <div className='mt-2 break-all font-cairo text-[12px] font-bold text-[#98A2B3]'>
                              <span dir='ltr' className='inline text-[#0F8F8B]'>
                                {s.slug}
                              </span>
                              <span className='mx-2'>•</span>
                              {nFields} حقل
                              <span className='mx-2'>•</span>
                              v{s.schemaVersion ?? '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/*
                        ترتيب DOM في RTL: التعديل يظهر يمين المجموعة، التوغل أقصى يسار الصف
                        (قرب منتصف السطر) كما في التصميم المرفوع
                      */}
                      <div className='flex items-center justify-end gap-2 sm:gap-3'>
                        <button
                          type='button'
                          onClick={() => openEdit(s)}
                          className='flex h-9 w-9 items-center justify-center rounded-[10px] text-primary transition hover:bg-[#E7FBFA]'
                          aria-label='تعديل'
                        >
                          <Edit className='h-4 w-4' />
                        </button>
                        <ServiceTypeActiveToggle
                          isActive={s.isActive}
                          disabled={updateMut.isPending}
                          onRequestToggle={() =>
                            s.isActive
                              ? openDeactivateConfirm(s)
                              : openActivateConfirm(s)
                          }
                        />
                        {s.isActive ? (
                          <span className='ms-1 inline-flex h-[24px] items-center gap-1.5 rounded-[10px] bg-[#DCFCE7] px-3 font-cairo text-[12px] font-extrabold text-[#16A34A]'>
                            <Check className='h-4 w-4' />
                            نشط
                          </span>
                        ) : (
                          <span className='ms-1 inline-flex h-[24px] items-center gap-1.5 rounded-[10px] bg-[#F3F4F6] px-3 font-cairo text-[12px] font-extrabold text-[#6B7280]'>
                            معطّل
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <UpsertServiceTypeDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        editTarget={editTarget}
        onSuccess={() => void refetch()}
      />

      <ServiceTypeStatusConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) setConfirmTarget(null);
        }}
        serviceType={confirmTarget}
        action={confirmAction}
        onConfirm={handleStatusConfirm}
        isPending={updateMut.isPending}
      />
    </>
  );
}
