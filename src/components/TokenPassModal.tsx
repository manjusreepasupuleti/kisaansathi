import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, CheckCircle2, AlertCircle, Clock, MapPin, Truck, Scale, TestTube, IndianRupee } from 'lucide-react';
import { ProcurementToken } from '../types';

interface TokenPassModalProps {
  token: ProcurementToken | null;
  onClose: () => void;
}

export const TokenPassModal: React.FC<TokenPassModalProps> = ({ token, onClose }) => {
  if (!token) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: ProcurementToken['status']) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GATE_ARRIVED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'WEIGHED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'QUALITY_CHECKED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DISPATCHED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'PAYMENT_PROCESSED':
        return 'bg-green-100 text-green-900 border-green-300 font-bold';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Top Control Bar */}
        <div className="bg-emerald-950 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌱</span>
            <span className="font-bold text-sm tracking-wide">
              Official Procurement Gate Pass & Tracking Slip
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Pass Container */}
        <div id="printable-token-slip" className="p-6 bg-white">
          {/* Slip Header */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
              Department of Food, Civil Supplies & Consumer Affairs
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              KisaanSathi Smart Procurement Pass
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              National MSP Procurement Scheme (Rabi/Kharif 2025-26)
            </p>
          </div>

          {/* Token & QR Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 mb-5">
            <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-emerald-200 shadow-xs">
              <QRCodeSVG
                value={`KISAANSATHI:${token.token_number}:${token.farmer_id}:${token.crop_id}`}
                size={96}
                level="M"
              />
              <span className="text-[10px] font-mono text-slate-500 mt-1">Scan at Gate</span>
            </div>
            <div className="sm:col-span-2 space-y-1 text-center sm:text-left">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Digital Token Number
              </div>
              <div className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                {token.token_number}
              </div>
              <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusColor(token.status)}`}>
                  ● {token.status.replace('_', ' ')}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  Queue Position: #{token.queue_number}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs mb-5">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Farmer Name</span>
              <span className="font-bold text-slate-900 text-sm">{token.farmer?.name || 'Gurpreet Singh'}</span>
              <span className="text-slate-600 block text-[11px] mt-0.5">
                📱 {token.farmer?.mobile_number || '9876543210'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Farmer Location</span>
              <span className="font-bold text-slate-900">
                Village: {token.farmer?.village || 'Payal'}
              </span>
              <span className="text-slate-600 block text-[11px] mt-0.5">
                {token.farmer?.district}, {token.farmer?.state}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Crop & Quantity</span>
              <span className="font-bold text-emerald-800 text-sm">
                {token.crop?.crop_name || 'Wheat'}
              </span>
              <span className="text-slate-700 block font-semibold text-[11px] mt-0.5">
                Est. Quantity: <span className="font-bold">{token.estimated_quantity_qtl} Quintals</span>
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">MSP Rate Guaranteed</span>
              <span className="font-bold text-slate-900 text-sm">
                ₹{token.crop?.msp_price?.toLocaleString('en-IN') || '2,275'} / Quintal
              </span>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                Max Moisture Limit: {token.crop?.max_moisture_limit || 12.0}%
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Reporting Center (Mandi)</span>
              <span className="font-bold text-slate-900">
                {token.center?.center_name || 'Khanna Grain Mandi'}
              </span>
              <span className="text-slate-500 block text-[11px] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {token.center?.location}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Allocated Slot & Vehicle</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {token.booking_date} | {token.slot_time}
              </span>
              <span className="text-slate-700 block text-[11px] mt-0.5 font-mono">
                🚜 {token.vehicle_number} ({token.vehicle_type})
              </span>
            </div>
          </div>

          {/* Weighbridge Slip Section if Available */}
          {token.weighing && (
            <div className="mb-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
                  <Scale className="w-4 h-4 text-blue-700" />
                  Weighbridge Certificate Slip: {token.weighing.scale_slip_no}
                </div>
                <span className="text-[10px] text-blue-700 font-mono">
                  {new Date(token.weighing.weighed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1.5 bg-white rounded border border-blue-100">
                  <span className="text-[10px] text-slate-500 block">Gross Weight</span>
                  <span className="font-bold font-mono">{token.weighing.gross_weight_kg} kg</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-blue-100">
                  <span className="text-[10px] text-slate-500 block">Tare Weight</span>
                  <span className="font-bold font-mono">{token.weighing.tare_weight_kg} kg</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-blue-200">
                  <span className="text-[10px] text-blue-700 font-bold block">Net Quintals</span>
                  <span className="font-extrabold font-mono text-blue-900 text-sm">
                    {token.weighing.net_weight_qtl} QTL
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quality Check Section if Available */}
          {token.quality && (
            <div className="mb-4 p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-950 text-xs">
                  <TestTube className="w-4 h-4 text-purple-700" />
                  Quality & Moisture Laboratory Report
                </div>
                <span className="px-2 py-0.5 bg-purple-200 text-purple-900 text-[10px] font-bold rounded-full">
                  {token.quality.grain_grade}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1.5 bg-white rounded border border-purple-100">
                  <span className="text-[10px] text-slate-500 block">Moisture Meter</span>
                  <span className="font-bold font-mono text-purple-900">
                    {token.quality.moisture_percentage}%
                  </span>
                </div>
                <div className="p-1.5 bg-white rounded border border-purple-100">
                  <span className="text-[10px] text-slate-500 block">Foreign Matter</span>
                  <span className="font-bold font-mono">{token.quality.foreign_matter_pct}%</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-purple-100">
                  <span className="text-[10px] text-slate-500 block">Deduction</span>
                  <span className="font-bold font-mono text-rose-700">
                    ₹{token.quality.deduction_amount_per_qtl}/QTL
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 italic bg-white p-1.5 rounded border border-purple-100">
                "{token.quality.remarks}"
              </p>
            </div>
          )}

          {/* Payment & DBT UTR Section if Available */}
          {token.payment && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                  <IndianRupee className="w-4 h-4 text-emerald-700" />
                  Direct Benefit Transfer (DBT) Payment Status
                </div>
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                  {token.payment.payment_status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">Net Bank Transfer</span>
                  <span className="text-base font-extrabold text-emerald-800">
                    ₹{token.payment.net_payable.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Bank & UTR Reference</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {token.payment.utr_number || 'Initiated'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {token.payment.bank_name} ({token.payment.account_number_masked})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="text-center pt-4 border-t border-slate-200 text-[10px] text-slate-500 mt-4">
            Show this pass along with your original Aadhaar and RC book at the Mandi electronic weighbridge gate.
          </div>
        </div>
      </div>
    </div>
  );
};
