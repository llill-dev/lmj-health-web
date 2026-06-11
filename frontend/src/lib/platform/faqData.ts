export type FaqItem = {
  id: string;
  number: string;
  question: string;
  answer: string;
};

export const PLATFORM_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'subscription-paid',
    number: '01',
    question: 'هل الاشتراك مدفوع؟',
    answer: 'يوجد باقات للاشتراك',
  },
  {
    id: 'cancel-subscription',
    number: '02',
    question: 'كيف يمكنني إلغاء الاشتراك؟',
    answer:
      'يمكنك إلغاء الاشتراك من إعدادات الملف الشخصي في أي وقت، وسيظل حسابك فعّالاً حتى نهاية فترة الفوترة الحالية.',
  },
  {
    id: 'data-privacy',
    number: '03',
    question: 'هل بياناتي الطبية محمية؟',
    answer:
      'نعم، جميع البيانات مشفّرة ومحمية وفق أعلى معايير الخصوصية والامتثال القانوني، ولا تُشارك إلا بموافقتك.',
  },
  {
    id: 'support-hours',
    number: '04',
    question: 'ما هي ساعات الدعم الفني؟',
    answer: 'فريق الدعم متاح على مدار الساعة طوال أيام الأسبوع عبر البريد الإلكتروني ونموذج التواصل.',
  },
];
