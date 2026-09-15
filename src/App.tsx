import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  Building2,
  RefreshCw,
  QrCode,
  Sparkles,
  TrendingUp,
  MapPin,
  ArrowLeft,
  User,
  Briefcase,
  Shield,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserRole,
  Farmer,
  Staff,
  Admin,
  ProcurementToken,
  ProcurementCenter,
  Crop,
  Notification,
  ProcurementStats
} from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginModal } from './components/LoginModal';
import { TokenPassModal } from './components/TokenPassModal';
import { FarmerDashboard } from './components/FarmerDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HeroPage } from './components/HeroPage';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'hero' | 'dashboard'>('hero');
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');

  // Authentication Entities
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
  const [currentStaff, setCurrentStaff] = useState<(Staff & { center?: ProcurementCenter }) | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  // Modals & Drawers
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalRole, setLoginModalRole] = useState<UserRole>('farmer');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedPassToken, setSelectedPassToken] = useState<ProcurementToken | null>(null);

  // Main Data Store
  const [tokens, setTokens] = useState<ProcurementToken[]>([]);
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [staffList, setStaffList] = useState<(Staff & { center?: ProcurementCenter })[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<ProcurementStats>({
    total_farmers: 0,
    total_tokens_booked: 0,
    total_procured_qtl: 0,
    total_dbt_disbursed: 0,
    active_centers: 0,
    average_waiting_time_mins: 0,
    quality_pass_rate_pct: 100
  });

  // UI status
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load all initial data from backend database
  const loadAllData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [
        tokensData,
        centersData,
        cropsData,
        farmersData,
        staffData,
        notifData,
        statsData,
        adminStatusData
      ] = await Promise.all([
        api.getTokens(),
        api.getCenters(),
        api.getCrops(),
        api.getFarmers(),
        api.getStaff(),
        api.getNotifications(),
        api.getStats(),
        api.getAdminStatus().catch(() => ({ has_admin: false, count: 0, admins: [] }))
      ]);

      setTokens(tokensData || []);
      setCenters(centersData || []);
      setCrops(cropsData || []);
      setFarmers(farmersData || []);
      setStaffList(staffData || []);
      setNotifications(notifData || []);
      setStats(statsData || {
        total_farmers: 0,
        total_tokens_booked: 0,
        total_procured_qtl: 0,
        total_dbt_disbursed: 0,
        active_centers: centersData?.length || 0,
        average_waiting_time_mins: 0,
        quality_pass_rate_pct: 100
      });

      // Update current user references if they were deleted or reset
      if (currentFarmer && !farmersData.some(f => f.id === currentFarmer.id)) {
        setCurrentFarmer(farmersData.length > 0 ? farmersData[0] : null);
      }
      if (currentStaff && !staffData.some(s => s.id === currentStaff.id)) {
        setCurrentStaff(staffData.length > 0 ? staffData[0] : null);
      }
      if (adminStatusData && adminStatusData.admins && adminStatusData.admins.length > 0) {
        if (!currentAdmin) {
          setCurrentAdmin(adminStatusData.admins[0]);
        }
      } else {
        setCurrentAdmin(null);
      }
    } catch (err) {
      console.error('Failed loading KisaanSathi data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentFarmer, currentStaff, currentAdmin]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter Tokens for current farmer when in farmer mode
  const currentFarmerTokens = tokens.filter(
    t => !currentFarmer || t.farmer_id === currentFarmer.id
  );

  // Quick Token Search & Verification Handler
  const handleVerifyToken = (tokenQuery: string) => {
    setSearchError(null);
    const q = tokenQuery.trim().toUpperCase();
    if (!q) return;

    const found = tokens.find(
      t =>
        t.token_number.toUpperCase() === q ||
        t.vehicle_number.toUpperCase().includes(q) ||
        t.id === q
    );

    if (found) {
      setSelectedPassToken(found);
      setTokenSearchQuery('');
    } else {
      setSearchError(`No active gate pass found for "${q}". Please check token number or vehicle reg.`);
      setTimeout(() => setSearchError(null), 4000);
    }
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyToken(tokenSearchQuery);
  };

  // Notification handlers
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Login handler from modal
  const handleLoginSuccess = (role: UserRole, user: any) => {
    setCurrentRole(role);
    setCurrentView('dashboard');
    if (role === 'farmer') setCurrentFarmer(user);
    if (role === 'staff') setCurrentStaff(user);
    if (role === 'admin') setCurrentAdmin(user);
    loadAllData();
  };

  const handleOpenLogin = (role?: UserRole) => {
    if (role) setLoginModalRole(role);
    setIsLoginModalOpen(true);
  };

  // Navigation handlers
  const handleNavigateRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentView('dashboard');
    if (role === 'farmer' && !currentFarmer) {
      handleOpenLogin('farmer');
    } else if (role === 'staff' && !currentStaff) {
      handleOpenLogin('staff');
    } else if (role === 'admin' && !currentAdmin) {
      handleOpenLogin('admin');
    }
  };

  const handleNavigateHome = () => {
    setCurrentView('hero');
  };

  const handleLogout = () => {
    if (currentRole === 'farmer') {
      setCurrentFarmer(null);
    } else if (currentRole === 'staff') {
      setCurrentStaff(null);
    } else if (currentRole === 'admin') {
      setCurrentAdmin(null);
    }
  };

  const activeCurrentUser = currentRole === 'farmer'
    ? currentFarmer
    : currentRole === 'staff'
    ? currentStaff
    : currentAdmin;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl animate-pulse">
          🌱
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black tracking-wide">KisaanSathi</h2>
          <p className="text-emerald-400 text-xs mt-1">
            Loading Mandi APMC Procurement Grid & Real-time Tokens...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white text-slate-900">
      {/* Header Navigation */}
      <Navbar
        currentRole={currentRole}
        currentView={currentView}
        currentUser={activeCurrentUser}
        unreadCount={notifications.filter(n => !n.is_read).length}
        notificationsCount={notifications.filter(n => !n.is_read).length}
        notifications={notifications}
        farmerName={currentFarmer?.name}
        staffName={currentStaff?.name}
        adminName={currentAdmin?.name}
        onSwitchRole={handleNavigateRole}
        onRoleChange={handleNavigateRole}
        onNavigateHome={handleNavigateHome}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        isSupabaseConnected={false}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search Feedback Error Toast */}
        {searchError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{searchError}</span>
          </motion.div>
        )}

        {/* VIEW 1: HERO PAGE (OVERVIEW & WORKFLOW) */}
        {currentView === 'hero' ? (
          <motion.div
            key="hero-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <HeroPage
              stats={stats}
              sampleTokens={tokens}
              onNavigateRole={handleNavigateRole}
              onVerifyToken={handleVerifyToken}
              onOpenLogin={handleOpenLogin}
            />
          </motion.div>
        ) : (
          /* VIEW 2: ROLE-BASED WORKSPACE (FARMER, MANDI STAFF, OR ADMIN) */
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Clean, Uncomplicated Breadcrumb & Switcher Header */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNavigateHome}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <div className="h-4 w-px bg-slate-200" />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-800">
                      {currentRole === 'farmer' && '🌾 Farmer Procurement Terminal'}
                      {currentRole === 'staff' && '⚖️ Mandi Weighbridge & Quality Terminal'}
                      {currentRole === 'admin' && '🏛️ APMC Directorate & Staff Governance'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        currentRole === 'farmer'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentRole === 'staff'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      Active Session
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {currentRole === 'farmer' && 'Book slots, track electronic weighing, moisture test, and DBT bank credit.'}
                    {currentRole === 'staff' && 'Automated weighbridge gross/tare logging, moisture analysis, and godown dispatch.'}
                    {currentRole === 'admin' && 'Create staff credentials, reset security PINs, configure MSP, and oversee mandis.'}
                  </p>
                </div>
              </div>

              {/* Fast Compact Gate Pass Search */}
              <form onSubmit={handleQuickSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={tokenSearchQuery}
                    onChange={(e) => setTokenSearchQuery(e.target.value)}
                    placeholder="Search Token (e.g. KS-2026-PB-101)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Verify</span>
                </button>
              </form>
            </div>

            {/* DASHBOARDS */}
            {currentRole === 'farmer' && (
              currentFarmer ? (
                <FarmerDashboard
                  farmer={currentFarmer}
                  tokens={currentFarmerTokens}
                  centers={centers}
                  crops={crops}
                  onSelectToken={(token) => setSelectedPassToken(token)}
                  onTokenBooked={loadAllData}
                />
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center shadow-xs border border-emerald-100 max-w-md mx-auto space-y-4 my-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto shadow-inner">
                    🌾
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Farmer Authentication Required</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Register as a new farmer to generate procurement tokens, or log in with your mobile number to view slips and DBT bank transfers.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => handleOpenLogin('farmer')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                      Log In as Farmer
                    </button>
                    <button
                      onClick={() => handleOpenLogin('farmer')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
                    >
                      New Farmer Registration
                    </button>
                  </div>
                </div>
              )
            )}

            {currentRole === 'staff' && (
              currentStaff ? (
                <StaffDashboard
                  staff={currentStaff}
                  tokens={tokens}
                  crops={crops}
                  onRefresh={loadAllData}
                  onSelectToken={(token) => setSelectedPassToken(token)}
                />
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center shadow-xs border border-blue-100 max-w-md mx-auto space-y-4 my-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mx-auto shadow-inner">
                    ⚖️
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Mandi Staff Credentials Required</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Sign in using the staff username and password created by the APMC Mandi Administrator to operate the weighbridge and moisture laboratory.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenLogin('staff')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    Log In to Staff Terminal
                  </button>
                </div>
              )
            )}

            {currentRole === 'admin' && (
              currentAdmin ? (
                <AdminDashboard
                  admin={currentAdmin}
                  stats={stats}
                  centers={centers}
                  crops={crops}
                  farmers={farmers}
                  staffList={staffList}
                  tokens={tokens}
                  onRefresh={loadAllData}
                  onSelectToken={(token) => setSelectedPassToken(token)}
                />
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center shadow-xs border border-purple-100 max-w-md mx-auto space-y-4 my-8">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mx-auto shadow-inner">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">APMC Directorate Access</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Create a master admin profile with a strong password & biometric enrollment, or log in to manage your grain market yard and staff credentials.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => handleOpenLogin('admin')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                      Directorate Login (Password / Biometric)
                    </button>
                    <button
                      onClick={() => handleOpenLogin('admin')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
                    >
                      New Mandi Setup
                    </button>
                  </div>
                </div>
              )
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8 border-b border-slate-800/80">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                <span className="text-xl">🌱</span>
                <span>KisaanSathi</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Smart Farmer Procurement and Crop Tracking Platform. Eliminating mandi wait times with automated digital token slots, transparent moisture grading, and instant PFMS DBT payments.
              </p>
              <div className="pt-1">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  Smart India Hackathon 2026 Prototype
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Procurement Services
              </h4>
              <ul className="space-y-1 text-slate-400">
                <li>• Slot Booking & Queue Token</li>
                <li>• Electronic Weighbridge Slips</li>
                <li>• Digital Moisture Meter Testing</li>
                <li>• Real-Time Crop Status Tracking</li>
                <li>• Direct Benefit Transfer (DBT)</li>
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                APMC Guidelines & MSP
              </h4>
              <ul className="space-y-1 text-slate-400">
                <li>• Wheat FAQ Max Moisture: 12.0%</li>
                <li>• Paddy Grade A Max Moisture: 17.0%</li>
                <li>• Moisture Deduction: ₹20 / 0.5% excess</li>
                <li>• Maximum Turnaround Target: &lt; 30 Mins</li>
                <li>• Zero Cash / 100% Aadhaar DBT</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Farmer Helpline & Support
              </h4>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Toll-Free: 1800-180-1551</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  APMC Kisan Call Center (Mon–Sat 07:00 AM – 09:00 PM)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              © 2026 KisaanSathi Smart Procurement Initiative. Built for Smart India Hackathon.
            </div>
            <div className="flex items-center gap-3">
              <span>National Agriculture Market (e-NAM) aligned</span>
              <span>•</span>
              <span>PFMS DBT Integrated</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {selectedPassToken && (
        <TokenPassModal
          token={selectedPassToken}
          center={centers.find(c => c.id === selectedPassToken.procurement_center_id)}
          crop={crops.find(c => c.id === selectedPassToken.crop_id)}
          farmer={farmers.find(f => f.id === selectedPassToken.farmer_id)}
          onClose={() => setSelectedPassToken(null)}
        />
      )}

      {isNotificationOpen && (
        <NotificationDrawer
          isOpen={isNotificationOpen}
          notifications={notifications}
          onClose={() => setIsNotificationOpen(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllRead}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialRole={loginModalRole}
          farmers={farmers}
          staffList={staffList}
        />
      )}
    </div>
  );
}
