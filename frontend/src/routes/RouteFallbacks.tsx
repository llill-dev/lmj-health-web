import type { ReactNode } from "react";
import AuthBackground from "@/components/auth/AuthBackground";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/admin/analytics/AnalyticsSkeletons";
import {
  DoctorDashboardSkeleton,
  DoctorInlineDetailsSkeleton,
  DoctorListPageSkeleton,
  DoctorNotificationListSkeleton,
  DoctorProfileFormSkeleton,
  DoctorScheduleSkeleton,
  DoctorSummaryPageSkeleton,
  DoctorWorkspaceFormSkeleton,
} from "@/components/doctor/shared/skeletons";

export function PublicRouteFallback() {
  return (
    <AuthBackground className="flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[12px] bg-white/95 shadow-[0_28px_80px_rgba(0,0,0,0.12)]">
        <div className="h-[4px] w-full bg-gradient-to-r from-[#0F8F8B] via-[#65BFEC] to-[#0F8F8B]" />
        <div className="space-y-6 px-6 py-8 sm:px-8">
          <div className="mx-auto h-8 w-40 animate-pulse rounded bg-[#E6EEF5]" />
          <div className="mx-auto h-4 w-56 animate-pulse rounded bg-[#EEF2F6]" />
          <div className="space-y-4">
            <div className="h-12 w-full animate-pulse rounded-[10px] bg-[#EEF2F6]" />
            <div className="h-12 w-full animate-pulse rounded-[10px] bg-[#EEF2F6]" />
            <div className="h-12 w-full animate-pulse rounded-[10px] bg-[#E0F2FE]" />
          </div>
        </div>
      </div>
    </AuthBackground>
  );
}

export function DoctorRouteFallback() {
  return <DoctorListPageSkeleton withStats />;
}

export function DoctorDashboardRouteFallback() {
  return <DoctorDashboardSkeleton />;
}

export function DoctorScheduleRouteFallback() {
  return <DoctorScheduleSkeleton />;
}

export function DoctorProfileRouteFallback() {
  return <DoctorProfileFormSkeleton />;
}

export function DoctorNotificationRouteFallback() {
  return <DoctorNotificationListSkeleton />;
}

export function DoctorDetailsRouteFallback() {
  return <DoctorInlineDetailsSkeleton />;
}

export function DoctorSummaryRouteFallback() {
  return <DoctorSummaryPageSkeleton />;
}

export function DoctorWorkspaceRouteFallback() {
  return <DoctorWorkspaceFormSkeleton />;
}

function AdminShellFallback({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded bg-[#E5E7EB]" />
        <div className="h-4 w-72 animate-pulse rounded bg-[#EEF2F6]" />
      </div>
      {children}
    </div>
  );
}

export function AdminRouteFallback() {
  return (
    <AdminShellFallback>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white">
        <div className="space-y-4 p-6">
          <div className="h-11 w-full animate-pulse rounded-[10px] bg-[#F3F4F6]" />
          <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6]">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <TableRowSkeleton key={index} cols={6} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShellFallback>
  );
}
