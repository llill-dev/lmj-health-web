import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { AlertCircle, Mail, Phone, Search, ShieldPlus, UserCog, UserMinus, Users } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import OffboardDialog from '@/components/admin/secretaries/dialogs/OffboardDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { useCreateAdminUser, useAdminUsers } from '@/hooks/admin/users/useAdminUsers';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import type { AdminUserSummary, CreateAdminUserBody } from '@/lib/admin/types';

type CreateAdminUserFormValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
};

type UserStatusFilter = 'all' | 'active' | 'inactive';

const DEFAULT_VALUES: CreateAdminUserFormValues = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  role: 'data_entry',
};

function CreateAdminUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const createMutation = useCreateAdminUser();
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CreateAdminUserFormValues>({ defaultValues: DEFAULT_VALUES });

  const inputClass =
    'h-[42px] w-full rounded-[10px] border border-[#D0D5DD] bg-white px-3 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15';

  async function onSubmit(values: CreateAdminUserFormValues) {
    const payload: CreateAdminUserBody = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role.trim() || 'data_entry',
      ...(values.phoneNumber.trim() ? { phoneNumber: values.phoneNumber.trim() } : {}),
    };

    try {
      await createMutation.mutateAsync(payload);
      toast('تم إنشاء حساب إداري جديد بنجاح.', {
        title: 'تمت الإضافة',
        variant: 'success',
      });
      reset(DEFAULT_VALUES);
      onOpenChange(false);
    } catch (error) {
      toast(userFacingErrorMessage(error), {
        title: 'تعذّر إنشاء الحساب',
        variant: 'error',
      });
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          reset(DEFAULT_VALUES);
          createMutation.reset();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[2px]' />
        <Dialog.Content
          dir='rtl'
          lang='ar'
          className='fixed left-1/2 top-1/2 z-[9999] w-[560px] max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
        >
          <div className='border-b border-[#F2F4F7] px-6 py-5'>
            <Dialog.Title className='font-cairo text-[18px] font-extrabold text-[#101828]'>
              إنشاء مستخدم إدارة
            </Dialog.Title>
            <Dialog.Description className='mt-1 font-cairo text-[12px] font-semibold text-[#667085]'>
              هذا النموذج يربط مباشرة مع `POST /api/admin/users`.
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 px-6 py-5'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <label className='mb-1.5 block font-cairo text-[12px] font-bold text-[#344054]'>
                  الاسم الكامل
                </label>
                <input
                  {...register('fullName', { required: 'الاسم مطلوب' })}
                  className={inputClass}
                  placeholder='أدخل اسم المستخدم'
                />
                {errors.fullName ? (
                  <p className='mt-1 font-cairo text-[11px] font-bold text-[#D92D20]'>
                    {errors.fullName.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className='mb-1.5 block font-cairo text-[12px] font-bold text-[#344054]'>
                  الدور
                </label>
                <select
                  {...register('role', { required: true })}
                  className={inputClass}
                >
                  <option value='data_entry'>data_entry</option>
                </select>
              </div>

              <div>
                <label className='mb-1.5 block font-cairo text-[12px] font-bold text-[#344054]'>
                  البريد الإلكتروني
                </label>
                <input
                  {...register('email', { required: 'البريد مطلوب' })}
                  className={inputClass}
                  placeholder='name@example.com'
                  dir='ltr'
                />
                {errors.email ? (
                  <p className='mt-1 font-cairo text-[11px] font-bold text-[#D92D20]'>
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className='mb-1.5 block font-cairo text-[12px] font-bold text-[#344054]'>
                  رقم الهاتف
                </label>
                <input
                  {...register('phoneNumber')}
                  className={inputClass}
                  placeholder='09xxxxxxxx'
                  dir='ltr'
                />
              </div>
            </div>

            <div>
              <label className='mb-1.5 block font-cairo text-[12px] font-bold text-[#344054]'>
                كلمة المرور
              </label>
              <input
                {...register('password', { required: 'كلمة المرور مطلوبة' })}
                type='password'
                className={inputClass}
                placeholder='••••••••'
                dir='ltr'
              />
              {errors.password ? (
                <p className='mt-1 font-cairo text-[11px] font-bold text-[#D92D20]'>
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {createMutation.error ? (
              <div className='rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#991B1B]'>
                {userFacingErrorMessage(createMutation.error)}
              </div>
            ) : null}

            <div className='flex items-center justify-end gap-3 border-t border-[#F2F4F7] pt-4'>
              <Dialog.Close asChild>
                <button
                  type='button'
                  className='h-10 rounded-[10px] border border-[#E5E7EB] bg-white px-5 font-cairo text-[12px] font-extrabold text-[#344054]'
                >
                  إلغاء
                </button>
              </Dialog.Close>
              <button
                type='submit'
                disabled={createMutation.isPending}
                className='inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[12px] font-extrabold text-white disabled:opacity-60'
              >
                <ShieldPlus className='h-4 w-4' />
                {createMutation.isPending ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function userStatusLabel(user: AdminUserSummary) {
  return user.isActive === false ? 'موقوف' : 'نشط';
}

function userStatusTone(user: AdminUserSummary) {
  return user.isActive === false
    ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B42318]'
    : 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]';
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [offboardOpen, setOffboardOpen] = useState(false);
  const [offboardTarget, setOffboardTarget] = useState<{
    userId: string;
    label: string;
  } | null>(null);

  const { users, isAwaitingData, isError, error, refetch } = useAdminUsers();

  const filteredUsers = useMemo(() => {
    const text = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? user.isActive !== false
            : user.isActive === false;
      if (!matchesStatus) return false;
      if (!text) return true;
      return [user.fullName, user.email, user.phone, user.phoneNumber, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text));
    });
  }, [query, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / Math.max(pageSize, 1)));
  const currentPage = Math.min(page, totalPages);
  const visibleUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [currentPage, filteredUsers, pageSize]);
  const rangeStart = filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = filteredUsers.length === 0 ? 0 : Math.min(currentPage * pageSize, filteredUsers.length);

  return (
    <>
      <Helmet>
        <title>مستخدمو الإدارة • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar' className='space-y-5'>
        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title='مستخدمو الإدارة'
          subtitle='إدارة حسابات الفريق الداخلي وإيقاف الوصول عند الحاجة'
          headerIcon={<UserCog className='h-8 w-8 text-white' />}
          actionLabel='إنشاء مستخدم'
          onActionClick={() => setCreateOpen(true)}
          kpis={[
            {
              key: 'total',
              icon: <Users className='h-5 w-5 shrink-0' />,
              value: isAwaitingData ? '—' : users.length,
              label: 'إجمالي الحسابات',
            },
            {
              key: 'active',
              icon: <ShieldPlus className='h-5 w-5 shrink-0' />,
              value: isAwaitingData ? '—' : users.filter((user) => user.isActive !== false).length,
              label: 'حسابات نشطة',
            },
          ]}
        />

        <section className='rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]'>
            <div className='relative'>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder='ابحث بالاسم أو البريد أو الهاتف أو الدور...'
                className='h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-11 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]'
              />
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]' />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as UserStatusFilter);
                setPage(1);
              }}
              className='h-[44px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary'
            >
              <option value='all'>كل الحالات</option>
              <option value='active'>الحسابات النشطة</option>
              <option value='inactive'>الحسابات الموقوفة</option>
            </select>
          </div>
        </section>

        {isAwaitingData ? (
          <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
            جارٍ تحميل مستخدمي الإدارة...
          </div>
        ) : isError ? (
          <div className='flex flex-col items-center gap-3 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
            <AlertCircle className='h-7 w-7 text-[#DC2626]' />
            <div className='font-cairo text-[14px] font-extrabold text-[#991B1B]'>
              تعذّر تحميل الحسابات
            </div>
            <div className='font-cairo text-[12px] font-semibold text-[#B42318]'>
              {userFacingErrorMessage(error)}
            </div>
            <button
              type='button'
              onClick={() => void refetch()}
              className='rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]'
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
            لا توجد حسابات مطابقة للبحث الحالي.
          </div>
        ) : (
          <section className='space-y-4'>
            {visibleUsers.map((user) => (
              <article
                key={user.id}
                className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
              >
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='min-w-0 text-right'>
                    <div className='flex flex-wrap items-center justify-end gap-3'>
                      <div
                        className={`inline-flex h-[24px] items-center rounded-[999px] border px-3 font-cairo text-[11px] font-extrabold ${userStatusTone(user)}`}
                      >
                        {userStatusLabel(user)}
                      </div>
                      <h2 className='font-cairo text-[16px] font-black text-[#111827]'>
                        {user.fullName}
                      </h2>
                    </div>
                    <div className='mt-1 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                      {user.role || 'data_entry'}
                    </div>
                  </div>

                  <div className='flex items-center justify-end gap-2'>
                    <button
                      type='button'
                      onClick={() => {
                        setOffboardTarget({
                          userId: user.id,
                          label: user.fullName,
                        });
                        setOffboardOpen(true);
                      }}
                      className='inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[#FECACA] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#DC2626] transition hover:bg-[#FEF2F2]'
                    >
                      <UserMinus className='h-3.5 w-3.5' />
                      إيقاف الحساب
                    </button>
                  </div>
                </div>

                <div className='mt-4 flex flex-wrap items-center justify-end gap-x-5 gap-y-2'>
                  {user.email ? (
                    <div className='inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                      <span>{user.email}</span>
                      <Mail className='h-4 w-4 text-primary' />
                    </div>
                  ) : null}
                  {user.phone || user.phoneNumber ? (
                    <div className='inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                      <span>{user.phone ?? user.phoneNumber}</span>
                      <Phone className='h-4 w-4 text-primary' />
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        )}

        {!isAwaitingData && !isError && filteredUsers.length > 0 ? (
          <section className='rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
              <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                عرض {rangeStart.toLocaleString('ar-SA')}–{rangeEnd.toLocaleString('ar-SA')} من{' '}
                {filteredUsers.length.toLocaleString('ar-SA')} حساب · صفحة{' '}
                {currentPage.toLocaleString('ar-SA')} / {totalPages.toLocaleString('ar-SA')}
              </div>

              <div className='flex flex-wrap items-center justify-end gap-3'>
                <select
                  value={String(pageSize)}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value) || 10);
                    setPage(1);
                  }}
                  className='h-[36px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#111827]'
                >
                  {[10, 20, 50].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <button
                  type='button'
                  onClick={() => {
                    if (currentPage > 1) setPage((prev) => prev - 1);
                  }}
                  disabled={currentPage <= 1}
                  className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60'
                >
                  السابق
                </button>

                <button
                  type='button'
                  onClick={() => {
                    if (currentPage < totalPages) setPage((prev) => prev + 1);
                  }}
                  disabled={currentPage >= totalPages}
                  className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60'
                >
                  التالي
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <CreateAdminUserDialog open={createOpen} onOpenChange={setCreateOpen} />

        <OffboardDialog
          open={offboardOpen}
          onOpenChange={(open) => {
            setOffboardOpen(open);
            if (!open) setOffboardTarget(null);
          }}
          targetUserId={offboardTarget?.userId ?? null}
          targetLabel={offboardTarget?.label ?? ''}
          accountRole='staff'
          onSuccess={() => void refetch()}
        />
      </div>
    </>
  );
}
