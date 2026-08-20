interface StatisticsCardProps {
  title: string;
  stats: {
    label: string;
    value: number;
  }[];
}

export default function StatisticsCard({ title, stats }: StatisticsCardProps) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
      <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat, index) => (
          <div key={index}>
            <p className="font-cairo text-xs font-medium text-[#64748b]">
              {stat.label}
            </p>
            <p className="font-cairo text-2xl font-bold text-[#0f172a]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
