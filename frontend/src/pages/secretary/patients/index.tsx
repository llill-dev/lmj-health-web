import { UserPlus } from "lucide-react";
import PageHeader from "@/components/secretary/shared/PageHeader";
import SearchFilterBar from "@/components/secretary/shared/SearchFilterBar";
import PatientsTable from "@/components/secretary/patients/PatientsTable";

export default function SecretaryPatientsPage() {
  const patients = [
    {
      id: "1234567890",
      name: "سارة علي",
      phone: "+966506789012",
      email: "sara@example.com",
      registrationDate: "2024-01-15",
    },
    {
      id: "0987654321",
      name: "أحمد نور",
      phone: "+966598765432",
      email: "ahmed@example.com",
      registrationDate: "2024-02-20",
    },
    {
      id: "1122334455",
      name: "ليلى محمد",
      phone: "+966511223344",
      email: "layla@example.com",
      registrationDate: "2024-03-10",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="المرضى"
        subtitle="إدارة ملفات المرضى"
        actionButton={{
          label: "إضافة مريض مؤقت",
          icon: UserPlus,
          variant: "primary",
        }}
      />

      <SearchFilterBar searchPlaceholder="بحث عن مريض..." />

      <PatientsTable patients={patients} />
    </div>
  );
}
