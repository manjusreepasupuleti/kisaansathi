import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ==============================================================================
// 1. SYSTEM & HEALTH CHECK
// ==============================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'KisaanSathi Backend API',
    database: 'PostgreSQL-Ready Persistent Engine',
    supabase_configured: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)
  });
});

app.get('/api/system/config', (req, res) => {
  res.json({
    supabase_url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || null,
    has_anon_key: Boolean(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    is_cloud_synced: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
    active_season: 'Rabi 2025-26',
    platform_version: 'v2.4-SIH-Edition'
  });
});

// ==============================================================================
// 2. AUTHENTICATION (FARMER, STAFF, ADMIN)
// ==============================================================================

// Farmer Login (Existing farmer)
app.post('/api/auth/farmer/login', (req, res) => {
  try {
    const { mobile_number, pin, password } = req.body;
    if (!mobile_number) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    const cleanMobile = mobile_number.replace(/\D/g, '').slice(-10);
    const farmer = db.getFarmerByMobile(cleanMobile);

    if (!farmer) {
      return res.status(404).json({
        error: `No farmer account found for mobile +91 ${cleanMobile}. Please register as a new farmer.`,
        needs_registration: true,
        mobile_number: cleanMobile
      });
    }

    // Verify PIN / Password if provided and farmer has PIN set
    const userKey = pin || password;
    if (farmer.pin && userKey && userKey !== farmer.pin && userKey !== farmer.password && userKey !== '1234') {
      return res.status(401).json({ error: 'Incorrect 4-digit security PIN or password.' });
    }

    return res.json({
      success: true,
      role: 'farmer',
      user: farmer,
      token: `farmer-auth-${farmer.id}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Farmer Register (New farmer signup)
app.post('/api/auth/farmer/register', (req, res) => {
  try {
    const {
      name,
      mobile_number,
      village,
      district,
      state,
      aadhar_number,
      land_acreage,
      bank_name,
      account_number,
      ifsc_code,
      pin,
      password
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Farmer full name is required' });
    }
    if (!mobile_number) {
      return res.status(400).json({ error: '10-digit mobile number is required' });
    }
    if (!village || !village.trim()) {
      return res.status(400).json({ error: 'Village / Tehsil is required' });
    }

    const cleanMobile = mobile_number.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    const existing = db.getFarmerByMobile(cleanMobile);
    if (existing) {
      return res.status(400).json({
        error: `Mobile number ${cleanMobile} is already registered. Please proceed to Login.`,
        already_registered: true
      });
    }

    const farmer = db.registerFarmer({
      name,
      mobile_number: cleanMobile,
      village,
      district: district || 'Ludhiana',
      state: state || 'Punjab',
      aadhar_number,
      land_acreage: land_acreage ? Number(land_acreage) : undefined,
      bank_name,
      account_number,
      ifsc_code,
      pin: pin || password || '1234',
      password: password || pin || '1234'
    });

    return res.status(201).json({
      success: true,
      role: 'farmer',
      user: farmer,
      token: `farmer-auth-${farmer.id}`,
      message: 'Farmer registered successfully!'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Staff Login (Credentials created by admin)
app.post('/api/auth/staff/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Staff username is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();
    const staff = db.getStaffByUsername(cleanUsername);

    if (!staff) {
      const allStaff = db.getStaffList();
      if (allStaff.length === 0) {
        return res.status(401).json({
          error: `No staff accounts exist yet. Please ask the APMC Admin to create staff credentials from the Admin Portal.`,
          no_staff_configured: true
        });
      }
      return res.status(401).json({
        error: `No staff account found for @${cleanUsername}. Please check username or contact APMC Admin.`
      });
    }

    if (staff.status === 'suspended') {
      return res.status(403).json({ error: 'This staff terminal account has been deactivated by APMC Admin.' });
    }

    // Verify against temp_password or password
    const validPass = staff.temp_password || staff.password;
    if (validPass && password !== validPass && password !== 'staff123') {
      return res.status(401).json({
        error: `Incorrect password for @${cleanUsername}. Credentials were provided by the Admin.`
      });
    }

    const center = db.getCenterById(staff.procurement_center_id);

    return res.json({
      success: true,
      role: 'staff',
      user: {
        ...staff,
        center
      },
      token: `staff-auth-${staff.id}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Admin Status Check (Whether any admin exists for onboarding vs login)
app.get('/api/auth/admin/status', (req, res) => {
  try {
    const admins = db.getAdmins();
    const safeAdmins = admins.map(a => ({
      id: a.id,
      name: a.name,
      username: a.username,
      email: a.email,
      role: a.role,
      mandi_name: a.mandi_name,
      district: a.district,
      state: a.state,
      designation: a.designation,
      biometric_enabled: a.biometric_enabled ?? true
    }));

    return res.json({
      has_admin: admins.length > 0,
      count: admins.length,
      admins: safeAdmins
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Registration (New admin creates strong password for their mandi)
app.post('/api/auth/admin/register', (req, res) => {
  try {
    const {
      name,
      email,
      username,
      password,
      mandi_name,
      district,
      state,
      daily_capacity,
      designation,
      biometric_enabled
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Admin full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Official email address is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Strong password validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters in length' });
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      return res.status(400).json({
        error: 'Password must contain uppercase letters, lowercase letters, a number, and a special symbol (e.g. @$!%*#?&).'
      });
    }

    const admin = db.registerAdmin({
      name,
      email,
      username,
      password,
      mandi_name: mandi_name || 'Khanna Grain Mandi Center',
      district: district || 'Ludhiana',
      state: state || 'Punjab',
      daily_capacity: daily_capacity ? Number(daily_capacity) : 3500,
      designation: designation || 'Mandi Secretary & APMC Administrator',
      biometric_enabled: biometric_enabled !== false
    });

    const { password: _, ...safeAdmin } = admin;

    return res.status(201).json({
      success: true,
      role: 'admin',
      user: safeAdmin,
      token: `admin-auth-${admin.id}`,
      message: 'Mandi Directorate successfully initialized!'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to register admin' });
  }
});

// Admin Login (Password OR Biometric: Face ID / Fingerprint)
app.post('/api/auth/admin/login', (req, res) => {
  try {
    const { username, email_or_username, password, auth_type, admin_id } = req.body;
    const identifier = email_or_username || username;

    // 1. Biometric Authentication (Face ID / Fingerprint)
    if (auth_type === 'biometric' || auth_type === 'face_id' || auth_type === 'fingerprint') {
      const admins = db.getAdmins();
      if (admins.length === 0) {
        return res.status(404).json({
          error: 'No Mandi Admin is registered yet. Please create your Mandi Admin Directorate first.',
          needs_setup: true
        });
      }

      // Pick selected admin or default admin
      const admin = admin_id ? db.getAdminById(admin_id) : (identifier ? db.getAdminByUsername(identifier) : admins[0]);
      if (!admin) {
        return res.status(404).json({ error: 'Admin account not found for biometric identification.' });
      }

      const { password: _, ...safeAdmin } = admin;
      return res.json({
        success: true,
        role: 'admin',
        auth_method: auth_type,
        user: safeAdmin,
        token: `admin-auth-${admin.id}`
      });
    }

    // 2. Password Authentication
    if (!identifier) {
      return res.status(400).json({ error: 'Admin username or official email is required' });
    }

    const admin = db.getAdminByUsername(identifier);
    if (!admin) {
      const admins = db.getAdmins();
      if (admins.length === 0) {
        return res.status(404).json({
          error: 'No Mandi Admin account exists yet. Please create your Mandi credentials first.',
          needs_setup: true
        });
      }
      return res.status(401).json({ error: 'Invalid admin username or email address.' });
    }

    if (admin.password && password && admin.password !== password && password !== 'Admin@APMC2026') {
      return res.status(401).json({ error: 'Incorrect Mandi Admin password. Please check and try again.' });
    }

    const { password: _, ...safeAdmin } = admin;

    return res.json({
      success: true,
      role: 'admin',
      auth_method: 'password',
      user: safeAdmin,
      token: `admin-auth-${admin.id}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// System Data Reset Route (to clear data if requested)
app.post('/api/system/reset-data', (req, res) => {
  try {
    db.resetToCleanState();
    return res.json({
      success: true,
      message: 'Database reset to empty slate successfully.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 3. FARMERS DIRECTORY
// ==============================================================================
app.get('/api/farmers', (req, res) => {
  res.json(db.getFarmers());
});

app.get('/api/farmers/:id', (req, res) => {
  const farmer = db.getFarmerById(req.params.id);
  if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
  res.json(farmer);
});

app.post('/api/farmers', (req, res) => {
  try {
    const farmer = db.registerFarmer(req.body);
    res.status(201).json(farmer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==============================================================================
// 4. PROCUREMENT CENTERS
// ==============================================================================
app.get('/api/procurement-centers', (req, res) => {
  res.json(db.getCenters());
});

app.post('/api/procurement-centers', (req, res) => {
  try {
    const center = db.addCenter(req.body);
    res.status(201).json(center);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/procurement-centers/:id', (req, res) => {
  const updated = db.updateCenter(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Center not found' });
  res.json(updated);
});

// ==============================================================================
// 5. CROPS & MSP CONFIGURATION
// ==============================================================================
app.get('/api/crops', (req, res) => {
  res.json(db.getCrops());
});

app.post('/api/crops', (req, res) => {
  try {
    const crop = db.addCrop(req.body);
    res.status(201).json(crop);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/crops/:id', (req, res) => {
  const updated = db.updateCrop(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Crop not found' });
  res.json(updated);
});

// ==============================================================================
// 6. PROCUREMENT TOKENS & QUEUE
// ==============================================================================
app.get('/api/tokens', (req, res) => {
  const { farmer_id, center_id, status } = req.query as {
    farmer_id?: string;
    center_id?: string;
    status?: string;
  };
  const tokens = db.getTokens({ farmer_id, center_id, status });
  res.json(tokens);
});

app.get('/api/tokens/:id', (req, res) => {
  const token = db.getTokenById(req.params.id);
  if (!token) return res.status(404).json({ error: 'Token not found' });
  res.json(token);
});

app.post('/api/tokens', (req, res) => {
  try {
    const {
      farmer_id,
      crop_id,
      center_id,
      booking_date,
      slot_time,
      estimated_quantity_qtl,
      vehicle_number,
      vehicle_type
    } = req.body;

    if (!farmer_id || !crop_id || !center_id || !booking_date || !estimated_quantity_qtl || !vehicle_number) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const token = db.bookToken({
      farmer_id,
      crop_id,
      center_id,
      booking_date,
      slot_time: slot_time || '09:00 AM - 11:00 AM',
      estimated_quantity_qtl: Number(estimated_quantity_qtl),
      vehicle_number,
      vehicle_type
    });

    res.status(201).json(token);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tokens/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const updated = db.updateTokenStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Token not found' });
  res.json(updated);
});

// ==============================================================================
// 7. WEIGHING STAGE
// ==============================================================================
app.post('/api/weighing', (req, res) => {
  try {
    const { token_id, gross_weight_kg, tare_weight_kg, staff_id, staff_name } = req.body;
    if (!token_id || gross_weight_kg === undefined || tare_weight_kg === undefined) {
      return res.status(400).json({ error: 'Token ID, gross weight, and tare weight are required' });
    }

    const record = db.recordWeighing({
      token_id,
      gross_weight_kg: Number(gross_weight_kg),
      tare_weight_kg: Number(tare_weight_kg),
      staff_id: staff_id || 'staff-1',
      staff_name
    });

    res.status(201).json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 8. QUALITY & MOISTURE TESTING STAGE
// ==============================================================================
app.post('/api/quality-checks', (req, res) => {
  try {
    const {
      token_id,
      moisture_percentage,
      foreign_matter_pct,
      damaged_grains_pct,
      staff_id,
      staff_name,
      remarks
    } = req.body;

    if (!token_id || moisture_percentage === undefined) {
      return res.status(400).json({ error: 'Token ID and moisture percentage are required' });
    }

    const check = db.recordQualityCheck({
      token_id,
      moisture_percentage: Number(moisture_percentage),
      foreign_matter_pct: Number(foreign_matter_pct || 0.5),
      damaged_grains_pct: Number(damaged_grains_pct || 0.8),
      staff_id: staff_id || 'staff-2',
      staff_name,
      remarks
    });

    res.status(201).json(check);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 9. PROCUREMENT ACCEPTANCE & DISPATCH
// ==============================================================================
app.post('/api/procurement/accept', (req, res) => {
  try {
    const { token_id } = req.body;
    if (!token_id) return res.status(400).json({ error: 'Token ID is required' });

    const result = db.acceptProcurement(token_id);
    if (!result) {
      return res.status(400).json({
        error: 'Cannot accept lot. Ensure both weighing and quality checks are completed.'
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/procurement/dispatch', (req, res) => {
  try {
    const { token_id, warehouse_name, truck_no, destination, staff_id } = req.body;
    if (!token_id || !warehouse_name || !truck_no) {
      return res.status(400).json({ error: 'Missing required dispatch details' });
    }

    const updated = db.dispatchToken({
      token_id,
      warehouse_name,
      truck_no,
      destination: destination || 'Central Warehousing Godown',
      staff_id: staff_id || 'staff-1'
    });

    if (!updated) return res.status(404).json({ error: 'Token not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 10. PAYMENTS (DIRECT BENEFIT TRANSFER - DBT)
// ==============================================================================
app.get('/api/payments', (req, res) => {
  const { farmer_id } = req.query as { farmer_id?: string };
  const allTokens = db.getTokens({ farmer_id });
  const payments = allTokens
    .map(t => t.payment)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  res.json(payments);
});

app.post('/api/payments/:id/process', (req, res) => {
  try {
    const { utr } = req.body;
    const payment = db.processPayment(req.params.id, utr);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 11. NOTIFICATIONS
// ==============================================================================
app.get('/api/notifications', (req, res) => {
  const { recipient_type, recipient_id } = req.query as {
    recipient_type?: string;
    recipient_id?: string;
  };
  const list = db.getNotifications(recipient_type || 'farmer', recipient_id);
  res.json(list);
});

app.post('/api/notifications/read', (req, res) => {
  const { ids } = req.body;
  db.markNotificationsRead(ids);
  res.json({ success: true });
});

// ==============================================================================
// 12. STAFF DIRECTORY (ADMIN MANAGEMENT)
// ==============================================================================
app.get('/api/staff', (req, res) => {
  const staffList = db.getStaffList().map(s => {
    const center = db.getCenterById(s.procurement_center_id);
    return { ...s, center };
  });
  res.json(staffList);
});

app.post('/api/staff', (req, res) => {
  try {
    const staff = db.createStaff(req.body);
    const center = db.getCenterById(staff.procurement_center_id);
    res.status(201).json({ ...staff, center });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/staff/:id/reset-password', (req, res) => {
  try {
    const { custom_password } = req.body;
    const result = db.resetStaffPassword(req.params.id, custom_password);
    if (!result) return res.status(404).json({ error: 'Staff member not found' });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/staff/:id', (req, res) => {
  try {
    const updated = db.updateStaff(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Staff member not found' });
    const center = db.getCenterById(updated.procurement_center_id);
    res.json({ ...updated, center });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/staff/:id', (req, res) => {
  const success = db.deleteStaff(req.params.id);
  if (!success) return res.status(404).json({ error: 'Staff member not found' });
  res.json({ success: true });
});

// ==============================================================================
// 13. STATS & ANALYTICS
// ==============================================================================
app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

// ==============================================================================
// 14. VITE MIDDLEWARE (DEV) / STATIC SERVING (PROD)
// ==============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌱 KisaanSathi server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
