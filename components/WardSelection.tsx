"use client";
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { 
  Bed, 
  User, 
  Sparkles, 
  Check, 
  Eye, 
  BadgeCheck, 
  Wifi, 
  Tv, 
  Thermometer, 
  Armchair, 
  AlertCircle, 
  AlertTriangle, 
  History, 
  UserRound,
  Filter,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

interface WardSelectionProps {
  onBack?: () => void;
  hospitalName: string;
}

interface BedInfo {
  id: string;
  bedNumber: string;
  status: string;
}

export const WardSelection: React.FC<WardSelectionProps> = ({ onBack, hospitalName }) => {
  const [beds, setBeds] = useState<BedInfo[]>([]);
  const bedGridRef = useRef<HTMLDivElement>(null);

  const [selectedBed, setSelectedBed] = useState<BedInfo | null>(null);
  const [bioSummary, setBioSummary] = useState<string | null>(null);
  const [aiSuggest, setAiSuggest] = useState<any>(null);
  const [dischargeSummary, setDischargeSummary] = useState<string | null>(null);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    fetch('/api/beds')
      .then(res => res.json())
      .then(data => {
        if (data.beds) {
          setBeds(data.beds);
        }
      })
      .catch(console.error);

    // Fetch patient profile for live data
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        setProfile(data);
        
        // Use real profile data for AI suggestion
        fetch('/api/ai/bed-suggest', {
          method: 'POST',
          body: JSON.stringify({ 
            age: data.age || 45, 
            condition: data.allergies || 'Unknown', 
            ward_pref: 'Cardiology', 
            mobility: 'High' 
          })
        })
        .then(res => res.json())
        .then(data => setAiSuggest(data))
        .catch(console.error);

      } catch (err) {
        console.error('Failed to fetch patient profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (selectedBed?.status === 'occupied') {
       setBioSummary(null);
       fetch('/api/ai/biometric-summary', {
         method: 'POST',
         body: JSON.stringify({ patientId: 'MS-8829-2024', vitals: [{hr: 88, bp: '120/80', spo2: 98, timestamp: Date.now()}] })
       })
       .then(res => res.json())
       .then(data => setBioSummary(data.summary))
       .catch(() => setBioSummary('AI unavailable'));
    }
  }, [selectedBed]);

  const handleDischarge = () => {
    setShowDischargeModal(true);
    setDischargeSummary(null);
    fetch('/api/ai/discharge-summary', {
      method: 'POST',
      body: JSON.stringify({ patientId: 'MS-8829-2024' })
    })
    .then(res => res.json())
    .then(data => setDischargeSummary(data.markdown))
    .catch(() => setDischargeSummary('AI unavailable'));
  };

  useEffect(() => {
    if (beds.length > 0 && bedGridRef.current) {
      const q = gsap.utils.selector(bedGridRef.current);
      gsap.from(q('.bed-item'), {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'back.out(1.7)',
        clearProps: 'all'
      });
    }
  }, [beds]);

  return (
    <div className="relative min-h-[calc(100vh-10rem)]">
      {/* Main Content Area: Bed Matrix */}
      <div className="grid grid-cols-12 gap-10">
        <section className="col-span-12 lg:col-span-8 space-y-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4">
            <div className="flex items-center gap-6">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-3 bg-surface-container hover:bg-surface-high text-on-surface-variant hover:text-primary rounded-2xl transition-all border border-outline-variant group"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
              <div>
                <h1 className="text-4xl font-headline font-black tracking-tight text-on-surface">{hospitalName || 'Ward Selection'}</h1>
                <p className="text-on-surface-variant mt-2 text-sm font-body">Select an available bed in the Cardiology Unit (Floor 4).</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-surface-low p-1.5 rounded-2xl">
                <button className="px-6 py-2.5 text-on-surface-variant hover:text-on-surface text-xs font-bold rounded-xl transition-all">List View</button>
                <button className="px-6 py-2.5 bg-surface-container text-primary font-bold text-xs rounded-xl transition-all shadow-lg shadow-primary/5">Matrix View</button>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-8 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-primary glow-primary"></div>
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Available</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-surface-highest"></div>
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Occupied</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-tertiary shadow-[0_0_10px_rgba(160,255,240,0.3)]"></div>
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Cleaning</span>
            </div>
          </div>

          {/* AI Suggestion */}
          {aiSuggest && aiSuggest.bedId && (
            <div className="bg-primary/10 border border-primary/30 p-3 rounded-2xl flex items-start gap-3 mt-4">
              <Sparkles size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">AI Suggested: Bed {aiSuggest.bedNumber || aiSuggest.bedId}</p>
                <p className="text-xs text-on-surface-variant font-medium">{aiSuggest.reasoning}</p>
              </div>
            </div>
          )}

          {/* Matrix Grid */}
          <div ref={bedGridRef} className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {beds.length > 0 ? beds.map((bed) => (
              <motion.div
                key={bed.id}
                onClick={() => setSelectedBed(bed)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer border bed-item",
                  bed.status === 'available' && "bg-surface-container border-primary/10 hover:bg-primary/10 hover:border-primary/30",
                  bed.status === 'occupied' && "bg-surface-low border-transparent opacity-40 grayscale hover:opacity-100",
                  bed.status === 'cleaning' && "bg-surface-container border-tertiary/10 hover:bg-tertiary/10 hover:border-tertiary/30",
                  (bed.status === 'selected' || selectedBed?.id === bed.id) && "bg-primary/20 border-primary shadow-[0_0_20px_rgba(194,155,255,0.2)] grayscale-0 opacity-100"
                )}
              >
                <span className={cn(
                  "text-[10px] font-black font-headline mb-3 tracking-widest",
                  bed.status === 'available' && "text-primary",
                  bed.status === 'occupied' && "text-on-surface-variant",
                  bed.status === 'cleaning' && "text-tertiary",
                  bed.status === 'selected' && "text-primary"
                )}>
                  {bed.bedNumber}
                </span>
                {bed.status === 'occupied' ? (
                  <User size={24} className="text-on-surface-variant" />
                ) : bed.status === 'cleaning' ? (
                  <Sparkles size={24} className="text-tertiary" />
                ) : (
                  <Bed size={24} className={cn(bed.status === 'selected' ? "text-primary" : "text-primary/70")} />
                )}
              </motion.div>
            )) : (
              <div className="col-span-full h-40 flex items-center justify-center text-on-surface-variant text-sm py-12">
                Syncing ward matrix...
              </div>
            )}
          </div>

          {/* Progress Flow */}
          <div className="flex justify-center w-full pt-6">
            <div className="flex items-center gap-4 bg-surface-low/30 backdrop-blur-xl p-3 px-6 rounded-2xl border border-outline-variant shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-tertiary/20 border border-tertiary flex items-center justify-center">
                  <Check size={12} className="text-tertiary" strokeWidth={3} />
                </div>
                <span className="text-[8px] font-black text-tertiary uppercase tracking-[0.2em] font-headline">Patient</span>
              </div>
              <div className="w-6 h-px bg-tertiary/30"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-tertiary/20 border border-tertiary flex items-center justify-center">
                  <Check size={12} className="text-tertiary" strokeWidth={3} />
                </div>
                <span className="text-[8px] font-black text-tertiary uppercase tracking-[0.2em] font-headline">Insurance</span>
              </div>
              <div className="w-6 h-px bg-primary/30"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center glow-primary">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                </div>
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] font-headline">Bed selection</span>
              </div>
              <div className="w-6 h-px bg-outline-variant"></div>
              <div className="flex items-center gap-2 opacity-30">
                <div className="w-6 h-6 border border-outline-variant rounded-full flex items-center justify-center">
                  <Eye size={12} className="text-on-surface-variant" />
                </div>
                <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] font-headline">Review</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Floating Sidebar - Patient Details + Confirm Reservation */}
        <aside className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-28">
          {/* Time Tracking Card */}
          <div className="bg-surface-low/50 backdrop-blur-md p-4 rounded-2xl border border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <History size={20} />
              </div>
              <div>
                <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">Est. Completion</p>
                <p className="text-sm font-bold font-headline">14:30 PM</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-primary uppercase tracking-widest">Time Elapsed</p>
              <p className="text-sm font-bold font-headline text-primary">04:12</p>
            </div>
          </div>

          {/* Patient Details Card */}
          <div className="bg-surface-low/80 backdrop-blur-xl p-6 rounded-[2rem] border border-outline-variant shadow-2xl space-y-4 glow-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full glow-primary"></div>
              <h3 className="text-xl font-headline font-bold">Patient Details</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em]">Patient ID</p>
                <p className="text-xs font-bold font-headline">#{profile?.id?.slice(0, 8) || 'MS-8829'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em]">Blood Group</p>
                <p className="text-xs font-bold text-primary font-headline">{profile?.blood_type || 'O+'}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em]">Allergies / Condition</p>
              <p className="text-xs font-bold leading-relaxed font-headline">{profile?.allergies || 'No known allergies'}</p>
            </div>

            {/* AI Biometric Summary */}
            {selectedBed?.status === 'occupied' && (
              <div className="mt-4 pt-4 border-t border-outline-variant">
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1"><Sparkles size={12}/> AI Biometric Summary</p>
                {bioSummary ? (
                  <p className="text-xs text-on-surface-variant leading-relaxed font-headline">{bioSummary}</p>
                ) : (
                  <div className="h-4 bg-surface-highest animate-pulse rounded w-3/4"></div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserRound size={14} className="text-on-surface-variant" />
                <span className="text-[10px] text-on-surface-variant font-medium">Dr. Aris Thorne</span>
              </div>
              <div className="flex gap-4">
                <button onClick={handleDischarge} className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest transition-colors duration-200">
                  Discharge
                </button>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest">
                  Full Record
                </button>
              </div>
            </div>
          </div>

          {/* Confirm Reservation Card */}
          <div className="glass-panel rounded-[2rem] border border-outline-variant p-6 shadow-2xl relative overflow-hidden glow-primary/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16"></div>
            
            <h2 className="text-xl font-black font-headline mb-4 tracking-tight">Confirm Reservation</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-surface-container/80 rounded-xl border border-primary/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center glow-primary">
                  <Bed size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Selected Bed</p>
                  <h4 className="text-lg font-black font-headline tracking-tight">B-414</h4>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant font-medium">Admission Type</span>
                  <span className="text-xs font-bold">Scheduled / Post-Op</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant font-medium">Insurance</span>
                  <div className="flex items-center gap-2 text-tertiary">
                    <BadgeCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Premium Gold</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-outline-variant"></div>

              <div className="space-y-3">
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em]">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {[Wifi, Tv, Thermometer, Armchair].map((Icon, i) => (
                    <div key={i} className="bg-surface-container/50 p-2 rounded-lg border border-outline-variant text-on-surface-variant">
                      <Icon size={16} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full bg-gradient-to-r from-primary to-primary-dim hover:scale-[1.02] active:scale-[0.98] text-black font-headline font-black text-xs py-4 rounded-xl shadow-2xl shadow-primary/20 transition-all uppercase tracking-[0.2em]">
                  Confirm Reservation
                </button>
              </div>
            </div>
          </div>

          {/* Urgent Note */}
          <div className="bg-surface-low/50 backdrop-blur-md p-6 rounded-3xl border border-outline-variant flex items-start gap-4">
            <AlertTriangle size={18} className="text-error shrink-0" />
            <div>
              <p className="text-[10px] font-black text-on-surface uppercase tracking-widest mb-1">Urgent Note</p>
              <p className="text-[10px] text-on-surface-variant leading-relaxed font-medium">
                High influx expected for floor 4 within 2 hours.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {showDischargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-low border border-outline-variant rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4 font-headline flex items-center gap-2"><Sparkles className="text-primary"/> AI Discharge Summary</h2>
            <div className="bg-surface-highest p-4 rounded-xl min-h-[200px] text-xs text-on-surface-variant mb-6 whitespace-pre-wrap font-mono leading-relaxed border border-outline-variant/50 shadow-inner overflow-y-auto max-h-[50vh]">
              {dischargeSummary || "Generating secure discharge notes..."}
            </div>
            <div className="flex justify-end gap-4">
              <button className="text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setShowDischargeModal(false)}>Close</button>
              <button className="px-5 py-2.5 bg-primary hover:bg-primary-dim text-black font-bold text-xs rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-primary/20">Print / Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
