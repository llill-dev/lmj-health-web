import { motion } from "framer-motion";
import { Download, Eye, FileText, Loader2, Trash2, Upload } from "lucide-react";
import type { ChangeEvent } from "react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import type { DoctorPatientFile } from "@/lib/doctor/types";

import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";

interface PatientFilesTabProps {
  files: DoctorPatientFile[];
  fileActionKey: string | null;
  onOpenFile: (fileId: string) => void;
  onDownloadFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onUploadFile: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function PatientFilesTab({
  files,
  fileActionKey,
  onOpenFile,
  onDownloadFile,
  onDeleteFile,
  onUploadFile,
}: PatientFilesTabProps) {
  if (!files.length) {
    return (
      <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full">
        <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
          <PatientTabEmptyIllustration
            variant="teal"
            imageSrc="/images/photo-not-meduical-file.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.12)]"
            title="لا توجد ملفات مرتبطة بهذا المريض"
            subtitle="يمكنك رفع أول ملف طبي من هنا"
            actionLabel="رفع ملف"
            onAction={() => document.getElementById("patient-file-upload-input")?.click()}
            actionIcon={<Upload className="h-4 w-4" />}
          />
        </motion.div>
        <input
          id="patient-file-upload-input"
          type="file"
          className="hidden"
          onChange={onUploadFile}
        />
      </motion.div>
    );
  }

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={TAB_STAGGER_ITEM} className="flex justify-start">
        <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.18)] transition-colors hover:bg-[#0d7a77]">
          {fileActionKey === "upload" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          رفع ملف
          <input type="file" className="hidden" onChange={onUploadFile} />
        </label>
      </motion.div>

      {files.map((file, index) => {
        const id = file._id ?? file.id ?? `${index}`;
        const isBusy = fileActionKey === id;
        return (
          <motion.div key={id} variants={TAB_STAGGER_ITEM} className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="text-start">
                  <div className="font-cairo text-[14px] font-extrabold text-[#0F172A]">
                    {file.originalName ?? "ملف"}
                  </div>
                  <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                    {file.createdAt ?? "—"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenFile(id)}
                  disabled={isBusy}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary transition-colors hover:bg-[#F0F9F9] disabled:opacity-50"
                >
                  {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                  عرض
                </button>
                <button
                  type="button"
                  onClick={() => onDownloadFile(id)}
                  disabled={isBusy}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary transition-colors hover:bg-[#F0F9F9] disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  تحميل
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteFile(id)}
                  disabled={isBusy}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#F04438] bg-white px-3 font-cairo text-[12px] font-bold text-[#D92D20] transition-colors hover:bg-[#FEF3F2] disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
