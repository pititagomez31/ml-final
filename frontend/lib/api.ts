const RAW_API_URL = (
  process.env.REACT_APP_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000'
).replace(/\/$/, '');

// Si RAW_API_URL ya termina en /api, se usa directamente, si no, se asegura /api
const BASE_URL = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL
  : `${RAW_API_URL}/api`;

function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/api/')
    ? endpoint.replace(/^\/api/, '')
    : endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url = `${BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = 'Ocurrió un error en la solicitud';
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return {} as T;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price_eur: number;
  duration_min: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  service_id: string;
  service_name: string;
  price_eur: number;
  duration_min: number;
  date: string;
  start: string;
  end: string;
  client_name: string;
  client_nickname?: string;
  client_phone: string;
  client_email?: string;
  booker_name?: string;
  status: string;
  confirmado?: boolean;
  recordatorio_enviado?: boolean;
  opt_in_whatsapp?: boolean;
  opt_in_fecha?: string;
  created_at?: string;
}

export interface AvailabilityResponse {
  date: string;
  service_id: string;
  duration_min: number;
  slots: string[];
}

export interface BusinessInfo {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  barber_name: string;
}

export interface Blocker {
  id: string;
  date: string;
  start?: string | null;
  end?: string | null;
  reason: string;
}

export interface ScheduleOverride {
  date: string;
  enabled: boolean;
  start: string;
  end: string;
  reason: string;
}

export interface DaySchedule {
  date: string;
  source: string;
  enabled: boolean;
  start: string;
  end: string;
  reason: string;
}

export interface WorkingHours {
  days: Record<string, { enabled: boolean; start: string; end: string }>;
  lunch: { enabled: boolean; start: string; end: string };
}

export const api = {
  // Auth
  login: (data: { username: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<any>('/auth/me'),

  // Business
  getBusinessInfo: () => request<BusinessInfo>('/business'),

  // Services
  getServices: (all = false) => request<Service[]>(`/services${all ? '?all=true' : ''}`),
  createService: (data: Partial<Service>) =>
    request<Service>('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id: string, data: Partial<Service>) =>
    request<Service>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id: string) =>
    request<{ ok: boolean }>(`/services/${id}`, { method: 'DELETE' }),

  // Availability & Schedule
  getAvailability: (serviceId: string, date: string) =>
    request<AvailabilityResponse>(`/availability?service_id=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`),
  getDaySchedule: (date: string) => request<DaySchedule>(`/day-schedule/${date}`),
  getWorkingHours: () => request<WorkingHours>('/working-hours'),
  setWorkingHours: (days: any) =>
    request<any>('/working-hours', { method: 'PUT', body: JSON.stringify({ days }) }),
  setLunchBreak: (lunch: any) =>
    request<any>('/lunch-break', { method: 'PUT', body: JSON.stringify(lunch) }),

  // Blockers & Overrides
  getBlockers: () => request<Blocker[]>('/blockers'),
  addBlocker: (data: Omit<Blocker, 'id'>) =>
    request<Blocker>('/blockers', { method: 'POST', body: JSON.stringify(data) }),
  deleteBlocker: (id: string) => request<{ ok: boolean }>(`/blockers/${id}`, { method: 'DELETE' }),
  getScheduleOverrides: (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<ScheduleOverride[]>(`/schedule-overrides${query}`);
  },
  upsertScheduleOverride: (data: ScheduleOverride) =>
    request<ScheduleOverride>('/schedule-overrides', { method: 'POST', body: JSON.stringify(data) }),
  deleteScheduleOverride: (date: string) =>
    request<{ ok: boolean }>(`/schedule-overrides/${date}`, { method: 'DELETE' }),

  // Appointments
  createAppointment: (data: {
    service_id: string;
    date: string;
    start: string;
    client_name: string;
    client_nickname?: string;
    client_phone: string;
    client_email?: string;
    booker_name?: string;
    accepted_policy: boolean;
    opt_in_whatsapp: boolean;
  }) => request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) }),

  forceAppointment: (data: {
    service_id: string;
    date: string;
    start: string;
    client_name: string;
    client_phone: string;
    client_nickname?: string;
  }) => request<Appointment>('/appointments/force', { method: 'POST', body: JSON.stringify(data) }),

  getAppointment: (id: string) => request<Appointment>(`/appointments/${id}`),
  getAppointments: (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Appointment[]>(`/appointments${query}`);
  },

  gestionarLookup: (code: string, phone: string) =>
    request<Appointment>('/appointments/gestionar', {
      method: 'POST',
      body: JSON.stringify({ code, phone }),
    }),

  cancelAppointmentByClient: (id: string, phone: string) =>
    request<{ ok: boolean }>(`/appointments/${id}/cancel?phone=${encodeURIComponent(phone)}`, {
      method: 'POST',
    }),

  modificarAppointment: (id: string, phone: string, date: string, start: string) =>
    request<Appointment>(`/appointments/${id}/modificar`, {
      method: 'POST',
      body: JSON.stringify({ phone, date, start }),
    }),

  cancelAppointmentByAdmin: (id: string) =>
    request<{ ok: boolean }>(`/appointments/${id}/admin-cancel`, { method: 'POST' }),

  confirmAppointment: (id: string) =>
    request<{ ok: boolean }>(`/appointments/${id}/confirmar`, { method: 'POST' }),

  sendReminder: (id: string) =>
    request<{ ok: boolean; sent?: boolean; error?: string }>(`/appointments/${id}/recordatorio`, {
      method: 'POST',
    }),

  // Clients
  getClients: () => request<any[]>('/clients'),
};
