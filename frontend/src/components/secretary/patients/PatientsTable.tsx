import { LucideIcon } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  registrationDate: string;
}

interface PatientsTableProps {
  patients: Patient[];
  onViewPatient?: (patient: Patient) => void;
}

export default function PatientsTable({
  patients,
  onViewPatient,
}: PatientsTableProps) {
  const getInitials = (name: string) => {
    return name.charAt(0);
  };

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-gray-50">
              <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                الاسم
              </th>
              <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                رقم الهاتف
              </th>
              <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                البريد الإلكتروني
              </th>
              <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                تاريخ التسجيل
              </th>
              <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr
                key={patient.id}
                className={index !== patients.length - 1 ? "border-b border-[#e2e8f0]" : ""}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-cairo text-sm font-bold text-primary">
                      {getInitials(patient.name)}
                    </div>
                    <div>
                      <p className="font-cairo text-sm font-bold text-[#0f172a]">
                        {patient.name}
                      </p>
                      <p className="font-cairo text-xs font-medium text-[#64748b]">
                        {patient.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-cairo text-sm text-[#0f172a]">
                    {patient.phone}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-cairo text-sm text-[#0f172a]">
                    {patient.email}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-cairo text-sm text-[#0f172a]">
                    {patient.registrationDate}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewPatient?.(patient)}
                    className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90"
                  >
                    عرض
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
