'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ContactUsDialog } from '@/components/platform/contact-us-dialog';
import { FaqDialog } from '@/components/platform/faq-dialog';
import { LegalDocumentDialog } from '@/components/platform/legal-document-dialog';
import {
  usePlatformPrivacyContent,
  usePlatformTermsContent,
  usePlatformUsageContent,
} from '@/hooks/platform/usePlatformContent';
import { useI18n } from '@/i18n/provider';

export type PlatformSupportModal =
  | 'contact'
  | 'faq'
  | 'terms'
  | 'privacy'
  | 'usage'
  | null;

type PlatformSupportContextValue = {
  activeModal: PlatformSupportModal;
  openModal: (modal: Exclude<PlatformSupportModal, null>) => void;
  closeModal: () => void;
};

const PlatformSupportContext = createContext<PlatformSupportContextValue | null>(
  null,
);

export function PlatformSupportProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<PlatformSupportModal>(null);
  const { locale } = useI18n();

  const termsQuery = usePlatformTermsContent(locale);
  const privacyQuery = usePlatformPrivacyContent(locale);
  const usageQuery = usePlatformUsageContent(locale);

  const openModal = useCallback(
    (modal: Exclude<PlatformSupportModal, null>) => {
      setActiveModal(modal);
    },
    [],
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const value = useMemo(
    () => ({ activeModal, openModal, closeModal }),
    [activeModal, openModal, closeModal],
  );

  return (
    <PlatformSupportContext.Provider value={value}>
      {children}
      <ContactUsDialog
        open={activeModal === 'contact'}
        onClose={closeModal}
      />
      <FaqDialog open={activeModal === 'faq'} onClose={closeModal} />
      <LegalDocumentDialog
        open={activeModal === 'terms'}
        onClose={closeModal}
        document={termsQuery.document}
        loading={termsQuery.isAwaitingData}
      />
      <LegalDocumentDialog
        open={activeModal === 'privacy'}
        onClose={closeModal}
        document={privacyQuery.document}
        loading={privacyQuery.isAwaitingData}
      />
      <LegalDocumentDialog
        open={activeModal === 'usage'}
        onClose={closeModal}
        document={usageQuery.document}
        loading={usageQuery.isAwaitingData}
      />
    </PlatformSupportContext.Provider>
  );
}

export function usePlatformSupport() {
  const context = useContext(PlatformSupportContext);
  if (!context) {
    throw new Error('usePlatformSupport must be used within PlatformSupportProvider');
  }
  return context;
}
