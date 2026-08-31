import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  PrescriptionsHubPageHeader,
  PrescriptionsHubPagination,
  PrescriptionsHubSearchBar,
  PrescriptionsHubTable,
  type PrescriptionHubRowVm,
} from "@/components/doctor/prescription/hub";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorTableSkeleton } from "@/components/doctor/shared/skeletons";
import { useDoctorPrescriptionsHub } from "@/hooks/doctor/prescriptions/useDoctorPrescriptionsHub";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { readAuthUser } from "@/lib/cookies";
import { useI18n } from "@/i18n/provider";

export default function DoctorPrescriptionHubPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const list = useDoctorPrescriptionsHub(doctorId, { search, page, limit });
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    Promise.resolve(list.refetch()),
  );

  useEffect(() => {
    setPage(1);
  }, [search, limit]);

  useEffect(() => {
    if (page > list.totalPages) {
      setPage(list.totalPages);
    }
  }, [list.totalPages, page]);

  const handleViewPrescription = (row: PrescriptionHubRowVm) => {
    navigate(
      `/doctor/prescription?patientId=${encodeURIComponent(row.patientId)}&encounterId=${encodeURIComponent(row.encounterId)}`,
    );
  };

  return (
    <>
      <Helmet>
        <title>{t("doctor.prescriptionHub.pageTitle")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <PrescriptionsHubPageHeader />

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:p-6">
          <PrescriptionsHubSearchBar
            search={search}
            onSearchChange={setSearch}
          />

          <div className="mt-6">
            {list.isAwaitingData && !list.rows.length ? (
              <DoctorTableSkeleton rows={8} columns={5} />
            ) : list.isError ? (
              <DoctorListErrorState
                title={t("doctor.prescriptionHub.loadFailed")}
                brief={getUserFacingRequestErrorMessage(list.error)}
                retrying={retryingList}
                onRetry={() => void retryList()}
              />
            ) : (
              <PrescriptionsHubTable
                rows={list.rows}
                onViewPrescription={handleViewPrescription}
              />
            )}
          </div>
        </section>

        {!list.isAwaitingData && !list.isError ? (
          <div className="mt-5">
            <PrescriptionsHubPagination
              page={list.page}
              totalPages={list.totalPages}
              showingFrom={list.showingFrom}
              showingTo={list.showingTo}
              total={list.total}
              pageSize={limit}
              disabled={false}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
