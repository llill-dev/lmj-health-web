import { LucideIcon } from "lucide-react";

interface SecretaryInfoCardProps {
  name: string;
  role: string;
  initials: string;
}

export default function SecretaryInfoCard({
  name,
  role,
  initials,
}: SecretaryInfoCardProps) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white font-cairo text-2xl font-bold shadow-[0_12px_28px_rgba(15,143,139,0.32)]">
          {initials}
        </div>
        <div className="flex-1">
          <h2 className="font-cairo text-xl font-bold text-[#0f172a]">{name}</h2>
          <p className="font-cairo text-sm font-medium text-[#64748b]">{role}</p>
        </div>
      </div>
    </div>
  );
}
