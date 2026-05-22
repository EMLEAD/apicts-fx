"use client";

import { useState, useEffect } from 'react';
import { Loader2, Mail, MailOpen, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, currentReadStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isRead: !currentReadStatus })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessages(messages.map(m => m.id === id ? { ...m, isRead: !currentReadStatus } : m));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, isRead: !currentReadStatus });
        }
        toast.success(currentReadStatus ? 'Marked as unread' : 'Marked as read');
      }
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Deleted successfully');
        setMessages(messages.filter(m => m.id !== id));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete message');
    }
  };

  const openMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      await handleMarkAsRead(msg.id, false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contact Messages</h1>
        <p className="text-gray-600">View and manage messages sent from the contact form.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {messages.map((msg) => (
              <tr key={msg.id} className={!msg.isRead ? 'bg-blue-50/50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {msg.isRead ? (
                    <MailOpen className="text-gray-400" size={20} />
                  ) : (
                    <Mail className="text-blue-500" size={20} />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm font-medium ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{msg.name}</div>
                  <div className="text-sm text-gray-500">{msg.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm ${!msg.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {msg.subject.length > 40 ? msg.subject.substring(0, 40) + '...' : msg.subject}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(msg.createdAt), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openMessage(msg)} className="text-blue-600 hover:text-blue-900 mr-4" title="View Message">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => handleMarkAsRead(msg.id, msg.isRead)} className="text-gray-600 hover:text-gray-900 mr-4" title={msg.isRead ? "Mark as unread" : "Mark as read"}>
                    {msg.isRead ? <Mail size={18} /> : <MailOpen size={18} />}
                  </button>
                  <button onClick={() => handleDelete(msg.id)} className="text-red-600 hover:text-red-900" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No messages found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedMessage.subject}</h2>
                  <p className="text-sm text-gray-500">From: <span className="font-medium text-gray-900">{selectedMessage.name}</span> ({selectedMessage.email})</p>
                  {selectedMessage.phone && <p className="text-sm text-gray-500">Phone: {selectedMessage.phone}</p>}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(selectedMessage.createdAt), 'MMM d, yyyy HH:mm')}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap min-h-[150px]">
                {selectedMessage.message}
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
