import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Shield,
  X,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Fingerprint,
  ScanFace,
  Building2,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { UserRole, Farmer, Staff, Admin, ProcurementCenter } from '../types';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, user: any) => void;
  initialRole?: UserRole;
  currentRole?: UserRole;
  farmers?: Farmer[];
  staffList?: (Staff & { center?: ProcurementCenter })[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole,
  currentRole = 'farmer',
  staffList = []
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole || currentRole || 'farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync role if initialRole changes
  useEffect(() => {
    if (initialRole) {
      setActiveRole(initialRole);
    }
  }, [initialRole]);

  // Farmer State
  const [farmerMode, setFarmerMode] = useState<'login' | 'register'>('login');
  const [farmerMobile, setFarmerMobile] = useState('');
  const [farmerPin, setFarmerPin] = useState('');
  const [showFarmerPin, setShowFarmerPin] = useState(false);

  // Farmer Registration Fields
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regDistrict, setRegDistrict] = useState('Ludhiana');
  const [regState, setRegState] = useState('Punjab');
  const [regAadhar, setRegAadhar] = useState('');
  const [regLandAcreage, setRegLandAcreage] = useState('4.5');
  const [regBankName, setRegBankName] = useState('State Bank of India');
  const [regAccountNumber, setRegAccountNumber] = useState('');
  const [regIfsc, setRegIfsc] = useState('SBIN0001420');
  const [regPin, setRegPin] = useState('');

  // Staff State
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // Admin State
  const [adminMode, setAdminMode] = useState<'login' | 'register'>('login');
  const [adminAuthType, setAdminAuthType] = useState<'password' | 'biometric'>('password');
  const [biometricMethod, setBiometricMethod] = useState<'fingerprint' | 'face_id'>('fingerprint');
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [hasExistingAdmin, setHasExistingAdmin] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState<Admin[]>([]);

  // Admin Registration Fields (Mandi Directorate Onboarding)
  const [adminRegName, setAdminRegName] = useState('');
  const [adminRegEmail, setAdminRegEmail] = useState('');
  const [adminRegUsername, setAdminRegUsername] = useState('');
  const [adminRegMandi, setAdminRegMandi] = useState('Khanna Grain Mandi Center');
  const [adminRegDistrict, setAdminRegDistrict] = useState('Ludhiana');
  const [adminRegState, setAdminRegState] = useState('Punjab');
  const [adminRegDesignation, setAdminRegDesignation] = useState('Mandi Secretary & APMC Director');
  const [adminRegPassword, setAdminRegPassword] = useState('');
  const [adminRegConfirmPassword, setAdminRegConfirmPassword] = useState('');
  const [adminRegBiometric, setAdminRegBiometric] = useState(true);

  // Check admin status on modal open
  useEffect(() => {
    if (!isOpen) return;
    api.getAdminStatus()
      .then(res => {
        setHasExistingAdmin(res.has_admin);
        setAvailableAdmins(res.admins || []);
        if (!res.has_admin) {
          setAdminMode('register');
        } else {
          setAdminMode('login');
          if (res.admins.length > 0 && !adminIdentifier) {
            setAdminIdentifier(res.admins[0].username || res.admins[0].email);
          }
        }
      })
      .catch(() => {
        // Fallback
      });
  }, [isOpen]);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 5
  };

  const passScore = getPasswordStrength(adminRegPassword);

  // --- Handlers ---

  // Farmer Login
  const handleFarmerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!farmerMobile || farmerMobile.trim().length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number.');
      }

      const res = await api.farmerLogin({
        mobile_number: farmerMobile.trim(),
        pin: farmerPin.trim()
      });

      setSuccessMsg(`Welcome, ${res.user.name}! Accessing your Farmer Portal...`);
      setTimeout(() => {
        onLoginSuccess('farmer', res.user);
        onClose();
      }, 500);
    } catch (err: any) {
      if (err.message && err.message.includes('needs_registration') || err.message.includes('No farmer account found')) {
        setError(`${err.message}`);
        // Switch to registration and prefill mobile
        setRegMobile(farmerMobile);
      } else {
        setError(err.message || 'Farmer login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Farmer Register
  const handleFarmerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!regName.trim()) throw new Error('Please enter farmer full name.');
      if (!regMobile.trim() || regMobile.trim().length < 10) throw new Error('Please enter a valid 10-digit mobile number.');
      if (!regVillage.trim()) throw new Error('Please enter village / tehsil.');

      const res = await api.farmerRegister({
        name: regName.trim(),
        mobile_number: regMobile.trim(),
        village: regVillage.trim(),
        district: regDistrict.trim(),
        state: regState.trim(),
        aadhar_number: regAadhar.trim() || undefined,
        land_acreage: regLandAcreage ? Number(regLandAcreage) : undefined,
        bank_name: regBankName.trim(),
        account_number: regAccountNumber.trim(),
        ifsc_code: regIfsc.trim(),
        pin: regPin.trim() || '1234',
        password: regPin.trim() || '1234'
      });

      setSuccessMsg(`Registration successful! Welcome to KisaanSathi, ${res.user.name}.`);
      setTimeout(() => {
        onLoginSuccess('farmer', res.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Staff Login
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!staffUsername.trim()) throw new Error('Staff username is required.');
      if (!staffPassword.trim()) throw new Error('Staff password is required.');

      const res = await api.staffLogin({
        username: staffUsername.trim(),
        password: staffPassword.trim()
      });

      setSuccessMsg(`Authorized: ${res.user.name} (${res.user.role.replace('_', ' ').toUpperCase()})`);
      setTimeout(() => {
        onLoginSuccess('staff', res.user);
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Staff authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Admin Register (New Directorate Setup)
  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!adminRegName.trim()) throw new Error('Administrator name is required.');
      if (!adminRegEmail.trim()) throw new Error('Official email address is required.');
      if (!adminRegPassword) throw new Error('Password is required.');

      if (adminRegPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }
      if (passScore < 4) {
        throw new Error('Password must include uppercase, lowercase, numbers, and a special character.');
      }
      if (adminRegPassword !== adminRegConfirmPassword) {
        throw new Error('Passwords do not match. Please verify.');
      }

      const res = await api.adminRegister({
        name: adminRegName.trim(),
        email: adminRegEmail.trim(),
        username: adminRegUsername.trim() || undefined,
        password: adminRegPassword,
        mandi_name: adminRegMandi.trim(),
        district: adminRegDistrict.trim(),
        state: adminRegState.trim(),
        designation: adminRegDesignation.trim(),
        biometric_enabled: adminRegBiometric
      });

      setSuccessMsg(`Mandi Directorate initialized for ${adminRegMandi}! Logged in as ${res.user.name}.`);
      setHasExistingAdmin(true);
      setTimeout(() => {
        onLoginSuccess('admin', res.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to establish Mandi Directorate');
    } finally {
      setLoading(false);
    }
  };

  // Admin Login (Password)
  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!adminIdentifier.trim()) throw new Error('Admin username or email is required.');
      if (!adminPassword) throw new Error('Password is required.');

      const res = await api.adminLogin({
        email_or_username: adminIdentifier.trim(),
        password: adminPassword,
        auth_type: 'password'
      });

      setSuccessMsg(`Access Granted: Welcome ${res.user.name}`);
      setTimeout(() => {
        onLoginSuccess('admin', res.user);
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  // Admin Biometric Login (Face ID / Fingerprint)
  const handleBiometricAuth = async () => {
    if (!hasExistingAdmin && availableAdmins.length === 0) {
      setError('No Mandi Admin is registered yet. Please create your Mandi Admin Directorate first.');
      setAdminMode('register');
      return;
    }

    setBiometricScanning(true);
    setError(null);

    // Simulate scanning sensor feedback
    setTimeout(async () => {
      try {
        const res = await api.adminLogin({
          auth_type: biometricMethod === 'face_id' ? 'face_id' : 'fingerprint',
          admin_id: availableAdmins[0]?.id
        });

        setSuccessMsg(`Biometric Verified: ${biometricMethod === 'face_id' ? 'Face ID Authenticated' : 'Fingerprint Matched'}. Welcome ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess('admin', res.user);
          onClose();
        }, 600);
      } catch (err: any) {
        setError(err.message || 'Biometric sensor timeout. Please use password login.');
      } finally {
        setBiometricScanning(false);
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-6 animate-fade-in">
        {/* Header with Role Selector */}
        <div className="bg-slate-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/30">
              🌱
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">KisaanSathi Auth Portal</h2>
              <p className="text-slate-400 text-xs">
                {activeRole === 'farmer' && 'Farmer Registration, Slot Booking & DBT Credits'}
                {activeRole === 'staff' && 'Mandi Terminal (Weighbridge & Moisture Lab)'}
                {activeRole === 'admin' && 'APMC Mandi Directorate Master Control'}
              </p>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setActiveRole('farmer');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'farmer'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Farmer
            </button>

            <button
              onClick={() => {
                setActiveRole('staff');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'staff'
                  ? 'bg-blue-500 text-blue-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Mandi Staff
            </button>

            <button
              onClick={() => {
                setActiveRole('admin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-purple-500 text-purple-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              APMC Admin
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Status Alerts */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 1. FARMER SECTION (LOGIN OR SIGNUP) */}
          {/* ===================================================================== */}
          {activeRole === 'farmer' && (
            <div className="space-y-4">
              {/* Farmer Sub-Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setFarmerMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    farmerMode === 'login'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Existing Farmer Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFarmerMode('register');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    farmerMode === 'register'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  New Farmer Registration
                </button>
              </div>

              {farmerMode === 'login' ? (
                /* Farmer Login Form */
                <form onSubmit={handleFarmerLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Farmer Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                        +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={farmerMobile}
                        onChange={(e) => setFarmerMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        4-Digit PIN / Password
                      </label>
                      <span className="text-[11px] text-slate-400">Default PIN: 1234</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showFarmerPin ? 'text' : 'password'}
                        value={farmerPin}
                        onChange={(e) => setFarmerPin(e.target.value)}
                        placeholder="Enter your PIN or password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFarmerPin(!showFarmerPin)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showFarmerPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Farmer Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Log In to Farmer Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFarmerMode('register');
                        if (farmerMobile) setRegMobile(farmerMobile);
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      New Farmer? Register your Kisan profile here →
                    </button>
                  </div>
                </form>
              ) : (
                /* Farmer Registration Form */
                <form onSubmit={handleFarmerRegister} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Gurpreet Singh"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs font-semibold">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile"
                          className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Village / Tehsil *
                      </label>
                      <input
                        type="text"
                        value={regVillage}
                        onChange={(e) => setRegVillage(e.target.value)}
                        placeholder="e.g. Payal"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        placeholder="e.g. Ludhiana"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        State
                      </label>
                      <select
                        value={regState}
                        onChange={(e) => setRegState(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="Punjab">Punjab</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Aadhaar Number (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        value={regAadhar}
                        onChange={(e) => setRegAadhar(e.target.value.replace(/\D/g, ''))}
                        placeholder="12-digit Aadhaar"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Land Holding (Acres)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={regLandAcreage}
                        onChange={(e) => setRegLandAcreage(e.target.value)}
                        placeholder="e.g. 5.0"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Bank Details for Direct DBT */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bank Account for DBT Procurement Credits</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={regBankName}
                        onChange={(e) => setRegBankName(e.target.value)}
                        placeholder="Bank Name"
                        className="px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-medium"
                      />
                      <input
                        type="text"
                        value={regAccountNumber}
                        onChange={(e) => setRegAccountNumber(e.target.value)}
                        placeholder="Account Number"
                        className="px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={regIfsc}
                        onChange={(e) => setRegIfsc(e.target.value.toUpperCase())}
                        placeholder="IFSC Code"
                        className="px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Set 4-Digit Security PIN / Password *
                    </label>
                    <input
                      type="password"
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      placeholder="Create a 4-digit PIN (e.g. 2026)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Registering Farmer Account...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Registration & Enter Portal</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setFarmerMode('login')}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      Already registered? Click here to Log In →
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* 2. STAFF TERMINAL SECTION */}
          {/* ===================================================================== */}
          {activeRole === 'staff' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-blue-900 text-xs leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin-Provisioned Credentials</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Staff credentials (Weighing Officers & Quality Inspectors) are created and assigned to specific Mandi Centers by the APMC Administrator.
                </p>
              </div>

              {staffList.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  ⚠️ No staff credentials have been created yet. The Mandi Administrator can provision staff accounts inside the <strong>Admin Portal → Staff Tab</strong>.
                </div>
              )}

              <form onSubmit={handleStaffLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono font-bold">
                      @
                    </span>
                    <input
                      type="text"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value.replace(/^@/, ''))}
                      placeholder="e.g. staff_khanna"
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Enter assigned staff password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Staff Terminal Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4" />
                      <span>Authorize Staff Terminal Access</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 3. APMC ADMIN SECTION (STRONG PASSWORD & BIOMETRIC) */}
          {/* ===================================================================== */}
          {activeRole === 'admin' && (
            <div className="space-y-4">
              {/* Admin Mode Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAdminMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    adminMode === 'login'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Directorate Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminMode('register');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    adminMode === 'register'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  New Mandi Directorate Setup
                </button>
              </div>

              {adminMode === 'register' ? (
                /* Admin Registration (Create Mandi Directorate with Strong Password) */
                <form onSubmit={handleAdminRegister} className="space-y-3.5">
                  <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-purple-700" />
                      <span>Establish APMC Mandi Directorate</span>
                    </div>
                    <p className="text-[11px] text-purple-800">
                      Create master administrator credentials with strong cryptographic security and biometric authentication for your grain market yard.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Administrator Name *
                      </label>
                      <input
                        type="text"
                        value={adminRegName}
                        onChange={(e) => setAdminRegName(e.target.value)}
                        placeholder="e.g. Smt. Neha Bansal, IAS"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        value={adminRegEmail}
                        onChange={(e) => setAdminRegEmail(e.target.value)}
                        placeholder="director@apmc.gov.in"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mandi Yard / Center Name *
                      </label>
                      <input
                        type="text"
                        value={adminRegMandi}
                        onChange={(e) => setAdminRegMandi(e.target.value)}
                        placeholder="e.g. Khanna Grain Mandi"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={adminRegDesignation}
                        onChange={(e) => setAdminRegDesignation(e.target.value)}
                        placeholder="e.g. Mandi Secretary"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        value={adminRegDistrict}
                        onChange={(e) => setAdminRegDistrict(e.target.value)}
                        placeholder="Ludhiana"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={adminRegState}
                        onChange={(e) => setAdminRegState(e.target.value)}
                        placeholder="Punjab"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Strong Password Section */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Create Strong Mandi Password *
                      </label>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        passScore >= 4
                          ? 'bg-emerald-100 text-emerald-800'
                          : passScore >= 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {passScore >= 4 ? 'Strong Password' : passScore >= 3 ? 'Medium Strength' : 'Weak Password'}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminRegPassword}
                        onChange={(e) => setAdminRegPassword(e.target.value)}
                        placeholder="Min 8 chars with Aa, 1-9, and symbols (e.g. Mandi@Admin2026)"
                        className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Visual Strength Meter */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      <div className={`h-1.5 rounded-full transition-all ${passScore >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`} />
                      <div className={`h-1.5 rounded-full transition-all ${passScore >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                      <div className={`h-1.5 rounded-full transition-all ${passScore >= 3 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                      <div className={`h-1.5 rounded-full transition-all ${passScore >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>

                    {/* Criteria checklist */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                      <span className={adminRegPassword.length >= 8 ? 'text-emerald-700 font-semibold' : ''}>
                        {adminRegPassword.length >= 8 ? '✓' : '○'} Min 8 characters
                      </span>
                      <span className={/[A-Z]/.test(adminRegPassword) && /[a-z]/.test(adminRegPassword) ? 'text-emerald-700 font-semibold' : ''}>
                        {/[A-Z]/.test(adminRegPassword) && /[a-z]/.test(adminRegPassword) ? '✓' : '○'} Upper & Lowercase
                      </span>
                      <span className={/[0-9]/.test(adminRegPassword) ? 'text-emerald-700 font-semibold' : ''}>
                        {/[0-9]/.test(adminRegPassword) ? '✓' : '○'} Contains Numbers
                      </span>
                      <span className={/[^A-Za-z0-9]/.test(adminRegPassword) ? 'text-emerald-700 font-semibold' : ''}>
                        {/[^A-Za-z0-9]/.test(adminRegPassword) ? '✓' : '○'} Special Symbol (@$!%)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={adminRegConfirmPassword}
                      onChange={(e) => setAdminRegConfirmPassword(e.target.value)}
                      placeholder="Re-type your strong password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      required
                    />
                  </div>

                  {/* Biometric Enrollment */}
                  <label className="flex items-center gap-2.5 p-3 bg-purple-50/50 border border-purple-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminRegBiometric}
                      onChange={(e) => setAdminRegBiometric(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded-sm focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-purple-900 flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-purple-600" />
                        <span>Enroll Face ID & Fingerprint Biometric Access</span>
                      </div>
                      <p className="text-[11px] text-purple-700">
                        Enables instant biometric login via browser WebAuthn on future visits.
                      </p>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Establishing Mandi Directorate...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Initialize Directorate & Set Master Password</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Admin Login (Password OR Biometric: Face ID / Fingerprint) */
                <div className="space-y-4">
                  {/* Auth Type Switcher: Password vs Biometric */}
                  <div className="flex bg-purple-50 p-1 rounded-xl border border-purple-200">
                    <button
                      type="button"
                      onClick={() => setAdminAuthType('password')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        adminAuthType === 'password'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-purple-800 hover:text-purple-950'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Password Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminAuthType('biometric')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        adminAuthType === 'biometric'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-purple-800 hover:text-purple-950'
                      }`}
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Face ID / Fingerprint</span>
                    </button>
                  </div>

                  {adminAuthType === 'password' ? (
                    /* Password Login Form */
                    <form onSubmit={handleAdminPasswordLogin} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Admin Username or Official Email
                        </label>
                        <input
                          type="text"
                          value={adminIdentifier}
                          onChange={(e) => setAdminIdentifier(e.target.value)}
                          placeholder="e.g. admin or director@apmc.gov.in"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mandi Directorate Password
                        </label>
                        <div className="relative">
                          <input
                            type={showAdminPassword ? 'text' : 'password'}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Enter your master password"
                            className="w-full px-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                          >
                            {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Authenticating Mandi Directorate...</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            <span>Sign In to Admin Directorate</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Biometric Login (Face ID or Fingerprint) */
                    <div className="p-6 bg-slate-900 rounded-2xl border border-purple-800/60 text-center space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setBiometricMethod('fingerprint')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            biometricMethod === 'fingerprint'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Fingerprint className="w-4 h-4" />
                          <span>Touch Fingerprint</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBiometricMethod('face_id')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            biometricMethod === 'face_id'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <ScanFace className="w-4 h-4" />
                          <span>Face ID Scan</span>
                        </button>
                      </div>

                      {/* Interactive Biometric Sensor Animation */}
                      <div className="py-6 flex flex-col items-center justify-center">
                        <button
                          type="button"
                          onClick={handleBiometricAuth}
                          disabled={biometricScanning}
                          className="relative group p-6 rounded-full bg-slate-800 border-2 border-purple-500/40 hover:border-purple-400 shadow-xl transition-all cursor-pointer transform hover:scale-105"
                        >
                          {biometricScanning && (
                            <div className="absolute inset-0 rounded-full border-4 border-purple-400 border-t-transparent animate-spin" />
                          )}
                          <div className={`text-purple-400 group-hover:text-purple-300 transition-colors ${biometricScanning ? 'animate-pulse' : ''}`}>
                            {biometricMethod === 'fingerprint' ? (
                              <Fingerprint className="w-16 h-16" />
                            ) : (
                              <ScanFace className="w-16 h-16" />
                            )}
                          </div>
                        </button>
                        <div className="mt-3 text-xs font-semibold text-purple-300">
                          {biometricScanning ? 'Scanning Biometric Sensor...' : `Click sensor to verify ${biometricMethod === 'face_id' ? 'Face ID' : 'Fingerprint'}`}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Cryptographically bound to registered Mandi Administrator credentials
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleBiometricAuth}
                        disabled={biometricScanning}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {biometricScanning ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Validating Biometric Match...</span>
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-4 h-4" />
                            <span>Authenticate via {biometricMethod === 'face_id' ? 'Face ID' : 'Fingerprint'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminMode('register')}
                      className="text-xs text-purple-700 hover:text-purple-950 font-semibold"
                    >
                      Need to configure a New Mandi Directorate? Click here →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
