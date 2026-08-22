export function StatCardSkeleton() {
  return (
    <div className='h-[147px] animate-pulse rounded-[12px] border border-[#EEF2F6] bg-[#F9FAFB]' />
  );
}

export function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td
          key={i}
          className='px-4 py-4'
        >
          <div className='h-3 animate-pulse rounded bg-[#EEF2F6]' />
        </td>
      ))}
    </tr>
  );
}
