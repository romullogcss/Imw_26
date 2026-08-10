import React, { useState } from 'react';
import { CHURCH_INFO } from '../data/churchData';
import { 
  MapPin, Phone, Mail, Clock, MessageCircle, Instagram, Facebook, 
  Send, CheckCircle2, Heart, ShieldCheck, ExternalLink, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const ContactPage: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Informações Gerais',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* ELEVATION HERO BANNER */}
      <section className="bg-white text-slate-900 py-16 lg:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-2">
            ESTAMOS DE PORTAS ABERTAS
          </span>
          <h1 className="font-sans font-black text-4xl sm:text-6xl uppercase text-slate-900 tracking-tight">
            FALE CONOSCO
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto mt-3 font-medium leading-relaxed">
            Entre em contato, agende uma visita pastoral ou venha nos visitar presencialmente em Cosmópolis/SP.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-16">

        {/* SECTION 1: QUICK DIRECT LINKS & ADDRESS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          
          {/* Card 1: Endereço */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#102bde]/10 border border-[#102bde]/20 text-[#102bde] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-black text-xl uppercase text-slate-900">
              NOSSO ENDEREÇO
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              {CHURCH_INFO.address.fullAddress}
            </p>
            <p className="text-[11px] text-slate-400 font-bold uppercase">
              Próximo à praça central de Cosmópolis.
            </p>
          </div>

          {/* Card 2: Telefones & WhatsApp */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-black text-xl uppercase text-slate-900">
              CONTATOS DIRETO
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Telefone: <strong className="text-slate-900 font-extrabold">{CHURCH_INFO.contacts.phone}</strong>
            </p>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              WhatsApp: <strong className="text-slate-900 font-extrabold">{CHURCH_INFO.contacts.whatsappFormatted}</strong>
            </p>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Email: <strong className="text-slate-900 font-extrabold">{CHURCH_INFO.contacts.email}</strong>
            </p>
          </div>

          {/* Card 3: Secretaria */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-black text-xl uppercase text-slate-900">
              ATENDIMENTO PASTORAL
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              {CHURCH_INFO.contacts.secretaryHours}
            </p>
            <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-[#102bde] text-[11px] font-extrabold uppercase tracking-wider border border-slate-200">
              Agendamentos pelo WhatsApp
            </span>
          </div>

        </div>

        {/* SECTION 2: SOCIAL MEDIA DIRECT BUTTONS */}
        <section className="bg-white text-slate-900 rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block">
              REDES SOCIAIS
            </span>
            <h2 className="font-sans font-black text-2xl sm:text-4xl uppercase text-slate-900">
              CONECTE-SE CONOSCO
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-sans font-medium">
              Acompanhe novidades, transmissões ao vivo e devocionais diários nas nossas redes oficiais.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
            
            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${CHURCH_INFO.contacts.whatsapp}?text=Olá,%20paz%20do%20Senhor!%20Gostaria%20de%20informações%20sobre%20a%20igreja.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              <span>ABRIR WHATSAPP</span>
            </a>

            {/* Instagram Button */}
            <a
              href={CHURCH_INFO.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Instagram className="w-5 h-5" />
              <span>SIGA NO INSTAGRAM</span>
            </a>

            {/* Facebook Button */}
            <a
              href={CHURCH_INFO.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Facebook className="w-5 h-5" />
              <span>PÁGINA NO FACEBOOK</span>
            </a>

          </div>
        </section>

        {/* SECTION 3: FORM & GOOGLE MAPS IFRAME */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Form */}
          <div className="lg:col-span-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-1">
                SECRETARIA
              </span>
              <h2 className="font-sans font-black text-2xl uppercase text-slate-900">
                ENVIE UMA MENSAGEM
              </h2>
            </div>

            {formSubmitted ? (
              <div className="text-center py-8 space-y-4 font-sans">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-black text-xl uppercase text-slate-900">MENSAGEM ENVIADA!</h3>
                <p className="text-slate-600 text-xs sm:text-sm max-w-sm mx-auto font-medium">
                  Agradecemos seu contato. Nossa equipe da secretaria responderá em breve.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="px-6 py-3 rounded-xl bg-[#102bde] text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  ENVIAR OUTRA MENSAGEM
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#102bde] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#102bde] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(19) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#102bde] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assunto
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#102bde] transition-colors cursor-pointer uppercase font-bold"
                  >
                    <option value="Informações Gerais">Informações Gerais</option>
                    <option value="Pedido de Visita Pastoral">Pedido de Visita Pastoral</option>
                    <option value="Informações sobre Células/PGs">Informações sobre Células/PGs</option>
                    <option value="Serviço Voluntário">Serviço Voluntário</option>
                    <option value="Aconselhamento">Aconselhamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sua Mensagem *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Escreva sua mensagem aqui..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#102bde] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>ENVIAR MENSAGEM</span>
                </button>
              </form>
            )}
          </div>

          {/* Embedded Google Maps */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between font-sans">
              <div>
                <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-1">
                  LOCALIZAÇÃO
                </span>
                <h2 className="font-sans font-black text-2xl uppercase text-slate-900">
                  COMO CHEGAR
                </h2>
              </div>
              <a
                href="https://maps.google.com/?q=Rua+Barao+do+Rio+Branco+450+Cosmopolis+SP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-[#102bde] hover:underline uppercase"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                title="Mapa Igreja Metodista Wesleyana Cosmópolis"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3681.3326176313833!2d-47.19890538503831!3d-22.641372885147575!2m3!1f0!0f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8e7e1f409520b%3A0x6b7728b76df47285!2sRua%20Bar%C3%A3o%20do%20Rio%20Branco%2C%20Cosm%C3%B3polis%20-%20SP%2C%2013150-000!5e0!3m2!1spt-BR!2sbr!4v1680000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};

