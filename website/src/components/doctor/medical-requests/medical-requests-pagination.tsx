import DoctorTablePagination from '@/components/doctor/shared/doctor-table-pagination';

export function MedicalRequestsPagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
}) {
  return (
    <DoctorTablePagination
      page={page}
      totalPages={totalPages}
      pageSize={pageSize}
      pageSizeOptions={[8, 12, 20, 50]}
      disabled={disabled}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
