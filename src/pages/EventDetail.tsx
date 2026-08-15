import React, { useState, useEffect } from 'react';
import { ChurchEvent, PageId } from '../types';
import { subscribeEvents, addEventRegistration } from '../services/firestoreService';
import { formatDateToDisplay, generateGoogleCalendarUrl, parseLocalDate, formatEventDateRange } from '../utils/dateUtils';
import { getEventSlug, slugify } from '../utils/slugUtils';
import { DatePicker } from '../components/DatePicker';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  Share2, 
  Check, 
  Sparkles, 
  X, 
  AlertCircle, 
  Info, 
  Tent, 
  User, 
  Phone, 
  ShieldCheck, 
  FileText,
  HeartPulse
} from 'lucide-react';

interface EventDetailProps {
  eventSlug: string;
  onNavigate: (page: PageId, extraParam?: string) => void;
  onOpenPrayerModal?: () => void;
}

export const EventDetailPage: React.FC<EventDetailProps> = ({ eventSlug, onNavigate }) => {
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedCalendar, setAddedCalendar] = useState(false);

  // Inscription modal state
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Simple registration form
  const [simpleForm, setSimpleForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Retreat registration form
  const [retreatForm, setRetreatForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    documentId: '',
    gender: 'masculino',
    city: 'Cosmópolis',
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
    truthfulInfoConsent: false,
    termsConsent: false,
    emergencyContactConsent: false,
  });

  // Age calculation helper
  const calculateAge = (bDateStr?: string) => {
    if (!bDateStr) return null;
    const birth = parseLocalDate(bDateStr);
    if (!birth) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const unsub = subscribeEvents((items) => {
      const found = (items || []).find((e) => {
        const slug = getEventSlug(e);
        return slug === eventSlug || slugify(e.title) === eventSlug || e.id === eventSlug;
      });
      setEvent(found || null);
      if (found) {
        document.title = `${found.title} - IMW Cosmópolis`;
      }
      setLoading(false);
    });
    return () => unsub();
  }, [eventSlug]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: event?.title || 'Evento Especial',
        text: event?.description || 'Confira este evento na Igreja Metodista Wesleyana em Cosmópolis',
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const gcalUrl = generateGoogleCalendarUrl({
      title: event.title,
      dateStr: event.date,
      timeStr: event.time,
      location: event.location,
      description: event.description,
    });
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
    setAddedCalendar(true);
    setTimeout(() => setAddedCalendar(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#102bde] border-t-transparent" />
      </div>
    );
  }

  // 404 State: Event not found
  if (!event) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-sans font-black text-2xl uppercase text-slate-900 tracking-tight">
              EVENTO NÃO ENCONTRADO
            </h1>
            <p className="text-slate-600 text-sm mt-2 font-medium">
              O evento que você procura não foi localizado ou pode ter sido alterado.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Ir para o Início
            </button>
            <button
              onClick={() => onNavigate('schedule')}
              className="flex-1 px-4 py-3 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Ver Programação
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRetreat = event.registrationType === 'retreat';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Top Breadcrumb & Navigation Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs font-sans font-extrabold uppercase tracking-wider text-slate-600 hover:text-[#102bde] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o Início</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-600" />
                <span>Compartilhar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Event Card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Large Cover Banner Image */}
          {event.imageUrl ? (
            <div className="relative h-[320px] sm:h-[420px] md:h-[480px] w-full bg-slate-900 overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              
              {/* Badge Overlay */}
              {event.badge && (
                <div className="absolute top-6 left-6 z-10">
                  <span className="px-4 py-1.5 rounded-full bg-[#102bde] text-white font-sans font-black text-xs uppercase tracking-widest shadow-lg">
                    {event.badge}
                  </span>
                </div>
              )}

              {/* Title overlay at banner bottom */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <h1 className="font-sans font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none drop-shadow-md">
                  {event.title}
                </h1>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
              {event.badge && (
                <span className="inline-block px-3 py-1 rounded-full bg-[#102bde] text-white font-sans font-black text-xs uppercase tracking-widest mb-4">
                  {event.badge}
                </span>
              )}
              <h1 className="font-sans font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none">
                {event.title}
              </h1>
            </div>
          )}

          {/* Details Content Container */}
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Quick Info Grid Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#102bde]/10 text-[#102bde] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-sans font-black uppercase text-slate-600 block">DATA DO EVENTO</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatEventDateRange(event.date, event.endDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#102bde]/10 text-[#102bde] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-sans font-black uppercase text-slate-600 block">HORÁRIO</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {event.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#102bde]/10 text-[#102bde] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-sans font-black uppercase text-slate-600 block">LOCALIZAÇÃO</span>
                  <span className="text-sm font-extrabold text-slate-900 line-clamp-1">
                    {event.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Deadline Banner if present */}
            {event.registrationDeadline && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Prazo final para inscrições: <strong>{formatDateToDisplay(event.registrationDeadline)}</strong>
                </span>
              </div>
            )}

            {/* Description Section */}
            <div className="space-y-3 border-b border-slate-100 pb-8">
              <h2 className="font-sans font-black text-lg uppercase text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#102bde]" />
                <span>SOBRE O EVENTO</span>
              </h2>
              <div className="text-slate-700 text-base leading-relaxed whitespace-pre-line font-medium">
                {event.description}
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              
              {/* Google Calendar Action Button */}
              <button
                onClick={handleAddToCalendar}
                className="px-6 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-300 shadow-sm"
              >
                <Calendar className="w-4 h-4 text-[#102bde]" />
                <span>{addedCalendar ? 'ABRINDO GOOGLE CALENDAR...' : 'MARQUE NA AGENDA'}</span>
              </button>

              {/* Registration Button */}
              {event.enableRegistration ? (
                <button
                  onClick={() => {
                    setSignupSuccess(false);
                    setSignupError(null);
                    setIsRegistrationModalOpen(true);
                  }}
                  className="px-8 py-4 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>{isRetreat ? 'FAZER INSCRIÇÃO PARA O RETIRO' : 'INSCREVA-SE AGORA'}</span>
                </button>
              ) : (
                <span className="text-xs text-slate-600 font-bold bg-slate-100 px-4 py-3 rounded-xl border border-slate-200 text-center">
                  Entrada Livre (Não requer inscrição prévia)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 relative shrink-0 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-blue-400 text-[10px] font-sans font-black uppercase tracking-widest block mb-1">
                  {isRetreat ? 'INSCRIÇÃO RETIRO ESPIRITUAL' : 'FORMULÁRIO DE INSCRIÇÃO'}
                </span>
                <h2 className="font-sans font-black text-xl uppercase tracking-tight text-white line-clamp-1">
                  {event.title}
                </h2>
              </div>
              <button
                onClick={() => setIsRegistrationModalOpen(false)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {signupSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-black text-2xl uppercase text-slate-900">
                    INSCRIÇÃO CONFIRMADA!
                  </h3>
                  <p className="text-slate-600 text-sm font-medium max-w-md mx-auto">
                    Sua inscrição para <strong>{event.title}</strong> foi registrada com sucesso! Aguardamos você com alegria.
                  </p>
                  <button
                    onClick={() => setIsRegistrationModalOpen(false)}
                    className="mt-4 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Fechar Janela
                  </button>
                </div>
              ) : (
                <>
                  {signupError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  {/* SIMPLE REGISTRATION FORM */}
                  {!isRetreat ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!simpleForm.fullName.trim()) return setSignupError('Informe seu nome completo.');
                        if (!simpleForm.email.trim()) return setSignupError('Informe seu e-mail.');
                        if (!simpleForm.phone.trim()) return setSignupError('Informe seu telefone / WhatsApp.');

                        setSubmitting(true);
                        setSignupError(null);
                        try {
                          await addEventRegistration(event, {
                            eventId: event.id,
                            registrationType: 'simple',
                            fullName: simpleForm.fullName.trim(),
                            email: simpleForm.email.trim(),
                            phone: simpleForm.phone.trim(),
                            notes: simpleForm.notes.trim(),
                          });
                          setSignupSuccess(true);
                        } catch (err: any) {
                          setSignupError(err.message || 'Erro ao realizar inscrição. Tente novamente.');
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={simpleForm.fullName}
                          onChange={(e) => setSimpleForm({ ...simpleForm, fullName: e.target.value })}
                          placeholder="Digite seu nome completo"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102bde] font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                            E-mail *
                          </label>
                          <input
                            type="email"
                            required
                            value={simpleForm.email}
                            onChange={(e) => setSimpleForm({ ...simpleForm, email: e.target.value })}
                            placeholder="seuemail@exemplo.com"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102bde] font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                            Telefone / WhatsApp *
                          </label>
                          <input
                            type="tel"
                            required
                            value={simpleForm.phone}
                            onChange={(e) => setSimpleForm({ ...simpleForm, phone: e.target.value })}
                            placeholder="(19) 99999-9999"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102bde] font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                          Observações (opcional)
                        </label>
                        <textarea
                          rows={3}
                          value={simpleForm.notes}
                          onChange={(e) => setSimpleForm({ ...simpleForm, notes: e.target.value })}
                          placeholder="Informação adicional para a organização"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102bde] font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg disabled:opacity-50"
                      >
                        {submitting ? 'ENVIANDO INSCRIÇÃO...' : 'CONFIRMAR INSCRIÇÃO'}
                      </button>
                    </form>
                  ) : (
                    /* RETREAT DETAILED FORM */
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!retreatForm.fullName.trim()) return setSignupError('Informe o Nome Completo.');
                        if (!retreatForm.birthDate) return setSignupError('Informe a Data de Nascimento.');
                        if (!retreatForm.email.trim()) return setSignupError('Informe o E-mail de contato.');
                        if (!retreatForm.phone.trim()) return setSignupError('Informe o Telefone / WhatsApp.');
                        if (!retreatForm.documentId.trim()) return setSignupError('Informe o RG ou CPF.');
                        if (!retreatForm.emergencyContactName.trim()) return setSignupError('Informe o Nome do Contato de Emergência.');
                        if (!retreatForm.emergencyContactRelationship.trim()) return setSignupError('Informe o Grau de Parentesco do Contato de Emergência.');
                        if (!retreatForm.emergencyContactPhone.trim()) return setSignupError('Informe o Telefone de Emergência.');

                        if (retreatForm.isMinor) {
                          if (!retreatForm.guardianName.trim()) return setSignupError('Para menores de 18 anos, informe o Nome do Responsável Legal.');
                          if (!retreatForm.guardianPhone.trim()) return setSignupError('Informe o Telefone do Responsável Legal.');
                          if (!retreatForm.guardianDocument.trim()) return setSignupError('Informe o RG ou CPF do Responsável Legal.');
                        }

                        if (!retreatForm.truthfulInfoConsent) return setSignupError('Você precisa declarar que todas as informações prestadas são verdadeiras.');
                        if (!retreatForm.termsConsent) return setSignupError('Você precisa concordar com os termos de convivência do retiro.');

                        setSubmitting(true);
                        setSignupError(null);
                        try {
                          await addEventRegistration(event, {
                            eventId: event.id,
                            registrationType: 'retreat',
                            fullName: retreatForm.fullName.trim(),
                            email: retreatForm.email.trim(),
                            phone: retreatForm.phone.trim(),
                            birthDate: retreatForm.birthDate,
                            documentId: retreatForm.documentId.trim(),
                            gender: retreatForm.gender,
                            city: retreatForm.city.trim(),
                            hasAllergies: retreatForm.hasAllergies,
                            allergiesDetails: retreatForm.allergiesDetails.trim(),
                            hasMedications: retreatForm.hasMedications,
                            medicationsDetails: retreatForm.medicationsDetails.trim(),
                            healthConditions: retreatForm.healthConditions.trim(),
                            hasDietaryRestrictions: retreatForm.hasDietaryRestrictions,
                            dietaryDetails: retreatForm.dietaryDetails.trim(),
                            medicalNotes: retreatForm.medicalNotes.trim(),
                            emergencyContactName: retreatForm.emergencyContactName.trim(),
                            emergencyContactRelationship: retreatForm.emergencyContactRelationship.trim(),
                            emergencyContactPhone: retreatForm.emergencyContactPhone.trim(),
                            emergencyContactPhoneAlt: retreatForm.emergencyContactPhoneAlt.trim(),
                            isMinor: retreatForm.isMinor,
                            guardianName: retreatForm.guardianName.trim(),
                            guardianPhone: retreatForm.guardianPhone.trim(),
                            guardianEmail: retreatForm.guardianEmail.trim(),
                            guardianDocument: retreatForm.guardianDocument.trim(),
                            guardianAuthorization: retreatForm.isMinor,
                            emergencyMedicalConsent: true,
                            truthfulInfoConsent: retreatForm.truthfulInfoConsent,
                            termsConsent: retreatForm.termsConsent,
                            emergencyContactConsent: true,
                          });
                          setSignupSuccess(true);
                        } catch (err: any) {
                          setSignupError(err.message || 'Erro ao realizar inscrição.');
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      className="space-y-6"
                    >
                      {/* Section 1: Identification */}
                      <div className="space-y-4">
                        <h3 className="font-sans font-black text-xs uppercase tracking-wider text-[#102bde] border-b border-slate-200 pb-2">
                          1. DADOS PESSOAIS DE IDENTIFICAÇÃO
                        </h3>

                        <div>
                          <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            required
                            value={retreatForm.fullName}
                            onChange={(e) => setRetreatForm({ ...retreatForm, fullName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                              Data de Nascimento *
                            </label>
                            <DatePicker
                              value={retreatForm.birthDate}
                              onChange={(val) => {
                                const age = calculateAge(val);
                                setRetreatForm({
                                  ...retreatForm,
                                  birthDate: val,
                                  isMinor: age !== null ? age < 18 : retreatForm.isMinor,
                                });
                              }}
                              placeholder="Selecione a data de nascimento"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                              RG ou CPF *
                            </label>
                            <input
                              type="text"
                              required
                              value={retreatForm.documentId}
                              onChange={(e) => setRetreatForm({ ...retreatForm, documentId: e.target.value })}
                              placeholder="00.000.000-0"
                              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                              E-mail *
                            </label>
                            <input
                              type="email"
                              required
                              value={retreatForm.email}
                              onChange={(e) => setRetreatForm({ ...retreatForm, email: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                              Telefone / WhatsApp *
                            </label>
                            <input
                              type="tel"
                              required
                              value={retreatForm.phone}
                              onChange={(e) => setRetreatForm({ ...retreatForm, phone: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Minor Legal Guardian (If minor < 18) */}
                      {retreatForm.isMinor && (
                        <div className="space-y-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                          <div className="flex items-center gap-2 text-amber-900">
                            <ShieldCheck className="w-5 h-5 text-amber-600" />
                            <h3 className="font-sans font-black text-xs uppercase tracking-wider">
                              RESPONSÁVEL LEGAL (PARTICIPANTE MENOR DE IDADE)
                            </h3>
                          </div>
                          <div>
                            <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                              Nome do Responsável Legal *
                            </label>
                            <input
                              type="text"
                              required={retreatForm.isMinor}
                              value={retreatForm.guardianName}
                              onChange={(e) => setRetreatForm({ ...retreatForm, guardianName: e.target.value })}
                              placeholder="Nome completo do pai, mãe ou tutor"
                              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm font-medium"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                                Telefone do Responsável *
                              </label>
                              <input
                                type="tel"
                                required={retreatForm.isMinor}
                                value={retreatForm.guardianPhone}
                                onChange={(e) => setRetreatForm({ ...retreatForm, guardianPhone: e.target.value })}
                                placeholder="(19) 99999-9999"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                                Documento (CPF ou RG) do Responsável *
                              </label>
                              <input
                                type="text"
                                required={retreatForm.isMinor}
                                value={retreatForm.guardianDocument}
                                onChange={(e) => setRetreatForm({ ...retreatForm, guardianDocument: e.target.value })}
                                placeholder="000.000.000-00"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm font-medium"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 3: Health & Special Care */}
                      <div className="space-y-4">
                        <h3 className="font-sans font-black text-xs uppercase tracking-wider text-emerald-700 border-b border-slate-200 pb-2 flex items-center gap-2">
                          <HeartPulse className="w-4 h-4 text-emerald-600" />
                          <span>SAÚDE E RESTRIÇÕES</span>
                        </h3>
                        <div className="space-y-3 text-xs font-medium text-slate-700">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={retreatForm.hasAllergies}
                              onChange={(e) => setRetreatForm({ ...retreatForm, hasAllergies: e.target.checked })}
                              className="w-4 h-4 rounded text-[#102bde] border-slate-300 focus:ring-[#102bde]"
                            />
                            <span>Possui alguma alergia (alimentar, medicamentosa, etc.)?</span>
                          </label>
                          {retreatForm.hasAllergies && (
                            <input
                              type="text"
                              value={retreatForm.allergiesDetails}
                              onChange={(e) => setRetreatForm({ ...retreatForm, allergiesDetails: e.target.value })}
                              placeholder="Descreva as alergias"
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                            />
                          )}

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={retreatForm.hasMedications}
                              onChange={(e) => setRetreatForm({ ...retreatForm, hasMedications: e.target.checked })}
                              className="w-4 h-4 rounded text-[#102bde] border-slate-300 focus:ring-[#102bde]"
                            />
                            <span>Usa medicamentos de uso contínuo?</span>
                          </label>
                          {retreatForm.hasMedications && (
                            <input
                              type="text"
                              value={retreatForm.medicationsDetails}
                              onChange={(e) => setRetreatForm({ ...retreatForm, medicationsDetails: e.target.value })}
                              placeholder="Nome do medicamento e dosagem"
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                            />
                          )}
                        </div>
                      </div>

                      {/* Section 4: Emergency Contact */}
                      <div className="space-y-4">
                        <h3 className="font-sans font-black text-xs uppercase tracking-wider text-red-600 border-b border-slate-200 pb-2">
                          4. CONTATO DE EMERGÊNCIA
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                              Nome do Contato *
                            </label>
                            <input
                              type="text"
                              required
                              value={retreatForm.emergencyContactName}
                              onChange={(e) => setRetreatForm({ ...retreatForm, emergencyContactName: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                              Grau de Parentesco *
                            </label>
                            <input
                              type="text"
                              required
                              value={retreatForm.emergencyContactRelationship}
                              onChange={(e) => setRetreatForm({ ...retreatForm, emergencyContactRelationship: e.target.value })}
                              placeholder="Ex: Mãe, Pai, Cônjuge"
                              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-sans font-black uppercase tracking-wider text-slate-700 mb-1">
                              Telefone de Emergência *
                            </label>
                            <input
                              type="tel"
                              required
                              value={retreatForm.emergencyContactPhone}
                              onChange={(e) => setRetreatForm({ ...retreatForm, emergencyContactPhone: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Terms & Declarations */}
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                          <input
                            type="checkbox"
                            required
                            checked={retreatForm.truthfulInfoConsent}
                            onChange={(e) => setRetreatForm({ ...retreatForm, truthfulInfoConsent: e.target.checked })}
                            className="w-4 h-4 mt-0.5 rounded text-[#102bde] border-slate-300 focus:ring-[#102bde]"
                          />
                          <span>Declaro que todas as informações acima são verdadeiras e precisas. *</span>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                          <input
                            type="checkbox"
                            required
                            checked={retreatForm.termsConsent}
                            onChange={(e) => setRetreatForm({ ...retreatForm, termsConsent: e.target.checked })}
                            className="w-4 h-4 mt-0.5 rounded text-[#102bde] border-slate-300 focus:ring-[#102bde]"
                          />
                          <span>Concordo com os termos de convivência, horários e normas do retiro da IMW Cosmópolis. *</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-sans font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg disabled:opacity-50"
                      >
                        {submitting ? 'PROCESSANDO INSCRIÇÃO...' : 'ENVIAR INSCRIÇÃO PARA O RETIRO'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
