import React, { useState, useEffect } from 'react';
import { WEEKLY_SCHEDULE, SPECIAL_EVENTS } from '../data/churchData';
import { subscribeSchedules, subscribeEvents } from '../services/firestoreService';
import { ScheduleItem, ChurchEvent } from '../types';
import { 
  Calendar, Clock, MapPin, Sparkles, Filter, 
  CheckCircle, Plus, Share2, Tag, ChevronRight, Info
} from 'lucide-react';
import { motion } from 'motion/react';

export const SchedulePage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('Todos');
  const [addedCalendarId, setAddedCalendarId] = useState<string | null>(null);

  // Firestore live collections
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(WEEKLY_SCHEDULE);
  const [eventsList, setEventsList] = useState<ChurchEvent[]>(SPECIAL_EVENTS);

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

  const handleAddToCalendar = (eventId: string, title: string) => {
    setAddedCalendarId(eventId);
    setTimeout(() => setAddedCalendarId(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* ELEVATION SCHEDULE HERO */}
      <section className="bg-white text-slate-900 py-16 lg:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-2">
            HORÁRIOS DOS CULTOS
          </span>
          <h1 className="font-sans font-black text-4xl sm:text-6xl uppercase text-slate-900 tracking-tight">
            AGENDA DA SEMANA
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto mt-3 font-medium leading-relaxed">
            Venha celebrar conosco presencialmente. Confira os horários e locais dos nossos cultos e grupos.
          </p>
        </div>
      </section>

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
        <section className="space-y-8">
          <div>
            <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-1">
              CONFERÊNCIAS & ACAMPAMENTOS
            </span>
            <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase text-slate-900">
              EVENTOS ESPECIAIS
            </h2>
            <p className="text-slate-600 text-sm mt-1 font-medium">
              Datas marcadas em nosso calendário para fortalecimento da comunidade.
            </p>
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
              {eventsList.map((event) => (
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
                      
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-md bg-[#102bde] text-white font-sans font-black text-xs uppercase tracking-wider shadow-sm">
                          {event.badge}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-2 text-[#102bde] font-sans text-xs font-extrabold uppercase mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
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
                      onClick={() => handleAddToCalendar(event.id, event.title)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-200 transition-colors cursor-pointer"
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

                    <a
                      href={`https://wa.me/5519998765432?text=Olá,%20gostaria%20de%20me%20inscrever%20no%20evento:%20${encodeURIComponent(event.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      <span>INSCREVER-SE</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

