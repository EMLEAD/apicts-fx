'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Video, 
  BarChart3, 
  Shield, 
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  ClipboardList,
  BadgePercent,
  ArrowUpRight
} from 'lucide-react';

const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'support'];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      
      // Check if user is admin
      if (!ADMIN_ROLES.includes(userObj.role)) {
        router.push('/admin-login');
      }
    } else {
      router.push('/admin-login');
    }
  }, [router]);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Transactions', href: '/admin/transactions', icon: TrendingUp },
    { name: 'Exchange Rates', href: '/admin/rates', icon: DollarSign },
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
    { name: 'Vlog Posts', href: '/admin/vlog', icon: Video },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Security', href: '/admin/security', icon: Shield },
    { name: 'Plans', href: '/admin/plans', icon: ClipboardList },
    { name: 'Coupons', href: '/admin/coupons', icon: BadgePercent },
    { name: 'Transfers', href: '/admin/transfers', icon: ArrowUpRight },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/admin-login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            {sidebarOpen && <span className="text-white font-bold text-xl">APICTS</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{user.username}</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

