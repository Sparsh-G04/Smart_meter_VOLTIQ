'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend,
} from 'recharts';
import { Zap, Sun, Moon, TrendingDown, Check, ArrowRight, Sparkles, CalendarClock } from 'lucide-react';
import { useVoltStore } from '@/lib/store';

// Hourly usage data for today
const hourlyData = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const isPeak = hour >= 10 && hour <= 14 || hour >= 18 && hour <= 22;
  const isMid = hour >= 6 && hour <= 10 || hour >= 14 && hour <= 18;
  const base = isPeak ? 1.8 + Math.random() * 0.8 : isMid ? 1.0 + Math.random() * 0.5 : 0.3 + Math.random() * 0.3;
  return {
    hour: `${hour}:00`,
    usage: Math.round(base * 100) / 100,
    tariff: isPeak ? 'Peak' : isMid ? 'Mid' : 'Sasta',
    rate: isPeak ? 8.5 : isMid ? 5.2 : 3.1,
  };
});

// Weekly data
const weeklyData = [
  { day: 'Mon', usage: 12.4, target: 10, cost: 86 },
  { day: 'Tue', usage: 10.8, target: 10, cost: 72 },
  { day: 'Wed', usage: 14.2, target: 10, cost: 105 },
  { day: 'Thu', usage: 9.6, target: 10, cost: 64 },
  { day: 'Fri', usage: 11.1, target: 10, cost: 78 },
  { day: 'Sat', usage: 15.8, target: 10, cost: 118 },
  { day: 'Sun', usage: 13.5, target: 10, cost: 96 },
];

// Tariff time slots
const tariffSlots = [
  { label: 'Morning', range: '05:00 – 11:00', rate: 7, color: 'text-volt-amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { label: 'Afternoon', range: '11:00 – 17:00', rate: 6, color: 'text-volt-green', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { label: 'Evening Peak', range: '17:00 – 23:00', rate: 9, color: 'text-volt-red', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { label: 'Night Off-Peak', range: '23:00 – 05:00', rate: 5, color: 'text-volt-blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
];

// Tariff rates per slot (₹/kWh)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _tariffRates: { start: number; end: number; rate: number; label: string }[] = [
  { start: 5, end: 11, rate: 7, label: 'Morning' },
  { start: 11, end: 17, rate: 6, label: 'Afternoon' },
  { start: 17, end: 23, rate: 9, label: 'Evening Peak' },
  { start: 23, end: 5, rate: 5, label: 'Night Off-Peak' },
];

function formatHour(h: number, m: number = 0): string {
  const wrapped = ((h % 24) + 24) % 24;
  return `${wrapped.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getTariffRate(hour: number): number {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5 && h < 11) return 7;
  if (h >= 11 && h < 17) return 6;
  if (h >= 17 && h < 23) return 9;
  return 5; // 23-5
}

function parseSchedule(schedule: string): { startH: number; startM: number; endH: number; endM: number; duration: number } {
  const parts = schedule.split(' – ');
  if (parts.length < 2) {
    const [h, m] = parts[0].split(':').map(Number);
    return { startH: h || 0, startM: m || 0, endH: ((h || 0) + 3) % 24, endM: m || 0, duration: 3 };
  }
  const [sH, sM] = parts[0].split(':').map(Number);
  const [eH, eM] = parts[1].split(':').map(Number);
  let duration = (eH || 0) - (sH || 0);
  if (duration <= 0) duration += 24;
  return { startH: sH || 0, startM: sM || 0, endH: eH || 0, endM: eM || 0, duration: Math.min(duration, 12) };
}

// Generate optimized schedule: shift to cheapest tariff slot while keeping same duration
function generateOptimizedSchedule(manualTime: string): string {
  const { startH, startM, duration } = parseSchedule(manualTime);
  const currentRate = getTariffRate(startH);

  // Best cheap windows to shift to (sorted cheapest first)
  const cheapWindows = [
    { start: 23, rate: 5 },  // Night off-peak ₹5
    { start: 11, rate: 6 },  // Afternoon ₹6
    { start: 5, rate: 7 },   // Morning ₹7
  ];

  for (const window of cheapWindows) {
    if (window.rate < currentRate) {
      // Place the appliance at the start of this cheaper window
      const newStart = window.start;
      const newEnd = (newStart + duration) % 24;
      return `${formatHour(newStart, startM)} – ${formatHour(newEnd, startM)}`;
    }
  }

  // Already in cheapest slot — keep same
  return manualTime;
}

function getScheduleSavings(manualTime: string, kw: number, dailyHours: number): number {
  const { startH } = parseSchedule(manualTime);
  const currentRate = getTariffRate(startH);
  const optimized = generateOptimizedSchedule(manualTime);
  const { startH: optH } = parseSchedule(optimized);
  const optRate = getTariffRate(optH);
  const diff = currentRate - optRate;
  if (diff <= 0) return 0;
  return Math.round(kw * dailyHours * diff);
}

export default function EnergyUsagePage() {
  const [view, setView] = useState<'today' | 'week'>('today');
  const appliances = useVoltStore(state => state.appliances);
  const scheduleChoices = useVoltStore(state => state.scheduleChoices);
  const setScheduleChoice = useVoltStore(state => state.setScheduleChoice);
  const totalToday = hourlyData.reduce((sum, h) => sum + h.usage, 0);
  const peakUsage = hourlyData.filter(h => h.tariff === 'Peak').reduce((s, h) => s + h.usage, 0);
  const sastaUsage = hourlyData.filter(h => h.tariff === 'Sasta').reduce((s, h) => s + h.usage, 0);

  const getChoice = (id: string): 'manual' | 'optimized' => scheduleChoices[id] || 'manual';

  // Build schedule data from appliances
  const applianceSchedules = appliances.map(app => {
    const manualTime = app.schedule || `${String(Math.floor(8 + Math.random() * 10)).padStart(2, '0')}:00 – ${String(Math.floor(11 + Math.random() * 10)).padStart(2, '0')}:00`;
    const optimizedTime = generateOptimizedSchedule(manualTime);
    const savings = getScheduleSavings(manualTime, app.kw, app.dailyHours);
    const choice = getChoice(app.id);
    return {
      id: app.id,
      name: app.name,
      kw: app.kw,
      dailyHours: app.dailyHours,
      category: app.category,
      manualTime,
      optimizedTime,
      savings,
      choice,
      realTime: choice === 'optimized' ? optimizedTime : manualTime,
    };
  });

  const totalSavings = applianceSchedules
    .filter(a => a.choice === 'optimized')
    .reduce((sum, a) => sum + a.savings, 0);

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 min-h-screen bg-[#0a0f1c]">
      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: 'Today\'s Usage', value: `${totalToday.toFixed(1)} kWh`, color: 'text-volt-cyan', bg: 'bg-cyan-500/10' },
            { icon: TrendingDown, label: 'Saved Today', value: '₹47', color: 'text-volt-green', bg: 'bg-green-500/10' },
            { icon: Sun, label: 'Peak Hours Used', value: `${peakUsage.toFixed(1)} kWh`, color: 'text-volt-red', bg: 'bg-red-500/10' },
            { icon: Moon, label: 'Sasta Hours Used', value: `${sastaUsage.toFixed(1)} kWh`, color: 'text-volt-green', bg: 'bg-green-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-light rounded-2xl p-5 group hover:shadow-lg transition-all"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-light rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Energy Consumption</h2>
              <p className="text-sm text-gray-500">Hourly breakdown with tariff zones</p>
            </div>
            <div className="flex bg-white/10 rounded-xl p-1">
              {['today', 'week'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as 'today' | 'week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    view === v ? 'bg-white/15 shadow-sm text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {v === 'today' ? 'Today' : 'This Week'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              {view === 'today' ? (
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00BCD4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis tick={{ fontSize: 11 }} unit=" kWh" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value) => [`${value} kWh`, 'Usage']}
                  />
                  <Area type="monotone" dataKey="usage" stroke="#00BCD4" strokeWidth={2} fill="url(#usageGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={weeklyData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit=" kWh" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="usage" name="Actual" fill="#1B4F8A" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#2E7D32" radius={[6, 6, 0, 0]} opacity={0.4} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Tariff zone legend */}
          {view === 'today' && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
              {tariffSlots.map((zone) => (
                <div key={zone.label} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className={`w-3 h-3 rounded-full ${zone.bg} border ${zone.border}`} />
                  <span>{zone.label}</span>
                  <span className={`font-semibold ${zone.color}`}>₹{zone.rate}/kWh</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ===== 3-COLUMN SCHEDULE SECTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-light rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-volt-cyan" />
                Appliance Schedules
              </h2>
              <p className="text-sm text-gray-500">Compare manual vs optimized schedules and choose what to follow</p>
            </div>
            {totalSavings > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-volt-green/10 border border-volt-green/20 rounded-xl">
                <Sparkles className="w-4 h-4 text-volt-green" />
                <span className="text-sm font-bold text-volt-green">Saving ₹{totalSavings}/day with optimized picks</span>
              </div>
            )}
          </div>

          {appliances.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">Add appliances first to see schedule options</p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 mb-3 px-2">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Appliance</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Manual Schedule</div>
                <div className="text-[10px] font-bold text-volt-cyan uppercase tracking-wider text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> Optimized Schedule
                </div>
                <div className="text-[10px] font-bold text-volt-green uppercase tracking-wider text-center">Real Schedule</div>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {applianceSchedules.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 items-center"
                  >
                    {/* Col 1: Appliance info */}
                    <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                      <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500">{item.kw} kW · {item.dailyHours}h/day</p>
                      </div>
                    </div>

                    {/* Col 2: Manual Schedule */}
                    <button
                      onClick={() => setScheduleChoice(item.id, 'manual')}
                      className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        item.choice === 'manual'
                          ? 'border-volt-blue/50 bg-volt-blue/10 ring-2 ring-volt-blue/20'
                          : 'border-white/5 bg-white/[0.03] hover:border-white/20'
                      }`}
                    >
                      <p className={`text-sm font-bold ${item.choice === 'manual' ? 'text-volt-blue' : 'text-gray-400'}`}>
                        {item.manualTime}
                      </p>
                      {item.choice === 'manual' && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Check className="w-3 h-3 text-volt-blue" />
                          <span className="text-[10px] text-volt-blue font-semibold">Selected</span>
                        </div>
                      )}
                    </button>

                    {/* Col 3: Optimized Schedule */}
                    <button
                      onClick={() => setScheduleChoice(item.id, 'optimized')}
                      className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        item.choice === 'optimized'
                          ? 'border-volt-cyan/50 bg-volt-cyan/10 ring-2 ring-volt-cyan/20'
                          : 'border-white/5 bg-white/[0.03] hover:border-white/20'
                      }`}
                    >
                      <p className={`text-sm font-bold ${item.choice === 'optimized' ? 'text-volt-cyan' : 'text-gray-400'}`}>
                        {item.optimizedTime}
                      </p>
                      {item.savings > 0 && (
                        <span className="text-[10px] text-volt-green font-bold">Save ₹{item.savings}/day</span>
                      )}
                      {item.choice === 'optimized' && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Check className="w-3 h-3 text-volt-cyan" />
                          <span className="text-[10px] text-volt-cyan font-semibold">Selected</span>
                        </div>
                      )}
                    </button>

                    {/* Col 4: Real Schedule (result) */}
                    <div className={`p-3 rounded-xl border-2 text-center ${
                      item.choice === 'optimized'
                        ? 'border-volt-green/30 bg-volt-green/5'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}>
                      <p className={`text-sm font-bold ${item.choice === 'optimized' ? 'text-volt-green' : 'text-white'}`}>
                        {item.realTime}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <ArrowRight className="w-3 h-3 text-gray-500" />
                        <span className={`text-[10px] font-semibold ${item.choice === 'optimized' ? 'text-volt-green' : 'text-gray-400'}`}>
                          {item.choice === 'optimized' ? 'Optimized' : 'User Set'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>

      </div>
    </div>
  );
}
