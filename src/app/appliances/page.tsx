'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  AirVent, Droplets, WashingMachine, Tv, Lightbulb, Plug, Refrigerator,
  Fan, Smartphone, Power, Clock, Zap, TrendingDown, AlertTriangle, Plus, X, Trash2,
  Wifi, Search, CheckCircle2, Signal, Router, ChevronRight, ShieldCheck, CalendarClock,
  Pencil, Check,
} from 'lucide-react';

import { useVoltStore } from '@/lib/store';
import type { Appliance } from '@/lib/store';

const iconMap: Record<string, any> = {
  AirVent, Droplets, WashingMachine, Tv, Lightbulb, Plug, Refrigerator, Fan, Smartphone
};

// --- Data for the flows ---
const smartMeterProviders = [
  { id: 'tp-link', name: 'TP-Link Kasa', icon: '🔌' },
  { id: 'wipro', name: 'Wipro Smart', icon: '💡' },
  { id: 'havells', name: 'Havells Digi', icon: '⚡' },
  { id: 'syska', name: 'Syska Smart', icon: '🏠' },
  { id: 'philips', name: 'Philips Hue', icon: '✨' },
  { id: 'orient', name: 'Orient Electric', icon: '🔋' },
];

const mockSmartPlugs = [
  { id: 'sp-1', name: 'Smart Plug — Living Room', signal: 92, mac: 'A4:CF:12:XX:34:01' },
  { id: 'sp-2', name: 'Smart Plug — Kitchen', signal: 78, mac: 'A4:CF:12:XX:34:02' },
  { id: 'sp-3', name: 'Smart Plug — Bedroom AC', signal: 85, mac: 'A4:CF:12:XX:34:03' },
  { id: 'sp-4', name: 'Smart Plug — Geyser', signal: 64, mac: 'A4:CF:12:XX:34:04' },
];

const oemCompanies = [
  { id: 'samsung', name: 'Samsung', logo: '🇰🇷' },
  { id: 'lg', name: 'LG Electronics', logo: '🔵' },
  { id: 'voltas', name: 'Voltas', logo: '❄️' },
  { id: 'daikin', name: 'Daikin', logo: '🌀' },
  { id: 'whirlpool', name: 'Whirlpool', logo: '🌊' },
  { id: 'godrej', name: 'Godrej', logo: '🏭' },
  { id: 'bluestar', name: 'Blue Star', logo: '⭐' },
  { id: 'haier', name: 'Haier', logo: '🔴' },
];

const oemModels: Record<string, { id: string; model: string; type: string; kw: number }[]> = {
  samsung: [
    { id: 'sam-1', model: 'AR18CYLANWK/NA 1.5T AC', type: 'Cooling', kw: 1.5 },
    { id: 'sam-2', model: 'RT28T3122S8 253L Fridge', type: 'Kitchen', kw: 0.15 },
    { id: 'sam-3', model: 'WA70A4002GS 7kg Washer', type: 'Laundry', kw: 0.5 },
  ],
  lg: [
    { id: 'lg-1', model: 'PS-Q19YNZE 1.5T AC', type: 'Cooling', kw: 1.4 },
    { id: 'lg-2', model: 'GL-T292RPZ3 260L Fridge', type: 'Kitchen', kw: 0.12 },
    { id: 'lg-3', model: 'FHM1408BDL 8kg Washer', type: 'Laundry', kw: 0.45 },
  ],
  voltas: [
    { id: 'vol-1', model: '183V ADA 1.5T AC', type: 'Cooling', kw: 1.6 },
    { id: 'vol-2', model: '185V DLVZ 185L Fridge', type: 'Kitchen', kw: 0.13 },
  ],
  daikin: [
    { id: 'dai-1', model: 'FTKF50TV16U 1.5T AC', type: 'Cooling', kw: 1.5 },
    { id: 'dai-2', model: 'ATKL50TV 1.5T AC', type: 'Cooling', kw: 1.45 },
  ],
  whirlpool: [
    { id: 'whi-1', model: '3D Cool Purafresh 190L', type: 'Kitchen', kw: 0.14 },
    { id: 'whi-2', model: 'MAGICOOL PRO 1T AC', type: 'Cooling', kw: 1.2 },
  ],
  godrej: [
    { id: 'god-1', model: 'GIC 18HTC5 1.5T AC', type: 'Cooling', kw: 1.55 },
    { id: 'god-2', model: 'RT EON 236B 225L Fridge', type: 'Kitchen', kw: 0.11 },
  ],
  bluestar: [
    { id: 'bs-1', model: 'IC518DATU 1.5T AC', type: 'Cooling', kw: 1.5 },
  ],
  haier: [
    { id: 'hai-1', model: 'HSU18C-TQS5BE(INV) 1.5T AC', type: 'Cooling', kw: 1.5 },
    { id: 'hai-2', model: 'HRD-1955CSS-E 195L Fridge', type: 'Kitchen', kw: 0.12 },
  ],
};

// --- Step type for the Add Appliance flow ---
type AddStep =
  | 'method-select'
  // Smart Meter path
  | 'sm-provider'
  | 'sm-scanning'
  | 'sm-plugs'
  | 'sm-wifi'
  // OEM path
  | 'oem-company'
  | 'oem-model'
  | 'oem-otp'
  // Final shared step
  | 'usage-config';

export default function AppliancesPage() {
  const appliances = useVoltStore(state => state.appliances);
  const toggleAppliance = useVoltStore(state => state.toggleAppliance);
  const addAppliance = useVoltStore(state => state.addAppliance);
  const removeAppliance = useVoltStore(state => state.removeAppliance);
  const renameAppliance = useVoltStore(state => state.renameAppliance);
  const updateApplianceSchedule = useVoltStore(state => state.updateApplianceSchedule);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAppliance, setSelectedAppliance] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndTime, setEditEndTime] = useState('13:00');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingText, setRenamingText] = useState('');

  // Multi-step flow state
  const [step, setStep] = useState<AddStep>('method-select');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedPlug, setSelectedPlug] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [selectedOEM, setSelectedOEM] = useState('');
  const [selectedModel, setSelectedModel] = useState<typeof oemModels['samsung'][0] | null>(null);
  const [itemNumber, setItemNumber] = useState('');
  const [oemOtp, setOemOtp] = useState('');
  const [oemDummyOtp, setOemDummyOtp] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  // Usage config  
  const [usageHours, setUsageHours] = useState(4);
  const [usageTimeStart, setUsageTimeStart] = useState('09:00');
  const [usageTimeEnd, setUsageTimeEnd] = useState('13:00');
  const [shiftComfort, setShiftComfort] = useState<'high' | 'medium' | 'low'>('medium');

  // Derived name for the appliance being added
  const [pendingApplianceName, setPendingApplianceName] = useState('');
  const [pendingApplianceKw, setPendingApplianceKw] = useState(0);
  const [pendingCategory, setPendingCategory] = useState('');

  // Reset flow when modal closes
  const resetFlow = () => {
    setStep('method-select');
    setSelectedProvider('');
    setSelectedPlug('');
    setWifiPassword('');
    setSelectedOEM('');
    setSelectedModel(null);
    setItemNumber('');
    setOemOtp('');
    setOemDummyOtp('');
    setUsageHours(4);
    setUsageTimeStart('09:00');
    setUsageTimeEnd('13:00');
    setShiftComfort('medium');
    setPendingApplianceName('');
    setPendingApplianceKw(0);
    setPendingCategory('');
    setScanProgress(0);
  };

  const openModal = () => {
    resetFlow();
    setAddModalOpen(true);
  };

  const closeModal = () => {
    setAddModalOpen(false);
    resetFlow();
  };

  // Simulate scanning
  useEffect(() => {
    if (step === 'sm-scanning') {
      setScanProgress(0);
      const timer = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            setStep('sm-plugs');
            return 100;
          }
          return p + Math.random() * 18 + 7;
        });
      }, 400);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Generate OEM dummy OTP when reaching that step
  useEffect(() => {
    if (step === 'oem-otp') {
      setOemDummyOtp(String(Math.floor(100000 + Math.random() * 900000)));
    }
  }, [step]);

  const handleFinalAdd = () => {
    const newAppliance: Appliance = {
      id: `custom-${Date.now()}`,
      name: pendingApplianceName,
      iconName: 'Plug',
      kw: pendingApplianceKw,
      isOn: false,
      dailyHours: usageHours,
      monthlyCost: Math.round(pendingApplianceKw * usageHours * 30 * 7),
      category: pendingCategory || 'General',
      smartEnabled: step === 'usage-config' && selectedProvider !== '',
      schedule: `${usageTimeStart} – ${usageTimeEnd}`,
    };
    addAppliance(newAppliance);
    closeModal();
  };

  const categories = appliances.length > 0
    ? ['All', ...Array.from(new Set(appliances.map(a => a.category)))]
    : ['All'];

  const filtered = selectedCategory === 'All'
    ? appliances
    : appliances.filter(a => a.category === selectedCategory);

  const totalKW = appliances.filter(a => a.isOn).reduce((s, a) => s + a.kw, 0);
  const totalMonthlyCost = appliances.reduce((s, a) => s + a.monthlyCost, 0);
  const smartCount = appliances.filter(a => a.smartEnabled).length;
  const onCount = appliances.filter(a => a.isOn).length;

  // Progress indicator for steps
  const getProgress = (): { current: number; total: number } => {
    if (step === 'method-select') return { current: 1, total: 4 };
    if (step.startsWith('sm-')) {
      const map: Record<string, number> = { 'sm-provider': 2, 'sm-scanning': 2, 'sm-plugs': 3, 'sm-wifi': 3 };
      return { current: map[step] || 2, total: 4 };
    }
    if (step.startsWith('oem-')) {
      const map: Record<string, number> = { 'oem-company': 2, 'oem-model': 2, 'oem-otp': 3 };
      return { current: map[step] || 2, total: 4 };
    }
    return { current: 4, total: 4 };
  };

  const progress = getProgress();

  // --- RENDER MODAL STEP CONTENT ---
  const renderModalContent = () => {
    switch (step) {
      // ========================
      // STEP 1: Method Select
      // ========================
      case 'method-select':
        return (
          <div className="p-5 space-y-3">
            <p className="text-sm text-gray-400 mb-4">Choose how you&apos;d like to add your appliance</p>
            
            <button
              onClick={() => setStep('sm-provider')}
              className="w-full flex items-center gap-4 p-5 rounded-xl bg-white/5 border border-white/5 hover:border-volt-cyan/30 hover:bg-volt-cyan/5 transition-all text-left group"
            >
              <div className="w-14 h-14 bg-volt-cyan/10 rounded-2xl flex items-center justify-center shrink-0">
                <Router className="w-7 h-7 text-volt-cyan" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white group-hover:text-volt-cyan transition-colors">Via Smart Meter / Smart Plug</h4>
                <p className="text-xs text-gray-500 mt-1">Connect through your smart meter provider and discover nearby smart plugs automatically</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-volt-cyan" />
            </button>

            <button
              onClick={() => setStep('oem-company')}
              className="w-full flex items-center gap-4 p-5 rounded-xl bg-white/5 border border-white/5 hover:border-volt-blue/30 hover:bg-volt-blue/5 transition-all text-left group"
            >
              <div className="w-14 h-14 bg-volt-blue/10 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-volt-blue" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white group-hover:text-volt-blue transition-colors">Via OEM Verification</h4>
                <p className="text-xs text-gray-500 mt-1">Select your appliance manufacturer, model, and verify via OEM OTP</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-volt-blue" />
            </button>
          </div>
        );

      // ========================
      // SMART METER PATH
      // ========================
      case 'sm-provider':
        return (
          <div className="p-5">
            <p className="text-sm text-gray-400 mb-4">Select your smart meter / smart plug provider</p>
            <div className="grid grid-cols-2 gap-3">
              {smartMeterProviders.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProvider(p.id); setStep('sm-scanning'); }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-volt-cyan/30 hover:bg-volt-cyan/5 transition-all text-left"
                >
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'sm-scanning':
        return (
          <div className="p-5 flex flex-col items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 bg-volt-cyan/10 rounded-full flex items-center justify-center mb-6 border-2 border-volt-cyan/30"
            >
              <Search className="w-8 h-8 text-volt-cyan" />
            </motion.div>
            <h3 className="text-lg font-bold text-white mb-2">Scanning Nearby Devices...</h3>
            <p className="text-xs text-gray-500 mb-6">Looking for smart plugs from {smartMeterProviders.find(p => p.id === selectedProvider)?.name}</p>
            <div className="w-full max-w-xs bg-white/10 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-volt-cyan to-volt-blue rounded-full"
                animate={{ width: `${Math.min(scanProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">{Math.min(Math.round(scanProgress), 100)}%</p>
          </div>
        );

      case 'sm-plugs':
        return (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-volt-green" />
              <p className="text-sm text-volt-green font-semibold">{mockSmartPlugs.length} devices found</p>
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {mockSmartPlugs.map(plug => (
                <button
                  key={plug.id}
                  onClick={() => {
                    setSelectedPlug(plug.id);
                    setPendingApplianceName(plug.name.replace('Smart Plug — ', ''));
                    setPendingApplianceKw(+(0.5 + Math.random() * 1.5).toFixed(2));
                    setPendingCategory('Smart Home');
                    setStep('sm-wifi');
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    selectedPlug === plug.id
                      ? 'bg-volt-cyan/10 border-volt-cyan/30'
                      : 'bg-white/5 border-white/5 hover:border-volt-cyan/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-volt-cyan/10 rounded-xl flex items-center justify-center">
                      <Plug className="w-5 h-5 text-volt-cyan" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{plug.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{plug.mac}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Signal className={`w-4 h-4 ${plug.signal > 80 ? 'text-volt-green' : plug.signal > 60 ? 'text-volt-amber' : 'text-red-400'}`} />
                    <span className="text-xs text-gray-400">{plug.signal}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'sm-wifi':
        return (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3 p-4 bg-volt-cyan/5 border border-volt-cyan/20 rounded-xl">
              <Plug className="w-5 h-5 text-volt-cyan" />
              <div>
                <p className="text-sm font-bold text-white">{mockSmartPlugs.find(p => p.id === selectedPlug)?.name}</p>
                <p className="text-xs text-gray-500">Ready to connect</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Wifi className="w-4 h-4 inline mr-1.5 text-volt-cyan" />
                Enter WiFi Password to connect the plug
              </label>
              <input
                type="password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="WiFi password"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all"
              />
            </div>

            <button
              onClick={() => setStep('usage-config')}
              disabled={!wifiPassword.trim()}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                wifiPassword.trim()
                  ? 'bg-gradient-to-r from-volt-cyan to-volt-blue text-white hover:shadow-lg'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Wifi className="w-4 h-4" />
              Connect & Continue
            </button>
          </div>
        );

      // ========================
      // OEM PATH
      // ========================
      case 'oem-company':
        return (
          <div className="p-5">
            <p className="text-sm text-gray-400 mb-4">Select the manufacturer of your appliance</p>
            <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
              {oemCompanies.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedOEM(c.id); setStep('oem-model'); }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-volt-blue/30 hover:bg-volt-blue/5 transition-all text-left"
                >
                  <span className="text-2xl">{c.logo}</span>
                  <span className="text-sm font-semibold text-white">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'oem-model':
        const models = oemModels[selectedOEM] || [];
        return (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{oemCompanies.find(c => c.id === selectedOEM)?.logo}</span>
              <span className="text-sm font-bold text-white">{oemCompanies.find(c => c.id === selectedOEM)?.name}</span>
            </div>

            <p className="text-sm text-gray-400">Select your model</p>
            <div className="space-y-2 max-h-[30vh] overflow-y-auto">
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m);
                    setPendingApplianceName(m.model);
                    setPendingApplianceKw(m.kw);
                    setPendingCategory(m.type);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    selectedModel?.id === m.id
                      ? 'bg-volt-blue/10 border-volt-blue/30'
                      : 'bg-white/5 border-white/5 hover:border-volt-blue/20'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{m.model}</p>
                    <p className="text-xs text-gray-500">{m.type} · {m.kw} kW</p>
                  </div>
                  {selectedModel?.id === m.id && <CheckCircle2 className="w-5 h-5 text-volt-blue" />}
                </button>
              ))}
            </div>

            {selectedModel && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Item / Serial Number</label>
                  <input
                    type="text"
                    value={itemNumber}
                    onChange={(e) => setItemNumber(e.target.value)}
                    placeholder="e.g. INV-2024-XXXXXX"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-volt-blue/50 focus:ring-2 focus:ring-volt-blue/20 transition-all"
                  />
                </div>
                <button
                  onClick={() => setStep('oem-otp')}
                  disabled={!itemNumber.trim()}
                  className={`w-full py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                    itemNumber.trim()
                      ? 'bg-gradient-to-r from-volt-blue to-violet-500 text-white hover:shadow-lg'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Verify with OEM
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );

      case 'oem-otp':
        return (
          <div className="p-5 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-volt-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-volt-blue" />
              </div>
              <h3 className="text-lg font-bold text-white">OEM Verification</h3>
              <p className="text-xs text-gray-500 mt-1">
                {oemCompanies.find(c => c.id === selectedOEM)?.name} has sent a verification code
              </p>
              <p className="text-[10px] text-volt-amber mt-3 bg-volt-amber/10 inline-block px-3 py-1 rounded-full">
                Dummy OTP: <span className="font-bold">{oemDummyOtp}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Enter OTP</label>
              <input
                type="text"
                value={oemOtp}
                onChange={(e) => setOemOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP"
                maxLength={6}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg tracking-[0.5em] font-mono placeholder-gray-500 focus:outline-none focus:border-volt-blue/50 focus:ring-2 focus:ring-volt-blue/20 transition-all"
              />
            </div>

            <button
              onClick={() => {
                if (oemOtp === oemDummyOtp) setStep('usage-config');
              }}
              disabled={oemOtp.length !== 6}
              className={`w-full py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                oemOtp.length === 6
                  ? 'bg-gradient-to-r from-volt-blue to-violet-500 text-white hover:shadow-lg'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Verify & Continue
            </button>
            {oemOtp.length === 6 && oemOtp !== oemDummyOtp && (
              <p className="text-xs text-red-400 text-center">Incorrect OTP. Please try again.</p>
            )}
          </div>
        );

      // ========================
      // FINAL: Usage Config
      // ========================
      case 'usage-config':
        return (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3 p-3 bg-volt-green/5 border border-volt-green/20 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-volt-green shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">{pendingApplianceName}</p>
                <p className="text-xs text-gray-400">{pendingApplianceKw} kW · {pendingCategory}</p>
              </div>
            </div>

            {/* Hours per day */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Daily Usage (hours)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={usageHours}
                  onChange={(e) => setUsageHours(Number(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-volt-cyan"
                />
                <span className="text-lg font-black text-volt-cyan w-14 text-right tabular-nums">{usageHours}h</span>
              </div>
            </div>

            {/* Time of use */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Typical Usage Time</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">From</label>
                  <input
                    type="time"
                    value={usageTimeStart}
                    onChange={(e) => setUsageTimeStart(e.target.value)}
                    className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all"
                  />
                </div>
                <span className="text-gray-600 mt-4">→</span>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">To</label>
                  <input
                    type="time"
                    value={usageTimeEnd}
                    onChange={(e) => setUsageTimeEnd(e.target.value)}
                    className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Time-shift comfort */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Comfort with Time-Shifting by Optimization Engine
              </label>
              <p className="text-[10px] text-gray-500 mb-3">
                This lets VoltIQ shift your usage to lower-tariff hours to save on your bill.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'high' as const, label: 'Flexible', desc: 'Shift anytime', color: 'volt-green', emoji: '✅' },
                  { id: 'medium' as const, label: 'Moderate', desc: '±2 hrs shift', color: 'volt-amber', emoji: '🔄' },
                  { id: 'low' as const, label: 'Fixed', desc: 'No shifting', color: 'red-400', emoji: '🔒' },
                ]).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setShiftComfort(opt.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      shiftComfort === opt.id
                        ? `bg-${opt.color}/10 border-${opt.color}/40 ring-2 ring-${opt.color}/20`
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <p className={`text-xs font-bold mt-1 ${shiftComfort === opt.id ? `text-${opt.color}` : 'text-gray-400'}`}>{opt.label}</p>
                    <p className="text-[10px] text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated savings preview */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Est. Monthly Cost</span>
                <span className="font-bold text-white">₹{Math.round(pendingApplianceKw * usageHours * 30 * 7)}</span>
              </div>
              {shiftComfort !== 'low' && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-400">Potential Savings</span>
                  <span className="font-bold text-volt-green">
                    ₹{Math.round(pendingApplianceKw * usageHours * 30 * (shiftComfort === 'high' ? 2.5 : 1.2))}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleFinalAdd}
              className="w-full py-3.5 rounded-xl font-bold transition-all bg-gradient-to-r from-volt-cyan to-volt-blue text-white hover:shadow-lg hover:shadow-volt-cyan/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Appliance
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Step title map
  const stepTitles: Record<AddStep, string> = {
    'method-select': 'Add New Appliance',
    'sm-provider': 'Smart Meter Provider',
    'sm-scanning': 'Scanning...',
    'sm-plugs': 'Nearby Smart Plugs',
    'sm-wifi': 'Connect to WiFi',
    'oem-company': 'Appliance Manufacturer',
    'oem-model': 'Select Model',
    'oem-otp': 'OEM Verification',
    'usage-config': 'Usage & Preferences',
  };

  const canGoBack = step !== 'method-select' && step !== 'sm-scanning';
  const handleBack = () => {
    const backMap: Record<string, AddStep> = {
      'sm-provider': 'method-select',
      'sm-plugs': 'sm-provider',
      'sm-wifi': 'sm-plugs',
      'oem-company': 'method-select',
      'oem-model': 'oem-company',
      'oem-otp': 'oem-model',
      'usage-config': selectedProvider ? 'sm-wifi' : 'oem-otp',
    };
    setStep(backMap[step] || 'method-select');
  };

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 min-h-screen bg-[#0a0f1c]">
      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Header with Add button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Appliances</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and monitor your home appliances</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-volt-cyan text-gray-900 rounded-xl font-semibold text-sm hover:bg-volt-cyan/90 transition-all shadow-lg shadow-volt-cyan/20"
          >
            <Plus className="w-4 h-4" />
            Add Appliance
          </motion.button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Power, label: 'Active Now', value: `${onCount} / ${appliances.length}`, color: 'text-volt-green', bg: 'bg-green-500/10' },
            { icon: Zap, label: 'Current Load', value: `${totalKW.toFixed(2)} kW`, color: 'text-volt-cyan', bg: 'bg-cyan-500/10' },
            { icon: TrendingDown, label: 'Monthly Cost', value: `₹${totalMonthlyCost}`, color: 'text-volt-blue', bg: 'bg-blue-500/10' },
            { icon: Clock, label: 'Smart Enabled', value: `${smartCount} appliances`, color: 'text-volt-amber', bg: 'bg-amber-500/10' },
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
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {appliances.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Appliances Added</h3>
            <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
              Start by adding your home appliances to monitor energy usage and get smart optimization recommendations.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openModal}
              className="flex items-center gap-2 px-6 py-3 bg-volt-cyan text-gray-900 rounded-xl font-semibold hover:bg-volt-cyan/90 transition-all shadow-lg shadow-volt-cyan/20"
            >
              <Plus className="w-5 h-5" />
              Add Your First Appliance
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Category filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-volt-blue text-white shadow-md'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Appliance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((app, i) => {
                const IconComponent = iconMap[app.iconName] || Zap;
                return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer group ${
                    app.isOn
                      ? 'bg-white/5 border-volt-cyan/20 shadow-lg shadow-volt-cyan/5'
                      : 'bg-white/[0.03] border-white/5'
                  }`}
                  onClick={() => setSelectedAppliance(selectedAppliance === app.id ? null : app.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        app.isOn ? 'bg-volt-cyan/10' : 'bg-white/10'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${app.isOn ? 'text-volt-cyan' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        {renamingId === app.id ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={renamingText}
                              onChange={(e) => setRenamingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && renamingText.trim()) {
                                  renameAppliance(app.id, renamingText.trim());
                                  setRenamingId(null);
                                }
                                if (e.key === 'Escape') setRenamingId(null);
                              }}
                              autoFocus
                              className="bg-white/10 border border-volt-cyan/40 rounded-md px-2 py-0.5 text-sm text-white w-28 focus:outline-none focus:border-volt-cyan"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (renamingText.trim()) {
                                  renameAppliance(app.id, renamingText.trim());
                                  setRenamingId(null);
                                }
                              }}
                              className="w-6 h-6 rounded-md bg-volt-cyan/20 hover:bg-volt-cyan/40 flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 text-volt-cyan" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className={`text-sm font-bold ${app.isOn ? 'text-white' : 'text-gray-500'}`}>
                              {app.name}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingId(app.id);
                                setRenamingText(app.name);
                              }}
                              className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                              title="Rename appliance"
                            >
                              <Pencil className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        )}
                        <div className="text-xs text-gray-400">{app.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Remove button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeAppliance(app.id); }}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors group"
                        title="Remove appliance"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-400 transition-colors" />
                      </button>

                      {/* Schedule button */}
                      <Link
                        href="/energy-usage"
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-volt-cyan/20 flex items-center justify-center transition-colors group"
                        title="Schedule appliance"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-gray-500 group-hover:text-volt-cyan transition-colors" />
                      </Link>

                      {/* Toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleAppliance(app.id); }}
                        className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                          app.isOn ? 'bg-volt-cyan' : 'bg-gray-300'
                        }`}
                      >
                        <motion.div
                          animate={{ x: app.isOn ? 22 : 2 }}
                          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`font-bold ${app.isOn ? 'text-volt-cyan' : 'text-gray-400'}`}>
                        {app.kw} kW
                      </span>
                      <span>{app.dailyHours} hrs/day</span>
                    </div>
                    <span className="text-sm font-bold text-volt-blue">₹{app.monthlyCost}/mo</span>
                  </div>

                  {/* Schedule display & edit */}
                  {app.schedule && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        {app.smartEnabled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-volt-cyan/10 text-volt-cyan rounded-full">
                            ⚡ VoltIQ Smart
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editingSchedule === app.id) {
                              setEditingSchedule(null);
                            } else {
                              // Parse existing schedule into start/end
                              const parts = app.schedule?.split(' – ') || ['09:00', '13:00'];
                              setEditStartTime(parts[0] || '09:00');
                              setEditEndTime(parts[1] || '13:00');
                              setEditingSchedule(app.id);
                            }
                          }}
                          className="flex items-center gap-1 text-[10px] text-volt-cyan font-semibold hover:text-volt-cyan/80 transition-colors"
                        >
                          <CalendarClock className="w-3 h-3" />
                          {editingSchedule === app.id ? 'Close' : 'Edit Schedule'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {editingSchedule === app.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-3">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Set Schedule</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="text-[10px] text-gray-500">From</label>
                                  <input
                                    type="time"
                                    value={editStartTime}
                                    onChange={(e) => setEditStartTime(e.target.value)}
                                    className="w-full mt-1 p-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-volt-cyan/50 transition-all"
                                  />
                                </div>
                                <span className="text-gray-600 mt-4">→</span>
                                <div className="flex-1">
                                  <label className="text-[10px] text-gray-500">To</label>
                                  <input
                                    type="time"
                                    value={editEndTime}
                                    onChange={(e) => setEditEndTime(e.target.value)}
                                    className="w-full mt-1 p-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-volt-cyan/50 transition-all"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateApplianceSchedule(app.id, `${editStartTime} – ${editEndTime}`);
                                  setEditingSchedule(null);
                                }}
                                className="w-full py-2 rounded-lg bg-gradient-to-r from-volt-cyan to-volt-blue text-white text-xs font-bold hover:shadow-lg transition-all"
                              >
                                Save Schedule
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {editingSchedule !== app.id && (
                        <div className="p-2 bg-volt-green/10 border border-volt-green/30 rounded-lg">
                          <p className="text-[10px] text-gray-300">
                            <span className="font-semibold">Schedule:</span> {app.schedule}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded details */}
                  <AnimatePresence>
                    {selectedAppliance === app.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Daily energy</span>
                            <span className="font-semibold">{(app.kw * app.dailyHours).toFixed(2)} kWh</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Monthly energy</span>
                            <span className="font-semibold">{(app.kw * app.dailyHours * 30).toFixed(1)} kWh</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">% of total bill</span>
                            <span className="font-semibold">{totalMonthlyCost > 0 ? ((app.monthlyCost / totalMonthlyCost) * 100).toFixed(1) : '0.0'}%</span>
                          </div>
                          {!app.smartEnabled && (
                            <div className="flex items-center gap-1 text-xs text-volt-amber mt-2">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Enable smart scheduling to save more</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Enhanced Add Appliance Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[5%] mx-auto max-w-lg bg-[#111827] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  {canGoBack && (
                    <button
                      onClick={handleBack}
                      className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400 rotate-180" />
                    </button>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white">{stepTitles[step]}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">Step {progress.current} of {progress.total}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-white/5 shrink-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-volt-cyan to-volt-blue"
                  animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderModalContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
