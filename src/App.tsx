import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AccommodationCard from './components/AccommodationCard';
import VoiceInterface from './components/VoiceInterface';
import BookingModal from './components/BookingModal';
import RoleSelectionModal from './components/RoleSelectionModal';
import HostPortal from './components/HostPortal';
import LandingPage from './components/LandingPage';
import FilterBar from './components/FilterBar';
import { SIMULATED_ACCOMMODATIONS, ECO_BADGES } from './constants';
import { Accommodation, AssistantResponse, UserProfile, SearchFilters } from './types';
import { auth, db, handleFirestoreError, OperationType, googleProvider } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Menu, LayoutDashboard, Search, Trophy, RefreshCw, Home, ShieldCheck, BarChart3, Users } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>(SIMULATED_ACCOMMODATIONS);
  const [selectedAcc, setSelectedAcc] = useState<Accommodation | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [assistantResult, setAssistantResult] = useState<AssistantResponse | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    if (userProfile && userProfile.role === 'visitor') {
      const timer = setTimeout(() => {
        alert("¡Bienvenido! Hemos actualizado tu Eco-Pasaporte con un nuevo sistema de Niveles, Insignias y un Asistente IA mejorado. ¡Explora el nuevo Dashboard arriba!");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userProfile?.role]);

  const handleRedeemCode = async () => {
    if (promoCode.toLowerCase() === 'eco') {
      if (!userProfile) return;
      const updatedFields: Partial<UserProfile> = { isPremium: true };
      updatedFields.badges = checkBadges(userProfile, updatedFields);
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), updatedFields);
        alert('¡Código aceptado! Bienvenido al nivel PREMIUM.');
        setPromoCode('');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
      }
    } else {
      alert('Código inválido.');
    }
  };
  const [preSelectedRole, setPreSelectedRole] = useState<'visitor' | 'host' | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'explore' | 'missions'>('explore');
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 500],
    energy: 'all',
    water: 'all',
    type: 'all',
    location: '',
    guests: 1,
    minEcoScore: 0,
    impactType: 'all'
  });

  const getUserLevel = (points: number = 0) => {
    if (points >= 1000) return { name: "Guardián de la Selva", icon: "🌳", next: 2000 };
    if (points >= 500) return { name: "Árbol", icon: "🌲", next: 1000 };
    if (points >= 200) return { name: "Brote", icon: "🌱", next: 500 };
    return { name: "Semilla", icon: "🥜", next: 200 };
  };

  const checkBadges = (profile: UserProfile, updatedFields: Partial<UserProfile>) => {
    const currentBadges = profile.badges || [];
    const newBadges = [...currentBadges];
    const points = updatedFields.ecoPoints ?? profile.ecoPoints ?? 0;
    const missions = updatedFields.completedMissionsCount ?? profile.completedMissionsCount ?? 0;
    const isPremium = updatedFields.isPremium ?? profile.isPremium ?? false;

    if (missions >= 1 && !newBadges.includes('first_mission')) newBadges.push('first_mission');
    if (points >= 500 && !newBadges.includes('eco_warrior')) newBadges.push('eco_warrior');
    if (missions >= 5 && !newBadges.includes('zero_waste')) newBadges.push('zero_waste');
    if (isPremium && !newBadges.includes('premium_traveler')) newBadges.push('premium_traveler');
    if (points >= 1000 && !newBadges.includes('forest_guardian')) newBadges.push('forest_guardian');

    return newBadges;
  };

  const handleCompleteMission = async (mission: { title: string, points: number }) => {
    if (!userProfile) return;
    const newPoints = (userProfile.ecoPoints || 0) + mission.points;
    const newCredits = (userProfile.ecoCredits || 0) + Math.floor(mission.points / 10);
    const newMissionsCount = (userProfile.completedMissionsCount || 0) + 1;
    
    const updatedFields: Partial<UserProfile> = {
      ecoPoints: newPoints,
      ecoCredits: newCredits,
      completedMissionsCount: newMissionsCount
    };
    
    updatedFields.badges = checkBadges(userProfile, updatedFields);
    
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), updatedFields);
      alert(`¡Misión "${mission.title}" completada! Has ganado ${mission.points} Eco-Points y ${Math.floor(mission.points / 10)} Eco-Créditos.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  const filteredAccommodations = accommodations.filter(acc => {
    const matchesPrice = acc.price <= filters.priceRange[1];
    const matchesEnergy = filters.energy === 'all' || acc.sustainabilityParams?.energy === filters.energy;
    const matchesWater = filters.water === 'all' || acc.sustainabilityParams?.water === filters.water;
    const matchesLocation = filters.location === '' || acc.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesGuests = (acc.maxGuests || 10) >= filters.guests;
    const matchesEco = acc.ecoScore >= filters.minEcoScore;
    const matchesImpact = filters.impactType === 'all' || acc.impactType === filters.impactType;
    
    // Level restriction: Secret accommodations only for "Árbol" or higher, or Premium users
    const userPoints = userProfile?.ecoPoints || 0;
    const isPremium = userProfile?.isPremium || false;
    if (acc.isSecret && userPoints < 500 && !isPremium) return false;

    return matchesPrice && matchesEnergy && matchesWater && matchesLocation && matchesGuests && matchesEco && matchesImpact;
  });

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      // Clean up previous listener
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      setIsAuthLoading(true);
      if (u) {
        // Small delay to ensure auth token is fully propagated for security rules
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userDoc = doc(db, 'users', u.uid);
        try {
          const docSnap = await getDoc(userDoc);
          
          if (!docSnap.exists()) {
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.displayName || 'Usuario Eco',
              email: u.email || 'eco@user.com',
              photoURL: u.photoURL || '',
              isPremium: false,
              ecoPoints: 0,
              role: preSelectedRole || 'visitor'
            };
            await setDoc(userDoc, newProfile);
            setUserProfile(newProfile);
          } else {
            const existingData = docSnap.data() as UserProfile;
            // If user explicitly chose a role on landing page, update it
            if (preSelectedRole && existingData.role !== preSelectedRole) {
              await updateDoc(userDoc, { role: preSelectedRole });
            }
            
            unsubSnapshot = onSnapshot(userDoc, (doc) => {
              if (doc.exists()) {
                setUserProfile(doc.data() as UserProfile);
              }
            }, (error) => {
              // Only log if we still have a user (ignore stale listener errors on logout)
              if (auth.currentUser) {
                handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
              }
            });
          }
        } catch (error) {
          if (auth.currentUser) {
            handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
          }
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [preSelectedRole]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError("El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para iniciar sesión.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        setLoginError("Se canceló la solicitud de inicio de sesión. Por favor, intenta de nuevo.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLoginError("Cerraste la ventana de inicio de sesión. Intenta de nuevo.");
      } else {
        setLoginError("Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setPreSelectedRole(null);
  };

  const handleAssistantResult = (res: AssistantResponse) => {
    setAssistantResult(res);
    
    // Apply filters from assistant if present
    if (res.filters) {
      setFilters(prev => ({
        ...prev,
        priceRange: [0, res.filters?.maxPrice || prev.priceRange[1]],
        energy: res.filters?.energy || prev.energy,
        water: res.filters?.water || prev.water,
        location: res.filters?.location || prev.location,
        guests: res.filters?.guests || prev.guests,
        minEcoScore: res.filters?.minEcoScore || prev.minEcoScore,
        impactType: res.filters?.impactType || prev.impactType
      }));
    }

    const filtered = SIMULATED_ACCOMMODATIONS.filter(a => 
      a.name.toLowerCase().includes(res.result.name.toLowerCase()) ||
      a.location.toLowerCase().includes(res.result.name.toLowerCase())
    );
    setAccommodations(filtered.length > 0 ? filtered : SIMULATED_ACCOMMODATIONS);
  };

  const handleBookingSuccess = async (booking: any) => {
    if (!userProfile) return;
    
    // Commission Logic: 10% commission, 5% of that donated
    const commission = booking.totalAmount * 0.1;
    const donation = commission * 0.05;
    
    const newBookingsCount = (userProfile.bookingsCount || 0) + 1;
    const basePoints = 50;
    const extraPoints = booking.extraPoints || 0;
    const newPoints = (userProfile.ecoPoints || 0) + basePoints + extraPoints;
    
    const updatedFields: Partial<UserProfile> = {
      bookingsCount: newBookingsCount,
      ecoPoints: newPoints
    };
    
    updatedFields.badges = checkBadges(userProfile, updatedFields);
    
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), updatedFields);
      
      const co2Saved = (booking.nights * 2).toFixed(1);
      
      alert(`¡Felicidades, Eco-Viajero! Tu estancia en ${booking.accommodationName} evitará la emisión de ${co2Saved}kg de CO2. Has ganado ${basePoints + extraPoints} Eco-Points. Tienes una misión pendiente al llegar para desbloquear tu próximo descuento.`);
      
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  const handleSwitchRole = async (role: 'visitor' | 'host') => {
    if (!userProfile) return;
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), { role });
      setUserProfile({ ...userProfile, role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  useEffect(() => {
    const q = collection(db, 'accommodations');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Accommodation));
      // For visitors, we only show approved ones. For this demo, we'll also keep simulated ones.
      const approvedDocs = docs.filter(d => d.status === 'approved');
      setAccommodations([...SIMULATED_ACCOMMODATIONS, ...approvedDocs]);
    }, (error) => {
      console.error("Error fetching accommodations:", error);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <LandingPage 
        selectedRole={preSelectedRole} 
        onSelectRole={setPreSelectedRole} 
        onLogin={handleLogin} 
        isLoggingIn={isLoggingIn}
        error={loginError}
      />
    );
  }

  return (
    <div className={cn(
      "min-h-screen pb-24 overflow-x-hidden transition-colors duration-500",
      userProfile.role === 'host' ? "bg-slate-900" : "bg-bg"
    )}>
      <Navbar 
        onLogout={handleLogout} 
        userProfile={userProfile} 
      />

      {/* Main Layout Grid */}
      <div className="pt-24 sm:pt-32 px-4 sm:px-6 max-w-7xl mx-auto">
        
        {userProfile.role === 'host' ? (
          <HostPortal userProfile={userProfile} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar (Desktop) / Drawer (Mobile) */}
            <AnimatePresence>
              {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                <motion.aside 
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className={cn(
                    "space-y-6 lg:block",
                    "fixed inset-y-0 left-0 z-50 w-[280px] bg-bg p-6 pt-24 sm:pt-32 lg:relative lg:p-0 lg:pt-0 lg:z-0 shadow-2xl lg:shadow-none",
                    !isSidebarOpen && "hidden lg:block"
                  )}
                >
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden absolute top-6 right-6 p-2 hover:bg-primary/10 rounded-full"
                  >
                    <X className="w-6 h-6 text-primary" />
                  </button>

                  {/* Eco-Passport (User Profile) */}
                  <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-4 border border-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-bg rounded-2xl flex items-center justify-center text-3xl shadow-inner relative">
                        {getUserLevel(userProfile.ecoPoints).icon}
                        {userProfile.isPremium && (
                          <div className="absolute -top-1 -right-1 bg-accent text-[8px] text-white font-black px-1.5 py-0.5 rounded-full shadow-lg border-2 border-white">
                            PREMIUM
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] text-muted font-black uppercase tracking-widest">Nivel Viajero</div>
                        <div className="text-lg font-black text-primary">{getUserLevel(userProfile.ecoPoints).name}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-muted uppercase">Eco-Points: {userProfile.ecoPoints || 0}</span>
                        <span className="text-primary">Meta: {getUserLevel(userProfile.ecoPoints).next}</span>
                      </div>
                      <div className="h-2 bg-bg rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(((userProfile.ecoPoints || 0) / getUserLevel(userProfile.ecoPoints).next) * 100, 100)}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>

                    {/* Badges Gallery */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-muted font-black uppercase tracking-widest">Insignias Logradas</div>
                      <div className="flex flex-wrap gap-2">
                        {ECO_BADGES.map(badge => {
                          const isEarned = userProfile.badges?.includes(badge.id);
                          return (
                            <div 
                              key={badge.id}
                              title={badge.description}
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-500",
                                isEarned ? "bg-accent/10 border-2 border-accent grayscale-0 scale-100" : "bg-bg border-2 border-transparent grayscale opacity-30 scale-90"
                              )}
                            >
                              {badge.icon}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-bg p-3 rounded-2xl text-center">
                        <div className="text-xl font-black text-primary">{userProfile.bookingsCount || 0}</div>
                        <div className="text-[8px] text-muted uppercase font-bold">Reservas</div>
                      </div>
                      <div className="bg-bg p-3 rounded-2xl text-center">
                        <div className="text-xl font-black text-secondary">{userProfile.ecoCredits || 0}</div>
                        <div className="text-[8px] text-muted uppercase font-bold">Créditos</div>
                      </div>
                    </div>

                    {!userProfile.isPremium && (
                      <div className="pt-2 space-y-2">
                        <div className="text-[10px] text-muted font-black uppercase tracking-widest">Activar Premium</div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Código..."
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 bg-bg border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                          />
                          <button 
                            onClick={handleRedeemCode}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-primary/20"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
                    <div className="bg-primary text-white p-5 rounded-[18px] relative overflow-hidden">
                      {userProfile.isPremium && (
                        <div className="absolute top-0 right-0 bg-accent text-[8px] font-black px-2 py-1 rounded-bl-xl shadow-lg">
                          PREMIUM AI
                        </div>
                      )}
                      <p className="text-sm italic leading-relaxed mb-3">
                        {assistantResult ? `"${assistantResult.recognition}"` : '"¡Hola! Soy tu asistente eco. ¿A dónde quieres viajar hoy?"'}
                      </p>
                      <div className="flex gap-1 items-center">
                        <div className="w-1 h-4 bg-white rounded-full animate-pulse" />
                        <div className="w-1 h-6 bg-white rounded-full animate-pulse delay-75" />
                        <div className="w-1 h-3 bg-white rounded-full animate-pulse delay-150" />
                        <span className="text-[11px] opacity-80 ml-2 uppercase font-bold tracking-wider">Escuchando...</span>
                      </div>
                    </div>

                    <nav className="flex flex-col gap-3">
                      <div className="text-[11px] uppercase text-muted font-bold tracking-widest">Destinos Populares</div>
                      <div className="text-sm font-semibold text-primary border-l-3 border-primary pl-3">Choroní, Aragua</div>
                      <div className="text-sm text-muted pl-4">Canaima, Bolívar</div>
                      <div className="text-sm text-muted pl-4">El Ávila, Caracas</div>
                    </nav>
                  </div>

                  {/* Impact Stats */}
                  <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-primary">${(userProfile.ecoPoints || 0) * 0.1}</div>
                      <div className="text-[10px] text-muted uppercase tracking-widest">Donado este año</div>
                    </div>
                    <div className="h-px bg-[#EEE] w-full" />
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-primary">{(userProfile.ecoPoints || 0) * 2}kg</div>
                      <div className="text-[10px] text-muted uppercase tracking-widest">Huella CO2 Ahorrada</div>
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Content Area */}
            <main className="space-y-6">
              {/* Visitor Mode Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-primary tracking-tight">Explorar Destinos</h2>
                  <p className="text-[10px] sm:text-xs text-muted font-bold uppercase tracking-widest">Modo Viajero Activo</p>
                </div>
                <div className="flex items-center gap-3">
                  <FilterBar filters={filters} onFilterChange={setFilters} />
                  <div className="flex items-center gap-2 bg-secondary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-secondary/20">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-secondary rounded-full animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-black text-secondary uppercase">Sincronizado</span>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden fixed top-24 left-4 z-40 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-primary/10 flex items-center gap-2 group"
              >
                <div className="bg-primary text-white p-1.5 rounded-xl group-active:scale-90 transition-transform">
                  <Menu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-primary pr-2 uppercase tracking-widest">Mi Perfil</span>
              </button>

              {activeView === 'explore' ? (
                <>
                  {/* Eco-Dashboard for Visitors */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-5 rounded-[24px] shadow-sm border border-primary/5 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
                        {getUserLevel(userProfile.ecoPoints).icon}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Tu Rango</div>
                        <div className="text-sm font-black text-primary">{getUserLevel(userProfile.ecoPoints).name}</div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white p-5 rounded-[24px] shadow-sm border border-primary/5 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-2xl">
                        ✨
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Eco-Points</div>
                        <div className="text-sm font-black text-secondary">{userProfile.ecoPoints || 0} pts</div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-accent p-5 rounded-[24px] shadow-lg shadow-accent/20 flex items-center gap-4 text-white cursor-pointer group"
                      onClick={() => setIsSidebarOpen(true)}
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Trophy className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white/70 uppercase tracking-widest">Insignias</div>
                        <div className="text-sm font-black">Ver Logros</div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Assistant Feedback (if active) */}
                  <AnimatePresence>
                    {assistantResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white p-6 rounded-[24px] shadow-sm border border-secondary/20 relative"
                      >
                        <button 
                          onClick={() => {
                            setAssistantResult(null);
                            setAccommodations(SIMULATED_ACCOMMODATIONS);
                          }}
                          className="absolute top-4 right-4 p-2 hover:bg-bg rounded-full"
                        >
                          <X className="w-5 h-5 text-muted" />
                        </button>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 text-accent">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Resultado de búsqueda</span>
                          </div>
                          <h3 className="text-2xl font-bold text-primary">{assistantResult.result.name}</h3>
                          <p className="text-sm text-text italic">"{assistantResult.voice}"</p>
                          <div className="impact-box !mb-0">
                            <p><b>Impacto:</b> {assistantResult.impact}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Accommodations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredAccommodations.length > 0 ? (
                      filteredAccommodations.map(acc => (
                        <AccommodationCard 
                          key={acc.id} 
                          accommodation={acc} 
                          onSelect={setSelectedAcc} 
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center space-y-4">
                        <div className="text-4xl">🏜️</div>
                        <h4 className="text-xl font-bold text-primary">No se encontraron resultados</h4>
                        <p className="text-muted text-sm">Prueba ajustando tus filtros o busca algo diferente.</p>
                        <button 
                          onClick={() => setFilters({ priceRange: [0, 500], energy: 'all', water: 'all', type: 'all' })}
                          className="text-accent font-bold text-xs uppercase tracking-widest"
                        >
                          Limpiar Filtros
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-sm text-center space-y-8">
                  <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto relative">
                    <Trophy className="w-10 h-10 text-secondary" />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute -top-2 -right-2 bg-accent text-white text-[10px] px-2 py-1 rounded-full font-black"
                    >
                      NUEVO
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-primary">Misiones Eco-Viajeras</h3>
                    <p className="text-muted max-w-md mx-auto">Completa tareas sostenibles durante tu viaje para ganar Eco-Points y desbloquear descuentos exclusivos en tu próxima reserva.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-left">
                    {[
                      { title: 'Sin Plástico', desc: 'Evita el uso de plásticos de un solo uso durante 3 días.', points: 100, icon: '🥤' },
                      { title: 'Transporte Limpio', desc: 'Usa bicicleta o camina para explorar el destino.', points: 150, icon: '🚲' },
                      { title: 'Energía Consciente', desc: 'Apaga luces y aire acondicionado al salir de la habitación.', points: 80, icon: '💡' },
                    ].map((m, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleCompleteMission(m)}
                        className="p-5 rounded-3xl bg-bg border border-gray-100 flex justify-between items-center group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-secondary/10 transition-colors">
                            {m.icon}
                          </div>
                          <div>
                            <div className="font-bold text-primary">{m.title}</div>
                            <div className="text-[10px] text-muted font-medium uppercase tracking-wider">{m.desc}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-secondary font-black">+{m.points} pts</div>
                          <div className="text-[8px] font-bold text-accent uppercase tracking-widest">Activar</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-secondary/5 p-6 rounded-3xl border border-secondary/10">
                    <p className="text-xs text-secondary font-bold">¡Tip! Los Eco-Points también aumentan tu nivel de viajero, dándote prioridad en alojamientos Premium.</p>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Visitor Navigation - Mobile Optimized */}
      {userProfile.role === 'visitor' && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto flex gap-3 items-center z-40 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/20">
          <button 
            onClick={() => setActiveView('explore')}
            className={cn(
              "flex-1 sm:flex-none py-3 px-6 text-[10px] font-bold rounded-full transition-all flex items-center gap-2",
              activeView === 'explore' ? "bg-primary text-white" : "text-muted hover:bg-bg"
            )}
          >
            <Search className="w-4 h-4" />
            EXPLORAR
          </button>
          <div className="w-14 h-14 shrink-0 relative">
            <VoiceInterface 
              onResult={handleAssistantResult} 
              isPremium={userProfile?.isPremium} 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 !w-14 !h-14 !shadow-none"
            />
          </div>
          <button 
            onClick={() => setActiveView('missions')}
            className={cn(
              "flex-1 sm:flex-none py-3 px-6 text-[10px] font-bold rounded-full transition-all flex items-center gap-2",
              activeView === 'missions' ? "bg-secondary text-white" : "text-muted hover:bg-bg"
            )}
          >
            <Trophy className="w-4 h-4" />
            MISIONES
          </button>
        </div>
      )}

      {userProfile.role === 'visitor' && (
        <VoiceInterface 
          onResult={handleAssistantResult} 
          isPremium={userProfile?.isPremium} 
          className="fixed bottom-10 right-10 hidden lg:grid"
        />
      )}

      {/* Role Selection Modal */}
      {userProfile && !userProfile.role && (
        <RoleSelectionModal 
          userProfile={userProfile} 
          onRoleSelected={(role) => setUserProfile({ ...userProfile, role })} 
        />
      )}

      {selectedAcc && (
        <BookingModal 
          accommodation={selectedAcc} 
          userProfile={userProfile}
          onClose={() => setSelectedAcc(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

