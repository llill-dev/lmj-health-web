import {
  Search,
  Filter,
  FileText,
  Calendar,
  Download,
  Eye,
} from "lucide-react";

export default function SecretaryPatientFilesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">
            ملفات المرضى
          </h1>
          <p className="font-cairo text-sm font-medium text-[#64748b] mt-1">
            إدارة ملفات المرضى الطبية
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="بحث عن ملف..."
            className="flex-1 bg-transparent font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          تصفية
        </button>
      </div>

      {/* Files Table */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-gray-50">
                <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                  المريض
                </th>
                <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                  نوع الملف
                </th>
                <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e2e8f0]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-cairo text-sm font-bold text-primary">
                      س
                    </div>
                    <div>
                      <p className="font-cairo text-sm font-bold text-[#0f172a]">
                        سارة علي
                      </p>
                      <p className="font-cairo text-xs font-medium text-[#64748b]">
                        1234567890
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#64748b]" />
                    <span className="font-cairo text-sm text-[#0f172a]">
                      تقرير طبي
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#64748b]" />
                    <span className="font-cairo text-sm text-[#0f172a]">
                      2024-01-15
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-cairo text-sm font-bold text-primary">
                      أ
                    </div>
                    <div>
                      <p className="font-cairo text-sm font-bold text-[#0f172a]">
                        أحمد نور
                      </p>
                      <p className="font-cairo text-xs font-medium text-[#64748b]">
                        0987654321
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#64748b]" />
                    <span className="font-cairo text-sm text-[#0f172a]">
                      وصفة طبية
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#64748b]" />
                    <span className="font-cairo text-sm text-[#0f172a]">
                      2024-01-15
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
