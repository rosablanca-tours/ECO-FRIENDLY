import React from 'react';
import { Accommodation } from '../types';
import { MapPin, Star, ShieldCheck, Zap, Lightbulb, Handshake } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  accommodation: Accommodation;
  onSelect: (acc: Accommodation) => void;
}

const AccommodationCard: React.FC<Props> = ({ accommodation, onSelect }) => {
  const commission = accommodation.price * 0.10;
  const donation = commission * 0.05;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="eco-card group cursor-pointer flex flex-col h-full"
      onClick={() => onSelect(accommodation)}
    >
      <div className="relative h-32 sm:h-48 overflow-hidden">
        <img 
          src={accommodation.imageUrl} 
          alt={accommodation.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <span className="text-lg">🌿</span>
          <span className="text-sm font-black text-primary">{accommodation.ecoScore}</span>
        </div>
        {accommodation.isSecret && (
          <div className="absolute top-3 right-3 bg-accent text-white text-[10px] px-2 py-1 rounded-full font-black shadow-lg animate-pulse">
            SECRETO
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow space-y-3">
        <div>
          <h3 className="text-lg font-black text-primary leading-tight">
            {accommodation.name}
          </h3>
          <div className="flex items-center gap-1 text-muted text-xs font-bold mt-1">
            <MapPin className="w-3 h-3" />
            {accommodation.location} • <span className="text-accent">${accommodation.price}/noche</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2 bg-secondary/5 p-2.5 rounded-xl border border-secondary/10">
            <Lightbulb className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <p className="text-[11px] text-text leading-snug">
              <span className="font-bold text-secondary">Lo más eco:</span> {accommodation.ecoDescription || "Tecnología verde certificada."}
            </p>
          </div>

          <div className="flex items-start gap-2 bg-accent/5 p-2.5 rounded-xl border border-accent/10">
            <Handshake className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-[11px] text-text leading-snug">
              <span className="font-bold text-accent">Tu aporte:</span> Con esta reserva financias a <span className="font-bold">{accommodation.foundation || "proyectos locales"}</span>.
            </p>
          </div>
        </div>

        <button className="w-full bg-bg hover:bg-primary/5 border border-gray-100 p-2.5 rounded-2xl flex items-center justify-between transition-colors mt-auto">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-sm">🎯</span>
            <span className="text-[11px] font-bold text-primary truncate">Misión: {accommodation.missions?.[0]?.title || "Explorar"}</span>
          </div>
          <span className="bg-primary text-white text-[10px] px-2 py-1 rounded-lg font-black shrink-0">
            +{accommodation.missions?.[0]?.points || 50} pts
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default AccommodationCard;
