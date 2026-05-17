/**
 * Patient State Management for Doctor Dashboard
 * 
 * This module defines the different states a patient can be in
 * from a doctor's perspective, based on the relationship between
 * the doctor and patient.
 */

export type PatientRelationshipState =
  | 'linked-only'          // مرتبط فقط - basic link, needs approval for full profile
  | 'temporary'            // مؤقت - temporary account not yet activated
  | 'access-pending'       // طلب وصول قيد الانتظار - access request sent, awaiting approval
  | 'full-access'          // وصول كامل - doctor has full profile access
  | 'active-encounter'     // زيارة جارية - currently in an active encounter
  | 'restricted'           // محجوب - access explicitly denied or restricted
  | 'relationship-indeterminate'; // لم نُقيِّم بعد — البطاقة مطوية ولم يُحمَّل ملف الوصول بعد

export type PatientStateInfo = {
  state: PatientRelationshipState;
  label: string;
  description: string;
  color: {
    bg: string;
    text: string;
    ring: string;
    border?: string;
  };
  icon: 'link' | 'clock' | 'hourglass' | 'check' | 'stethoscope' | 'alert';
  canViewFullProfile: boolean;
  canStartEncounter: boolean;
  canRequestAccess: boolean;
  showAccessButton: boolean;
  priority: number; // for sorting/filtering
};

/**
 * Determines the current relationship state between doctor and patient
 */
export function determinePatientState(params: {
  isTemporary: boolean;
  accessRequired: boolean;
  accessPending: boolean;
  hasActiveEncounter?: boolean;
  accountStatus?: 'active' | 'temporary' | 'suspended';
  /**
   * When false we must not infer full-access from missing data (e.g. collapsed list row).
   * Still handles temporary/pending/active-encounter/restricted when those are known from the list.
   */
  relationshipKnown?: boolean;
}): PatientRelationshipState {
  const {
    isTemporary,
    accessRequired,
    accessPending,
    hasActiveEncounter,
    accountStatus,
    relationshipKnown = true,
  } = params;

  // Priority order matters here
  if (hasActiveEncounter) return 'active-encounter';
  if (isTemporary || accountStatus === 'temporary') return 'temporary';
  if (accessPending) return 'access-pending';
  if (accountStatus === 'suspended') return 'restricted';
  if (!relationshipKnown) return 'relationship-indeterminate';
  if (accessRequired) return 'linked-only';

  return 'full-access';
}

/**
 * Get UI information for a given patient state
 */
export function getPatientStateInfo(state: PatientRelationshipState): PatientStateInfo {
  const stateMap: Record<PatientRelationshipState, PatientStateInfo> = {
    'linked-only': {
      state: 'linked-only',
      label: 'مرتبط بالطبيب',
      description: 'المريض مرتبط بالطبيب لكن يحتاج موافقة لعرض الملف الكامل',
      color: {
        bg: 'bg-[#FFF4ED]',
        text: 'text-[#C4320A]',
        ring: 'ring-[#FED7AA]',
        border: 'border-[#FED7AA]',
      },
      icon: 'link',
      canViewFullProfile: false,
      canStartEncounter: false,
      canRequestAccess: true,
      showAccessButton: true,
      priority: 3,
    },
    'temporary': {
      state: 'temporary',
      label: 'حساب مؤقت',
      description: 'حساب مؤقت لم يتم تفعيله بعد من قبل المريض',
      color: {
        bg: 'bg-[#FFFAEB]',
        text: 'text-[#B54708]',
        ring: 'ring-[#FEDF89]',
        border: 'border-[#FEDF89]',
      },
      icon: 'clock',
      canViewFullProfile: true, // Temporary patients created by doctor have limited access
      canStartEncounter: true,
      canRequestAccess: false,
      showAccessButton: false,
      priority: 2,
    },
    'access-pending': {
      state: 'access-pending',
      label: 'طلب وصول قيد الانتظار',
      description: 'تم إرسال طلب وصول للمريض ولم يتم الموافقة عليه بعد',
      color: {
        bg: 'bg-[#FFFAEB]',
        text: 'text-[#B54708]',
        ring: 'ring-[#FEDF89]',
        border: 'border-[#FEDF89]',
      },
      icon: 'hourglass',
      canViewFullProfile: false,
      canStartEncounter: false,
      canRequestAccess: false,
      showAccessButton: false,
      priority: 1,
    },
    'full-access': {
      state: 'full-access',
      label: 'وصول كامل متاح',
      description: 'الطبيب لديه صلاحية كاملة لعرض وإدارة ملف المريض',
      color: {
        bg: 'bg-[#ECFDF3]',
        text: 'text-[#027A48]',
        ring: 'ring-[#ABEFC6]',
        border: 'border-[#ABEFC6]',
      },
      icon: 'check',
      canViewFullProfile: true,
      canStartEncounter: true,
      canRequestAccess: false,
      showAccessButton: false,
      priority: 5,
    },
    'active-encounter': {
      state: 'active-encounter',
      label: 'زيارة جارية',
      description: 'المريض حالياً في زيارة طبية نشطة',
      color: {
        bg: 'bg-[#EFF8FF]',
        text: 'text-[#175CD3]',
        ring: 'ring-[#B2DDFF]',
        border: 'border-[#B2DDFF]',
      },
      icon: 'stethoscope',
      canViewFullProfile: true,
      canStartEncounter: false, // Already in encounter
      canRequestAccess: false,
      showAccessButton: false,
      priority: 6,
    },
    'restricted': {
      state: 'restricted',
      label: 'محجوب',
      description: 'الوصول إلى ملف المريض محجوب حالياً',
      color: {
        bg: 'bg-[#FEF2F2]',
        text: 'text-[#B42318]',
        ring: 'ring-[#FECACA]',
        border: 'border-[#FECACA]',
      },
      icon: 'alert',
      canViewFullProfile: false,
      canStartEncounter: false,
      canRequestAccess: false,
      showAccessButton: false,
      priority: 0,
    },
    'relationship-indeterminate': {
      state: 'relationship-indeterminate',
      label: 'وسِّع البطاقة لعرض حالة الوصول',
      description:
        'لم تُحمَّل بعد صلاحية الملف الكامل لهذا المريض. افتح البطاقة لمعرفة ما إذا كان الوصول مكتملاً أو يحتاج موافقة.',
      color: {
        bg: 'bg-[#F2F4F7]',
        text: 'text-[#475467]',
        ring: 'ring-[#EAECF0]',
        border: 'border-[#E4E7EC]',
      },
      icon: 'link',
      canViewFullProfile: false,
      canStartEncounter: false,
      canRequestAccess: false,
      showAccessButton: false,
      priority: 2,
    },
  };

  return stateMap[state];
}

/**
 * Get appropriate action button configuration based on state
 */
export function getStateActions(state: PatientRelationshipState) {
  const info = getPatientStateInfo(state);
  
  return {
    primary: info.canStartEncounter
      ? { label: 'بدء زيارة طبية', action: 'start-encounter' as const, variant: 'primary' as const }
      : info.canRequestAccess
      ? { label: 'طلب وصول للملف الكامل', action: 'request-access' as const, variant: 'warning' as const }
      : null,
    secondary: info.canViewFullProfile
      ? { label: 'عرض الملف', action: 'view-profile' as const, variant: 'outline' as const }
      : { label: 'عرض المعلومات الأساسية', action: 'view-basic' as const, variant: 'outline' as const },
  };
}

/**
 * Get user-friendly message for each state
 */
export function getStateMessage(state: PatientRelationshipState, pendingRequestId?: string | null): {
  title: string;
  body: string;
  type: 'info' | 'warning' | 'error' | 'success';
} {
  const messages: Record<PatientRelationshipState, { title: string; body: string; type: 'info' | 'warning' | 'error' | 'success' }> = {
    'linked-only': {
      title: 'يحتاج موافقة من المريض',
      body: 'هذا المريض مرتبط بك، لكن للوصول إلى الملف الطبي الكامل يجب إرسال طلب وصول والحصول على موافقة من المريض أولاً.',
      type: 'warning',
    },
    'temporary': {
      title: 'حساب مؤقت',
      body: 'هذا حساب مؤقت تم إنشاؤه من العيادة. يمكنك إدارة المعلومات الأساسية وبدء الزيارات. يُفضّل أن يقوم المريض بتفعيل الحساب لاحقاً.',
      type: 'info',
    },
    'access-pending': {
      title: 'طلب وصول قيد الانتظار',
      body: pendingRequestId
        ? `تم إرسال طلب وصول للمريض. في انتظار الموافقة. رقم الطلب: ${pendingRequestId}`
        : 'تم إرسال طلب وصول للمريض. في انتظار الموافقة من المريض لعرض الملف الكامل.',
      type: 'info',
    },
    'full-access': {
      title: 'وصول كامل متاح',
      body: 'لديك صلاحية كاملة لعرض وإدارة ملف هذا المريض. يمكنك بدء زيارة طبية أو عرض كافة التفاصيل.',
      type: 'success',
    },
    'active-encounter': {
      title: 'زيارة طبية جارية',
      body: 'هذا المريض حالياً في زيارة طبية نشطة. يمكنك الاستمرار في الزيارة أو إنهائها.',
      type: 'info',
    },
    'restricted': {
      title: 'وصول محجوب',
      body: 'الوصول إلى ملف هذا المريض محجوب حالياً. قد يكون الحساب معلقاً أو تم رفض طلب الوصول.',
      type: 'error',
    },
    'relationship-indeterminate': {
      title: 'لم تُقيَّم صلاحية الوصول بعد',
      body: 'البطاقة مطوّية ولم يُحمَّل تقييم الوصول بعد. وسِّع البطاقة لعرض ما إذا كان لديك وصولاً كاملاً إلى الملف أو تحتاج موافقة.',
      type: 'info',
    },
  };

  return messages[state];
}

/**
 * Filter helper to get patients by state
 */
export function filterByState(
  patients: Array<{ state: PatientRelationshipState }>,
  states: PatientRelationshipState[]
): typeof patients {
  return patients.filter(p => states.includes(p.state));
}

/**
 * Sort patients by state priority
 */
export function sortByStatePriority<T extends { state: PatientRelationshipState }>(
  patients: T[]
): T[] {
  return [...patients].sort((a, b) => {
    const priorityA = getPatientStateInfo(a.state).priority;
    const priorityB = getPatientStateInfo(b.state).priority;
    return priorityB - priorityA; // Higher priority first
  });
}
