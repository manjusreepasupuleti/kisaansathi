import React, { useState } from 'react';
import {
  Briefcase,
  Scale,
  TestTube,
  CheckCircle2,
  AlertCircle,
  Truck,
  IndianRupee,
  Search,
  Filter,
  RefreshCw,
  QrCode,
  MapPin,
  Building2,
  Check,
  X
} from 'lucide-react';
import {
  Staff,
  ProcurementToken,
  ProcurementCenter,
  Crop,
  TokenStatus
} from '../types';
import { api } from '../services/api';

interface StaffDashboardProps {
  staff: Staff & { center?: ProcurementCenter };
  tokens: ProcurementToken[];
  crops: Crop[];
  onRefresh: () => void;
  onSelectToken: (token: ProcurementToken) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  staff,
  tokens,
  crops,
  onRefresh,
  onSelectToken
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Action Modal
  const [activeModal, setActiveModal] = useState<
    'GATE' | 'WEIGH' | 'QUALITY' | 'ACCEPT' | 'DISPATCH' | 'PAYMENT' | null
  >(null);
  const [selectedToken, setSelectedToken] = useState<ProcurementToken | null>(null);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Weighing State
  const [grossKg, setGrossKg] = useState('11500');
  const [tareKg, setTareKg] = useState('3300');

  // Quality State
  const [moisturePct, setMoisturePct] = useState('11.6');
  const [foreignMatterPct, setForeignMatterPct] = useState('0.4');
  const [damagedGrainPct, setDamagedGrainPct] = useState('0.8');
  const [customRemarks, setCustomRemarks] = useState('');
  const [minMoistureSetting, setMinMoistureSetting] = useState('10.0');

  // Dispatch State
  const [warehouseName, setWarehouseName] = useState('FCI Godown Yard-3, Khanna');
  const [truckNo, setTruckNo] = useState('PB 10 Z 9911');
  const [destination, setDestination] = useState('Central Buffer Reserve Warehouse');

  // Payment State
  const [customUtr, setCustomUtr] = useState('');

  // Center Capacity Calculations
  const center = staff.center;
  const todayTokens = tokens.filter(
    t => !center || t.center_id === center.id
  );

  const filteredTokens = todayTokens.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchToken = t.token_number.toLowerCase().includes(q);
      const matchFarmer = t.farmer?.name.toLowerCase().includes(q);
      const matchVehicle = t.vehicle_number.toLowerCase().includes(q);
      const matchMobile = t.farmer?.mobile_number.includes(q);
      return matchToken || matchFarmer || matchVehicle || matchMobile;
    }
    return true;
  });

  // Action Triggers
  const openGateModal = (token: ProcurementToken) => {
    setSelectedToken(token);
    setError(null);
    setSuccess(null);
    setActiveModal('GATE');
  };

  const openWeighModal = (token: ProcurementToken) => {
    setSelectedToken(token);
    setError(null);
    setSuccess(null);
    setGrossKg(token.weighing?.gross_weight_kg ? String(token.weighing.gross_weight_kg) : '12400');
    setTareKg(token.weighing?.tare_weight_kg ? String(token.weighing.tare_weight_kg) : '3400');
    setActiveModal('WEIGH');
  };

  const openQualityModal = (token: ProcurementToken) => {
    setSelectedToken(token);
    setError(null);
    setSuccess(null);
    const crop = crops.find(c => c.id === token.crop_id);
    const maxM = crop?.max_moisture_limit || 12.0;
    setMoisturePct(token.quality?.moisture_percentage ? String(token.quality.moisture_percentage) : String(maxM - 0.4));
    setForeignMatterPct(token.quality?.foreign_matter_pct ? String(token.quality.foreign_matter_pct) : '0.4');
    setDamagedGrainPct(token.quality?.damaged_grains_pct ? String(token.quality.damaged_grains_pct) : '0.8');
    setCustomRemarks(token.quality?.remarks || '');
    setActiveModal('QUALITY');
  };

  const openAcceptModal = (token: ProcurementToken) => {
    setSelectedToken(token);
    setError(null);
    setSuccess(null);
    setActiveModal('ACCEPT');
  };

  const openDispatchModal = (token: ProcurementToken) => {
    setSelectedToken(token);
    setError(null);
    setSuccess(null);
    setWarehouseName(`FCI Godown Yard, ${center?.district || 'Central'}`);
    setTruckNo(`PB ${Math.floor(10 + Math.random() * 80)} AB ${Math.floor(1000 + Math.random() * 9000)}`);
    setActiveModal('DISPATCH');
  };

  const openPaymentModal = (token: ProcurementToken) => {
    setSelectedToken(token);
    setError(null);
    setSuccess(null);
    setCustomUtr(`SBIN${Date.now().toString().slice(-9)}`);
    setActiveModal('PAYMENT');
  };

  // Submit Handlers
  const handleGateConfirm = async () => {
    if (!selectedToken) return;
    setSubmitting(true);
    try {
      await api.updateTokenStatus(selectedToken.id, 'GATE_ARRIVED');
      setSuccess(`Vehicle ${selectedToken.vehicle_number} arrival stamped at weighbridge gate!`);
      setTimeout(() => {
        setActiveModal(null);
        onRefresh();
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWeighSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) return;
    setSubmitting(true);
    try {
      const g = Number(grossKg);
      const t = Number(tareKg);
      if (g <= t) throw new Error('Gross weight must exceed empty vehicle tare weight');

      await api.recordWeighing({
        token_id: selectedToken.id,
        gross_weight_kg: g,
        tare_weight_kg: t,
        staff_id: staff.id,
        staff_name: staff.name
      });

      setSuccess('Weighbridge slip generated successfully!');
      setTimeout(() => {
        setActiveModal(null);
        onRefresh();
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQualitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) return;
    setSubmitting(true);
    try {
      const m = Number(moisturePct);
      if (m <= 0 || m > 40) throw new Error('Please enter a valid moisture meter reading %');

      await api.recordQualityCheck({
        token_id: selectedToken.id,
        moisture_percentage: m,
        foreign_matter_pct: Number(foreignMatterPct),
        damaged_grains_pct: Number(damagedGrainPct),
        staff_id: staff.id,
        staff_name: staff.name,
        remarks: customRemarks
      });

      setSuccess('Quality & Moisture inspection recorded!');
      setTimeout(() => {
        setActiveModal(null);
        onRefresh();
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptSubmit = async () => {
    if (!selectedToken) return;
    setSubmitting(true);
    try {
      await api.acceptProcurement(selectedToken.id);
      setSuccess('Crop lot accepted! Digital Procurement Slip and DBT payout initiated.');
      setTimeout(() => {
        setActiveModal(null);
        onRefresh();
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) return;
    setSubmitting(true);
    try {
      await api.dispatchToken({
        token_id: selectedToken.id,
        warehouse_name: warehouseName,
        truck_no: truckNo,
        destination,
        staff_id: staff.id
      });
      setSuccess('Warehouse dispatch manifest logged!');
      setTimeout(() => {
        setActiveModal(null);
        onRefresh();
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken || !selectedToken.payment) return;
    setSubmitting(true);
    try {
      await api.processPayment(selectedToken.payment.id, customUtr);
      setSuccess('DBT payment credited with bank UTR!');
      setTimeout(() => {
        setActiveModal(null);
        onRefresh();
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Center Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-800 text-emerald-200 border border-emerald-700">
                Staff Terminal • Role: {staff.role.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-slate-300 text-xs font-mono">
                Staff ID: {staff.username}
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1">
              {center?.center_name || 'APMC Procurement Terminal'}
            </h1>
            <p className="text-emerald-300 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {center?.location}, {center?.district}, {center?.state} • Capacity:{' '}
              <strong className="text-white">{center?.daily_capacity} Quintals/Day</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Queue
            </button>
          </div>
        </div>

        {/* Center Live Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block font-semibold">Tokens in Center Queue</span>
            <span className="text-xl font-black text-white">{todayTokens.length}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block font-semibold">Awaiting Weighbridge</span>
            <span className="text-xl font-black text-blue-400">
              {todayTokens.filter(t => t.status === 'GATE_ARRIVED' || t.status === 'BOOKED').length}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block font-semibold">In Moisture Lab</span>
            <span className="text-xl font-black text-purple-400">
              {todayTokens.filter(t => t.status === 'WEIGHED').length}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block font-semibold">Accepted & Procured</span>
            <span className="text-xl font-black text-emerald-400">
              {todayTokens.filter(t => t.status === 'ACCEPTED' || t.status === 'PAYMENT_PROCESSED').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Token No (e.g. KS-2026), Farmer Name, Mobile, or Vehicle..."
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-600 shrink-0">Stage:</span>
          {['ALL', 'BOOKED', 'GATE_ARRIVED', 'WEIGHED', 'QUALITY_CHECKED', 'ACCEPTED', 'PAYMENT_PROCESSED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Action Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Procurement Center Workflow Terminal
            </h3>
            <p className="text-xs text-slate-500">
              Process farmer arrivals, gross/tare weighing, electronic moisture tests, and DBT payments
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
            {filteredTokens.length} Active Records
          </span>
        </div>

        <div className="divide-y divide-slate-200 overflow-x-auto">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No tokens match current filters</p>
            </div>
          ) : (
            filteredTokens.map((token) => (
              <div
                key={token.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                {/* Token & Farmer Bio */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {token.token_number}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        token.status === 'PAYMENT_PROCESSED'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : token.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : token.status === 'QUALITY_CHECKED'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : token.status === 'WEIGHED'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : token.status === 'GATE_ARRIVED'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : token.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      ● {token.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      Slot: {token.booking_date} ({token.slot_time})
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 flex flex-wrap items-center gap-3">
                    <strong className="text-slate-900 text-sm">
                      {token.farmer?.name}
                    </strong>
                    <span>(📱 {token.farmer?.mobile_number})</span>
                    <span>•</span>
                    <span>Vehicle: <strong className="font-mono text-slate-900">{token.vehicle_number}</strong> ({token.vehicle_type})</span>
                    <span>•</span>
                    <span>Crop: <strong className="text-emerald-800">{token.crop?.crop_name}</strong></span>
                    <span>•</span>
                    <span>Est: <strong>{token.estimated_quantity_qtl} QTL</strong></span>
                  </div>

                  {/* Operational Summary Pill */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {token.weighing ? (
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-mono">
                        ⚖️ Gross: {token.weighing.gross_weight_kg}kg | Tare: {token.weighing.tare_weight_kg}kg | Net: {token.weighing.net_weight_qtl} QTL
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Weighbridge pending</span>
                    )}

                    {token.quality ? (
                      <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200 font-mono">
                        🔬 Moisture: {token.quality.moisture_percentage}% ({token.quality.grain_grade})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Moisture lab pending</span>
                    )}

                    {token.payment && (
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-mono font-bold">
                        💳 DBT: ₹{token.payment.net_payable.toLocaleString('en-IN')} ({token.payment.payment_status})
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons based on stage */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-0 border-slate-100">
                  <button
                    onClick={() => onSelectToken(token)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="View Full Slip"
                  >
                    <QrCode className="w-4 h-4" />
                    Slip
                  </button>

                  {/* 1. Gate Arrival Stamp */}
                  {token.status === 'BOOKED' && (
                    <button
                      onClick={() => openGateModal(token)}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Log Gate Arrival
                    </button>
                  )}

                  {/* 2. Weighbridge Action */}
                  {(token.status === 'GATE_ARRIVED' || token.status === 'BOOKED') && (
                    <button
                      onClick={() => openWeighModal(token)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      Record Weighing
                    </button>
                  )}

                  {/* 3. Quality Lab Action */}
                  {(token.status === 'WEIGHED' || token.status === 'QUALITY_CHECKED') && (
                    <button
                      onClick={() => openQualityModal(token)}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <TestTube className="w-3.5 h-3.5" />
                      {token.quality ? 'Update Quality' : 'Moisture & Grade'}
                    </button>
                  )}

                  {/* 4. Accept Procurement */}
                  {token.status === 'QUALITY_CHECKED' && (
                    <button
                      onClick={() => openAcceptModal(token)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Issue Acceptance Slip
                    </button>
                  )}

                  {/* 5. Dispatch to Warehouse */}
                  {token.status === 'ACCEPTED' && (
                    <button
                      onClick={() => openDispatchModal(token)}
                      className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Godown Dispatch
                    </button>
                  )}

                  {/* 6. Process / Verify Payment */}
                  {(token.status === 'ACCEPTED' || token.status === 'DISPATCHED') && (
                    <button
                      onClick={() => openPaymentModal(token)}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      Settle DBT UTR
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: GATE ARRIVAL */}
      {/* ========================================================================= */}
      {activeModal === 'GATE' && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                Gate Entry Verification
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">{error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">{success}</div>}

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Token Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedToken.token_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Farmer:</span>
                <span className="font-bold text-slate-900">{selectedToken.farmer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle No:</span>
                <span className="font-mono font-bold text-emerald-800">{selectedToken.vehicle_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Slot:</span>
                <span className="font-semibold text-slate-800">{selectedToken.booking_date} ({selectedToken.slot_time})</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Confirm vehicle has entered the mandi yard and is queued for electronic weighbridge.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleGateConfirm}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {submitting ? 'Stamping...' : 'Confirm Gate Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: WEIGHBRIDGE (GROSS & TARE) */}
      {/* ========================================================================= */}
      {activeModal === 'WEIGH' && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Electronic Weighbridge Scale Entry
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">{error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">{success}</div>}

            <div className="text-xs text-slate-600 font-medium">
              Token #{selectedToken.token_number} • Vehicle: <span className="font-mono font-bold text-slate-900">{selectedToken.vehicle_number}</span>
            </div>

            <form onSubmit={handleWeighSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Gross Weight (Vehicle + Crop Loaded in KG)
                </label>
                <input
                  type="number"
                  required
                  value={grossKg}
                  onChange={(e) => setGrossKg(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tare Weight (Vehicle Empty Weight in KG)
                </label>
                <input
                  type="number"
                  required
                  value={tareKg}
                  onChange={(e) => setTareKg(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Automatic Net Calculation */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold">Net Crop Weight:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {Math.max(0, Number(grossKg || 0) - Number(tareKg || 0))} KG
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1 pt-1 border-t border-blue-200/60">
                  <span className="text-blue-900 font-extrabold">Net Procurement Weight:</span>
                  <span className="font-mono font-black text-blue-900 text-base">
                    {(Math.max(0, Number(grossKg || 0) - Number(tareKg || 0)) / 100).toFixed(2)} Quintals
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? 'Generating Slip...' : 'Save & Print Weigh Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUALITY & MOISTURE TESTING LAB */}
      {/* ========================================================================= */}
      {activeModal === 'QUALITY' && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <TestTube className="w-5 h-5 text-purple-600" />
                Electronic Moisture Meter & Quality Check
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">{error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">{success}</div>}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between">
              <div>
                <span className="text-slate-500 block">Crop Testing</span>
                <span className="font-bold text-slate-900">{selectedToken.crop?.crop_name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Permissible Max Moisture</span>
                <span className="font-bold text-purple-900 font-mono text-sm">
                  {selectedToken.crop?.max_moisture_limit || 12.0}%
                </span>
              </div>
            </div>

            <form onSubmit={handleQualitySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Moisture Reading (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="35"
                    required
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Standard: ≤ {selectedToken.crop?.max_moisture_limit}%</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Foreign Matter (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={foreignMatterPct}
                    onChange={(e) => setForeignMatterPct(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Tolerance: ≤ 0.75%</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Damaged / Shrivelled Grains (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  value={damagedGrainPct}
                  onChange={(e) => setDamagedGrainPct(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Inspector Remarks / Lab Certificate Notes
                </label>
                <input
                  type="text"
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  placeholder="e.g. Grain dry, uniform golden color, zero fungal infestation."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Dynamic preview evaluation */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Calculated Evaluation:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    Number(moisturePct) <= (selectedToken.crop?.max_moisture_limit || 12.0)
                      ? 'bg-emerald-100 text-emerald-800'
                      : Number(moisturePct) <= (selectedToken.crop?.max_moisture_limit || 12.0) + 2.0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {Number(moisturePct) <= (selectedToken.crop?.max_moisture_limit || 12.0)
                      ? 'Grade A (100% Payout)'
                      : Number(moisturePct) <= (selectedToken.crop?.max_moisture_limit || 12.0) + 2.0
                      ? 'FAQ (Fair Average Quality)'
                      : 'Undergrade / High Moisture'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? 'Recording...' : 'Submit Quality Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ACCEPT PROCUREMENT */}
      {/* ========================================================================= */}
      {activeModal === 'ACCEPT' && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Issue Procurement Acceptance Slip
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">{error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">{success}</div>}

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                You are approving official Mandi procurement for:
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Farmer:</span>
                  <span>{selectedToken.farmer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Quintals:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedToken.weighing?.net_weight_qtl || selectedToken.estimated_quantity_qtl} QTL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Govt MSP Rate:</span>
                  <span className="font-mono font-bold text-emerald-800">₹{selectedToken.crop?.msp_price}/QTL</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200">
                  <span className="font-bold text-slate-800">Net Payable via DBT:</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">
                    ₹{((selectedToken.weighing?.net_weight_qtl || selectedToken.estimated_quantity_qtl) * (selectedToken.crop?.msp_price || 2275)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleAcceptSubmit}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                {submitting ? 'Approving...' : 'Approve & Trigger DBT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: GODOWN DISPATCH */}
      {/* ========================================================================= */}
      {activeModal === 'DISPATCH' && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                Dispatch to Warehouse / Storage Godown
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">{error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">{success}</div>}

            <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Destination Godown / Central Warehouse
                </label>
                <input
                  type="text"
                  required
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Outbound Heavy Transport Truck No.
                </label>
                <input
                  type="text"
                  required
                  value={truckNo}
                  onChange={(e) => setTruckNo(e.target.value)}
                  className="w-full px-3 py-2 font-mono font-bold uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Storage Facility / Rail Head
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? 'Dispatching...' : 'Log Outbound Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: SETTLE PAYMENT & ASSIGN UTR */}
      {/* ========================================================================= */}
      {activeModal === 'PAYMENT' && selectedToken && selectedToken.payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                Direct Benefit Transfer (DBT) Settlement
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">{error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">{success}</div>}

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Beneficiary Farmer:</span>
                <span className="font-bold text-slate-900">{selectedToken.farmer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Bank Account:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedToken.payment.bank_name} ({selectedToken.payment.account_number_masked})
                </span>
              </div>
              <div className="flex justify-between font-bold text-emerald-900 pt-1 border-t border-emerald-200">
                <span>Total Amount:</span>
                <span className="font-mono text-base font-black">
                  ₹{selectedToken.payment.net_payable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank UTR / PFMS Transaction Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={customUtr}
                  onChange={(e) => setCustomUtr(e.target.value)}
                  className="w-full px-3 py-2 font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? 'Crediting...' : 'Confirm DBT Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
