import { create } from 'zustand';

export type TariffMode = 'peak' | 'mid' | 'sasta';

export interface Appliance {
  id: string;
  name: string;
  iconName: string; // Storing string name since we can't easily store React components in Zustand without issues
  kw: number;
  isOn: boolean;
  dailyHours: number;
  monthlyCost: number;
  category: string;
  smartEnabled: boolean;
  schedule?: string;
}

export const defaultAppliances: Appliance[] = [
  { id: 'ac', name: 'Air Conditioner', iconName: 'AirVent', kw: 1.5, isOn: true, dailyHours: 8, monthlyCost: 540, category: 'Cooling', smartEnabled: true, schedule: '9AM–12PM, 2PM–6PM' },
  { id: 'geyser', name: 'Geyser', iconName: 'Droplets', kw: 2.0, isOn: false, dailyHours: 0.5, monthlyCost: 93, category: 'Heating', smartEnabled: true, schedule: '5:30AM – Sasta tariff' },
  { id: 'fridge', name: 'Refrigerator', iconName: 'Refrigerator', kw: 0.15, isOn: true, dailyHours: 24, monthlyCost: 108, category: 'Kitchen', smartEnabled: false },
  { id: 'wm', name: 'Washing Machine', iconName: 'WashingMachine', kw: 0.5, isOn: false, dailyHours: 0.75, monthlyCost: 35, category: 'Cleaning', smartEnabled: true, schedule: '6AM – Sasta tariff' },
  { id: 'tv', name: 'Television', iconName: 'Tv', kw: 0.1, isOn: true, dailyHours: 5, monthlyCost: 15, category: 'Entertainment', smartEnabled: false },
  { id: 'lights', name: 'LED Lights (8)', iconName: 'Lightbulb', kw: 0.08, isOn: true, dailyHours: 6, monthlyCost: 14, category: 'Lighting', smartEnabled: true },
  { id: 'fan', name: 'Ceiling Fan (3)', iconName: 'Fan', kw: 0.075, isOn: true, dailyHours: 10, monthlyCost: 68, category: 'Cooling', smartEnabled: false },
  { id: 'router', name: 'Wi-Fi Router', iconName: 'Smartphone', kw: 0.012, isOn: true, dailyHours: 24, monthlyCost: 9, category: 'Electronics', smartEnabled: false },
  { id: 'iron', name: 'Iron', iconName: 'Plug', kw: 1.0, isOn: false, dailyHours: 0.3, monthlyCost: 23, category: 'Utilities', smartEnabled: false },
];

// Auth types
export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  discom: string;
  accountType: 'prepaid' | 'postpaid';
  meterNumber?: string;
  customerId?: string;
  address?: string;
  location?: string;
}

// Onboarding types
export interface OnboardingState {
  currentStep: number;
  userInfo: {
    name: string;
    discom: string;
    accountType: 'prepaid' | 'postpaid';
  } | null;
  meterInfo: {
    meterNumber: string;
    connected: boolean;
  } | null;
  appliancePreferences: {
    [key: string]: {
      hours: number;
      temperature?: number;
      timePreference?: string;
      frequency?: number;
    };
  };
}

// Chat types
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'data' | 'suggestion';
}

// Optimization types
export interface OptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercent: number;
  schedule: ApplianceSchedule[];
  solveTimeMs: number;
  pipeline: string;
}

export interface ApplianceSchedule {
  applianceId: string;
  applianceName: string;
  scheduledTime: string;
  status: 'scheduled' | 'active' | 'completed';
  tariffZone: 'peak' | 'mid' | 'sasta';
}

// Alert types
export interface Alert {
  id: string;
  type: 'tariff' | 'savings' | 'anomaly';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
}

interface VoltStore {
  // Tariff
  tariffMode: TariffMode;
  setTariffMode: (mode: TariffMode) => void;

  // Live data
  liveKW: number;
  setLiveKW: (kw: number) => void;

  // WebSocket
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;

  // Grid Impact
  homesSliderValue: number;
  setHomesSliderValue: (value: number) => void;

  // Colony data
  colonyData: ColonyData;
  setColonyData: (data: ColonyData) => void;

  // Appliances
  appliances: Appliance[];
  toggleAppliance: (id: string) => void;
  addAppliance: (appliance: Appliance) => void;
  removeAppliance: (id: string) => void;
  renameAppliance: (id: string, newName: string) => void;
  updateApplianceSchedule: (id: string, schedule: string) => void;
  checkSchedules: () => void;

  // Schedule choices (manual vs optimized) — persists across pages
  scheduleChoices: Record<string, 'manual' | 'optimized'>;
  setScheduleChoice: (id: string, choice: 'manual' | 'optimized') => void;

  // Data persistence
  saveUserData: () => Promise<void>;
  loadUserData: (phone: string) => Promise<void>;

  // Auth
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  login: (phone: string, password?: string) => Promise<boolean>;
  register: (phone: string, password?: string, discom?: string, customerId?: string) => Promise<boolean>;
  logout: () => void;

  // Onboarding
  onboarding: OnboardingState;
  setOnboardingStep: (step: number) => void;
  setUserInfo: (info: OnboardingState['userInfo']) => void;
  setMeterInfo: (info: OnboardingState['meterInfo']) => void;
  setAppliancePreferences: (prefs: OnboardingState['appliancePreferences']) => void;
  completeOnboarding: () => void;

  // Chat
  chatMessages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (text: string) => void;
  addBotMessage: (text: string, type?: ChatMessage['type']) => void;
  setIsTyping: (typing: boolean) => void;

  // Optimization
  optimizationResult: OptimizationResult | null;
  isOptimizing: boolean;
  runOptimization: () => Promise<void>;
  applySchedule: () => void;

  // Alerts
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
}

export interface FlatData {
  rank: number;
  flat: string;
  savings: number;
  energyScore: number;
  kw: number;
}

export interface ColonyData {
  totalKW: number;
  totalHomes: number;
  totalSaving: number;
  tariff: TariffMode;
  flats: FlatData[];
}

const defaultColonyData: ColonyData = {
  totalKW: 142.7,
  totalHomes: 200,
  totalSaving: 41200,
  tariff: 'mid',
  flats: [
    { rank: 1, flat: 'A-301', savings: 1240, energyScore: 94, kw: 0.52 },
    { rank: 2, flat: 'B-108', savings: 1180, energyScore: 91, kw: 0.61 },
    { rank: 3, flat: 'C-205', savings: 1090, energyScore: 88, kw: 0.68 },
    { rank: 4, flat: 'D-412', savings: 980, energyScore: 85, kw: 0.73 },
    { rank: 5, flat: 'A-104', savings: 920, energyScore: 82, kw: 0.79 },
    { rank: 6, flat: 'B-310', savings: 870, energyScore: 79, kw: 0.84 },
    { rank: 7, flat: 'C-407', savings: 810, energyScore: 76, kw: 0.91 },
    { rank: 8, flat: 'D-202', savings: 760, energyScore: 73, kw: 0.95 },
    { rank: 9, flat: 'A-506', savings: 710, energyScore: 71, kw: 1.02 },
    { rank: 10, flat: 'B-201', savings: 650, energyScore: 68, kw: 1.08 },
  ],
};

const defaultAlerts: Alert[] = [
  {
    id: '1',
    type: 'tariff',
    title: 'Peak Time Starting!',
    message: 'Peak tariff starts in 10 minutes. Consider postponing heavy appliance usage.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionLabel: 'View Schedule',
  },
  {
    id: '2',
    type: 'savings',
    title: '₹18 Saved Today',
    message: 'You saved ₹18 today by shifting geyser to sasta hours!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'anomaly',
    title: 'AC Usage Alert',
    message: 'AC running 40% longer than usual. Check if temperature settings are optimal.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
  },
];

export const useVoltStore = create<VoltStore>((set, get) => ({
  tariffMode: 'mid',
  setTariffMode: (mode) => set({ tariffMode: mode }),

  liveKW: 142.7,
  setLiveKW: (kw) => set({ liveKW: kw }),

  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),

  homesSliderValue: 100,
  setHomesSliderValue: (value) => set({ homesSliderValue: value }),

  colonyData: defaultColonyData,
  setColonyData: (data) => set({ colonyData: data }),

  appliances: [],
  toggleAppliance: (id) => {
    set((state) => ({
      appliances: state.appliances.map(a => a.id === id ? { ...a, isOn: !a.isOn } : a)
    }));
    setTimeout(() => get().saveUserData(), 0);
  },
  addAppliance: (appliance) => {
    set((state) => ({
      appliances: [...state.appliances, appliance]
    }));
    setTimeout(() => get().saveUserData(), 0);
  },
  removeAppliance: (id) => {
    set((state) => ({
      appliances: state.appliances.filter(a => a.id !== id)
    }));
    setTimeout(() => get().saveUserData(), 0);
  },
  renameAppliance: (id, newName) => {
    set((state) => ({
      appliances: state.appliances.map(a => a.id === id ? { ...a, name: newName } : a)
    }));
    setTimeout(() => get().saveUserData(), 0);
  },
  updateApplianceSchedule: (id, schedule) => {
    set((state) => ({
      appliances: state.appliances.map(a => a.id === id ? { ...a, schedule } : a)
    }));
    setTimeout(() => get().saveUserData(), 0);
  },
  checkSchedules: () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentKey = `${currentHour}:${currentMinute}`;

    // Skip if we already processed this exact minute
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((globalThis as any).__lastCheckedMinute === currentKey) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__lastCheckedMinute = currentKey;

    // Helper to convert time string like "14:30", "2:00 PM", "2PM" to { h, m }
    const parseTime = (timeStr: string): { h: number; m: number } | null => {
      if (!timeStr) return null;
      const clean = timeStr.trim().toUpperCase();
      let h = 0, m = 0;
      
      const timeMatch = clean.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        h = parseInt(timeMatch[1]);
        m = parseInt(timeMatch[2]);
        if (clean.includes('PM') && h !== 12) h += 12;
        if (clean.includes('AM') && h === 12) h = 0;
      } else {
        const hourMatch = clean.match(/(\d{1,2})\s*(AM|PM)/);
        if (hourMatch) {
          h = parseInt(hourMatch[1]);
          m = 0;
          if (hourMatch[2] === 'PM' && h !== 12) h += 12;
          if (hourMatch[2] === 'AM' && h === 12) h = 0;
        } else {
          const plainHour = clean.match(/^(\d{1,2})$/);
          if (plainHour) {
            h = parseInt(plainHour[1]);
            m = 0;
          } else {
            return null;
          }
        }
      }
      return { h, m };
    };

    const { appliances, addAlert } = get();

    console.log(`[ScheduleChecker] Checking boundaries at ${currentKey} — ${appliances.length} appliances`);

    let changed = false;
    const updatedAppliances = appliances.map(app => {
      if (!app.schedule) return app;
      const schedLower = app.schedule.toLowerCase();
      if (schedLower.includes('sasta') || schedLower.includes('tariff')) return app;

      const timeBlocks = app.schedule.split(',');

      for (const block of timeBlocks) {
        const parts = block.split(/\s*[-\u2013\u2014]\s*/).map(s => s.trim());
        if (parts.length !== 2) continue;

        const start = parseTime(parts[0]);
        const end = parseTime(parts[1]);

        if (!start || !end) continue;

        // Only trigger at exact boundary minutes — NOT continuously during the window
        const isStartBoundary = start.h === currentHour && start.m === currentMinute;
        const isEndBoundary = end.h === currentHour && end.m === currentMinute;

        if (isStartBoundary && !app.isOn) {
          console.log(`[ScheduleChecker] >>> START boundary: Turning ON ${app.name}`);
          changed = true;
          addAlert({ 
            type: 'savings', 
            title: '\u26a1 Schedule Started', 
            message: `${app.name} turned ON automatically at ${currentKey}.` 
          });
          return { ...app, isOn: true };
        }

        if (isEndBoundary && app.isOn) {
          console.log(`[ScheduleChecker] >>> END boundary: Turning OFF ${app.name}`);
          changed = true;
          addAlert({ 
            type: 'savings', 
            title: '\u26a1 Schedule Ended', 
            message: `${app.name} turned OFF automatically at ${currentKey}.` 
          });
          return { ...app, isOn: false };
        }
      }

      return app;
    });

    if (changed) {
      set({ appliances: updatedAppliances });
      setTimeout(() => get().saveUserData(), 0);
    }
  },

  scheduleChoices: {},
  setScheduleChoice: (id, choice) => {
    set((state) => ({
      scheduleChoices: { ...state.scheduleChoices, [id]: choice }
    }));
    setTimeout(() => get().saveUserData(), 0);
  },

  // Data persistence
  saveUserData: async () => {
    const { user, appliances, scheduleChoices } = get();
    if (!user?.phone) return;

    // Build daily schedule from real choices
    const today = new Date().toISOString().split('T')[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailySchedule: Record<string, any> = {};
    appliances.forEach(app => {
      const choice = scheduleChoices[app.id] || 'manual';
      dailySchedule[app.id] = {
        applianceName: app.name,
        choice,
        schedule: app.schedule || '',
        date: today,
      };
    });

    try {
      await fetch('/api/userdata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          user,
          appliances,
          scheduleChoices,
          dailySchedule: { [today]: dailySchedule },
        }),
      });
    } catch (e) {
      console.error('Failed to save user data:', e);
    }
  },
  loadUserData: async (phone: string) => {
    try {
      const res = await fetch(`/api/userdata?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.user) {
        const stored = data.user; // stored is the container: { user, appliances, scheduleChoices }
        if (stored.appliances && stored.appliances.length > 0) {
          set({ appliances: stored.appliances });
        }
        if (stored.scheduleChoices) {
          set({ scheduleChoices: stored.scheduleChoices });
        }
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
  },

  // Auth
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: async (phone: string, password?: string) => {
    try {
      // Fetch user from API
      const res = await fetch(`/api/userdata?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      
      // data.user is the container: { user: User, appliances: [], ... }
      if (data.user && data.user.user && data.user.user.password === password) {
        set({
          isAuthenticated: true,
          user: data.user.user,
        });

        // Load any previously saved data for this phone
        await get().loadUserData(phone);
        return true;
      }
      return false; // Wrong phone or password
    } catch {
      return false;
    }
  },
  register: async (phone: string, password?: string, discom?: string, customerId?: string) => {
    // Mock robust delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Dynamic user data generation
    const firstNames = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Neha', 'Karan', 'Pooja'];
    const lastNames = ['Sharma', 'Verma', 'Singh', 'Patel', 'Gupta', 'Kumar', 'Reddy', 'Jain', 'Mehta', 'Iyer'];
    const localities = ['Dwarka', 'Rohini', 'Vasant Kunj', 'Andheri', 'Koramangala', 'Indiranagar', 'Salt Lake', 'Banjara Hills', 'Gomti Nagar'];
    const cities = ['New Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Chennai', 'Pune', 'Lucknow'];
    const apartmentNames = ['Green Valley', 'Sunshine', 'Blue Ridge', 'Silver Oaks', 'Palm Grove', 'Royal Enclave'];
    
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const randomLocality = localities[Math.floor(Math.random() * localities.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomApartment = apartmentNames[Math.floor(Math.random() * apartmentNames.length)];
    const randomFlat = Math.floor(100 + Math.random() * 900);
    const randomPincode = Math.floor(110000 + Math.random() * 800000);
    const randomAddress = `Flat ${randomFlat}, ${randomApartment} Apartments, ${randomLocality}, ${randomCity} - ${randomPincode}`;

    const userData: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: randomName,
      phone,
      password,
      discom: discom || 'UPPCL',
      accountType: 'postpaid',
      customerId: customerId || '',
      address: randomAddress,
      location: `${randomLocality}, ${randomCity}`,
    };
    
    set({
      isAuthenticated: true,
      user: userData,
    });

    // Load any existing appliances if reinstalling
    await get().loadUserData(phone);

    // Save state explicitly
    await get().saveUserData();

    return true;
  },
  logout: () => {
    // Save before clearing
    get().saveUserData();
    set({ isAuthenticated: false, user: null, appliances: [], scheduleChoices: {} });
  },

  // Onboarding
  onboarding: {
    currentStep: 1,
    userInfo: null,
    meterInfo: null,
    appliancePreferences: {},
  },
  setOnboardingStep: (step) => set((state) => ({
    onboarding: { ...state.onboarding, currentStep: step }
  })),
  setUserInfo: (info) => set((state) => ({
    onboarding: { ...state.onboarding, userInfo: info }
  })),
  setMeterInfo: (info) => set((state) => ({
    onboarding: { ...state.onboarding, meterInfo: info }
  })),
  setAppliancePreferences: (prefs) => set((state) => ({
    onboarding: { ...state.onboarding, appliancePreferences: prefs }
  })),
  completeOnboarding: () => {
    const { onboarding, user } = get();
    if (onboarding.userInfo && user) {
      set({
        user: {
          ...user,
          name: onboarding.userInfo.name,
          discom: onboarding.userInfo.discom,
          accountType: onboarding.userInfo.accountType,
          meterNumber: onboarding.meterInfo?.meterNumber,
        },
      });
    }
  },

  // Chat
  chatMessages: [],
  isTyping: false,
  sendMessage: (text) => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, newMessage],
      isTyping: true,
    }));

    // Process command and generate response
    setTimeout(() => {
      const response = processChatCommand(text, get, set);
      get().addBotMessage(response, 'text');
      set({ isTyping: false });
    }, 1000);
  },
  addBotMessage: (text, type = 'text') => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type,
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, newMessage],
    }));
  },
  setIsTyping: (typing) => set({ isTyping: typing }),

  // Optimization
  optimizationResult: null,
  isOptimizing: false,
  runOptimization: async () => {
    set({ isOptimizing: true });
    
    // Simulate ML pipeline
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result: OptimizationResult = {
      originalCost: 61.40,
      optimizedCost: 47.20,
      savings: 14.20,
      savingsPercent: 23,
      schedule: [
        { applianceId: 'geyser', applianceName: 'Geyser', scheduledTime: '5:00 AM', status: 'scheduled', tariffZone: 'sasta' },
        { applianceId: 'wm', applianceName: 'Washing Machine', scheduledTime: '10:00 PM', status: 'scheduled', tariffZone: 'sasta' },
        { applianceId: 'ac', applianceName: 'Air Conditioner', scheduledTime: '1:00 PM', status: 'scheduled', tariffZone: 'mid' },
      ],
      solveTimeMs: 187,
      pipeline: 'LSTM → XGBoost → MILP',
    };
    
    set({ optimizationResult: result, isOptimizing: false });
  },
  applySchedule: () => {
    const { optimizationResult, appliances } = get();
    if (optimizationResult) {
      const updatedAppliances = appliances.map(a => {
        const schedule = optimizationResult.schedule.find(s => s.applianceId === a.id);
        return schedule ? { ...a, schedule: schedule.scheduledTime } : a;
      });
      set({ appliances: updatedAppliances });
    }
  },

  // Alerts
  alerts: defaultAlerts,
  addAlert: (alert) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
    }));
  },
  markAlertRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a)
  })),
  clearAlerts: () => set({ alerts: [] }),
}));

// Unique ID generator for chat messages (prevents collision)
let messageIdCounter = 0;
const generateMessageId = () => `msg-${Date.now()}-${++messageIdCounter}`;

// Helper: find an appliance by fuzzy name match
function findAppliance(appliances: Appliance[], query: string): Appliance | undefined {
  const q = query.toLowerCase();
  // Exact id match
  const byId = appliances.find(a => a.id === q);
  if (byId) return byId;
  // Exact name match
  const byName = appliances.find(a => a.name.toLowerCase() === q);
  if (byName) return byName;
  // Partial name match
  const byPartial = appliances.find(a => a.name.toLowerCase().includes(q) || q.includes(a.name.toLowerCase()));
  if (byPartial) return byPartial;
  // Category match
  return appliances.find(a => a.category.toLowerCase().includes(q));
}

// Parse a time string like "2pm", "14:30", "2:30 pm", "2 pm" into "HH:MM"
function parseChatTime(str: string): string | null {
  const s = str.trim().toLowerCase();
  // "14:30" or "2:30pm"
  const colonMatch = s.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
  if (colonMatch) {
    let h = parseInt(colonMatch[1]);
    const m = parseInt(colonMatch[2]);
    const ampm = colonMatch[3];
    if (ampm === 'pm' && h !== 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  // "2pm" or "2 pm"
  const hourMatch = s.match(/(\d{1,2})\s*(am|pm)/);
  if (hourMatch) {
    let h = parseInt(hourMatch[1]);
    if (hourMatch[2] === 'pm' && h !== 12) h += 12;
    if (hourMatch[2] === 'am' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:00`;
  }
  // Plain "14" or "9"
  const plainMatch = s.match(/^(\d{1,2})$/);
  if (plainMatch) {
    return `${parseInt(plainMatch[1]).toString().padStart(2, '0')}:00`;
  }
  return null;
}

// Main command processor for the chatbot
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function processChatCommand(userMessage: string, get: () => VoltStore, _set: (partial: Partial<VoltStore> | ((state: VoltStore) => Partial<VoltStore>)) => void): string {
  const msg = userMessage.toLowerCase().trim();
  const { appliances, toggleAppliance, updateApplianceSchedule, renameAppliance } = get();

  // ==========================================
  // 0. RENAME commands
  // ==========================================
  // "rename living room to bedroom light"
  // "rename fridge to kitchen fridge"
  const renameMatch = msg.match(/(?:rename|name)\s+(.+?)\s+(?:to|as)\s+(.+)/i);
  if (renameMatch) {
    const oldName = renameMatch[1].trim();
    const newName = renameMatch[2].trim();
    const app = findAppliance(appliances, oldName);
    if (!app) return `\u274c I couldn't find an appliance matching "${oldName}".\n\nYour appliances: ${appliances.map(a => a.name).join(', ') || 'None added yet'}`;
    const previousName = app.name;
    renameAppliance(app.id, newName.charAt(0).toUpperCase() + newName.slice(1));
    return `\u2705 Renamed "${previousName}" \u2192 "${newName.charAt(0).toUpperCase() + newName.slice(1)}"!\n\nYou can now control it by saying:\n\u2022 "Turn on ${newName}"\n\u2022 "Schedule ${newName} from 2pm to 6pm"`;
  }

  // ==========================================
  // 1. TURN ON / TURN OFF commands
  // ==========================================
  const onMatch = msg.match(/(?:turn\s*on|switch\s*on|chalu|start|on\s+karo|chalu\s+karo)\s+(.+)/i);
  const offMatch = msg.match(/(?:turn\s*off|switch\s*off|band|stop|off\s+karo|band\s+karo)\s+(.+)/i);

  if (onMatch) {
    const target = onMatch[1].trim();
    const app = findAppliance(appliances, target);
    if (!app) return `❌ I couldn't find an appliance matching "${target}".\n\nYour appliances: ${appliances.map(a => a.name).join(', ') || 'None added yet'}`;
    if (app.isOn) return `✅ ${app.name} is already ON (${app.kw} kW).`;
    toggleAppliance(app.id);
    return `✅ ${app.name} has been turned **ON**! ⚡\n\nPower: ${app.kw} kW\nSchedule: ${app.schedule || 'Not set'}`;
  }

  if (offMatch) {
    const target = offMatch[1].trim();
    const app = findAppliance(appliances, target);
    if (!app) return `❌ I couldn't find an appliance matching "${target}".\n\nYour appliances: ${appliances.map(a => a.name).join(', ') || 'None added yet'}`;
    if (!app.isOn) return `✅ ${app.name} is already OFF.`;
    toggleAppliance(app.id);
    return `✅ ${app.name} has been turned **OFF**. 🔌\n\nYou're saving ${app.kw} kW now!`;
  }

  // ==========================================
  // 2. SCHEDULE commands
  // ==========================================
  // "schedule living room from 2pm to 6pm"
  // "set schedule fridge 14:00 to 18:00"
  const scheduleMatch = msg.match(/(?:schedule|set\s+schedule)\s+(.+?)\s+(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2})\s+(?:to|-)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2})/i);
  if (scheduleMatch) {
    const target = scheduleMatch[1].trim();
    const startRaw = scheduleMatch[2];
    const endRaw = scheduleMatch[3];
    const app = findAppliance(appliances, target);
    if (!app) return `❌ I couldn't find an appliance matching "${target}".\n\nYour appliances: ${appliances.map(a => a.name).join(', ') || 'None added yet'}`;
    const startTime = parseChatTime(startRaw);
    const endTime = parseChatTime(endRaw);
    if (!startTime || !endTime) return `⚠️ I couldn't understand the times. Try: "schedule ${app.name} from 2pm to 6pm"`;
    const scheduleStr = `${startTime} \u2013 ${endTime}`;
    updateApplianceSchedule(app.id, scheduleStr);
    return `📅 ${app.name} schedule updated!\n\n⏰ ${startTime} \u2013 ${endTime}\n\nThe appliance will automatically turn ON at ${startTime} and OFF at ${endTime}.`;
  }

  // ==========================================
  // 3. STATUS queries
  // ==========================================
  if (msg.includes('status') || msg.includes('list') || msg.includes('show') || msg.includes('appliance')) {
    if (appliances.length === 0) return '📋 You have no appliances added yet. Go to the Appliances page to add some!';
    const lines = appliances.map(a => {
      const status = a.isOn ? '🟢 ON' : '🔴 OFF';
      return `• **${a.name}** — ${status} (${a.kw} kW)${a.schedule ? ` | Schedule: ${a.schedule}` : ''}`;
    });
    const totalOn = appliances.filter(a => a.isOn).reduce((s, a) => s + a.kw, 0);
    return `📋 **Your Appliances:**\n\n${lines.join('\n')}\n\n⚡ Total active load: ${totalOn.toFixed(2)} kW`;
  }

  // ==========================================
  // 4. Fallback: existing static responses
  // ==========================================
  if (msg.includes('bill') || msg.includes('aaj')) {
    return '💡 Today\'s estimated bill: ₹18.40\n\nBreakdown:\n• AC: ₹8.20\n• Geyser: ₹4.10\n• Other: ₹6.10\n\nYou\'re 12% below average! 🎉';
  }
  
  if (msg.includes('tips') || msg.includes('save') || msg.includes('saving')) {
    return '💰 Top 3 Savings Tips:\n\n1. Run geyser during 5-6 AM (sasta hours)\n2. Use washing machine after 10 PM\n3. Set AC to 24°C instead of 22°C\n\nPotential monthly savings: ₹420';
  }
  
  return '👋 I can help you with:\n\n⚡ **Appliance Control:**\n• "Turn on Living Room"\n• "Turn off Fridge"\n\n📅 **Scheduling:**\n• "Schedule AC from 2pm to 6pm"\n\n📋 **Status:**\n• "Show appliances" or "Status"\n\n💡 **Info:**\n• "Today\'s bill" or "Savings tips"\n\nTry one of these!';
}
