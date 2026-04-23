'use client';
import { motion } from 'framer-motion';

type Props = {
  /** حالة مزامنة من الخادم (لا يتغيّر محلياً عند الضغط — التأكيد عبر الـ dialog) */
  isActive: boolean;
  disabled?: boolean;
  /** الضغط يطلب تغيير الحالة: يفتح الـ parent حوار التأكيد */
  onRequestToggle: () => void;
  /** للقارئات الشاشة */
  name?: string;
};

const TRACK_W = 44;
const THUMB = 20;
const PAD = 2;
const xOn = TRACK_W - THUMB - PAD * 2;

const spring = { type: 'spring' as const, stiffness: 520, damping: 34, mass: 0.4 };

/**
 * مفتاح تبديل (pill) بلون البرايماري عند التفعيل — يطابق تخطيط RTL للوحة الإدارة.
 * التغيير الفعلي عبر تأكيد أبٍ (Dialog).
 */
export default function ServiceTypeActiveToggle({
  isActive,
  disabled,
  onRequestToggle,
  name,
}: Props) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={isActive}
      disabled={disabled}
      name={name}
      onClick={() => onRequestToggle()}
      className='relative h-6 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-55'
    >
      <span className='sr-only'>
        {isActive ? 'تعطيل — يطلب التأكيد' : 'تفعيل — يطلب التأكيد'}
      </span>
      {/* ltr: ثبات اتجاه حركة الدائرة كما في التصميم */}
      <span
        dir='ltr'
        className={
          isActive
            ? 'relative block h-6 w-11 overflow-hidden rounded-full border border-black/[0.04] bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-colors duration-200'
            : 'relative block h-6 w-11 overflow-hidden rounded-full border border-black/[0.04] bg-[#E5E7EB] transition-colors duration-200'
        }
      >
        <motion.span
          className='absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)]'
          style={{ left: PAD }}
          initial={false}
          animate={{ x: isActive ? xOn : 0 }}
          transition={spring}
        />
      </span>
    </button>
  );
}
