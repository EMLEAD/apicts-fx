'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, UserCheck, Eye, CheckCircle, XCircle, UserPlus, FileX, Clock } from 'lucide-react';

export default function SecurityDashboard() {
  const [securityData, setSecurityData] = useState({
    verifiedUsers: 0,
    unverifiedUsers: 0,
    suspiciousActivity: 0,
    totalLogins: 0,
    failedLogins: 0
  });
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);

  useEffect(() => {
    fetchSecurityData(1, 1);
  }, []);

  const fetchSecurityData = async (uPage, aPage) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/security?usersPage=${uPage}&activityPage=${aPage}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const unverifiedList = Array.isArray(data.unverifiedUsers) ? data.unverifiedUsers : [];
      setSecurityData({
        verifiedUsers: data.verifiedUsers ?? 0,
        unverifiedUsers: data.unverifiedUsersCount ?? unverifiedList.length ?? 0,
        suspiciousActivity: data.suspiciousActivity ?? 0,
        totalLogins: data.totalLogins ?? 0,
        failedLogins: data.failedLogins ?? 0
      });
      setSuspiciousActivities(data.recentActivity || []);
      setUnverifiedUsers(unverifiedList);
      setUsersPage(data.usersPage || uPage);
      setUsersTotalPages(data.usersTotalPages || 1);
      setActivityPage(data.activityPage || aPage);
      setActivityTotalPages(data.activityTotalPages || 1);
    } catch (error) {
      console.error('Error fetching security data:', error);
    }
  };

  const verifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchSecurityData(usersPage, activityPage);
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Security & Verification</h1>
        <p className="text-gray-600 mt-2">Monitor security and verify users</p>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Users</p>
              <p className="text-2xl font-bold text-gray-900">{securityData.verifiedUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unverified Users</p>
              <p className="text-2xl font-bold text-gray-900">{securityData.unverifiedUsers}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
              <p className="text-2xl font-bold text-gray-900">{securityData.suspiciousActivity}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logins</p>
              <p className="text-2xl font-bold text-gray-900">{securityData.totalLogins}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Logins</p>
              <p className="text-2xl font-bold text-gray-900">{securityData.failedLogins}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <XCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Unverified Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Unverified Users</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {unverifiedUsers.length > 0 ? (
              unverifiedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => verifyUser(user.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Verify User</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">All users are verified</p>
            )}
          </div>
          {usersTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => { const p = usersPage - 1; setUsersPage(p); fetchSecurityData(p, activityPage); }} disabled={usersPage <= 1} className="text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed">Previous</button>
              <span className="text-sm text-gray-500">Page {usersPage} of {usersTotalPages}</span>
              <button onClick={() => { const p = usersPage + 1; setUsersPage(p); fetchSecurityData(p, activityPage); }} disabled={usersPage >= usersTotalPages} className="text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed">Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Security Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Suspicious Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {suspiciousActivities.length > 0 ? (
              suspiciousActivities.map((activity, index) => {
                const iconMap = {
                  'Transaction Failed': { icon: XCircle, bg: 'bg-red-100', text: 'text-red-600' },
                  'Large Transaction': { icon: AlertTriangle, bg: 'bg-orange-100', text: 'text-orange-600' },
                  'Pending Verification': { icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-600' },
                  'Document Rejected': { icon: FileX, bg: 'bg-red-100', text: 'text-red-600' },
                  'New User': { icon: UserPlus, bg: 'bg-blue-100', text: 'text-blue-600' },
                };
                const cfg = iconMap[activity.type] || { icon: AlertTriangle, bg: 'bg-gray-100', text: 'text-gray-600' };
                const ActivityIcon = cfg.icon;
                return (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 ${cfg.bg} rounded-lg`}>
                      <ActivityIcon className={`h-5 w-5 ${cfg.text}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.type}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    <p className="text-sm text-gray-700">{activity.user?.username}</p>
                  </div>
                </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">No suspicious activity detected</p>
            )}
          </div>
          {activityTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => { const p = activityPage - 1; setActivityPage(p); fetchSecurityData(usersPage, p); }} disabled={activityPage <= 1} className="text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed">Previous</button>
              <span className="text-sm text-gray-500">Page {activityPage} of {activityTotalPages}</span>
              <button onClick={() => { const p = activityPage + 1; setActivityPage(p); fetchSecurityData(usersPage, p); }} disabled={activityPage >= activityTotalPages} className="text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

