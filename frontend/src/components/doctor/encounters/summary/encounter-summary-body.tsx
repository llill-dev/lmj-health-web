'use client';

import {
  Activity,
  FileText,
  FlaskConical,
  Pill,
  ScanLine,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  EncounterSummaryDiagnosisBadge,
  EncounterSummarySectionKey,
  EncounterSummaryViewModel,
} from './encounter-summary-types';
import { EncounterSummaryInnerCard } from './encounter-summary-inner-card';
import { EncounterSummarySection } from './encounter-summary-section';
import { ENCOUNTER_SUMMARY_HEADER_BG } from './encounter-summary-themes';
import { useI18n } from '@/i18n/provider';

const WHITE_SURFACE =
  'rounded-[10px] border-[0.5px] border-[#0F8F8B] bg-white px-4 py-3 font-cairo text-[14px] font-semibold leading-[24px] text-[#101828]';

const DEFAULT_EXPANDED: Record<EncounterSummarySectionKey, boolean> = {
  patient: true,
  complaint: true,
  history: true,
  diagnosis: true,
  medications: true,
  labs: true,
  radiology: true,
  referrals: true,
};

function badgeClass(tone: EncounterSummaryDiagnosisBadge['tone']) {
  if (tone === 'primary') return 'bg-[#E6F4F3] text-primary';
  if (tone === 'danger') return 'bg-[#FEE2E2] text-[#B91C1C]';
  if (tone === 'warning') return 'bg-[#FEF3C7] text-[#B45309]';
  return 'bg-[#F2F4F7] text-[#667085]';
}

function UrgentBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex rounded-full bg-[#E7000B] px-2.5 py-1 font-cairo text-[11px] font-extrabold text-[#FFFFFF]">
      {t('doctor.encounterSummaryBody.urgent')}
    </span>
  );
}

function SectionEmpty({ message }: { message: string }) {
  return (
    <p className="rounded-[10px] border border-dashed border-[#D0D5DD] bg-[#F9FAFB] px-4 py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
      {message}
    </p>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="font-cairo text-[14px] leading-[26px] text-[#344054]">
      <span className="font-bold text-[#667085]">{label}: </span>
      <span className="font-extrabold text-[#101828]">{value}</span>
    </p>
  );
}

export function EncounterSummaryBody({
  summary,
}: {
  summary: EncounterSummaryViewModel;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(DEFAULT_EXPANDED);

  const sections = useMemo(
    () =>
      [
        {
          key: 'patient' as const,
          title: t('doctor.encounterSummaryBody.patientInfo'),
          icon: UserRound,
        },
        {
          key: 'complaint' as const,
          title: t('doctor.encounterSummaryBody.chiefComplaint'),
          icon: Activity,
        },
        {
          key: 'history' as const,
          title: t('doctor.encounterSummaryBody.pastHistory'),
          icon: FileText,
        },
        {
          key: 'diagnosis' as const,
          title: t('doctor.encounterSummaryBody.assessmentAndDiagnosis'),
          icon: Stethoscope,
        },
        {
          key: 'medications' as const,
          title: t('doctor.addAccessRequestForm.dataType.medications.label'),
          icon: Pill,
          count: summary.medications.length,
        },
        {
          key: 'labs' as const,
          title: t('doctor.encounterSummaryFinishDialog.labs'),
          icon: FlaskConical,
          count: summary.labs.length,
        },
        {
          key: 'radiology' as const,
          title: t('doctor.encounterSummaryFinishDialog.radiology'),
          icon: ScanLine,
          count: summary.radiology.length,
        },
        {
          key: 'referrals' as const,
          title: t('doctor.encounterSummaryFinishDialog.referrals'),
          icon: Users,
          count: summary.referrals.length,
        },
      ],
    [summary, t],
  );

  const toggle = (key: EncounterSummarySectionKey) => {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <EncounterSummarySection
          key={section.key}
          title={section.title}
          icon={section.icon}
          count={section.count}
          expanded={expanded[section.key]}
          onToggle={() => toggle(section.key)}
          headerBackground={ENCOUNTER_SUMMARY_HEADER_BG[section.key]}
          bodyClassName={
            section.key === 'patient' ? 'bg-[#E6F4F3]' : undefined
          }
        >
          {section.key === 'patient' ? (
            <div className="space-y-2 text-start">
              <DetailLine label={t('doctor.encounterCard.fields.name')} value={summary.patient.name} />
              <DetailLine label={t('doctor.encounterCard.fields.age')} value={summary.patient.ageLabel} />
              <DetailLine label={t('doctor.encounterCard.fields.fileNumber')} value={summary.patient.fileNumber} />
            </div>
          ) : null}

          {section.key === 'complaint' ? (
            <p className={WHITE_SURFACE}>{summary.chiefComplaint}</p>
          ) : null}

          {section.key === 'history' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2 text-start">
                <div className="font-cairo text-[13px] font-extrabold text-primary">
                  {t('doctor.encounterSummaryBody.currentPresentation')}
                </div>
                <p className={WHITE_SURFACE}>{summary.history.currentIllness}</p>
              </div>
              <div className="space-y-2 text-start">
                <div className="font-cairo text-[13px] font-extrabold text-primary">
                  {t('doctor.encounterSummaryBody.pastIllnesses')}
                </div>
                <p className={WHITE_SURFACE}>{summary.history.pastIllnesses}</p>
              </div>
              <div className="space-y-2 text-start">
                <div className="font-cairo text-[13px] font-extrabold text-primary">
                  {t('doctor.addAccessRequestForm.dataType.medications.label')}
                </div>
                <p className={WHITE_SURFACE}>{summary.history.medications}</p>
              </div>
            </div>
          ) : null}

          {section.key === 'diagnosis' ? (
            summary.diagnoses.length === 0 ? (
              <SectionEmpty message={t('doctor.encounterSummaryBody.noDiagnoses')} />
            ) : (
            <div className="space-y-3">
              {summary.diagnoses.map((item) => (
                <EncounterSummaryInnerCard
                  key={item.id}
                  sectionKey="diagnosis"
                  className="py-4 shadow-[0_4px_14px_rgba(15,143,139,0.06)]"
                >
                  <div className="font-cairo text-[15px] font-extrabold text-[#101828]">
                    {item.title}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-start mt-3">
                    {item.badges.map((badge) => (
                      <span
                        key={`${item.id}-${badge.label}`}
                        className={`inline-flex rounded-full px-2.5 py-1 font-cairo text-[11px] font-extrabold ${badgeClass(badge.tone)}`}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </EncounterSummaryInnerCard>
              ))}
            </div>
            )
          ) : null}

          {section.key === 'medications' ? (
            summary.medications.length === 0 ? (
              <SectionEmpty message={t('doctor.encounterSummaryBody.noMedications')} />
            ) : (
            <div className="space-y-3">
              {summary.medications.map((med) => (
                <EncounterSummaryInnerCard key={med.id} sectionKey="medications">
                  <div className="font-cairo font-extrabold text-[#101828]">
                    {med.name}
                  </div>
                  <div className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
                    {med.dosage} — {med.frequency}
                  </div>
                </EncounterSummaryInnerCard>
              ))}
            </div>
            )
          ) : null}

          {section.key === 'labs' ? (
            summary.labs.length === 0 ? (
              <SectionEmpty message={t('doctor.encounterSummaryBody.noLabs')} />
            ) : (
            <div className="space-y-3">
              {summary.labs.map((item) => (
                <EncounterSummaryInnerCard
                  key={item.id}
                  sectionKey="labs"
                  className="flex gap-3 justify-between items-center"
                >
                  <span className="font-cairo text-[14px] font-extrabold text-[#101828]">
                    {item.title}
                  </span>
                  {item.urgent ? <UrgentBadge /> : null}
                </EncounterSummaryInnerCard>
              ))}
            </div>
            )
          ) : null}

          {section.key === 'radiology' ? (
            summary.radiology.length === 0 ? (
              <SectionEmpty message={t('doctor.encounterSummaryBody.noRadiology')} />
            ) : (
            <div className="space-y-3">
              {summary.radiology.map((item) => (
                <EncounterSummaryInnerCard
                  key={item.id}
                  sectionKey="radiology"
                  className="flex gap-3 justify-between items-center"
                >
                  <span className="font-cairo text-[14px] font-extrabold text-[#101828]">
                    {item.title}
                  </span>
                  {item.urgent ? <UrgentBadge /> : null}
                </EncounterSummaryInnerCard>
              ))}
            </div>
            )
          ) : null}

          {section.key === 'referrals' ? (
            summary.referrals.length === 0 ? (
              <SectionEmpty message={t('doctor.encounterSummaryBody.noReferrals')} />
            ) : (
            <div className="space-y-3">
              {summary.referrals.map((ref) => (
                <EncounterSummaryInnerCard
                  key={ref.id}
                  sectionKey="referrals"
                  className="flex gap-3 justify-between items-center"
                >
                  <div className="text-start">
                    <div className="font-cairo text-[14px] font-extrabold text-[#101828]">
                      {ref.specialty}
                    </div>
                    <div className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
                      {t('doctor.encounterSummaryBody.referralTo').replace('{name}', ref.doctorName)}
                    </div>
                  </div>
                  {ref.urgent ? <UrgentBadge /> : null}
                </EncounterSummaryInnerCard>
              ))}
            </div>
            )
          ) : null}
        </EncounterSummarySection>
      ))}
    </div>
  );
}
