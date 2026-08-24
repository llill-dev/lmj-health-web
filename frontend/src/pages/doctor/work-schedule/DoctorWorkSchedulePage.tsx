import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Edit2,
  Settings as SettingsIcon,
  AlertCircle,
} from 'lucide-react';
import { DoctorScheduleSkeleton } from '@/components/doctor/shared/skeletons';
import { ClinicAccountsBanner } from '@/components/doctor/clinic-accounts';
import {
  useSchedule,
  useAddScheduleDay,
  useUpdateScheduleDay,
  useDeleteScheduleDay,
  useUpdateScheduleSettings,
  useAddScheduleException,
  useDeleteScheduleException,
} from '@/hooks';
import { useToast } from '@/components/ui/ToastProvider';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import AddDayDialog, {
  type AddDayFormValues,
} from '@/components/doctor/work-schedule/add-day-dialog';
import EditDayDialog, {
  type EditDayFormValues,
} from '@/components/doctor/work-schedule/edit-day-dialog';
import AddExceptionDialog, {
  type ExceptionFormValues,
} from '@/components/doctor/work-schedule/add-exception-dialog';
import ScheduleConflictDialog, {
  type ScheduleConflictData,
} from '@/components/doctor/work-schedule/schedule-conflict-dialog';
import SlotsPreview from '@/components/doctor/work-schedule/slots-preview';
import StyledSelect from '@/components/ui/styled-select';
import type { ScheduleDayKey, ScheduleTimeSlot } from '@/lib/doctor/types';
import { getWorkScheduleMutationErrorMessage } from '@/lib/doctor/writeFlowErrors';
import { useI18n } from '@/i18n/provider';

export default function DoctorWorkSchedulePage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const dayLabels: Record<ScheduleDayKey, string> = {
    Sunday: tr('الأحد', 'Sunday'),
    Monday: tr('الإثنين', 'Monday'),
    Tuesday: tr('الثلاثاء', 'Tuesday'),
    Wednesday: tr('الأربعاء', 'Wednesday'),
    Thursday: tr('الخميس', 'Thursday'),
    Friday: tr('الجمعة', 'Friday'),
    Saturday: tr('السبت', 'Saturday'),
  };
  const { toast } = useToast();
  const navigate = useNavigate();
  const { workSchedule, isAwaitingData, error, refetch } = useSchedule();
  const { addDayAsync, isLoading: isAddingDay } = useAddScheduleDay();
  const { updateDayAsync, isLoading: isUpdatingDay } =
    useUpdateScheduleDay();
  const { deleteDayAsync, isLoading: isDeletingDay } =
    useDeleteScheduleDay();
  const { updateSettingsAsync, isLoading: isUpdatingSettings } =
    useUpdateScheduleSettings();
  const { addExceptionAsync, isLoading: isAddingException } =
    useAddScheduleException();
  const { deleteExceptionAsync, isLoading: isDeletingException } =
    useDeleteScheduleException();

  const [isAddDayOpen, setIsAddDayOpen] = useState(false);
  const [isEditDayOpen, setIsEditDayOpen] = useState(false);
  const [isAddExceptionOpen, setIsAddExceptionOpen] = useState(false);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [conflictData, setConflictData] = useState<ScheduleConflictData | null>(null);
  const [editingDay, setEditingDay] = useState<{
    day: ScheduleDayKey;
    slots: ScheduleTimeSlot[];
  } | null>(null);

  // Confirm dialogs state
  const [isDeleteDayConfirmOpen, setIsDeleteDayConfirmOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<ScheduleDayKey | null>(null);
  const [isDeleteExceptionConfirmOpen, setIsDeleteExceptionConfirmOpen] = useState(false);
  const [exceptionToDelete, setExceptionToDelete] = useState<string | null>(null);

  // Slots preview state
  const [selectedPreviewDate, setSelectedPreviewDate] = useState<string>('');

  const [duration, setDuration] = useState(30);
  const [gap, setGap] = useState(5);

  useEffect(() => {
    if (workSchedule?.slotSettings) {
      setDuration(workSchedule.slotSettings.duration || 30);
      setGap(workSchedule.slotSettings.gap || 5);
    }
  }, [workSchedule]);

  const handleAddDay = async (values: AddDayFormValues) => {
    try {
      await addDayAsync({
        day: values.day,
        slots: values.slots,
      });
      await refetch();
      setIsAddDayOpen(false);
      toast(
        tr(
          `تمت إضافة يوم ${dayLabels[values.day]} بنجاح`,
          `${dayLabels[values.day]} added successfully`,
        ),
        {
          variant: 'success',
          title: tr('تم الحفظ', 'Saved'),
          durationMs: 4000,
        },
      );
    } catch (err: any) {
      const errorMessage = getWorkScheduleMutationErrorMessage(err, 'add-day');
      toast(errorMessage, {
        variant: 'error',
        title: tr('فشلت العملية', 'Operation failed'),
        durationMs: 5000,
      });
    }
  };

  const handleEditDay = async (values: EditDayFormValues) => {
    try {
      await updateDayAsync({
        day: values.day,
        slots: values.slots,
      });
      await refetch();
      setIsEditDayOpen(false);
      setEditingDay(null);
      toast(
        tr(
          `تم تحديث يوم ${dayLabels[values.day]} بنجاح`,
          `${dayLabels[values.day]} updated successfully`,
        ),
        {
          variant: 'success',
          title: tr('تم التحديث', 'Updated'),
          durationMs: 4000,
        },
      );
    } catch (err: any) {
      // Check for 409 Conflict error with detailed conflict information
      if (
        err?.response?.status === 409 &&
        err?.response?.data?.errors?.conflicts
      ) {
        setConflictData({
          totalConflicts:
            err.response.data.errors.totalConflicts ||
            err.response.data.errors.conflicts.length,
          conflicts: err.response.data.errors.conflicts,
          operation: 'update_day',
          day: values.day,
          nextAction:
            err.response.data.errors.nextAction ||
            tr(
              'قم بإلغاء أو إعادة جدولة المواعيد المتعارضة ثم حاول مجدداً.',
              'Cancel or reschedule conflicting appointments, then try again.',
            ),
        });
        setIsConflictDialogOpen(true);
        return;
      }

      const errorMessage = getWorkScheduleMutationErrorMessage(
        err,
        'update-day',
      );
      toast(errorMessage, {
        variant: 'error',
        title: tr('فشلت العملية', 'Operation failed'),
        durationMs: 5000,
      });
    }
  };

  const handleDeleteDay = async (day: ScheduleDayKey) => {
    setDayToDelete(day);
    setIsDeleteDayConfirmOpen(true);
  };

  const confirmDeleteDay = async () => {
    if (!dayToDelete) return;

    try {
      await deleteDayAsync(dayToDelete);
      await refetch();
      toast(
        tr(
          `تم حذف يوم ${dayLabels[dayToDelete]} بنجاح`,
          `${dayLabels[dayToDelete]} deleted successfully`,
        ),
        {
          variant: 'success',
          title: tr('تم الحذف', 'Deleted'),
          durationMs: 4000,
        },
      );
      setDayToDelete(null);
    } catch (err: any) {
      // Check for 409 Conflict error
      if (
        err?.response?.status === 409 &&
        err?.response?.data?.errors?.conflicts
      ) {
        setConflictData({
          totalConflicts:
            err.response.data.errors.totalConflicts ||
            err.response.data.errors.conflicts.length,
          conflicts: err.response.data.errors.conflicts,
          operation: 'delete_day',
          day: dayToDelete,
          nextAction:
            err.response.data.errors.nextAction ||
            tr(
              'قم بإلغاء أو إعادة جدولة المواعيد المتعارضة ثم حاول مجدداً.',
              'Cancel or reschedule conflicting appointments, then try again.',
            ),
        });
        setIsConflictDialogOpen(true);
        return;
      }

      const errorMessage = getWorkScheduleMutationErrorMessage(
        err,
        'delete-day',
      );
      toast(errorMessage, {
        variant: 'error',
        title: tr('فشلت العملية', 'Operation failed'),
        durationMs: 5000,
      });
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await updateSettingsAsync({
        duration,
        gap,
      });
      await refetch();
      toast(tr('تم حفظ إعدادات المواعيد بنجاح', 'Appointment settings saved'), {
        variant: 'success',
        title: tr('تم الحفظ', 'Saved'),
        durationMs: 4000,
      });
    } catch (err: any) {
      const errorMessage = getWorkScheduleMutationErrorMessage(
        err,
        'update-settings',
      );
      toast(errorMessage, {
        variant: 'error',
        title: tr('فشلت العملية', 'Operation failed'),
        durationMs: 5000,
      });
    }
  };

  const handleAddException = async (values: ExceptionFormValues) => {
    try {
      await addExceptionAsync({
        date: values.date,
        slots: values.slots,
        note: values.note,
      });
      await refetch();
      setIsAddExceptionOpen(false);
      toast(tr('تمت إضافة الاستثناء بنجاح', 'Exception added successfully'), {
        variant: 'success',
        title: tr('تم الحفظ', 'Saved'),
        durationMs: 4000,
      });
    } catch (err: any) {
      const errorMessage = getWorkScheduleMutationErrorMessage(
        err,
        'add-exception',
      );
      toast(errorMessage, {
        variant: 'error',
        title: tr('فشلت العملية', 'Operation failed'),
        durationMs: 5000,
      });
    }
  };

  const handleDeleteException = async (exceptionId: string) => {
    setExceptionToDelete(exceptionId);
    setIsDeleteExceptionConfirmOpen(true);
  };

  const confirmDeleteException = async () => {
    if (!exceptionToDelete) return;

    try {
      await deleteExceptionAsync(exceptionToDelete);
      await refetch();
      toast(tr('تم حذف الاستثناء بنجاح', 'Exception deleted successfully'), {
        variant: 'success',
        title: tr('تم الحذف', 'Deleted'),
        durationMs: 4000,
      });
      setExceptionToDelete(null);
    } catch (err: any) {
      const errorMessage = getWorkScheduleMutationErrorMessage(
        err,
        'delete-exception',
      );
      toast(errorMessage, {
        variant: 'error',
        title: tr('فشلت العملية', 'Operation failed'),
        durationMs: 5000,
      });
    }
  };

  const availableTimes = workSchedule?.availableTimes || [];
  const exceptions = workSchedule?.exceptions || [];
  const slotSettings = workSchedule?.slotSettings;

  const existingDays = availableTimes.map((day) => day.day);

  return (
    <>
      <Helmet>
        <title>{tr('جدول العمل', 'Work schedule')} • LMJ Health</title>
      </Helmet>

      <div
        dir={dir}
        lang={locale}
        className='pb-12 min-h-screen'
      >
        <AddDayDialog
          open={isAddDayOpen}
          onOpenChange={setIsAddDayOpen}
          onSubmit={handleAddDay}
          existingDays={existingDays}
        />

        {editingDay && (
          <EditDayDialog
            open={isEditDayOpen}
            onOpenChange={setIsEditDayOpen}
            onSubmit={handleEditDay}
            initialDay={editingDay.day}
            initialSlots={editingDay.slots}
          />
        )}

      <AddExceptionDialog
        open={isAddExceptionOpen}
        onOpenChange={setIsAddExceptionOpen}
        onSubmit={handleAddException}
        enabledDays={
          workSchedule?.availableTimes?.map((t) => t.day) || []
        }
      />

        <ClinicAccountsBanner
          title={tr('جدول العمل', 'Work schedule')}
          icon={<Calendar className='h-7 w-7 text-white sm:h-8 sm:w-8' />}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='container px-4 mx-auto max-w-5xl'
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mb-6 flex flex-col gap-3 rounded-[14px] border border-[#FEE4E2] bg-[#FFF5F5] px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5'
            >
              <div className='flex gap-3 items-center'>
                <AlertCircle className='h-5 w-5 text-[#B42318]' />
                <div className='font-cairo text-[13px] font-bold text-[#B42318]'>
                  {tr('فشل تحميل جدول العمل', 'Failed to load the work schedule')}
                </div>
              </div>
              <button
                type='button'
                onClick={() => refetch()}
                className='h-[36px] rounded-[10px] bg-[#F04438] px-5 font-cairo text-[12px] font-extrabold text-white transition-colors hover:bg-[#D92D20]'
              >
                {tr('إعادة المحاولة', 'Retry')}
              </button>
            </motion.div>
          )}

          {/* Slot Settings: overflow-visible + z-[25] so StyledSelect dropdowns aren’t clipped or covered */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='relative z-[25] mt-6 overflow-visible rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
          >
            <div className='border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white px-4 py-4 sm:px-6'>
              <div className='flex gap-2 items-center'>
                <SettingsIcon className='w-5 h-5 text-primary' />
                <h2 className='font-cairo text-[16px] font-extrabold text-[#111827]'>
                  {tr('إعدادات المواعيد', 'Appointment settings')}
                </h2>
              </div>
              <p className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                {tr('حدد مدة كل موعد والفجوة بين المواعيد', "Set each appointment's duration and the gap between appointments")}
              </p>
            </div>

            <div className='p-4 sm:p-6'>
              <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                <div>
                  <label className='mb-2 flex items-center gap-2 text-start font-cairo text-[13px] font-bold text-[#344054]'>
                    <Clock className='w-4 h-4 text-primary' />
                    {tr('مدة الموعد (دقيقة)', 'Appointment duration (minutes)')}
                  </label>
                  <StyledSelect
                    value={String(duration)}
                    onChange={(v) => setDuration(Number(v))}
                    options={[
                      { value: '15', label: tr('15 دقيقة', '15 minutes') },
                      { value: '30', label: tr('30 دقيقة', '30 minutes') },
                      { value: '45', label: tr('45 دقيقة', '45 minutes') },
                      { value: '60', label: tr('60 دقيقة', '60 minutes') },
                    ]}
                    listboxAriaLabel={tr('مدة الموعد بالدقيقة', 'Appointment duration in minutes')}
                  />
                </div>

                <div>
                  <label className='mb-2 flex items-center gap-2 text-start font-cairo text-[13px] font-bold text-[#344054]'>
                    <Clock className='w-4 h-4 text-primary' />
                    {tr('الفجوة بين المواعيد (دقيقة)', 'Gap between appointments (minutes)')}
                  </label>
                  <StyledSelect
                    value={String(gap)}
                    onChange={(v) => setGap(Number(v))}
                    options={[
                      { value: '0', label: tr('بدون فجوة', 'No gap') },
                      { value: '5', label: tr('5 دقائق', '5 minutes') },
                      { value: '10', label: tr('10 دقائق', '10 minutes') },
                      { value: '15', label: tr('15 دقيقة', '15 minutes') },
                    ]}
                    listboxAriaLabel={tr('الفجوة بين المواعيد بالدقيقة', 'Gap between appointments in minutes')}
                  />
                </div>
              </div>

              <div className='mt-5 flex justify-stretch sm:justify-end'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type='button'
                  onClick={handleUpdateSettings}
                  disabled={isUpdatingSettings}
                  className='flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_8px_16px_rgba(15,143,139,0.25)] transition-all hover:bg-[#0d7a77] disabled:opacity-50 sm:w-auto'
                >
                  <SettingsIcon className='w-4 h-4' />
                  {isUpdatingSettings ? tr('جارٍ الحفظ...', 'Saving...') : tr('حفظ الإعدادات', 'Save settings')}
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* Working Days */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='relative z-10 mt-6 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
          >
            <div className='flex flex-col gap-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
              <div>
                <div className='flex gap-2 items-center'>
                  <Calendar className='w-5 h-5 text-primary' />
                  <h2 className='font-cairo text-[16px] font-extrabold text-[#111827]'>
                    {tr('أيام وساعات العمل', 'Work days and hours')}
                  </h2>
                </div>
                <p className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                  {availableTimes.length === 0
                    ? tr('لم تقم بإضافة أيام عمل بعد', "You haven't added any work days yet")
                    : tr(
                        `لديك ${availableTimes.length} أيام عمل`,
                        `You have ${availableTimes.length} work days`,
                      )}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type='button'
                onClick={() => setIsAddDayOpen(true)}
                disabled={isAddingDay || existingDays.length >= 7}
                className='flex h-[38px] items-center gap-2 rounded-[10px] border-[2px] border-primary bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm transition-all hover:bg-primary hover:text-white disabled:opacity-50'
              >
                <Plus className='w-4 h-4' />
                {tr('إضافة يوم عمل', 'Add work day')}
              </motion.button>
            </div>

            <div className='p-4 sm:p-6'>
              {isAwaitingData ? (
                <DoctorScheduleSkeleton days={5} />
              ) : availableTimes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='rounded-[14px] border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-6 py-12 text-center'
                >
                  <Calendar className='mx-auto h-12 w-12 text-[#D1D5DB]' />
                  <p className='mt-3 font-cairo text-[14px] font-bold text-[#6B7280]'>
                    {tr('لا توجد أيام عمل محددة', 'No work days set')}
                  </p>
                  <p className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    {tr(
                      'ابدأ بإضافة أيام عملك لتمكين المرضى من الحجز',
                      'Start by adding your work days to let patients book',
                    )}
                  </p>
                </motion.div>
              ) : (
                <div className='space-y-3'>
                  <AnimatePresence mode='popLayout'>
                    {availableTimes.map((dayTemplate, index) => (
                      <motion.div
                        key={dayTemplate.day}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className='group rounded-[14px] border border-[#E5E7EB] bg-gradient-to-r from-white to-[#FAFBFC] p-4 transition-all hover:border-primary hover:shadow-md'
                      >
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                          <div className='flex-1'>
                            <div className='flex gap-3 items-center mb-3'>
                              <div className='flex h-[32px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[13px] font-extrabold text-white shadow-sm'>
                                {dayLabels[dayTemplate.day]}
                              </div>
                              <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                                {tr(
                                  `${dayTemplate.slots.length} فترة عمل`,
                                  `${dayTemplate.slots.length} time slots`,
                                )}
                              </div>
                            </div>

                            <div className='space-y-2'>
                              {dayTemplate.slots.map((slot, slotIndex) => (
                                <motion.div
                                  key={`${dayTemplate.day}-${slot.startTime}-${slot.endTime}-${slotIndex}`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: slotIndex * 0.1 }}
                                  className='flex items-center gap-2 rounded-[8px] bg-[#F2FFFE] px-3 py-2'
                                >
                                  <Clock className='h-3.5 w-3.5 text-primary' />
                                  <span className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                                    {slot.startTime}
                                  </span>
                                  <span className='font-cairo text-[13px] font-bold text-[#667085]'>
                                    -
                                  </span>
                                  <span className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                                    {slot.endTime}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          <div className='flex gap-2 self-end sm:self-start'>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type='button'
                              onClick={() => {
                                setEditingDay({
                                  day: dayTemplate.day,
                                  slots: dayTemplate.slots,
                                });
                                setIsEditDayOpen(true);
                              }}
                              disabled={isUpdatingDay}
                              className='flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#F2FFFE] text-primary transition-colors hover:bg-primary hover:text-white'
                              aria-label={tr('تعديل', 'Edit')}
                            >
                              <Edit2 className='w-4 h-4' />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type='button'
                              onClick={() => handleDeleteDay(dayTemplate.day)}
                              disabled={isDeletingDay}
                              className='flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#FEF3F2] text-[#F04438] transition-colors hover:bg-[#F04438] hover:text-white'
                              aria-label={tr('حذف', 'Delete')}
                            >
                              <Trash2 className='w-4 h-4' />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.section>

          {/* Exceptions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='relative z-10 mt-6 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
          >
            <div className='flex flex-col gap-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
              <div>
                <div className='flex gap-2 items-center'>
                  <Calendar className='w-5 h-5 text-primary' />
                  <h2 className='font-cairo text-[16px] font-extrabold text-[#111827]'>
                    {tr('الاستثناءات والإجازات', 'Exceptions and leaves')}
                  </h2>
                </div>
                <p className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                  {exceptions.length === 0
                    ? tr('لا توجد استثناءات', 'No exceptions')
                    : tr(
                        `لديك ${exceptions.length} استثناء`,
                        `You have ${exceptions.length} exceptions`,
                      )}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type='button'
                onClick={() => setIsAddExceptionOpen(true)}
                disabled={isAddingException}
                className='flex h-[38px] items-center gap-2 rounded-[10px] border-[2px] border-primary bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm transition-all hover:bg-primary hover:text-white disabled:opacity-50'
              >
                <Plus className='w-4 h-4' />
                {tr('إضافة استثناء', 'Add exception')}
              </motion.button>
            </div>

            <div className='p-4 sm:p-6'>
              {exceptions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='rounded-[14px] border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-6 py-12 text-center'
                >
                  <Calendar className='mx-auto h-12 w-12 text-[#D1D5DB]' />
                  <p className='mt-3 font-cairo text-[14px] font-bold text-[#6B7280]'>
                    {tr('لا توجد استثناءات أو إجازات', 'No exceptions or leaves')}
                  </p>
                  <p className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    {tr('أضف أيام غير متاحة أو إجازات خاصة', 'Add unavailable days or special leaves')}
                  </p>
                </motion.div>
              ) : (
                <div className='space-y-3'>
                  <AnimatePresence mode='popLayout'>
                    {exceptions.map((exception, index) => (
                      <motion.div
                        key={exception._id || exception.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className='group rounded-[14px] border border-[#E5E7EB] bg-gradient-to-r from-white to-[#FAFBFC] p-4 transition-all hover:border-[#FEE4E2] hover:shadow-md'
                      >
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                          <div className='flex gap-4 items-start flex-1'>
                            <div className='rounded-[10px] bg-[#FEF3F2] p-2'>
                              <Calendar className='h-4 w-4 text-[#F04438]' />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                                  {exception.note || tr('استثناء', 'Exception')}
                                </div>
                                {/* Exception Type Badge */}
                                <span
                                  className={`rounded-[6px] px-2 py-1 font-cairo text-[11px] font-bold ${
                                    !exception.slots || exception.slots.length === 0
                                      ? 'bg-[#FEE4E2] text-[#D92D20]'
                                      : 'bg-[#D1FAE5] text-[#10B981]'
                                  }`}
                                >
                                  {!exception.slots || exception.slots.length === 0
                                    ? tr('يوم مغلق', 'Closed day')
                                    : tr('ساعات مخصصة', 'Custom hours')}
                                </span>
                              </div>
                              <div className='mt-1 font-cairo text-[12px] font-bold text-[#667085]'>
                                {new Date(exception.date).toLocaleDateString(
                                  locale === 'ar' ? 'ar-SA' : 'en-US',
                                  {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  },
                                )}
                              </div>
                              
                              {/* Custom Hours Display */}
                              {exception.slots && exception.slots.length > 0 && (
                                <div className='mt-3 flex flex-wrap gap-2'>
                                  {exception.slots.map((slot, slotIdx) => (
                                    <div
                                      key={slotIdx}
                                      className='flex items-center gap-2 rounded-[8px] border border-[#D1FAE5] bg-[#F0FDF4] px-3 py-1.5'
                                    >
                                      <Clock className='h-3 w-3 text-[#10B981]' />
                                      <span className='font-cairo text-[12px] font-bold text-[#10B981]'>
                                        {slot.startTime} - {slot.endTime}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type='button'
                            onClick={() => handleDeleteException(exception._id!)}
                            disabled={isDeletingException}
                            className='flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#FEF3F2] text-[#F04438] transition-colors hover:bg-[#F04438] hover:text-white flex-shrink-0'
                            aria-label={tr('حذف', 'Delete')}
                          >
                            <Trash2 className='w-4 h-4' />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.section>

          {/* Slots Preview Section */}
          {availableTimes.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className='relative z-10 mt-6 overflow-hidden rounded-[18px] border-[2px] border-primary/20 bg-white shadow-[0_8px_20px_rgba(15,143,139,0.08)]'
            >
              <div className='border-b border-[#EEF2F6] bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-4 sm:px-6'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex gap-3 items-center'>
                    <div className='p-2 rounded-full bg-primary/10'>
                      <Calendar className='w-5 h-5 text-primary' />
                    </div>
                    <h2 className='font-cairo text-[18px] font-extrabold text-[#111827]'>
                      {tr('معاينة الحجوزات', 'Bookings preview')}
                    </h2>
                  </div>
                  <input
                    type='date'
                    value={selectedPreviewDate}
                    onChange={(e) => setSelectedPreviewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className='h-[40px] w-full rounded-[10px] border-[1.82px] border-primary bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none transition-colors hover:border-primary/80 sm:w-auto'
                  />
                </div>
              </div>

              <div className='p-4 sm:p-6'>
                {selectedPreviewDate ? (
                  <SlotsPreview date={selectedPreviewDate} />
                ) : (
                  <div className='flex flex-col items-center py-12'>
                    <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[#F2F4F7]'>
                      <Calendar className='h-10 w-10 text-[#667085]' />
                    </div>
                    <p className='mt-4 font-cairo text-[15px] font-extrabold text-[#344054]'>
                      {tr('اختر تاريخاً لمعاينة الحجوزات', 'Choose a date to preview bookings')}
                    </p>
                    <p className='mt-2 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                      {tr(
                        'ستظهر لك جميع الفترات المتاحة والمحجوزة في التاريخ المحدد',
                        'All available and booked slots for the selected date will be shown here',
                      )}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* Summary */}
          {availableTimes.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='relative z-10 mt-6 overflow-hidden rounded-[18px] border-[2px] border-[#BFEDEC] bg-gradient-to-br from-[#F2FFFE] to-[#E6F9F8] shadow-[0_8px_20px_rgba(15,143,139,0.1)]'
            >
              <div className='p-4 sm:p-6'>
                <div className='flex gap-4 items-start'>
                  <div className='p-2 rounded-full bg-primary/10'>
                    <Info className='w-5 h-5 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-cairo text-[16px] font-extrabold text-primary'>
                      {tr('ملخص جدول العمل التشغيلي', 'Operational schedule summary')}
                    </h3>
                    <div className='grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2'>
                      <div className='rounded-[12px] bg-white/70 p-4 shadow-sm'>
                        <div className='flex gap-2 items-center mb-2'>
                          <Calendar className='w-4 h-4 text-primary' />
                          <h4 className='font-cairo text-[13px] font-extrabold text-[#155E75]'>
                            {tr('أيام العمل', 'Work days')}
                          </h4>
                        </div>
                        <p className='font-cairo text-[24px] font-extrabold text-primary'>
                          {availableTimes.length}
                        </p>
                        <p className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                          {availableTimes.map((t) => dayLabels[t.day]).join(' - ')}
                        </p>
                      </div>

                      <div className='rounded-[12px] bg-white/70 p-4 shadow-sm'>
                        <div className='flex gap-2 items-center mb-2'>
                          <Clock className='w-4 h-4 text-primary' />
                          <h4 className='font-cairo text-[13px] font-extrabold text-[#155E75]'>
                            {tr('إعدادات الفترات', 'Slot settings')}
                          </h4>
                        </div>
                        <div className='flex gap-2 items-baseline'>
                          <span className='font-cairo text-[24px] font-extrabold text-primary'>
                            {slotSettings?.duration || 30}
                          </span>
                          <span className='font-cairo text-[13px] font-semibold text-[#667085]'>
                            {tr('دقيقة/موعد', 'min/appointment')}
                          </span>
                        </div>
                        <p className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                          {tr(
                            `فاصل ${slotSettings?.gap || 5} دقائق بين المواعيد`,
                            `${slotSettings?.gap || 5} minute gap between appointments`,
                          )}
                        </p>
                      </div>

                      <div className='rounded-[12px] bg-white/70 p-4 shadow-sm'>
                        <div className='flex gap-2 items-center mb-2'>
                          <AlertCircle className='w-4 h-4 text-primary' />
                          <h4 className='font-cairo text-[13px] font-extrabold text-[#155E75]'>
                            {tr('الاستثناءات', 'Exceptions')}
                          </h4>
                        </div>
                        <p className='font-cairo text-[24px] font-extrabold text-primary'>
                          {exceptions.length}
                        </p>
                        <p className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                          {exceptions.length === 0
                            ? tr('لا توجد أيام مغلقة أو استثناءات', 'No closed days or exceptions')
                            : tr(
                                `${exceptions.length} ${exceptions.length === 1 ? 'يوم' : exceptions.length === 2 ? 'يومان' : 'أيام'} مغلقة أو مخصصة`,
                                `${exceptions.length} closed or custom day${exceptions.length === 1 ? '' : 's'}`,
                              )}
                        </p>
                      </div>

                      <div className='rounded-[12px] bg-white/70 p-4 shadow-sm'>
                        <div className='flex gap-2 items-center mb-2'>
                          <SettingsIcon className='w-4 h-4 text-primary' />
                          <h4 className='font-cairo text-[13px] font-extrabold text-[#155E75]'>
                            {tr('المواعيد المتوقعة', 'Expected appointments')}
                          </h4>
                        </div>
                        <p className='font-cairo text-[24px] font-extrabold text-primary'>
                          {(() => {
                            // Calculate average slots per day
                            const totalMinutesPerDay = availableTimes.reduce((sum, day) => {
                              const dayMinutes = day.slots.reduce((daySum, slot) => {
                                const [startHour, startMin] = slot.startTime.split(':').map(Number);
                                const [endHour, endMin] = slot.endTime.split(':').map(Number);
                                const startMinutes = startHour * 60 + startMin;
                                const endMinutes = endHour * 60 + endMin;
                                return daySum + (endMinutes - startMinutes);
                              }, 0);
                              return sum + dayMinutes;
                            }, 0);

                            const avgMinutes = totalMinutesPerDay / (availableTimes.length || 1);
                            const slotDuration = (slotSettings?.duration || 30) + (slotSettings?.gap || 5);
                            const avgSlots = Math.floor(avgMinutes / slotDuration);

                            return avgSlots;
                          })()}
                        </p>
                        <p className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                          {tr('متوسط عدد المواعيد في اليوم الواحد', 'Average number of appointments per day')}
                        </p>
                      </div>
                    </div>

                    <div className='mt-4 rounded-[10px] bg-primary/5 p-3 border border-primary/10'>
                      <p className='font-cairo text-[12px] font-semibold text-[#155E75]'>
                        <strong className='font-extrabold'>{tr('نصيحة:', 'Tip:')}</strong>{' '}
                        {tr(
                          'استخدم قسم "معاينة الحجوزات" أعلاه لرؤية الفترات المتاحة والمحجوزة في أي تاريخ محدد',
                          'Use the "Bookings preview" section above to see the available and booked slots for any given date',
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </motion.div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={isDeleteDayConfirmOpen}
        onOpenChange={(open) => {
          setIsDeleteDayConfirmOpen(open);
          if (!open) setDayToDelete(null);
        }}
        onConfirm={confirmDeleteDay}
        title={tr('تأكيد حذف اليوم', 'Confirm deleting the day')}
        description={tr(
          `هل أنت متأكد من حذف يوم ${dayToDelete ? dayLabels[dayToDelete] : ''}؟ هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع الفترات المحددة لهذا اليوم من الجدول الأسبوعي.`,
          `Are you sure you want to delete ${dayToDelete ? dayLabels[dayToDelete] : ''}? This action cannot be undone. All time slots set for this day will be removed from the weekly schedule.`,
        )}
        confirmText={tr('حذف اليوم', 'Delete day')}
        cancelText={tr('إلغاء', 'Cancel')}
        variant='danger'
        isLoading={isDeletingDay}
      />

      <ConfirmDialog
        open={isDeleteExceptionConfirmOpen}
        onOpenChange={(open) => {
          setIsDeleteExceptionConfirmOpen(open);
          if (!open) setExceptionToDelete(null);
        }}
        onConfirm={confirmDeleteException}
        title={tr('تأكيد حذف الاستثناء', 'Confirm deleting the exception')}
        description={tr(
          'هل أنت متأكد من حذف هذا الاستثناء؟ سيتم استرجاع الجدول الأسبوعي العادي لهذا التاريخ.',
          'Are you sure you want to delete this exception? The regular weekly schedule will be restored for this date.',
        )}
        confirmText={tr('حذف الاستثناء', 'Delete exception')}
        cancelText={tr('إلغاء', 'Cancel')}
        variant='warning'
        isLoading={isDeletingException}
      />

      <ScheduleConflictDialog
        open={isConflictDialogOpen}
        onOpenChange={setIsConflictDialogOpen}
        data={conflictData}
        onViewAppointments={() => {
          setIsConflictDialogOpen(false);
          navigate('/doctor/appointments');
        }}
      />
    </>
  );
}
