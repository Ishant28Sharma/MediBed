"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Brain, 
  Activity, 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  Star,
  FileText,
  ExternalLink,
  Clock,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

const SPECIALTIES = [
  { id: 'cardiology', label: 'Cardiology', icon: Heart },
  { id: 'neurology', label: 'Neurology', icon: Brain },
  { id: 'oncology', label: 'Oncology', icon: Activity },
  { id: 'dermatology', label: 'Dermatology', icon: Stethoscope },
];

const DOCTORS = [
  { 
    id: 'd1', 
    name: 'Dr. Alistair Vance', 
    rating: 4.9, 
    reviews: 124, 
    avatar: 'https://picsum.photos/seed/doc1/100/100' 
  },
  { 
    id: 'd2', 
    name: 'Dr. Elena Kostic', 
    rating: 4.8, 
    reviews: 98, 
    avatar: 'https://picsum.photos/seed/doc2/100/100' 
  },
];

const TIME_SLOTS = [
  '09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'
];

const DAYS = [
  { day: 'M', date: 25, currentMonth: false },
  { day: 'T', date: 26, currentMonth: false },
  { day: 'W', date: 1, currentMonth: true },
  { day: 'T', date: 2, currentMonth: true },
  { day: 'F', date: 3, currentMonth: true },
  { day: 'S', date: 4, currentMonth: true },
  { day: 'S', date: 5, currentMonth: true },
];

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export const AppointmentBooking: React.FC = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('cardiology');
  const [selectedDoctor, setSelectedDoctor] = useState('d1');
  const [selectedDate, setSelectedDate] = useState(3);
  const [selectedTime, setSelectedTime] = useState('10:30 AM');
  
  const [isBooking, setIsBooking] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsBooking(true);
    setError(null);
    try {
      const doctor = DOCTORS.find(d => d.id === selectedDoctor);
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          doctorName: doctor?.name,
          specialty: selectedSpecialty,
          date: `2026-11-0${selectedDate}`, // Corrected year for 2026
          time: selectedTime,
          hospitalName: 'St. Etheria Medical Center'
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setBookingRef(data.id.slice(0, 8).toUpperCase());
    } catch (err) {
      console.error('Booking failed:', err);
      setError('Connection failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (bookingRef) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-12 rounded-[3rem] border-primary/20 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-tertiary to-primary"></div>
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <CheckCircle2 size={48} className="text-primary animate-pulse" />
          </div>
          <h2 className="text-4xl font-extrabold font-headline mb-4 tracking-tight">Request Received</h2>
          <p className="text-on-surface-variant text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Your appointment with <span className="text-on-surface font-bold">{DOCTORS.find(d => d.id === selectedDoctor)?.name}</span> has been requested and is <span className="text-tertiary font-bold">awaiting approval</span>.
          </p>
          
          <div className="bg-surface-container/60 rounded-3xl p-6 mb-10 border border-outline-variant grid grid-cols-2 gap-6 text-left">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Reference ID</p>
              <p className="text-xl font-bold font-headline text-primary">#{bookingRef}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Time Slot</p>
              <p className="text-xl font-bold font-headline">{selectedTime}</p>
            </div>
          </div>

          <button 
            onClick={() => setBookingRef(null)}
            className="px-10 py-4 bg-surface-highest hover:bg-surface-high border border-outline-variant rounded-2xl font-bold transition-all active:scale-95 flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} className="rotate-180" />
            Book Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Left Column: Booking Flow */}
      <div className="xl:col-span-8 space-y-8">
        <motion.section variants={itemVariants}>
          <div className="flex flex-col mb-6">
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Book an Appointment</h1>
            <p className="text-on-surface-variant mt-1">Select your specialist and preferred time slot.</p>
          </div>

          <div className="bg-surface-low/60 glass-panel rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Steps 1, 2, 3 */}
              <div className="space-y-10">
                <div className="booking-step">
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">01</span>
                    Select Specialty
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {SPECIALTIES.map((s) => (
                      <button 
                        key={s.id}
                        onClick={() => setSelectedSpecialty(s.id)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all text-left group",
                          selectedSpecialty === s.id 
                            ? "bg-surface-container border-primary shadow-lg shadow-primary/5" 
                            : "bg-surface-container/40 border-outline-variant hover:border-primary/50 text-on-surface-variant"
                        )}
                      >
                        <s.icon size={20} className={cn("mb-2 transition-colors", selectedSpecialty === s.id ? "text-primary" : "group-hover:text-primary")} />
                        <span className={cn("text-sm font-bold block", selectedSpecialty === s.id ? "text-on-surface" : "")}>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="booking-step">
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">02</span>
                    Select Hospital
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl border-2 border-primary shadow-lg shadow-primary/5 transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                        <Activity size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-on-surface">St. Etheria Medical Center</h4>
                        <p className="text-[10px] text-on-surface-variant font-medium">2.4 miles away • Emergency Dept Available</p>
                      </div>
                      <CheckCircle2 size={20} className="text-primary" />
                    </div>
                  </div>
                </div>

                <div className="booking-step">
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">03</span>
                    Choose Physician
                  </label>
                  <div className="space-y-3">
                    {DOCTORS.map((doc) => (
                      <div 
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc.id)}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer group",
                          selectedDoctor === doc.id 
                            ? "bg-surface-container border-primary/40 shadow-lg" 
                            : "bg-surface-container/40 border-outline-variant hover:border-primary/30"
                        )}
                      >
                        <img src={doc.avatar} alt={doc.name} className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-md" />
                        <div className="flex-1">
                          <h4 className={cn("text-sm font-bold transition-colors", selectedDoctor === doc.id ? "text-primary" : "text-on-surface")}>{doc.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-bold mt-0.5">
                            <span className="flex items-center gap-1 text-tertiary">
                              <Star size={12} fill="currentColor" />
                              {doc.rating}
                            </span>
                            <span>• {doc.reviews} REVIEWS</span>
                          </div>
                        </div>
                        <AnimatePresence>
                          {selectedDoctor === doc.id && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <CheckCircle2 size={20} className="text-primary" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Steps 4, 5 */}
              <div className="space-y-10">
                <div className="booking-step">
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">04</span>
                    Date & Availability
                  </label>
                  <div className="bg-surface-container rounded-3xl p-5 border border-outline-variant shadow-inner">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        <span className="text-sm font-bold font-headline uppercase tracking-tighter">October 2023</span>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 hover:bg-surface-highest rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                        <button className="p-2 hover:bg-surface-highest rounded-lg transition-colors"><ChevronRight size={16} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-[9px] mb-4 text-on-surface-variant font-black uppercase tracking-widest">
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map((d, i) => (
                        <button 
                          key={i}
                          onClick={() => d.currentMonth && setSelectedDate(d.date)}
                          className={cn(
                            "aspect-square flex flex-col items-center justify-center text-xs rounded-xl transition-all border",
                            !d.currentMonth ? "opacity-20 cursor-not-allowed border-transparent" : 
                            selectedDate === d.date ? "bg-primary text-black font-black border-primary shadow-lg shadow-primary/20" : 
                            "border-outline-variant hover:border-primary/50 text-on-surface-variant"
                          )}
                        >
                          {d.date}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="booking-step">
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">05</span>
                    Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {TIME_SLOTS.map((time) => (
                      <button 
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-3 px-2 text-[10px] font-bold rounded-xl border transition-all flex flex-col items-center gap-1",
                          selectedTime === time 
                            ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5" 
                            : "border-outline-variant hover:border-primary/50 text-on-surface-variant bg-surface-container/20"
                        )}
                      >
                        <Clock size={12} />
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-xl bg-error/10 text-error text-xs border border-error/20">
                      <AlertCircle size={14} />
                      {error}
                    </motion.div>
                  )}
                  <button 
                    onClick={handleConfirm}
                    disabled={isBooking}
                    className="w-full py-5 bg-gradient-to-r from-primary to-primary-dim text-black font-black rounded-[1.25rem] shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Request
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-on-surface-variant font-medium">By confirming, you agree to our Medical Service Terms.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Right Column: Information & Notes */}
      <div className="xl:col-span-4 space-y-8">
        <motion.section variants={itemVariants} className="bg-surface-container rounded-3xl p-8 border border-outline-variant shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FileText size={20} />
            </div>
            <h3 className="text-xl font-bold font-headline tracking-tight text-on-surface">Digital Prescription</h3>
          </div>
          
          <div className="bg-surface-low/80 backdrop-blur-sm rounded-[1.5rem] p-6 border border-outline-variant mb-8 group hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[9px] font-black text-tertiary uppercase tracking-[0.2em]">Active Protocol</span>
                <h4 className="text-xl font-bold mt-1 text-on-surface">Lisinopril 10mg</h4>
              </div>
              <button className="p-2 hover:bg-surface-container rounded-xl transition-colors text-on-surface-variant hover:text-primary">
                <ExternalLink size={18} />
              </button>
            </div>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Take 1 tablet daily in the morning for blood pressure management. Linked to your latest Cardiac Checkup.
            </p>
            <div className="flex items-center justify-between pt-5 border-t border-outline-variant/50">
              <span className="text-[10px] text-on-surface-variant font-bold italic">Refills: 02 Remaining</span>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-dim transition-colors">Request Refill</button>
            </div>
          </div>

          <div className="space-y-4 p-5 bg-tertiary/5 rounded-2xl border border-tertiary/10">
            <div className="flex items-center gap-2 text-tertiary">
              <Activity size={14} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Physician's Summary</h4>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed italic">
              "Patient shows steady improvement in cardiovascular health. Continue current regimen and monitor resting heart rate between visits."
            </p>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-gradient-to-br from-indigo-950/40 to-violet-950/20 rounded-[2rem] p-8 border border-primary/20 relative overflow-hidden shadow-2xl group">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold font-headline mb-6 tracking-tight text-on-surface">Pre-Visit Prep</h3>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 mt-0.5 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Fast for 8 hours</p>
                  <p className="text-[11px] text-on-surface-variant leading-tight">Necessary for accurate blood work and glucose levels.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 mt-0.5 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Bring ECG Reports</p>
                  <p className="text-[11px] text-on-surface-variant leading-tight">Physical copies or link your digital vault records.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start opacity-40 group-hover:opacity-60 transition-opacity">
                <div className="w-6 h-6 mt-0.5 rounded-full border-2 border-outline-variant flex items-center justify-center shrink-0">
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Update Insurance</p>
                  <p className="text-[11px] text-on-surface-variant leading-tight">Verify latest coverage for outpatient procedures.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all"></div>
        </motion.section>
      </div>
    </div>
  );
};
