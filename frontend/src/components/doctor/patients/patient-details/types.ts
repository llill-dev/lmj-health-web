export type PatientDetailsTab =
  | "basic"
  | "history"
  | "encounters"
  | "medications"
  | "prescriptions"
  | "tests"
  | "files"
  | "documents"
  | "appointments"
  | "timeline";

export type TabConfig = {
  id: PatientDetailsTab;
  label: string;
};

export type FullProfileData = {
  medicalHistory: Array<{
    id: string;
    title: string;
    diagnosis: string;
    date: string;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  }>;
  prescriptions: Array<{
    id: string;
    status: string;
    createdAt: string;
    items: Array<{
      medicationName: string;
      dosage: string;
      frequency: string;
    }>;
    notes?: string;
  }>;
  files: Array<{ id: string; name: string; createdAt: string }>;
  orders: Array<{
    id: string;
    title: string;
    status: string;
    category: "lab" | "radiology" | "procedure" | "referral" | "other";
  }>;
};
