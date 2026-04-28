"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Hospital, 
  FileText, 
  Calendar, 
  Settings, 
  AlertCircle, 
  HelpCircle, 
  LogOut,
  TrendingUp,
  Bot,
  X,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Fixed path for Next.js

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const currentScreenId = pathname === '/' ? 'dashboard' : pathname.replace('/', '');
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flow', label: 'Flow Tracker', icon: TrendingUp },
    { id: 'hospitals', label: 'Hospitals', icon: Hospital },
    { id: 'reports', label: 'My Reports', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const navRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && navRef.current) {
      import('gsap').then(gsap => {
        const q = gsap.default.utils.selector(navRef.current);
        gsap.default.fromTo(q('.nav-stagger-item'), 
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
        );
      });
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-6 top-24 bottom-6 w-64 z-50 transition-all duration-500 ease-spring group",
        "bg-surface/80 backdrop-blur-2xl border border-outline-variant rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)]",
        "flex flex-col",
        isOpen ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0 pointer-events-none"
      )}>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-on-surface-variant hover:text-on-surface lg:hidden z-10"
        >
          <X size={20} />
        </button>

        {/* Proper Closing Tab (Visible on Hover) */}
        <button
          onClick={onClose}
          className="absolute -right-8 top-1/2 -translate-y-1/2 z-40 bg-surface/90 backdrop-blur-xl border border-outline-variant border-l-0 rounded-r-xl py-8 px-1 shadow-lg hover:bg-error/20 hover:text-error transition-all duration-300 hidden lg:flex items-center justify-center cursor-pointer text-on-surface-variant hover:pr-2 opacity-0 group-hover:opacity-100"
          title="Close Sidebar"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-col h-full overflow-y-auto py-8 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div ref={navRef} className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => {
              const href = item.id === 'dashboard' ? '/' : `/${item.id}`;
              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative nav-stagger-item",
                    currentScreenId === item.id 
                      ? "text-primary bg-primary/10 shadow-[0_0_20px_rgba(194,155,255,0.1)]" 
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-high"
                  )}
                >
                  {currentScreenId === item.id && (
                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-full glow-primary" />
                  )}
                  <item.icon size={20} className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    currentScreenId === item.id && "glow-primary"
                  )} />
                  <span className="font-headline tracking-wide font-bold text-sm">{item.label}</span>
                </Link>
              );
          })}
          </div>

          <div className="mt-8 space-y-4 shrink-0">
            <Link 
              href="/emergency"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full py-4 rounded-2xl bg-error/10 text-error font-bold border border-error/20 hover:bg-error/20 transition-all flex items-center justify-center gap-2 group cursor-pointer block text-center"
            >
              <AlertCircle size={18} className="group-hover:animate-pulse" />
              <span className="text-xs uppercase tracking-widest">Emergency SOS</span>
            </Link>
            
            <div className="pt-4 border-t border-outline-variant space-y-1">
              <button className="flex items-center gap-4 px-4 py-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer w-full text-left transition-colors">
                <HelpCircle size={18} />
                <span className="text-xs font-bold">Support</span>
              </button>
              <button className="flex items-center gap-4 px-4 py-2.5 text-on-surface-variant hover:text-error cursor-pointer w-full text-left transition-colors">
                <LogOut size={18} />
                <span className="text-xs font-bold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
