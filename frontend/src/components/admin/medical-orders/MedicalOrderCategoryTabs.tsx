import type { MedicalOrderCatalogKind } from '@/lib/admin/types';
import { SUPPORTED_MEDICAL_ORDER_TAB_META } from './constants';
import { useI18n } from '@/i18n/provider';

type Props = {
  active: MedicalOrderCatalogKind;
  onChange: (kind: MedicalOrderCatalogKind) => void;
};

export default function MedicalOrderCategoryTabs({
  active,
  onChange,
}: Props) {
  const { t } = useI18n();
  return (
    <div
      className='flex flex-wrap gap-2 content-center items-center my-6 min-w-0'
      role='tablist'
      aria-label={t('adminMedicalOrders.categoryTabs.ariaLabel')}
    >
      {SUPPORTED_MEDICAL_ORDER_TAB_META.map(({ kind, labelKey }) => {
        const isActive = kind === active;
        return (
          <button
            key={kind}
            type='button'
            role='tab'
            aria-selected={isActive}
            onClick={() => onChange(kind)}
            className={[
              'inline-flex min-h-[40px] items-center justify-center rounded-[10px] px-4 font-cairo text-[13px] font-extrabold transition-colors',
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'border border-[#E5E7EB] bg-white text-[#667085] hover:border-primary/40 hover:text-primary',
            ].join(' ')}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
