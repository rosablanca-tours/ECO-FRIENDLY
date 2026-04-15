import { motion } from 'motion/react';
import { User, Home, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface Props {
  userProfile: UserProfile;
  onRoleSelected: (role: 'visitor' | 'host') => void;
}

export default function RoleSelectionModal({ userProfile, onRoleSelected }: Props) {
  const selectRole = async (role: 'visitor' | 'host') => {
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        role: role
      });
      onRoleSelected(role);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userProfile.uid}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl text-center max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2 leading-tight">¡Bienvenido a Ecofriendly!</h2>
        <p className="text-xs sm:text-base text-muted mb-6 sm:mb-8">Para comenzar, dinos cómo quieres usar la plataforma:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Visitor Option */}
          <button 
            onClick={() => selectRole('visitor')}
            className="group p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-bg hover:border-secondary hover:bg-secondary/5 transition-all text-left flex flex-col gap-3 sm:gap-4"
          >
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-secondary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
              <User className="w-5 h-5 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold text-primary mb-1">Soy Viajero</h3>
              <p className="text-[11px] sm:text-sm text-muted leading-tight">Busco alojamientos sostenibles y quiero contribuir a la conservación.</p>
            </div>
            <div className="mt-auto flex items-center gap-2 text-secondary font-bold text-[10px] sm:text-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <span>Seleccionar</span>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </button>

          {/* Host Option */}
          <button 
            onClick={() => selectRole('host')}
            className="group p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-bg hover:border-primary hover:bg-primary/5 transition-all text-left flex flex-col gap-3 sm:gap-4"
          >
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold text-primary mb-1">Soy Alojamiento</h3>
              <p className="text-[11px] sm:text-sm text-muted leading-tight">Tengo una posada o hotel y quiero certificarme bajo la norma COVENIN 2030.</p>
            </div>
            <div className="mt-auto flex items-center gap-2 text-primary font-bold text-[10px] sm:text-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <span>Seleccionar</span>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </button>
        </div>

        <p className="mt-8 text-xs text-muted">
          Podrás cambiar tu rol o gestionar ambos perfiles más adelante desde tu configuración.
        </p>
      </motion.div>
    </div>
  );
}
