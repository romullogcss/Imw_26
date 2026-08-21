import React, { useState, useEffect } from 'react';
import { SPECIAL_EVENTS, EVENT_HEADER_CONFIGS } from '../data/churchData';
import { subscribeEvents, addEventRegistration } from '../services/firestoreService';
import { ChurchEvent, PageId } from '../types';
import { formatEventDateRange, generateGoogleCalendarUrl } from '../utils/dateUtils';
import { EventsPageHeader } from '../components/EventsPageHeader';
import { 
  Calendar, Clock, MapPin, Sparkles, Plus, 
  ChevronRight, ArrowLeft, UserPlus, Loader2, CheckCircle2,
  AlertCircle, X
} from 'lucide-react';
import { motion } from 'motion/react';

interface DistrictEventsPageProps {
  onNavigate: (page: PageId, slug?: string) => void;
}

export const DistrictEventsPage: React.FC<DistrictEventsPageProps> = ({ onNavigate }) => {
  const [eventsList, setEventsList] = useState<ChurchEvent[]>([]);
  const [selectedEventForSignup, setSelectedEventForSignup] = useState<ChurchEvent | null>(null);
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', phone: '', notes: '' });
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeEvents((updatedEvents) => {
      setEventsList(updatedEvents || []);
    });
    return () => unsubscribe();
  }, []);

  const districtEvents = eventsList.filter((e) => e.eventType === 'distrital');

  const handleOpenSignup = (event: ChurchEvent) => {
    if (event.slug) {
      onNavigate('event-detail', event.slug);
    } else {
      setSelectedEventForSignup(event);
      setSignupForm({ fullName: '', email: '', phone: '', notes: '' });
      setSignupError(null);
      setSignupSuccess(false);
    }
  };

  const handleSimpleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForSignup) return;
    if (!signupForm.fullName || !signupForm.email || !signupForm.phone) {
      setSignupError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSignupSubmitting(true);
    setSignupError(null);

    try {
      await addEventRegistration(selectedEventForSignup, {
        registrationType: 'simple',
        fullName: signupForm.fullName,
        email: signupForm.email,
        phone: signupForm.phone,
        notes: signupForm.notes,
      });
      setSignupSuccess(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      setSignupError(err.message || 'Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setSignupSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* SHARED STANDARDIZED EVENT HERO HEADER */}
      <EventsPageHeader
        title={EVENT_HEADER_CONFIGS.distrital.title}
        description={EVENT_HEADER_CONFIGS.distrital.description}
        backgroundImageUrl={EVENT_HEADER_CONFIGS.distrital.backgroundImageUrl}
        currentScope="distrital"
        onNavigate={onNavigate}
      />

      {/* Main Events List Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
          <div>
            <span className="text-amber-600 font-extrabold text-xs uppercase tracking-widest block">
              DISTRITO WESLEYANO
            </span>
            <h2 className="text-2xl font-black text-slate-900 uppercase">
              Agenda Distrital ({districtEvents.length})
            </h2>
          </div>
        </div>

        {districtEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black uppercase text-slate-800">
              Nenhum Evento Distrital Programado
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              No momento não há eventos distritais cadastrados. Você pode conferir os eventos da nossa igreja local ou verificar os eventos regionais.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => onNavigate('schedule')}
                className="px-4 py-2.5 rounded-xl bg-[#102bde] text-white font-bold text-xs uppercase tracking-wider shadow hover:bg-[#0d23b8] transition-all cursor-pointer"
              >
                Ver Agenda Local
              </button>
              <button
                onClick={() => onNavigate('regional-events')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase hover:bg-slate-200 transition-all cursor-pointer"
              >
                Ver Eventos Regionais
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {districtEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  {/* Event Cover Image */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-black text-[10px] uppercase shadow-sm">
                        📍 DISTRITAL
                      </span>
                      {event.badge && (
                        <span className="px-2.5 py-1 rounded-md bg-[#102bde] text-white font-black text-[10px] uppercase shadow-sm">
                          {event.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-black text-lg text-slate-900 uppercase leading-snug group-hover:text-[#102bde] transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <p className="font-bold text-amber-700 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>{formatEventDateRange(event.date, event.endDate)} • {event.time}</span>
                      </p>

                      <p className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 space-y-2">
                  <button
                    onClick={() => onNavigate('event-detail', event.slug || event.id)}
                    className="w-full py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>VER DETALHES {event.enableRegistration && '& INSCRIÇÃO'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <a
                    href={generateGoogleCalendarUrl({
                      title: event.title,
                      dateStr: event.date,
                      timeStr: event.time,
                      location: event.location,
                      description: event.description,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Adicionar à Agenda</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Registration Modal (if triggered directly) */}
      {selectedEventForSignup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setSelectedEventForSignup(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <span className="text-amber-600 text-xs font-black uppercase tracking-wider block">
                Inscrição para Evento Distrital
              </span>
              <h3 className="text-xl font-black uppercase text-slate-900 leading-snug">
                {selectedEventForSignup.title}
              </h3>
            </div>

            {signupSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-black uppercase text-slate-900">Inscrição Confirmada!</h4>
                <p className="text-xs text-slate-600">
                  Sua inscrição no evento distrital foi realizada com sucesso.
                </p>
                <button
                  onClick={() => setSelectedEventForSignup(null)}
                  className="px-6 py-2.5 bg-[#102bde] text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSimpleSignupSubmit} className="space-y-3">
                {signupError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{signupError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#102bde]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">WhatsApp / Telefone *</label>
                    <input
                      type="tel"
                      required
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#102bde]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Observações (Opcional)</label>
                  <textarea
                    rows={2}
                    value={signupForm.notes}
                    onChange={(e) => setSignupForm({ ...signupForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEventForSignup(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs uppercase hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={signupSubmitting}
                    className="px-5 py-2.5 bg-[#102bde] text-white font-black text-xs uppercase rounded-xl hover:bg-[#0d23b8] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {signupSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <span>Confirmar Inscrição</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
