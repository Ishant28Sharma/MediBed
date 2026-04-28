"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, Eye, Download, Activity, Pill, ExternalLink, RefreshCw, Sparkles, Loader2, Bot, Filter, Calendar as CalendarIcon, Upload, Trash2 } from 'lucide-react';
import { REPORTS as STATIC_REPORTS, PRESCRIPTIONS } from '../constants';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';
import { uploadMedicalReport } from '../lib/supabase';

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const [prescriptions, setPrescriptions] = useState(PRESCRIPTIONS);

  const handleDeletePrescription = (id: string) => {
    setPrescriptions(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteReport = async (id: string, isStatic: boolean) => {
    if (isStatic) return alert('Mock demonstration reports cannot be deleted.');
    try {
      const resp = await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
      if(resp.ok) await fetchReports();
      else alert('Failed to delete the report.');
    } catch(e) {
      console.error(e);
    }
  };
  
  // Filtering state
  const [selectedType, setSelectedType] = useState('All Reports');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch reports on mount
  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      if (!data.error) {
        // Fallback to static reports if DB is empty
        setReports(data.length > 0 ? data : STATIC_REPORTS);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      setReports(STATIC_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const uploadResult = await uploadMedicalReport(file, 'evelyn-123');
      
      // 2. Save metadata to Database
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadResult,
          type: file.type.includes('image') ? 'radiology' : 'blood', // Defaulting for now
          email: 'evelyn@example.com',
          date: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // 3. Refresh list
      await fetchReports();
      alert('Report uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload report.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // Type filter
      if (selectedType !== 'All Reports') {
        const typeMap: Record<string, string> = {
          'Blood Analysis': 'blood',
          'Radiology': 'radiology',
          'Cardiology': 'cardiology',
          'Immunology': 'immunology'
        };
        if (report.type !== typeMap[selectedType]) return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && report.status !== selectedStatus) {
        return false;
      }

      // Date filter
      if (startDate && new Date(report.date) < new Date(startDate)) return false;
      if (endDate && new Date(report.date) > new Date(endDate)) return false;

      return true;
    });
  }, [selectedType, selectedStatus, startDate, endDate]);

  const handleSummarize = async (reportId: string, reportTitle: string, reportType: string) => {
    if (summaries[reportId] || loadingSummaries[reportId]) return;

    setLoadingSummaries(prev => ({ ...prev, [reportId]: true }));
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Summarize this medical report in 2 simple sentences for a patient: Title: ${reportTitle}, Type: ${reportType}. Assume the results are generally normal but advise consulting their doctor.`,
      });
      setSummaries(prev => ({ ...prev, [reportId]: response.text || 'Summary unavailable.' }));
    } catch (error) {
      console.error('Failed to summarize report:', error);
      setSummaries(prev => ({ ...prev, [reportId]: 'Failed to generate summary.' }));
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [reportId]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Left Column: Reports History */}
      <div className="xl:col-span-8 space-y-8">
        <motion.section variants={itemVariants}>
          <div className="flex flex-col mb-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Medical Reports</h1>
                <p className="text-on-surface-variant mt-1">Access your full clinical history and diagnostic results.</p>
              </div>
              <div className="flex gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-3 rounded-2xl bg-primary text-black border border-primary transition-all flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  <span className="text-sm font-bold hidden sm:inline">Upload Report</span>
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all flex items-center gap-2",
                    showFilters 
                      ? "bg-primary/10 border-primary/30 text-primary" 
                      : "bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-high"
                  )}
                >
                  <Filter size={18} />
                  <span className="text-sm font-bold hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              className="bg-surface-low glass-panel p-6 rounded-3xl border border-outline-variant"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date Range</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl py-2 pl-9 pr-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <span className="text-on-surface-variant">-</span>
                    <div className="relative flex-1">
                      <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl py-2 pl-9 pr-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</label>
                  <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant">
                    {['all', 'completed', 'pending'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                          "flex-1 py-1.5 text-sm font-semibold rounded-lg capitalize transition-all",
                          selectedStatus === status 
                            ? "bg-surface-high text-on-surface shadow-sm" 
                            : "text-on-surface-variant hover:text-on-surface"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Clear Filters */}
                <div className="flex items-end justify-end">
                  <button 
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSelectedStatus('all');
                      setSelectedType('All Reports');
                    }}
                    className="text-sm text-primary hover:text-primary-hover font-semibold transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-wrap gap-3 mb-10">
            {['All Reports', 'Blood Analysis', 'Radiology', 'Cardiology', 'Immunology'].map((filter) => (
              <button 
                key={filter}
                onClick={() => setSelectedType(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                  selectedType === filter ? "bg-primary text-black" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="space-y-6 relative before:absolute before:left-[1.25rem] before:top-4 before:bottom-4 before:w-px before:bg-outline-variant">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No reports found matching your filters.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <motion.div 
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative pl-12"
                >
                <div className="absolute left-0 top-2 w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-primary z-10">
                  <FileText size={18} />
                </div>
                
                <div className="glass-panel p-6 rounded-3xl group hover:bg-surface-container transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
                        {report.type}
                      </span>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {report.title}
                        {report.status === 'pending' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 uppercase tracking-wider">Pending</span>
                        )}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • Dr. Elena Vance
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSummarize(report.id, report.title, report.type)}
                        disabled={loadingSummaries[report.id]}
                        className="p-2 rounded-xl bg-tertiary/10 text-tertiary hover:bg-tertiary/20 transition-all flex items-center gap-2 text-xs font-bold disabled:opacity-50"
                        title="AI Summary"
                      >
                        {loadingSummaries[report.id] ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        <span className="hidden sm:inline">AI Summary</span>
                      </button>
                      <button 
                        onClick={() => report.url ? window.open(report.url, '_blank') : alert('Document linked to this report is unavailable.')}
                        className="p-2 rounded-xl bg-surface-container hover:bg-surface-high text-on-surface-variant hover:text-primary transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => report.url ? window.open(report.url, '_blank') : alert('Document linked to this report is unavailable.')}
                        className="p-2 rounded-xl bg-surface-container hover:bg-surface-high text-on-surface-variant hover:text-primary transition-all"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteReport(report.id, !report.url)}
                        className="p-2 rounded-xl bg-surface-container hover:bg-surface-high text-on-surface-variant hover:text-red-500 transition-all"
                        title="Delete Report"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {summaries[report.id] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      className="mt-4 mb-4 p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl text-sm text-on-surface flex items-start gap-3"
                    >
                      <Bot size={18} className="text-tertiary shrink-0 mt-0.5" />
                      <p>{summaries[report.id]}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )))}
          </div>
        </motion.section>
      </div>

      {/* Right Column: Prescriptions & Wellness */}
      <div className="xl:col-span-4 space-y-8">
        <motion.section variants={itemVariants} className="bg-surface-low p-8 rounded-3xl border border-outline-variant">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-headline font-bold">Prescriptions</h3>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active ({prescriptions.length})</span>
          </div>
          
          <div className="space-y-4">
            {prescriptions.map((p) => (
              <div key={p.id} className="p-5 bg-surface-container rounded-2xl border border-outline-variant">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold">{p.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Expires: {p.expires}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-tighter",
                      p.status === 'active' ? "bg-tertiary/20 text-tertiary" : "bg-orange-400/20 text-orange-400"
                    )}>
                      {p.status === 'active' ? 'Refillable' : 'Refill Pending'}
                    </span>
                    <button 
                      onClick={() => handleDeletePrescription(p.id)}
                      className="p-1.5 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Prescription"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  {p.instructions}
                </p>
                <button className="flex items-center gap-2 text-[10px] font-bold text-primary hover:underline">
                  <RefreshCw size={12} />
                  RE-BOOK REFILL
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all">
            VIEW ARCHIVE
          </button>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-surface-low p-8 rounded-3xl border border-outline-variant relative overflow-hidden">
          <h3 className="text-lg font-headline font-bold mb-6">Wellness Score</h3>
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#c29bff" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="45" strokeLinecap="round" className="glow-line" />
              </svg>
              <span className="absolute text-2xl font-extrabold">82</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Your health status is</p>
              <p className="text-xl font-bold text-tertiary">Optimal</p>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Based on your last 3 metabolic panels and vitals tracking, your health trend is improving.
          </p>
        </motion.section>
      </div>
    </div>
  );
};
