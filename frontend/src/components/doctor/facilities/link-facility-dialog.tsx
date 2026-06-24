'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Building2, Link2, Loader2, MapPin } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import { useFacilitySuggestSearch } from '@/hooks/doctor/useDoctorFacility';
import type { SuggestFacilityRecord } from '@/lib/doctor/medical-services-directory/api-types';
import { cn } from '@/lib/utils/utils';

function facilityId(record: SuggestFacilityRecord): string | undefined {
  return record.id ?? record._id;
}

function facilityProviderId(record: SuggestFacilityRecord): string | undefined {
  return record.facilityProviderId ?? record.providerId;
}

export default function LinkFacilityDialog({
  open,
  submitting,
  onClose,
  onLink,
}: {
  open: boolean;
  submitting?: boolean;
  onClose: () => void;
  onLink: (payload: {
    facilityId: string;
    facilityProviderId: string;
    suggestSnapshot: SuggestFacilityRecord;
  }) => void;
}) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [debouncedSearch] = useDebounce(search, 350);

  const suggestQuery = useFacilitySuggestSearch(debouncedSearch, city, open);
  const facilities = suggestQuery.data?.facilities ?? [];

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setCity('');
    setSelectedId(null);
  }, [open]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const canLinkSelected = facilities.some(
    (facility) =>
      facilityId(facility) === selectedId && Boolean(facilityProviderId(facility)),
  );

  const handleLink = () => {
    if (!selectedId || submitting) return;
    const selectedFacility = facilities.find(
      (facility) => facilityId(facility) === selectedId,
    );
    const providerId = selectedFacility
      ? facilityProviderId(selectedFacility)
      : undefined;
    if (!providerId) return;
    onLink({
      facilityId: selectedId,
      facilityProviderId: providerId,
      suggestSnapshot: selectedFacility,
    });
  };

  const showMinCharsHint =
    search.trim().length > 0 && search.trim().length < 2 && !submitting;

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={handleClose}
      title="ط±ط¨ط· ظ…ظ†ط´ط£ط© ظ…ظˆط¬ظˆط¯ط©"
      maxWidthClass="max-w-[640px]"
      headerPattern
    >
      <div dir="rtl" lang="ar" className="space-y-5 text-right">
        <p className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-4 font-cairo text-[12px] font-semibold leading-relaxed text-[#667085]">
          ط§ط¨ط­ط« ط¹ظ† ظ…ظ†ط´ط£ط© ظ…ط³ط¬ظ‘ظ„ط© ظپظٹ ط§ظ„ظ†ط¸ط§ظ… ظˆط§ط±ط¨ط· ط­ط³ط§ط¨ظƒ ط¨ظ‡ط§. ط¥ط°ط§ ظ„ظ… طھط¬ط¯ظ‡ط§طŒ ط§ط³طھط®ط¯ظ…
          آ«ط§ظ‚طھط±ط§ط­ ظ…ظ†ط´ط£ط©آ» ظ„ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ ط¥ط¶ط§ظپطھظ‡ط§.
        </p>

        <DoctorProfileFormField label="ط¨ط­ط« ط¨ط§ظ„ط§ط³ظ…" required hint="ط­ط±ظپط§ظ† ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelectedId(null);
            }}
            placeholder="ظ…ط«ط§ظ„: ظ…ط³طھط´ظپظ‰ ط§ظ„ط´ط§ظ…"
            disabled={submitting}
            className={profileFieldClass(profileInputClass, false)}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField label="ط§ظ„ظ…ط¯ظٹظ†ط©" hint="ط§ط®طھظٹط§ط±ظٹ â€” ظ„طھط¶ظٹظٹظ‚ ط§ظ„ظ†طھط§ط¦ط¬">
          <input
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              setSelectedId(null);
            }}
            placeholder="ظ…ط«ط§ظ„: ط¯ظ…ط´ظ‚"
            disabled={submitting}
            className={profileFieldClass(profileInputClass, false)}
          />
        </DoctorProfileFormField>

        <div>
          <h3 className="mb-3 font-cairo text-[14px] font-extrabold text-[#111827]">
            ط§ظ„ظ†طھط§ط¦ط¬
          </h3>

          {showMinCharsHint ? (
            <p className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6 text-center font-cairo text-[12px] font-semibold text-[#98A2B3]">
              ط§ظƒطھط¨ ط­ط±ظپظٹظ† ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„ ظ„ط¨ط¯ط، ط§ظ„ط¨ط­ط«
            </p>
          ) : suggestQuery.isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
              <span className="font-cairo text-[13px] font-semibold text-[#667085]">
                ط¬ط§ط±ظچ ط§ظ„ط¨ط­ط«...
              </span>
            </div>
          ) : suggestQuery.isError ? (
            <div className="flex items-start gap-2 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[#B42318]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="font-cairo text-[13px] font-semibold leading-relaxed">
                طھط¹ط°ظ‘ط± طھط­ظ…ظٹظ„ ط§ظ„ظ†طھط§ط¦ط¬. ط­ط§ظˆظ„ ظ…ط±ط© ط£ط®ط±ظ‰.
              </p>
            </div>
          ) : debouncedSearch.trim().length < 2 ? (
            <p className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6 text-center font-cairo text-[12px] font-semibold text-[#98A2B3]">
              ط§ط¨ط¯ط£ ط¨ط§ظ„ط¨ط­ط« ط¹ظ† ط§ط³ظ… ط§ظ„ظ…ظ†ط´ط£ط©
            </p>
          ) : facilities.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-5 py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#E6F4F3]">
                <Building2 className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <p className="font-cairo text-[13px] font-extrabold text-[#667085]">
                ظ„ط§ طھظˆط¬ط¯ ظ†طھط§ط¦ط¬ ظ…ط·ط§ط¨ظ‚ط©
              </p>
              <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                ط¬ط±ظ‘ط¨ ط§ط³ظ…ظ‹ط§ ط£ظˆ ظ…ط¯ظٹظ†ط© ظ…ط®طھظ„ظپط©طŒ ط£ظˆ ط§ظ‚طھط±ط­ ظ…ظ†ط´ط£ط© ط¬ط¯ظٹط¯ط©
              </p>
            </div>
          ) : (
            <ul className="max-h-[280px] space-y-2 overflow-y-auto">
              {facilities.map((facility) => {
                const id = facilityId(facility);
                if (!id) return null;
                const isSelected = selectedId === id;
                const hasProviderId = Boolean(facilityProviderId(facility));

                return (
                  <li key={id}>
                    <button
                      type="button"
                      disabled={submitting || !hasProviderId}
                      onClick={() => setSelectedId(id)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-[12px] border px-4 py-3 text-right transition',
                        isSelected
                          ? 'border-primary bg-[#E6F4F3] shadow-sm'
                          : 'border-[#EEF2F6] bg-white hover:border-primary/30 hover:bg-[#F0FDFA]',
                        (submitting || !hasProviderId) &&
                          'cursor-not-allowed opacity-60',
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-[#D0D5DD] bg-white',
                        )}
                        aria-hidden
                      >
                        {isSelected ? (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                          {facility.name}
                        </p>
                        {facility.city ? (
                          <p className="mt-0.5 flex items-center justify-end gap-1 font-cairo text-[11px] font-semibold text-[#667085]">
                            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                            {facility.city}
                            {facility.address ? ` آ· ${facility.address}` : ''}
                          </p>
                        ) : null}
                        {!hasProviderId ? (
                          <p className="mt-1 font-cairo text-[11px] font-semibold text-[#B42318]">
                            This result cannot be linked because `facilityProviderId` is missing.
                          </p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
          >
            ط¥ظ„ط؛ط§ط،
          </button>
          <button
            type="button"
            onClick={handleLink}
            disabled={!selectedId || submitting || !canLinkSelected}
            className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
          >
            <Link2 className="h-4 w-4" aria-hidden />
            {submitting ? 'ط¬ط§ط±ظچ ط§ظ„ط±ط¨ط·â€¦' : 'ط±ط¨ط· ط§ظ„ظ…ظ†ط´ط£ط©'}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
