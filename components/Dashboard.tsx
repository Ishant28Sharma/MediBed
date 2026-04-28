"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Activity, 
  Wind, 
  Thermometer, 
  Download, 
  Calendar, 
  Lightbulb,
  FileText,
  Sparkles,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { VITALS, APPOINTMENTS, REPORTS } from '@/constants';
import { cn } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';
import { useGsapCounter } from '@/hooks/useGsapCounter';
import { ThreeWaveBackground } from './ThreeWaveBackground';

const AnimatedValue = ({ value }: { value: number | string }) => {
  const isNumber = typeof value === 'number';
  const count = useGsapCounter(isNumber ? (value as number) : 0);
  
  if (!isNumber) return <span className="text-4xl font-extrabold font-headline tracking-tighter">{value}</span>;
  return <span className="text-4xl font-extrabold font-headline tracking-tighter">{count}</span>;
};

const chartData = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 65 },
  { name: 'Wed', value: 55 },
  { name: 'Thu', value: 80 },
  { name: 'Fri', value: 70 },
  { name: 'Sat', value: 95 },
  { name: 'Sun', value: 85 },
];

const VitalIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'Heart': return <Heart className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'Thermometer': return <Thermometer className={className} />;
    default: return <Activity className={className} />;
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export const Dashboard: React.FC = () => {
  const [aiTip, setAiTip] = useState<string>('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [patientName, setPatientName] = useState<string>('Evelyn');
  const [profileLoading, setProfileLoading] = useState(true);
  const [forecastBadge, setForecastBadge] = useState<string | null>(null);
  const [bedStats, setBedStats] = useState<{totalBeds: number, availableBeds: number, occupiedBeds: number, emergencyBeds: number} | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingApts, setLoadingApts] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setBedStats(data))
      .catch((err) => {
        console.error(err);
        setBedStats({ totalBeds: 120, availableBeds: 28, occupiedBeds: 85, emergencyBeds: 7 });
      });

    fetch('/api/ai/occupancy-forecast')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const maxOccupancy = Math.max(...data.map(d => Number(d.predicted_occupancy) || 0));
          setForecastBadge(`7-day peak: ~${maxOccupancy} beds occupied`);
        } else {
          setForecastBadge('AI unavailable');
        }
      })
      .catch(err => {
        setForecastBadge('AI unavailable');
      });

    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data.appointments) setAppointments(data.appointments);
      })
      .catch(err => console.error('Failed to fetch appointments:', err))
      .finally(() => setLoadingApts(false));
  }, []);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: 'Generate a short, encouraging 2-sentence health tip for a patient recovering and tracking their vitals. Make it sound like it comes from a smart hospital bed called MediBed.',
        });
        setAiTip(response.text || 'Stay hydrated and get plenty of rest today for optimal recovery.');
      } catch (error) {
        console.error('Failed to fetch AI tip:', error);
        setAiTip('Stay hydrated and get plenty of rest today for optimal recovery.');
      } finally {
        setIsLoadingTip(false);
      }
    };
    fetchTip();

    // Fetch patient profile for the name
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (data.name) {
          setPatientName(data.name);
        }
      } catch (err) {
        console.error('Failed to fetch patient profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-8 space-y-8 relative">
        <ThreeWaveBackground />
        
        {/* Welcome Section */}
        <motion.section variants={itemVariants} className="mb-12 relative flex flex-col md:flex-row items-center md:items-start justify-between gap-8 z-10">
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-extrabold font-headline tracking-tight mb-2"
            >
              Welcome back, <span className="text-primary">{profileLoading ? '...' : patientName}</span>.
            </motion.h1>
            <p className="text-on-surface-variant text-lg max-w-2xl">
              Your biometric signals are showing optimal recovery patterns. 
              Keep following your current hydration protocol.
            </p>
          </div>
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                filter: [
                  'drop-shadow(0 0 10px rgba(194,155,255,0.4))',
                  'drop-shadow(0 0 20px rgba(194,155,255,0.8))',
                  'drop-shadow(0 0 10px rgba(194,155,255,0.4))'
                ]
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-primary"
            >
              <Heart size={80} fill="currentColor" />
            </motion.div>
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-75 animate-pulse"></div>
          </div>
        </motion.section>

        {/* Global Bed Stats (Admin view demo) */}
        {bedStats && (
          <motion.section variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              Global Operations
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Beds', val: bedStats.totalBeds, color: 'text-on-surface' },
                { label: 'Available', val: bedStats.availableBeds, color: 'text-primary' },
                { label: 'Occupied', val: bedStats.occupiedBeds, color: 'text-tertiary' },
                { label: 'Emergency', val: bedStats.emergencyBeds, color: 'text-error' }
              ].map((stat, i) => (
                <div key={i} className="relative glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest font-black mb-1">{stat.label}</p>
                  <AnimatedValue value={stat.val} />
                  {stat.label === 'Available' && forecastBadge && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-highest whitespace-nowrap text-[9px] text-on-surface-variant font-medium px-2 py-0.5 rounded-full border border-outline-variant shadow-md">
                      {forecastBadge}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Live Vitals Grid */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live Biometrics
            </h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
              Real-time sync
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VITALS.map((vital) => (
              <motion.div 
                key={vital.id}
                whileHover={{ scale: 1.02 }}
                className="relative bg-surface-container/50 backdrop-blur-xl p-6 rounded-3xl border border-outline-variant flex items-center justify-between group hover:bg-surface-container transition-all cursor-pointer overflow-hidden"
              >
                <div>
                  <p className="text-on-surface-variant text-sm font-semibold mb-1">{vital.label}</p>
                  <div className="flex items-baseline gap-2 text-on-surface">
                    <AnimatedValue value={vital.value} />
                    <span className={cn(
                      "font-semibold text-sm uppercase",
                      vital.color === 'primary' ? 'text-primary' : 
                      vital.color === 'tertiary' ? 'text-tertiary' : 
                      vital.color === 'secondary' ? 'text-secondary' : 'text-orange-400'
                    )}>
                      {vital.unit}
                    </span>
                  </div>
                </div>
                
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  vital.color === 'primary' ? 'bg-primary/10 text-primary glow-primary' : 
                  vital.color === 'tertiary' ? 'bg-tertiary/10 text-tertiary' : 
                  vital.color === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-orange-400/10 text-orange-400'
                )}>
                  <VitalIcon name={vital.icon} className="w-8 h-8" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Health Stats Chart */}
        <motion.section variants={itemVariants} className="glass-panel p-8 rounded-[2rem] relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Health Recovery Index</h3>
              <p className="text-on-surface-variant text-sm">Overall performance based on weekly data points</p>
            </div>
            <div className="bg-primary/20 px-4 py-2 rounded-xl text-primary font-bold">
              +12% <span className="text-xs font-normal opacity-80 ml-1">this month</span>
            </div>
          </div>
          
          <div className="h-48 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === chartData.length - 1 ? '#c29bff' : 'rgba(194, 155, 255, 0.2)'} 
                      className={index === chartData.length - 1 ? 'glow-line' : ''}
                    />
                  ))}
                </Bar>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1a191b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 space-y-8">
        {/* Upcoming Appointments */}
        <motion.section variants={itemVariants} className="bg-surface-low p-6 rounded-3xl border border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-headline font-bold">Appointments</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {loadingApts ? (
              <div className="flex items-center gap-2 p-4 text-sm text-on-surface-variant font-medium">
                <Loader2 size={16} className="animate-spin text-primary" />
                Syncing requests...
              </div>
            ) : appointments.length > 0 ? (
              appointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="p-4 rounded-2xl bg-surface-container border border-outline-variant flex gap-4 hover:border-primary/30 transition-colors group">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-primary/20 bg-surface-highest flex items-center justify-center">
                    <Activity size={20} className="text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm">{apt.doctor_name || 'Specialist'}</p>
                      <span className={cn(
                        "text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest",
                        apt.status === 'pending' ? "bg-tertiary/10 text-tertiary" : "bg-green-500/10 text-green-500"
                      )}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant mb-2 font-bold uppercase tracking-tighter">{apt.specialty}</p>
                    <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(apt.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wind size={12} className="rotate-90" />
                        {apt.appointment_time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-surface-container border border-dashed border-outline-variant text-center opacity-60">
                <p className="text-xs font-bold text-on-surface-variant mb-2 italic">0 Upcoming Requests</p>
                <button 
                  onClick={() => window.location.href = '/appointments'}
                  className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline"
                >
                  Book Specialist
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {/* Recent Reports */}
        <motion.section variants={itemVariants} className="bg-surface-low p-6 rounded-3xl border border-outline-variant">
          <h3 className="text-lg font-headline font-bold mb-6">Recent Reports</h3>
          <div className="space-y-3">
            {REPORTS.slice(0, 5).map((report) => (
              <a 
                key={report.id}
                href="#" 
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-container hover:bg-surface-high border border-outline-variant transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    report.type === 'blood' ? "bg-violet-500/10 text-primary" : "bg-tertiary/10 text-tertiary"
                  )}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{report.title}</p>
                    <p className="text-[10px] text-on-surface-variant">Completed {report.date}</p>
                  </div>
                </div>
                <Download size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
          <button className="w-full mt-6 py-3 rounded-xl border border-outline-variant hover:border-primary/50 text-sm font-semibold transition-colors">
            Browse Full History
          </button>
        </motion.section>

        {/* MediBed Tip Card */}
        <motion.section variants={itemVariants} className="relative p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-700 overflow-hidden shadow-2xl">
          <div className="relative z-10 text-on-surface">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={24} />
              <Sparkles size={16} className="text-tertiary animate-pulse" />
            </div>
            <h4 className="font-headline font-bold mb-2">MediBed AI Thought</h4>
            {isLoadingTip ? (
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Generating insight...</span>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {aiTip}
              </p>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};
