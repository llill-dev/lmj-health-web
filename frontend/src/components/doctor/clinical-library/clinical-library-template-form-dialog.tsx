'use client';

import { FileText, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import {
  DoctorProfileFormField,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import { orderCategoryForTemplateType } from '@/lib/doctor/templates/applyTemplateDraft';
import {
  parseOrderClinicalTemplateDraft,
  parseOrderItemTemplateDrafts,
  parsePrescriptionTemplateDraft,
  parseReferralTemplateDraft,
} from '@/lib/doctor/templates/applyTemplateDraft';
import type {
  DoctorTemplateApplication,
  DoctorTemplateRecord,
  DoctorTemplateType,
} from '@/lib/doctor/templates/templateTypes';
import { useI18n } from '@/i18n/provider';

function getTemplateTypeLabels(
  t: (key: string) => string,
): Record<DoctorTemplateType, string> {
  return {
    PRESCRIPTION: t('doctor.templateApplyDialog.type.prescription'),
    LAB_ORDER: t('doctor.templateApplyDialog.type.labOrder'),
    IMAGING_ORDER: t('doctor.templateApplyDialog.type.imagingOrder'),
    PROCEDURE_ORDER: t('doctor.templateApplyDialog.type.procedureOrder'),
    REFERRAL_ORDER: t('doctor.templateApplyDialog.type.referralOrder'),
  };
}

function getTemplateTypeOptions(t: (key: string) => string) {
  return (
    Object.entries(getTemplateTypeLabels(t)) as Array<
      [DoctorTemplateType, string]
    >
  ).map(([value, label]) => ({ value, label }));
}

function getPriorityOptions(t: (key: string) => string) {
  return [
    { value: 'normal', label: t('doctor.templateFormDialog.priority.normal') },
    { value: 'urgent', label: t('doctor.templateFormDialog.priority.urgent') },
    {
      value: 'emergency',
      label: t('doctor.templateFormDialog.priority.emergency'),
    },
  ];
}

let rowIdCounter = 0;
function genRowId(): string {
  rowIdCounter += 1;
  return `row-${Date.now()}-${rowIdCounter}`;
}

type MedicationRow = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};

type OrderItemRow = {
  id: string;
  name: string;
  category: string;
  type: string;
  bodyArea: string;
  side: string;
  position: string;
  notes: string;
};

function emptyMedicationRow(): MedicationRow {
  return { id: genRowId(), name: '', dosage: '', frequency: '', duration: '' };
}

function emptyOrderItemRow(): OrderItemRow {
  return {
    id: genRowId(),
    name: '',
    category: '',
    type: '',
    bodyArea: '',
    side: '',
    position: '',
    notes: '',
  };
}

export type ClinicalLibraryTemplateFormValues = {
  type: DoctorTemplateType;
  name: string;
  description?: string;
  payload: DoctorTemplateApplication;
};

export function ClinicalLibraryTemplateFormDialog({
  open,
  mode = 'create',
  initialTemplate,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode?: 'create' | 'edit';
  initialTemplate?: DoctorTemplateRecord | null;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: ClinicalLibraryTemplateFormValues) => Promise<void>;
}) {
  const { locale, dir, t } = useI18n();
  const templateTypeLabels = getTemplateTypeLabels(t);
  const templateTypeOptions = getTemplateTypeOptions(t);
  const priorityOptions = getPriorityOptions(t);
  const [templateType, setTemplateType] =
    useState<DoctorTemplateType>('PRESCRIPTION');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Prescription payload state
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [medications, setMedications] = useState<MedicationRow[]>([
    emptyMedicationRow(),
  ]);

  // Lab / imaging / procedure order payload state
  const [clinicalReason, setClinicalReason] = useState('');
  const [instructionsToPatient, setInstructionsToPatient] = useState('');
  const [imagingCenterInstructions, setImagingCenterInstructions] = useState('');
  const [urgency, setUrgency] = useState('');
  const [requiresFasting, setRequiresFasting] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([
    emptyOrderItemRow(),
  ]);

  // Referral payload state
  const [referralType, setReferralType] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [reason, setReason] = useState('');
  const [referredDoctorName, setReferredDoctorName] = useState('');
  const [institution, setInstitution] = useState('');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [questionsToColleague, setQuestionsToColleague] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    if (!open) return;

    const nextType: DoctorTemplateType =
      mode === 'edit' && initialTemplate
        ? (initialTemplate.type ?? 'PRESCRIPTION')
        : 'PRESCRIPTION';
    setTemplateType(nextType);
    setName(mode === 'edit' ? (initialTemplate?.name?.trim() ?? '') : '');
    setDescription(
      mode === 'edit' ? (initialTemplate?.description?.trim() ?? '') : '',
    );

    const payload =
      mode === 'edit' && initialTemplate?.payload
        ? initialTemplate.payload
        : undefined;

    if (nextType === 'PRESCRIPTION') {
      const parsed = payload
        ? parsePrescriptionTemplateDraft(payload)
        : { generalInstructions: undefined, items: [] };
      setGeneralInstructions(parsed.generalInstructions ?? '');
      setMedications(
        parsed.items.length
          ? parsed.items.map((item) => ({ id: genRowId(), ...item }))
          : [emptyMedicationRow()],
      );
    } else if (nextType === 'REFERRAL_ORDER') {
      const parsed = payload ? parseReferralTemplateDraft(payload) : {};
      setReferralType(parsed.referralType ?? '');
      setSpecialty(parsed.specialty ?? '');
      setReason(parsed.reason ?? '');
      setReferredDoctorName(parsed.referredDoctorName ?? '');
      setInstitution(parsed.institution ?? '');
      setClinicalSummary(parsed.clinicalSummary ?? '');
      setQuestionsToColleague(parsed.questionsToColleague ?? '');
      setReferralNotes(parsed.notes ?? '');
      setPriority(parsed.priority ?? 'normal');
    } else {
      const category = orderCategoryForTemplateType(nextType);
      const clinical =
        payload && category
          ? parseOrderClinicalTemplateDraft(payload, category)
          : {};
      const items = payload ? parseOrderItemTemplateDrafts(payload) : [];
      setClinicalReason(clinical.clinicalReason ?? '');
      setInstructionsToPatient(clinical.instructionsToPatient ?? '');
      setImagingCenterInstructions(clinical.imagingCenterInstructions ?? '');
      setUrgency(clinical.urgency ?? '');
      setRequiresFasting(Boolean(clinical.requiresFasting));
      setOrderItems(
        items.length
          ? items.map((item) => ({ id: genRowId(), ...item }))
          : [emptyOrderItemRow()],
      );
    }
  }, [open, mode, initialTemplate]);

  const title = mode === 'edit'
    ? t('doctor.templateFormDialog.editTitle')
    : t('doctor.templateFormDialog.createTitle');
  const hint =
    mode === 'edit'
      ? t('doctor.templateFormDialog.editHint')
      : t('doctor.templateFormDialog.createHint');

  const payload: DoctorTemplateApplication = useMemo(() => {
    if (templateType === 'PRESCRIPTION') {
      const items = medications
        .filter((row) => row.name.trim())
        .map((row) => ({
          name: row.name.trim(),
          dosage: row.dosage.trim(),
          frequency: row.frequency.trim(),
          duration: row.duration.trim(),
        }));
      const result: DoctorTemplateApplication = {};
      if (generalInstructions.trim()) {
        result.generalInstructions = generalInstructions.trim();
      }
      if (items.length) result.items = items;
      return result;
    }

    if (templateType === 'REFERRAL_ORDER') {
      const result: DoctorTemplateApplication = {};
      if (referralType.trim()) result.referralType = referralType.trim();
      if (specialty.trim()) result.specialty = specialty.trim();
      if (reason.trim()) result.reason = reason.trim();
      if (referredDoctorName.trim()) {
        result.referredDoctorName = referredDoctorName.trim();
      }
      if (institution.trim()) result.institution = institution.trim();
      if (clinicalSummary.trim()) {
        result.clinicalSummary = clinicalSummary.trim();
      }
      if (questionsToColleague.trim()) {
        result.questionsToColleague = questionsToColleague.trim();
      }
      if (referralNotes.trim()) result.notes = referralNotes.trim();
      result.priority = priority;
      return result;
    }

    // LAB_ORDER / IMAGING_ORDER / PROCEDURE_ORDER
    const items = orderItems
      .filter((row) => row.name.trim())
      .map((row) => ({
        name: row.name.trim(),
        category: row.category.trim(),
        type: row.type.trim(),
        bodyArea: row.bodyArea.trim(),
        side: row.side.trim(),
        position: row.position.trim(),
        notes: row.notes.trim(),
      }));
    const result: DoctorTemplateApplication = {};
    if (clinicalReason.trim()) result.clinicalReason = clinicalReason.trim();
    if (instructionsToPatient.trim()) {
      result.instructionsToPatient = instructionsToPatient.trim();
    }
    if (imagingCenterInstructions.trim()) {
      result.imagingCenterInstructions = imagingCenterInstructions.trim();
    }
    if (urgency.trim()) result.urgency = urgency.trim();
    if (templateType === 'LAB_ORDER') result.requiresFasting = requiresFasting;
    if (items.length) result.items = items;
    return result;
  }, [
    templateType,
    generalInstructions,
    medications,
    referralType,
    specialty,
    reason,
    referredDoctorName,
    institution,
    clinicalSummary,
    questionsToColleague,
    referralNotes,
    priority,
    clinicalReason,
    instructionsToPatient,
    imagingCenterInstructions,
    urgency,
    requiresFasting,
    orderItems,
  ]);

  const payloadIsEmpty = Object.keys(payload).length === 0;

  const rowInputClass =
    'h-[42px] w-full rounded-[10px] border-[0.5px] border-[#0F8F8B] bg-[#E6F4F3] px-3 font-cairo text-[12px] font-bold text-[#101828] outline-none transition placeholder:font-semibold placeholder:text-[#98A2B3] focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(15,143,139,0.11)]';

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-[680px]"
      headerPattern
    >
      <div dir={dir} lang={locale} className="space-y-5 text-start">
        <p className="rounded-[12px] border border-[#E6F4F3] bg-[#F0FDFA] px-4 py-3 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
          {hint}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DoctorProfileFormField label={t('doctor.templateFormDialog.typeLabel')} required>
            <StyledSelect
              size="sm"
              tone="muted"
              value={templateType}
              onChange={(value) => setTemplateType(value as DoctorTemplateType)}
              options={templateTypeOptions}
              placeholder={t('doctor.templateFormDialog.typePlaceholder')}
              listboxAriaLabel={t('doctor.templateFormDialog.typeAria')}
              listboxZIndex={200}
              disabled={mode === 'edit'}
            />
          </DoctorProfileFormField>

          <DoctorProfileFormField label={t('doctor.templateFormDialog.nameLabel')} required>
            <div className="relative">
              <FileText
                className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
                aria-hidden
              />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('doctor.templateFormDialog.namePlaceholder')}
                className={`${profileInputClass} pe-4 ps-11`}
              />
            </div>
          </DoctorProfileFormField>
        </div>

        <DoctorProfileFormField label={t('doctor.templateFormDialog.descriptionLabel')}>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('doctor.templateFormDialog.descriptionPlaceholder')}
            rows={2}
            className={`${profileTextareaClass} min-h-[64px]`}
          />
        </DoctorProfileFormField>

        <div className="space-y-4 rounded-[14px] border border-[#EEF2F6] bg-[#FAFAFA] p-4">
          <h3 className="font-cairo text-[13px] font-extrabold text-[#111827]">
            {t('doctor.templateFormDialog.detailsTitle').replace(
              '{type}',
              templateTypeLabels[templateType],
            )}
          </h3>

          {templateType === 'PRESCRIPTION' ? (
            <>
              <DoctorProfileFormField label={t('doctor.templateFormDialog.generalInstructionsLabel')}>
                <textarea
                  value={generalInstructions}
                  onChange={(event) => setGeneralInstructions(event.target.value)}
                  placeholder={t('doctor.templateFormDialog.generalInstructionsPlaceholder')}
                  rows={2}
                  className={`${profileTextareaClass} min-h-[64px] bg-white`}
                />
              </DoctorProfileFormField>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-cairo text-[12px] font-extrabold text-[#344054]">
                    {t('doctor.templateFormDialog.medicationsLabel')}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setMedications((rows) => [...rows, emptyMedicationRow()])
                    }
                    className="inline-flex items-center gap-1 font-cairo text-[12px] font-extrabold text-primary hover:text-[#14B3AE]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    {t('doctor.templateFormDialog.addMedication')}
                  </button>
                </div>
                {medications.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 gap-2 rounded-[10px] border border-[#EEF2F6] bg-white p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                  >
                    <input
                      value={row.name}
                      onChange={(event) =>
                        setMedications((rows) =>
                          rows.map((r, i) =>
                            i === index ? { ...r, name: event.target.value } : r,
                          ),
                        )
                      }
                      placeholder={t('doctor.templateFormDialog.medicationNamePlaceholder')}
                      className={rowInputClass}
                    />
                    <input
                      value={row.dosage}
                      onChange={(event) =>
                        setMedications((rows) =>
                          rows.map((r, i) =>
                            i === index ? { ...r, dosage: event.target.value } : r,
                          ),
                        )
                      }
                      placeholder={t('doctor.templateFormDialog.dosagePlaceholder')}
                      className={rowInputClass}
                    />
                    <input
                      value={row.frequency}
                      onChange={(event) =>
                        setMedications((rows) =>
                          rows.map((r, i) =>
                            i === index
                              ? { ...r, frequency: event.target.value }
                              : r,
                          ),
                        )
                      }
                      placeholder={t('doctor.templateFormDialog.frequencyPlaceholder')}
                      className={rowInputClass}
                    />
                    <input
                      value={row.duration}
                      onChange={(event) =>
                        setMedications((rows) =>
                          rows.map((r, i) =>
                            i === index
                              ? { ...r, duration: event.target.value }
                              : r,
                          ),
                        )
                      }
                      placeholder={t('doctor.templateFormDialog.durationPlaceholder')}
                      className={rowInputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMedications((rows) =>
                          rows.length > 1
                            ? rows.filter((_, i) => i !== index)
                            : rows,
                        )
                      }
                      disabled={medications.length <= 1}
                      className="inline-flex h-[42px] w-[42px] items-center justify-center justify-self-end rounded-[10px] text-[#F04438] transition hover:bg-[#FEF3F2] disabled:opacity-40"
                      aria-label={t('doctor.templateFormDialog.deleteMedicationAria')}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : templateType === 'REFERRAL_ORDER' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DoctorProfileFormField label={t('doctor.templateFormDialog.referralTypeLabel')}>
                <input
                  value={referralType}
                  onChange={(event) => setReferralType(event.target.value)}
                  className={`${profileInputClass} bg-white px-4`}
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField label={t('doctor.templateFormDialog.specialtyLabel')}>
                <input
                  value={specialty}
                  onChange={(event) => setSpecialty(event.target.value)}
                  className={`${profileInputClass} bg-white px-4`}
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField label={t('doctor.templateFormDialog.referredDoctorNameLabel')}>
                <input
                  value={referredDoctorName}
                  onChange={(event) => setReferredDoctorName(event.target.value)}
                  className={`${profileInputClass} bg-white px-4`}
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField label={t('doctor.templateFormDialog.institutionLabel')}>
                <input
                  value={institution}
                  onChange={(event) => setInstitution(event.target.value)}
                  className={`${profileInputClass} bg-white px-4`}
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField label={t('doctor.templateFormDialog.priorityLabel')}>
                <StyledSelect
                  size="sm"
                  tone="muted"
                  value={priority}
                  onChange={setPriority}
                  options={priorityOptions}
                  listboxAriaLabel={t('doctor.templateFormDialog.priorityAria')}
                  listboxZIndex={200}
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField label={t('doctor.templateFormDialog.referralReasonLabel')} className="sm:col-span-2">
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={2}
                  className={`${profileTextareaClass} min-h-[64px] bg-white`}
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField
                label={t('doctor.templateFormDialog.clinicalSummaryLabel')}
                className="sm:col-span-2"
              >
                <textarea
                  value={clinicalSummary}
                  onChange={(event) => setClinicalSummary(event.target.value)}
                  rows={2}
                  className={`${profileTextareaClass} min-h-[64px] bg-white`}
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField
                label={t('doctor.templateFormDialog.questionsToColleagueLabel')}
                className="sm:col-span-2"
              >
                <textarea
                  value={questionsToColleague}
                  onChange={(event) => setQuestionsToColleague(event.target.value)}
                  rows={2}
                  className={`${profileTextareaClass} min-h-[64px] bg-white`}
                />
              </DoctorProfileFormField>
              <DoctorProfileFormField label={t('doctor.templateFormDialog.notesLabel')} className="sm:col-span-2">
                <textarea
                  value={referralNotes}
                  onChange={(event) => setReferralNotes(event.target.value)}
                  rows={2}
                  className={`${profileTextareaClass} min-h-[64px] bg-white`}
                />
              </DoctorProfileFormField>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DoctorProfileFormField label={t('doctor.templateFormDialog.orderReasonLabel')}>
                  <input
                    value={clinicalReason}
                    onChange={(event) => setClinicalReason(event.target.value)}
                    className={`${profileInputClass} bg-white px-4`}
                  />
                </DoctorProfileFormField>
                <DoctorProfileFormField label={t('doctor.templateFormDialog.urgencyLabel')}>
                  <input
                    value={urgency}
                    onChange={(event) => setUrgency(event.target.value)}
                    placeholder={t('doctor.templateFormDialog.urgencyPlaceholder')}
                    className={`${profileInputClass} bg-white px-4`}
                  />
                </DoctorProfileFormField>
                <DoctorProfileFormField label={t('doctor.templateFormDialog.patientInstructionsLabel')}>
                  <input
                    value={instructionsToPatient}
                    onChange={(event) => setInstructionsToPatient(event.target.value)}
                    className={`${profileInputClass} bg-white px-4`}
                  />
                </DoctorProfileFormField>
                <DoctorProfileFormField label={t('doctor.templateFormDialog.centerInstructionsLabel')}>
                  <input
                    value={imagingCenterInstructions}
                    onChange={(event) =>
                      setImagingCenterInstructions(event.target.value)
                    }
                    className={`${profileInputClass} bg-white px-4`}
                  />
                </DoctorProfileFormField>
              </div>

              {templateType === 'LAB_ORDER' ? (
                <label className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#344054]">
                  <input
                    type="checkbox"
                    checked={requiresFasting}
                    onChange={(event) => setRequiresFasting(event.target.checked)}
                    className="h-4 w-4 rounded border-[#D0D5DD] text-primary focus:ring-primary"
                  />
                  {t('doctor.templateFormDialog.requiresFasting')}
                </label>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-cairo text-[12px] font-extrabold text-[#344054]">
                    {t('doctor.templateFormDialog.orderItemsLabel')}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOrderItems((rows) => [...rows, emptyOrderItemRow()])
                    }
                    className="inline-flex items-center gap-1 font-cairo text-[12px] font-extrabold text-primary hover:text-[#14B3AE]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    {t('doctor.templateFormDialog.addOrderItem')}
                  </button>
                </div>
                {orderItems.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 gap-2 rounded-[10px] border border-[#EEF2F6] bg-white p-3 sm:grid-cols-2"
                  >
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <input
                        value={row.name}
                        onChange={(event) =>
                          setOrderItems((rows) =>
                            rows.map((r, i) =>
                              i === index ? { ...r, name: event.target.value } : r,
                            ),
                          )
                        }
                        placeholder={t('doctor.templateFormDialog.itemNamePlaceholder')}
                        className={`${rowInputClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOrderItems((rows) =>
                            rows.length > 1
                              ? rows.filter((_, i) => i !== index)
                              : rows,
                          )
                        }
                        disabled={orderItems.length <= 1}
                        className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] text-[#F04438] transition hover:bg-[#FEF3F2] disabled:opacity-40"
                        aria-label={t('doctor.templateFormDialog.deleteItemAria')}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <input
                      value={row.bodyArea}
                      onChange={(event) =>
                        setOrderItems((rows) =>
                          rows.map((r, i) =>
                            i === index
                              ? { ...r, bodyArea: event.target.value }
                              : r,
                          ),
                        )
                      }
                      placeholder={t('doctor.templateFormDialog.bodyAreaPlaceholder')}
                      className={rowInputClass}
                    />
                    <input
                      value={row.notes}
                      onChange={(event) =>
                        setOrderItems((rows) =>
                          rows.map((r, i) =>
                            i === index ? { ...r, notes: event.target.value } : r,
                          ),
                        )
                      }
                      placeholder={t('doctor.templateFormDialog.notesPlaceholder')}
                      className={rowInputClass}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {payloadIsEmpty ? (
          <p className="rounded-[10px] border border-[#FEDF89] bg-[#FFFAEB] px-4 py-2.5 font-cairo text-[12px] font-bold text-[#B54708]">
            {t('doctor.templateFormDialog.emptyPayloadWarning')}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-extrabold text-[#667085] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            {t('doctor.templateFormDialog.cancel')}
          </button>
          <button
            type="button"
            disabled={busy || !name.trim() || payloadIsEmpty}
            onClick={() =>
              void onSubmit({
                type: templateType,
                name: name.trim(),
                description: description.trim() || undefined,
                payload,
              })
            }
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_24px_-4px_rgba(15,143,139,0.35)] transition hover:bg-[#14B3AE] disabled:opacity-60"
          >
            {busy
              ? t('doctor.templateFormDialog.saving')
              : mode === 'edit'
                ? t('doctor.templateFormDialog.saveChanges')
                : t('doctor.templateFormDialog.saveTemplate')}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
