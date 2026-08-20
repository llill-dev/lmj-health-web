'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  ExpenseBreakdownPoint,
  MonthlyFinancePoint,
  WeeklyOverviewPoint,
} from '@/lib/doctor/clinicAccounts/types';
import { formatBillingNumber, formatUsd } from '@/lib/doctor/billing/format';
import { useI18n } from '@/i18n/provider';

const formatAxisTick = (value: number) =>
  formatBillingNumber(value, { maximumFractionDigits: 0 });

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: '1px solid #EEF2F6',
  fontFamily: 'Cairo, sans-serif',
  fontSize: 12,
};

export function AccountsOverviewChart({
  data,
}: {
  data: WeeklyOverviewPoint[];
}) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={6} barCategoryGap="18%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F6" />
          <XAxis
            dataKey="week"
            tick={{ fill: '#667085', fontSize: 12, fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#667085', fontSize: 12, fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisTick}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatUsd(Number(v))} />
          <Legend
            wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12 }}
            formatter={(value) =>
              value === 'income'
                ? tr('دخل', 'Income')
                : value === 'expenses'
                  ? tr('مصاريف', 'Expenses')
                  : tr('أرباح', 'Profit')
            }
          />
          <Bar dataKey="income" name="income" fill="#0F8F8B" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" name="expenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
          <Bar dataKey="profit" name="profit" fill="#5EEAD4" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinancialBarChart({ data }: { data: MonthlyFinancePoint[] }) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F6" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#667085', fontSize: 12, fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#667085', fontSize: 12, fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisTick}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatUsd(Number(v))} />
          <Legend wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12 }} />
          <Bar
            dataKey="income"
            name={tr('دخل', 'Income')}
            fill="#0F8F8B"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="expenses"
            name={tr('مصاريف', 'Expenses')}
            fill="#EF4444"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinancialLineChart({ data }: { data: MonthlyFinancePoint[] }) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F6" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#667085', fontSize: 12, fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#667085', fontSize: 12, fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisTick}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatUsd(Number(v))} />
          <Line
            type="monotone"
            dataKey="profit"
            name={tr('ربح', 'Profit')}
            stroke="#0F8F8B"
            strokeWidth={3}
            dot={{ r: 5, fill: '#0F8F8B' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpensePieChart({ data }: { data: ExpenseBreakdownPoint[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatUsd(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpensePieLegend({ data }: { data: ExpenseBreakdownPoint[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {data.map((item) => (
        <div
          key={item.category}
          className="flex items-center justify-between gap-2 rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2"
        >
          <span className="font-cairo text-[13px] font-extrabold text-[#111827]">
            {formatUsd(item.value)}
          </span>
          <span className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
            {item.label}
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
          </span>
        </div>
      ))}
    </div>
  );
}
