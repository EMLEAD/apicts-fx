'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Link as LinkIcon, Unlink, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [telegramForm, setTelegramForm] = useState({ telegramUserId: '', telegramUsername: '' });
  const [linking, setLinking] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error('Failed to parse user', err);
      }
    }

    fetchUserData();
  }, [router]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkTelegram = async (e) => {
    e.preventDefault();
    setLinking(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/telegram/link-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(telegramForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Telegram account linked successfully!' });
        setTelegramForm({ telegramUserId: '', telegramUsername: '' });
        await fetchUserData();
      } else {
        if (data.alreadyLinked) {
          setMessage({ 
            type: 'error', 
            text: `You have already linked a Telegram account (ID: ${data.currentTelegramUserId}). Please unlink it first if you want to link a different account.` 
          });
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to link Telegram account' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    if (!confirm('Are you sure you want to unlink your Telegram account? You will be removed from all premium groups.')) {
      return;
    }

    setLinking(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/telegram/unlink-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Telegram account unlinked successfully!' });
        await fetchUserData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to unlink Telegram account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and integrations</p>
      </div>

      {/* Telegram Integration Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Telegram Integration</h2>
              <p className="text-sm text-gray-600">Link your Telegram account to access premium groups</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Info Box */}
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">How to get your Telegram User ID:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open Telegram and search for <code className="bg-blue-100 px-1 rounded">@userinfobot</code></li>
                  <li>Start a chat with the bot</li>
                  <li>Send any message to the bot</li>
                  <li>The bot will reply with your User ID (numeric)</li>
                  <li>Copy the ID and paste it below</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 rounded-lg border p-4 flex items-start space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Current Status */}
          {user?.telegramUserId ? (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">✅ Telegram Account Linked</p>
                  <p className="text-sm text-green-700">
                    <strong>User ID:</strong> {user.telegramUserId}
                  </p>
                  {user.telegramUsername && (
                    <p className="text-sm text-green-700">
                      <strong>Username:</strong> @{user.telegramUsername}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleUnlinkTelegram}
                  disabled={linking}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Unlinking...
                    </>
                  ) : (
                    <>
                      <Unlink className="h-4 w-4 mr-2" />
                      Unlink
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLinkTelegram} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={telegramForm.telegramUserId}
                  onChange={(e) => setTelegramForm(prev => ({ ...prev, telegramUserId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., 123456789"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your numeric Telegram user ID (get it from @userinfobot)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Username (Optional)
                </label>
                <input
                  type="text"
                  value={telegramForm.telegramUsername}
                  onChange={(e) => setTelegramForm(prev => ({ ...prev, telegramUsername: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., johndoe"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your Telegram username without the @ symbol
                </p>
              </div>

              <button
                type="submit"
                disabled={!telegramForm.telegramUserId || linking}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {linking ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Link Telegram Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Benefits Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Benefits of linking Telegram:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Automatic access to premium Telegram groups when you subscribe</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Receive instant notifications and updates</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Connect with other premium members</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Get exclusive content and signals</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
