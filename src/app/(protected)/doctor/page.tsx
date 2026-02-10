import { PageHeader } from "@/components/common/page-header";

export default function DoctorHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Workspace"
        description="Schedule, linked patients, tickets, and records overview."
      />
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Placeholder. Add calendar and permission-aware panels here.
      </div>
    </div>
  );
}
