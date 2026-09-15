import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Scale,
  Shield,
  Search,
  ArrowRight,
  Clock,
  TrendingUp,
  CheckCircle2,
  QrCode,
  Truck,
  IndianRupee,
  FlaskConical,
  Building2,
  Smartphone,
  ChevronRight,
  Users,
  Award,
  Sparkles
} from 'lucide-react';
import { ProcurementToken, ProcurementStats, UserRole } from '../types';

interface HeroPageProps {
  stats: ProcurementStats;
  sampleTokens: ProcurementToken[];
  onNavigateRole: (role: UserRole) => void;
  onVerifyToken: (tokenNumber: string) => void;
  onOpenLogin: (initialRole?: UserRole) => void;
}

export const HeroPage: React.FC<HeroPageProps> = ({
  stats,
  sampleTokens,
  onNavigateRole,
  onVerifyToken,
  onOpenLogin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  const steps = [
    {
      step: 1,
      title: 'Slot Booking & Token',
      icon: Smartphone,
      badge: 'Step 1: Online / Assisted',
      desc: 'Farmers reserve a dedicated 2-hour mandi arrival slot via mobile. Generates an instant digital token with scannable QR gate pass.',
      highlight: 'Zero overnight yard queueing'
    },
    {
      step: 2,
      title: 'Mandi Gate Entry',
      icon: QrCode,
      badge: 'Step 2: Instant QR Scan',
      desc: 'Gate security scans the QR code on tractor/trolley arrival. Validates booking slot time, vehicle registration, and permits yard entry.',
      highlight: 'Under 45 seconds gate clearance'
    },
    {
      step: 3,
      title: 'Electronic Weighbridge',
      icon: Scale,
      badge: 'Step 3: Digital Load Cell',
      desc: 'Automatic gross weight logging on entry, tare weight on exit. System calculates exact net quintals with zero manual data alteration.',
      highlight: 'Tamper-proof digital weight receipt'
    },
    {
      step: 4,
      title: 'Moisture & Lab Inspection',
      icon: FlaskConical,
      badge: 'Step 4: Quality Standard',
      desc: 'Certified quality inspector tests grain moisture using calibrated digital meters. Enforces Govt. tolerance slabs (e.g. 12% - 14% FAQ standard).',
      highlight: 'Automated transparent deduction slabs'
    },
    {
      step: 5,
      title: 'Procurement Slip (J-Form)',
      icon: CheckCircle2,
      badge: 'Step 5: Mandi Lot Accepted',
      desc: 'Mandi center accepts the lot. Generates official digital J-Form with guaranteed Govt. MSP price calculation and net payable amount.',
      highlight: 'Legally certified MSP guarantee'
    },
    {
      step: 6,
      title: 'Warehouse Truck Dispatch',
      icon: Truck,
      badge: 'Step 6: Storage Transit',
      desc: 'Accepted grain bags loaded onto FCI / State Warehousing Corporation trucks with unique manifest and destination godown tracking.',
      highlight: 'Continuous supply chain visibility'
    },
    {
      step: 7,
      title: 'Direct DBT Bank Credit',
      icon: IndianRupee,
      badge: 'Step 7: Instant Payment',
      desc: 'Direct Benefit Transfer (DBT) directly credited to farmer Aadhaar-linked bank account with real-time SMS and RBI bank UTR confirmation.',
      highlight: '100% full amount, zero middlemen cuts'
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onVerifyToken(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-emerald-800/60">
        {/* Subtle Decorative Ambient Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SIH 2026 Smart APMC Procurement & Crop Tracking Platform</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-balance"
          >
            Empowering Farmers with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 via-emerald-200 to-amber-200">
              Transparent & Direct
            </span>{' '}
            Grain Procurement
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Eliminate long mandi waiting queues, middleman commissions, and manual weighing errors.
            Book arrival slots, monitor electronic weighbridges in real time, and receive direct DBT bank credits.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <button
              onClick={() => onNavigateRole('farmer')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Sprout className="w-4 h-4 text-emerald-950" />
              Farmer Portal
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateRole('staff')}
              className="px-6 py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 shadow-md transition-all flex items-center gap-2"
            >
              <Scale className="w-4 h-4 text-emerald-400" />
              Mandi Weighbridge Terminal
            </button>

            <button
              onClick={() => onNavigateRole('admin')}
              className="px-5 py-3 bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-bold text-sm rounded-xl border border-purple-800/60 shadow-md transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-purple-300" />
              Admin Directorate
            </button>
          </motion.div>

          {/* Quick Token Lookup Ribbon inside Hero */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6 max-w-xl mx-auto"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="bg-slate-900/90 p-2 rounded-2xl border border-emerald-600/40 shadow-xl flex items-center gap-2"
            >
              <div className="pl-3 text-emerald-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Token (e.g. KS-2026-PB-101 or Vehicle No)..."
                className="flex-1 bg-transparent text-white placeholder:text-slate-400 text-xs sm:text-sm font-mono outline-none px-2"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0"
              >
                Track Slip
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-400">
              <span className="text-[11px]">Quick Try:</span>
              {sampleTokens.slice(0, 3).map((token) => (
                <button
                  key={token.id}
                  onClick={() => onVerifyToken(token.token_number)}
                  className="px-2 py-0.5 rounded-md bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 font-mono text-[11px] border border-emerald-800 transition-colors"
                >
                  {token.token_number}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. REAL-TIME IMPACT STATS BAR */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">DBT Disbursed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ₹{(stats.total_dbt_disbursed / 100000).toFixed(2)} Lakh
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              100% Direct Bank Transfer
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Total Procured</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stats.total_procured_qtl.toLocaleString()} QTL
            </div>
            <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
              Electronic Load Cell Accuracy
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Mandi Turnaround</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stats.average_waiting_time_mins} Mins
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
              Down from 8+ hours wait
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Moisture Pass Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stats.quality_pass_rate_pct}%
            </div>
            <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
              Govt. Standard FAQ Compliant
            </p>
          </div>
        </motion.div>
      </section>

      {/* 3. THREE PRIMARY ROLE PORTALS (UNCOMPLICATED & CLEAR) */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Select Your Role & Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Choose your persona below to access tailored tools, real-time queues, and digital slips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Farmer */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-emerald-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shadow-inner">
                🌾
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  For Farmers
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  Farmer Portal
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Book your mandi slot in 60 seconds, check transparent weighing records, view moisture analysis, and track DBT payment credits.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant slot booking & QR Gate Pass</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Live 7-stage procurement tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Transparent bank UTR receipt</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 relative z-10 space-y-2">
              <button
                onClick={() => onNavigateRole('farmer')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Enter Farmer Portal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-between text-[11px] px-1 text-emerald-800">
                <button
                  onClick={() => onOpenLogin('farmer')}
                  className="hover:underline font-semibold"
                >
                  Existing Login
                </button>
                <span className="text-emerald-300">•</span>
                <button
                  onClick={() => onOpenLogin('farmer')}
                  className="hover:underline font-semibold"
                >
                  New Farmer Registration →
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Mandi Staff */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-blue-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl shadow-inner">
                ⚖️
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  APMC Mandi Officers
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  Staff Weighbridge Terminal
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Log electronic weighbridge gross and tare weights, enter moisture lab readings, generate official J-Forms, and dispatch godown trucks.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Electronic weighbridge automation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Moisture tolerance deduction calculator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Warehouse truck manifest dispatch</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 relative z-10 space-y-2">
              <button
                onClick={() => onNavigateRole('staff')}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Enter Staff Terminal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="text-center text-[11px] text-blue-700">
                <span>Credentials assigned by Mandi Administrator</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Admin Directorate */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl shadow-inner">
                🏛️
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Government Directorate
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  Admin & Governance
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Monitor all active mandis across the state, update MSP price benchmarks, create staff credentials, and export audit reports.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Create & Manage Staff Credentials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Strong password & Biometric login</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Govt MSP & moisture tolerance calibration</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 relative z-10 space-y-2">
              <button
                onClick={() => onNavigateRole('admin')}
                className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Enter Admin Directorate</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-between text-[11px] px-1 text-purple-800">
                <button
                  onClick={() => onOpenLogin('admin')}
                  className="hover:underline font-semibold"
                >
                  Directorate Login
                </button>
                <span className="text-purple-300">•</span>
                <button
                  onClick={() => onOpenLogin('admin')}
                  className="hover:underline font-semibold"
                >
                  New Mandi Setup →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. INTERACTIVE 7-STAGE PROCUREMENT JOURNEY */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              End-to-End Digital Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              7-Stage Transparent Procurement Journey
            </h2>
            <p className="text-xs text-slate-400">
              Click on any stage below to inspect how electronic safeguards protect farmers from exploitation.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 self-start">
            Stage {selectedStepIndex + 1} of 7 Selected
          </div>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isSelected = selectedStepIndex === index;
            return (
              <button
                key={s.step}
                onClick={() => setSelectedStepIndex(index)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-700/80 text-emerald-300">
                    0{s.step}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-slate-500'}`} />
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-1">
                  {s.title}
                </div>
                {isSelected && (
                  <motion.div
                    layoutId="step-indicator"
                    className="absolute -bottom-1 left-2 right-2 h-0.5 bg-emerald-400 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Step Details Spotlight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                {steps[selectedStepIndex].badge}
              </span>
              <h3 className="text-xl font-black text-white">
                {steps[selectedStepIndex].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {steps[selectedStepIndex].desc}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs shrink-0 max-w-xs w-full space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Key Guarantee</span>
              <div className="font-bold flex items-center gap-1.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {steps[selectedStepIndex].highlight}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 5. WHY KISAANSATHI (KEY SAFEGUARDS) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Why KisaanSathi Solves Mandi Bottlenecks
          </h2>
          <p className="text-xs text-slate-500">
            Engineered specifically to eliminate ground-level leakages identified by the Ministry of Agriculture.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              ⚖️
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Automated Electronic Weighing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Load cells interface directly with the server. Operators cannot manually overwrite or tamper with gross and tare values.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg">
              🧪
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Transparent Moisture Refraction</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fixed Government rules calculate price deductions transparently if moisture exceeds the 12% baseline.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
              💳
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Direct Bank Credit (DBT)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Funds are transferred directly via PFMS/DBT to the farmer's registered bank account with an auditable bank UTR reference.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              📱
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Real-time SMS & In-App Alerts</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Farmers receive automated alerts as their trolley clears gate entry, weighing, inspection, and payment dispatch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
