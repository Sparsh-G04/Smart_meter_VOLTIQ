'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Mic, MicOff } from 'lucide-react';
import { useVoltStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/GlassCard';

const quickActions = [
  { icon: '📋', label: 'Appliance status', query: 'Show appliances' },
  { icon: '💡', label: 'Turn on Living Room', query: 'Turn on Living Room' },
  { icon: '🔌', label: 'Turn off Fridge', query: 'Turn off Fridge' },
  { icon: '📅', label: 'Schedule AC 2-6 PM', query: 'Schedule AC from 2pm to 6pm' },
  { icon: '💰', label: 'Savings tips', query: 'Give me savings tips' },
  { icon: '💡', label: 'Today\'s bill', query: 'What is my bill today?' },
];

// Extend Window for SpeechRecognition types
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
  resultIndex: number;
}

export default function ChatPage() {
  const { chatMessages, isTyping, sendMessage } = useVoltStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const voiceTranscriptRef = useRef('');

  // Check for Speech Recognition support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // English (India) for best results
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[Object.keys(event.results).length - 1];
        const transcript = lastResult[0].transcript;
        setInput(transcript);
        voiceTranscriptRef.current = transcript;
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-send the final transcript immediately
        const finalText = voiceTranscriptRef.current.trim();
        if (finalText) {
          voiceTranscriptRef.current = '';
          // Use store directly to avoid React state timing issues
          const store = useVoltStore.getState();
          store.sendMessage(finalText);
          setInput('');
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('[Voice] Recognition error:', event.error);
        }
        setIsListening(false);
        voiceTranscriptRef.current = '';
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const welcomeSentRef = useRef(false);

  useEffect(() => {
    if (chatMessages.length === 0 && !welcomeSentRef.current) {
      welcomeSentRef.current = true;
      const store = useVoltStore.getState();
      store.addBotMessage(
        '👋 Namaste! I\'m your VoltIQ AI assistant. I can help you with:\n\n• Control your appliances (voice or text!)\n• Check today\'s energy usage\n• Get personalized savings tips\n• Understand your bill\n\n🎤 Tap the mic button to use voice commands!\nWhat would you like to know?'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(() => {
    if (input.trim()) {
      // Stop listening if active
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      sendMessage(input);
      setInput('');
      inputRef.current?.focus();
    }
  }, [input, isListening, sendMessage]);

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      // Stop listening — onend handler will auto-send the transcript
      recognitionRef.current.stop();
    } else {
      setInput('');
      voiceTranscriptRef.current = '';
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('[Voice] Failed to start:', e);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 h-screen bg-[#0a0f1c] flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex-shrink-0"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-volt-cyan to-volt-blue flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">VoltIQ Assistant</h1>
              <p className="text-sm text-gray-400">AI-powered energy advisor · Voice enabled 🎤</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        {chatMessages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex-shrink-0"
          >
            <p className="text-sm text-gray-400 mb-3">Quick actions:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickActions.map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => handleQuickAction(action.query)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-volt-cyan/50 hover:bg-volt-cyan/5 transition-all text-center"
                >
                  <span className="text-2xl mb-2 block">{action.icon}</span>
                  <span className="text-xs text-gray-300">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {chatMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-volt-cyan to-volt-blue flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-volt-cyan text-gray-900 rounded-tr-none'
                      : 'bg-white/10 text-white rounded-tl-none border border-white/10'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  {message.type === 'data' && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs opacity-70">
                      💡 Tip: Ask me for more details!
                    </div>
                  )}
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-volt-blue flex items-center justify-center flex-shrink-0 ml-3 mt-1">
                    <span className="text-sm">👤</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-volt-cyan to-volt-blue flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 border border-white/10">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Voice listening indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-center mb-3"
            >
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/30">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-red-500"
                />
                <span className="text-sm text-red-400 font-medium">Listening... Speak now</span>
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 16, 4] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-red-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-shrink-0"
        >
          <GlassCard className="p-3">
            <div className="flex items-end gap-2">
              {/* Mic button */}
              {voiceSupported && (
                <button
                  onClick={toggleVoice}
                  disabled={isTyping}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isListening
                      ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-volt-cyan'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? '🎤 Listening...' : 'Type or tap 🎤 to speak...'}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm py-2 px-2"
                disabled={isTyping}
              />
              
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  input.trim() && !isTyping
                    ? 'bg-volt-cyan text-gray-900 hover:bg-volt-cyan/90 hover:scale-110'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </GlassCard>

          <p className="text-xs text-gray-500 text-center mt-3">
            🎤 Voice commands supported · VoltIQ AI is powered by advanced ML models
          </p>
        </motion.div>
      </div>
    </div>
  );
}
