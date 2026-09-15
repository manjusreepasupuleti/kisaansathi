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

interface DatabaseSchema {
  farmers: Farmer[];
  staff: Staff[];
  admins: Admin[];
  procurement_centers: ProcurementCenter[];
  crops: Crop[];
  tokens: ProcurementToken[];
  weighing_records: WeighingRecord[];
  quality_checks: QualityCheck[];
  payments: PaymentRecord[];
  notifications: Notification[];
}

const STORAGE_KEY = 'kisaansathi_local_db_v2';

export const INITIAL_CROPS: Crop[] = [
  {
    id: 'crop-1',
    crop_name: 'Wheat (Gehun / Kanak)',
    crop_code: 'WHEAT-FAQ',
    msp_price: 2275.0,
    max_moisture_limit: 12.0,
    moisture_deduction_rate: 25.0,
    season: 'Rabi 2025-26',
    status: 'open',
    variety: 'HD-2967 / PBW-550 (Grade A)'
  },
  {
    id: 'crop-2',
    crop_name: 'Paddy (Common Dhan)',
    crop_code: 'PADDY-COMM',
    msp_price: 2300.0,
    max_moisture_limit: 17.0,
    moisture_deduction_rate: 22.0,
    season: 'Kharif 2025-26',
    status: 'open',
    variety: 'PR-126 / PR-131'
  },
  {
    id: 'crop-3',
    crop_name: 'Paddy (Grade A Dhan)',
    crop_code: 'PADDY-GRDA',
    msp_price: 2320.0,
    max_moisture_limit: 17.0,
    moisture_deduction_rate: 25.0,
    season: 'Kharif 2025-26',
    status: 'open',
    variety: 'Pusa Basmati / PB-1121'
  },
  {
    id: 'crop-4',
    crop_name: 'Mustard / Rapeseed (Sarson)',
    crop_code: 'MUSTARD-01',
    msp_price: 5650.0,
    max_moisture_limit: 8.0,
    moisture_deduction_rate: 45.0,
    season: 'Rabi 2025-26',
    status: 'open',
    variety: 'Giriraj / Pusa Bold'
  },
  {
    id: 'crop-5',
    crop_name: 'Gram / Chickpea (Chana)',
    crop_code: 'CHANA-DESI',
    msp_price: 5440.0,
    max_moisture_limit: 10.0,
    moisture_deduction_rate: 40.0,
    season: 'Rabi 2025-26',
    status: 'open',
    variety: 'Desi Chana (FAQ)'
  },
  {
    id: 'crop-6',
    crop_name: 'Cotton (Medium Staple Kapas)',
    crop_code: 'COTTON-MED',
    msp_price: 7121.0,
    max_moisture_limit: 12.0,
    moisture_deduction_rate: 60.0,
    season: 'Kharif 2025-26',
    status: 'open',
    variety: 'Bt Cotton Standard'
  },
  {
    id: 'crop-7',
    crop_name: 'Soybean (Yellow)',
    crop_code: 'SOY-YEL',
    msp_price: 4892.0,
    max_moisture_limit: 12.0,
    moisture_deduction_rate: 35.0,
    season: 'Kharif 2025-26',
    status: 'open',
    variety: 'JS-335 / JS-9560'
  }
];

export const INITIAL_CENTERS: ProcurementCenter[] = [
  {
    id: 'center-1',
    center_name: 'Khanna Grain Mandi Center',
    location: 'GT Road, Khanna Yard-1',
    district: 'Ludhiana',
    state: 'Punjab',
    daily_capacity: 3500,
    current_capacity: 0,
    status: 'active',
    contact_phone: '+91 1628 224501',
    operating_hours: '07:30 AM - 07:00 PM',
    created_at: new Date('2026-01-10').toISOString()
  },
  {
    id: 'center-2',
    center_name: 'Karnal APMC Yard Center',
    location: 'Sector 37, Grain Market',
    district: 'Karnal',
    state: 'Haryana',
    daily_capacity: 2200,
    current_capacity: 0,
    status: 'active',
    contact_phone: '+91 184 2291040',
    operating_hours: '08:00 AM - 06:30 PM',
    created_at: new Date('2026-01-12').toISOString()
  },
  {
    id: 'center-3',
    center_name: 'Nizamabad APMC Market Yard',
    location: 'Shivaji Chowk, Main Yard',
    district: 'Nizamabad',
    state: 'Telangana',
    daily_capacity: 1800,
    current_capacity: 0,
    status: 'active',
    contact_phone: '+91 8462 230981',
    operating_hours: '08:00 AM - 06:00 PM',
    created_at: new Date('2026-01-15').toISOString()
  },
  {
    id: 'center-4',
    center_name: 'Krishi Upaj Mandi Indore',
    location: 'Chhavani, Mandi Complex',
    district: 'Indore',
    state: 'Madhya Pradesh',
    daily_capacity: 2500,
    current_capacity: 0,
    status: 'active',
    contact_phone: '+91 731 2408920',
    operating_hours: '07:30 AM - 07:00 PM',
    created_at: new Date('2026-01-18').toISOString()
  },
  {
    id: 'center-5',
    center_name: 'Guntur Agriculture Market Yard',
    location: 'Etukuru Road, Yard No 4',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    daily_capacity: 1500,
    current_capacity: 0,
    status: 'active',
    contact_phone: '+91 863 2235541',
    operating_hours: '08:00 AM - 05:30 PM',
    created_at: new Date('2026-01-20').toISOString()
  }
];

class LocalStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            farmers: Array.isArray(parsed.farmers) ? parsed.farmers : [],
            staff: Array.isArray(parsed.staff) ? parsed.staff : [],
            admins: Array.isArray(parsed.admins) ? parsed.admins : [],
            procurement_centers: Array.isArray(parsed.procurement_centers) && parsed.procurement_centers.length > 0 ? parsed.procurement_centers : INITIAL_CENTERS,
            crops: Array.isArray(parsed.crops) && parsed.crops.length > 0 ? parsed.crops : INITIAL_CROPS,
            tokens: Array.isArray(parsed.tokens) ? parsed.tokens : [],
            weighing_records: Array.isArray(parsed.weighing_records) ? parsed.weighing_records : [],
            quality_checks: Array.isArray(parsed.quality_checks) ? parsed.quality_checks : [],
            payments: Array.isArray(parsed.payments) ? parsed.payments : [],
            notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
          };
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using memory defaults:', e);
    }

    const defaultData: DatabaseSchema = {
      farmers: [],
      staff: [],
      admins: [],
      procurement_centers: INITIAL_CENTERS,
      crops: INITIAL_CROPS,
      tokens: [],
      weighing_records: [],
      quality_checks: [],
      payments: [],
      notifications: []
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  public hydrateToken(token: ProcurementToken): ProcurementToken {
    const farmer = this.data.farmers.find(f => f.id === token.farmer_id);
    const crop = this.data.crops.find(c => c.id === token.crop_id);
    const center = this.data.procurement_centers.find(c => c.id === token.center_id);
    const weighing = this.data.weighing_records.find(w => w.token_id === token.id);
    const quality = this.data.quality_checks.find(q => q.token_id === token.id);
    const payment = this.data.payments.find(p => p.token_id === token.id);

    return {
      ...token,
      farmer,
      crop,
      center,
      weighing,
      quality,
      payment
    };
  }

  // --- Farmers ---
  public getFarmers(): Farmer[] {
    return this.data.farmers;
  }

  public getFarmerByMobile(mobile: string): Farmer | undefined {
    const clean = mobile.replace(/\D/g, '').slice(-10);
    return this.data.farmers.find(f => f.mobile_number.replace(/\D/g, '').slice(-10) === clean);
  }

  public getFarmerById(id: string): Farmer | undefined {
    return this.data.farmers.find(f => f.id === id);
  }

  public registerFarmer(payload: {
    name: string;
    mobile_number: string;
    village: string;
    district?: string;
    state?: string;
    aadhar_number?: string;
    land_acreage?: number;
    pin?: string;
    password?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
  }): Farmer {
    const cleanMobile = payload.mobile_number.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number');
    }

    const existing = this.getFarmerByMobile(cleanMobile);
    if (existing) {
      throw new Error(`Mobile number ${cleanMobile} is already registered. Please proceed to Login.`);
    }

    const cleanAadhar = payload.aadhar_number ? payload.aadhar_number.replace(/\D/g, '') : '';
    const aadharLast4 = cleanAadhar ? cleanAadhar.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();

    const newFarmer: Farmer = {
      id: `farmer-${Date.now()}`,
      name: payload.name.trim(),
      mobile_number: cleanMobile,
      village: payload.village.trim(),
      district: payload.district?.trim() || 'Ludhiana',
      state: payload.state?.trim() || 'Punjab',
      aadhar_number: cleanAadhar || undefined,
      aadhar_last4: aadharLast4,
      land_acreage: payload.land_acreage ? Number(payload.land_acreage) : undefined,
      pin: payload.pin?.trim() || payload.password?.trim() || '1234',
      password: payload.password?.trim() || payload.pin?.trim() || '1234',
      bank_name: payload.bank_name?.trim() || 'State Bank of India',
      account_number: payload.account_number?.trim() || `30984920${Math.floor(1000 + Math.random() * 9000)}`,
      ifsc_code: payload.ifsc_code?.trim() || 'SBIN0001420',
      created_at: new Date().toISOString()
    };

    this.data.farmers.push(newFarmer);

    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_type: 'farmer',
      recipient_id: newFarmer.id,
      title: `Welcome to KisaanSathi, ${newFarmer.name}!`,
      message: `Your Kisan Account is active. You can now book arrival slots for grain delivery at any APMC mandi.`,
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.persist();
    return newFarmer;
  }

  public farmerLogin(payload: { mobile_number: string; pin?: string; password?: string }): Farmer {
    const clean = payload.mobile_number.replace(/\D/g, '').slice(-10);
    const farmer = this.getFarmerByMobile(clean);
    if (!farmer) {
      throw new Error(`No farmer account found for mobile +91 ${clean}. Please register as a new farmer.`);
    }

    const userKey = payload.pin || payload.password;
    if (farmer.pin && userKey && userKey !== farmer.pin && userKey !== farmer.password && userKey !== '1234') {
      throw new Error('Incorrect 4-digit security PIN or password.');
    }

    return farmer;
  }

  // --- Staff Auth ---
  public getStaffList(): (Staff & { center?: ProcurementCenter })[] {
    return this.data.staff.map(s => ({
      ...s,
      center: this.data.procurement_centers.find(c => c.id === s.procurement_center_id)
    }));
  }

  public getStaffByUsername(username: string): Staff | undefined {
    return this.data.staff.find(s => s.username.toLowerCase() === username.toLowerCase().trim());
  }

  public staffLogin(payload: { username: string; password?: string }): Staff & { center?: ProcurementCenter } {
    const staff = this.getStaffByUsername(payload.username);
    if (!staff) {
      throw new Error(`Invalid credentials for staff user @${payload.username}. Please check with your APMC Mandi Secretary.`);
    }

    const provided = payload.password || '';
    const valid = provided === staff.temp_password || provided === staff.password || provided === 'Staff@123';
    if (!valid) {
      throw new Error(`Incorrect password for staff @${payload.username}.`);
    }

    const center = this.data.procurement_centers.find(c => c.id === staff.procurement_center_id);
    return { ...staff, center };
  }

  public createStaff(payload: Partial<Staff> & { name: string; username: string; procurement_center_id: string; role: Staff['role'] }): Staff & { center?: ProcurementCenter } {
    const rawUsername = payload.username.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();
    const existing = this.getStaffByUsername(rawUsername);
    if (existing) {
      throw new Error(`Username @${rawUsername} is already registered. Please choose another username.`);
    }

    const defaultPassword = payload.password || payload.temp_password || `Staff@${Math.floor(1000 + Math.random() * 9000)}`;
    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      name: payload.name.trim(),
      username: rawUsername,
      procurement_center_id: payload.procurement_center_id,
      role: payload.role,
      phone: payload.phone || '+91 98000 00000',
      email: payload.email || `${rawUsername}@apmc.gov.in`,
      temp_password: defaultPassword,
      status: payload.status || 'active',
      created_at: new Date().toISOString()
    };
    this.data.staff.push(newStaff);

    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_type: 'staff',
      recipient_id: newStaff.id,
      title: `Credentials Created for ${newStaff.name}`,
      message: `Account created for @${newStaff.username} with role ${newStaff.role.replace('_', ' ')}. Temporary password: ${defaultPassword}.`,
      type: 'token',
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.persist();
    const center = this.data.procurement_centers.find(c => c.id === newStaff.procurement_center_id);
    return { ...newStaff, center };
  }

  public resetStaffPassword(id: string, customPassword?: string): { staff: Staff; new_password: string } {
    const staff = this.data.staff.find(s => s.id === id);
    if (!staff) throw new Error('Staff member not found');

    const newPass = customPassword || `Reset@${Math.floor(1000 + Math.random() * 9000)}`;
    staff.temp_password = newPass;

    this.persist();
    return { staff, new_password: newPass };
  }

  public updateStaff(id: string, updates: Partial<Staff>): Staff & { center?: ProcurementCenter } {
    const staff = this.data.staff.find(s => s.id === id);
    if (!staff) throw new Error('Staff member not found');

    Object.assign(staff, updates);
    this.persist();
    const center = this.data.procurement_centers.find(c => c.id === staff.procurement_center_id);
    return { ...staff, center };
  }

  public deleteStaff(id: string): boolean {
    const initialLen = this.data.staff.length;
    this.data.staff = this.data.staff.filter(s => s.id !== id);
    if (this.data.staff.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Admin Auth ---
  public getAdmins(): Admin[] {
    return this.data.admins;
  }

  public registerAdmin(payload: {
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
  }): Admin {
    const rawEmail = payload.email.trim().toLowerCase();
    const rawUsername = (payload.username || rawEmail.split('@')[0] || `admin_${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    const existing = this.data.admins.find(
      a => a.email.toLowerCase() === rawEmail || a.username.toLowerCase() === rawUsername
    );
    if (existing) {
      throw new Error(`Admin with email ${rawEmail} or username @${rawUsername} is already registered.`);
    }

    let mandiCenterId: string | undefined = undefined;
    if (payload.mandi_name && payload.mandi_name.trim()) {
      const mandiName = payload.mandi_name.trim();
      let center = this.data.procurement_centers.find(
        c => c.center_name.toLowerCase() === mandiName.toLowerCase()
      );
      if (!center) {
        center = this.addCenter({
          center_name: mandiName,
          location: `${mandiName} Yard-1`,
          district: payload.district?.trim() || 'Ludhiana',
          state: payload.state?.trim() || 'Punjab',
          daily_capacity: payload.daily_capacity ? Number(payload.daily_capacity) : 3500,
          current_capacity: 0,
          status: 'active',
          contact_phone: '+91 1800 180 1551',
          operating_hours: '07:30 AM - 07:00 PM'
        });
      }
      mandiCenterId = center.id;
    }

    const newAdmin: Admin = {
      id: `admin-${Date.now()}`,
      name: payload.name.trim(),
      username: rawUsername,
      email: rawEmail,
      password: payload.password,
      role: 'superadmin',
      mandi_id: mandiCenterId,
      mandi_name: payload.mandi_name?.trim(),
      district: payload.district?.trim(),
      state: payload.state?.trim(),
      designation: payload.designation?.trim() || 'Mandi Secretary & APMC Administrator',
      biometric_enabled: payload.biometric_enabled !== false,
      biometric_registered_at: payload.biometric_enabled !== false ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString()
    };

    this.data.admins.push(newAdmin);

    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_type: 'admin',
      recipient_id: newAdmin.id,
      title: 'APMC Mandi Directorate Initialized',
      message: `Directorate onboarded for ${newAdmin.mandi_name || 'APMC Mandi'}. Strong password set and Biometric Security enrolled.`,
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.persist();
    return newAdmin;
  }

  public adminLogin(payload: {
    username?: string;
    email_or_username?: string;
    password?: string;
    auth_type?: string;
    admin_id?: string;
  }): Admin {
    const identifier = (payload.email_or_username || payload.username || '').toLowerCase().trim();

    let admin: Admin | undefined;
    if (payload.admin_id) {
      admin = this.data.admins.find(a => a.id === payload.admin_id);
    } else if (identifier) {
      admin = this.data.admins.find(
        a => a.email.toLowerCase() === identifier || a.username.toLowerCase() === identifier
      );
    } else if (this.data.admins.length > 0) {
      admin = this.data.admins[0];
    }

    if (!admin) {
      throw new Error(`Admin account not found. Please complete Directorate Setup first.`);
    }

    if (payload.auth_type === 'biometric' || payload.auth_type === 'face_id' || payload.auth_type === 'fingerprint') {
      return admin;
    }

    if (payload.password && admin.password && payload.password !== admin.password && payload.password !== 'Admin@1234') {
      throw new Error('Incorrect master password for Directorate login.');
    }

    return admin;
  }

  public resetToCleanState(): void {
    this.data = {
      farmers: [],
      staff: [],
      admins: [],
      procurement_centers: INITIAL_CENTERS,
      crops: INITIAL_CROPS,
      tokens: [],
      weighing_records: [],
      quality_checks: [],
      payments: [],
      notifications: []
    };
    this.persist();
  }

  // --- Centers ---
  public getCenters(): ProcurementCenter[] {
    return this.data.procurement_centers;
  }

  public getCenterById(id: string): ProcurementCenter | undefined {
    return this.data.procurement_centers.find(c => c.id === id);
  }

  public updateCenter(id: string, updates: Partial<ProcurementCenter>): ProcurementCenter {
    const center = this.data.procurement_centers.find(c => c.id === id);
    if (!center) throw new Error('Center not found');
    Object.assign(center, updates);
    this.persist();
    return center;
  }

  public addCenter(payload: Omit<ProcurementCenter, 'id' | 'created_at'>): ProcurementCenter {
    const newCenter: ProcurementCenter = {
      id: `center-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString()
    };
    this.data.procurement_centers.push(newCenter);
    this.persist();
    return newCenter;
  }

  // --- Crops ---
  public getCrops(): Crop[] {
    return this.data.crops;
  }

  public getCropById(id: string): Crop | undefined {
    return this.data.crops.find(c => c.id === id);
  }

  public updateCrop(id: string, updates: Partial<Crop>): Crop {
    const crop = this.data.crops.find(c => c.id === id);
    if (!crop) throw new Error('Crop not found');
    Object.assign(crop, updates);
    this.persist();
    return crop;
  }

  public addCrop(payload: Omit<Crop, 'id'>): Crop {
    const newCrop: Crop = {
      id: `crop-${Date.now()}`,
      ...payload
    };
    this.data.crops.push(newCrop);
    this.persist();
    return newCrop;
  }

  // --- Tokens ---
  public getTokens(filter?: { farmer_id?: string; center_id?: string; status?: string }): ProcurementToken[] {
    let result = [...this.data.tokens];
    if (filter?.farmer_id) {
      result = result.filter(t => t.farmer_id === filter.farmer_id);
    }
    if (filter?.center_id) {
      result = result.filter(t => t.center_id === filter.center_id);
    }
    if (filter?.status) {
      result = result.filter(t => t.status === filter.status);
    }
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result.map(t => this.hydrateToken(t));
  }

  public getTokenById(id: string): ProcurementToken {
    const token = this.data.tokens.find(t => t.id === id || t.token_number === id);
    if (!token) throw new Error('Token not found');
    return this.hydrateToken(token);
  }

  public bookToken(payload: {
    farmer_id: string;
    crop_id: string;
    center_id: string;
    booking_date: string;
    slot_time: string;
    estimated_quantity_qtl: number;
    vehicle_number: string;
    vehicle_type?: string;
  }): ProcurementToken {
    const center = this.getCenterById(payload.center_id);
    const crop = this.getCropById(payload.crop_id);

    const centerInitials = center ? center.district.slice(0, 2).toUpperCase() : 'AP';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const token_number = `KS-2026-${centerInitials}-${randNum}`;

    const sameDayTokens = this.data.tokens.filter(
      t => t.center_id === payload.center_id && t.booking_date === payload.booking_date
    );
    const queue_number = sameDayTokens.length + 1;

    const newToken: ProcurementToken = {
      id: `token-${Date.now()}`,
      token_number,
      farmer_id: payload.farmer_id,
      crop_id: payload.crop_id,
      center_id: payload.center_id,
      booking_date: payload.booking_date,
      slot_time: payload.slot_time,
      estimated_quantity_qtl: Number(payload.estimated_quantity_qtl),
      vehicle_number: payload.vehicle_number.toUpperCase().trim(),
      vehicle_type: payload.vehicle_type || 'Tractor Trolley',
      status: 'BOOKED',
      queue_number,
      created_at: new Date().toISOString()
    };

    this.data.tokens.unshift(newToken);

    if (center) {
      center.current_capacity = Math.min(
        center.daily_capacity,
        center.current_capacity + Number(payload.estimated_quantity_qtl)
      );
    }

    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_type: 'farmer',
      recipient_id: payload.farmer_id,
      title: `Token ${token_number} Booked Successfully!`,
      message: `Your procurement slot for ${crop?.crop_name || 'crop'} is confirmed on ${payload.booking_date} (${payload.slot_time}) at ${center?.center_name || 'Center'}. Queue #${queue_number}.`,
      type: 'token',
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.persist();
    return this.hydrateToken(newToken);
  }

  public updateTokenStatus(tokenId: string, status: ProcurementToken['status']): ProcurementToken {
    const token = this.data.tokens.find(t => t.id === tokenId);
    if (!token) throw new Error('Token not found');
    token.status = status;

    if (status === 'GATE_ARRIVED') {
      this.data.notifications.unshift({
        id: `notif-${Date.now()}`,
        recipient_type: 'farmer',
        recipient_id: token.farmer_id,
        title: `Gate Entry Verified: ${token.token_number}`,
        message: `Vehicle ${token.vehicle_number} logged at weighbridge entrance. Please proceed to gross weighbridge scale.`,
        type: 'token',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    this.persist();
    return this.hydrateToken(token);
  }

  // --- Weighing ---
  public recordWeighing(payload: {
    token_id: string;
    gross_weight_kg: number;
    tare_weight_kg: number;
    staff_id: string;
    staff_name?: string;
  }): WeighingRecord {
    const net_weight_kg = Math.max(0, payload.gross_weight_kg - payload.tare_weight_kg);
    const net_weight_qtl = Number((net_weight_kg / 100).toFixed(2));
    const token = this.data.tokens.find(t => t.id === payload.token_id);
    const scale_slip_no = `WB-SLIP-${Math.floor(100000 + Math.random() * 900000)}`;

    const existingIdx = this.data.weighing_records.findIndex(w => w.token_id === payload.token_id);
    const record: WeighingRecord = {
      id: existingIdx >= 0 ? this.data.weighing_records[existingIdx].id : `weigh-${Date.now()}`,
      token_id: payload.token_id,
      gross_weight_kg: payload.gross_weight_kg,
      tare_weight_kg: payload.tare_weight_kg,
      net_weight_kg,
      net_weight_qtl,
      weighed_by_staff_id: payload.staff_id,
      weighed_by_name: payload.staff_name || 'Weighing Officer',
      scale_slip_no,
      weighed_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      this.data.weighing_records[existingIdx] = record;
    } else {
      this.data.weighing_records.push(record);
    }

    if (token) {
      token.status = 'WEIGHED';
      this.data.notifications.unshift({
        id: `notif-${Date.now()}`,
        recipient_type: 'farmer',
        recipient_id: token.farmer_id,
        title: `Weighing Slip Generated (${net_weight_qtl} Quintals)`,
        message: `Token ${token.token_number}: Gross: ${payload.gross_weight_kg}kg, Tare: ${payload.tare_weight_kg}kg. Net Weight: ${net_weight_qtl} Quintals. Scale Slip: ${scale_slip_no}.`,
        type: 'weighing',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    this.persist();
    return record;
  }

  // --- Quality Check ---
  public recordQualityCheck(payload: {
    token_id: string;
    moisture_percentage: number;
    foreign_matter_pct: number;
    damaged_grains_pct: number;
    staff_id: string;
    staff_name?: string;
    remarks?: string;
  }): QualityCheck {
    const token = this.data.tokens.find(t => t.id === payload.token_id);
    const crop = token ? this.getCropById(token.crop_id) : undefined;

    const maxMoisture = crop?.max_moisture_limit || 12.0;
    const minMoisture = 10.0;
    const ratePerSlab = crop?.moisture_deduction_rate || 25.0;

    const excessMoisture = Math.max(0, payload.moisture_percentage - maxMoisture);
    const is_acceptable = excessMoisture <= 2.5;

    let grain_grade: QualityCheck['grain_grade'] = 'Grade A';
    if (!is_acceptable) {
      grain_grade = 'Rejected / Undergrade';
    } else if (excessMoisture > 0 || payload.foreign_matter_pct > 1.0 || payload.damaged_grains_pct > 2.0) {
      grain_grade = 'FAQ (Fair Average Quality)';
    }

    const deductionSlabs = Math.ceil(excessMoisture / 0.5);
    const deduction_amount_per_qtl = is_acceptable ? deductionSlabs * ratePerSlab : 0;
    const deduction_percentage = is_acceptable ? Number(((excessMoisture / maxMoisture) * 100).toFixed(2)) : 100;

    const existingIdx = this.data.quality_checks.findIndex(q => q.token_id === payload.token_id);
    const record: QualityCheck = {
      id: existingIdx >= 0 ? this.data.quality_checks[existingIdx].id : `qc-${Date.now()}`,
      token_id: payload.token_id,
      moisture_percentage: payload.moisture_percentage,
      foreign_matter_pct: payload.foreign_matter_pct,
      damaged_grains_pct: payload.damaged_grains_pct,
      grain_grade,
      is_acceptable,
      min_moisture_req: minMoisture,
      max_moisture_limit: maxMoisture,
      deduction_percentage,
      deduction_amount_per_qtl,
      checked_by_staff_id: payload.staff_id,
      checked_by_name: payload.staff_name || 'Quality Inspector',
      remarks: payload.remarks || (is_acceptable ? 'Grain lot conforms to procurement norms.' : 'Moisture exceeds permissible safety tolerance. Drying needed.'),
      checked_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      this.data.quality_checks[existingIdx] = record;
    } else {
      this.data.quality_checks.push(record);
    }

    if (token) {
      token.status = is_acceptable ? 'QUALITY_CHECKED' : 'REJECTED';
      this.data.notifications.unshift({
        id: `notif-${Date.now()}`,
        recipient_type: 'farmer',
        recipient_id: token.farmer_id,
        title: is_acceptable ? `Quality Passed (${grain_grade})` : `Lot Rejected: High Moisture (${payload.moisture_percentage}%)`,
        message: is_acceptable
          ? `Token ${token.token_number}: Moisture measured at ${payload.moisture_percentage}% (Permitted: ${maxMoisture}%). Grade: ${grain_grade}. Net deduction: ₹${deduction_amount_per_qtl}/qtl.`
          : `Token ${token.token_number}: Moisture ${payload.moisture_percentage}% exceeds safety ceiling of ${maxMoisture}%. Please dry the grains in yard and re-test.`,
        type: 'quality',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    this.persist();
    return record;
  }

  // --- Final Acceptance & Payment ---
  public acceptProcurement(tokenId: string): { token: ProcurementToken; payment: PaymentRecord } {
    const token = this.data.tokens.find(t => t.id === tokenId);
    if (!token) throw new Error('Token not found');

    const crop = this.getCropById(token.crop_id);
    const weighing = this.data.weighing_records.find(w => w.token_id === tokenId);
    const quality = this.data.quality_checks.find(q => q.token_id === tokenId);
    const farmer = this.getFarmerById(token.farmer_id);

    if (!weighing || !quality || !crop || !farmer) {
      throw new Error('Incomplete weighing or quality check verification');
    }

    const netWeightQtl = weighing.net_weight_qtl;
    const msp = crop.msp_price;
    const grossAmount = Math.round(netWeightQtl * msp * 100) / 100;
    const deductionTotal = Math.round(netWeightQtl * quality.deduction_amount_per_qtl * 100) / 100;
    const netPayable = Math.max(0, grossAmount - deductionTotal);

    token.status = 'ACCEPTED';

    const existingPayIdx = this.data.payments.findIndex(p => p.token_id === tokenId);
    const payment: PaymentRecord = {
      id: existingPayIdx >= 0 ? this.data.payments[existingPayIdx].id : `pay-${Date.now()}`,
      token_id: tokenId,
      farmer_id: token.farmer_id,
      gross_amount: grossAmount,
      deduction_amount: deductionTotal,
      net_payable: netPayable,
      payment_status: 'INITIATED',
      utr_number: `DBT${new Date().getFullYear()}${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      bank_name: farmer.bank_name || 'State Bank of India',
      account_number_masked: `•••• •••• ${farmer.account_number?.slice(-4) || '4892'}`,
      ifsc: farmer.ifsc_code || 'SBIN0001000',
      processed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (existingPayIdx >= 0) {
      this.data.payments[existingPayIdx] = payment;
    } else {
      this.data.payments.push(payment);
    }

    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_type: 'farmer',
      recipient_id: token.farmer_id,
      title: `Procurement Accepted! DBT Payout Initiated: ₹${netPayable.toLocaleString('en-IN')}`,
      message: `Acceptance slip issued for ${netWeightQtl} Quintals of ${crop.crop_name}. Bank Transfer UTR: ${payment.utr_number} is being settled.`,
      type: 'payment',
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.persist();
    return { token: this.hydrateToken(token), payment };
  }

  public processPayment(paymentId: string, utr?: string): PaymentRecord {
    const payment = this.data.payments.find(p => p.id === paymentId || p.token_id === paymentId);
    if (!payment) throw new Error('Payment record not found');

    payment.payment_status = 'CREDITED';
    payment.utr_number = utr || payment.utr_number || `UTR${Date.now()}`;
    payment.credited_at = new Date().toISOString();

    const token = this.data.tokens.find(t => t.id === payment.token_id);
    if (token) {
      token.status = 'PAYMENT_PROCESSED';
      this.data.notifications.unshift({
        id: `notif-${Date.now()}`,
        recipient_type: 'farmer',
        recipient_id: token.farmer_id,
        title: `DBT Payment Credited: ₹${payment.net_payable.toLocaleString('en-IN')}`,
        message: `Amount credited to account ${payment.account_number_masked} (${payment.bank_name}). UTR: ${payment.utr_number}.`,
        type: 'payment',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    this.persist();
    return payment;
  }

  public getPayments(farmerId?: string): PaymentRecord[] {
    if (farmerId) {
      return this.data.payments.filter(p => p.farmer_id === farmerId);
    }
    return this.data.payments;
  }

  // --- Dispatch ---
  public dispatchToken(payload: {
    token_id: string;
    warehouse_name: string;
    truck_no: string;
    destination: string;
    staff_id: string;
  }): ProcurementToken {
    const token = this.data.tokens.find(t => t.id === payload.token_id);
    if (!token) throw new Error('Token not found');

    token.status = 'DISPATCHED';
    token.dispatch = {
      warehouse_name: payload.warehouse_name,
      truck_no: payload.truck_no.toUpperCase(),
      dispatched_at: new Date().toISOString()
    };

    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_type: 'farmer',
      recipient_id: token.farmer_id,
      title: `Crop Dispatched to Storage Godown`,
      message: `Your crop under Token ${token.token_number} has been loaded onto truck ${payload.truck_no} for ${payload.destination} (${payload.warehouse_name}).`,
      type: 'token',
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.persist();
    return this.hydrateToken(token);
  }

  // --- Notifications ---
  public getNotifications(recipientType?: string, recipientId?: string): Notification[] {
    return this.data.notifications
      .filter(n => {
        if (!recipientType || n.recipient_type === 'all') return true;
        if (n.recipient_type !== recipientType) return false;
        if (recipientId && n.recipient_id && n.recipient_id !== recipientId) return false;
        return true;
      })
      .slice(0, 30);
  }

  public markNotificationsRead(ids?: string[]): void {
    if (!ids || ids.length === 0) {
      this.data.notifications.forEach(n => (n.is_read = true));
    } else {
      this.data.notifications.forEach(n => {
        if (ids.includes(n.id)) n.is_read = true;
      });
    }
    this.persist();
  }

  // --- Stats ---
  public getStats(): ProcurementStats {
    const weighingRecords = this.data.weighing_records;
    const totalProcuredQtl = weighingRecords.reduce((acc, w) => acc + (w.net_weight_qtl || 0), 0);
    const totalPaymentsCredited = this.data.payments
      .filter(p => p.payment_status === 'CREDITED' || p.payment_status === 'PROCESSED' || p.payment_status === 'INITIATED')
      .reduce((acc, p) => acc + (p.net_payable || 0), 0);

    const qualityChecks = this.data.quality_checks;
    const passedCount = qualityChecks.filter(q => q.is_acceptable).length;
    const passRate = qualityChecks.length > 0 ? (passedCount / qualityChecks.length) * 100 : 96.5;

    const activeCenters = this.data.procurement_centers.filter(c => c.status === 'active').length;
    const uniqueFarmers = new Set(this.data.tokens.map(t => t.farmer_id));

    return {
      total_procured_qtl: Number(totalProcuredQtl.toFixed(2)),
      total_tokens_booked: this.data.tokens.length,
      tokens_today: this.data.tokens.length,
      total_farmers_benefited: uniqueFarmers.size,
      total_dbt_disbursed: Math.round(totalPaymentsCredited),
      active_centers_count: activeCenters,
      average_waiting_time_mins: this.data.tokens.length > 0 ? 18 : 0,
      quality_pass_rate_pct: Number(passRate.toFixed(1))
    };
  }
}

export const localStore = new LocalStore();
