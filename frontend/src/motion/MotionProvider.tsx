import type { PropsWithChildren } from 'react';
import { MotionConfig } from 'framer-motion';

export default function MotionProvider({ children }: PropsWithChildren) {
  return <MotionConfig reducedMotion='user'>{children}</MotionConfig>;
}
