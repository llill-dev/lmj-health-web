import type { ReactNode } from 'react';
import { Star } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DiagnosisChartItem, DoctorSummaryStats } from '@/lib/admin/types';
import { scaleToChartBand } from '@/lib/admin/doctorAdminAnalytics';

const TEAL = '#0F8F8B';
const GRID = '#EEF2F6';
const AXIS = '#64748B';

type Props = {
  diagnosisItems: DiagnosisChartItem[];
  summary: DoctorSummaryStats;
  isDiagnosisLoading: boolean;
  isSummaryLoading: boolean;
  hasDiagnosisError: boolean;
  hasSummaryError: boolean;
};

function PanelTitle({ children }: { children: string }) {
  return (
    <h2 className='mb-3 text-xl font-bold leading-snug text-primary sm:mb-4 sm:text-2xl md:text-[25px] md:leading-[35px]'>
      {children}
    </h2>
  );
}

function ChartCard({ children }: { children: ReactNode }) {
  return (
    <div className='h-[min(22rem,70vw)] w-full min-h-[200px] rounded-[6px] border border-[#E5E7EB] bg-[#FAFBFC] p-2 sm:p-3'>
      {children}
    </div>
  );
}

function DiagnosisTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { label?: string; value?: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  if (!p) return null;
  return (
    <div className='rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-right font-cairo text-xs shadow-sm'>
      <div className='font-bold text-[#101828]'>
        {(p as { fullLabel?: string; label?: string }).fullLabel ?? p.label}
      </div>
      <div
        className='mt-0.5 text-primary'
        dir='ltr'
      >
        {p.value}
      </div>
    </div>
  );
}

function StatTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: {
      name?: string;
      listName?: string;
      raw?: number;
      chartValue?: number;
    };
  }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  if (!p) return null;
  return (
    <div className='rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-right font-cairo text-xs shadow-sm'>
      <div className='font-bold text-[#101828]'>
        {p.listName ?? p.name}
      </div>
      <div className='mt-0.5 text-primary' dir='ltr'>
        {p.raw}
      </div>
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  const v = Math.min(5, Math.max(0, value));
  const filled = Math.min(5, Math.round(v));
  return (
    <div
      className='mt-0.5 flex items-center justify-end gap-0.5'
      dir='ltr'
      role='img'
      aria-label={`تقييم ${v.toFixed(1)} من 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className='h-5 w-5 sm:h-6 sm:w-6'
          fill={i <= filled ? 'currentColor' : 'none'}
          stroke='currentColor'
          strokeWidth={1.2}
          style={{
            color: i <= filled ? '#EAB308' : '#D1D5DB',
          }}
        />
      ))}
    </div>
  );
}

export function AdminDoctorAnalyticsPanels({
  diagnosisItems,
  summary,
  isDiagnosisLoading,
  isSummaryLoading,
  hasDiagnosisError,
  hasSummaryError,
}: Props) {
  const diagnosisChart = diagnosisItems.map((d) => ({
    label:
      d.label.length > 16 ? `${d.label.slice(0, 15).trimEnd()}…` : d.label,
    fullLabel: d.label,
    value: d.value,
  }));
  const maxDiag = Math.max(1, ...diagnosisItems.map((d) => d.value));

  const statRows: {
    name: string;
    chartName: string;
    key: keyof DoctorSummaryStats;
    raw: number;
  }[] = [
    { name: 'المرضى الجدد', chartName: 'المرضى', key: 'patients', raw: summary.patients },
    { name: 'المواعيد المكتملة', chartName: 'المواعيد', key: 'visits', raw: summary.visits },
    { name: 'السجلات الطبية', chartName: 'السجلات', key: 'diagnoses', raw: summary.diagnoses },
    { name: 'التقييمات', chartName: 'التقييمات', key: 'ratings', raw: summary.ratings },
  ];
  const band = scaleToChartBand(statRows.map((r) => r.raw));
  const statChart = statRows.map((r, i) => ({
    name: r.chartName,
    listName: r.name,
    raw: r.raw,
    chartValue: band[i] ?? 0,
  }));

  return (
    <>
      <section>
        <PanelTitle>التشخيصات المرضية</PanelTitle>
        <div className='rounded-[6px] border-[1.82px] border-[#F3F4F6] bg-white p-4 shadow-[0px_1px_3px_0px_#0000001A] sm:p-5 md:p-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 md:items-stretch'>
            <div className='flex min-w-0 flex-col gap-3'>
              {isDiagnosisLoading ? (
                <p className='font-cairo text-sm text-[#667085]'>جاري تحميل التشخيصات…</p>
              ) : hasDiagnosisError ? (
                <p className='font-cairo text-sm text-amber-800'>
                  تعذر تحميل بيانات التشخيصات.
                </p>
              ) : diagnosisItems.length === 0 ? (
                <p className='font-cairo text-sm text-[#667085]'>لا توجد تشخيصات في هذه الفترة.</p>
              ) : (
                <ul className='flex max-h-80 flex-col gap-2.5 overflow-y-auto pe-0.5'>
                  {diagnosisItems.map((d, i) => (
                    <li
                      key={`${d.label}-${i}`}
                      className='flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0 border-b border-[#F3F4F6] py-1.5 text-right last:border-0'
                    >
                      <span className='min-w-0 break-words font-cairo text-sm font-bold text-primary sm:text-base'>
                        {d.label}
                      </span>
                      <span className='shrink-0 font-cairo text-sm font-semibold text-[#1F2937] sm:text-base'>
                        {d.value.toLocaleString('ar-SY')}{' '}
                        <span className='text-[#6B7280]'>حالة</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div
              className='min-h-[220px] min-w-0'
              dir='ltr'
            >
              {!isDiagnosisLoading && !hasDiagnosisError && diagnosisItems.length > 0 ? (
                <ChartCard>
                  <ResponsiveContainer
                    width='100%'
                    height='100%'
                  >
                    <BarChart
                      data={diagnosisChart}
                      margin={{ top: 10, right: 8, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid
                        stroke={GRID}
                        vertical={false}
                        strokeDasharray='3 3'
                      />
                      <XAxis
                        dataKey='label'
                        tick={{ fontSize: 10, fill: AXIS }}
                        height={68}
                        interval={0}
                        angle={-22}
                        textAnchor='end'
                        axisLine={{ stroke: '#CBD5E1' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: AXIS }}
                        width={32}
                        domain={[0, Math.max(5, maxDiag * 1.1)]}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        content={<DiagnosisTooltip />}
                        cursor={{ fill: 'rgba(15, 143, 139, 0.06)' }}
                      />
                      <Bar
                        dataKey='value'
                        name='count'
                        fill={TEAL}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                        activeBar={{ fill: '#0D7A77' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              ) : isDiagnosisLoading || hasDiagnosisError || diagnosisItems.length === 0 ? (
                <div className='flex h-[200px] items-center justify-center rounded-[6px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] font-cairo text-sm text-[#98A2B3]'>
                  المخطط
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section>
        <PanelTitle>الإحصائيات</PanelTitle>
        <div className='rounded-[6px] border-[1.82px] border-[#F3F4F6] bg-white p-4 shadow-[0px_1px_3px_0px_#0000001A] sm:p-5 md:p-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 md:items-stretch'>
            <ul className='flex min-w-0 flex-col gap-2.5'>
              {isSummaryLoading ? (
                <li className='font-cairo text-sm text-[#667085]'>جاري تحميل الإحصائيات…</li>
              ) : hasSummaryError ? (
                <li className='font-cairo text-sm text-amber-800'>تعذر تحميل الملخّص.</li>
              ) : (
                <>
                  {statRows.map((r) => (
                    <li
                      key={r.key}
                      className='flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0 border-b border-[#F3F4F6] py-1.5 last:border-0'
                    >
                      <span className='font-cairo text-sm font-bold text-primary sm:text-base'>
                        {`عدد ${r.name}`}
                      </span>
                      <span
                        className='font-cairo text-sm font-semibold text-[#1F2937] sm:text-base'
                        dir='ltr'
                      >
                        {r.raw.toLocaleString('ar-SY')}
                      </span>
                    </li>
                  ))}
                  <li className='flex flex-col gap-0.5 border-b border-[#F3F4F6] py-1.5 last:border-0 sm:flex-row sm:items-center sm:justify-between'>
                    <span className='shrink-0 font-cairo text-sm font-bold text-primary sm:text-base'>
                      متوسط التقييم
                    </span>
                    <StarRating value={summary.averageRating} />
                  </li>
                </>
              )}
            </ul>
            <div
              className='min-h-[220px] min-w-0'
              dir='ltr'
            >
              {!isSummaryLoading && !hasSummaryError ? (
                <ChartCard>
                  <ResponsiveContainer
                    width='100%'
                    height='100%'
                  >
                    <BarChart
                      data={statChart}
                      margin={{ top: 10, right: 8, left: 4, bottom: 8 }}
                    >
                      <CartesianGrid
                        stroke={GRID}
                        vertical={false}
                        strokeDasharray='3 3'
                      />
                      <XAxis
                        dataKey='name'
                        tick={{ fontSize: 11, fill: AXIS }}
                        height={40}
                        interval={0}
                        axisLine={{ stroke: '#CBD5E1' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: AXIS }}
                        width={32}
                        domain={[0, 220]}
                        tickLine={false}
                        axisLine={false}
                        tickCount={5}
                      />
                      <Tooltip
                        content={<StatTooltip />}
                        cursor={{ fill: 'rgba(15, 143, 139, 0.06)' }}
                      />
                      <Bar
                        dataKey='chartValue'
                        name='val'
                        fill={TEAL}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                        activeBar={{ fill: '#0D7A77' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              ) : (
                <div className='flex h-[200px] items-center justify-center rounded-[6px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] font-cairo text-sm text-[#98A2B3]'>
                  المخطط
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
