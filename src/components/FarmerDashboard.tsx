import React, { useState } from 'react';
import {
  PlusCircle,
  Clock,
  MapPin,
  Calendar,
  Truck,
  CheckCircle2,
  AlertCircle,
  Eye,
  IndianRupee,
  Scale,
  TestTube,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Building2,
  FileText,
  Sparkles,
  QrCode
} from 'lucide-react';
import {
  Farmer,
  ProcurementToken,
  ProcurementCenter,
  Crop,
  TokenStatus
} from '../types';
import { api } from '../services/api';

interface FarmerDashboardProps {
  farmer: Farmer;
  tokens: ProcurementToken[];
  centers: ProcurementCenter[];
  crops: Crop[];
  onSelectToken: (token: ProcurementToken) => void;
  onTokenBooked: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  farmer,
  tokens,
  centers,
  crops,
  onSelectToken,
  onTokenBooked
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tokens' | 'book' | 'quality' | 'payments' | 'centers'>('tokens');

  // Booking Form State
  const [bookingCropId, setBookingCropId] = useState(crops[0]?.id || '');
  const [bookingCenterId, setBookingCenterId] = useState(centers[0]?.id || '');
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingSlot, setBookingSlot] = useState('08:00 AM - 10:00 AM');
  const [bookingQuantity, setBookingQuantity] = useState('60');
  const [vehicleNumber, setVehicleNumber] = useState('PB 10 AC 5521');
  const [vehicleType, setVehicleType] = useState('Tractor Trolley');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const selectedCrop = crops.find(c => c.id === bookingCropId) || crops[0];
  const selectedCenter = centers.find(c => c.id === bookingCenterId) || centers[0];

  // Calculations for stats
  const totalPaid = tokens
    .map(t => t.payment)
    .filter(p => p?.payment_status === 'CREDITED')
    .reduce((acc, p) => acc + (p?.net_payable || 0), 0);

  const totalQuintalsSold = tokens
    .map(t => t.weighing)
    .filter(w => Boolean(w))
    .reduce((acc, w) => acc + (w?.net_weight_qtl || 0), 0);

  const activeToken = tokens.find(
    t => t.status !== 'PAYMENT_PROCESSED' && t.status !== 'REJECTED'
  );

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setBookingError(null);
    setBookingSuccessMsg(null);

    try {
      if (!bookingQuantity || Number(bookingQuantity) <= 0) {
        throw new Error('Please enter a valid estimated quantity in quintals');
      }
      if (!vehicleNumber.trim()) {
        throw new Error('Please enter your vehicle registration number');
      }

      const booked = await api.bookToken({
        farmer_id: farmer.id,
        crop_id: bookingCropId || crops[0]?.id,
        center_id: bookingCenterId || centers[0]?.id,
        booking_date: bookingDate,
        slot_time: bookingSlot,
        estimated_quantity_qtl: Number(bookingQuantity),
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        vehicle_type: vehicleType
      });

      setBookingSuccessMsg(`Token #${booked.token_number} confirmed! You can view and print your gate pass now.`);
      onTokenBooked();
      setTimeout(() => {
        onSelectToken(booked);
      }, 800);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book procurement token');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Status step index helper
  const getStepIndex = (status: TokenStatus) => {
    switch (status) {
      case 'BOOKED': return 0;
      case 'GATE_ARRIVED': return 1;
      case 'WEIGHED': return 2;
      case 'QUALITY_CHECKED': return 3;
      case 'ACCEPTED': return 4;
      case 'DISPATCHED': return 5;
      case 'PAYMENT_PROCESSED': return 6;
      case 'REJECTED': return -1;
      default: return 0;
    }
  };

  const steps = [
    { label: 'Slot Booked', icon: Calendar },
    { label: 'Gate Entry', icon: Truck },
    { label: 'Weighed', icon: Scale },
    { label: 'Quality & Moisture', icon: TestTube },
    { label: 'Mandi Accepted', icon: CheckCircle2 },
    { label: 'Dispatched', icon: Building2 },
    { label: 'DBT Paid', icon: IndianRupee }
  ];

  return (
    <div className="space-y-6">
      {/* Farmer Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-700/80 text-emerald-200 border border-emerald-600">
                Verified Farmer • {farmer.district}, {farmer.state}
              </span>
              <span className="text-emerald-300 text-xs font-mono">
                Aadhaar: •••• •••• {farmer.aadhar_last4 || '4892'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Namaste, {farmer.name}! 🌾
            </h1>
            <p className="text-emerald-200 text-sm mt-0.5">
              Village <span className="font-semibold text-white">{farmer.village}</span> • Primary Mandi:{' '}
              <span className="font-semibold text-white">Khanna Grain Market</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSubTab('book')}
              className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Book Token Slot
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-700/60 text-xs">
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40">
            <span className="text-emerald-300 font-medium block">Active Tokens</span>
            <span className="text-xl font-black text-white">{tokens.length}</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40">
            <span className="text-emerald-300 font-medium block">Total Crops Sold</span>
            <span className="text-xl font-black text-white">{totalQuintalsSold} QTL</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40">
            <span className="text-emerald-300 font-medium block">Total DBT Credited</span>
            <span className="text-xl font-black text-emerald-300">
              ₹{totalPaid.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40">
            <span className="text-emerald-300 font-medium block">Bank Linked for DBT</span>
            <span className="text-xs font-bold text-white truncate block">
              {farmer.bank_name || 'State Bank of India'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('tokens')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'tokens'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          My Tokens & Tracking ({tokens.length})
        </button>
        <button
          onClick={() => setActiveSubTab('book')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'book'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Book Procurement Slot
        </button>
        <button
          onClick={() => setActiveSubTab('quality')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'quality'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TestTube className="w-4 h-4" />
          Moisture & Quality Transparency
        </button>
        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'payments'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          DBT Payments & UTR
        </button>
        <button
          onClick={() => setActiveSubTab('centers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'centers'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Mandi Capacity & Schedule
        </button>
      </div>

      {/* SUB-VIEW 1: MY TOKENS & REAL-TIME CROP TRACKING */}
      {activeSubTab === 'tokens' && (
        <div className="space-y-6">
          {/* Active Token Tracker Stage if present */}
          {activeToken && (
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                      Live Active Procurement
                    </span>
                    <span className="font-mono text-sm font-black text-slate-900">
                      Token #{activeToken.token_number}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                    {activeToken.crop?.crop_name} • {activeToken.estimated_quantity_qtl} Quintals
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mandi: <span className="font-semibold text-slate-700">{activeToken.center?.center_name}</span> | Reporting:{' '}
                    <span className="font-semibold text-slate-700">{activeToken.booking_date} ({activeToken.slot_time})</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectToken(activeToken)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <QrCode className="w-4 h-4" />
                    View Gate Pass & QR
                  </button>
                </div>
              </div>

              {/* 7-Step Visual Timeline */}
              <div className="relative pt-2 pb-4 overflow-x-auto">
                <div className="min-w-[680px]">
                  <div className="grid grid-cols-7 gap-2 relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0" />
                    <div
                      className="absolute top-5 left-8 h-1 bg-emerald-500 transition-all duration-500 -z-0"
                      style={{
                        width: `${Math.max(0, (getStepIndex(activeToken.status) / 6) * 100)}%`
                      }}
                    />

                    {steps.map((step, idx) => {
                      const currentIdx = getStepIndex(activeToken.status);
                      const isCompleted = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;
                      const Icon = step.icon;

                      return (
                        <div key={step.label} className="flex flex-col items-center text-center relative z-10">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            } ${isCurrent ? 'ring-4 ring-emerald-200 font-bold scale-110' : ''}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-xs font-semibold mt-2 ${
                              isCurrent
                                ? 'text-emerald-800 font-extrabold'
                                : isCompleted
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tokens List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Procurement Tokens History
                </h3>
                <p className="text-xs text-slate-500">
                  Click any token to inspect weighing slips, moisture certificates, and bank UTRs
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('book')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
              >
                + Book New
              </button>
            </div>

            <div className="divide-y divide-slate-200">
              {tokens.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-bold text-slate-600">No procurement tokens booked yet</p>
                  <p className="text-xs text-slate-500 mb-4">Book your first mandi token to eliminate long queues.</p>
                  <button
                    onClick={() => setActiveSubTab('book')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Book First Token
                  </button>
                </div>
              ) : (
                tokens.map((token) => (
                  <div
                    key={token.id}
                    onClick={() => onSelectToken(token)}
                    className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-black text-slate-900">
                          {token.token_number}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                            token.status === 'PAYMENT_PROCESSED'
                              ? 'bg-green-100 text-green-900 border-green-300'
                              : token.status === 'QUALITY_CHECKED'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : token.status === 'WEIGHED'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : token.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          ● {token.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          Slot: {token.booking_date} ({token.slot_time})
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-3">
                        <span className="font-semibold text-slate-900">
                          🌾 {token.crop?.crop_name}
                        </span>
                        <span>•</span>
                        <span>Quantity: <strong className="text-slate-900">{token.estimated_quantity_qtl} QTL</strong></span>
                        <span>•</span>
                        <span>Mandi: <strong>{token.center?.center_name}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      {token.payment ? (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">DBT Payout</span>
                          <span className="font-extrabold text-sm text-emerald-700 font-mono">
                            ₹{token.payment.net_payable.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : token.weighing ? (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Weighed Net</span>
                          <span className="font-extrabold text-sm text-blue-700 font-mono">
                            {token.weighing.net_weight_qtl} QTL
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Queue Position</span>
                          <span className="font-bold text-sm text-slate-700 font-mono">
                            #{token.queue_number}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: BOOK PROCUREMENT TOKEN */}
      {activeSubTab === 'book' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <PlusCircle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Book Procurement Token & Mandi Slot
                </h2>
                <p className="text-xs text-slate-500">
                  Reserve your exact reporting time to avoid long vehicle queues at the electronic weighbridge.
                </p>
              </div>
            </div>
          </div>

          {bookingSuccessMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{bookingSuccessMsg}</span>
            </div>
          )}

          {bookingError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          <form onSubmit={handleBookSubmit} className="space-y-5">
            {/* Crop Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Crop for MSP Procurement
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {crops.map((crop) => (
                  <div
                    key={crop.id}
                    onClick={() => setBookingCropId(crop.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      bookingCropId === crop.id
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{crop.crop_name}</span>
                      <span className="font-mono text-xs font-extrabold text-emerald-800">
                        ₹{crop.msp_price}/QTL
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>Max Moisture: {crop.max_moisture_limit}%</span>
                      <span className="text-emerald-700 font-medium">{crop.season}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Nearby APMC Procurement Center
              </label>
              <select
                value={bookingCenterId}
                onChange={(e) => setBookingCenterId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.center_name} ({c.district}, {c.state}) — Available Quota:{' '}
                    {Math.max(0, c.daily_capacity - c.current_capacity)} QTL
                  </option>
                ))}
              </select>
              {selectedCenter && (
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  {selectedCenter.location} • Daily Quota: {selectedCenter.daily_capacity} QTL
                </p>
              )}
            </div>

            {/* Date & Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Procurement Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Weighbridge Time Slot
                </label>
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="07:30 AM - 09:30 AM">07:30 AM - 09:30 AM (Early Morning Slot)</option>
                  <option value="09:30 AM - 11:30 AM">09:30 AM - 11:30 AM (Recommended)</option>
                  <option value="11:30 AM - 01:30 PM">11:30 AM - 01:30 PM (Midday)</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                </select>
              </div>
            </div>

            {/* Quantity & Vehicle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Quantity (Quintals)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={bookingQuantity}
                  onChange={(e) => setBookingQuantity(e.target.value)}
                  placeholder="e.g. 75"
                  className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Registration No.
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="PB 10 BY 4921"
                  className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="Tractor Trolley">Tractor Trolley (Standard)</option>
                  <option value="Mini Truck">Mini Truck / Pickup</option>
                  <option value="Truck (6 Wheeler)">Truck (6 Wheeler)</option>
                  <option value="Bullock Cart">Bullock Cart</option>
                </select>
              </div>
            </div>

            {/* Estimated Payout Calculator Card */}
            {selectedCrop && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Estimated MSP Value:</span>
                  <span className="font-black text-emerald-800 font-mono text-base">
                    ₹{(Number(bookingQuantity || 0) * selectedCrop.msp_price).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Calculated at Govt. MSP of ₹{selectedCrop.msp_price}/qtl. Final payout will be based on certified electronic weighbridge slip.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={bookingSubmitting}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              {bookingSubmitting ? 'Generating Digital Token Slip...' : 'Confirm Slot & Generate Gate Pass'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* SUB-VIEW 3: QUALITY & MOISTURE TRANSPARENCY */}
      {activeSubTab === 'quality' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Transparent Quality & Moisture Grading Standards
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All crop lots are tested using calibrated electronic moisture meters under CCTV surveillance. No arbitrary mandi cuts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Grade A / Premium
                </div>
                <div className="text-xl font-extrabold text-emerald-700 mt-1">
                  Moisture ≤ 12.0%
                </div>
                <p className="text-xs text-emerald-800 mt-1">
                  Zero deductions. Full 100% MSP credited directly into your Aadhaar-linked bank account.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  FAQ (Fair Average Quality)
                </div>
                <div className="text-xl font-extrabold text-amber-700 mt-1">
                  12.1% - 14.0%
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Permitted with transparent Govt. refraction rate (₹25 per 0.5% moisture slab).
                </p>
              </div>

              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                <div className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  High Moisture (Hold / Dry)
                </div>
                <div className="text-xl font-extrabold text-rose-700 mt-1">
                  Above 14.5%
                </div>
                <p className="text-xs text-rose-800 mt-1">
                  Lot held for sun drying in mandi drying yard. Re-tested with same token without booking fee.
                </p>
              </div>
            </div>

            {/* Quality History on Farmer's Tokens */}
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Your Crop Lab Test Results:
            </h4>
            <div className="space-y-3">
              {tokens.filter(t => t.quality).length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No lab checks completed for your tokens yet.</p>
              ) : (
                tokens
                  .filter(t => t.quality)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {t.token_number}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {t.quality?.grain_grade}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Moisture Reading:{' '}
                          <strong className="text-slate-900 font-mono">
                            {t.quality?.moisture_percentage}%
                          </strong>{' '}
                          (Standard Ceiling: {t.quality?.max_moisture_limit}%) • Foreign Matter:{' '}
                          {t.quality?.foreign_matter_pct}%
                        </p>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{t.quality?.remarks}"
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Refraction Cut
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 font-mono">
                          ₹{t.quality?.deduction_amount_per_qtl}/QTL
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: PAYMENT & DBT TRACKER */}
      {activeSubTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Direct Benefit Transfer (DBT) Payment Tracker
                </h3>
                <p className="text-xs text-slate-500">
                  Government MSP payments are routed directly via PFMS into your linked bank account.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Total Credited So Far</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {tokens.filter(t => t.payment).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <IndianRupee className="w-8 h-8 mx-auto mb-1 opacity-40" />
                  <p className="text-xs font-semibold">No payment disbursements yet</p>
                  <p className="text-[11px] text-slate-500">Once your crop is weighed and accepted, DBT will reflect here.</p>
                </div>
              ) : (
                tokens
                  .filter(t => t.payment)
                  .map((t) => (
                    <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {t.token_number}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ● {t.payment?.payment_status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Net Weight: <strong className="text-slate-800">{t.weighing?.net_weight_qtl || t.estimated_quantity_qtl} QTL</strong> • Crop: {t.crop?.crop_name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Bank UTR: <strong className="text-slate-800">{t.payment?.utr_number || 'PFMS In Progress'}</strong> ({t.payment?.bank_name} {t.payment?.account_number_masked})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Amount</span>
                        <span className="text-lg font-black text-emerald-700 font-mono">
                          ₹{t.payment?.net_payable.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {t.payment?.credited_at ? new Date(t.payment.credited_at).toLocaleDateString() : 'Settlement in 24 hrs'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: MANDI CAPACITIES & SCHEDULE */}
      {activeSubTab === 'centers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centers.map((c) => {
            const bookedPct = Math.min(100, Math.round((c.current_capacity / c.daily_capacity) * 100));
            return (
              <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{c.center_name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {c.location}, {c.district}, {c.state}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                      c.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-semibold">Today's Mandi Capacity Utilized</span>
                    <span className="font-bold text-slate-800">
                      {c.current_capacity} / {c.daily_capacity} QTL ({bookedPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        bookedPct > 90 ? 'bg-rose-500' : bookedPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${bookedPct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Operating: <strong className="text-slate-800">{c.operating_hours}</strong></span>
                  <span>Helpline: <strong className="text-emerald-700">{c.contact_phone}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
