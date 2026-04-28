export default function SettingsField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className='space-y-2'>
      <div className='text-right font-cairo text-[12px] font-bold text-[#344054]'>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='h-[40px] w-full rounded-[8px] border border-[#EAECF0] bg-white px-4 font-cairo text-[12px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3] focus:border-[#BFEDEC] focus:ring-2 focus:ring-[#16C5C020]'
      />
    </div>
  );
}
