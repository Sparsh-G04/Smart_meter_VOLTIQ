'use client';

import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
  loading?: boolean;
  isCreate?: boolean;
}

export default function PasswordInput({ value, onChange, onSubmit, onBack, loading, isCreate }: PasswordInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.length >= 6) {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="glass-light rounded-2xl p-8 border border-white/10 relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-4 mb-6 pr-8">
          <div className="w-12 h-12 rounded-xl bg-volt-cyan/10 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 text-volt-cyan" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{isCreate ? 'Create Password' : 'Enter Password'}</h3>
            <p className="text-sm text-gray-400">{isCreate ? 'At least 6 characters' : 'To access your account'}</p>
          </div>
        </div>

        <div className="relative">
          <input
            type="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="••••••••"
            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-volt-cyan/50 focus:ring-2 focus:ring-volt-cyan/20 transition-all text-lg font-medium"
            disabled={loading}
          />
        </div>

        <motion.button
          onClick={onSubmit}
          disabled={value.length < 6 || loading}
          className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all ${
            value.length >= 6 && !loading
              ? 'bg-volt-cyan text-gray-900 hover:bg-volt-cyan/90 hover:scale-[1.02]'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
          }`}
          whileHover={value.length >= 6 && !loading ? { scale: 1.02 } : {}}
          whileTap={value.length >= 6 && !loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            'Continue'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
