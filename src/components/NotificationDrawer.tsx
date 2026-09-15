import React from 'react';
import { X, Bell, CheckCheck, IndianRupee, Scale, TestTube, CheckCircle2, Clock } from 'lucide-react';
import { Notification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead?: () => void;
  onMarkAllAsRead?: () => void;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkAllAsRead,
  onMarkAsRead
}) => {
  if (!isOpen) return null;

  const handleMarkAll = () => {
    if (typeof onMarkAllAsRead === 'function') {
      onMarkAllAsRead();
    } else if (typeof onMarkAllRead === 'function') {
      onMarkAllRead();
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return <IndianRupee className="w-5 h-5 text-emerald-600" />;
      case 'weighing':
        return <Scale className="w-5 h-5 text-blue-600" />;
      case 'quality':
        return <TestTube className="w-5 h-5 text-amber-600" />;
      case 'token':
        return <CheckCircle2 className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base">SMS & Live Alerts</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAll}
                className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 bg-emerald-900/60 px-2 py-1 rounded"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-1 text-emerald-400 hover:text-white rounded hover:bg-emerald-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No alerts right now</p>
                <p className="text-xs text-slate-500">Status updates and DBT payment alerts will arrive here</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !notif.is_read
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">
                          {notif.title}
                        </h4>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-2 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
