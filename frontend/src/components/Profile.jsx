import { useState, useEffect } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  ShieldCheckIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import Navbar from './Navbar';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    setFormData({
      name: userData?.name || '',
      email: userData?.email || ''
    });
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method:"PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
      console.log(res);

      if (res.ok) {
        const updatedUser = await res.json();
        // Update local storage
        const currentUser = JSON.parse(localStorage.getItem("user"));
        localStorage.setItem("user", JSON.stringify({
          ...currentUser,
          name: updatedUser.name,
          email: updatedUser.email
        }));
        
        setUser(updatedUser);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (res.ok) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
        setMessage({ type: 'success', text: 'Password updated successfully!' });
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update password');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password. Please try again.' });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setMessage({ type: '', text: '' });
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {getUserInitials()}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-600 rounded-full p-2 border border-gray-600 transition-colors">
                    <CameraIcon className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-white text-center">{user?.name || 'User'}</h2>
                <p className="text-gray-400 text-center mt-1">{user?.email}</p>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">Member since</span>
                  <span className="text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">Last login</span>
                  <span className="text-white">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Profile Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleProfileUpdate}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Full Name</label>
                    <p className="text-white mt-1">{user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Email Address</label>
                    <p className="text-white mt-1">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5" />
                  Security
                </h3>
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <KeyIcon className="h-4 w-4" />
                    Change Password
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasswordUpdate}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Update
                    </button>
                    <button
                      onClick={cancelPasswordChange}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isChangingPassword && (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Account Actions */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-lg transition-colors text-red-400">
                  Delete Account
                </button>
                <p className="text-xs text-gray-400">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}