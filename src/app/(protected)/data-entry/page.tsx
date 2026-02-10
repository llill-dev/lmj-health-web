import { PageHeader } from "@/components/common/page-header";

export default function DataEntryHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Entry"
        description="High-assurance forms for services and updates."
      />
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Placeholder. Build strict forms with Zod + react-hook-form here.
      </div>
    </div>
  );
}
