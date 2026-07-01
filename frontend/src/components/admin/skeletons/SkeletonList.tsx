import { createStaggeredDelay } from './admin-skeleton-primitives';

interface SkeletonListProps {
  count: number;
  SkeletonComponent: React.ComponentType<{ index?: number }>;
  className?: string;
}

export function SkeletonList({ count, SkeletonComponent, className }: SkeletonListProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} index={index} />
      ))}
    </div>
  );
}
