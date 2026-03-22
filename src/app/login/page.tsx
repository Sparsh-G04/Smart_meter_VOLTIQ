'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, Sparkles } from 'lucide-react';
import PhoneInput from '@/components/auth/PhoneInput';
import OTPInput from '@/components/auth/OTPInput';
import DiscomInput from '@/components/auth/DiscomInput';
import PasswordInput from '@/components/auth/PasswordInput';
import { useVoltStore } from '@/lib/store';

type Step = 'phone' | 'otp' | 'loginPassword' | 'createPassword' | 'discom' | 'discomOtp';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [discom, setDiscom] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [discomOtp, setDiscomOtp] = useState('');
  const login = useVoltStore((s) => s.login);
  const register = useVoltStore((s) => s.register);

  const handlePhoneSubmit = async () => {
    setLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoading(false);
    if (authMode === 'login') {
      setStep('loginPassword');
    } else {
      setPhoneOtp(Math.floor(100000 + Math.random() * 900000).toString());
      setStep('otp');
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    setError('');
    
    if (otp === phoneOtp) {
      setLoading(false);
      setStep('createPassword');
    } else {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    setLoading(true);
    setError('');

    const success = await login(phone, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid phone number or password.');
      setLoading(false);
    }
  };

  const handleCreatePasswordSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    setStep('discom');
  };

  const handleDiscomSubmit = async () => {
    setLoading(true);
    setError('');

    // Simulate DISCOM verification API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setLoading(false);
    setDiscomOtp(Math.floor(100000 + Math.random() * 900000).toString());
    setStep('discomOtp');
  };

  const handleDiscomOTPVerify = async (otp: string) => {
    setLoading(true);
    setError('');
    
    if (otp === discomOtp) {
      const success = await register(phone, password, discom, customerId);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    } else {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (step === 'otp') {
      setPhoneOtp(Math.floor(100000 + Math.random() * 900000).toString());
    } else if (step === 'discomOtp') {
      setDiscomOtp(Math.floor(100000 + Math.random() * 900000).toString());
    }
    setLoading(false);
  };

  // Progress indicator
  let stepIndex = 0;
  let totalSteps = 2; // Default for login

  if (authMode === 'login') {
    stepIndex = step === 'phone' ? 0 : 1;
    totalSteps = 2;
  } else {
    stepIndex = { phone: 0, otp: 1, createPassword: 2, discom: 3, discomOtp: 4, loginPassword: 1 }[step] || 0;
    totalSteps = 5;
  }

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setStep('phone');
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-volt-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-volt-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-volt-green/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo and header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-volt-cyan to-volt-blue flex items-center justify-center relative">
                <Zap className="w-8 h-8 text-white" fill="white" />
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-volt-cyan/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">
                  Volt<span className="text-volt-cyan">IQ</span>
                </h1>
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg"
            >
              Smart Energy, Smarter Savings
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-volt-green/10 border border-volt-green/20 rounded-full"
            >
              <Sparkles className="w-4 h-4 text-volt-green" />
              <span className="text-sm text-volt-green font-semibold">
                Save up to 23% on electricity bills
              </span>
            </motion.div>
          </motion.div>

          {/* Step progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            {/* Login / Register Toggle */}
            {step === 'phone' && (
              <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                <button
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    authMode === 'login' ? 'bg-volt-cyan text-gray-900 shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    authMode === 'register' ? 'bg-volt-cyan text-gray-900 shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs text-gray-500">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <span className="text-xs text-volt-cyan font-medium">
                {step === 'phone' && 'Phone Number'}
                {step === 'otp' && 'Phone Verification'}
                {step === 'createPassword' && 'Create Password'}
                {step === 'loginPassword' && 'Enter Password'}
                {step === 'discom' && 'DISCOM Details'}
                {step === 'discomOtp' && 'DISCOM Verification'}
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-volt-cyan to-volt-green rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>

          {/* Auth forms */}
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <PhoneInput
                key="phone"
                value={phone}
                onChange={setPhone}
                onSubmit={handlePhoneSubmit}
                loading={loading}
              />
            )}

            {step === 'loginPassword' && (
              <PasswordInput
                key="loginPassword"
                value={password}
                onChange={setPassword}
                onSubmit={handleLoginSubmit}
                onBack={() => setStep('phone')}
                loading={loading}
                isCreate={false}
              />
            )}

            {step === 'createPassword' && (
              <PasswordInput
                key="createPassword"
                value={password}
                onChange={setPassword}
                onSubmit={handleCreatePasswordSubmit}
                onBack={() => setStep('otp')}
                loading={loading}
                isCreate={true}
              />
            )}

            {step === 'otp' && (
              <OTPInput
                key="otp"
                phoneNumber={phone}
                onComplete={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={() => setStep('phone')}
                loading={loading}
                title="Verify Phone Number"
                dummyOtp={phoneOtp}
              />
            )}

            {step === 'discom' && (
              <DiscomInput
                key="discom"
                discom={discom}
                customerId={customerId}
                onDiscomChange={setDiscom}
                onCustomerIdChange={setCustomerId}
                onSubmit={handleDiscomSubmit}
                loading={loading}
              />
            )}

            {step === 'discomOtp' && (
              <OTPInput
                key="discomOtp"
                phoneNumber={phone}
                onComplete={handleDiscomOTPVerify}
                onResend={handleResendOTP}
                onBack={() => setStep('discom')}
                loading={loading}
                title="DISCOM Verification"
                subtitle={`OTP sent by ${discom} to Customer ID ${customerId}`}
                dummyOtp={discomOtp}
              />
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-volt-red/10 border border-volt-red/20 rounded-xl"
              >
                <p className="text-sm text-volt-red text-center">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            {[
              { icon: '⚡', label: 'Real-time\nTracking' },
              { icon: '🤖', label: 'AI-Powered\nOptimization' },
              { icon: '💰', label: 'Instant\nSavings' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="text-center p-4 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <p className="text-xs text-gray-400 whitespace-pre-line leading-tight">
                  {feature.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-gray-600 mt-8"
          >
            Trusted by 3 Cr+ smart meters across India
          </motion.p>
        </div>
      </div>
    </div>
  );
}
