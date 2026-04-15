import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Props {
  userProfile: UserProfile;
}

export default function HostPortal({ userProfile }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'publish' | 'reports'>('dashboard');
  const [isPublishing, setIsPublishing] = useState(false);

  // Mock data for dashboard
  const stats = [
    { label: 'Visualizaciones', value: userProfile.views || '1,240', icon: Users, color: 'text-blue-400' },
    { label: 'Interés (Clicks)', value: '84', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Eco-Score Promedio', value: '8.5', icon: ShieldCheck, color: 'text-accent' },
    { label: 'Reservas Mes', value: userProfile.bookingsCount || '12', icon: BarChart3, color: 'text-orange-400' },
  ];

  const handlePublish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPublishing(true);
    const formData = new FormData(e.currentTarget);
    
    const newAcc = {
      name: formData.get('name'),
      location: formData.get('location'),
      type: formData.get('type'),
      price: Number(formData.get('price')),
      ecoScore: 7.0, // Base score
      certification: 'En Proceso (COVENIN 2030)',
      mission: formData.get('mission'),
      hostId: userProfile.uid,
      createdAt: new Date().toISOString(),
      imageUrl: 'https://picsum.photos/seed/eco/800/600',
      status: 'pending',
      sustainabilityParams: {
        energy: formData.get('energy'),
        water: formData.get('water'),
        waste: formData.get('waste')
      },
      documentationUrl: 'https://example.com/doc.pdf' // Mock doc upload
    };

    try {
      await addDoc(collection(db, 'accommodations'), newAcc);
      alert('¡Propiedad enviada a revisión técnica! Se ha notificado a las fundaciones aliadas.');
      setActiveTab('dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accommodations');
    } finally {
      setIsPublishing(false);
    }
  };

  const generateReport = () => {
    const reportContent = `
      INFORME TÉCNICO DE SOSTENIBILIDAD - SELLO ECO-FRIENDLY
      ----------------------------------------------------
      Host: ${userProfile.displayName}
      Fecha: ${new Date().toLocaleDateString()}
      Estado: VALIDACIÓN EN CURSO
      
      Resumen de Parámetros:
      - Gestión Energética: Validada por Centro de Investigación
      - Huella Hídrica: En proceso de auditoría
      - Compromiso Social: Documentación recibida por Fundaciones Aliadas
      
      Puntuación Proyectada: 8.7/10
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Eco_${userProfile.displayName.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 min-h-screen bg-slate-900 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-6 sm:pt-8 text-slate-200">
      {/* Host Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Portal de Gestión Host</h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium leading-tight">Panel de control ejecutivo para {userProfile.displayName}.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('publish')}
            className="w-full sm:w-auto bg-accent text-primary px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 text-sm sm:text-base"
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Publicar Propiedad</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-800 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-700 w-full sm:w-fit overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${activeTab === 'dashboard' ? 'bg-slate-700 text-accent shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('publish')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${activeTab === 'publish' ? 'bg-slate-700 text-accent shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Publicar
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${activeTab === 'reports' ? 'bg-slate-700 text-accent shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Informes Eco
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <div key={i} className="bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-[24px] border border-slate-700 flex flex-col gap-1.5 sm:gap-2">
                <div className={`${stat.color} bg-current/10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">{stat.value}</div>
                <div className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}

            {/* Status Card */}
            <div className="md:col-span-2 lg:col-span-3 bg-slate-800 p-8 rounded-[32px] border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Estado de Trámites Legales
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Certificación COVENIN 2030', status: 'En Verificación', progress: 65, date: '12 Oct 2025' },
                  { title: 'Permiso Ministerio de Turismo', status: 'Aprobado', progress: 100, date: '01 Sep 2025' },
                  { title: 'Validación de Impacto Social', status: 'Pendiente Documentación', progress: 30, date: '--' },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-700 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{item.title}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${item.progress === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-accent/20 text-accent'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-accent h-full transition-all duration-1000" style={{ width: `${item.progress}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">Última actualización: {item.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Widget */}
            <div className="bg-gradient-to-br from-accent to-primary p-8 rounded-[32px] shadow-xl flex flex-col justify-between relative overflow-hidden text-primary">
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/20 rounded-full blur-2xl" />
              <div className="z-10">
                <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black mb-2">Dashboard Premium</h3>
                <p className="text-sm font-medium opacity-90 mb-6">Accede a análisis profundos de comportamiento de huéspedes y proyecciones de ingresos.</p>
              </div>
              <button className="z-10 w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:scale-105 transition-all">
                Ver Métricas Avanzadas
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'publish' && (
          <motion.div 
            key="publish"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl bg-slate-800 p-8 rounded-[32px] border border-slate-700"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Publicar Nueva Propiedad</h3>
            <form onSubmit={handlePublish} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del Alojamiento</label>
                  <input name="name" required className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-accent outline-none transition-all text-white" placeholder="Ej: Posada Los Roques Eco" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ubicación</label>
                  <input name="location" required className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-accent outline-none transition-all text-white" placeholder="Estado, Ciudad" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Propiedad</label>
                  <select name="type" className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-accent outline-none transition-all text-white">
                    <option>Posada</option>
                    <option>Hotel Boutique</option>
                    <option>Eco-Camp</option>
                    <option>Glamping</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Precio por Noche ($)</label>
                  <input name="price" type="number" required className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-accent outline-none transition-all text-white" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gestión Energética (Panel Solar/Eólica)</label>
                  <select name="energy" className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-accent outline-none transition-all text-white">
                    <option value="none">Ninguna</option>
                    <option value="partial">Parcial (10-50%)</option>
                    <option value="full">Total (100%)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tratamiento de Aguas</label>
                  <select name="water" className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-accent outline-none transition-all text-white">
                    <option value="basic">Básico</option>
                    <option value="advanced">Reciclaje de Aguas Grises</option>
                    <option value="closed">Circuito Cerrado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Documentación para Fundaciones (PDF/ZIP)</label>
                <div className="w-full p-8 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-accent transition-all cursor-pointer bg-slate-900/50">
                  <FileText className="w-8 h-8 text-slate-500" />
                  <span className="text-xs text-slate-400 font-bold">Subir Registro Mercantil y Avales Ambientales</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-accent/10 border border-accent/20 flex gap-4 items-start">
                <ShieldCheck className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Al publicar, tu propiedad recibirá un <b className="text-accent">Eco-Score base de 7.0</b>. Este puntaje se ajustará dinámicamente una vez que nuestros centros de investigación validen tus parámetros COVENIN 2030.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isPublishing}
                className="w-full bg-accent text-primary py-4 rounded-2xl font-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                {isPublishing ? 'Procesando...' : 'Enviar para Certificación'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-slate-800 p-8 rounded-[32px] border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Generador de Informes Técnicos</h3>
              <p className="text-sm text-slate-400 mb-6">Genera automáticamente el informe para el Sello Eco-friendly basado en tus datos validados por los centros de investigación.</p>
              <button 
                onClick={generateReport}
                className="w-full py-4 border-2 border-accent text-accent rounded-2xl font-bold hover:bg-accent hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Descargar Informe Técnico
              </button>
            </div>
            
            <div className="bg-slate-800 p-8 rounded-[32px] border border-slate-700 flex flex-col justify-center items-center text-center gap-4">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-accent/20" />
              </div>
              <div>
                <h4 className="font-bold text-white">Próxima Auditoría</h4>
                <p className="text-xs text-slate-500">Programada para: 15 de Noviembre, 2025</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
