import { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { useI18n } from '@/i18n/provider';
import {
  medicalRequestNoResultFilesMessage,
  medicalRequestNoResultViewMessage,
  resolveMedicalRequestDocumentErrorMessage,
} from '@/lib/doctor/medical-requests/medicalRequestDocumentMessages';
import { triggerBrowserFileDownload } from '@/lib/files/triggerBrowserFileDownload';
import type { MedicalRequestDetailVm } from './map-doctor-medical-requests';

export function useMedicalRequestDocument() {
  const { toast } = useToast();
  const { locale } = useI18n();
  const [busy, setBusy] = useState(false);

  const openResultUrl = async (
    vm: MedicalRequestDetailVm,
    mode: 'view' | 'download',
  ) => {
    const directUrl = pickDirectResultUrl(vm, mode);

    if (!directUrl) {
      toast(
        mode === 'download'
          ? medicalRequestNoResultFilesMessage(locale)
          : medicalRequestNoResultViewMessage(locale),
        { variant: 'error' },
      );
      return;
    }

    setBusy(true);
    try {
      if (mode === 'download') {
        await triggerBrowserFileDownload(
          directUrl,
          vm.radiologyFileName || `${vm.resultTitle}.pdf`,
        );
      } else {
        window.open(directUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      toast(resolveMedicalRequestDocumentErrorMessage(error, locale), {
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  return { openResultUrl, documentBusy: busy };
}

function pickDirectResultUrl(
  vm: MedicalRequestDetailVm,
  mode: 'view' | 'download',
): string | undefined {
  const candidates =
    mode === 'view'
      ? [vm.resultViewUrl, vm.resultDownloadUrl, vm.radiologyFileUrl]
      : [vm.resultDownloadUrl, vm.radiologyFileUrl, vm.resultViewUrl];

  for (const url of candidates) {
    const trimmed = url?.trim();
    if (trimmed && trimmed !== '#') return trimmed;
  }

  for (const result of vm.raw?.results ?? []) {
    const fromResult =
      mode === 'download'
        ? result.downloadUrl ?? result.url
        : result.url ?? result.downloadUrl;
    const trimmed = fromResult?.trim();
    if (trimmed && trimmed !== '#') return trimmed;
  }

  return undefined;
}
