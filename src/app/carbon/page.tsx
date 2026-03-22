'use client';

import { motion } from 'framer-motion';
import { Leaf, TreePine, Droplets, Smartphone, Sun, Info, Award } from 'lucide-react';
import { useVoltStore } from '@/lib/store';

// Helper function to calculate a visually plausible CO2 savings number per appliance
const calculateCO2Savings = (kw: number, smartEnabled: boolean) => {
  // If it's smart enabled, calculate higher savings (~25kg per kW/month), else small ambient savings (~5kg)
  const baseSavings = smartEnabled ? 25 : 5;
  return Number((kw * baseSavings).toFixed(1));
};

export default function CarbonPage() {
  const appliances = useVoltStore(s => s.appliances);

  // Derive insights from the user's actual appliances
  const applianceInsights = appliances.map(app => ({
    id: app.id,
    name: app.name,
    iconName: app.iconName,
    co2Saved: calculateCO2Savings(app.kw, app.smartEnabled),
    smartEnabled: app.smartEnabled,
  })).sort((a, b) => b.co2Saved - a.co2Saved); // Sort by highest impact

  const totalCO2Saved = applianceInsights.reduce((sum, app) => sum + app.co2Saved, 0);

  // Equivalencies (Calculations are approximate to make them relatable)
  const treesPlanted = (totalCO2Saved / 21).toFixed(1); // 1 tree absorbs ~21kg/year
  const solarHours = Math.round(totalCO2Saved * 2.5); // 1kg CO2 ~ 2.5 kWh solar eq
  const waterSaved = Math.round(totalCO2Saved * 38); // Thermal plants use ~38L water per kg coal
  const smartphonesCharged = Math.round(totalCO2Saved * 121); // 1kg CO2 = ~121 smartphone charges

  const equivalencies = [
    { 
      icon: TreePine, 
      label: 'Trees Planted', 
      value: `${treesPlanted}`, 
      sub: 'Equivalent carbon absorbed over a year',
      color: 'text-volt-green', 
      bg: 'bg-green-500/10' 
    },
    { 
      icon: Sun, 
      label: 'Solar Energy Equivalent', 
      value: `${solarHours} Hours`, 
      sub: 'Of running a premium solar panel',
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10' 
    },
    { 
      icon: Droplets, 
      label: 'Water Saved', 
      value: `${waterSaved.toLocaleString('en-IN')} Liters`, 
      sub: 'Conserved at thermal power plants',
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      icon: Smartphone, 
      label: 'Phones Charged', 
      value: `${smartphonesCharged.toLocaleString('en-IN')} Times`, 
      sub: 'Amount of energy required for full charges',
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10' 
    },
  ];

  const badges = [
    { title: 'First 50 kg CO₂ Saved', achieved: totalCO2Saved >= 50, icon: '🌱' },
    { title: '100 kg CO₂ Saved', achieved: totalCO2Saved >= 100, icon: '🌿' },
    { title: '200 kg CO₂ Saved', achieved: totalCO2Saved >= 200, icon: '🌳' },
  ];

  return (
    <div className="ml-[260px] pt-16 min-h-screen">
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
        
        {/* Page Header */}
        <div className="mb-8 pl-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Leaf className="w-8 h-8 text-volt-green" />
            Your Environmental Impact
          </h1>
          <p className="text-gray-400 mt-2 text-base">
            See the direct, real-world difference your smart energy choices are making. 
            No complex charts—just real achievements.
          </p>
        </div>

        {/* Hero Impact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-volt-green/20 to-emerald-900/10 border border-volt-green/30 rounded-3xl p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <div className="text-volt-green/80 font-bold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" /> Lifetime Milestone
            </div>
            <div className="text-6xl font-black text-white mb-2">
              {totalCO2Saved.toFixed(1)} <span className="text-3xl text-gray-400">kg</span>
            </div>
            <div className="text-lg text-emerald-400 font-medium">
              Total CO₂ emissions you have actively prevented.
            </div>
          </div>
          
          <div className="hidden md:flex gap-4">
            {badges.map((badge, i) => (
              <div 
                key={i} 
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${
                  badge.achieved ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-800/20 border-gray-700/50 opacity-40'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-xs font-bold text-center max-w-[80px] leading-tight text-white">
                  {badge.title}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Equivalencies Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-6 pl-2">What Your Savings Resemble 🌱</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {equivalencies.map((eq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-light rounded-2xl p-6 hover:-translate-y-1 transition-transform"
              >
                <div className={`w-14 h-14 ${eq.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <eq.icon className={`w-7 h-7 ${eq.color}`} />
                </div>
                <div className="text-2xl font-black text-white mb-1">{eq.value}</div>
                <div className="text-base font-semibold text-gray-300">{eq.label}</div>
                <div className="text-xs text-gray-500 mt-2 leading-relaxed">{eq.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Appliance Level Insights */}
        <div>
          <div className="flex items-center justify-between mb-6 pl-2">
            <h2 className="text-xl font-bold text-white">Appliance Impact Leaderboard 🏆</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full">
              <Info className="w-4 h-4" />
              Based on your added devices
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {applianceInsights.length > 0 ? (
              applianceInsights.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-light rounded-2xl p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl">
                      {app.smartEnabled ? '⚡' : '🔌'}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{app.name}</div>
                      <div className="text-sm text-gray-400">
                        {app.smartEnabled ? 'Smart Optimization Active' : 'Passive Operation'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-volt-green">
                      {app.co2Saved.toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500">CO₂ Avoided</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 lg:col-span-2 glass-light rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-lg font-bold text-white mb-2">No Appliances Added</h3>
                <p className="text-gray-400">Head over to the Appliances page to add devices and see your specific environmental impact!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
