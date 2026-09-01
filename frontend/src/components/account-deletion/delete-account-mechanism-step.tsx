import {
  Clock,
  Hexagon,
  RotateCcw,
} from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export function DeleteAccountMechanismStep({
  busy,
  onContinue,
  onCancel,
}: {
  busy?: boolean;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#FCA5A5] bg-[#FEF2F2]">
        <Clock className="h-5 w-5 text-[#EF4444]" aria-hidden />
      </div>

      <h2 className="font-cairo text-[18px] font-extrabold text-[#EF4444]">
        {t('accountDeletion.mechanism.title')}
      </h2>
      <p className="mt-2 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]">
        {t('accountDeletion.mechanism.subtitle')}
      </p>

      <div className="mt-5 rounded-[12px] bg-[#FFF5F5] px-4 py-4 text-start">
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] font-cairo text-[13px] font-extrabold text-white">
              1
            </span>
            <div>
              <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                {t('accountDeletion.mechanism.step1.title')}
              </div>
              <p className="mt-0.5 font-cairo text-[12px] font-semibold text-[#667085]">
                {t('accountDeletion.mechanism.step1.body')}{' '}
                <span className="font-extrabold text-[#EF4444]">
                  {t('accountDeletion.mechanism.step1.status')}
                </span>
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white">
              <RotateCcw className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                {t('accountDeletion.mechanism.step2.title')}
              </div>
              <p className="mt-0.5 font-cairo text-[12px] font-semibold text-[#667085]">
                {t('accountDeletion.mechanism.step2.body')}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EF4444] text-white">
              <Hexagon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                {t('accountDeletion.mechanism.step3.title')}
              </div>
              <p className="mt-0.5 font-cairo text-[12px] font-semibold text-[#667085]">
                {t('accountDeletion.mechanism.step3.body')}
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          disabled={busy}
          onClick={onContinue}
          className="flex h-[48px] w-full items-center justify-center rounded-[10px] bg-[#EF4444] font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(239,68,68,0.28)] transition hover:bg-[#DC2626] disabled:opacity-60"
        >
          {t('accountDeletion.mechanism.continue')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="flex h-[48px] w-full items-center justify-center rounded-[10px] bg-[#22C55E] font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(34,197,94,0.22)] transition hover:bg-[#16A34A] disabled:opacity-60"
        >
          {t('accountDeletion.mechanism.cancel')}
        </button>
      </div>
    </div>
  );
}
