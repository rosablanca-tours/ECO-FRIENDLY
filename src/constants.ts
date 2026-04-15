import { Accommodation } from './types';

export const SIMULATED_ACCOMMODATIONS: Accommodation[] = [
  {
    id: 'posada-el-cacao',
    name: "Posada El Cacao",
    location: "Choroní",
    type: "Playa",
    ecoScore: 9.5,
    price: 120,
    certification: "Fundación Ambienta",
    mission: "Verificar dispensadores de jabón biodegradable",
    imageUrl: "https://picsum.photos/seed/cacao/800/600",
    status: 'approved',
    sustainabilityParams: {
      energy: 'full',
      water: 'advanced',
      waste: 'advanced'
    },
    maxGuests: 4,
    impactType: 'fauna',
    ecoDescription: "Uso de paneles solares y compostaje orgánico.",
    foundation: "Fundación La Tortuga",
    missions: [
      { title: "Verificar jabón biodegradable", points: 50 },
      { title: "Uso de envases reutilizables", points: 30 },
      { title: "Separación de residuos", points: 20 }
    ]
  },
  {
    id: 'eco-hotel-avila',
    name: "Eco-Hotel Ávila",
    location: "Caracas",
    type: "Montaña",
    ecoScore: 7.8,
    price: 95,
    certification: "Norma COVENIN 2030",
    mission: "Reportar uso de luces LED en pasillos",
    imageUrl: "https://picsum.photos/seed/avila/800/600",
    status: 'approved',
    sustainabilityParams: {
      energy: 'partial',
      water: 'basic',
      waste: 'basic'
    },
    maxGuests: 2,
    impactType: 'energy',
    ecoDescription: "Iluminación LED y sensores de movimiento.",
    foundation: "Provita",
    missions: [
      { title: "Reportar luces LED", points: 40 },
      { title: "Ducha de 5 minutos", points: 60 }
    ]
  },
  {
    id: 'tepuy-lodge',
    name: "Tepuy Lodge",
    location: "Canaima",
    type: "Premium/Limitado",
    ecoScore: 9.9,
    price: 250,
    certification: "Investigación Ecológica ULA",
    mission: "Confirmar política Zero Waste",
    imageUrl: "https://picsum.photos/seed/tepuy/800/600",
    isPremium: true,
    status: 'approved',
    sustainabilityParams: {
      energy: 'full',
      water: 'closed',
      waste: 'circular'
    },
    maxGuests: 6,
    impactType: 'indigenous',
    ecoDescription: "Sistema de agua de circuito cerrado y basura cero.",
    foundation: "Fundación Canaima",
    isSecret: true,
    missions: [
      { title: "Confirmar Zero Waste", points: 100 },
      { title: "Charla con comunidad local", points: 50 }
    ]
  }
];

export const COMMISSION_RATE = 0.10;
export const DONATION_RATE = 0.05; // 5% of commission

export const ECO_BADGES = [
  { id: 'first_mission', name: 'Primer Paso', icon: '👣', description: 'Completa tu primera misión eco.', requirement: 1 },
  { id: 'eco_warrior', name: 'Eco Guerrero', icon: '🛡️', description: 'Alcanza 500 Eco-Points.', requirement: 500 },
  { id: 'zero_waste', name: 'Basura Cero', icon: '♻️', description: 'Completa 5 misiones de reciclaje.', requirement: 5 },
  { id: 'premium_traveler', name: 'Viajero Elite', icon: '💎', description: 'Activa tu cuenta Premium.', requirement: 'premium' },
  { id: 'forest_guardian', name: 'Guardián', icon: '🌳', description: 'Alcanza el nivel máximo.', requirement: 1000 },
];
