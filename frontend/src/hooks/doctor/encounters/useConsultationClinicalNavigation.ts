'use client';

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  buildConsultationClinicalPath,
  ensureConsultationEncounter,
  type ConsultationClinicalAction,
} from '@/lib/consultations/consultationEncounter';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { useI18n } from '@/i18n/provider';

export function useConsultationClinicalNavigation(input: {
  doctorId: string;
  patientId: string;
  consultationId: string;
  consultationSubject?: string | null;
  returnTo?: string;
  onError?: (message: string) => void;
}) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [busyAction, setBusyAction] = useState<ConsultationClinicalAction | null>(
    null,
  );

  const openClinicalAction = useCallback(
    async (action: ConsultationClinicalAction) => {
      const { doctorId, patientId, consultationId, consultationSubject, returnTo } =
        input;

      if (!doctorId || !patientId || !consultationId) {
        input.onError?.(t('doctor.consultations.clinicalNav.missingContext'));
        return;
      }

      setBusyAction(action);
      try {
        const encounterId = await ensureConsultationEncounter({
          doctorId,
          patientId,
          consultationId,
          subject: consultationSubject,
        });

        navigate(
          buildConsultationClinicalPath(
            patientId,
            encounterId,
            action,
            returnTo,
          ),
        );
      } catch (error) {
        input.onError?.(
          getUserFacingRequestErrorMessage(error) ||
            t('doctor.consultations.clinicalNav.prepareFailed'),
        );
      } finally {
        setBusyAction(null);
      }
    },
    [input, navigate],
  );

  return {
    busyAction,
    openClinicalAction,
    isBusy: busyAction !== null,
  };
}
