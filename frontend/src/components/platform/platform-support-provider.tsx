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

  const termsQuery = usePlatformTermsContent('ar');
  const privacyQuery = usePlatformPrivacyContent('ar');
  const usageQuery = usePlatformUsageContent('ar');

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
        loading={termsQuery.isLoading}
      />
      <LegalDocumentDialog
        open={activeModal === 'privacy'}
        onClose={closeModal}
        document={privacyQuery.document}
        loading={privacyQuery.isLoading}
      />
      <LegalDocumentDialog
        open={activeModal === 'usage'}
        onClose={closeModal}
        document={usageQuery.document}
        loading={usageQuery.isLoading}
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
