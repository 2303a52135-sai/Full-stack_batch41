import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiPencil, HiCheck, HiLockClosed } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STYLES   = ['casual','formal','sporty','bohemian','streetwear','classic'];
const COLORS   = ['black','white','navy','grey','beige','brown','red','blue','green','pink','yellow','purple'];
const SEASONS  = ['spring','summer','autumn','winter'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', preferences: user?.preferences || {} });
  const [pwdForm, setPwdForm] = useState({ currentPassword:'', newPassword:'' });
  const [saving, setSaving]   = useState(false);

  const togglePref = (field, val) => {
    setForm(p => {
      const arr = p.preferences[field] || [];
      return { ...p, preferences: { ...p.preferences, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/updateprofile', { name: form.name, preferences: form.preferences });
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setSaving(true);
    try {
      await api.put('/auth/changepassword', pwdForm);
      setPwdForm({ currentPassword:'', newPassword:'' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account and style preferences</p>
      </div>

      {/* Avatar + name */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-lg">Personal Info</h3>
          {!editing
            ? <button onClick={() => setEditing(true)} className="btn-ghost gap-1.5"><HiPencil className="w-4 h-4"/>Edit</button>
            : <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                  {saving ? 'Saving...' : <><HiCheck className="w-4 h-4"/>Save</>}
                </button>
              </div>
          }
        </div>

        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-2xl font-display font-bold shadow-glow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display font-semibold text-lg text-[var(--color-text)]">{user?.name}</p>
            <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-1"><HiMail className="w-3.5 h-3.5"/>{user?.email}</p>
            <p className="text-xs mt-1"><span className="badge badge-purple capitalize">{user?.role || 'user'}</span></p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input className="input pl-9" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Location (for weather tips)</label>
              <input className="input" placeholder="e.g. Mumbai, India" value={form.preferences.location || ''}
                onChange={e => setForm(p => ({ ...p, preferences: { ...p.preferences, location: e.target.value } }))} />
            </div>

            <div>
              <label className="label">Favourite Colors</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => togglePref('favoriteColors', c)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize border transition-all
                      ${form.preferences.favoriteColors?.includes(c) ? 'bg-primary-500 text-white border-primary-500' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-primary-400'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Favourite Styles</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button key={s} type="button" onClick={() => togglePref('favoriteStyles', s)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize border transition-all
                      ${form.preferences.favoriteStyles?.includes(s) ? 'bg-primary-500 text-white border-primary-500' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-primary-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Preferred Seasons</label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map(s => (
                  <button key={s} type="button" onClick={() => togglePref('preferredSeasons', s)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize border transition-all
                      ${form.preferences.preferredSeasons?.includes(s) ? 'bg-primary-500 text-white border-primary-500' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-primary-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {user?.preferences?.favoriteColors?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-muted)] w-32">Fav Colors</span>
                <div className="flex flex-wrap gap-1">
                  {user.preferences.favoriteColors.map(c => <span key={c} className="badge badge-purple capitalize">{c}</span>)}
                </div>
              </div>
            )}
            {user?.preferences?.favoriteStyles?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-muted)] w-32">Styles</span>
                <div className="flex flex-wrap gap-1">
                  {user.preferences.favoriteStyles.map(s => <span key={s} className="badge badge-blue capitalize">{s}</span>)}
                </div>
              </div>
            )}
            {user?.preferences?.location && (
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-muted)] w-32">Location</span>
                <span className="text-[var(--color-text)]">{user.preferences.location}</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card p-6">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <HiLockClosed className="w-5 h-5" /> Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" placeholder="••••••••" value={pwdForm.currentPassword}
              onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" placeholder="Min. 6 characters" value={pwdForm.newPassword}
              onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>

      {/* Account stats */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Account Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          {[
            { label:'Items', value: user?.stats?.totalItems || 0 },
            { label:'Outfits', value: user?.stats?.totalOutfits || 0 },
            { label:'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { month:'short', year:'numeric' }) : '—' },
            { label:'Role', value: user?.role || 'user' },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700">
              <p className="text-2xl font-display font-bold text-[var(--color-text)]">{value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 capitalize">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
