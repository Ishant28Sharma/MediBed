"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, HeartPulse, Activity, Brain, Wind, PhoneCall, Ambulance, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { HOSPITALS } from '../constants';
import { cn } from '../lib/utils';

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const EMERGENCY_TYPES = [
  { id: 'cardiac', label: 'Cardiac Arrest / Chest Pain', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { id: 'trauma', label: 'Severe Trauma / Bleeding', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { id: 'respiratory', label: 'Breathing Difficulty', icon: Wind, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'neuro', label: 'Stroke / Neurological', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'other', label: 'Other Emergency', icon: Activity, color: 'text-on-surface-variant', bg: 'bg-surface-container', border: 'border-outline-variant' },
];

export const Emergency: React.FC = () => {
  const [step, setStep] = useState<'type' | 'hospital' | 'booked'>('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Get nearest hospital (mock logic: just pick the first one with emergency services)
  const nearestHospital = HOSPITALS.find(h => h.tags.includes('Emergency')) || HOSPITALS[0];

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    setStep('hospital');
  };

  const handleBookEmergency = () => {
    setStep('booked');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col mb-8 text-center">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight text-error flex items-center justify-center gap-3">
          <AlertTriangle size={36} className="animate-pulse" />
          Emergency Response
        </h1>
        <p className="text-on-surface-variant mt-2 text-lg">Immediate priority routing and dispatch.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'type' && (
          <motion.div 
            key="type"
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center mb-8">What is the nature of the emergency?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EMERGENCY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type.id)}
                  className={cn(
                    "glass-panel p-6 rounded-3xl flex flex-col items-center justify-center gap-4 text-center transition-all hover:scale-105",
                    type.bg, type.border, "border-2 hover:shadow-xl"
                  )}
                >
                  <type.icon size={48} className={type.color} />
                  <span className="font-bold text-lg">{type.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'hospital' && (
          <motion.div 
            key="hospital"
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-8"
          >
            <div className="glass-panel p-8 rounded-3xl border-2 border-error/30 bg-error/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-error animate-pulse" />
              
              <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="inline-flex items-center gap-2 bg-error/20 text-error px-3 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
                    <MapPin size={16} /> Nearest Facility Found
                  </div>
                  <h2 className="text-3xl font-extrabold">{nearestHospital.name}</h2>
                  <p className="text-on-surface-variant flex items-center gap-2">
                    <Clock size={18} /> {nearestHospital.distance} away • 5 min wait time
                  </p>
                  
                  <div className="flex items-center gap-4 mt-6 p-4 bg-surface-container rounded-2xl border border-outline-variant">
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-600 rounded-full flex items-center justify-center animate-bounce">
                      <Ambulance size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Ambulance Available</h4>
                      <p className="text-sm text-on-surface-variant">Estimated arrival: 3-5 minutes</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto min-w-[250px]">
                  <a 
                    href="tel:911" 
                    className="w-full py-4 rounded-2xl bg-error text-on-error font-bold text-lg flex items-center justify-center gap-3 hover:bg-red-700 transition-colors shadow-lg shadow-error/30"
                  >
                    <PhoneCall size={24} />
                    Call 911 Now
                  </a>
                  <button 
                    onClick={handleBookEmergency}
                    className="w-full py-4 rounded-2xl bg-surface-highest text-on-surface font-bold text-lg flex items-center justify-center gap-3 hover:bg-surface-container transition-colors border border-outline-variant"
                  >
                    <ArrowRight size={24} />
                    Book Emergency Intake
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setStep('type')}
                className="text-on-surface-variant hover:text-on-surface underline text-sm"
              >
                Change Emergency Type
              </button>
            </div>
          </motion.div>
        )}

        {step === 'booked' && (
          <motion.div 
            key="booked"
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="glass-panel p-12 rounded-3xl text-center space-y-6 max-w-2xl mx-auto border-2 border-green-500/30 bg-green-500/5"
          >
            <div className="w-24 h-24 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-extrabold">Emergency Intake Confirmed</h2>
            <p className="text-lg text-on-surface-variant">
              {nearestHospital.name} has been notified of your incoming arrival. Priority status has been granted for a <strong>{EMERGENCY_TYPES.find(t => t.id === selectedType)?.label}</strong>.
            </p>
            <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant mt-8 text-left space-y-4">
              <h3 className="font-bold text-xl border-b border-outline-variant pb-2">Instructions:</h3>
              <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
                <li>If you requested an ambulance, stay where you are. It is en route.</li>
                <li>If driving, proceed directly to the Emergency Room entrance.</li>
                <li>Have your ID and insurance card ready if possible, but do not delay transit.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
