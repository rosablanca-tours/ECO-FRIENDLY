import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, Zap, Droplets, DollarSign, MapPin, Users, ShieldCheck, Heart, Leaf, Users2 } from 'lucide-react';
import { SearchFilters } from '../types';
import { cn } from '../lib/utils';

interface Props {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export default function FilterBar({ filters, onFilterChange }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.energy !== 'all' || 
    filters.water !== 'all' || 
    filters.priceRange[1] < 500 ||
    filters.location !== '' ||
    filters.guests > 1 ||
    filters.minEcoScore > 0 ||
    filters.impactType !== 'all';

  return (
    <div className="relative z-30">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm text-sm font-bold text-primary hover:bg-bg transition-colors"
      >
        <Filter className="w-4 h-4" />
        Filtros Avanzados
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 lg:hidden"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className={cn(
                "z-50 bg-white shadow-2xl border border-gray-100 p-6 space-y-6 overflow-y-auto",
                "fixed inset-x-0 bottom-0 rounded-t-[40px] max-h-[85vh]", // Mobile: Bottom Sheet
                "lg:absolute lg:top-full lg:bottom-auto lg:mt-4 lg:right-0 lg:left-auto lg:w-[320px] lg:rounded-[32px] lg:max-h-[80vh]" // Desktop: Dropdown
              )}
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-bold text-primary">Ajustar Búsqueda</h4>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-wider lg:hidden">Filtros de Sostenibilidad</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-bg rounded-full">
                  <X className="w-5 h-5 text-primary" />
                </button>
              </div>

              <div className="space-y-6 pb-8 lg:pb-0">
                {/* Location */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    Ubicación
                  </div>
                  <input 
                    type="text"
                    placeholder="Ej: Choroní, Caracas..."
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="w-full px-4 py-3 bg-bg rounded-2xl text-sm border-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Guests */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                    <Users className="w-3 h-3" />
                    Capacidad (Personas)
                  </div>
                  <div className="flex items-center gap-3 bg-bg p-2 rounded-2xl">
                    <button onClick={() => updateFilter('guests', Math.max(1, filters.guests - 1))} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-primary">-</button>
                    <span className="font-bold flex-1 text-center text-lg">{filters.guests}</span>
                    <button onClick={() => updateFilter('guests', filters.guests + 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-primary">+</button>
                  </div>
                </div>

                {/* Eco Seal (EcoScore) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                      <ShieldCheck className="w-3 h-3" />
                      Sello de Calidad
                    </div>
                    <span className="text-xs font-bold text-secondary">Mín: {filters.minEcoScore}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5"
                    value={filters.minEcoScore}
                    onChange={(e) => updateFilter('minEcoScore', parseFloat(e.target.value))}
                    className="w-full h-2 bg-bg rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                      <DollarSign className="w-3 h-3" />
                      Precio Máximo
                    </div>
                    <span className="text-xs font-bold text-accent">${filters.priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="500" 
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilter('priceRange', [0, parseInt(e.target.value)])}
                    className="w-full h-2 bg-bg rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* Impact Type Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                    <Heart className="w-3 h-3" />
                    Tipo de Impacto
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'all', label: 'Todos', icon: <Filter className="w-3 h-3" /> },
                      { id: 'fauna', label: 'Fauna', icon: <Heart className="w-3 h-3" /> },
                      { id: 'energy', label: 'Energía', icon: <Leaf className="w-3 h-3" /> },
                      { id: 'indigenous', label: 'Indígenas', icon: <Users2 className="w-3 h-3" /> }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => updateFilter('impactType', opt.id)}
                        className={cn(
                          "flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-bold uppercase transition-all border",
                          filters.impactType === opt.id 
                            ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" 
                            : "bg-bg text-muted border-transparent"
                        )}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                    <Zap className="w-3 h-3" />
                    Energía Renovable
                  </div>
                  <div className="flex gap-2">
                    {['all', 'partial', 'full'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => updateFilter('energy', opt)}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase transition-all ${filters.energy === opt ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-bg text-muted'}`}
                      >
                        {opt === 'all' ? 'Todos' : opt === 'partial' ? 'Parcial' : 'Total'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Water Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                    <Droplets className="w-3 h-3" />
                    Gestión de Agua
                  </div>
                  <div className="flex gap-2">
                    {['all', 'advanced', 'closed'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => updateFilter('water', opt)}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase transition-all ${filters.water === opt ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-bg text-muted'}`}
                      >
                        {opt === 'all' ? 'Todos' : opt === 'advanced' ? 'Reciclaje' : 'Cerrado'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-primary text-white rounded-[20px] font-bold text-sm shadow-xl shadow-primary/20 sticky bottom-0"
              >
                Ver Resultados
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
