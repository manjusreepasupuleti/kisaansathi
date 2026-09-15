import React, { useState } from 'react';
import {
  Shield,
  Building2,
  Users,
  Briefcase,
  IndianRupee,
  Scale,
  Settings,
  Download,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Trash2,
  Clock,
  Search,
  Check,
  Key,
  Copy,
  Eye,
  EyeOff,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
  Lock,
  Sparkles
} from 'lucide-react';
import {
  Admin,
  ProcurementCenter,
  Crop,
  Farmer,
  Staff,
  ProcurementToken,
  ProcurementStats
} from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  admin: Admin;
  stats: ProcurementStats;
  centers: ProcurementCenter[];
  crops: Crop[];
  farmers: Farmer[];
  staffList: (Staff & { center?: ProcurementCenter })[];
  tokens: ProcurementToken[];
  onRefresh: () => void;
  onSelectToken: (token: ProcurementToken) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  admin,
  stats,
  centers,
  crops,
  farmers,
  staffList,
  tokens,
  onRefresh,
  onSelectToken
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'centers' | 'crops' | 'staff' | 'farmers' | 'tokens' | 'payments'
  >('staff');

  // Search filter
  const [search, setSearch] = useState('');

  // Editing Crop Modal
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [editMsp, setEditMsp] = useState('');
  const [editMoisture, setEditMoisture] = useState('');
  const [editDeduction, setEditDeduction] = useState('');

  // Add Center Modal
  const [isAddingCenter, setIsAddingCenter] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterLocation, setNewCenterLocation] = useState('');
  const [newCenterDistrict, setNewCenterDistrict] = useState('');
  const [newCenterState, setNewCenterState] = useState('Punjab');
  const [newCenterCapacity, setNewCenterCapacity] = useState('2000');
  const [newCenterPhone, setNewCenterPhone] = useState('+91 161 2400000');

  // Add Staff Modal & Credentials Creation
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newStaffCenterId, setNewStaffCenterId] = useState(centers[0]?.id || '');
  const [newStaffRole, setNewStaffRole] = useState<'weighing_officer' | 'quality_inspector' | 'center_manager' | 'operator'>('weighing_officer');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Success dialog after credentials generation
  const [issuedCredentials, setIssuedCredentials] = useState<{
    name: string;
    username: string;
    password: string;
    role: string;
    centerName: string;
    email: string;
    phone: string;
  } | null>(null);

  // Password visibility tracker for staff list
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const generateAutoPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Staff@${code}!`;
  };

  const handleOpenAddStaff = () => {
    setNewStaffName('');
    setNewStaffUsername('');
    setNewStaffEmail('');
    setNewStaffPhone('+91 98');
    setNewStaffCenterId(centers[0]?.id || '');
    setNewStaffRole('weighing_officer');
    setNewStaffPassword(generateAutoPassword());
    setShowPassword(true);
    setIsAddingStaff(true);
  };

  const handleAutoSuggestUsername = (name: string) => {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const center = centers.find(c => c.id === newStaffCenterId);
    const centerPrefix = center ? center.district.toLowerCase().slice(0, 4) : 'yard';
    const suggested = `staff_${clean.slice(0, 8)}_${centerPrefix}`;
    setNewStaffUsername(suggested);
    if (!newStaffEmail) {
      setNewStaffEmail(`${suggested}@apmc.punjab.gov.in`);
    }
  };

  // Crop Edit Handlers
  const handleOpenEditCrop = (c: Crop) => {
    setEditingCrop(c);
    setEditMsp(String(c.msp_price));
    setEditMoisture(String(c.max_moisture_limit));
    setEditDeduction(String(c.moisture_deduction_rate));
  };

  const handleSaveCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop) return;
    try {
      await api.updateCrop(editingCrop.id, {
        msp_price: Number(editMsp),
        max_moisture_limit: Number(editMoisture),
        moisture_deduction_rate: Number(editDeduction)
      });
      showToast(`Updated MSP & Moisture standards for ${editingCrop.crop_name}`);
      setEditingCrop(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Center Handlers
  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCenter({
        center_name: newCenterName,
        location: newCenterLocation,
        district: newCenterDistrict,
        state: newCenterState,
        daily_capacity: Number(newCenterCapacity),
        current_capacity: 0,
        status: 'active',
        contact_phone: newCenterPhone,
        operating_hours: '08:00 AM - 06:00 PM'
      });
      showToast('New APMC Procurement Center registered!');
      setIsAddingCenter(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Staff Handlers & Credential Management
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffUsername.trim() || !newStaffPassword.trim()) {
      alert('Please fill in Staff Name, Username, and Password');
      return;
    }

    setIsSubmittingStaff(true);
    try {
      const cleanUsername = newStaffUsername.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
      const assignedCenter = centers.find(c => c.id === newStaffCenterId);

      const created = await api.createStaff({
        name: newStaffName.trim(),
        username: cleanUsername,
        procurement_center_id: newStaffCenterId,
        role: newStaffRole,
        phone: newStaffPhone.trim() || '+91 98000 00000',
        email: newStaffEmail.trim() || `${cleanUsername}@apmc.punjab.gov.in`,
        temp_password: newStaffPassword.trim(),
        status: 'active'
      });

      setIsAddingStaff(false);
      // Open issued credentials card with full details
      setIssuedCredentials({
        name: created.name,
        username: created.username,
        password: newStaffPassword.trim(),
        role: created.role,
        centerName: assignedCenter?.center_name || 'Assigned APMC Mandi',
        email: created.email || `${cleanUsername}@apmc.punjab.gov.in`,
        phone: created.phone || 'N/A'
      });

      showToast(`Credentials successfully generated for @${created.username}`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create staff credentials');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleResetStaffPassword = async (staffMember: Staff) => {
    const newPass = generateAutoPassword();
    if (!confirm(`Reset credentials for ${staffMember.name} (@${staffMember.username})? New password will be: ${newPass}`)) {
      return;
    }

    try {
      await api.resetStaffPassword(staffMember.id, newPass);
      const center = centers.find(c => c.id === staffMember.procurement_center_id);

      setIssuedCredentials({
        name: staffMember.name,
        username: staffMember.username,
        password: newPass,
        role: staffMember.role,
        centerName: center?.center_name || 'Assigned APMC Mandi',
        email: staffMember.email || `${staffMember.username}@apmc.gov.in`,
        phone: staffMember.phone || 'N/A'
      });

      showToast(`New password generated for @${staffMember.username}`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleToggleStaffStatus = async (staffMember: Staff) => {
    const nextStatus = staffMember.status === 'suspended' ? 'active' : 'suspended';
    try {
      await api.updateStaff(staffMember.id, { status: nextStatus });
      showToast(`Account for @${staffMember.username} is now ${nextStatus}`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleCopyText = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    showToast(`Copied to clipboard: ${text}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate and remove this staff account?')) return;
    try {
      await api.deleteStaff(id);
      showToast('Staff member removed from directory');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['Token Number', 'Farmer', 'Mobile', 'Crop', 'Center', 'Status', 'Date', 'Gross Kg', 'Tare Kg', 'Net QTL', 'Moisture %', 'Grade', 'DBT Net ₹', 'UTR'];
    const rows = tokens.map(t => [
      t.token_number,
      t.farmer?.name || '',
      t.farmer?.mobile_number || '',
      t.crop?.crop_name || '',
      t.center?.center_name || '',
      t.status,
      t.booking_date,
      t.weighing?.gross_weight_kg || '',
      t.weighing?.tare_weight_kg || '',
      t.weighing?.net_weight_qtl || t.estimated_quantity_qtl,
      t.quality?.moisture_percentage || '',
      t.quality?.grain_grade || '',
      t.payment?.net_payable || '',
      t.payment?.utr_number || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KisaanSathi_Procurement_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-purple-900/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-900 text-purple-200 border border-purple-700">
                Government Authority & APMC Directorate
              </span>
              <span className="text-purple-300 text-xs font-mono">
                Admin: {admin.name} ({admin.email})
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1">
              Procurement Directorate Master Control
            </h1>
            <p className="text-purple-200 text-xs mt-0.5">
              Live oversight of APMC Mandis, MSP disbursement, moisture calibration, and farmer queues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Audit CSV
            </button>
            <button
              onClick={onRefresh}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
            >
              Sync Data
            </button>
          </div>
        </div>

        {/* Directorate High-level KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-purple-900/50 text-xs">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-purple-900/40">
            <span className="text-purple-300 block font-semibold">Total Disbursed (DBT)</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              ₹{(stats.total_dbt_disbursed).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-purple-900/40">
            <span className="text-purple-300 block font-semibold">Total Crops Procured</span>
            <span className="text-xl font-black text-white font-mono">
              {stats.total_procured_qtl} QTL
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-purple-900/40">
            <span className="text-purple-300 block font-semibold">Quality Pass Rate</span>
            <span className="text-xl font-black text-purple-300 font-mono">
              {stats.quality_pass_rate_pct}%
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-purple-900/40">
            <span className="text-purple-300 block font-semibold">Avg. Turnaround Time</span>
            <span className="text-xl font-black text-white font-mono">
              {stats.average_waiting_time_mins} Mins
            </span>
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Overview & Insights
        </button>
        <button
          onClick={() => setActiveTab('centers')}
          className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'centers'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Procurement Centers ({centers.length})
        </button>
        <button
          onClick={() => setActiveTab('crops')}
          className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'crops'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Crop MSP & Moisture Limits ({crops.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'staff'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Staff Assignments ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab('farmers')}
          className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'farmers'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Farmers Directory ({farmers.length})
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'tokens'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          All Mandi Tokens ({tokens.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          DBT Audit & UTRs
        </button>
      </div>

      {/* TAB 1: ANALYTICS & OVERVIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Crop Procurement Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {crops.slice(0, 3).map((crop) => {
              const cropTokens = tokens.filter(t => t.crop_id === crop.id);
              const cropQtl = cropTokens.reduce((acc, t) => acc + (t.weighing?.net_weight_qtl || t.estimated_quantity_qtl || 0), 0);
              const cropValue = cropQtl * crop.msp_price;
              return (
                <div key={crop.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 text-sm">{crop.crop_name}</span>
                    <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      ₹{crop.msp_price}/QTL
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-slate-400 text-xs block">Procured Volume</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {cropQtl.toLocaleString('en-IN')} QTL
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                    <span>MSP Value:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      ₹{cropValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mandi Load Utilization Progress Bars */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Procurement Center Real-Time Capacity Utilization
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Daily booking volume versus physical yard capacity to prevent mandi bottlenecks.
            </p>

            <div className="space-y-4">
              {centers.map((c) => {
                const pct = Math.min(100, Math.round((c.current_capacity / c.daily_capacity) * 100));
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{c.center_name} ({c.district})</span>
                      <span className="font-mono text-slate-600">
                        {c.current_capacity} / {c.daily_capacity} QTL ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CENTERS MANAGEMENT */}
      {activeTab === 'centers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Registered APMC Procurement Mandis</h3>
              <p className="text-xs text-slate-500">Manage daily capacities, operating hours, and active intake status</p>
            </div>
            <button
              onClick={() => setIsAddingCenter(true)}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Mandi Center
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centers.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{c.center_name}</h4>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      {c.location}, {c.district}, {c.state}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Daily Capacity</span>
                    <span className="font-mono font-bold text-slate-800">{c.daily_capacity} Quintals</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Helpline Contact</span>
                    <span className="font-semibold text-slate-800">{c.contact_phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Center Modal */}
          {isAddingCenter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">Add New APMC Mandi Center</h3>
                <form onSubmit={handleCreateCenter} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mandi Center Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bathinda Main Mandi"
                      value={newCenterName}
                      onChange={(e) => setNewCenterName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Specific Yard Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grain Market Complex Yard-2"
                      value={newCenterLocation}
                      onChange={(e) => setNewCenterLocation(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">District</label>
                      <input
                        type="text"
                        required
                        value={newCenterDistrict}
                        onChange={(e) => setNewCenterDistrict(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Daily Cap (QTL)</label>
                      <input
                        type="number"
                        required
                        value={newCenterCapacity}
                        onChange={(e) => setNewCenterCapacity(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCenter(false)}
                      className="flex-1 py-2 bg-slate-100 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-purple-700 text-white font-bold rounded-xl"
                    >
                      Create Center
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CROPS & MSP CONFIGURATION */}
      {activeTab === 'crops' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">National MSP Rates & Moisture Calibration</h3>
              <p className="text-xs text-slate-500">Configure official Govt. MSP per quintal and moisture tolerances</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crops.map((crop) => (
              <div key={crop.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{crop.crop_name}</h4>
                    <span className="text-xs text-slate-500">{crop.variety} • Season: {crop.season}</span>
                  </div>
                  <button
                    onClick={() => handleOpenEditCrop(crop)}
                    className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Configure
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Govt MSP Rate</span>
                    <span className="font-bold text-emerald-800 font-mono text-sm">₹{crop.msp_price}/QTL</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Max Moisture</span>
                    <span className="font-bold text-purple-900 font-mono text-sm">{crop.max_moisture_limit}%</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Refraction Slab</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">₹{crop.moisture_deduction_rate}/0.5%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Crop Standards Modal */}
          {editingCrop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Configure Standards: {editingCrop.crop_name}
                </h3>
                <form onSubmit={handleSaveCrop} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">MSP Rate (₹ per Quintal)</label>
                    <input
                      type="number"
                      required
                      value={editMsp}
                      onChange={(e) => setEditMsp(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl font-mono font-bold text-emerald-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Permissible Max Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editMoisture}
                      onChange={(e) => setEditMoisture(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Moisture Refraction Cut Rate (₹ per 0.5% excess)</label>
                    <input
                      type="number"
                      required
                      value={editDeduction}
                      onChange={(e) => setEditDeduction(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingCrop(null)}
                      className="flex-1 py-2 bg-slate-100 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-purple-700 text-white font-bold rounded-xl"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STAFF MANAGEMENT & CREDENTIALS ISSUANCE */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Key className="w-4 h-4" />
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Mandi Staff & Credential Governance
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Admin controls: Provision official credentials, assign APMC yards, manage roles, and reset security PINs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddStaff}
                className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                Issue Staff Credentials
              </button>
            </div>
          </div>

          {/* Staff Directory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList
              .filter(s => {
                if (!search) return true;
                const q = search.toLowerCase();
                return (
                  s.name.toLowerCase().includes(q) ||
                  s.username.toLowerCase().includes(q) ||
                  (s.center?.center_name || '').toLowerCase().includes(q) ||
                  s.role.toLowerCase().includes(q)
                );
              })
              .map((s) => {
                const isPassVisible = Boolean(visiblePasswords[s.id]);
                const displayPass = s.temp_password || s.password || 'Staff@2026!';
                const isSuspended = s.status === 'suspended';

                return (
                  <div
                    key={s.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-3 ${
                      isSuspended ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-sm">{s.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.role === 'weighing_officer'
                                ? 'bg-blue-100 text-blue-800'
                                : s.role === 'quality_inspector'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {s.role.replace('_', ' ').toUpperCase()}
                          </span>
                          {isSuspended && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              DEACTIVATED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-purple-900 font-semibold mt-0.5">
                          📍 {s.center?.center_name || 'Central APMC Reserve'}
                        </p>
                      </div>

                      {/* Status Toggle & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStaffStatus(s)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isSuspended
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                          }`}
                          title={isSuspended ? 'Activate account' : 'Suspend account'}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove from directory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Contact & Credentials Info */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Username:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                          <span>@{s.username}</span>
                          <button
                            onClick={() => handleCopyText(`@${s.username}`, `user-${s.id}`)}
                            className="text-slate-400 hover:text-purple-700 p-0.5"
                            title="Copy username"
                          >
                            {copiedKey === `user-${s.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {isPassVisible ? displayPass : '••••••••••••'}
                          </span>
                          <button
                            onClick={() =>
                              setVisiblePasswords(prev => ({
                                ...prev,
                                [s.id]: !prev[s.id]
                              }))
                            }
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title={isPassVisible ? 'Hide password' : 'Show password'}
                          >
                            {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => handleCopyText(displayPass, `pass-${s.id}`)}
                            className="text-slate-400 hover:text-purple-700 p-0.5"
                            title="Copy password"
                          >
                            {copiedKey === `pass-${s.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Email: {s.email || `${s.username}@apmc.gov.in`}</span>
                        <span>Phone: {s.phone || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleResetStaffPassword(s)}
                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset Security PIN
                      </button>

                      <button
                        onClick={() => {
                          const credText = `KisaanSathi Mandi Staff Credentials\nOfficer: ${s.name}\nUsername: ${s.username}\nPassword: ${displayPass}\nCenter: ${s.center?.center_name || 'APMC Yard'}\nRole: ${s.role}`;
                          handleCopyText(credText, `all-${s.id}`);
                        }}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        {copiedKey === `all-${s.id}` ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Share Slip
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Add Staff & Generate Credentials Modal */}
          {isAddingStaff && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-700" />
                      Issue Staff Credentials
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Provision authenticated access for Mandi weighbridge & testing staff
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingStaff(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
                  {/* Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Staff Officer Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kulwinder Singh"
                      value={newStaffName}
                      onChange={(e) => {
                        setNewStaffName(e.target.value);
                        if (!newStaffUsername) {
                          handleAutoSuggestUsername(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                    />
                  </div>

                  {/* Mandi Center & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Assigned Mandi Center <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={newStaffCenterId}
                        onChange={(e) => {
                          setNewStaffCenterId(e.target.value);
                          if (newStaffName) handleAutoSuggestUsername(newStaffName);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                      >
                        {centers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.center_name} ({c.district})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Designated Role <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={newStaffRole}
                        onChange={(e: any) => setNewStaffRole(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 font-semibold"
                      >
                        <option value="weighing_officer">Weighing Officer (Weighbridge Scale)</option>
                        <option value="quality_inspector">Quality Inspector (Moisture Testing Lab)</option>
                        <option value="center_manager">Center Mandi Manager</option>
                        <option value="operator">Gate & Dispatch Operator</option>
                      </select>
                    </div>
                  </div>

                  {/* Username with Auto-Suggest */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Username <span className="text-rose-600">*</span>
                      </label>
                      {newStaffName && (
                        <button
                          type="button"
                          onClick={() => handleAutoSuggestUsername(newStaffName)}
                          className="text-[11px] text-purple-700 hover:underline font-semibold"
                        >
                          Suggest Username
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">@</span>
                      <input
                        type="text"
                        required
                        placeholder="staff_username"
                        value={newStaffUsername}
                        onChange={(e) => setNewStaffUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                      <input
                        type="email"
                        placeholder="officer@apmc.punjab.gov.in"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile (for SMS & 2FA)</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={newStaffPhone}
                        onChange={(e) => setNewStaffPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Password & Credential Generator */}
                  <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-purple-950 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-purple-700" />
                        Temporary Password / Security PIN <span className="text-rose-600">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewStaffPassword(generateAutoPassword())}
                        className="text-[11px] text-purple-700 hover:text-purple-950 font-bold flex items-center gap-1 underline"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Auto-Generate
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        className="w-full pr-10 pl-3 py-2 border border-purple-200 rounded-xl bg-white font-mono font-bold text-purple-950 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-purple-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-purple-800">
                      The staff member will use this password alongside their username to access the Mandi Terminal.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingStaff(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingStaff}
                      className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmittingStaff ? 'Creating Credentials...' : 'Generate & Issue Credentials'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Issued Credentials Success Modal */}
          {issuedCredentials && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-emerald-200">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mx-auto shadow-inner">
                  🎉
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-900">
                    Staff Credentials Ready
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Credentials have been generated and recorded in the APMC registry.
                  </p>
                </div>

                {/* Slip Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Staff Officer:</span>
                    <span className="font-bold text-slate-900">{issuedCredentials.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Role:</span>
                    <span className="font-bold text-purple-900 uppercase text-[11px]">
                      {issuedCredentials.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Center:</span>
                    <span className="font-semibold text-slate-800">{issuedCredentials.centerName}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Username:</span>
                    <span className="font-mono font-bold text-purple-900">@{issuedCredentials.username}</span>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                    <span className="text-emerald-900 font-medium">Temporary Password:</span>
                    <span className="font-mono font-bold text-emerald-950 text-sm">
                      {issuedCredentials.password}
                    </span>
                  </div>
                </div>

                {/* Share / Copy buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      const text = `KisaanSathi Mandi Staff Credentials\n----------------------------\nOfficer: ${issuedCredentials.name}\nRole: ${issuedCredentials.role}\nMandi: ${issuedCredentials.centerName}\nUsername: ${issuedCredentials.username}\nPassword: ${issuedCredentials.password}\nLogin at: KisaanSathi Staff Terminal`;
                      handleCopyText(text, 'issued-modal');
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    {copiedKey === 'issued-modal' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied Credentials to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Credentials for Staff Officer
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIssuedCredentials(null)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FARMERS DIRECTORY */}
      {activeTab === 'farmers' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Registered Farmers Master Registry</h3>
            <p className="text-xs text-slate-500">Farmers enrolled for Direct Benefit Transfer MSP procurement</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 text-xs">
              {farmers.map((f) => (
                <div key={f.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                      <span className="text-slate-500 text-xs font-mono">📱 {f.mobile_number}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      Village: <strong>{f.village}</strong>, District: <strong>{f.district}</strong>, State: <strong>{f.state}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Bank: {f.bank_name} • Account: {f.account_number} • IFSC: {f.ifsc_code}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                      Aadhaar Linked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ALL MANDI TOKENS MONITOR */}
      {activeTab === 'tokens' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Live Procurement Queue (All Centers)</h3>
            <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 border rounded">
              {tokens.length} Total Tokens
            </span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {tokens.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectToken(t)}
                className="p-4 hover:bg-slate-50 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{t.token_number}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Farmer: <strong>{t.farmer?.name}</strong> • Crop: {t.crop?.crop_name} • Mandi: {t.center?.center_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-800">
                    {t.weighing?.net_weight_qtl || t.estimated_quantity_qtl} QTL
                  </span>
                  <span className="text-[10px] text-slate-400 block">{t.booking_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DBT AUDIT & UTRS */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Direct Benefit Transfer (DBT) Financial Ledger</h3>
            <span className="text-xs font-mono font-bold text-emerald-800">
              Disbursed: ₹{stats.total_dbt_disbursed.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {tokens.filter(t => t.payment).map((t) => (
              <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{t.token_number}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {t.payment?.payment_status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Beneficiary: <strong>{t.farmer?.name}</strong> • Account: {t.payment?.account_number_masked} ({t.payment?.bank_name})
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    UTR Reference: <strong className="text-slate-800">{t.payment?.utr_number}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-700 font-mono">
                    ₹{t.payment?.net_payable.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {t.payment?.credited_at ? new Date(t.payment.credited_at).toLocaleDateString() : 'Pending Credit'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
