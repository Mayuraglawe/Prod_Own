'use client';

import React, { useState } from 'react';
import { User, Mail, Shield, Camera, Key, Check, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

import { updateProfile } from './actions';

interface ProfileUser {
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

export default function ProfileClient({ user }: { user: ProfileUser | null }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await updateProfile(formData);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#13221C]">Profile Settings</h3>
            <p className="text-xs text-[#687870]">Manage your account details and security preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <img 
                src={user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80"} 
                alt="Profile Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-50 shadow-sm transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#13221C]">{user?.name || 'Anonymous User'}</h2>
            <p className="text-xs text-[#687870] mt-1">{user?.email}</p>
            
            <span className="mt-4 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {user?.role || 'Member'}
            </span>
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-center gap-2 text-rose-700 hover:bg-rose-100 transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-[#13221C] border-b border-[#E2E8E4] pb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#52b788]" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#13221C]">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  defaultValue={user?.name?.split(' ')[0] || ''}
                  className="w-full px-3 py-2 bg-[#F3F5F4] border border-[#E2E8E4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]/20 focus:border-[#52b788] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#13221C]">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  defaultValue={user?.name?.split(' ').slice(1).join(' ') || ''}
                  className="w-full px-3 py-2 bg-[#F3F5F4] border border-[#E2E8E4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]/20 focus:border-[#52b788] transition-all"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#13221C]">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#687870] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    name="email"
                    defaultValue={user?.email || ''}
                    className="w-full pl-9 pr-3 py-2 bg-[#F3F5F4] border border-[#E2E8E4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]/20 focus:border-[#52b788] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#52b788] hover:bg-[#40916c] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : null}
                {isSaving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
              </button>
            </div>
          </form>

          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-[#13221C] border-b border-[#E2E8E4] pb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#52b788]" />
              Security
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#13221C]">Current Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#687870] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[#F3F5F4] border border-[#E2E8E4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]/20 focus:border-[#52b788] transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#13221C]">New Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#687870] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" 
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3 py-2 bg-[#F3F5F4] border border-[#E2E8E4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]/20 focus:border-[#52b788] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="px-5 py-2.5 bg-white border border-[#E2E8E4] hover:bg-gray-50 text-[#13221C] font-bold text-xs rounded-xl shadow-sm transition-all">
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
