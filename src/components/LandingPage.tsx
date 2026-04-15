import { motion, AnimatePresence } from 'motion/react';
import { User, Home, Leaf, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  onSelectRole: (role: 'visitor' | 'host') => void;
  onLogin: () => void;
  selectedRole: 'visitor' | 'host' | null;
  isLoggingIn?: boolean;
  error?: string | null;
}

export default function LandingPage({ onSelectRole, onLogin, selectedRole, isLoggingIn, error }: Props) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8 sm:mb-12 z-10"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Leaf className="text-white w-6 h-6 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-3xl sm:text-6xl font-extrabold text-primary tracking-tighter whitespace-nowrap">ECOFRIENDLY</h1>
        </div>
        <p className="text-base sm:text-xl text-muted max-w-md mx-auto font-medium px-4">
          Turismo sostenible en Venezuela. <br/>
          <span className="text-primary/60">Elige tu camino para comenzar.</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl z-10 px-2 sm:px-0">
        {/* Visitor Option */}
        <motion.button 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole('visitor')}
          className={`group p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border-4 transition-all text-left flex flex-col gap-4 sm:gap-6 bg-white shadow-xl ${
            selectedRole === 'visitor' ? 'border-secondary ring-4 ring-secondary/20' : 'border-transparent hover:border-secondary/30'
          }`}
        >
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${
            selectedRole === 'visitor' ? 'bg-secondary text-white' : 'bg-secondary/10 text-secondary'
          }`}>
            <User className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">Soy Viajero</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Quiero explorar destinos increíbles, hospedarme en lugares eco-verificados y contribuir a la conservación.
            </p>
          </div>
          {selectedRole === 'visitor' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-secondary font-bold text-sm sm:text-base">
              <span>Seleccionado</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
          )}
        </motion.button>

        {/* Host Option */}
        <motion.button 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole('host')}
          className={`group p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border-4 transition-all text-left flex flex-col gap-4 sm:gap-6 bg-white shadow-xl ${
            selectedRole === 'host' ? 'border-primary ring-4 ring-primary/20' : 'border-transparent hover:border-primary/30'
          }`}
        >
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${
            selectedRole === 'host' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
          }`}>
            <Home className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">Soy Alojamiento</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Tengo una posada o hotel y quiero certificar mi compromiso ambiental bajo la norma COVENIN 2030.
            </p>
          </div>
          {selectedRole === 'host' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
              <span>Seleccionado</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {selectedRole && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="mt-12 z-10 w-full max-w-xs flex flex-col gap-4"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl font-bold text-center"
              >
                {error}
              </motion.div>
            )}
            <button 
              onClick={onLogin}
              disabled={isLoggingIn}
              className={cn(
                "w-full main-btn py-4 sm:py-5 text-base sm:text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-all",
                isLoggingIn && "opacity-70 cursor-not-allowed scale-95"
              )}
            >
              {isLoggingIn ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continuar Registro</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="absolute bottom-8 text-center text-[10px] uppercase tracking-[0.2em] text-muted font-bold opacity-50">
        Ecofriendly Venezuela • Sostenibilidad Certificada
      </footer>
    </div>
  );
}
