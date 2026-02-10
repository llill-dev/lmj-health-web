import { PageHeader } from "@/components/common/page-header";

export default function SecretaryHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Secretary Workspace"
        description="Doctor-scoped operations: booking, patient onboarding."
      />
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Placeholder. Restricted actions mirror the assigned doctor.
      </div>
    </div>
  );
}
