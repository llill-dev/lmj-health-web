import { describe, expect, it } from 'vitest';
import { activityLogPeriodRange } from '@/lib/doctor/activityLog/period';
import {
  getActivityTypeLabel,
  mapDoctorActivityLogItem,
  resolveActivityLogActionType,
} from '@/lib/doctor/activityLog/mappers';

describe('doctor activity log mappers', () => {
  it('maps login_success into UI card model', () => {
    const mapped = mapDoctorActivityLogItem({
      _id: 'log-1',
      type: 'login_success',
      actorRole: 'doctor',
      actorDisplayName: 'د. منى',
      entityType: 'User',
      entityId: 'user-1',
      occurredAt: '2026-06-11T10:30:00.000Z',
      details: {
        credential: 'email',
        clientType: 'doctor_mobile',
      },
    });

    expect(mapped).toMatchObject({
      id: 'log-1',
      actionType: 'login',
      operationTypeLabel: 'تسجيل دخول ناجح',
      actorDisplayName: 'د. منى',
      device: 'تطبيق الطبيب',
    });
    expect(mapped.title).toContain('تسجيل الدخول');
  });

  it('maps appointment events with patient context', () => {
    const mapped = mapDoctorActivityLogItem({
      _id: 'log-2',
      type: 'appointment_booked',
      actorRole: 'patient',
      actorDisplayName: 'سارة علي',
      entityType: 'Appointment',
      entityId: 'appt-1',
      occurredAt: '2026-06-10T08:00:00.000Z',
      details: {
        patientName: 'سارة علي',
        status: 'scheduled',
      },
    });

    expect(mapped.actionType).toBe('appointment');
    expect(mapped.patientName).toBe('سارة علي');
    expect(mapped.title).toContain('سارة علي');
  });

  it('resolves action types and labels safely', () => {
    expect(resolveActivityLogActionType('medical_record_opened')).toBe(
      'view_record',
    );
    expect(getActivityTypeLabel('access_request_decided')).toBe(
      'قرار طلب وصول',
    );
  });

  it('builds period ranges for API filters', () => {
    expect(activityLogPeriodRange('all')).toEqual({});
    const today = activityLogPeriodRange('today');
    expect(today.from).toBeTruthy();
    expect(today.to).toBeTruthy();
  });
});
