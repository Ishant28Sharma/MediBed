"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ChevronRight, 
  Calendar, 
  Info,
  Activity,
  ArrowLeft,
  Sparkles,
  Bot,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

const DATA = [
  { day: 'Mon', value: 172.1 },
  { day: 'Tue', value: 172.3 },
  { day: 'Wed', value: 172.2 },
  { day: 'Thu', value: 172.5 },
  { day: 'Fri', value: 172.4 },
  { day: 'Sat', value: 172.7 },
  { day: 'Sun', value: 172.8 },
];

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export const FlowTracker: React.FC = () => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const fetchInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Analyze this height/posture data for the last 7 days: ${JSON.stringify(DATA)}. Give a 2-sentence encouraging insight about the trend.`,
      });
      setAiInsight(response.text || 'Your posture is improving steadily. Keep up the good work!');
    } catch (error) {
      console.error('Failed to fetch AI insight:', error);
      setAiInsight('Your posture is improving steadily. Keep up the good work!');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <TrendingUp size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Enhanced Flow Tracker</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight text-on-surface">
            Height <span className="text-primary">Flow</span>
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-md">
            Detailed analysis of your height fluctuations and posture alignment over the last 7 days.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-variant/50 backdrop-blur-md border border-outline-variant p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Current Height</div>
              <div className="text-xl font-headline font-bold">172.8 cm</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Chart Section */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-8 rounded-[2rem] border border-outline-variant shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
            <button 
              onClick={fetchInsight}
              disabled={isLoadingInsight}
              className="flex items-center gap-2 text-xs font-bold text-tertiary bg-tertiary/10 px-3 py-1.5 rounded-full border border-tertiary/20 hover:bg-tertiary/20 transition-colors disabled:opacity-50"
            >
              {isLoadingInsight ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              AI Insight
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-full border border-success/20">
              <ArrowUpRight size={14} />
              +0.7 cm this week
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-headline font-bold mb-1">Height Progression</h3>
            <p className="text-sm text-on-surface-variant">Weekly posture and spinal decompression tracking</p>
            {aiInsight && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mt-4 p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl text-sm text-on-surface flex items-start gap-3"
              >
                <Bot size={18} className="text-tertiary shrink-0 mt-0.5" />
                <p>{aiInsight}</p>
              </motion.div>
            )}
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  domain={[171, 174]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
                />
                <ReferenceLine y={172.5} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" label={{ value: 'Target', position: 'right', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-[2rem] border border-outline-variant shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Info size={20} />
              </div>
              <h4 className="font-headline font-bold">Posture Insight</h4>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              Your height is peak in the morning (172.8cm) and decreases by 0.4cm by evening. This is a healthy spinal compression range.
            </p>
            <button className="w-full py-3 rounded-xl bg-surface-container hover:bg-surface-high text-xs font-bold uppercase tracking-widest transition-all border border-outline-variant">
              View Posture Exercises
            </button>
          </div>

          <div className="glass-panel p-6 rounded-[2rem] border border-outline-variant shadow-xl bg-gradient-to-br from-primary/10 to-transparent">
            <h4 className="font-headline font-bold mb-4">Monthly Goal</h4>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                <span className="text-on-surface-variant">Spinal Alignment</span>
                <span className="text-primary">85%</span>
              </div>
              <div className="h-2 w-full bg-outline-variant rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-primary glow-primary"
                />
              </div>
              <p className="text-[11px] text-on-surface-variant italic">
                You're 5% away from your optimal posture goal. Keep up the morning stretches!
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-[2rem] border border-outline-variant shadow-xl flex items-center justify-between group cursor-pointer hover:bg-surface-container transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                <Calendar size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Next Scan</div>
                <div className="font-headline font-bold">Tomorrow, 08:00 AM</div>
              </div>
            </div>
            <ChevronRight className="text-on-surface-variant group-hover:text-primary transition-all group-hover:translate-x-1" />
          </div>
        </div>
      </motion.section>

      {/* History Table */}
      <motion.section variants={itemVariants} className="glass-panel rounded-[2rem] border border-outline-variant shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-outline-variant flex items-center justify-between">
          <h3 className="text-xl font-headline font-bold">Historical Data</h3>
          <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Download CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline-variant">
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Morning (cm)</th>
                <th className="px-8 py-6">Evening (cm)</th>
                <th className="px-8 py-6">Variance</th>
                <th className="px-8 py-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { date: 'Mar 24, 2026', morning: '172.8', evening: '172.4', variance: '0.4', status: 'Optimal' },
                { date: 'Mar 23, 2026', morning: '172.7', evening: '172.3', variance: '0.4', status: 'Optimal' },
                { date: 'Mar 22, 2026', morning: '172.5', evening: '172.1', variance: '0.4', status: 'Good' },
                { date: 'Mar 21, 2026', morning: '172.4', evening: '171.9', variance: '0.5', status: 'Good' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-surface-container transition-colors group">
                  <td className="px-8 py-6 text-sm font-bold">{row.date}</td>
                  <td className="px-8 py-6 text-sm text-on-surface-variant font-mono">{row.morning}</td>
                  <td className="px-8 py-6 text-sm text-on-surface-variant font-mono">{row.evening}</td>
                  <td className="px-8 py-6 text-sm text-on-surface-variant font-mono">{row.variance}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                      row.status === 'Optimal' ? "text-success border-success/20 bg-success/10" : "text-primary border-primary/20 bg-primary/10"
                    )}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
};
