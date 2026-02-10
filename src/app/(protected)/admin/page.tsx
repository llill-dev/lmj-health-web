import { PageHeader } from "@/components/common/page-header";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Approvals, monitoring, audits, and system control."
      />
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Placeholder. Prepare for heavy tables with virtualization.
      </div>
    </div>
  );
}
