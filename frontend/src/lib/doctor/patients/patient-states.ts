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

type SupportedLocale = 'ar' | 'en';

/**
 * Get UI information for a given patient state
 */
export function getPatientStateInfo(
  state: PatientRelationshipState,
  locale: SupportedLocale = 'ar',
): PatientStateInfo {
  const isEn = locale === 'en';
  const stateMap: Record<PatientRelationshipState, PatientStateInfo> = {
    'linked-only': {
      state: 'linked-only',
      label: isEn ? 'Linked to doctor' : 'مرتبط بالطبيب',
      description: isEn
        ? 'The patient is linked to the doctor but requires approval to view the full profile'
        : 'المريض مرتبط بالطبيب لكن يحتاج موافقة لعرض الملف الكامل',
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
      label: isEn ? 'Temporary account' : 'حساب مؤقت',
      description: isEn
        ? 'A temporary account not yet activated by the patient'
        : 'حساب مؤقت لم يتم تفعيله بعد من قبل المريض',
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
      label: isEn ? 'Access request pending' : 'طلب وصول قيد الانتظار',
      description: isEn
        ? 'An access request was sent to the patient and has not been approved yet'
        : 'تم إرسال طلب وصول للمريض ولم يتم الموافقة عليه بعد',
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
      label: isEn ? 'Full access available' : 'وصول كامل متاح',
      description: isEn
        ? 'The doctor has full permission to view and manage the patient profile'
        : 'الطبيب لديه صلاحية كاملة لعرض وإدارة ملف المريض',
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
      label: isEn ? 'Encounter in progress' : 'زيارة جارية',
      description: isEn
        ? 'The patient is currently in an active encounter'
        : 'المريض حالياً في زيارة طبية نشطة',
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
      label: isEn ? 'Restricted' : 'محجوب',
      description: isEn
        ? 'Access to the patient profile is currently restricted'
        : 'الوصول إلى ملف المريض محجوب حالياً',
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
      label: isEn
        ? 'Expand the card to view access status'
        : 'وسِّع البطاقة لعرض حالة الوصول',
      description: isEn
        ? 'The full-profile permission for this patient has not loaded yet. Open the card to see whether access is complete or needs approval.'
        : 'لم تُحمَّل بعد صلاحية الملف الكامل لهذا المريض. افتح البطاقة لمعرفة ما إذا كان الوصول مكتملاً أو يحتاج موافقة.',
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
export function getStateActions(
  state: PatientRelationshipState,
  locale: SupportedLocale = 'ar',
) {
  const info = getPatientStateInfo(state, locale);
  const isEn = locale === 'en';

  return {
    primary: info.canStartEncounter
      ? {
          label: isEn ? 'Start encounter' : 'بدء زيارة طبية',
          action: 'start-encounter' as const,
          variant: 'primary' as const,
        }
      : info.canRequestAccess
      ? {
          label: isEn ? 'Request full profile access' : 'طلب وصول للملف الكامل',
          action: 'request-access' as const,
          variant: 'warning' as const,
        }
      : null,
    secondary: info.canViewFullProfile
      ? {
          label: isEn ? 'View profile' : 'عرض الملف',
          action: 'view-profile' as const,
          variant: 'outline' as const,
        }
      : {
          label: isEn ? 'View basic information' : 'عرض المعلومات الأساسية',
          action: 'view-basic' as const,
          variant: 'outline' as const,
        },
  };
}

/**
 * Get user-friendly message for each state
 */
export function getStateMessage(
  state: PatientRelationshipState,
  pendingRequestId?: string | null,
  locale: SupportedLocale = 'ar',
): {
  title: string;
  body: string;
  type: 'info' | 'warning' | 'error' | 'success';
} {
  const isEn = locale === 'en';
  const messages: Record<PatientRelationshipState, { title: string; body: string; type: 'info' | 'warning' | 'error' | 'success' }> = {
    'linked-only': {
      title: isEn
        ? 'Needs approval from the patient'
        : 'يحتاج موافقة من المريض',
      body: isEn
        ? 'This patient is linked to you, but accessing the full medical file requires sending an access request and getting the patient\'s approval first.'
        : 'هذا المريض مرتبط بك، لكن للوصول إلى الملف الطبي الكامل يجب إرسال طلب وصول والحصول على موافقة من المريض أولاً.',
      type: 'warning',
    },
    'temporary': {
      title: isEn ? 'Temporary account' : 'حساب مؤقت',
      body: isEn
        ? 'This is a temporary account created from the clinic. You can manage the basic information and start encounters. It is preferable that the patient activates the account later.'
        : 'هذا حساب مؤقت تم إنشاؤه من العيادة. يمكنك إدارة المعلومات الأساسية وبدء الزيارات. يُفضّل أن يقوم المريض بتفعيل الحساب لاحقاً.',
      type: 'info',
    },
    'access-pending': {
      title: isEn ? 'Access request pending' : 'طلب وصول قيد الانتظار',
      body: isEn
        ? pendingRequestId
          ? `An access request was sent to the patient. Awaiting approval. Request ID: ${pendingRequestId}`
          : 'An access request was sent to the patient. Awaiting the patient\'s approval to view the full profile.'
        : pendingRequestId
          ? `تم إرسال طلب وصول للمريض. في انتظار الموافقة. رقم الطلب: ${pendingRequestId}`
          : 'تم إرسال طلب وصول للمريض. في انتظار الموافقة من المريض لعرض الملف الكامل.',
      type: 'info',
    },
    'full-access': {
      title: isEn ? 'Full access available' : 'وصول كامل متاح',
      body: isEn
        ? 'You have full permission to view and manage this patient\'s profile. You can start an encounter or view all the details.'
        : 'لديك صلاحية كاملة لعرض وإدارة ملف هذا المريض. يمكنك بدء زيارة طبية أو عرض كافة التفاصيل.',
      type: 'success',
    },
    'active-encounter': {
      title: isEn ? 'Encounter in progress' : 'زيارة طبية جارية',
      body: isEn
        ? 'This patient is currently in an active encounter. You can continue the encounter or end it.'
        : 'هذا المريض حالياً في زيارة طبية نشطة. يمكنك الاستمرار في الزيارة أو إنهائها.',
      type: 'info',
    },
    'restricted': {
      title: isEn ? 'Access restricted' : 'وصول محجوب',
      body: isEn
        ? 'Access to this patient\'s profile is currently restricted. The account may be suspended or the access request may have been denied.'
        : 'الوصول إلى ملف هذا المريض محجوب حالياً. قد يكون الحساب معلقاً أو تم رفض طلب الوصول.',
      type: 'error',
    },
    'relationship-indeterminate': {
      title: isEn ? 'Access permission not yet evaluated' : 'لم تُقيَّم صلاحية الوصول بعد',
      body: isEn
        ? 'The card is collapsed and the access evaluation has not loaded yet. Expand the card to see whether you have full access to the profile or need approval.'
        : 'البطاقة مطوّية ولم يُحمَّل تقييم الوصول بعد. وسِّع البطاقة لعرض ما إذا كان لديك وصولاً كاملاً إلى الملف أو تحتاج موافقة.',
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
