'use client';

import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, Megaphone } from 'lucide-react';

const typeConfig = {
  info: { icon: Info, accent: 'border-blue-500', iconBg: 'bg-blue-100', iconText: 'text-blue-600', btnBg: 'bg-blue-600 hover:bg-blue-700' },
  warning: { icon: AlertTriangle, accent: 'border-yellow-500', iconBg: 'bg-yellow-100', iconText: 'text-yellow-600', btnBg: 'bg-yellow-600 hover:bg-yellow-700' },
  announcement: { icon: Megaphone, accent: 'border-red-500', iconBg: 'bg-red-100', iconText: 'text-red-600', btnBg: 'bg-red-600 hover:bg-red-700' }
};

const STORAGE_KEY = 'dismissed_notifications';

function getDismissed() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDismissed(id) {
  const dismissed = getDismissed();
  if (!dismissed.includes(id)) {
    dismissed.push(id);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
  }
}

export default function NotificationPopup() {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        const dismissed = getDismissed();
        const active = (data.notifications || []).filter(n => !dismissed.includes(n.id));
        if (active.length > 0) {
          setNotification(active[0]);
          setTimeout(() => setVisible(true), 800);
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    if (notification) saveDismissed(notification.id);
    setVisible(false);
  };

  if (!notification || !visible) return null;

  const cfg = typeConfig[notification.type] || typeConfig.info;
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`bg-white rounded-2xl max-w-lg w-full shadow-2xl border-t-4 ${cfg.accent} transform transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${cfg.iconBg}`}>
              <Icon className={`h-5 w-5 ${cfg.iconText}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {notification.imageUrl && (
            <img
              src={notification.imageUrl}
              alt=""
              className="w-full rounded-lg mb-4 max-h-60 object-cover border border-gray-100"
            />
          )}
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{notification.message}</p>
        </div>

        <div className="flex items-center justify-end p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3">
            {notification.targetUrl && (
              <a
                href={notification.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${cfg.btnBg}`}
              >
                Learn More
              </a>
            )}
            <button
              onClick={dismiss}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
