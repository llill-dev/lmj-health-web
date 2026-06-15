"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { doctorApi, doctorScheduleQueryKeys } from "@/lib/doctor/client";
import type {
  DoctorUpdateScheduleBody,
  DoctorUpdateScheduleSettingsBody,
  DoctorAddDayBody,
  DoctorUpdateDayBody,
  ScheduleDayKey,
  ScheduleTimeSlot,
  DoctorAddExceptionBody,
  DoctorUpdateExceptionsBody,
} from "@/lib/doctor/types";
import { readAuthUser } from "@/lib/cookies";

// Get doctor ID from auth
function getDoctorId(): string {
  const authUser = readAuthUser();
  return authUser?.actorIds?.doctorId || "";
}

// GET /doctors/:doctorId/schedule
export function useSchedule() {
  const doctorId = getDoctorId();
  
  const { data, isError, error, refetch } = useQuery({
    queryKey: doctorScheduleQueryKeys.detail(doctorId),
    queryFn: async () => {
      const response = await doctorApi.schedule.get();
      // Return raw API format: { availableTimes, exceptions, slotSettings }
      return response;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!doctorId,
  });

  return {
    workSchedule: data,
    isAwaitingData: isAwaitingInitialQueryData(data, isError),
    /** @deprecated use isAwaitingData */
    isLoading: isAwaitingInitialQueryData(data, isError),
    error,
    refetch,
  };
}

// PUT /doctors/:doctorId/schedule (full replacement)
export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  const doctorId = getDoctorId();

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      // Convert UI format to API format
      // UI sends: { settings: {appointmentDuration, breakStart, breakEnd}, weekly: {sunday: {enabled, from, to}}, exceptions: [{id, title, date}] }
      // API expects: { availableTimes: [{day, slots}], exceptions: [{date, slots, note}] }
      
      const availableTimes: DoctorUpdateScheduleBody['availableTimes'] = [];
      
      // Convert weekly to availableTimes
      const dayMapping: Record<string, ScheduleDayKey> = {
        sunday: 'Sunday',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
      };
      
      Object.entries(payload.weekly || {}).forEach(([dayKey, dayData]: [string, any]) => {
        if (dayData.enabled && dayData.from && dayData.to) {
          availableTimes.push({
            day: dayMapping[dayKey],
            slots: [{ startTime: dayData.from, endTime: dayData.to }],
          });
        }
      });
      
      // Convert exceptions
      const exceptions: DoctorUpdateScheduleBody['exceptions'] = (payload.exceptions || []).map((ex: any) => ({
        _id: ex.id !== `${Date.now()}-${Math.random()}` ? ex.id : undefined,
        date: ex.date,
        slots: [], // Empty slots for exceptions means "day off"
        note: ex.title,
      }));
      
      const apiPayload: DoctorUpdateScheduleBody = {
        availableTimes,
        exceptions,
      };
      
      // Also update settings if provided
      if (payload.settings?.appointmentDuration) {
        await doctorApi.schedule.updateSettings({
          duration: parseInt(payload.settings.appointmentDuration),
          gap: 5, // Default gap
        });
      }
      
      return doctorApi.schedule.update(apiPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleQueryKeys.all });
    },
  });

  return {
    updateSchedule: mutation.mutate,
    updateScheduleAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// PATCH /doctors/:doctorId/schedule/settings
export function useUpdateScheduleSettings() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: DoctorUpdateScheduleSettingsBody) => doctorApi.schedule.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleQueryKeys.all });
    },
  });

  return {
    updateSettings: mutation.mutate,
    updateSettingsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// POST /doctors/:doctorId/schedule/day
export function useAddScheduleDay() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: DoctorAddDayBody) => doctorApi.schedule.addDay(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleQueryKeys.all });
    },
  });

  return {
    addDay: mutation.mutate,
    addDayAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// PATCH /doctors/:doctorId/schedule/day/:day
export function useUpdateScheduleDay() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ day, slots }: { day: ScheduleDayKey; slots: ScheduleTimeSlot[] }) => 
      doctorApi.schedule.updateDay(day, { slots }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleQueryKeys.all });
    },
  });

  return {
    updateDay: mutation.mutate,
    updateDayAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// DELETE /doctors/:doctorId/schedule/day/:day
export function useDeleteScheduleDay() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (day: ScheduleDayKey) => doctorApi.schedule.deleteDay(day),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleQueryKeys.all });
    },
  });

  return {
    deleteDay: mutation.mutate,
    deleteDayAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// POST /doctors/:doctorId/schedule/exception
export function useAddScheduleException() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: DoctorAddExceptionBody) => doctorApi.schedule.addException(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleQueryKeys.all });
    },
  });

  return {
    addException: mutation.mutate,
    addExceptionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// PATCH /doctors/:doctorId/schedule/exceptions
export function useUpdateScheduleExceptions() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: DoctorUpdateExceptionsBody) => doctorApi.schedule.updateExceptions(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleQueryKeys.all });
    },
  });

  return {
    updateExceptions: mutation.mutate,
    updateExceptionsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// DELETE /doctors/:doctorId/schedule/exception/:exceptionId
export function useDeleteScheduleException() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (exceptionId: string) => doctorApi.schedule.deleteException(exceptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleQueryKeys.all });
    },
  });

  return {
    deleteException: mutation.mutate,
    deleteExceptionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy aliases (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use useSchedule() instead
 */
export const useWorkSchedule = useSchedule;

/**
 * @deprecated Use useUpdateSchedule() instead
 */
export const useUpdateWorkSchedule = useUpdateSchedule;
