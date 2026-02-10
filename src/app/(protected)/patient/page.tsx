import { PageHeader } from "@/components/common/page-header";

export default function PatientHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Dashboard"
        description="Personal health workspace: appointments, records, consents."
      />
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        This is a placeholder. Implement role-aware widgets here.
      </div>
    </div>
  );
}
