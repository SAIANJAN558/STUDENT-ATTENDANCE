import { UserRole } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'smart_classmate_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = typeof data === 'object' && data?.error ? data.error : response.statusText || 'Request failed';
    throw new Error(errorMessage);
  }

  return data as T;
}

export interface ApiProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  roll_number: string | null;
  department: string | null;
  phone: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rollNumber?: string;
  phone?: string;
  department?: string;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
  profile: ApiProfile;
  role: UserRole;
  message?: string;
}

export interface ApiStudent {
  id: string;
  roll_number: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiAttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  subject?: string;
  marked_by?: string;
  created_at?: string;
}

export interface ApiTimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room?: string;
  created_at?: string;
}

export interface ApiMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (data: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
      rollNumber?: string;
      department?: string;
      phone?: string;
    }) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: () => request<{ user: ApiUser; profile: ApiProfile; role: UserRole }>('/auth/me'),

    updateProfile: (updates: Partial<ApiProfile>) =>
      request<{ profile: ApiProfile; user: ApiUser; message: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  },

  students: {
    getAll: () => request<ApiStudent[]>('/students'),
    getById: (id: string) => request<ApiStudent>(`/students/${id}`),
    add: (student: Omit<ApiStudent, 'id' | 'created_at' | 'updated_at'>) =>
      request<ApiStudent>('/students', {
        method: 'POST',
        body: JSON.stringify(student),
      }),
    update: (id: string, updates: Partial<ApiStudent>) =>
      request<ApiStudent>(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/students/${id}`, {
        method: 'DELETE',
      }),
  },

  attendance: {
    getAll: (params?: { student_id?: string; date?: string; subject?: string }) => {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return request<ApiAttendanceRecord[]>(`/attendance${search}`);
    },
    getByStudent: (rollNumber: string) =>
      request<ApiAttendanceRecord[]>(`/attendance/student/${encodeURIComponent(rollNumber)}`),
    mark: (record: Omit<ApiAttendanceRecord, 'id' | 'created_at'>) =>
      request<ApiAttendanceRecord>('/attendance', {
        method: 'POST',
        body: JSON.stringify(record),
      }),
    bulkMark: (records: Omit<ApiAttendanceRecord, 'id' | 'created_at'>[]) =>
      request<{ message: string; count: number }>('/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify(records),
      }),
  },

  timetable: {
    getAll: () => request<ApiTimetableEntry[]>('/timetable'),
    updateAll: (entries: ApiTimetableEntry[]) =>
      request<ApiTimetableEntry[]>('/timetable', {
        method: 'POST',
        body: JSON.stringify(entries),
      }),
    updateEntry: (entry: Partial<ApiTimetableEntry> & { day: string; time: string }) =>
      request<ApiTimetableEntry>('/timetable', {
        method: 'PUT',
        body: JSON.stringify(entry),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/timetable/${id}`, {
        method: 'DELETE',
      }),
  },

  messages: {
    getAll: (params?: { recipient_id?: string; sender_id?: string }) => {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return request<ApiMessage[]>(`/messages${search}`);
    },
    send: (message: Omit<ApiMessage, 'id' | 'created_at' | 'read'>) =>
      request<ApiMessage>('/messages', {
        method: 'POST',
        body: JSON.stringify(message),
      }),
    markAsRead: (id: string) =>
      request<ApiMessage>(`/messages/${id}/read`, {
        method: 'PUT',
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/messages/${id}`, {
        method: 'DELETE',
      }),
  },
};
