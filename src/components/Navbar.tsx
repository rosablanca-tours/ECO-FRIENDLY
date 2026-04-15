import { useState, useEffect } from 'react';
import { auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfile } from '../types';
import { Leaf, LogOut, User as UserIcon, RefreshCw, MapPin, Home, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  onLogout: () => void;
  userProfile: UserProfile | null;
}

export default function Navbar({ onLogout, userProfile }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(userProfile);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 top-bar !px-4 sm:!px-10 transition-all duration-500",
      profile?.role === 'host' ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white/90 backdrop-blur-md border-b-2 border-bg shadow-sm"
    )}>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors",
          profile?.role === 'host' ? "bg-accent text-primary" : "bg-primary text-white"
        )}>
          <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex flex-col -space-y-1">
          <span className={cn(
            "text-lg sm:text-xl font-black tracking-tighter whitespace-nowrap",
            profile?.role === 'host' ? "text-white" : "text-primary"
          )}>
            ECOFRIENDLY
          </span>
          <span className={cn(
            "text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]",
            profile?.role === 'host' ? "text-accent" : "text-secondary"
          )}>
            {profile?.role === 'host' ? 'Portal Host' : 'App Viajero'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-6">
        {profile?.role === 'visitor' && (
          <div className="hidden sm:flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
            <Sparkles className="w-3 h-3 text-accent animate-pulse" />
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">AI Activa</span>
          </div>
        )}
        {user && (
          <div className="flex items-center gap-1 sm:gap-4">
            <div className={cn(
              "user-badge flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl border transition-colors",
              profile?.role === 'host' ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-100 text-primary"
            )}>
              <div className="hidden md:flex flex-col items-end -space-y-1">
                <div className="text-xs font-black truncate max-w-[100px]">{profile?.displayName}</div>
                <div className="text-[9px] font-bold text-muted uppercase tracking-wider">{profile?.role}</div>
              </div>
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border-2 border-secondary/20" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                </div>
              )}
            </div>

            <button 
              onClick={onLogout} 
              className={cn(
                "p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all hover:scale-110",
                profile?.role === 'host' ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-bg text-primary hover:bg-gray-200"
              )}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
