import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from './variants';

export default function PageTransition({ children }: PropsWithChildren) {
  return (
    <motion.div
      variants={fadeInUp}
      initial='hidden'
      animate='show'
      exit='exit'
      className='w-full min-h-0'
    >
      {children}
    </motion.div>
  );
}
