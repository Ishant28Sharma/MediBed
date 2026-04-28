"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, ChevronRight, LocateFixed, Plus, Minus, Sparkles, Loader2, Bot } from 'lucide-react';
import { HOSPITALS } from '../constants';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';
import { useGsapCounter } from '../hooks/useGsapCounter';
import dynamic from 'next/dynamic';

const DynamicHospitalMap = dynamic(() => import('./HospitalMap').then(mod => ({ default: mod.HospitalMap })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0e0e0f] flex items-center justify-center text-on-surface-variant text-sm">Loading map...</div>,
});

const AnimatedStat = ({ value }: { value: number }) => {
  const count = useGsapCounter(value);
  return <>{count < 10 && count > 0 ? `0${count}` : count}</>;
};

const HOSPITAL_COORDS: Record<string, [number, number]> = {
  'h1': [47.6062, -122.3321],
  'h2': [47.6200, -122.3300],
  'h3': [47.6000, -122.3500],
};

const DEFAULT_CENTER: [number, number] = [47.6100, -122.3350];

interface HospitalSearchProps {
  onSelectHospital?: (name: string) => void;
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transitionEnd: { transform: "none" }, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export const HospitalSearch: React.FC<HospitalSearchProps> = ({ onSelectHospital }) => {
  const [filter, setFilter] = useState('all');
  const [aiQuery, setAiQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState(HOSPITALS);
  const [aiMessage, setAiMessage] = useState('');
  const [hoveredHospital, setHoveredHospital] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    if (hoveredHospital) {
      const hospital = HOSPITALS.find(h => h.name === hoveredHospital);
      if (hospital && HOSPITAL_COORDS[hospital.id]) {
        setMapCenter(HOSPITALS.find(h => h.name === hoveredHospital) ? HOSPITAL_COORDS[hospital.id] : DEFAULT_CENTER);
        setMapZoom(15);
      }
    } else {
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(13);
    }
  }, [hoveredHospital]);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      setFilteredHospitals(HOSPITALS);
      setAiMessage('');
      return;
    }

    setIsSearching(true);
    setAiMessage('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Given this list of hospitals: ${JSON.stringify(HOSPITALS)}. The user is looking for: "${aiQuery}". 
        Return ONLY a JSON array of the hospital IDs that best match the user's needs. If none match perfectly, return the closest ones. Do not include markdown formatting like \`\`\`json. Just the raw array.`,
      });
      
      const text = response.text?.trim() || '[]';
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const matchedIds = JSON.parse(cleanText) as string[];
      
      if (matchedIds.length > 0) {
        setFilteredHospitals(HOSPITALS.filter(h => matchedIds.includes(h.id)));
        setAiMessage(`Found ${matchedIds.length} hospitals matching your needs.`);
      } else {
        setFilteredHospitals(HOSPITALS);
        setAiMessage("Couldn't find an exact match, showing all hospitals.");
      }
    } catch (error) {
      console.error('AI Search failed:', error);
      setFilteredHospitals(HOSPITALS);
      setAiMessage("AI search is currently unavailable.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10">
      {/* Hospital Content Section */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
        {/* AI Search Bar */}
        <motion.div variants={itemVariants} className="relative w-full group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors">
            {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          </div>
          <input 
            className="w-full bg-surface-container border border-outline-variant focus:border-tertiary/50 focus:ring-1 focus:ring-tertiary/30 rounded-2xl py-4 pl-12 pr-24 text-sm text-on-surface placeholder:text-on-surface-variant transition-all shadow-lg" 
            placeholder="Ask AI to find a hospital (e.g., 'I need an ICU bed nearby')" 
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
          />
          <button 
            onClick={handleAiSearch}
            disabled={isSearching || !aiQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-tertiary/20 text-tertiary hover:bg-tertiary/30 px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            Search
          </button>
        </motion.div>

        {aiMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-tertiary bg-tertiary/10 p-3 rounded-xl border border-tertiary/20 -mt-6">
            <Bot size={16} />
            {aiMessage}
          </motion.div>
        )}

        {/* Filters & Sorting */}
        <motion.section variants={itemVariants} className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-surface-low p-2 rounded-2xl">
            <button 
              onClick={() => setFilter('all')}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                filter === 'all' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              All Facilities
            </button>
            <button 
              onClick={() => setFilter('emergency')}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                filter === 'emergency' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Emergency Only
            </button>
            <button 
              onClick={() => setFilter('available')}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                filter === 'available' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Available Beds
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sort by:</span>
            <select className="bg-surface-container border-none text-sm text-on-surface focus:ring-1 focus:ring-primary/30 rounded-xl px-4 py-2 cursor-pointer outline-none">
              <option>Bed Availability</option>
              <option>Distance</option>
              <option>Hospital Rating</option>
            </select>
          </div>
        </motion.section>

        {/* Hospital Bento Grid */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredHospitals.map((hospital) => (
            <motion.article 
              key={hospital.id}
              whileHover={{ scale: 1.01 }}
              onHoverStart={() => setHoveredHospital(hospital.name)}
              onHoverEnd={() => setHoveredHospital(null)}
              className="glass-panel rounded-3xl p-8 transition-all duration-300 relative overflow-hidden group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6 gap-4">
                <div className="flex-1">
                  <h2 className="font-headline text-2xl font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                    {hospital.name}
                  </h2>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm mt-2">
                    <MapPin size={14} />
                    {hospital.distance} away • {hospital.location}
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-bold tracking-tighter uppercase flex items-center gap-1.5 shrink-0",
                  hospital.demand === 'high' ? "bg-primary/20 text-primary" : "bg-tertiary/20 text-tertiary"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", hospital.demand === 'high' ? "bg-primary" : "bg-tertiary")}></span>
                  {hospital.demand === 'high' ? 'High Demand' : 'Optimal Status'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-extrabold text-tertiary font-headline leading-none"><AnimatedStat value={hospital.generalBeds} /></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">General Beds</span>
                </div>
                <div className="flex flex-col gap-1 pl-6 border-l border-outline-variant">
                  <span className="text-3xl font-extrabold text-primary font-headline leading-none"><AnimatedStat value={hospital.icuUnits} /></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">ICU Units</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8 min-h-[32px]">
                {hospital.tags.map(tag => (
                  <span key={tag} className="bg-surface-container border border-outline-variant text-on-surface-variant px-3 py-1 rounded-lg text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex gap-4">
                <button 
                  onClick={() => onSelectHospital?.(hospital.name)}
                  className="flex-1 bg-primary text-black py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/10 active:scale-95 transition-all"
                >
                  Book Bed
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-surface-container rounded-xl text-on-surface-variant hover:text-on-surface transition-colors shrink-0">
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.article>
          ))}

          {/* Partner Card */}
          <motion.article variants={itemVariants} className="glass-panel rounded-3xl p-8 transition-all duration-300 relative overflow-hidden border border-outline-variant flex flex-col bg-gradient-to-br from-surface-container to-transparent">
            <div className="flex flex-col h-full items-center justify-center text-center py-6 px-4">
              <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mb-6 text-primary border border-violet-500/10">
                <Plus size={32} />
              </div>
              <h3 className="font-headline text-xl font-bold mb-3 text-on-surface">Partner with us?</h3>
              <p className="text-on-surface-variant text-sm mb-8 max-w-[240px] leading-relaxed">
                Register your facility to the Ether Network for real-time tracking and logistics.
              </p>
              <button className="border border-outline-variant hover:bg-surface-container text-on-surface px-8 py-3 rounded-xl text-sm font-bold transition-all">
                Learn More
              </button>
            </div>
          </motion.article>
        </motion.section>
      </div>

      {/* Map Panel */}
      <motion.div variants={itemVariants} className="hidden lg:block lg:col-span-4 h-[calc(100vh-8rem)] sticky top-28 z-10 self-start">
        <div className="w-full h-full glass-panel rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-outline-variant">
          {/* Realtime Map with Leaflet */}
          <DynamicHospitalMap
            hospitals={filteredHospitals}
            hoveredHospital={hoveredHospital}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            hospitalCoords={HOSPITAL_COORDS}
            defaultCenter={DEFAULT_CENTER}
            onRecenter={() => { setMapCenter(DEFAULT_CENTER); setMapZoom(13); }}
          />

          {/* Floating Map Controls */}
          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between pointer-events-none z-[1000]">
            <button 
              onClick={() => {
                setMapCenter(DEFAULT_CENTER);
                setMapZoom(13);
              }}
              className="bg-surface-highest/80 backdrop-blur-md text-on-surface px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider border border-outline-variant pointer-events-auto hover:bg-surface-container transition-colors"
            >
              <LocateFixed size={16} />
              Recenter
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

