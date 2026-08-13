import React, { useState } from 'react';
import { CHURCH_INFO } from '../data/churchData';
import { 
  Heart, Copy, Check, ShieldAlert, QrCode, Building2, CreditCard, 
  Sparkles, Info, CheckCircle2, HeartHandshake
} from 'lucide-react';
import { motion } from 'motion/react';

export const DonationsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const pixData = CHURCH_INFO.pix;

  const handleCopyPix = () => {
    if (!pixData?.key) return;
    navigator.clipboard.writeText(pixData.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* HERO BANNER */}
      <section className="bg-white text-slate-900 py-16 lg:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-white to-slate-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#102bde]/10 text-[#102bde] text-xs font-black uppercase tracking-wider border border-[#102bde]/20">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>CONTRIBUIÇÃO BÍBLICA & VOLUNTÁRIA</span>
          </span>
          <h1 className="font-sans font-black text-4xl sm:text-6xl uppercase text-slate-900 tracking-tight">
            DOAÇÕES E OFERTAS
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            &quot;Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria.&quot; (2 Coríntios 9:7)
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* EXPLANATORY TEXT BOX */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#102bde]/10 border border-[#102bde]/20 text-[#102bde] flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 fill-[#102bde]/20" />
          </div>
          <h2 className="font-sans font-black text-2xl uppercase text-slate-900">
            Sua Generosidade Mantém a Obra
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Sua contribuição com dízimos e ofertas possibilita a manutenção do templo, o apoio a famílias vulneráveis de Cosmópolis, a realização dos nossos cultos e o sustento de obras missionárias. Você pode realizar sua contribuição de forma rápida, simples e segura via <strong>Pix</strong>.
          </p>
        </div>

        {/* MAIN PIX CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />

          <div className="text-center space-y-1">
            <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block">
              PAGAMENTO RÁPIDO VIA PIX
            </span>
            <h3 className="font-sans font-black text-2xl sm:text-3xl uppercase text-slate-900">
              Escaneie o QR Code
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Abra o aplicativo do seu banco, escolha a opção Pix e aponte a câmera para a imagem abaixo.
            </p>
          </div>

          {/* QR CODE DISPLAY BOX */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-md group hover:border-[#102bde] transition-all">
              <img
                src={pixData.qrCodeUrl}
                alt="QR Code Pix Igreja Metodista Wesleyana"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
              />
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-[#102bde] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                <span>QR CODE PIX OFICIAL</span>
              </div>
            </div>
          </div>

          {/* PIX DETAILS GRID */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Chave Pix */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Chave Pix ({pixData.keyType})
                </span>
                <span className="font-black text-slate-900 text-sm sm:text-base break-all block">
                  {pixData.key}
                </span>
              </div>

              {/* Favorecido */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Nome do Favorecido
                </span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                  {pixData.favoredName}
                </span>
              </div>

              {/* CNPJ */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  CNPJ
                </span>
                <span className="font-bold text-slate-800 text-xs block">
                  {pixData.cnpj}
                </span>
              </div>

              {/* Banco / Conta */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Instituição Financeira
                </span>
                <span className="font-bold text-slate-800 text-xs block">
                  {pixData.bankName}
                </span>
              </div>

            </div>

            {/* COPY PIX BUTTON */}
            <div className="pt-2">
              <button
                onClick={handleCopyPix}
                className={`w-full py-4 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md active:scale-98 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#102bde] hover:bg-[#0d23b8] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span>CHAVE PIX COPIADA COM SUCESSO!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>COPIAR CHAVE PIX</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECURITY WARNING NOTICE */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed font-medium">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-black uppercase text-amber-950 block mb-0.5">
                Aviso de Segurança:
              </strong>
              Antes de confirmar o pagamento no aplicativo do seu banco, verifique se o nome do favorecido corresponde ao nome oficial da igreja (<strong>{pixData.favoredName}</strong>).
            </div>
          </div>

        </div>

        {/* BANK ACCOUNT ALTERNATIVE (TRANSFERÊNCIA BANCÁRIA TRADICIONAL) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-[#102bde]" />
            <h3 className="font-sans font-black text-lg uppercase text-slate-900">
              Dados para Transferência Bancária (TED / DOC)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Banco</span>
              <span className="font-black text-slate-800">{pixData.bankName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Agência</span>
              <span className="font-black text-slate-800">{pixData.agency}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Conta Corrente</span>
              <span className="font-black text-slate-800">{pixData.account}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
