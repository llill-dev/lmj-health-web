'use client';

import { Plus, UserCog, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';
import {
  ClinicAccountsSearchRow,
  ClinicAccountsSearchCount,
} from '@/components/doctor/clinic-accounts';
import { DoctorListEmptyIllustration } from '@/components/doctor/shared/doctor-list-empty-illustration';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorExpandableCardSkeleton } from '@/components/doctor/shared/skeletons';
import {
  DoctorSecretaryCard,
  DoctorSecretaryCreateDialog,
  DoctorSecretaryEditDialog,
} from '@/components/doctor/secretaries';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useCreateDoctorSecretary,
  useDoctorSecretaries,
  useUnassignDoctorSecretary,
  useUpdateDoctorSecretary,
} from '@/hooks/doctor/useDoctorSecretaries';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { getSecretaryId } from '@/lib/doctor/secretaries/formUtils';
import { isSecretaryActive } from '@/lib/doctor/secretaries/permissionsUi';
import type {
  DoctorSecretaryCreateFormValues,
  DoctorSecretaryEditFormValues,
} from '@/lib/doctor/secretaries/schema';
import { MAX_DOCTOR_SECRETARIES } from '@/lib/doctor/secretaries/schema';
import type {
  DoctorSecretary,
  SecretaryStatusFilter,
} from '@/lib/doctor/secretaries/types';
import { normalizeAuthPhoneIdentifier } from '@/lib/phone/normalizeAuthPhone';
import { useRetryAction } from '@/lib/query/useRetryAction';
import { cn } from '@/lib/utils/utils';

const STATUS_TABS: Array<{ id: SecretaryStatusFilter; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'active', label: 'المفعلة' },
  { id: 'disabled', label: 'المعطلة' },
];

const MAX_SECRETARIES = MAX_DOCTOR_SECRETARIES;

export default function DoctorSecretariesPage() {
  const { toast } = useToast();
  const listQuery = useDoctorSecretaries();
  const createSecretary = useCreateDoctorSecretary();
  const updateSecretary = useUpdateDoctorSecretary();
  const unassignSecretary = useUnassignDoctorSecretary();
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    listQuery.refetch(),
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SecretaryStatusFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DoctorSecretary | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<DoctorSecretary | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listQuery.secretaries.filter((secretary) => {
      const active = isSecretaryActive(secretary.user);
      if (statusFilter === 'active' && !active) return false;
      if (statusFilter === 'disabled' && active) return false;
      if (!q) return true;
      const haystacks = [
        secretary.user?.fullName,
        secretary.user?.email,
        secretary.user?.phone,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return haystacks.some((value) => value.includes(q));
    });
  }, [listQuery.secretaries, search, statusFilter]);

  const activeCount = useMemo(
    () =>
      listQuery.secretaries.filter((secretary) =>
        isSecretaryActive(secretary.user),
      ).length,
    [listQuery.secretaries],
  );

  const isTrulyEmpty =
    listQuery.secretaries.length === 0 &&
    !search.trim() &&
    statusFilter === 'all';

  const isFilteredEmpty =
    filtered.length === 0 &&
    listQuery.secretaries.length > 0 &&
    (search.trim() !== '' || statusFilter !== 'all');

  const handleCreate = async (input: DoctorSecretaryCreateFormValues) => {
    if (listQuery.secretaries.length >= MAX_SECRETARIES) {
      toast(`الحد الأقصى ${MAX_SECRETARIES} سكرتيرين لكل طبيب.`, {
        title: 'لا يمكن الإضافة',
        variant: 'error',
      });
      return;
    }

    const phone = input.phone.trim()
      ? normalizeAuthPhoneIdentifier(input.phone.trim())
      : undefined;

    try {
      await createSecretary.mutateAsync({
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        password: input.password,
        phone,
        gender: input.gender,
        permissions: input.permissions,
      });
      toast('تم إنشاء السكرتير وربطه بحسابك.', {
        title: 'تمت الإضافة',
        variant: 'success',
      });
      setCreateOpen(false);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر إنشاء السكرتير',
        variant: 'error',
      });
    }
  };

  const handleEditSave = async (input: DoctorSecretaryEditFormValues) => {
    const secretaryId = getSecretaryId(editTarget);
    if (!secretaryId) return;

    const phone = input.phone.trim()
      ? normalizeAuthPhoneIdentifier(input.phone.trim())
      : undefined;

    try {
      await updateSecretary.mutateAsync({
        secretaryId,
        body: {
          fullName: input.fullName.trim(),
          phone,
          gender: input.gender,
          permissions: input.permissions,
        },
      });
      toast('تم تحديث بيانات السكرتير.', {
        title: 'تم الحفظ',
        variant: 'success',
      });
      setEditTarget(null);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر الحفظ',
        variant: 'error',
      });
    }
  };

  const handleUnassign = async () => {
    const secretaryId = getSecretaryId(unassignTarget);
    if (!secretaryId) return;
    try {
      await unassignSecretary.mutateAsync(secretaryId);
      toast('تم إلغاء ربط السكرتير من حسابك.', {
        title: 'تم الإلغاء',
        variant: 'success',
      });
      setUnassignTarget(null);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر الإلغاء',
        variant: 'error',
      });
      throw error;
    }
  };

  return (
    <>
      <Helmet>
        <title>إدارة السكرتارية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <DoctorDashboardOverview
          variant="patients"
          surface="mint"
          headerIcon={<UserCog className="h-8 w-8 text-white" />}
          title="إدارة السكرتارية"
          subtitle="تحكم كامل بصلاحيات وإعدادات السكرتارية"
          actionLabel="إضافة سكرتير"
          actionIcon={<Plus className="h-4 w-4" />}
          onActionClick={() => setCreateOpen(true)}
          actionDisabled={listQuery.secretaries.length >= MAX_SECRETARIES}
          kpis={[
            {
              key: 'total',
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: listQuery.isAwaitingData ? '—' : listQuery.total,
              label: 'إجمالي السكرتير',
            },
            {
              key: 'active',
              icon: <UserCog className="h-5 w-5 shrink-0" />,
              value: listQuery.isAwaitingData ? '—' : activeCount,
              label: 'مفعل',
            },
            {
              key: 'limit',
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: MAX_SECRETARIES,
              label: 'الحد الأقصى',
            },
          ]}
        />

        <section className="mb-5 rounded-[16px] border border-[#EEF2F6] bg-white p-5 shadow-sm">
          <ClinicAccountsSearchRow
            value={search}
            onChange={setSearch}
            placeholder="بحث..."
            onClear={() => {
              setSearch('');
              setStatusFilter('all');
            }}
            trailing={
              <ClinicAccountsSearchCount
                count={filtered.length}
                label="سكرتير"
              />
            }
          />

          <div className="mt-4 flex flex-wrap justify-start gap-2">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    'rounded-[10px] px-4 py-2 font-cairo text-[12px] font-extrabold transition',
                    active
                      ? 'bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.25)]'
                      : 'border border-[#EEF2F6] bg-[#F9FAFB] text-[#667085] hover:bg-[#F0FDFA] hover:text-primary',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {listQuery.isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل السكرتير"
            brief={getUserFacingRequestErrorMessage(listQuery.error)}
            retrying={retryingList}
            onRetry={() => void retryList()}
          />
        ) : listQuery.isAwaitingData ? (
          <div className="space-y-4">
            <DoctorExpandableCardSkeleton />
            <DoctorExpandableCardSkeleton />
          </div>
        ) : isTrulyEmpty || isFilteredEmpty ? (
          <DoctorListEmptyIllustration
            variant="teal"
            imageSrc="/images/photo-not-found_appotemint.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
            title={
              isFilteredEmpty
                ? 'لا توجد نتائج مطابقة للبحث أو الفلتر الحالي'
                : 'لا يوجد سكرتير مرتبط بحسابك'
            }
            subtitle={
              isFilteredEmpty
                ? 'جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض النتائج'
                : 'يمكنك إضافة حتى 3 سكرتيرين وتحديد صلاحياتهم للمساعدة في إدارة عيادتك.'
            }
            actionLabel="إضافة سكرتير"
            onAction={() => setCreateOpen(true)}
            actionIcon={<Plus className="h-4 w-4" />}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((secretary) => (
              <DoctorSecretaryCard
                key={getSecretaryId(secretary) ?? secretary._id}
                secretary={secretary}
                onEdit={setEditTarget}
                onUnassign={setUnassignTarget}
              />
            ))}
          </div>
        )}

        <DoctorSecretaryCreateDialog
          open={createOpen}
          saving={createSecretary.isPending}
          secretaryCount={listQuery.secretaries.length}
          onClose={() => setCreateOpen(false)}
          onSave={handleCreate}
        />

        <DoctorSecretaryEditDialog
          open={Boolean(editTarget)}
          secretary={editTarget}
          saving={updateSecretary.isPending}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />

        <ConfirmActionDialog
          open={Boolean(unassignTarget)}
          onOpenChange={(open) => {
            if (!open) setUnassignTarget(null);
          }}
          title="إلغاء ربط السكرتير"
          confirmLabel="نعم، إلغاء الربط"
          confirmDisabled={unassignSecretary.isPending}
          description={
            <span className="block font-cairo text-[13px] font-semibold leading-[1.65]">
              هل تريد إلغاء ربط{' '}
              <span className="font-black text-[#101828]">
                {unassignTarget?.user?.fullName ?? 'هذا السكرتير'}
              </span>{' '}
              من عيادتك؟ لن يُحذف حساب المستخدم من النظام، لكنه لن يعود مرتبطاً
              بك.
            </span>
          }
          onConfirm={handleUnassign}
        />
      </div>
    </>
  );
}
