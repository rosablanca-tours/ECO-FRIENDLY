import { useState } from 'react';
import { Accommodation, Booking, UserProfile } from '../types';
import { X, Calendar, CreditCard, Heart, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { COMMISSION_RATE, DONATION_RATE } from '../constants';

interface Props {
  accommodation: Accommodation;
  userProfile: UserProfile | null;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export default function BookingModal({ accommodation, userProfile, onClose, onSuccess }: Props) {
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [nights, setNights] = useState(1);
  const [sustainableOptions, setSustainableOptions] = useState({
    noNewTowels: false,
    carbonOffset: false,
    ownToiletries: false
  });
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    seniors: 0
  });

  const totalNightsPrice = accommodation.price * nights;
  const commission = totalNightsPrice * COMMISSION_RATE;
  const donation = commission * DONATION_RATE;

  const handleGuestChange = (type: keyof typeof guests, value: number) => {
    setGuests(prev => ({
      ...prev,
      [type]: Math.max(0, value)
    }));
  };

  const handleBooking = async () => {
    if (!userProfile) return;
    setIsBooking(true);
    
    let extraPoints = 0;
    if (sustainableOptions.noNewTowels) extraPoints += 20;
    if (sustainableOptions.carbonOffset) extraPoints += 30;
    if (sustainableOptions.ownToiletries) extraPoints += 15;

    try {
      const bookingData: Omit<Booking, 'id'> = {
        userId: userProfile.uid,
        accommodationId: accommodation.id,
        accommodationName: accommodation.name,
        date: new Date().toISOString(),
        nights: nights,
        guests: guests,
        totalAmount: totalNightsPrice,
        commission: commission,
        donationAmount: donation,
        status: 'confirmed'
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      setStep('success');
      onSuccess({ id: docRef.id, ...bookingData, extraPoints });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-6 sm:right-6 p-1.5 sm:p-2 hover:bg-primary/10 rounded-full z-10"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </button>

          {step === 'details' ? (
            <div className="p-5 sm:p-8">
              <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-primary">Confirmar Reserva</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4 items-center p-3 sm:p-4 bg-bg rounded-xl sm:rounded-2xl">
                  <img src={accommodation.imageUrl} alt="" className="w-12 h-12 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-text text-xs sm:text-base leading-tight">{accommodation.name}</h4>
                    <p className="text-[10px] sm:text-sm text-muted">{accommodation.location}</p>
                  </div>
                </div>

                {/* Booking Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-bg rounded-xl">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Noches</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setNights(Math.max(1, nights - 1))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-primary">-</button>
                      <span className="font-bold w-4 text-center">{nights}</span>
                      <button onClick={() => setNights(nights + 1)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-primary">+</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'Adultos', key: 'adults' as const },
                      { label: 'Niños', key: 'children' as const },
                      { label: 'Adultos Mayores', key: 'seniors' as const }
                    ].map((cat) => (
                      <div key={cat.key} className="flex items-center justify-between p-3 bg-bg rounded-xl">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{cat.label}</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleGuestChange(cat.key, guests[cat.key] - 1)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-primary">-</button>
                          <span className="font-bold w-4 text-center">{guests[cat.key]}</span>
                          <button onClick={() => handleGuestChange(cat.key, guests[cat.key] + 1)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-primary">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 border-t border-secondary/10 pt-3 sm:pt-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Precio por noche</span>
                    <span className="font-bold text-text">${accommodation.price}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Subtotal ({nights} noches)</span>
                    <span className="font-bold text-text">${totalNightsPrice}</span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-sm text-muted">
                    <span>Comisión de plataforma (10%)</span>
                    <span>${commission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-secondary/10 rounded-lg sm:rounded-xl text-primary text-[10px] sm:text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-primary" />
                      <span>Impacto Ambiental (5% donado)</span>
                    </div>
                    <span className="font-bold">${donation.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold border-t border-secondary/10 pt-2 sm:pt-3 text-primary">
                    <span>Total</span>
                    <span>${totalNightsPrice}</span>
                  </div>
                </div>

                <div className="bg-primary/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex gap-2 sm:gap-3 items-start">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent shrink-0" />
                  <div>
                    <p className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-primary mb-0.5 sm:mb-1">Misión Eco</p>
                    <p className="text-xs sm:text-sm text-text leading-tight">{accommodation.mission}</p>
                  </div>
                </div>

                {/* Sustainable Options */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">Opciones Sostenibles (+Eco-Points)</p>
                  <div className="space-y-2">
                    {[
                      { id: 'noNewTowels', label: 'No usar toallas nuevas diariamente', points: 20 },
                      { id: 'carbonOffset', label: 'Compensación de carbono voluntaria', points: 30 },
                      { id: 'ownToiletries', label: 'Traer mi propio kit de aseo', points: 15 }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center justify-between p-3 bg-bg rounded-xl cursor-pointer group hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={sustainableOptions[opt.id as keyof typeof sustainableOptions]}
                            onChange={(e) => setSustainableOptions(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs font-bold text-primary/80">{opt.label}</span>
                        </div>
                        <span className="text-[10px] font-black text-secondary">+{opt.points} pts</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleBooking}
                  disabled={isBooking || !userProfile}
                  className="w-full main-btn py-3 sm:py-4 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isBooking ? "Procesando..." : "Reservar Ahora"}
                </button>
                {!userProfile && (
                  <p className="text-center text-xs text-red-500 font-medium">Debes iniciar sesión para reservar</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-secondary/20 text-primary rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2 text-primary">¡Reserva Exitosa!</h2>
                <p className="text-muted">Tu viaje sostenible comienza ahora. Hemos donado ${donation.toFixed(2)} a proyectos de conservación.</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-2xl w-full">
                <p className="text-sm font-bold text-primary">Reserva confirmada</p>
              </div>
              <button onClick={onClose} className="w-full main-btn py-4">
                Listo
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
