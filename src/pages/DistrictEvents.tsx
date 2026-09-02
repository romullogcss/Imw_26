import React, { useState, useEffect } from 'react';
import { 
  subscribeEvents, 
  addEventRegistration,
  fetchDistrictInfo,
  subscribeDistrictCongregations,
  DEFAULT_DISTRICT_INFO
} from '../services/firestoreService';
import { ChurchEvent, DistrictInfo, DistrictCongregation, PageId } from '../types';
import { formatEventDateRange, generateGoogleCalendarUrl } from '../utils/dateUtils';
import { 
  Calendar, Clock, MapPin, Plus, ChevronRight, CheckCircle2,
  AlertCircle, X, Loader2, MessageCircle, ExternalLink, Map, Search,
  HeartHandshake, Compass, Users, Church, Building2, Instagram, Facebook, Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DistrictEventsPageProps {
  onNavigate: (page: PageId, slug?: string) => void;
}

export const DistrictEventsPage: React.FC<DistrictEventsPageProps> = ({ onNavigate }) => {
  const [districtInfo, setDistrictInfo] = useState<DistrictInfo>(DEFAULT_DISTRICT_INFO);
  const [congregations, setCongregations] = useState<DistrictCongregation[]>([]);
  const [eventsList, setEventsList] = useState<ChurchEvent[]>([]);
  const [loadingCongregations, setLoadingCongregations] = useState(true);

  // Filters & Interactivity
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);

  // Registration Modal State
  const [selectedEventForSignup, setSelectedEventForSignup] = useState<ChurchEvent | null>(null);
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', phone: '', notes: '' });
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  useEffect(() => {
    fetchDistrictInfo().then((info) => setDistrictInfo(info));

    const unsubCong = subscribeDistrictCongregations((items) => {
      setCongregations(items.filter((c) => c.isActive));
      setLoadingCongregations(false);
    });

    const unsubEvt = subscribeEvents((updatedEvents) => {
      setEventsList(updatedEvents || []);
    });

    return () => {
      unsubCong();
      unsubEvt();
    };
  }, []);

  const districtEvents = eventsList.filter((e) => e.eventType === 'distrital');

  // Cities list for filter chips
  const availableCities: string[] = Array.from(new Set(congregations.map((c) => c.city))).filter((c): c is string => Boolean(c));

  const filteredCongregations = congregations.filter((cong) => {
    const matchesCity = selectedCityFilter === 'all' || cong.city.toLowerCase() === selectedCityFilter.toLowerCase();
    const matchesSearch = 
      cong.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cong.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cong.pastorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cong.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const formatWhatsappLink = (phone: string, congName: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const num = cleaned.length <= 11 ? `55${cleaned}` : cleaned;
    const msg = encodeURIComponent(`Olá! Gostaria de saber mais informações e os horários dos cultos da ${congName}.`);
    return `https://wa.me/${num}?text=${msg}`;
  };

  const getMapEmbedUrl = (cong: DistrictCongregation) => {
    if (cong.googleMapsEmbedUrl && cong.googleMapsEmbedUrl.trim() !== '') {
      return cong.googleMapsEmbedUrl;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(cong.address || cong.name + ' ' + cong.city)}&output=embed`;
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      {/* 1. HERO / INSTITUTIONAL HEADER */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center mix-blend-overlay"
             style={{ backgroundImage: `url(${districtInfo.bannerUrl || 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=1600'})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest backdrop-blur-md">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>3ª REGIÃO ECLESIÁSTICA</span>
          </div>

          <h1 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {districtInfo.title}
          </h1>

          <p className="text-amber-400 font-extrabold text-sm sm:text-base uppercase tracking-wider max-w-2xl mx-auto">
            {districtInfo.subtitle}
          </p>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-normal">
            {districtInfo.description}
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#congregacoes"
              className="px-6 py-3.5 rounded-xl bg-[#102bde] text-white font-black text-xs uppercase tracking-wider hover:bg-[#0d23b8] transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2 cursor-pointer"
            >
              <Church className="w-4 h-4" />
              <span>Conhecer Congregações</span>
            </a>

            <a
              href="#agenda-distrital"
              className="px-6 py-3.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 font-extrabold text-xs uppercase tracking-wider transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Agenda Distrital</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. INSTITUTIONAL PURPOSE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600">
              Nossa Identidade & Propósito
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase">
              Proclamando Cristo e Edificando Cidades
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              {districtInfo.purpose}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#102bde] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm uppercase text-slate-900">Unidade e Comunhão</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Congregações irmãs integradas em oração, apoio mútuo, capacitação de líderes e cooperação regional.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm uppercase text-slate-900">Missão e Evangelismo</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Anunciando a Palavra de Deus e implantando pontos de pregação para alcançar famílias nas cidades do distrito.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm uppercase text-slate-900">Acolhimento Humano</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Igrejas de portas abertas para receber a todos com amor pastoral, ensino bíblico e ação social transformadora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONGREGATIONS SECTION (MAIN FEATURE) */}
      <section id="congregacoes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 block mb-1">
              CONGREGAÇÕES DO DISTRITO
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase">
              Encontre uma Igreja Próxima de Você
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
              O Distrito de Campinas está presente em diversas cidades. Selecione abaixo e entre em contato direto.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por cidade, pastor ou igreja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#102bde] shadow-sm"
            />
          </div>
        </div>

        {/* City Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCityFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              selectedCityFilter === 'all'
                ? 'bg-[#102bde] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todas as Cidades ({congregations.length})
          </button>

          {availableCities.map((city) => {
            const count = congregations.filter((c) => c.city.toLowerCase() === city.toLowerCase()).length;
            return (
              <button
                key={city}
                onClick={() => setSelectedCityFilter(city)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  selectedCityFilter.toLowerCase() === city.toLowerCase()
                    ? 'bg-[#102bde] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {city} ({count})
              </button>
            );
          })}
        </div>

        {/* Congregations Grid */}
        {loadingCongregations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
                <div className="h-4 w-1/2 bg-slate-200 rounded-md" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredCongregations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-3">
            <Church className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-black text-lg text-slate-800 uppercase">Nenhuma Congregação Encontrada</h3>
            <p className="text-slate-500 text-xs">
              Não encontramos congregações cadastradas com os filtros selecionados. Tente alterar sua busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCongregations.map((cong) => {
              const isMapExpanded = expandedMapId === cong.id;

              return (
                <motion.div
                  key={cong.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Cover Image or Fallback */}
                    <div className="relative h-48 bg-slate-900 overflow-hidden">
                      <img
                        src={cong.imageUrl || 'https://images.unsplash.com/photo-1548625361-181358913a0e?auto=format&fit=crop&q=80&w=800'}
                        alt={cong.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-md bg-[#102bde] text-white font-black text-[10px] uppercase shadow-md">
                          📍 {cong.city}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-black text-xl uppercase leading-tight drop-shadow-sm">
                          {cong.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4 text-xs">
                      {/* Pastor Info */}
                      {cong.pastorName && (
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <Users className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">
                              Pastor Responsável
                            </span>
                            <span className="font-black text-slate-800 text-xs uppercase">
                              {cong.pastorName}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Address */}
                      {cong.address && (
                        <div className="flex items-start gap-2.5 text-slate-600 leading-snug">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-700">{cong.address}</span>
                        </div>
                      )}

                      {/* Google Map Embed Toggle */}
                      {isMapExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2"
                        >
                          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner h-48 bg-slate-100">
                            <iframe
                              title={`Mapa ${cong.name}`}
                              src={getMapEmbedUrl(cong)}
                              className="w-full h-full border-0"
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 pt-0 space-y-2 font-sans">
                    {/* WhatsApp Click-to-Chat Button */}
                    {cong.whatsapp && (
                      <a
                        href={formatWhatsappLink(cong.whatsapp, cong.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white/20" />
                        <span>Falar no WhatsApp</span>
                      </a>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {/* Toggle Map Embed Button */}
                      <button
                        onClick={() => setExpandedMapId(isMapExpanded ? null : cong.id)}
                        className={`py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isMapExpanded
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>{isMapExpanded ? 'Fechar Mapa' : 'Ver Mapa'}</span>
                      </button>

                      {/* Social Link */}
                      {cong.socialUrl ? (
                        <a
                          href={cong.socialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {cong.socialType === 'facebook' ? (
                            <Facebook className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Instagram className="w-3.5 h-3.5 text-pink-600" />
                          )}
                          <span>Rede Social</span>
                        </a>
                      ) : (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cong.address || cong.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Rota G.Maps</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. DISTRICT EVENTS AGENDA SECTION */}
      <section id="agenda-distrital" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-10 border-t border-slate-200 scroll-mt-24">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-amber-600 font-black text-xs uppercase tracking-widest block">
              CALENDÁRIO REGIONAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase">
              Agenda de Eventos Distritais ({districtEvents.length})
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
              Confira os encontros, vigílias e congressos que reúnem todo o Distrito Missionário de Campinas.
            </p>
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
              No momento não há eventos distritais cadastrados. Acompanhe também a agenda local da nossa igreja sede ou os eventos da região.
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
      </section>

      {/* Simple Registration Modal */}
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
