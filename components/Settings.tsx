"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  Droplet, 
  AlertTriangle, 
  Save, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  FileText,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { REPORTS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    blood_type: '',
    allergies: '',
    age: 0,
    gender: 'Other'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [notifications, setNotifications] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (!data.error) {
          setProfile(data);
        }
      } catch (error) {
        console.error('[Settings] Load Failure:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      const data = await response.json();
      if (response.ok && !data.error) {
        setSaveStatus('success');
        // Synchronize full record (including ID and latest changes)
        setProfile(data);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (error) {
      console.error('[Settings] Save Failure:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs">Syncing Medical ID...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.section variants={itemVariants} initial="initial" animate="animate">
        <div className="flex flex-col mb-6">
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Settings & Profile</h1>
          <p className="text-on-surface-variant mt-1 italic">Connected to MediBed Secure Cloud Sync</p>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Form */}
        <motion.section 
          variants={itemVariants} 
          initial="initial" 
          animate="animate" 
          className="md:col-span-2 glass-panel p-8 rounded-3xl border border-outline-variant relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <AnimatePresence mode="wait">
              {saveStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20"
                >
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Saved</span>
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20"
                >
                  <XCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Error</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="text-primary" />
            Medical Identity
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Full Patient Name</label>
                <div className="relative group">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Email Identity</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-black border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors font-medium"
                    style={{ backgroundColor: '#000000' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Phone Contact</label>
                <div className="relative group">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    type="tel" 
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-black text-primary">Blood Group Status</label>
                <div className="relative group">
                  <Droplet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" />
                  <input 
                    type="text" 
                    value={profile.blood_type}
                    onChange={e => setProfile({...profile, blood_type: e.target.value})}
                    placeholder="e.g. O+"
                    className={cn(
                      "w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors uppercase font-black",
                      profile.blood_type ? "text-primary" : "text-on-surface"
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Age</label>
                <input 
                  type="number" 
                  value={profile.age === 0 ? '' : profile.age}
                  onChange={e => setProfile({...profile, age: parseInt(e.target.value) || 0})}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Gender Identity</label>
                <div className="relative group">
                  <select 
                    value={profile.gender}
                    onChange={e => setProfile({...profile, gender: e.target.value})}
                    className="w-full bg-black border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer pr-10"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <option value="Male" className="bg-black text-on-surface">Male</option>
                    <option value="Female" className="bg-black text-on-surface">Female</option>
                    <option value="Other" className="bg-black text-on-surface">Other</option>
                    <option value="Prefer not to say" className="bg-black text-on-surface">Prefer not to say</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Critical Allergies</label>
                <div className="relative group">
                  <AlertTriangle size={16} className="absolute left-3 top-3 text-on-surface-variant group-focus-within:text-tertiary transition-colors" />
                  <textarea 
                    value={profile.allergies}
                    onChange={e => setProfile({...profile, allergies: e.target.value})}
                    rows={3}
                    placeholder="None"
                    className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={saving}
                className={cn(
                  "px-8 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm flex items-center gap-3 transition-all active:scale-95 shadow-lg",
                  saving ? "bg-surface-highest text-on-surface-variant cursor-not-allowed" : "bg-primary text-on-primary hover:bg-primary-dim hover:shadow-primary/20"
                )}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Commit Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.section>

        {/* Right Column */}
        <div className="space-y-8">
          <motion.section variants={itemVariants} className="glass-panel p-6 rounded-3xl border border-outline-variant">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="text-primary" />
              Portal Access
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-on-surface-variant" />
                  <span className="text-xs font-black uppercase tracking-widest">Alert Sync</span>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative p-1",
                    notifications ? "bg-primary" : "bg-surface-highest"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-all transform shadow-md",
                    notifications ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant">
                <div className="flex items-center gap-3">
                  {theme === 'light' ? <Sun size={18} className="text-on-surface-variant" /> : <Moon size={18} className="text-on-surface-variant" />}
                  <span className="text-xs font-black uppercase tracking-widest">{theme === 'light' ? 'Light mode' : 'Dark mode'}</span>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative p-1 bg-surface-highest"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-primary transition-all transform shadow-md",
                    theme === 'dark' ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="glass-panel p-6 rounded-3xl border border-outline-variant">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="text-primary" />
              History
            </h2>
            <div className="space-y-3">
              {REPORTS.slice(0, 3).map(report => (
                <div key={report.id} className="p-4 bg-surface-container rounded-2xl border border-outline-variant flex items-center justify-between group hover:border-primary/30 transition-colors">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight">{report.title}</h4>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">{report.date}</p>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    report.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                  )} />
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};
