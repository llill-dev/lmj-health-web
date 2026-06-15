import { describe, expect, it } from 'vitest';

import {
  buildPatientWeeklyActivityChart,
  getLastSevenDaysRange,
  scaleWeeklyBarHeight,
} from './buildPatientWeeklyActivityChart';

describe('buildPatientWeeklyActivityChart', () => {
  it('groups unique patients per day for the last 7 days', () => {
    const reference = new Date('2026-06-11T12:00:00');
    const { dateFrom, dateTo } = getLastSevenDaysRange(reference);

    const chart = buildPatientWeeklyActivityChart(
      [
        { date: dateFrom, patient: { _id: 'p1' } },
        { date: dateFrom, patient: { _id: 'p1' } },
        { date: dateFrom, patient: { _id: 'p2' } },
        { date: dateTo, patient: { _id: 'p3' } },
      ],
      reference,
    );

    expect(chart.bars).toHaveLength(7);
    expect(chart.bars[0]?.patientCount).toBe(2);
    expect(chart.bars[0]?.appointmentCount).toBe(3);
    expect(chart.bars[0]?.value).toBe(3);
    expect(chart.bars.at(-1)?.patientCount).toBe(1);
    expect(chart.totalUniquePatients).toBe(3);
    expect(chart.totalAppointments).toBe(4);
  });

  it('scales bar height proportionally from backend counts', () => {
    expect(scaleWeeklyBarHeight(0, 5)).toBe(6);
    expect(scaleWeeklyBarHeight(5, 5)).toBe(120);
    expect(scaleWeeklyBarHeight(1, 4)).toBe(51);
    expect(scaleWeeklyBarHeight(2, 4)).toBe(74);
  });
});
