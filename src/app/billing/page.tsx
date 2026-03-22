'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { IndianRupee, TrendingDown, Receipt, Calendar, Zap, Download, ChevronDown, Loader2 } from 'lucide-react';
import { useVoltStore } from '@/lib/store';
import { simulateBilling, BillingResult } from '@/lib/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const tariffSlabs = [
  { slab: '0 – 100 units', rate: '₹3.10', type: 'sasta' },
  { slab: '101 – 200 units', rate: '₹5.20', type: 'mid' },
  { slab: '201 – 400 units', rate: '₹6.80', type: 'mid' },
  { slab: '400+ units', rate: '₹8.50', type: 'peak' },
];

const COLORS = ['#1B4F8A', '#00BCD4', '#2E7D32', '#F9A825', '#C62828', '#9CA3AF', '#8B5CF6'];

export default function BillingPage() {
  const [showSlabs, setShowSlabs] = useState(false);
  
  // Store references
  const appliances = useVoltStore(s => s.appliances);
  const user = useVoltStore(s => s.user);

  // Simulation controls
  const [hours, setHours] = useState(8);
  const [budget, setBudget] = useState(1000);
  const [comfort, setComfort] = useState(7);
  
  // Simulation result
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<BillingResult | null>(null);

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const fetchSimulation = async () => {
      setLoading(true);
      const res = await simulateBilling({
        appliances: appliances.map(a => a.id),
        hours,
        budget,
        comfort,
        discom: user?.discom || 'BSES Rajdhani',
      });
      if (active) {
        setResult(res);
        setLoading(false);
      }
    };

    fetchSimulation();
    return () => { active = false; };
  }, [appliances, hours, budget, comfort, user?.discom]);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2, backgroundColor: '#0a0f1c' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('VoltIQ-Billing-Report.pdf');
  };

  const totalSavings = result?.monthlyData.reduce((s, m) => s + (m.baseline - m.optimized), 0) || 0;
  const totalBillBaseline = result?.monthlyData.reduce((s, m) => s + m.baseline, 0) || 0;
  const totalBillOptimized = result?.monthlyData.reduce((s, m) => s + m.optimized, 0) || 0;

  // Breakdown based on real appliances
  const sumKW = appliances.reduce((sum, a) => sum + a.kw, 0);
  const breakdownData = appliances.map((a, i) => ({
    name: a.name,
    value: Math.round((a.kw / Math.max(0.1, sumKW)) * (result?.optimized || 100)),
    fill: COLORS[i % COLORS.length]
  }));

  // Ensure 'Others' if empty
  if (breakdownData.length === 0) {
    breakdownData.push({ name: 'Base Load', value: result?.optimized || 100, fill: COLORS[0] });
  }

  return (
    <div className="ml-[260px] pt-16 min-h-screen">
      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Controls and Stats mapping exactly to real-time simulation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Interactive Billing Simulation</h1>
            <p className="text-sm text-gray-500">Based on your {appliances.length} saved appliances</p>
          </div>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-volt-blue text-white font-semibold hover:bg-volt-cyan transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" />
            Download Last Bill (PDF)
          </button>
        </div>

        {/* Interactive Controls */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-light rounded-2xl p-5">
            <label className="text-sm font-semibold text-gray-300 mb-2 block">
              Average usage hours/day: <span className="text-volt-blue">{hours}h</span>
            </label>
            <input
              type="range" min={1} max={24} value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-gray-700 outline-none"
            />
          </div>
          <div className="glass-light rounded-2xl p-5">
            <label className="text-sm font-semibold text-gray-300 mb-2 block">
              Monthly budget: <span className="text-volt-blue">₹{budget}</span>
            </label>
            <input
              type="range" min={200} max={5000} step={50} value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-gray-700 outline-none"
            />
          </div>
          <div className="glass-light rounded-2xl p-5">
            <label className="text-sm font-semibold text-gray-300 mb-2 block">
              Comfort priority: <span className="text-volt-blue">{comfort}/10</span>
            </label>
            <input
              type="range" min={1} max={10} value={comfort}
              onChange={(e) => setComfort(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-gray-700 outline-none"
            />
          </div>
        </div>

        <div ref={pdfRef} className="space-y-8 bg-[#0a0f1c] p-2">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-volt-blue animate-spin" />
            </div>
          ) : result ? (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Receipt, label: 'Optimized Bill', value: `₹${result.optimized}`, sub: `vs ₹${result.baseline} baseline`, color: 'text-volt-blue', bg: 'bg-blue-500/10' },
                  { icon: TrendingDown, label: 'Saved This Month', value: `₹${result.savings}`, sub: `${result.savingsPercent}% reduction`, color: 'text-volt-green', bg: 'bg-green-500/10' },
                  { icon: IndianRupee, label: 'Total Saved (6 mo)', value: `₹${totalSavings.toLocaleString('en-IN')}`, sub: 'Since start', color: 'text-volt-amber', bg: 'bg-amber-500/10' },
                  { icon: Calendar, label: 'Avg per Day', value: `₹${(result.optimized / 30).toFixed(1)}`, sub: '~6.2 kWh/day', color: 'text-volt-cyan', bg: 'bg-cyan-500/10' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-light rounded-2xl p-5"
                  >
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Bill Comparison Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2 glass-light rounded-2xl p-6"
                >
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-white">Bill Comparison (Simulated 6-Month Projection)</h2>
                    <p className="text-sm text-gray-500">Baseline vs VoltIQ optimized (Default View)</p>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <BarChart data={result.monthlyData} barGap={6}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.1} />
                        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                          formatter={(value) => [`₹${value}`, '']}
                        />
                        <Legend wrapperStyle={{ color: '#fff' }} />
                        <Bar dataKey="baseline" name="Without VoltIQ" fill="#d1d5db" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="optimized" name="With VoltIQ" fill="#1B4F8A" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Bill Breakdown Pie */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-light rounded-2xl p-6"
                >
                  <h2 className="text-lg font-bold text-white mb-2">Simulated Breakdown</h2>
                  <p className="text-sm text-gray-500 mb-4">By your appliances</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={breakdownData}
                          cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value"
                        >
                          {breakdownData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`₹${value}`, '']} contentStyle={{backgroundColor: '#1a2332', border: 'none', color: '#fff'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {breakdownData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="text-gray-400">{item.name}</span>
                        </div>
                        <span className="font-semibold text-gray-200">₹{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Tariff Slabs & Summary */}
              <div className="grid lg:grid-cols-2 gap-8 mt-8">
                <motion.div className="glass-light rounded-2xl p-6">
                  <button onClick={() => setShowSlabs(!showSlabs)} className="flex items-center justify-between w-full mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Tariff Slab Rates</h2>
                      <p className="text-sm text-gray-500">{user?.discom || 'BSES Rajdhani'} — Current rates</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSlabs ? 'rotate-180' : ''}`} />
                  </button>
                  {showSlabs && (
                    <div className="space-y-2">
                      {tariffSlabs.map((slab, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                          slab.type === 'peak' ? 'border-red-900/50 bg-red-900/20' :
                          slab.type === 'mid' ? 'border-amber-900/50 bg-amber-900/20' :
                          'border-green-900/50 bg-green-900/20'
                        }`}>
                          <span className="text-sm text-gray-300">{slab.slab}</span>
                          <span className={`text-sm font-bold ${
                            slab.type === 'peak' ? 'text-red-400' :
                            slab.type === 'mid' ? 'text-amber-400' :
                            'text-green-400'
                          }`}>{slab.rate}/kWh</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 p-4 bg-gradient-to-br from-volt-blue/10 to-volt-cyan/10 rounded-xl border border-volt-blue/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-volt-cyan" />
                      <span className="text-sm font-bold text-white">VoltIQ Impact Summary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xs text-gray-500">6-mo baseline</div>
                        <div className="text-lg font-black text-gray-500 line-through">₹{totalBillBaseline.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">6-mo VoltIQ</div>
                        <div className="text-lg font-black text-volt-green">₹{totalBillOptimized.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div className="glass-light rounded-2xl p-6 flex flex-col justify-center">
                  <h2 className="text-lg font-bold text-white mb-2">Simulation Summary</h2>
                  <p className="text-sm text-gray-400 mb-6">Running in optimized profile</p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                      <span className="text-sm text-gray-400">Total Appliances Included</span>
                      <span className="text-sm font-bold text-white">{appliances.length} items</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                      <span className="text-sm text-gray-400">Projected CO2 Saved</span>
                      <span className="text-sm font-bold text-volt-green">{result.co2Saved} kg (~{result.treesEquivalent} trees)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                      <span className="text-sm text-gray-400">Simulated Target Budget</span>
                      <span className="text-sm font-bold text-amber-400">₹{budget}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3">
                      <span className="text-sm text-gray-400">Overall Comfort Retained</span>
                      <span className="text-sm font-bold text-volt-blue">{Math.round((comfort/10)*100)}%</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
