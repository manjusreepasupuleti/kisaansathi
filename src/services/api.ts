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
import { localStore } from './localStore';

const API_BASE = '/api';

/**
 * Detects whether the app is hosted on static hosting (such as GitHub Pages)
 * where a custom Node/Express backend cannot run.
 */
function isStaticEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host.endsWith('github.io') ||
    host.includes('pages.dev') ||
    window.location.protocol === 'file:' ||
    window.location.pathname.startsWith('/kisaansathi')
  );
}

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
    const err = new Error(errorData.error || `HTTP error ${response.status}`) as any;
    err.status = response.status;
    throw err;
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
    if (isStaticEnvironment()) {
      const user = localStore.farmerLogin(payload);
      return { success: true, role: 'farmer', user, token: `local-farmer-${user.id}` };
    }
    try {
      return await fetchJSON(`${API_BASE}/auth/farmer/login`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        const user = localStore.farmerLogin(payload);
        return { success: true, role: 'farmer', user, token: `local-farmer-${user.id}` };
      }
      throw err;
    }
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
    if (isStaticEnvironment()) {
      const user = localStore.registerFarmer(payload);
      return {
        success: true,
        role: 'farmer',
        user,
        token: `local-farmer-${user.id}`,
        message: 'Farmer registered successfully in local session'
      };
    }
    try {
      return await fetchJSON(`${API_BASE}/auth/farmer/register`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        const user = localStore.registerFarmer(payload);
        return {
          success: true,
          role: 'farmer',
          user,
          token: `local-farmer-${user.id}`,
          message: 'Farmer registered successfully'
        };
      }
      throw err;
    }
  },

  async staffLogin(payload: {
    username: string;
    password: string;
  }): Promise<{ success: boolean; role: 'staff'; user: Staff & { center?: ProcurementCenter }; token: string }> {
    if (isStaticEnvironment()) {
      const user = localStore.staffLogin(payload);
      return { success: true, role: 'staff', user, token: `local-staff-${user.id}` };
    }
    try {
      return await fetchJSON(`${API_BASE}/auth/staff/login`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        const user = localStore.staffLogin(payload);
        return { success: true, role: 'staff', user, token: `local-staff-${user.id}` };
      }
      throw err;
    }
  },

  async getAdminStatus(): Promise<{ has_admin: boolean; count: number; admins: Admin[] }> {
    if (isStaticEnvironment()) {
      const admins = localStore.getAdmins();
      return { has_admin: admins.length > 0, count: admins.length, admins };
    }
    try {
      return await fetchJSON<{ has_admin: boolean; count: number; admins: Admin[] }>(`${API_BASE}/auth/admin/status`);
    } catch (err: any) {
      const admins = localStore.getAdmins();
      return { has_admin: admins.length > 0, count: admins.length, admins };
    }
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
    if (isStaticEnvironment()) {
      const user = localStore.registerAdmin(payload);
      return {
        success: true,
        role: 'admin',
        user,
        token: `local-admin-${user.id}`,
        message: 'Directorate initialized successfully'
      };
    }
    try {
      return await fetchJSON(`${API_BASE}/auth/admin/register`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        const user = localStore.registerAdmin(payload);
        return {
          success: true,
          role: 'admin',
          user,
          token: `local-admin-${user.id}`,
          message: 'Directorate initialized successfully'
        };
      }
      throw err;
    }
  },

  async adminLogin(payload: {
    username?: string;
    email_or_username?: string;
    password?: string;
    auth_type?: 'password' | 'biometric' | 'face_id' | 'fingerprint';
    admin_id?: string;
  }): Promise<{ success: boolean; role: 'admin'; auth_method?: string; user: Admin; token: string }> {
    if (isStaticEnvironment()) {
      const user = localStore.adminLogin(payload);
      return {
        success: true,
        role: 'admin',
        auth_method: payload.auth_type || 'password',
        user,
        token: `local-admin-${user.id}`
      };
    }
    try {
      return await fetchJSON(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        const user = localStore.adminLogin(payload);
        return {
          success: true,
          role: 'admin',
          auth_method: payload.auth_type || 'password',
          user,
          token: `local-admin-${user.id}`
        };
      }
      throw err;
    }
  },

  async resetData(): Promise<{ success: boolean; message: string }> {
    localStore.resetToCleanState();
    if (!isStaticEnvironment()) {
      try {
        await fetchJSON(`${API_BASE}/system/reset-data`, { method: 'POST' });
      } catch (e) {
        // Ignore fallback
      }
    }
    return { success: true, message: 'Data reset successfully' };
  },

  // --- Farmers ---
  async getFarmers(): Promise<Farmer[]> {
    if (isStaticEnvironment()) {
      return localStore.getFarmers();
    }
    try {
      return await fetchJSON<Farmer[]>(`${API_BASE}/farmers`);
    } catch (err) {
      return localStore.getFarmers();
    }
  },

  // --- Centers ---
  async getCenters(): Promise<ProcurementCenter[]> {
    if (isStaticEnvironment()) {
      return localStore.getCenters();
    }
    try {
      return await fetchJSON<ProcurementCenter[]>(`${API_BASE}/procurement-centers`);
    } catch (err) {
      return localStore.getCenters();
    }
  },

  async updateCenter(id: string, data: Partial<ProcurementCenter>): Promise<ProcurementCenter> {
    if (isStaticEnvironment()) {
      return localStore.updateCenter(id, data);
    }
    try {
      return await fetchJSON<ProcurementCenter>(`${API_BASE}/procurement-centers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.updateCenter(id, data);
      }
      throw err;
    }
  },

  async createCenter(data: Omit<ProcurementCenter, 'id' | 'created_at'>): Promise<ProcurementCenter> {
    if (isStaticEnvironment()) {
      return localStore.addCenter(data);
    }
    try {
      return await fetchJSON<ProcurementCenter>(`${API_BASE}/procurement-centers`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.addCenter(data);
      }
      throw err;
    }
  },

  // --- Crops ---
  async getCrops(): Promise<Crop[]> {
    if (isStaticEnvironment()) {
      return localStore.getCrops();
    }
    try {
      return await fetchJSON<Crop[]>(`${API_BASE}/crops`);
    } catch (err) {
      return localStore.getCrops();
    }
  },

  async updateCrop(id: string, data: Partial<Crop>): Promise<Crop> {
    if (isStaticEnvironment()) {
      return localStore.updateCrop(id, data);
    }
    try {
      return await fetchJSON<Crop>(`${API_BASE}/crops/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.updateCrop(id, data);
      }
      throw err;
    }
  },

  async createCrop(data: Omit<Crop, 'id'>): Promise<Crop> {
    if (isStaticEnvironment()) {
      return localStore.addCrop(data);
    }
    try {
      return await fetchJSON<Crop>(`${API_BASE}/crops`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.addCrop(data);
      }
      throw err;
    }
  },

  // --- Tokens ---
  async getTokens(params?: { farmer_id?: string; center_id?: string; status?: string }): Promise<ProcurementToken[]> {
    if (isStaticEnvironment()) {
      return localStore.getTokens(params);
    }
    try {
      const query = new URLSearchParams();
      if (params?.farmer_id) query.append('farmer_id', params.farmer_id);
      if (params?.center_id) query.append('center_id', params.center_id);
      if (params?.status) query.append('status', params.status);
      const qs = query.toString();
      return await fetchJSON<ProcurementToken[]>(`${API_BASE}/tokens${qs ? `?${qs}` : ''}`);
    } catch (err) {
      return localStore.getTokens(params);
    }
  },

  async getTokenById(id: string): Promise<ProcurementToken> {
    if (isStaticEnvironment()) {
      return localStore.getTokenById(id);
    }
    try {
      return await fetchJSON<ProcurementToken>(`${API_BASE}/tokens/${id}`);
    } catch (err) {
      return localStore.getTokenById(id);
    }
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
    if (isStaticEnvironment()) {
      return localStore.bookToken(payload);
    }
    try {
      return await fetchJSON<ProcurementToken>(`${API_BASE}/tokens`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.bookToken(payload);
      }
      throw err;
    }
  },

  async updateTokenStatus(id: string, status: ProcurementToken['status']): Promise<ProcurementToken> {
    if (isStaticEnvironment()) {
      return localStore.updateTokenStatus(id, status);
    }
    try {
      return await fetchJSON<ProcurementToken>(`${API_BASE}/tokens/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.updateTokenStatus(id, status);
      }
      throw err;
    }
  },

  // --- Weighing ---
  async recordWeighing(payload: {
    token_id: string;
    gross_weight_kg: number;
    tare_weight_kg: number;
    staff_id: string;
    staff_name?: string;
  }): Promise<WeighingRecord> {
    if (isStaticEnvironment()) {
      return localStore.recordWeighing(payload);
    }
    try {
      return await fetchJSON<WeighingRecord>(`${API_BASE}/weighing`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.recordWeighing(payload);
      }
      throw err;
    }
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
    if (isStaticEnvironment()) {
      return localStore.recordQualityCheck(payload);
    }
    try {
      return await fetchJSON<QualityCheck>(`${API_BASE}/quality-checks`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.recordQualityCheck(payload);
      }
      throw err;
    }
  },

  // --- Procurement Acceptance & Dispatch ---
  async acceptProcurement(token_id: string): Promise<{ token: ProcurementToken; payment: PaymentRecord }> {
    if (isStaticEnvironment()) {
      return localStore.acceptProcurement(token_id);
    }
    try {
      return await fetchJSON<{ token: ProcurementToken; payment: PaymentRecord }>(`${API_BASE}/procurement/accept`, {
        method: 'POST',
        body: JSON.stringify({ token_id })
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.acceptProcurement(token_id);
      }
      throw err;
    }
  },

  async dispatchToken(payload: {
    token_id: string;
    warehouse_name: string;
    truck_no: string;
    destination: string;
    staff_id: string;
  }): Promise<ProcurementToken> {
    if (isStaticEnvironment()) {
      return localStore.dispatchToken(payload);
    }
    try {
      return await fetchJSON<ProcurementToken>(`${API_BASE}/procurement/dispatch`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.dispatchToken(payload);
      }
      throw err;
    }
  },

  // --- Payments ---
  async getPayments(farmer_id?: string): Promise<PaymentRecord[]> {
    if (isStaticEnvironment()) {
      return localStore.getPayments(farmer_id);
    }
    try {
      const url = farmer_id ? `${API_BASE}/payments?farmer_id=${farmer_id}` : `${API_BASE}/payments`;
      return await fetchJSON<PaymentRecord[]>(url);
    } catch (err) {
      return localStore.getPayments(farmer_id);
    }
  },

  async processPayment(id: string, utr?: string): Promise<PaymentRecord> {
    if (isStaticEnvironment()) {
      return localStore.processPayment(id, utr);
    }
    try {
      return await fetchJSON<PaymentRecord>(`${API_BASE}/payments/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({ utr })
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.processPayment(id, utr);
      }
      throw err;
    }
  },

  // --- Notifications ---
  async getNotifications(recipient_type?: string, recipient_id?: string): Promise<Notification[]> {
    if (isStaticEnvironment()) {
      return localStore.getNotifications(recipient_type, recipient_id);
    }
    try {
      const query = new URLSearchParams();
      if (recipient_type) query.append('recipient_type', recipient_type);
      if (recipient_id) query.append('recipient_id', recipient_id);
      const qs = query.toString();
      return await fetchJSON<Notification[]>(`${API_BASE}/notifications${qs ? `?${qs}` : ''}`);
    } catch (err) {
      return localStore.getNotifications(recipient_type, recipient_id);
    }
  },

  async markNotificationsRead(ids?: string[]): Promise<{ success: boolean }> {
    localStore.markNotificationsRead(ids);
    if (!isStaticEnvironment()) {
      try {
        await fetchJSON<{ success: boolean }>(`${API_BASE}/notifications/read`, {
          method: 'POST',
          body: JSON.stringify({ ids })
        });
      } catch (e) {
        // local store already updated
      }
    }
    return { success: true };
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.markNotificationsRead([id]);
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.markNotificationsRead();
  },

  // --- Staff Directory ---
  async getStaff(): Promise<(Staff & { center?: ProcurementCenter })[]> {
    if (isStaticEnvironment()) {
      return localStore.getStaffList();
    }
    try {
      return await fetchJSON<(Staff & { center?: ProcurementCenter })[]>(`${API_BASE}/staff`);
    } catch (err) {
      return localStore.getStaffList();
    }
  },

  async createStaff(data: Partial<Staff> & { name: string; username: string; procurement_center_id: string; role: Staff['role'] }): Promise<Staff & { center?: ProcurementCenter }> {
    if (isStaticEnvironment()) {
      return localStore.createStaff(data);
    }
    try {
      return await fetchJSON<Staff & { center?: ProcurementCenter }>(`${API_BASE}/staff`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.createStaff(data);
      }
      throw err;
    }
  },

  async resetStaffPassword(id: string, custom_password?: string): Promise<{ staff: Staff; new_password: string }> {
    if (isStaticEnvironment()) {
      return localStore.resetStaffPassword(id, custom_password);
    }
    try {
      return await fetchJSON<{ staff: Staff; new_password: string }>(`${API_BASE}/staff/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ custom_password })
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.resetStaffPassword(id, custom_password);
      }
      throw err;
    }
  },

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff & { center?: ProcurementCenter }> {
    if (isStaticEnvironment()) {
      return localStore.updateStaff(id, updates);
    }
    try {
      return await fetchJSON<Staff & { center?: ProcurementCenter }>(`${API_BASE}/staff/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return localStore.updateStaff(id, updates);
      }
      throw err;
    }
  },

  async deleteStaff(id: string): Promise<{ success: boolean }> {
    if (isStaticEnvironment()) {
      return { success: localStore.deleteStaff(id) };
    }
    try {
      return await fetchJSON<{ success: boolean }>(`${API_BASE}/staff/${id}`, {
        method: 'DELETE'
      });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404 || !err.status) {
        return { success: localStore.deleteStaff(id) };
      }
      throw err;
    }
  },

  // --- Analytics & Stats ---
  async getStats(): Promise<ProcurementStats> {
    if (isStaticEnvironment()) {
      return localStore.getStats();
    }
    try {
      return await fetchJSON<ProcurementStats>(`${API_BASE}/stats`);
    } catch (err) {
      return localStore.getStats();
    }
  },

  // --- System Config ---
  async getSystemConfig(): Promise<{
    supabase_url: string | null;
    has_anon_key: boolean;
    is_cloud_synced: boolean;
    active_season: string;
    platform_version: string;
  }> {
    return {
      supabase_url: null,
      has_anon_key: false,
      is_cloud_synced: false,
      active_season: 'Rabi 2025-26',
      platform_version: 'v2.4-SIH-Edition'
    };
  }
};
