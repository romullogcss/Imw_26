import React, { useState, useEffect } from 'react';
import { CHURCH_INFO } from '../data/churchData';
import { subscribeChurchSettings, ChurchSettingsData } from '../services/firestoreService';
import { 
  generatePixPayload, 
  generateQrCodeDataUrl, 
  DEFAULT_PIX_CONFIG, 
  PixConfig 
} from '../utils/pixUtils';
import { 
  Heart, Copy, Check, ShieldAlert, QrCode, Building2, 
  HeartHandshake, Sparkles, AlertCircle
} from 'lucide-react';

export const DonationsPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  
  // Realtime settings state from CMS
  const [settings, setSettings] = useState<ChurchSettingsData>({});
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeChurchSettings((data) => {
      setSettings(data);
    });
    return () => unsub();
  }, []);

  // Merge CMS settings with defaults
  const pixConfig: PixConfig = {
    keyDisplay: settings.pixKey || CHURCH_INFO.pix.key || DEFAULT_PIX_CONFIG.keyDisplay,
    keyNormalized: settings.pixKeyNormalized || CHURCH_INFO.pix.keyNormalized || DEFAULT_PIX_CONFIG.keyNormalized,
    keyType: settings.pixKeyType || CHURCH_INFO.pix.keyType || DEFAULT_PIX_CONFIG.keyType,
    favoredName: settings.pixFavoredName || CHURCH_INFO.pix.favoredName || DEFAULT_PIX_CONFIG.favoredName,
    bankName: settings.pixBankName || CHURCH_INFO.pix.bankName || DEFAULT_PIX_CONFIG.bankName,
    city: settings.pixCity || CHURCH_INFO.pix.city || DEFAULT_PIX_CONFIG.city,
    agency: settings.pixAgency || CHURCH_INFO.pix.agency || '—',
    account: settings.pixAccount || CHURCH_INFO.pix.account || '—',
    status: settings.pixStatus || CHURCH_INFO.pix.status || 'ativo',
    txid: '***',
  };

  // Generate the official EMV BR Code (Pix Copia e Cola) payload string
  const pixPayload = generatePixPayload(pixConfig);

  // Generate QR code DataURL on the client from the actual Pix payload
  useEffect(() => {
    let isMounted = true;
    generateQrCodeDataUrl(pixPayload, 320).then((url) => {
      if (isMounted) {
        setQrCodeDataUrl(url);
      }
    }).catch(() => {
      if (isMounted) {
        setQrCodeDataUrl(CHURCH_INFO.pix.qrCodeUrl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [pixPayload]);

  const handleCopyKey = async (text: string) => {
    setCopyError(null);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-HTTPS or legacy browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar chave:', err);
      setCopyError('Não foi possível copiar a chave automaticamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      
      {/* HERO BANNER */}
      <section className="bg-white text-slate-900 py-16 lg:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-slate-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102bde]/10 text-[#102bde] text-xs font-black uppercase tracking-wider border border-[#102bde]/20 shadow-xs">
            <HeartHandshake className="w-4 h-4 text-[#102bde]" />
            <span>CONTRIBUIÇÃO BÍBLICA & VOLUNTÁRIA</span>
          </span>
          <h1 className="font-sans font-black text-4xl sm:text-6xl uppercase text-slate-900 tracking-tight">
            Faça uma doação
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Sua contribuição ajuda a Igreja Metodista Wesleyana a continuar servindo vidas e anunciando a Palavra de Deus.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* EXPLANATORY TEXT BOX */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#102bde]/10 border border-[#102bde]/20 text-[#102bde] flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-6 h-6 fill-[#102bde]/20" />
          </div>
          <h2 className="font-sans font-black text-2xl uppercase text-slate-900">
            Dízimos e Ofertas
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Através da sua generosidade mantemos a celebração dos cultos, as obras sociais em Cosmópolis, o pastoreio de famílias e a expansão de missões. A contribuição via <strong>Pix</strong> é prática, instantânea e sem taxas.
          </p>
        </div>

        {/* MAIN PIX CARD */}
        <div id="pix-section" className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#102bde]/5 rounded-bl-full pointer-events-none" />

          {/* SECTION HEADER */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PIX OFICIAL DE DOAÇÕES</span>
            </span>
            <h3 className="font-sans font-black text-2xl sm:text-3xl uppercase text-slate-900">
              Escaneie o QR Code Pix
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-lg mx-auto">
              Aponte a câmera do seu aplicativo bancário para o QR Code abaixo para realizar sua doação com valor livre.
            </p>
          </div>

          {/* QR CODE DISPLAY BOX */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-md group hover:border-[#102bde] transition-all">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code Pix - ${pixConfig.favoredName}`}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                />
              ) : (
                <div className="w-56 h-56 sm:w-64 sm:h-64 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold">
                  Gerando QR Code...
                </div>
              )}
              <div className="absolute -bottom-3.5 left-1/2 transform -translate-x-1/2 px-3.5 py-1 bg-[#102bde] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <QrCode className="w-3.5 h-3.5" />
                <span>QR CODE ESTÁTICO (VALOR LIVRE)</span>
              </div>
            </div>
            <p className="text-slate-400 text-[11px] font-medium text-center italic">
              O doador informa o valor desejado diretamente no aplicativo do seu banco.
            </p>
          </div>

          {/* OFFICIAL PIX DETAILS GRID */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6 font-sans">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#102bde]" />
                <span>Dados Oficiais da Conta de Doação</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                
                {/* Chave Pix Exibida */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Chave Pix ({pixConfig.keyType})
                  </span>
                  <span className="font-black text-slate-900 text-base sm:text-lg break-all block tracking-tight">
                    {pixConfig.keyDisplay}
                  </span>
                </div>

                {/* Nome do Recebedor */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Nome do Recebedor (Favorecido)
                  </span>
                  <span className="font-extrabold text-[#102bde] text-sm sm:text-base block">
                    {pixConfig.favoredName}
                  </span>
                </div>

                {/* Instituição Bancária */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Instituição Bancária
                  </span>
                  <span className="font-black text-slate-800 text-xs sm:text-sm block">
                    {pixConfig.bankName}
                  </span>
                </div>

                {/* Cidade & Status */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Cidade do Recebedor
                  </span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                    {pixConfig.city}
                  </span>
                </div>

              </div>
            </div>

            {/* ERROR NOTIFICATION IF COPY FAILS */}
            {copyError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{copyError}</span>
              </div>
            )}

            {/* SINGLE ACTION BUTTON: COPIAR CHAVE PIX */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleCopyKey(pixConfig.keyDisplay)}
                className={`w-full py-4 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md active:scale-98 ${
                  copiedKey
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#102bde] hover:bg-[#0d23b8] text-white'
                }`}
              >
                {copiedKey ? (
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

          {/* SECURITY NOTICE */}
          <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed font-medium">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-black uppercase text-amber-950 block mb-0.5">
                Validação de Segurança Antes da Confirmação:
              </strong>
              No aplicativo do seu banco, antes de digitar sua senha ou confirmar a transferência, certifique-se de que os dados do destinatário conferem com:
              <ul className="list-disc list-inside mt-1 space-y-0.5 font-bold text-amber-950">
                <li>Recebedor: <span className="text-[#102bde] font-black">{pixConfig.favoredName}</span></li>
                <li>Banco Destino: <span className="text-amber-950 font-black">{pixConfig.bankName}</span></li>
                <li>CNPJ: <span className="font-mono">{pixConfig.keyDisplay}</span></li>
              </ul>
              <p className="text-[11px] text-slate-500 mt-1 font-normal italic">
                Nota: O site não armazena cartões nem realiza cobranças diretamente. Todas as doações são concluídas diretamente no seu aplicativo bancário.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
