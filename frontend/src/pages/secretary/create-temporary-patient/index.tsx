import { useState } from "react";
import { UserPlus, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function SurfaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <h2 className="text-right font-cairo text-[23px] font-black leading-none text-[#243044]">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function FormField({
  label,
  children,
  required = false,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  icon?: typeof Phone;
}) {
  return (
    <div className="space-y-2">
      <label className="block font-cairo text-[14px] font-bold text-[#243044]">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {Icon && (
        <div className="relative">
          {children}
          <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-[#98A2B3]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      )}
      {!Icon && children}
    </div>
  );
}

export default function SecretaryCreateTemporaryPatientPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");

  return (
    <div dir="rtl" lang="ar" className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title="إنشاء مريض مؤقت">
        <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="space-y-6">
            <FormField label="الاسم الكامل" required>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسم المريض الكامل…"
                className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
              />
            </FormField>

            <FormField label="رقم الهاتف" required icon={Phone}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="أدخل رقم الهاتف…"
                className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 pl-10 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
              />
            </FormField>

            <FormField label="البريد الإلكتروني" icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل البريد الإلكتروني…"
                className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 pl-10 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
              />
            </FormField>

            <FormField label="تاريخ الميلاد" icon={Calendar}>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 pl-10 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none focus:border-primary"
              />
            </FormField>

            <FormField label="العنوان" icon={MapPin}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="أدخل العنوان…"
                className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 pl-10 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
              />
            </FormField>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex h-[48px] w-full items-center justify-center rounded-[8px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.25)] transition hover:bg-[#0A7A77]"
              >
                <UserPlus className="ml-2 h-4 w-4" />
                إنشاء مريض مؤقت
              </button>
              <Link
                to="/secretary/patients"
                className="flex h-[48px] w-full items-center justify-center rounded-[8px] border-[1.5px] border-primary bg-white font-cairo text-[14px] font-extrabold text-primary shadow-[0px_6px_16px_-4px_rgba(15,143,139,0.2)] transition hover:bg-[#F0FAFA]"
              >
                إلغاء
              </Link>
            </div>
          </div>
        </div>
      </SurfaceSection>
    </div>
  );
}
