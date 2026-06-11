'use client';

import { Building2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import {
  ClinicAccountsBanner,
  ClinicAccountsSearchCount,
  ClinicAccountsSearchRow,
} from '@/components/doctor/clinic-accounts';
import DoctorTablePagination from '@/components/doctor/shared/doctor-table-pagination';
import {
  FacilitiesTable,
  FacilityEmptyState,
  FacilityFormDialog,
} from '@/components/doctor/facilities';
import { useToast } from '@/components/ui/ToastProvider';
import { MOCK_DOCTOR_FACILITIES } from '@/lib/doctor/facilities/mockData';
import type {
  DoctorFacility,
  DoctorFacilityFormValues,
} from '@/lib/doctor/facilities/types';

function formToFacility(
  values: DoctorFacilityFormValues,
  existing?: DoctorFacility,
): DoctorFacility {
  return {
    id: existing?.id ?? `FAC-${Date.now()}`,
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    city: values.city.trim(),
    address: values.address.trim(),
    phone: values.phone.trim(),
    email: values.email.trim() || undefined,
    workHoursFrom: values.workHoursFrom,
    workHoursTo: values.workHoursTo,
    status: values.active ? 'active' : 'closed',
  };
}

export default function DoctorFacilitiesPage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const startEmpty = searchParams.get('empty') === '1';

  const [facilities, setFacilities] = useState<DoctorFacility[]>(
    startEmpty ? [] : MOCK_DOCTOR_FACILITIES,
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editTarget, setEditTarget] = useState<DoctorFacility | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return facilities;
    return facilities.filter(
      (facility) =>
        facility.name.includes(search.trim()) ||
        facility.city.includes(search.trim()) ||
        facility.phone.includes(q) ||
        facility.address.includes(search.trim()),
    );
  }, [facilities, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const rangeStart = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);

  const openCreate = () => {
    setDialogMode('create');
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (facility: DoctorFacility) => {
    setDialogMode('edit');
    setEditTarget(facility);
    setDialogOpen(true);
  };

  const handleSubmit = (values: DoctorFacilityFormValues) => {
    if (!values.name.trim() || !values.city.trim() || !values.address.trim()) {
      toast('يرجى تعبئة الحقول الإلزامية.', {
        title: 'بيانات ناقصة',
        variant: 'error',
      });
      return;
    }

    if (dialogMode === 'edit' && editTarget) {
      setFacilities((prev) =>
        prev.map((item) =>
          item.id === editTarget.id ? formToFacility(values, editTarget) : item,
        ),
      );
      toast('تم حفظ تعديلات المنشأة.', {
        title: 'تم التحديث',
        variant: 'success',
      });
    } else {
      setFacilities((prev) => [formToFacility(values), ...prev]);
      toast('تمت إضافة المنشأة بنجاح.', {
        title: 'تمت الإضافة',
        variant: 'success',
      });
    }

    setDialogOpen(false);
  };

  const handleToggleStatus = (facility: DoctorFacility) => {
    setFacilities((prev) =>
      prev.map((item) =>
        item.id === facility.id
          ? {
              ...item,
              status: item.status === 'active' ? 'closed' : 'active',
            }
          : item,
      ),
    );
  };

  return (
    <>
      <Helmet>
        <title>المنشآت • LMJ Health</title>
      </Helmet>

      <ClinicAccountsBanner
        title="المنشآت"
        subtitle="توثيق المنشآت"
        icon={<Building2 className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-[44px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm transition hover:border-primary/30"
          >
            <Plus className="h-4 w-4" aria-hidden />
            إضافة منشأة
          </button>
        }
      />

      <ClinicAccountsSearchRow
        value={search}
        onChange={setSearch}
        placeholder="ابحث عن منشأة..."
        onValueChangeExtra={() => setPage(1)}
        trailing={
          <ClinicAccountsSearchCount count={filtered.length} label="منشأة" />
        }
      />

      {!filtered.length ? (
        <FacilityEmptyState onAdd={openCreate} />
      ) : (
        <>
          <FacilitiesTable
            rows={pageRows}
            onEdit={openEdit}
            onToggleStatus={handleToggleStatus}
          />

          <DoctorTablePagination
            className="mt-4"
            controlsFirst
            page={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[1, 2]}
            summaryLabel={`عرض ${rangeStart}-${rangeEnd} من أصل ${filtered.length} منشأة`}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </>
      )}

      <FacilityFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initialFacility={editTarget}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
