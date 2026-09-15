import React, { useState } from 'react';
import {
  Sprout,
  Bell,
  User,
  Shield,
  Briefcase,
  LogOut,
  Database,
  Menu,
  X,
  Home,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole, Notification } from '../types';

interface NavbarProps {
  currentRole: UserRole | null;
  currentView?: 'hero' | 'dashboard';
  currentUser?: any;
  notifications?: Notification[];
  unreadCount?: number;
  notificationsCount?: number;
  farmerName?: string;
  staffName?: string;
  adminName?: string;
  onOpenNotifications: () => void;
  onOpenLogin: (initialRole?: UserRole) => void;
  onLogout?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onRoleChange?: (role: UserRole) => void;
  onNavigateHome?: () => void;
  isSupabaseConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentView = 'dashboard',
  currentUser,
  notifications = [],
  unreadCount,
  notificationsCount,
  farmerName,
  staffName,
  adminName,
  onOpenNotifications,
  onOpenLogin,
  onLogout,
  onSwitchRole,
  onRoleChange,
  onNavigateHome,
  isSupabaseConnected = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    if (typeof onSwitchRole === 'function') {
      onSwitchRole(role);
    } else if (typeof onRoleChange === 'function') {
      onRoleChange(role);
    }
  };

  const totalUnread = unreadCount ?? notificationsCount ?? notifications.filter(n => !n.is_read).length;

  const activeUser = currentUser || (
    currentRole === 'farmer' && farmerName ? { name: farmerName, subtitle: 'Punjab' } :
    currentRole === 'staff' && staffName ? { name: staffName, subtitle: 'Mandi Officer' } :
    currentRole === 'admin' && adminName ? { name: adminName, subtitle: 'Directorate' } : null
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Home Navigation */}
          <button
            onClick={onNavigateHome}
            className="flex items-center space-x-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-white flex items-center">
                  Kisaan<span className="text-emerald-400">Sathi</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Smart APMC
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                Transparent Procurement & Real-time Tracking
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links (Uncomplicated & Clean) */}
          <nav className="hidden md:flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={onNavigateHome}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'hero'
                  ? 'bg-emerald-500 text-emerald-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => handleRoleSelect('farmer')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'dashboard' && currentRole === 'farmer'
                  ? 'bg-emerald-500 text-emerald-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Farmer Portal</span>
            </button>

            <button
              onClick={() => handleRoleSelect('staff')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'dashboard' && currentRole === 'staff'
                  ? 'bg-blue-500 text-blue-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Mandi Terminal</span>
            </button>

            <button
              onClick={() => handleRoleSelect('admin')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'dashboard' && currentRole === 'admin'
                  ? 'bg-purple-500 text-purple-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Directorate</span>
            </button>
          </nav>

          {/* Right Controls: Notifications & User */}
          <div className="flex items-center space-x-2.5">
            {/* Live Indicator */}
            <div
              title={isSupabaseConnected ? 'Supabase Cloud Database Active' : 'Persistent Storage Active'}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-300"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live System</span>
            </div>

            {/* Notification Bell */}
            <button
              id="notifications-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {totalUnread > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-extrabold text-white bg-rose-500 rounded-full border-2 border-slate-950">
                  {totalUnread}
                </span>
              )}
            </button>

            {/* User Session Profile / Sign In */}
            {activeUser ? (
              <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-xl pl-3 pr-1.5 py-1">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    {activeUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-400 capitalize">
                    {activeUser.subtitle || currentRole}
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Sign out of current role"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenLogin()}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors shadow-xs"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-2 text-xs"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Navigate Workspace:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-left rounded-xl font-bold flex items-center justify-between ${
                currentView === 'hero' ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-800 text-white'
              }`}
            >
              <span>🏠 Home Overview</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                handleRoleSelect('farmer');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-left rounded-xl font-bold flex items-center justify-between ${
                currentView === 'dashboard' && currentRole === 'farmer'
                  ? 'bg-emerald-500 text-emerald-950'
                  : 'bg-slate-800 text-white'
              }`}
            >
              <span>🌾 Farmer Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                handleRoleSelect('staff');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-left rounded-xl font-bold flex items-center justify-between ${
                currentView === 'dashboard' && currentRole === 'staff'
                  ? 'bg-blue-500 text-blue-950'
                  : 'bg-slate-800 text-white'
              }`}
            >
              <span>⚖️ Mandi Terminal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                handleRoleSelect('admin');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-left rounded-xl font-bold flex items-center justify-between ${
                currentView === 'dashboard' && currentRole === 'admin'
                  ? 'bg-purple-500 text-purple-950'
                  : 'bg-slate-800 text-white'
              }`}
            >
              <span>🏛️ Admin Governance</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
};
