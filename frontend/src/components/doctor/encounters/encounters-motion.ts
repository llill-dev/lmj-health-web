export const ENCOUNTERS_PANEL_TRANSITION = {
  duration: 0.34,
  ease: [0.16, 1, 0.3, 1] as const,
};

export const ENCOUNTERS_LIST_STAGGER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const ENCOUNTERS_LIST_ITEM = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

export const ENCOUNTERS_EXPAND_TRANSITION = {
  type: "spring" as const,
  stiffness: 320,
  damping: 34,
  mass: 0.85,
};

export const ENCOUNTERS_EXPAND_CONTENT_STAGGER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.06 },
  },
};

export const ENCOUNTERS_EXPAND_CONTENT_ITEM = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] as const },
  },
};
