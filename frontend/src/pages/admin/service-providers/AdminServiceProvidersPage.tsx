import { Helmet } from 'react-helmet-async';
import {
  Building2,
  ChevronLeft,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import StyledSelect from '@/components/ui/styled-select';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useServiceProvidersList,
  useServiceTypesList,
  useUpdateProviderStatus,
} from '@/hooks/admin/services/useAdminServices';
import type { ProviderStatus, ServiceProvider } from '@/lib/admin/types';
import { resolveLabel } from '@/lib/admin/types';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';

function resolveProviderSlug(provider: ServiceProvider): string {
  if (typeof provider.serviceType === 'string') return provider.serviceType;
  return provider.serviceType?.slug ?? '';
}

function resolveProviderLabel(provider: ServiceProvider): string {
  const data = provider.data ?? {};
  const name = data.name;
  if (typeof name === 'string' && name.trim()) return name.trim();
  if (name && typeof name === 'object') {
    const localized = name as { ar?: string; en?: string };
    return localized.ar?.trim() || localized.en?.trim() || '—';
  }
  const city = data.city;
  if (typeof city === 'string' && city.trim()) return city.trim();
  return provider._id;
}

const STATUS_LABELS: Record<ProviderStatus, string> = {
  active: 'نشط',
  inactive: 'معطّل',
  draft: 'مسودة',
};

export default function AdminServiceProvidersPage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSlug = searchParams.get('type') ?? '';
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const typesQuery = useServiceTypesList();
  const providersQuery = useServiceProvidersList(selectedSlug, cursor);
  const statusMutation = useUpdateProviderStatus();

  const serviceTypes = typesQuery.data?.serviceTypes ?? [];
  const providers = providersQuery.data?.items ?? [];

  const typeOptions = useMemo(
    () =>
      serviceTypes.map((type) => ({
        value: type.slug,
        label: resolveLabel(type.name, 'ar') || type.slug,
      })),
    [serviceTypes],
  );

  const selectedTypeName = useMemo(() => {
    const match = serviceTypes.find((type) => type.slug === selectedSlug);
    return match ? resolveLabel(match.name, 'ar') : selectedSlug;
  }, [selectedSlug, serviceTypes]);

  async function handleToggleStatus(provider: ServiceProvider) {
    const nextStatus: ProviderStatus =
      provider.status === 'active' ? 'inactive' : 'active';
    if (provider.status === 'draft' && nextStatus === 'inactive') return;

    setTogglingId(provider._id);
    try {
      await statusMutation.mutateAsync({
        id: provider._id,
        status: nextStatus,
      });
      toast(
        nextStatus === 'active'
          ? 'تم تفعيل مزود الخدمة.'
          : 'تم تعطيل مزود الخدمة.',
        { variant: 'success' },
      );
      await providersQuery.refetch();
    } catch (error) {
      toast(userFacingErrorMessage(error), {
        title: 'تعذّر تحديث الحالة',
        variant: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <Helmet>
        <title>مزودو الخدمة • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <Link
          to='/admin/service-types'
          className='mb-5 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary'
        >
          <ChevronLeft className='h-4 w-4' />
          العودة إلى أنواع الخدمات
        </Link>

        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title='مزودو الخدمة'
          subtitle={
            selectedSlug
              ? `نوع الخدمة: ${selectedTypeName}`
              : 'اختر نوع خدمة لعرض المزودين'
          }
          headerIcon={<Building2 className='h-8 w-8 text-white' />}
        />

        <section className='mt-2 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end'>
            <div className='lg:col-span-6'>
              <div className='mb-2 font-cairo text-[12px] font-extrabold text-[#667085]'>
                نوع الخدمة
              </div>
              <StyledSelect
                value={selectedSlug}
                onChange={(value) => {
                  setCursor(undefined);
                  if (value) {
                    setSearchParams({ type: value });
                  } else {
                    setSearchParams({});
                  }
                }}
                options={[
                  { value: '', label: 'اختر نوع الخدمة…' },
                  ...typeOptions,
                ]}
                listboxAriaLabel='نوع الخدمة'
              />
            </div>
            <div className='lg:col-span-6 flex justify-start'>
              <button
                type='button'
                onClick={() => void providersQuery.refetch()}
                disabled={!selectedSlug || providersQuery.isFetching}
                className='inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50'
              >
                <RefreshCw
                  className={`h-4 w-4 ${providersQuery.isFetching ? 'animate-spin' : ''}`}
                />
                تحديث
              </button>
            </div>
          </div>
        </section>

        <section className='mt-4 space-y-3'>
          {!selectedSlug ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
              اختر نوع خدمة من القائمة أعلاه.
            </div>
          ) : providersQuery.isLoading ? (
            <div className='flex items-center justify-center py-16'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : providers.length === 0 ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
              لا يوجد مزودون منشورون لهذا النوع حالياً.
            </div>
          ) : (
            providers.map((provider) => {
              const isActive = provider.status === 'active';
              const canToggle =
                provider.status === 'active' || provider.status === 'inactive';
              return (
                <div
                  key={provider._id}
                  className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]'
                >
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='text-right'>
                      <div className='font-cairo text-[14px] font-black text-[#111827]'>
                        {resolveProviderLabel(provider)}
                      </div>
                      <div className='mt-1 font-cairo text-[12px] font-semibold text-[#667085]'>
                        {resolveProviderSlug(provider) || '—'} ·{' '}
                        {STATUS_LABELS[provider.status]}
                      </div>
                    </div>
                    <button
                      type='button'
                      disabled={!canToggle || togglingId === provider._id}
                      onClick={() => void handleToggleStatus(provider)}
                      className='inline-flex h-[34px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50'
                    >
                      {togglingId === provider._id ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : isActive ? (
                        <ToggleRight className='h-4 w-4 text-primary' />
                      ) : (
                        <ToggleLeft className='h-4 w-4' />
                      )}
                      {isActive ? 'تعطيل' : 'تفعيل'}
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {providersQuery.data?.nextCursor ? (
            <div className='flex justify-center pt-2'>
              <button
                type='button'
                onClick={() =>
                  setCursor(providersQuery.data?.nextCursor ?? undefined)
                }
                className='rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-primary'
              >
                تحميل المزيد
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
