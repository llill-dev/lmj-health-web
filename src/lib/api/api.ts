/**
 * Professional Mock API Layer
 * Simulates REST endpoints with realistic delays, errors, and response handling
 * Designed for React Query integration with TypeScript types
 */

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

// ============================================================================
// Domain Types
// ============================================================================

export interface Patient {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: string;
  status: 'active' | 'inactive' | 'pending';
  lastVisit: string;
  totalVisits: number;
  recordsCount: number;
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  patientEmail?: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: 'clinic' | 'video' | 'home';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  notes?: string;
  price?: number;
  location?: string;
  videoLink?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  treatment: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  followUpDate?: string;
  doctor: string;
  attachments: Array<{
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'video';
  }>;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number; // years
  clinic: string;
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  avatar?: string;
  bio?: string;
  education: Array<{
    degree: string;
    university: string;
    year: string;
  }>;
  languages: string[];
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  services: string[];
  doctors: string[]; // doctor IDs
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalMedicalRecords: number;
}

export type WorkScheduleDayKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface WorkScheduleDay {
  enabled: boolean;
  from: string;
  to: string;
}

export interface WorkScheduleException {
  id: string;
  title: string;
  date: string;
}

export interface WorkSchedule {
  settings: {
    appointmentDuration: string;
    breakStart: string;
    breakEnd: string;
  };
  weekly: Record<WorkScheduleDayKey, WorkScheduleDay>;
  exceptions: WorkScheduleException[];
}

// ============================================================================
// Mock Data Store
// ============================================================================

class MockDataStore {
  private static instance: MockDataStore;
  private data: {
    patients: Patient[];
    appointments: Appointment[];
    medicalRecords: MedicalRecord[];
    doctors: Doctor[];
    clinics: Clinic[];
    workSchedule: WorkSchedule;
  };

  private constructor() {
    this.data = {
      patients: this.generateMockPatients(),
      appointments: this.generateMockAppointments(),
      medicalRecords: this.generateMockMedicalRecords(),
      doctors: this.generateMockDoctors(),
      clinics: this.generateMockClinics(),
      workSchedule: this.generateMockWorkSchedule(),
    };
  }

  private generateMockWorkSchedule(): WorkSchedule {
    return {
      settings: {
        appointmentDuration: '30',
        breakStart: '13:00',
        breakEnd: '14:00',
      },
      weekly: {
        sunday: { enabled: true, from: '09:00', to: '17:00' },
        monday: { enabled: true, from: '09:00', to: '17:00' },
        tuesday: { enabled: true, from: '09:00', to: '17:00' },
        wednesday: { enabled: true, from: '09:00', to: '17:00' },
        thursday: { enabled: true, from: '09:00', to: '17:00' },
        friday: { enabled: false, from: '', to: '' },
        saturday: { enabled: false, from: '', to: '' },
      },
      exceptions: [
        {
          id: `${Date.now()}-holiday`,
          title: 'إجازة رسمية',
          date: '2024-12-25',
        },
      ],
    };
  }

  // ============================================================================
  // Work Schedule API
  // ============================================================================

  async getWorkSchedule(): Promise<ApiResponse<WorkSchedule>> {
    await this.delay();
    return this.createResponse(this.data.workSchedule);
  }

  async updateWorkSchedule(
    payload: WorkSchedule,
  ): Promise<ApiResponse<WorkSchedule>> {
    await this.delay(900);

    this.data.workSchedule = payload;

    return this.createResponse(
      this.data.workSchedule,
      'Work schedule updated successfully',
    );
  }

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  // ============================================================================
  // Data Generators
  // ============================================================================

  private generateMockPatients(): Patient[] {
    return [
      {
        id: '1',
        name: 'أحمد محمد العلي',
        initials: 'أ',
        email: 'ahmad.ali@example.com',
        phone: '+966501234567',
        dateOfBirth: '1994-05-15',
        bloodType: 'A+',
        status: 'active',
        lastVisit: '2024-12-10',
        totalVisits: 12,
        recordsCount: 8,
        address: 'الرياض، حي النخيل',
        emergencyContact: {
          name: 'محمد العلي',
          phone: '+966501234568',
          relation: 'والد',
        },
      },
      {
        id: '2',
        name: 'فاطمة أحمد السالم',
        initials: 'ف',
        email: 'fatima.salem@example.com',
        phone: '+966502345678',
        dateOfBirth: '1992-08-22',
        bloodType: 'O+',
        status: 'inactive',
        lastVisit: '2024-11-15',
        totalVisits: 8,
        recordsCount: 5,
        address: 'جدة، حي الروضة',
        emergencyContact: {
          name: 'أحمد السالم',
          phone: '+966502345679',
          relation: 'زوج',
        },
      },
      {
        id: '3',
        name: 'محمد عبدالله العنزي',
        initials: 'م',
        email: 'mohammed.anzi@example.com',
        phone: '+966503456789',
        dateOfBirth: '1988-12-03',
        bloodType: 'B+',
        status: 'pending',
        lastVisit: 'لا توجد زيارات',
        totalVisits: 0,
        recordsCount: 0,
        address: 'الدمام، حي اليرموك',
        emergencyContact: {
          name: 'عبدالله العنزي',
          phone: '+966503456680',
          relation: 'والد',
        },
      },
    ];
  }

  private generateMockAppointments(): Appointment[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
      {
        id: '1',
        patientId: '1',
        patientName: 'أحمد محمد العلي',
        patientInitials: 'أ',
        date: today.toISOString().split('T')[0],
        time: '10:00',
        duration: 30,
        type: 'clinic',
        status: 'scheduled',
        notes: 'متابعة حالة الضغط',
        price: 150,
        location: 'عيادة الأطباء المتخصصين',
      },
      {
        id: '2',
        patientId: '2',
        patientName: 'فاطمة أحمد السالم',
        patientInitials: 'ف',
        date: today.toISOString().split('T')[0],
        time: '11:30',
        duration: 45,
        type: 'video',
        status: 'scheduled',
        notes: 'استشارة عن بعد',
        videoLink: 'https://meet.jit.si/fatima-xyz',
      },
      {
        id: '3',
        patientId: '1',
        patientName: 'أحمد محمد العلي',
        patientInitials: 'أ',
        date: tomorrow.toISOString().split('T')[0],
        time: '14:00',
        duration: 60,
        type: 'clinic',
        status: 'scheduled',
        notes: 'فحص شامل',
        price: 200,
        location: 'عيادة الأطباء المتخصصين',
      },
    ];
  }

  private generateMockMedicalRecords(): MedicalRecord[] {
    return [
      {
        id: '1',
        patientId: '1',
        patientName: 'أحمد محمد العلي',
        date: '2024-12-10',
        diagnosis: 'ارتفاع ضغط الدم',
        treatment: 'تغيير نمط الحياة + أدوية',
        medications: [
          {
            name: 'لوسارتان',
            dosage: '50mg',
            frequency: 'مرة واحدة يومياً',
          },
          {
            name: 'إنالابريل',
            dosage: '10mg',
            frequency: 'مرة واحدة يومياً',
          },
        ],
        followUpDate: '2024-12-24',
        doctor: 'د. خالد عبدالله',
        attachments: [
          {
            name: 'تحاليل الدم.pdf',
            url: '/mock-files/blood-test.pdf',
            type: 'pdf',
          },
          {
            name: 'صورة الأشعة السينية',
            url: '/mock-files/x-ray.jpg',
            type: 'image',
          },
        ],
      },
      {
        id: '2',
        patientId: '2',
        patientName: 'فاطمة أحمد السالم',
        date: '2024-11-15',
        diagnosis: 'التهاب الحلق',
        treatment: 'مضادات حيوية + راحة',
        medications: [
          {
            name: 'أموكسيسيلين',
            dosage: '500mg',
            frequency: 'كل 8 ساعات',
          },
        ],
        followUpDate: '2024-11-22',
        doctor: 'د. خالد عبدالله',
        attachments: [
          {
            name: 'فحص الحلق.jpg',
            url: '/mock-files/throat-exam.jpg',
            type: 'image',
          },
        ],
      },
    ];
  }

  private generateMockDoctors(): Doctor[] {
    return [
      {
        id: '1',
        name: 'د. خالد عبدالله',
        specialty: 'طب عام',
        rating: 4.9,
        experience: 15,
        clinic: 'عيادة الأطباء المتخصصين',
        availability: {
          days: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
          hours: {
            start: '09:00',
            end: '17:00',
          },
        },
        bio: 'طبيب عام بخبرة 15 عاماً في تشخيص وعلاج الأمراض الشائعة',
        education: [
          {
            degree: 'بكالوريوس الطب والجراحة',
            university: 'جامعة الملك سعود',
            year: '2009',
          },
        ],
        languages: ['العربية', 'الإنجليزية'],
      },
      {
        id: '2',
        name: 'د. سارة أحمد',
        specialty: 'طب أطفال',
        rating: 4.8,
        experience: 12,
        clinic: 'عيادة الأطباء المتخصصين',
        availability: {
          days: ['السبت', 'الأحد', 'الثلاثاء'],
          hours: {
            start: '10:00',
            end: '16:00',
          },
        },
        bio: 'طبيبة أطفال متخصصة في الرعاية الصحية للأطفال والرضع',
        education: [
          {
            degree: 'مجلس في طب الأطفال',
            university: 'جامعة القاهرة',
            year: '2012',
          },
        ],
        languages: ['العربية', 'الإنجليزية'],
      },
    ];
  }

  private generateMockClinics(): Clinic[] {
    return [
      {
        id: '1',
        name: 'عيادة الأطباء المتخصصين',
        address: 'الرياض، حي النخيل، شارع الملك فهد',
        phone: '+966112233445',
        email: 'info@specialists-clinic.sa',
        coordinates: {
          lat: 24.7136,
          lng: 46.6753,
        },
        workingHours: {
          الأحد: { open: '09:00', close: '17:00' },
          الإثنين: { open: '09:00', close: '17:00' },
          الثلاثاء: { open: '09:00', close: '17:00' },
          الأربعاء: { open: '09:00', close: '17:00' },
          الخميس: { open: '09:00', close: '17:00' },
          السبت: { open: '09:00', close: '15:00' },
        },
        services: ['طب عام', 'طب أطفال', 'طب نساء', 'جلدية'],
        doctors: ['1', '2'],
      },
    ];
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  private async delay(ms: number = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createResponse<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      data,
      message,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  private createErrorResponse(
    message: string,
    code = 'OPERATION_FAILED',
    status = 400,
  ): ApiError {
    return {
      message,
      code,
      status,
    };
  }

  // ============================================================================
  // Patients API
  // ============================================================================

  async getPatients(
    page = 1,
    limit = 10,
    search = '',
    status?: Patient['status'],
  ): Promise<PaginatedResponse<Patient>> {
    await this.delay();

    let filteredPatients = this.data.patients;

    if (search) {
      filteredPatients = filteredPatients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(search.toLowerCase()) ||
          patient.email.toLowerCase().includes(search.toLowerCase()) ||
          patient.phone.includes(search),
      );
    }

    if (status) {
      filteredPatients = filteredPatients.filter(
        (patient) => patient.status === status,
      );
    }

    const startIndex = (page - 1) * limit;
    const paginatedPatients = filteredPatients.slice(
      startIndex,
      startIndex + limit,
    );

    return {
      data: paginatedPatients,
      total: filteredPatients.length,
      page,
      limit,
      totalPages: Math.ceil(filteredPatients.length / limit),
    };
  }

  async getPatientById(id: string): Promise<ApiResponse<Patient>> {
    await this.delay();

    const patient = this.data.patients.find((p) => p.id === id);

    if (!patient) {
      throw new Error(`Patient with id ${id} not found`);
    }

    return this.createResponse(patient);
  }

  async createPatient(
    patientData: Omit<Patient, 'id'>,
  ): Promise<ApiResponse<Patient>> {
    await this.delay(1200);

    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      status: 'pending',
      totalVisits: 0,
      recordsCount: 0,
    };

    this.data.patients.push(newPatient);

    return this.createResponse(newPatient, 'Patient created successfully');
  }

  async updatePatient(
    id: string,
    updates: Partial<Patient>,
  ): Promise<ApiResponse<Patient>> {
    await this.delay();

    const patientIndex = this.data.patients.findIndex((p) => p.id === id);

    if (patientIndex === -1) {
      throw new Error(`Patient with id ${id} not found`);
    }

    this.data.patients[patientIndex] = {
      ...this.data.patients[patientIndex],
      ...updates,
    };

    return this.createResponse(
      this.data.patients[patientIndex],
      'Patient updated successfully',
    );
  }

  async deletePatient(id: string): Promise<ApiResponse<null>> {
    await this.delay();

    const patientIndex = this.data.patients.findIndex((p) => p.id === id);

    if (patientIndex === -1) {
      throw new Error(`Patient with id ${id} not found`);
    }

    this.data.patients.splice(patientIndex, 1);

    return this.createResponse(null, 'Patient deleted successfully');
  }

  async updatePatientStatus(
    id: string,
    status: Patient['status'],
  ): Promise<ApiResponse<Patient>> {
    return this.updatePatient(id, { status });
  }

  // ============================================================================
  // Appointments API
  // ============================================================================

  async getAppointments(
    page = 1,
    limit = 10,
    date?: string,
    status?: Appointment['status'],
    search?: string,
  ): Promise<PaginatedResponse<Appointment>> {
    await this.delay();

    let filteredAppointments = this.data.appointments;

    if (search) {
      filteredAppointments = filteredAppointments.filter(
        (apt) =>
          apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
          apt.patientEmail?.toLowerCase().includes(search.toLowerCase()) ||
          apt.notes?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (date) {
      filteredAppointments = filteredAppointments.filter(
        (apt) => apt.date === date,
      );
    }

    if (status) {
      filteredAppointments = filteredAppointments.filter(
        (apt) => apt.status === status,
      );
    }

    const startIndex = (page - 1) * limit;
    const paginatedAppointments = filteredAppointments.slice(
      startIndex,
      startIndex + limit,
    );

    return {
      data: paginatedAppointments,
      total: filteredAppointments.length,
      page,
      limit,
      totalPages: Math.ceil(filteredAppointments.length / limit),
    };
  }

  async getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
    await this.delay();

    const appointment = this.data.appointments.find((a) => a.id === id);

    if (!appointment) {
      throw new Error(`Appointment with id ${id} not found`);
    }

    return this.createResponse(appointment);
  }

  async createAppointment(
    appointmentData: Omit<Appointment, 'id'>,
  ): Promise<ApiResponse<Appointment>> {
    await this.delay(1200);

    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      status: 'scheduled',
    };

    this.data.appointments.push(newAppointment);

    return this.createResponse(
      newAppointment,
      'Appointment created successfully',
    );
  }

  async updateAppointmentStatus(
    id: string,
    status: Appointment['status'],
  ): Promise<ApiResponse<Appointment>> {
    await this.delay();

    const appointmentIndex = this.data.appointments.findIndex(
      (a) => a.id === id,
    );

    if (appointmentIndex === -1) {
      throw new Error(`Appointment with id ${id} not found`);
    }

    this.data.appointments[appointmentIndex] = {
      ...this.data.appointments[appointmentIndex],
      status,
    };

    return this.createResponse(
      this.data.appointments[appointmentIndex],
      'Appointment status updated successfully',
    );
  }

  async cancelAppointment(id: string): Promise<ApiResponse<null>> {
    await this.delay();

    const appointmentIndex = this.data.appointments.findIndex(
      (a) => a.id === id,
    );

    if (appointmentIndex === -1) {
      throw new Error(`Appointment with id ${id} not found`);
    }

    this.data.appointments[appointmentIndex] = {
      ...this.data.appointments[appointmentIndex],
      status: 'cancelled',
    };

    return this.createResponse(null, 'Appointment cancelled successfully');
  }

  async completeAppointment(id: string): Promise<ApiResponse<null>> {
    await this.delay();

    const appointmentIndex = this.data.appointments.findIndex(
      (a) => a.id === id,
    );

    if (appointmentIndex === -1) {
      throw new Error(`Appointment with id ${id} not found`);
    }

    this.data.appointments[appointmentIndex] = {
      ...this.data.appointments[appointmentIndex],
      status: 'completed',
    };

    return this.createResponse(null, 'Appointment completed successfully');
  }

  // ============================================================================
  // Medical Records API
  // ============================================================================

  async getMedicalRecords(
    page = 1,
    limit = 10,
    patientId?: string,
  ): Promise<PaginatedResponse<MedicalRecord>> {
    await this.delay();

    let filteredRecords = this.data.medicalRecords;

    if (patientId) {
      filteredRecords = filteredRecords.filter(
        (record) => record.patientId === patientId,
      );
    }

    const startIndex = (page - 1) * limit;
    const paginatedRecords = filteredRecords.slice(
      startIndex,
      startIndex + limit,
    );

    return {
      data: paginatedRecords,
      total: filteredRecords.length,
      page,
      limit,
      totalPages: Math.ceil(filteredRecords.length / limit),
    };
  }

  async getMedicalRecordById(id: string): Promise<ApiResponse<MedicalRecord>> {
    await this.delay();

    const record = this.data.medicalRecords.find((r) => r.id === id);

    if (!record) {
      throw new Error(`Medical record with id ${id} not found`);
    }

    return this.createResponse(record);
  }

  async createMedicalRecord(
    recordData: Omit<MedicalRecord, 'id'>,
  ): Promise<ApiResponse<MedicalRecord>> {
    await this.delay(1200);

    const newRecord: MedicalRecord = {
      ...recordData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };

    this.data.medicalRecords.push(newRecord);

    return this.createResponse(
      newRecord,
      'Medical record created successfully',
    );
  }

  // ============================================================================
  // Doctors API
  // ============================================================================

  async getDoctors(
    page = 1,
    limit = 10,
    specialty?: string,
  ): Promise<PaginatedResponse<Doctor>> {
    await this.delay();

    let filteredDoctors = this.data.doctors;

    if (specialty) {
      filteredDoctors = filteredDoctors.filter((doctor) =>
        doctor.specialty.toLowerCase().includes(specialty.toLowerCase()),
      );
    }

    const startIndex = (page - 1) * limit;
    const paginatedDoctors = filteredDoctors.slice(
      startIndex,
      startIndex + limit,
    );

    return {
      data: paginatedDoctors,
      total: filteredDoctors.length,
      page,
      limit,
      totalPages: Math.ceil(filteredDoctors.length / limit),
    };
  }

  async getDoctorById(id: string): Promise<ApiResponse<Doctor>> {
    await this.delay();

    const doctor = this.data.doctors.find((d) => d.id === id);

    if (!doctor) {
      throw new Error(`Doctor with id ${id} not found`);
    }

    return this.createResponse(doctor);
  }

  // ============================================================================
  // Clinics API
  // ============================================================================

  async getClinics(): Promise<ApiResponse<Clinic[]>> {
    await this.delay();
    return this.createResponse(this.data.clinics);
  }

  async getClinicById(id: string): Promise<ApiResponse<Clinic>> {
    await this.delay();

    const clinic = this.data.clinics.find((c) => c.id === id);

    if (!clinic) {
      throw new Error(`Clinic with id ${id} not found`);
    }

    return this.createResponse(clinic);
  }

  // ============================================================================
  // Statistics API
  // ============================================================================

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    await this.delay();

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = this.data.appointments.filter(
      (apt) => apt.date === today,
    );

    return this.createResponse({
      totalPatients: this.data.patients.length,
      activePatients: this.data.patients.filter((p) => p.status === 'active')
        .length,
      totalAppointments: this.data.appointments.length,
      todayAppointments: todayAppointments.length,
      completedAppointments: this.data.appointments.filter(
        (apt) => apt.status === 'completed',
      ).length,
      pendingAppointments: this.data.appointments.filter(
        (apt) => apt.status === 'scheduled',
      ).length,
      totalMedicalRecords: this.data.medicalRecords.length,
    });
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const api = MockDataStore.getInstance();
