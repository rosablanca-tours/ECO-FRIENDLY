import { useState } from 'react';
import { Mic, Send, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processUserIntent } from '../services/geminiService';
import { AssistantResponse } from '../types';
import { cn } from '../lib/utils';

interface Props {
  onResult: (res: AssistantResponse) => void;
  isPremium?: boolean;
  className?: string;
}

export default function VoiceInterface({ onResult, isPremium, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const response = await processUserIntent(text, 'VOICE', isPremium);
      onResult(response);
      setInputValue('');
      setIsOpen(false);
    } catch (error) {
      console.error("Voice processing error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setInputValue("Busca posadas en la playa con buen Eco-Score");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-accent border-none text-white grid place-items-center shadow-[0_10px_20_rgba(255,159,28,0.3)] transition-transform active:scale-95 z-50 group relative",
          !isOpen && "animate-pulse",
          className || "fixed bottom-6 right-6 sm:bottom-10 sm:right-10"
        )}
      >
        <Mic className="w-6 h-6 sm:w-8 sm:h-8" />
        <div className="absolute -top-1 -right-1 bg-primary text-white text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-bounce">
          AI
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-primary/10 rounded-full"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center relative">
                  {isListening ? (
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-primary/20 rounded-full"
                    />
                  ) : null}
                  <Mic className={cn("w-8 h-8 sm:w-10 sm:h-10", isListening ? "text-primary" : "text-primary/40")} />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-primary">Asistente de Voz Eco</h2>
                  <p className="text-muted text-xs sm:text-sm italic">
                    {isListening ? "Escuchando tus deseos de viaje..." : "Dime a dónde quieres ir o qué buscas."}
                  </p>
                  {isPremium && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" />
                      Rutas Sostenibles y Cálculo CO2 Activo
                    </div>
                  )}
                </div>

                <div className="w-full relative">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ej: 'Busca posadas en Choroní'"
                    className="w-full bg-bg border-none rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 pr-12 focus:ring-2 focus:ring-primary outline-none text-text text-sm sm:text-base"
                    onKeyDown={(e) => e.key === 'Enter' && handleAction(inputValue)}
                  />
                  <button 
                    onClick={() => handleAction(inputValue)}
                    disabled={isLoading}
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-white px-3 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading ? <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <button 
                    onClick={toggleListening}
                    className={cn(
                      "px-5 sm:px-6 py-2 rounded-full font-medium transition-all text-sm sm:text-base",
                      isListening ? "bg-accent text-white" : "bg-primary/10 text-primary"
                    )}
                  >
                    {isListening ? "Detener" : "Hablar ahora"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
