
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SettingsTab = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setChangingPassword(true);
      
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      
      if (signInError) {
        toast.error('Current password is incorrect');
        return;
      }
      
      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) throw updateError;
      
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };
  
  return (
    <div>
      <h1 className="heading-lg mb-6">Settings</h1>
      
      <div className="space-y-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-2">Current Password</label>
              <input 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-2">New Password</label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-2">Confirm New Password</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
            <div>
              <button 
                type="submit" 
                className="button-primary py-2 px-6" 
                disabled={changingPassword}
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
