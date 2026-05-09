/**
 * Mock API layer for UI/dev when back-end routes are unavailable.
 * Keeps only paths used by hooks and doctor UI_ONLY appointment bridge.
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

// ============================================================================
// Domain Types (actively imported by the app)
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
  /** رقم الهاتف للعرض في بطاقات المواعيد (اختياري حسب مصدر البيانات) */
  patientPhone?: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: 'clinic' | 'video' | 'home';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  notes?: string;
  price?: number;
  location?: string;
  videoLink?: string;
  /** ملفات مرفقة بالموعد (عرض فقط؛ الربط بالخادم لاحقاً) */
  appointmentFiles?: Array<{ name: string; date: string; url?: string }>;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  /** غير مستخدم بعد ربط السجلات بـ API؛ محفوظ لتوافق واجهة الإحصائيات */
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
    workSchedule: WorkSchedule;
  };

  private constructor() {
    this.data = {
      patients: this.generateMockPatients(),
      appointments: this.generateMockAppointments(),
      workSchedule: this.generateMockWorkSchedule(),
    };
  }

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
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
        patientPhone: '0501234567',
        date: today.toISOString().split('T')[0],
        time: '10:00',
        duration: 30,
        type: 'clinic',
        status: 'scheduled',
        notes: 'فحص دوري للقلب',
        price: 150,
        location: 'مستشفى القلب التخصصي، دمشق',
        appointmentFiles: [
          {
            name: 'تقرير المختبر',
            date: '2026-02-18',
          },
          {
            name: 'صورة الدم الكاملة',
            date: '2026-02-18',
          },
        ],
      },
      {
        id: '2',
        patientId: '2',
        patientName: 'فاطمة أحمد السالم',
        patientInitials: 'ف',
        patientPhone: '0509876543',
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

  // ── Patients ────────────────────────────────────────────────────────────

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

  // ── Appointments ─────────────────────────────────────────────────────────

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

    const appointmentIndex = this.data.appointments.findIndex((a) => a.id === id);

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

    const appointmentIndex = this.data.appointments.findIndex((a) => a.id === id);

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

    const appointmentIndex = this.data.appointments.findIndex((a) => a.id === id);

    if (appointmentIndex === -1) {
      throw new Error(`Appointment with id ${id} not found`);
    }

    this.data.appointments[appointmentIndex] = {
      ...this.data.appointments[appointmentIndex],
      status: 'completed',
    };

    return this.createResponse(null, 'Appointment completed successfully');
  }

  // ── Dashboard (mock KPIs aligned with appointments + patients only) ────

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    await this.delay();

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = this.data.appointments.filter(
      (apt) => apt.date === today,
    );

    const recordsBackedByPatients = this.data.patients.reduce(
      (acc, p) => acc + (p.recordsCount ?? 0),
      0,
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
      totalMedicalRecords: recordsBackedByPatients,
    });
  }
}

export const api = MockDataStore.getInstance();
