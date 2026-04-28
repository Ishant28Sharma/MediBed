"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Sun, Moon, User, Settings, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  const currentScreenId = pathname === '/' ? 'dashboard' : pathname.replace('/', '');
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-outline-variant shadow-[0_20px_40px_rgba(157,91,255,0.08)] flex justify-between items-center px-8 py-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-on-surface-variant hover:bg-violet-500/10 transition-colors duration-300 rounded-xl lg:hidden"
        >
          <Menu size={24} />
        </button>
        <Link 
          href="/"
          className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 font-headline hover:opacity-80 transition-opacity"
        >
          MediBed
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-8 mr-8">
          <Link 
            href="/"
            className={`font-bold transition-colors duration-300 px-3 py-1 rounded-lg ${currentScreenId === 'dashboard' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:bg-violet-500/10'}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/reports"
            className={`font-bold transition-colors duration-300 px-3 py-1 rounded-lg ${currentScreenId === 'reports' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:bg-violet-500/10'}`}
          >
            Records
          </Link>
          <Link 
            href="/appointments"
            className={`font-bold transition-colors duration-300 px-3 py-1 rounded-lg ${currentScreenId === 'appointments' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:bg-violet-500/10'}`}
          >
            Appointments
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 text-on-surface-variant hover:bg-violet-500/10 transition-colors duration-300 active:scale-95 rounded-full"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 transition-colors duration-300 active:scale-95 rounded-full relative ${showNotifications ? 'bg-violet-500/10 text-primary' : 'text-on-surface-variant hover:bg-violet-500/10'}`}
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-low">
                    <h3 className="font-bold text-on-surface">Notifications</h3>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">2 New</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 border-b border-outline-variant hover:bg-surface-low cursor-pointer transition-colors">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-sm text-on-surface font-medium">Dr. Sarah Jenkins sent a new message</p>
                          <p className="text-xs text-on-surface-variant mt-1">Regarding your recent blood test results.</p>
                          <p className="text-[10px] text-on-surface-variant mt-2 font-semibold">10 MINS AGO</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-b border-outline-variant hover:bg-surface-low cursor-pointer transition-colors">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-sm text-on-surface font-medium">Upcoming Appointment</p>
                          <p className="text-xs text-on-surface-variant mt-1">Cardiology checkup tomorrow at 10:00 AM.</p>
                          <p className="text-[10px] text-on-surface-variant mt-2 font-semibold">2 HOURS AGO</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-surface-low cursor-pointer transition-colors opacity-60">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-transparent shrink-0" />
                        <div>
                          <p className="text-sm text-on-surface font-medium">Prescription Ready</p>
                          <p className="text-xs text-on-surface-variant mt-1">Your Lisinopril refill is ready for pickup.</p>
                          <p className="text-[10px] text-on-surface-variant mt-2 font-semibold">YESTERDAY</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-outline-variant text-center bg-surface-low">
                    <button className="text-xs font-bold text-primary hover:text-primary-dim transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-10 h-10 rounded-full border-2 overflow-hidden active:scale-95 transition-all cursor-pointer ${showProfileMenu ? 'border-primary shadow-[0_0_10px_rgba(107,33,168,0.3)]' : 'border-violet-500/20 hover:border-primary/50'}`}
            >
              <img 
                alt="Patient Profile" 
                src="https://picsum.photos/seed/evelyn/100/100"
                className="w-full h-full object-cover"
              />
            </div>
            
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-surface border border-outline-variant rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-outline-variant bg-surface-low">
                    <p className="font-bold text-on-surface">Evelyn Smith</p>
                    <p className="text-xs text-on-surface-variant truncate">evelyn.smith@example.com</p>
                  </div>
                  <div className="p-2">
                    <Link 
                      href="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface hover:bg-surface-container rounded-xl transition-colors"
                    >
                      <User size={16} className="text-on-surface-variant" />
                      My Profile
                    </Link>
                    <Link 
                      href="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface hover:bg-surface-container rounded-xl transition-colors"
                    >
                      <Settings size={16} className="text-on-surface-variant" />
                      Settings
                    </Link>
                  </div>
                  <div className="p-2 border-t border-outline-variant">
                    <button 
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-xl transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
