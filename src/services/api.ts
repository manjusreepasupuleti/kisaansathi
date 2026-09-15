import {
  Farmer,
  Staff,
  Admin,
  ProcurementCenter,
  Crop,
  ProcurementToken,
  WeighingRecord,
  QualityCheck,
  PaymentRecord,
  Notification,
  ProcurementStats
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // --- Auth ---
  async farmerLogin(payload: {
    mobile_number: string;
    pin?: string;
    password?: string;
  }): Promise<{ success: boolean; role: 'farmer'; user: Farmer; token: string }> {
    return fetchJSON(`${API_BASE}/auth/farmer/login`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async farmerRegister(payload: {
    name: string;
    mobile_number: string;
    village: string;
    district?: string;
    state?: string;
    aadhar_number?: string;
    land_acreage?: number;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    pin?: string;
    password?: string;
  }): Promise<{ success: boolean; role: 'farmer'; user: Farmer; token: string; message: string }> {
    return fetchJSON(`${API_BASE}/auth/farmer/register`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async staffLogin(payload: {
    username: string;
    password: string;
  }): Promise<{ success: boolean; role: 'staff'; user: Staff & { center?: ProcurementCenter }; token: string }> {
    return fetchJSON(`${API_BASE}/auth/staff/login`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getAdminStatus(): Promise<{ has_admin: boolean; count: number; admins: Admin[] }> {
    return fetchJSON<{ has_admin: boolean; count: number; admins: Admin[] }>(`${API_BASE}/auth/admin/status`);
  },

  async adminRegister(payload: {
    name: string;
    email: string;
    username?: string;
    password: string;
    mandi_name?: string;
    district?: string;
    state?: string;
    daily_capacity?: number;
    designation?: string;
    biometric_enabled?: boolean;
  }): Promise<{ success: boolean; role: 'admin'; user: Admin; token: string; message: string }> {
    return fetchJSON(`${API_BASE}/auth/admin/register`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async adminLogin(payload: {
    username?: string;
    email_or_username?: string;
    password?: string;
    auth_type?: 'password' | 'biometric' | 'face_id' | 'fingerprint';
    admin_id?: string;
  }): Promise<{ success: boolean; role: 'admin'; auth_method?: string; user: Admin; token: string }> {
    return fetchJSON(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async resetData(): Promise<{ success: boolean; message: string }> {
    return fetchJSON(`${API_BASE}/system/reset-data`, {
      method: 'POST'
    });
  },

  // --- Farmers ---
  async getFarmers(): Promise<Farmer[]> {
    return fetchJSON<Farmer[]>(`${API_BASE}/farmers`);
  },

  // --- Centers ---
  async getCenters(): Promise<ProcurementCenter[]> {
    return fetchJSON<ProcurementCenter[]>(`${API_BASE}/procurement-centers`);
  },

  async updateCenter(id: string, data: Partial<ProcurementCenter>): Promise<ProcurementCenter> {
    return fetchJSON<ProcurementCenter>(`${API_BASE}/procurement-centers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async createCenter(data: Omit<ProcurementCenter, 'id' | 'created_at'>): Promise<ProcurementCenter> {
    return fetchJSON<ProcurementCenter>(`${API_BASE}/procurement-centers`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // --- Crops ---
  async getCrops(): Promise<Crop[]> {
    return fetchJSON<Crop[]>(`${API_BASE}/crops`);
  },

  async updateCrop(id: string, data: Partial<Crop>): Promise<Crop> {
    return fetchJSON<Crop>(`${API_BASE}/crops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async createCrop(data: Omit<Crop, 'id'>): Promise<Crop> {
    return fetchJSON<Crop>(`${API_BASE}/crops`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // --- Tokens ---
  async getTokens(params?: { farmer_id?: string; center_id?: string; status?: string }): Promise<ProcurementToken[]> {
    const query = new URLSearchParams();
    if (params?.farmer_id) query.append('farmer_id', params.farmer_id);
    if (params?.center_id) query.append('center_id', params.center_id);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return fetchJSON<ProcurementToken[]>(`${API_BASE}/tokens${qs ? `?${qs}` : ''}`);
  },

  async getTokenById(id: string): Promise<ProcurementToken> {
    return fetchJSON<ProcurementToken>(`${API_BASE}/tokens/${id}`);
  },

  async bookToken(payload: {
    farmer_id: string;
    crop_id: string;
    center_id: string;
    booking_date: string;
    slot_time: string;
    estimated_quantity_qtl: number;
    vehicle_number: string;
    vehicle_type?: string;
  }): Promise<ProcurementToken> {
    return fetchJSON<ProcurementToken>(`${API_BASE}/tokens`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateTokenStatus(id: string, status: ProcurementToken['status']): Promise<ProcurementToken> {
    return fetchJSON<ProcurementToken>(`${API_BASE}/tokens/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // --- Weighing ---
  async recordWeighing(payload: {
    token_id: string;
    gross_weight_kg: number;
    tare_weight_kg: number;
    staff_id: string;
    staff_name?: string;
  }): Promise<WeighingRecord> {
    return fetchJSON<WeighingRecord>(`${API_BASE}/weighing`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // --- Quality & Moisture ---
  async recordQualityCheck(payload: {
    token_id: string;
    moisture_percentage: number;
    foreign_matter_pct: number;
    damaged_grains_pct: number;
    staff_id: string;
    staff_name?: string;
    remarks?: string;
  }): Promise<QualityCheck> {
    return fetchJSON<QualityCheck>(`${API_BASE}/quality-checks`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // --- Procurement Acceptance & Dispatch ---
  async acceptProcurement(token_id: string): Promise<{ token: ProcurementToken; payment: PaymentRecord }> {
    return fetchJSON<{ token: ProcurementToken; payment: PaymentRecord }>(`${API_BASE}/procurement/accept`, {
      method: 'POST',
      body: JSON.stringify({ token_id })
    });
  },

  async dispatchToken(payload: {
    token_id: string;
    warehouse_name: string;
    truck_no: string;
    destination: string;
    staff_id: string;
  }): Promise<ProcurementToken> {
    return fetchJSON<ProcurementToken>(`${API_BASE}/procurement/dispatch`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // --- Payments ---
  async getPayments(farmer_id?: string): Promise<PaymentRecord[]> {
    const url = farmer_id ? `${API_BASE}/payments?farmer_id=${farmer_id}` : `${API_BASE}/payments`;
    return fetchJSON<PaymentRecord[]>(url);
  },

  async processPayment(id: string, utr?: string): Promise<PaymentRecord> {
    return fetchJSON<PaymentRecord>(`${API_BASE}/payments/${id}/process`, {
      method: 'POST',
      body: JSON.stringify({ utr })
    });
  },

  // --- Notifications ---
  async getNotifications(recipient_type?: string, recipient_id?: string): Promise<Notification[]> {
    const query = new URLSearchParams();
    if (recipient_type) query.append('recipient_type', recipient_type);
    if (recipient_id) query.append('recipient_id', recipient_id);
    const qs = query.toString();
    return fetchJSON<Notification[]>(`${API_BASE}/notifications${qs ? `?${qs}` : ''}`);
  },

  async markNotificationsRead(ids?: string[]): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(`${API_BASE}/notifications/read`, {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.markNotificationsRead([id]);
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.markNotificationsRead();
  },

  // --- Staff Directory ---
  async getStaff(): Promise<(Staff & { center?: ProcurementCenter })[]> {
    return fetchJSON<(Staff & { center?: ProcurementCenter })[]>(`${API_BASE}/staff`);
  },

  async createStaff(data: Partial<Staff> & { name: string; username: string; procurement_center_id: string; role: Staff['role'] }): Promise<Staff & { center?: ProcurementCenter }> {
    return fetchJSON<Staff & { center?: ProcurementCenter }>(`${API_BASE}/staff`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async resetStaffPassword(id: string, custom_password?: string): Promise<{ staff: Staff; new_password: string }> {
    return fetchJSON<{ staff: Staff; new_password: string }>(`${API_BASE}/staff/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ custom_password })
    });
  },

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff & { center?: ProcurementCenter }> {
    return fetchJSON<Staff & { center?: ProcurementCenter }>(`${API_BASE}/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteStaff(id: string): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(`${API_BASE}/staff/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Analytics & Stats ---
  async getStats(): Promise<ProcurementStats> {
    return fetchJSON<ProcurementStats>(`${API_BASE}/stats`);
  },

  // --- System Config ---
  async getSystemConfig(): Promise<{
    supabase_url: string | null;
    has_anon_key: boolean;
    is_cloud_synced: boolean;
    active_season: string;
    platform_version: string;
  }> {
    return fetchJSON(`${API_BASE}/system/config`);
  }
};
