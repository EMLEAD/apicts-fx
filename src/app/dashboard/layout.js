'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  Menu,
  X,
  Home,
  Video,
  CreditCard,
  Wallet,
  BarChart3,
  ChevronRight,
  ClipboardList,
  BadgePercent,
  ArrowUpRight
} from 'lucide-react';
import Navbar from '@/Components/NavBar';

const dashboardNavigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Videos', href: '/dashboard/videos', icon: Video },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Transactions', href: '/dashboard/transactions', icon: BarChart3 },
];

const adminNavigationItems = [
  { name: 'Manage Plans', href: '/dashboard/admin/plans', icon: ClipboardList },
  { name: 'Manage Coupons', href: '/dashboard/admin/coupons', icon: BadgePercent },
  { name: 'Admin Transfers', href: '/dashboard/admin/transfers', icon: ArrowUpRight }
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode token to get user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.userId,
        username: payload.username,
        email: payload.email,
        role: payload.role
      });
    } catch (error) {
      console.error('Token decode error:', error);
      localStorage.removeItem('token');
      router.push('/login');
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const adminRoles = ['super_admin', 'admin', 'manager', 'support'];
  const navigationItems = adminRoles.includes(user.role)
    ? [...dashboardNavigationItems, ...adminNavigationItems]
    : dashboardNavigationItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navigation */}
      <Navbar />

      {/* Dashboard Sub Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Dashboard Title */}
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            </div>

            {/* Desktop Sub Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Sub Menu Button */}
            <button
              onClick={() => setMobileSubMenuOpen(!mobileSubMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileSubMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Sub Navigation Menu */}
        {mobileSubMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSubMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
