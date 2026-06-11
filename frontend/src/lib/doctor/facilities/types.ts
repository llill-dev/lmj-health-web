export type DoctorFacilityStatus = 'active' | 'closed';

export type DoctorFacility = {
  id: string;
  name: string;
  description?: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  workHoursFrom: string;
  workHoursTo: string;
  status: DoctorFacilityStatus;
};

export type DoctorFacilityFormValues = {
  name: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  workHoursFrom: string;
  workHoursTo: string;
  active: boolean;
};
