"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  
  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        localStorage.setItem('medibed_geo', JSON.stringify({
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude 
        }));
      }, (err) => console.warn('Geoloc denied:', err));
    }
  }, []);

  const currentScreenId = pathname === '/' ? 'dashboard' : pathname.replace('/', '');

  const isWardSelection = currentScreenId === 'ward-selection';

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30 selection:text-primary overflow-clip transition-colors duration-300">
        <TopBar 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.button
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              onClick={() => setIsSidebarOpen(true)}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-surface-low/80 backdrop-blur-xl border border-outline-variant border-l-0 rounded-r-2xl py-8 px-2 hover:px-4 shadow-[20px_0_40px_rgba(0,0,0,0.1)] hover:bg-surface-high hover:border-primary/50 transition-all duration-300 group flex items-center justify-center cursor-pointer"
              title="Open Sidebar"
            >
              <ChevronRight size={24} className="text-on-surface-variant group-hover:text-primary transition-transform duration-300 group-hover:scale-125" />
            </motion.button>
          )}
        </AnimatePresence>
        
        <main className={cn(
          "pt-24 pb-12 px-8 min-h-screen transition-all duration-500 ease-spring",
          isSidebarOpen && !isWardSelection ? "lg:pl-72" : "lg:pl-8"
        )}>
          {children}
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-surface/80 backdrop-blur-xl border-t border-outline-variant px-6 py-4 flex justify-between items-center z-50">
          <Link 
            href="/"
            className={`flex flex-col items-center gap-1 ${currentScreenId === 'dashboard' ? 'text-primary' : 'text-zinc-500'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link 
            href="/flow"
            className={`flex flex-col items-center gap-1 ${currentScreenId === 'flow' ? 'text-primary' : 'text-zinc-500'}`}
          >
            <span className="material-symbols-outlined">trending_up</span>
            <span className="text-[10px] font-semibold">Flow</span>
          </Link>
          <Link 
            href="/appointments"
            className={`flex flex-col items-center gap-1 ${currentScreenId === 'appointments' ? 'text-primary' : 'text-zinc-500'}`}
          >
            <span className="material-symbols-outlined">event</span>
            <span className="text-[10px] font-semibold">Book</span>
          </Link>
          <Link 
            href="/reports"
            className={`flex flex-col items-center gap-1 ${currentScreenId === 'reports' ? 'text-primary' : 'text-zinc-500'}`}
          >
            <span className="material-symbols-outlined">description</span>
            <span className="text-[10px] font-semibold">Reports</span>
          </Link>
          <Link 
            href="/settings"
            className={`flex flex-col items-center gap-1 ${currentScreenId === 'settings' ? 'text-primary' : 'text-zinc-500'}`}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-outline-variant">
              <img src="https://picsum.photos/seed/evelyn/50/50" alt="Profile" />
            </div>
            <span className="text-[10px] font-semibold">Profile</span>
          </Link>
        </nav>
      </div>
    </ThemeProvider>
  );
}
