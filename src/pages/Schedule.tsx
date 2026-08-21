import React, { useState, useEffect } from 'react';
import { WEEKLY_SCHEDULE, SPECIAL_EVENTS, EVENT_HEADER_CONFIGS } from '../data/churchData';
import { subscribeSchedules, subscribeEvents, addEventRegistration } from '../services/firestoreService';
import { ScheduleItem, ChurchEvent, PageId } from '../types';
import { formatDateToDisplay, formatDateToDb, parseLocalDate, generateGoogleCalendarUrl, formatEventDateRange } from '../utils/dateUtils';
import { DatePicker } from '../components/DatePicker';
import { EventsPageHeader } from '../components/EventsPageHeader';
import { 
  Calendar, Clock, MapPin, Sparkles, Filter, 
  CheckCircle, Plus, Share2, Tag, ChevronRight, Info,
  X, UserCheck, UserPlus, Loader2, AlertCircle, CheckCircle2,
  Tent, HeartPulse, ShieldAlert, FileText, CheckSquare, User, Mail, Phone,
  ShieldCheck, AlertTriangle, Send, Copy
} from 'lucide-react';
import { motion } from 'motion/react';

interface SchedulePageProps {
  onNavigate?: (page: PageId, extraParam?: string) => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ onNavigate }) => {
  const [selectedDay, setSelectedDay] = useState<string>('Todos');
  const [selectedScopeFilter, setSelectedScopeFilter] = useState<'all' | 'local' | 'distrital' | 'regional'>('all');
  const [addedCalendarId, setAddedCalendarId] = useState<string | null>(null);

  // Firestore live collections
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(WEEKLY_SCHEDULE);
  const [eventsList, setEventsList] = useState<ChurchEvent[]>(SPECIAL_EVENTS);

  // Registration Modal State
  const [selectedEventForSignup, setSelectedEventForSignup] = useState<ChurchEvent | null>(null);
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', phone: '', notes: '' });

  const initialRetreatForm = {
    fullName: '',
    birthDate: '',
    email: '',
    phone: '',
    documentId: '',
    gender: 'Masculino',
    city: '',

    hasAllergies: false,
    allergiesDetails: '',
    hasMedications: false,
    medicationsDetails: '',
    healthConditions: '',
    hasDietaryRestrictions: false,
    dietaryDetails: '',
    medicalNotes: '',

    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactPhoneAlt: '',

    isMinor: false,
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianDocument: '',
    guardianAuthorization: false,
    emergencyMedicalConsent: false,

    notes: '',

    truthfulInfoConsent: false,
    termsConsent: false,
    emergencyContactConsent: false,
  };

  const [retreatForm, setRetreatForm] = useState(initialRetreatForm);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<{ subject: string; body: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const calculateAge = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const birth = parseLocalDate(dateStr);
    if (!birth || isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleBirthDateChange = (dateStr: string) => {
    const age = calculateAge(dateStr);
    const minor = age !== null && age < 18;
    setRetreatForm((prev) => ({
      ...prev,
      birthDate: dateStr,
      isMinor: minor,
    }));
  };

  useEffect(() => {
    const unsubSched = subscribeSchedules((items) => {
      setScheduleList(items || []);
    });

    const unsubEvts = subscribeEvents((items) => {
      setEventsList(items || []);
    });

    return () => {
      unsubSched();
      unsubEvts();
    };
  }, []);

  const daysList = ['Todos', 'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const filteredSchedule = selectedDay === 'Todos' 
    ? scheduleList 
    : scheduleList.filter(item => item.day === selectedDay);

  const handleAddToCalendar = (event: ChurchEvent) => {
    const gcalUrl = generateGoogleCalendarUrl({
      title: event.title,
      dateStr: event.date,
      timeStr: event.time,
      location: event.location,
      description: event.description,
    });
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
    setAddedCalendarId(event.id);
    setTimeout(() => setAddedCalendarId(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* SHARED STANDARDIZED EVENT HERO HEADER */}
      <EventsPageHeader
        title={EVENT_HEADER_CONFIGS.local.title}
        description={EVENT_HEADER_CONFIGS.local.description}
        backgroundImageUrl={EVENT_HEADER_CONFIGS.local.backgroundImageUrl}
        currentScope="local"
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-16">

        {/* SECTION 1: WEEKLY SCHEDULE TABLE */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-1">
                SEMANA A SEMANA
              </span>
              <h2 className="font-sans font-black text-2xl sm:text-4xl uppercase text-slate-900">
                TABELA DE CULTOS
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
              {daysList.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-sans font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedDay === day
                      ? 'bg-[#102bde] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-sans font-black uppercase tracking-widest border-b border-slate-800">
                    <th className="py-4 px-6">Dia & Horário</th>
                    <th className="py-4 px-6">Nome do Culto / Reunião</th>
                    <th className="py-4 px-6">Descrição</th>
                    <th className="py-4 px-6">Local</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-sans">
                  {filteredSchedule.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 px-6 text-center text-slate-500 bg-slate-50/50">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="font-extrabold text-slate-700 uppercase text-xs tracking-wider">
                          Nenhum culto ou reunião cadastrada no momento.
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          Acesse o painel administrativo para adicionar novos horários na programação da igreja.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSchedule.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50 transition-colors ${
                          item.isHighlight ? 'bg-[#102bde]/5' : ''
                        }`}
                      >
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-black text-slate-900 text-base uppercase">
                            {item.day}
                          </div>
                          <div className="inline-flex items-center gap-1 text-[#102bde] font-bold text-xs mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.time}h</span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-base uppercase">
                              {item.title}
                            </span>
                            {item.isHighlight && (
                              <span className="px-2 py-0.5 rounded-md bg-[#102bde] text-white font-black text-[10px] uppercase">
                                PRINCIPAL
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-bold uppercase mt-0.5 block">
                            Categoria: {item.category}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-slate-600 max-w-xs leading-relaxed text-xs font-medium">
                          {item.description}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap text-slate-700 font-bold uppercase">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#102bde] shrink-0" />
                            <span>{item.location}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 2: SPECIAL EVENTS (CARDS WITH DATES) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-1">
                CONFERÊNCIAS, ENCONTROS & RETIROS
              </span>
              <h2 className="font-sans font-black text-3xl sm:text-4xl uppercase text-slate-900">
                EVENTOS ESPECIAIS
              </h2>
              <p className="text-slate-600 text-sm mt-1 font-medium">
                Confira a programação de eventos da nossa igreja local, distrito e região.
              </p>
            </div>

            {/* Scope Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-bold uppercase shrink-0">
              <button
                onClick={() => setSelectedScopeFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedScopeFilter === 'all'
                    ? 'bg-[#102bde] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
                }`}
              >
                Todos ({eventsList.length})
              </button>
              <button
                onClick={() => setSelectedScopeFilter('local')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedScopeFilter === 'local'
                    ? 'bg-[#102bde] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
                }`}
              >
                🏠 Locais
              </button>
              <button
                onClick={() => setSelectedScopeFilter('distrital')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedScopeFilter === 'distrital'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
                }`}
              >
                📍 Distritais
              </button>
              <button
                onClick={() => setSelectedScopeFilter('regional')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedScopeFilter === 'regional'
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
                }`}
              >
                🏛️ Regionais
              </button>
            </div>
          </div>

          {eventsList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-black text-slate-800 uppercase text-sm tracking-wider">
                Nenhum evento especial agendado no momento.
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Fique atento! Em breve divulgaremos novas conferências, retiros e encontros especiais.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {eventsList
                .filter((e) => selectedScopeFilter === 'all' || (e.eventType || 'local') === selectedScopeFilter)
                .map((event) => {
                  const scopeLabel = event.eventType === 'distrital' ? '📍 DISTRITAL' : event.eventType === 'regional' ? '🏛️ REGIONAL' : '🏠 LOCAL';
                  const scopeClass = event.eventType === 'distrital' ? 'bg-amber-600 text-white' : event.eventType === 'regional' ? 'bg-purple-700 text-white' : 'bg-blue-600 text-white';

                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#102bde] transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative h-60 overflow-hidden bg-slate-100">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                          
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            {event.badge && (
                              <span className="px-3 py-1 rounded-md bg-[#102bde] text-white font-sans font-black text-xs uppercase tracking-wider shadow-sm">
                                {event.badge}
                              </span>
                            )}
                            <span className={`px-2.5 py-1 rounded-md font-sans font-black text-[11px] uppercase tracking-wider shadow-sm ${scopeClass}`}>
                              {scopeLabel}
                            </span>
                          </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-2 text-white font-sans text-xs font-extrabold uppercase mb-1 drop-shadow">
                          <Calendar className="w-4 h-4 text-white shrink-0" />
                          <span>{formatEventDateRange(event.date, event.endDate)}</span>
                        </div>
                        <h3 className="font-sans font-black text-2xl uppercase text-white">
                          {event.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6 space-y-3 font-sans">
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#102bde]" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#102bde]" />
                          {event.location}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between gap-4 font-sans">
                    <button
                      onClick={() => handleAddToCalendar(event)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-200 transition-colors cursor-pointer ${
                        !event.enableRegistration ? 'w-full' : ''
                      }`}
                    >
                      {addedCalendarId === event.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-600 font-black">SALVO!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-[#102bde]" />
                          <span>AGENDAR</span>
                        </>
                      )}
                    </button>

                    {event.enableRegistration && (
                      <button
                        onClick={() => {
                          setSelectedEventForSignup(event);
                          setSignupForm({ fullName: '', email: '', phone: '', notes: '' });
                          setSignupError(null);
                          setSignupSuccess(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>INSCREVER-SE</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </section>

      </div>

      {/* FORMULÁRIO DE INSCRIÇÃO EM EVENTO ESPECIAL */}
      {selectedEventForSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xl ${
            selectedEventForSignup.registrationType === 'retreat' ? 'max-w-3xl' : 'max-w-lg'
          } w-full p-6 space-y-5 my-auto relative max-h-[90vh] overflow-y-auto`}>
            
            <button
              onClick={() => setSelectedEventForSignup(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {signupSuccess ? (
              <div className="py-6 text-center space-y-4 font-sans">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block mb-1">
                    INSCRIÇÃO CONFIRMADA COM SUCESSO!
                  </span>
                  <h3 className="font-black text-2xl uppercase text-slate-900">
                    Sua vaga está garantida
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mt-2 font-medium leading-relaxed">
                    Muito obrigado por se inscrever em <strong className="text-slate-900">{selectedEventForSignup.title}</strong>. Enviamos o e-mail de confirmação com todas as instruções!
                  </p>
                </div>

                {/* E-MAIL DE CONFIRMAÇÃO RECIBO */}
                {confirmationEmail && (
                  <div className="mt-4 text-left bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-sans space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Mail className="w-4 h-4 text-[#102bde]" />
                        <span>E-mail de Confirmação Despachado</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${confirmationEmail.subject}\n\n${confirmationEmail.body}`);
                          setCopiedEmail(true);
                          setTimeout(() => setCopiedEmail(false), 2500);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#102bde] hover:underline cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedEmail ? 'Copiado!' : 'Copiar Texto'}</span>
                      </button>
                    </div>
                    <div className="text-slate-600 font-mono text-[11px] whitespace-pre-line leading-relaxed bg-white p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                      {confirmationEmail.body}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedEventForSignup(null)}
                    className="w-full py-3 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                  >
                    FECHAR E CONTINUAR
                  </button>
                </div>
              </div>
            ) : selectedEventForSignup.registrationType === 'retreat' ? (
              /* FORMULÁRIO AVANÇADO DE RETIRO ESPIRITUAL */
              <>
                <div className="border-b border-slate-100 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[11px] uppercase mb-2">
                    <Tent className="w-3.5 h-3.5 text-amber-600" />
                    <span>Inscrição para Retiro Espiritual (Pernoite / Deslocamento)</span>
                  </div>
                  <h3 className="font-sans font-black text-2xl uppercase text-slate-900 leading-tight">
                    {selectedEventForSignup.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-1">
                    Por se tratar de uma viagem com hospedagem e deslocamento, solicitamos informações detalhadas de saúde e contatos de emergência para a segurança e acolhimento de todos.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 uppercase mt-2">
                    <span className="flex items-center gap-1 text-[#102bde]">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedEventForSignup.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedEventForSignup.time}
                    </span>
                    {selectedEventForSignup.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedEventForSignup.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Avisos CMS */}
                {selectedEventForSignup.registrationMessage && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-800 font-medium leading-relaxed flex items-start gap-2">
                    <Info className="w-4.5 h-4.5 text-[#102bde] shrink-0 mt-0.5" />
                    <span>{selectedEventForSignup.registrationMessage}</span>
                  </div>
                )}

                {signupError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{signupError}</span>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSignupError(null);

                    // Validations
                    if (!retreatForm.fullName.trim()) return setSignupError('Preencha o Nome Completo.');
                    if (!retreatForm.birthDate) return setSignupError('Informe a Data de Nascimento.');
                    if (!retreatForm.email.trim()) return setSignupError('Informe o E-mail de contato.');
                    if (!retreatForm.phone.trim()) return setSignupError('Informe o Telefone / WhatsApp.');
                    if (!retreatForm.documentId.trim()) return setSignupError('Informe o RG ou CPF.');
                    if (!retreatForm.city.trim()) return setSignupError('Informe a Cidade de Origem.');

                    // Health details validation if checked
                    if (retreatForm.hasAllergies && !retreatForm.allergiesDetails.trim()) {
                      return setSignupError('Especifique os detalhes das suas alergias.');
                    }
                    if (retreatForm.hasMedications && !retreatForm.medicationsDetails.trim()) {
                      return setSignupError('Especifique os detalhes dos medicamentos contínuos.');
                    }
                    if (retreatForm.hasDietaryRestrictions && !retreatForm.dietaryDetails.trim()) {
                      return setSignupError('Especifique as restrições alimentares.');
                    }

                    // Emergency contact validation
                    if (!retreatForm.emergencyContactName.trim() || !retreatForm.emergencyContactRelationship.trim() || !retreatForm.emergencyContactPhone.trim()) {
                      return setSignupError('Preencha os dados completos do Contato de Emergência.');
                    }

                    // Minor validation
                    if (retreatForm.isMinor) {
                      if (!retreatForm.guardianName.trim() || !retreatForm.guardianPhone.trim() || !retreatForm.guardianDocument.trim()) {
                        return setSignupError('Por ser menor de 18 anos, preencha o Nome, Telefone e Documento do Responsável Legal.');
                      }
                      if (!retreatForm.guardianAuthorization) {
                        return setSignupError('O responsável legal deve autorizar a viagem e o pernoite do menor.');
                      }
                      if (!retreatForm.emergencyMedicalConsent) {
                        return setSignupError('O responsável deve autorizar o encaminhamento médico emergencial.');
                      }
                    }

                    // Consents
                    if (!retreatForm.truthfulInfoConsent || !retreatForm.termsConsent || !retreatForm.emergencyContactConsent) {
                      return setSignupError('Você precisa marcar todos os consentimentos obrigatórios antes de enviar.');
                    }

                    setSignupSubmitting(true);
                    try {
                      const res = await addEventRegistration(selectedEventForSignup, {
                        ...retreatForm,
                        registrationType: 'retreat',
                      });
                      setConfirmationEmail(res.emailConfirmation);
                      setSignupSuccess(true);
                    } catch (err: any) {
                      setSignupError(err.message || 'Erro ao realizar inscrição.');
                    } finally {
                      setSignupSubmitting(false);
                    }
                  }}
                  className="space-y-6 font-sans text-xs"
                >
                  {/* SEÇÃO 1: DADOS PESSOAIS */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 font-black text-slate-800 uppercase text-xs border-b border-slate-200 pb-2">
                      <User className="w-4 h-4 text-[#102bde]" />
                      <span>1. Dados Pessoais do Participante</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Gabriel Alves da Silva"
                          value={retreatForm.fullName}
                          onChange={(e) => setRetreatForm({ ...retreatForm, fullName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        />
                      </div>

                      <div>
                        <DatePicker
                          label="DATA DE NASCIMENTO"
                          required
                          value={retreatForm.birthDate}
                          maxDate={formatDateToDb(new Date())}
                          onChange={(dbVal) => handleBirthDateChange(dbVal)}
                          placeholder="DD-MM-YYYY"
                        />
                        {retreatForm.birthDate && (
                          <span className="text-[11px] font-bold text-slate-500 mt-1 block">
                            Idade calculada: {calculateAge(retreatForm.birthDate) ?? '--'} anos
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Documento de Identificação (RG / CPF) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: 12.345.678-9 ou CPF"
                          value={retreatForm.documentId}
                          onChange={(e) => setRetreatForm({ ...retreatForm, documentId: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          E-mail de Contato *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="seu@email.com"
                          value={retreatForm.email}
                          onChange={(e) => setRetreatForm({ ...retreatForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Telefone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="(19) 99999-9999"
                          value={retreatForm.phone}
                          onChange={(e) => setRetreatForm({ ...retreatForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Sexo *
                        </label>
                        <select
                          value={retreatForm.gender}
                          onChange={(e) => setRetreatForm({ ...retreatForm, gender: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        >
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                          <option value="Outro">Outro / Prefiro não informar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Cidade de Origem *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Campinas - SP"
                          value={retreatForm.city}
                          onChange={(e) => setRetreatForm({ ...retreatForm, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 2: DADOS DO RESPONSÁVEL (MENOR DE IDADE) */}
                  {retreatForm.isMinor && (
                    <div className="bg-amber-50/90 p-4 rounded-xl border-2 border-amber-300 space-y-3">
                      <div className="flex items-center gap-2 font-black text-amber-900 uppercase text-xs border-b border-amber-200 pb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>2. Responsável Legal (Participante Menor de 18 anos)</span>
                      </div>
                      <p className="text-[11px] font-bold text-amber-800">
                        Como o participante possui menos de 18 anos, é obrigatório indicar os dados do pai, mãe ou responsável legal para autorização da viagem e pernoite.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold uppercase text-slate-800 mb-1">
                            Nome Completo do Responsável Legal *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Maria Alves da Silva"
                            value={retreatForm.guardianName}
                            onChange={(e) => setRetreatForm({ ...retreatForm, guardianName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-slate-900 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase text-slate-800 mb-1">
                            Telefone / WhatsApp do Responsável *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="(19) 98888-8888"
                            value={retreatForm.guardianPhone}
                            onChange={(e) => setRetreatForm({ ...retreatForm, guardianPhone: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-medium text-slate-900 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase text-slate-800 mb-1">
                            RG / CPF do Responsável *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Documento do responsável"
                            value={retreatForm.guardianDocument}
                            onChange={(e) => setRetreatForm({ ...retreatForm, guardianDocument: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-medium text-slate-900 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold uppercase text-slate-800 mb-1">
                            E-mail do Responsável (Opcional)
                          </label>
                          <input
                            type="email"
                            placeholder="responsavel@email.com"
                            value={retreatForm.guardianEmail}
                            onChange={(e) => setRetreatForm({ ...retreatForm, guardianEmail: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-medium text-slate-900 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-2 pt-1">
                          <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={retreatForm.guardianAuthorization}
                              onChange={(e) => setRetreatForm({ ...retreatForm, guardianAuthorization: e.target.checked })}
                              className="mt-0.5 rounded text-[#102bde] focus:ring-[#102bde]"
                            />
                            <span>Como responsável legal, autorizo expressamente a viagem, deslocamento e hospedagem do menor no retiro. *</span>
                          </label>

                          <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={retreatForm.emergencyMedicalConsent}
                              onChange={(e) => setRetreatForm({ ...retreatForm, emergencyMedicalConsent: e.target.checked })}
                              className="mt-0.5 rounded text-[#102bde] focus:ring-[#102bde]"
                            />
                            <span>Autorizo o encaminhamento e atendimento médico emergencial caso necessário durante o evento. *</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEÇÃO 3: SAÚDE, MEDICAÇÃO E RESTRIÇÕES */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 font-black text-slate-800 uppercase text-xs border-b border-slate-200 pb-2">
                      <HeartPulse className="w-4 h-4 text-rose-600" />
                      <span>3. Saúde, Alimentação e Cuidados Especiais</span>
                    </div>

                    <div className="space-y-3">
                      {/* Alergias */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={retreatForm.hasAllergies}
                            onChange={(e) => setRetreatForm({ ...retreatForm, hasAllergies: e.target.checked })}
                            className="rounded text-[#102bde] focus:ring-[#102bde]"
                          />
                          <span>Possui algum tipo de alergia? (Alimentar, Medicamentosa, Insetos, etc.)</span>
                        </label>
                        {retreatForm.hasAllergies && (
                          <input
                            type="text"
                            required
                            placeholder="Descreva as alergias (Ex: Alergia a Dipirona e Amendoim)"
                            value={retreatForm.allergiesDetails}
                            onChange={(e) => setRetreatForm({ ...retreatForm, allergiesDetails: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde]"
                          />
                        )}
                      </div>

                      {/* Medicamentos */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={retreatForm.hasMedications}
                            onChange={(e) => setRetreatForm({ ...retreatForm, hasMedications: e.target.checked })}
                            className="rounded text-[#102bde] focus:ring-[#102bde]"
                          />
                          <span>Faz uso contínuo de algum medicamento?</span>
                        </label>
                        {retreatForm.hasMedications && (
                          <input
                            type="text"
                            required
                            placeholder="Descreva os remédios e horários (Ex: Insulina de manhã, Pressão às 20h)"
                            value={retreatForm.medicationsDetails}
                            onChange={(e) => setRetreatForm({ ...retreatForm, medicationsDetails: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde]"
                          />
                        )}
                      </div>

                      {/* Restrição Alimentar */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={retreatForm.hasDietaryRestrictions}
                            onChange={(e) => setRetreatForm({ ...retreatForm, hasDietaryRestrictions: e.target.checked })}
                            className="rounded text-[#102bde] focus:ring-[#102bde]"
                          />
                          <span>Possui restrição alimentar ou dieta especial?</span>
                        </label>
                        {retreatForm.hasDietaryRestrictions && (
                          <input
                            type="text"
                            required
                            placeholder="Descreva a restrição (Ex: Intolerância a Lactose, Celíaco, Vegetariano)"
                            value={retreatForm.dietaryDetails}
                            onChange={(e) => setRetreatForm({ ...retreatForm, dietaryDetails: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde]"
                          />
                        )}
                      </div>

                      {/* Condições de Saúde & Observações */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block font-bold uppercase text-slate-700 mb-1">
                            Condições de Saúde Relevantes
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Asma, Diabetes, Pressão Alta, Enxaqueca"
                            value={retreatForm.healthConditions}
                            onChange={(e) => setRetreatForm({ ...retreatForm, healthConditions: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase text-slate-700 mb-1">
                            Observações Médicas Adicionais
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Precisa de leito térreo, cirurgia recente"
                            value={retreatForm.medicalNotes}
                            onChange={(e) => setRetreatForm({ ...retreatForm, medicalNotes: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 4: CONTATO DE EMERGÊNCIA */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 font-black text-slate-800 uppercase text-xs border-b border-slate-200 pb-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>4. Contato de Emergência</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Nome do Contato de Emergência *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Carlos Silva"
                          value={retreatForm.emergencyContactName}
                          onChange={(e) => setRetreatForm({ ...retreatForm, emergencyContactName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Grau de Parentesco / Relação *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Mãe, Pai, Cônjuge, Irmão, Amigo"
                          value={retreatForm.emergencyContactRelationship}
                          onChange={(e) => setRetreatForm({ ...retreatForm, emergencyContactRelationship: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Telefone Principal de Emergência *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="(19) 97777-7777"
                          value={retreatForm.emergencyContactPhone}
                          onChange={(e) => setRetreatForm({ ...retreatForm, emergencyContactPhone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Telefone Secundário / Alternativo
                        </label>
                        <input
                          type="tel"
                          placeholder="(19) 3333-3333"
                          value={retreatForm.emergencyContactPhoneAlt}
                          onChange={(e) => setRetreatForm({ ...retreatForm, emergencyContactPhoneAlt: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 5: OBSERVAÇÕES GERAIS */}
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">
                      Observações Gerais / Necessidades de Transporte ou Hospedagem (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Preciso de carona, irei no meu próprio carro, etc."
                      value={retreatForm.notes}
                      onChange={(e) => setRetreatForm({ ...retreatForm, notes: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde]"
                    />
                  </div>

                  {/* SEÇÃO 6: CONSENTIMENTOS OBRIGATÓRIOS */}
                  <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-2.5">
                    <span className="font-black text-slate-800 uppercase text-xs block mb-1">
                      Declarações e Consentimentos Obrigatórios
                    </span>

                    <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={retreatForm.truthfulInfoConsent}
                        onChange={(e) => setRetreatForm({ ...retreatForm, truthfulInfoConsent: e.target.checked })}
                        className="mt-0.5 rounded text-[#102bde] focus:ring-[#102bde]"
                      />
                      <span>Declaro que todas as informações de saúde e pessoais prestadas neste formulário são autênticas e exatas. *</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={retreatForm.termsConsent}
                        onChange={(e) => setRetreatForm({ ...retreatForm, termsConsent: e.target.checked })}
                        className="mt-0.5 rounded text-[#102bde] focus:ring-[#102bde]"
                      />
                      <span>Concordo com os termos, horários, conduta e programação estipulados pela organização do retiro. *</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={retreatForm.emergencyContactConsent}
                        onChange={(e) => setRetreatForm({ ...retreatForm, emergencyContactConsent: e.target.checked })}
                        className="mt-0.5 rounded text-[#102bde] focus:ring-[#102bde]"
                      />
                      <span>Autorizo a equipe da igreja a acionar o contato de emergência em qualquer eventualidade de saúde ou necessidade durante a viagem. *</span>
                    </label>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={signupSubmitting}
                      onClick={() => setSelectedEventForSignup(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase cursor-pointer"
                    >
                      CANCELAR
                    </button>

                    <button
                      type="submit"
                      disabled={signupSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {signupSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>REGISTRANDO NO RETIRO...</span>
                        </>
                      ) : (
                        <>
                          <span>FINALIZAR INSCRIÇÃO DO RETIRO</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* FORMULÁRIO SIMPLES DE INSCRIÇÃO */
              <>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#102bde] font-bold text-[11px] uppercase mb-2">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Inscrição para Evento</span>
                  </div>
                  <h3 className="font-sans font-black text-2xl uppercase text-slate-900 leading-tight">
                    {selectedEventForSignup.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 uppercase mt-2">
                    <span className="flex items-center gap-1 text-[#102bde]">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedEventForSignup.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedEventForSignup.time}
                    </span>
                  </div>
                </div>

                {/* Avisos / Instruções cadastradas no CMS */}
                {selectedEventForSignup.registrationMessage && (
                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 font-medium leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#102bde] shrink-0 mt-0.5" />
                    <span>{selectedEventForSignup.registrationMessage}</span>
                  </div>
                )}

                {signupError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{signupError}</span>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!signupForm.fullName.trim() || !signupForm.email.trim() || !signupForm.phone.trim()) {
                      setSignupError('Por favor, preencha todos os campos obrigatórios.');
                      return;
                    }
                    setSignupSubmitting(true);
                    setSignupError(null);
                    try {
                      const res = await addEventRegistration(selectedEventForSignup, {
                        ...signupForm,
                        registrationType: 'simple',
                      });
                      setConfirmationEmail(res.emailConfirmation);
                      setSignupSuccess(true);
                    } catch (err: any) {
                      setSignupError(err.message || 'Erro ao realizar inscrição.');
                    } finally {
                      setSignupSubmitting(false);
                    }
                  }}
                  className="space-y-3 font-sans text-xs"
                >
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João Silva da Cruz"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none focus:border-[#102bde]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="seu@email.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(19) 99999-9999"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">
                      Observações / Necessidades Especiais (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: 'Irei acompanhado de 2 crianças', etc."
                      value={signupForm.notes}
                      onChange={(e) => setSignupForm({ ...signupForm, notes: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:border-[#102bde]"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={signupSubmitting}
                      onClick={() => setSelectedEventForSignup(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase cursor-pointer"
                    >
                      CANCELAR
                    </button>

                    <button
                      type="submit"
                      disabled={signupSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {signupSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>PROCESSANDO...</span>
                        </>
                      ) : (
                        <>
                          <span>CONFIRMAR INSCRIÇÃO</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

