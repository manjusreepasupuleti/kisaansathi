/**
 * KisaanSathi - Smart Farmer Procurement & Crop Tracking Platform
 * Core TypeScript Types & Interfaces
 */

export type UserRole = 'farmer' | 'staff' | 'admin';

export type TokenStatus = 
  | 'BOOKED'
  | 'GATE_ARRIVED'
  | 'WEIGHED'
  | 'QUALITY_CHECKED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'DISPATCHED'
  | 'PAYMENT_PROCESSED';

export type PaymentStatus = 'PENDING' | 'INITIATED' | 'PROCESSED' | 'CREDITED' | 'FAILED';

export type GrainGrade = 'Grade A' | 'FAQ (Fair Average Quality)' | 'Grade B' | 'Rejected / Undergrade';

export interface Farmer {
  id: string;
  name: string;
  mobile_number: string;
  village: string;
  district: string;
  state: string;
  aadhar_last4?: string;
  aadhar_number?: string;
  land_acreage?: number;
  pin?: string;
  password?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  username: string;
  procurement_center_id: string;
  role: 'weighing_officer' | 'quality_inspector' | 'center_manager' | 'operator';
  phone?: string;
  email?: string;
  password?: string;
  temp_password?: string;
  status?: 'active' | 'suspended';
  created_at: string;
}

export interface Admin {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'procurement_director' | 'mandi_secretary';
  mandi_id?: string;
  mandi_name?: string;
  district?: string;
  state?: string;
  designation?: string;
  biometric_enabled?: boolean;
  biometric_registered_at?: string;
  created_at: string;
}

export interface ProcurementCenter {
  id: string;
  center_name: string;
  location: string;
  district: string;
  state: string;
  daily_capacity: number; // in Quintals
  current_capacity: number; // Quintals booked today
  status: 'active' | 'full' | 'maintenance';
  contact_phone: string;
  operating_hours: string;
  created_at: string;
}

export interface Crop {
  id: string;
  crop_name: string;
  crop_code: string;
  msp_price: number; // Rs per quintal
  max_moisture_limit: number; // Percentage, e.g. 12.0 for wheat, 17.0 for paddy
  moisture_deduction_rate: number; // Rs deduction per 0.5% over limit
  season: string; // e.g. 'Rabi 2025-26'
  status: 'open' | 'closed';
  variety?: string;
}

export interface WeighingRecord {
  id: string;
  token_id: string;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  net_weight_qtl: number; // net_weight_kg / 100
  weighed_by_staff_id: string;
  weighed_by_name?: string;
  scale_slip_no: string;
  weighed_at: string;
}

export interface QualityCheck {
  id: string;
  token_id: string;
  moisture_percentage: number;
  foreign_matter_pct: number;
  damaged_grains_pct: number;
  grain_grade: GrainGrade;
  is_acceptable: boolean;
  min_moisture_req: number;
  max_moisture_limit: number;
  deduction_percentage: number;
  deduction_amount_per_qtl: number;
  checked_by_staff_id: string;
  checked_by_name?: string;
  remarks: string;
  checked_at: string;
}

export interface PaymentRecord {
  id: string;
  token_id: string;
  farmer_id: string;
  gross_amount: number;
  deduction_amount: number;
  net_payable: number;
  payment_status: PaymentStatus;
  utr_number?: string;
  bank_name: string;
  account_number_masked: string;
  ifsc: string;
  processed_at?: string;
  credited_at?: string;
  created_at: string;
}

export interface ProcurementToken {
  id: string;
  token_number: string;
  farmer_id: string;
  crop_id: string;
  center_id: string;
  booking_date: string;
  slot_time: string;
  estimated_quantity_qtl: number;
  vehicle_number: string;
  vehicle_type: string;
  status: TokenStatus;
  queue_number: number;
  created_at: string;

  // Joined/Hydrated fields
  farmer?: Farmer;
  crop?: Crop;
  center?: ProcurementCenter;
  weighing?: WeighingRecord;
  quality?: QualityCheck;
  payment?: PaymentRecord;
  dispatch?: {
    warehouse_name: string;
    truck_no: string;
    dispatched_at: string;
  };
}

export interface Notification {
  id: string;
  recipient_type: 'farmer' | 'staff' | 'admin' | 'all';
  recipient_id?: string;
  title: string;
  message: string;
  type: 'token' | 'weighing' | 'quality' | 'payment' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface ProcurementStats {
  total_procured_qtl: number;
  total_tokens_booked: number;
  tokens_today: number;
  total_farmers_benefited: number;
  total_dbt_disbursed: number; // in INR
  active_centers_count: number;
  average_waiting_time_mins: number;
  quality_pass_rate_pct: number;
}
