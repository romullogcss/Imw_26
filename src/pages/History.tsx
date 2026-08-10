import React, { useState } from 'react';
import { TIMELINE_ITEMS, PASTORS_AND_LEADERS, CHURCH_VISION, OFFICIAL_HISTORY, ARTICLES_OF_FAITH } from '../data/churchData';
import { 
  Flame, MapPin, Church, HeartHandshake, Users, 
  Target, Eye, BookOpen, Quote, ShieldCheck, Sparkles, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [showConstituentMembers, setShowConstituentMembers] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);

  const getTimelineIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-[#102bde]" />;
      case 'MapPin': return <MapPin className="w-5 h-5 text-[#102bde]" />;
      case 'Church': return <Church className="w-5 h-5 text-[#102bde]" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-[#102bde]" />;
      default: return <Users className="w-5 h-5 text-[#102bde]" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* LIGHT HERO BANNER */}
      <section className="bg-white text-slate-900 py-16 lg:py-24 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-slate-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#102bde] text-xs font-sans font-black uppercase tracking-widest block mb-2">
            LEGADO, DOUTRINA & VISÃO
          </span>
          <h1 className="font-sans font-black text-4xl sm:text-6xl uppercase text-slate-900 tracking-tight">
            NOSSA HISTÓRIA E FÉ
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-3xl mx-auto mt-3 font-medium leading-relaxed">
            A trajetória da Igreja Metodista Wesleyana, nossos princípios de fé e a visão de Deus para as nossas vidas e comunidades.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-20">

        {/* THREE-WORD VISION CALLOUT */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md text-center space-y-6">
          <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block">
            VISÃO EM TRÊS PALAVRAS
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {CHURCH_VISION.threeWords.map((word) => (
              <div 
                key={word}
                className="px-6 py-3 rounded-xl bg-slate-50 border border-[#102bde]/20 text-[#102bde] font-black text-xl sm:text-3xl uppercase tracking-wider shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-[#102bde]" />
                <span>{word}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed font-medium">
            Nossa vocação é viver em constante renovação espiritual, promover a unidade no corpo de Cristo e crescer de forma sustentável para alcançar vidas.
          </p>
        </section>

        {/* OFFICIAL FOUNDATION HISTORY */}
        <section className="bg-white rounded-2xl p-8 lg:p-12 border border-slate-200 shadow-md space-y-8">
          <div className="max-w-3xl">
            <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-1">
              ORIGEM HISTÓRICA & FUNDAÇÃO
            </span>
            <h2 className="font-sans font-black text-2xl sm:text-4xl uppercase text-slate-900 leading-tight">
              A HISTÓRIA DA IGREJA METODISTA WESLEYANA
            </h2>
          </div>

          {/* Narrative Blocks */}
          <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
            <p className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              Aos <strong className="text-[#102bde]">cinco dias do mês de janeiro de 1967</strong>, na cidade de <strong className="text-slate-900">Nova Friburgo, estado do Rio de Janeiro</strong>, foi fundada a Igreja Metodista Wesleyana, compondo-se inicialmente de ministros e leigos que cooperavam na Igreja Metodista do Brasil.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-sans font-black text-lg text-slate-900 uppercase flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#102bde]" />
                  <span>Doutrina & Fervor Pentecostal</span>
                </h3>
                <p>
                  Os motivos que deram origem ao desligamento, por ocasião do 11º Concílio Regional da Igreja Metodista do Brasil, basearam-se na doutrina do <strong className="text-slate-900">batismo com o Espírito Santo</strong> como uma segunda bênção para o crente, e na aceitação da obra pentecostal, incluindo os dons mencionados na Bíblia Sagrada:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#102bde] shrink-0" /> Sabedoria e Ciência</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#102bde] shrink-0" /> Fé e Dons de Curar</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#102bde] shrink-0" /> Operação de Maravilhas</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#102bde] shrink-0" /> Profecia e Discernimento</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#102bde] shrink-0" /> Línguas e Interpretação</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#102bde] shrink-0" /> Cânticos Espirituais & Visões</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-sans font-black text-lg text-slate-900 uppercase flex items-center gap-2">
                  <Church className="w-5 h-5 text-[#102bde]" />
                  <span>A &quot;Reunião da Ponte&quot; (1967)</span>
                </h3>
                <p>
                  Às 14 horas do dia 5 de janeiro de 1967, realizou-se a reunião que ficou conhecida historicamente como a <strong className="text-[#102bde] uppercase">&quot;Reunião da Ponte&quot;</strong>, por ter sido feita sobre uma ponte no pátio da Fundação Getulio Vargas, sob direção dos pastores <strong className="text-slate-900">Idelmício Cabral dos Santos</strong> e <strong className="text-slate-900">Waldemar Gomes de Figueiredo</strong>.
                </p>
                <p>
                  Nessa ocasião, foi definitivamente fundada a Igreja Metodista Wesleyana, aceitando a forma de governo centralizado com um Conselho-Geral, seguindo o sistema metodista.
                </p>
              </div>
            </div>

            {/* Key Councils Summary */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-sans font-black text-base text-[#102bde] uppercase">
                Primeiro Conselho-Geral Eleito (1967)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">Superintendente-Geral</span>
                  <span className="text-slate-900 font-black text-sm">Waldemar Gomes de Figueiredo</span>
                </div>
                <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">Secretário-Geral</span>
                  <span className="text-slate-900 font-black text-sm">Gessé Teixeira de Carvalho</span>
                </div>
                <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">Tesoureiro-Geral</span>
                  <span className="text-slate-900 font-black text-sm">Idelmício Cabral dos Santos</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 pt-2 font-medium">
                O Concílio Constituinte reuniu-se em Petrópolis dos dias 16 a 19 de fevereiro de 1967, consolidando os estatutos da igreja, elegendo a diretoria e preparando o <em>Manual da Igreja Metodista Wesleyana</em> publicado em 1968. Destaque histórico também ao <strong className="text-[#102bde] font-black">Bispo Gessé Teixeira de Carvalho</strong>.
              </p>
            </div>

            {/* Collapsible Lists for Historical Records */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => setShowAttendees(!showAttendees)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-sans font-black uppercase text-slate-800 transition-colors cursor-pointer"
              >
                <span>Presentes na Reunião da Ponte (13 Nomes)</span>
                {showAttendees ? <ChevronUp className="w-4 h-4 text-[#102bde]" /> : <ChevronDown className="w-4 h-4 text-[#102bde]" />}
              </button>

              <button
                onClick={() => setShowConstituentMembers(!showConstituentMembers)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-sans font-black uppercase text-slate-800 transition-colors cursor-pointer"
              >
                <span>Membros do Concílio Constituinte (42 Nomes)</span>
                {showConstituentMembers ? <ChevronUp className="w-4 h-4 text-[#102bde]" /> : <ChevronDown className="w-4 h-4 text-[#102bde]" />}
              </button>
            </div>

            {showAttendees && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-[#102bde] uppercase block mb-2">Pessoas presentes na Reunião da Ponte (05/01/1967):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-slate-700 font-medium">
                  {OFFICIAL_HISTORY.attendeesBridgeMeeting.map((name, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#102bde]" />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showConstituentMembers && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-[#102bde] uppercase block mb-2">Membros Registrados no Concílio Constituinte (Petrópolis/RJ):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-slate-700 font-medium">
                  {OFFICIAL_HISTORY.constituentMembers.map((name, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#102bde]" />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Wesley Quote Box */}
          <div className="bg-slate-100 text-slate-800 p-6 sm:p-8 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start gap-4">
            <Quote className="w-8 h-8 text-[#102bde] shrink-0 opacity-80" />
            <div>
              <p className="italic text-base sm:text-lg leading-relaxed text-slate-900 font-semibold">
                &quot;O mundo é a minha paróquia. Olho para todo o mundo como a minha paróquia; em qualquer parte dele em que me encontre, julgo conveniente, correto e meu dever declarar a todos que estiverem dispostos a ouvir, as boas novas da salvação.&quot;
              </p>
              <p className="text-xs font-sans font-black text-[#102bde] uppercase tracking-widest mt-2">
                — JOHN WESLEY (FUNDADOR DO METODISMO)
              </p>
            </div>
          </div>
        </section>

        {/* VISION & EXPANDED VISION SECTION */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-1">
              NOSSA DECLARAÇÃO DE VISÃO
            </span>
            <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase text-slate-900">
              VISÃO E PROPÓSITO
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-4">
              <div className="w-12 h-12 rounded bg-[#102bde]/10 border border-[#102bde]/20 text-[#102bde] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-black text-xl uppercase text-slate-900">Visão da Igreja</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                {CHURCH_VISION.coreVision}
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-4">
              <div className="w-12 h-12 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-black text-xl uppercase text-slate-900">Visão Ampliada</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                {CHURCH_VISION.expandedVision}
              </p>
            </div>
          </div>
        </section>

        {/* ARTICLES OF FAITH - EM QUE CREMOS */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-1">
              DECLARAÇÃO DOUTRINÁRIA
            </span>
            <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase text-slate-900">
              EM QUE CREMOS
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">
              Os 16 Artigos de Fé da Igreja Metodista Wesleyana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ARTICLES_OF_FAITH.map((article) => (
              <div 
                key={article.number}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:border-[#102bde] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded bg-[#102bde] text-white font-black text-xs uppercase tracking-wider">
                      ARTIGO {article.number}
                    </span>
                    <ShieldCheck className="w-5 h-5 text-[#102bde]" />
                  </div>
                  <h3 className="font-sans font-black text-lg uppercase text-slate-900">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                    {article.text}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-[#102bde] uppercase tracking-wider">
                  Referências: {article.verses}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VISUAL TIMELINE */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-1">
              MARCOS EM COSMÓPOLIS & BRASIL
            </span>
            <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase text-slate-900">
              LINHA DO TEMPO
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
              Os passos do Senhor na construção da nossa congregação.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />

            <div className="space-y-8 lg:space-y-12">
              {TIMELINE_ITEMS.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div 
                    key={item.year}
                    className={`flex flex-col lg:flex-row items-center ${
                      isEven ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                    <div className="w-full lg:w-1/2 p-2 sm:p-4">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:border-[#102bde] transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded bg-[#102bde] text-white font-black text-sm uppercase">
                            {item.year}
                          </span>
                          <h3 className="font-sans font-black text-lg uppercase text-slate-900">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="relative my-2 lg:my-0 flex items-center justify-center w-12 h-12 rounded-full bg-white border-4 border-slate-200 text-[#102bde] shadow-md shrink-0 z-10">
                      {getTimelineIcon(item.iconName)}
                    </div>

                    <div className="w-full lg:w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* LOCAL LEADERSHIP SECTION */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-1">
              CORPO PASTORAL LOCAL
            </span>
            <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase text-slate-900">
              LIDERANÇA EM COSMÓPOLIS
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
              Servindo a igreja e a cidade com integridade e sabedoria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PASTORS_AND_LEADERS.map((leader) => (
              <div 
                key={leader.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:border-[#102bde] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img
                      src={leader.photoUrl}
                      alt={leader.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="px-3 py-1 rounded bg-[#102bde] text-white text-[10px] font-black uppercase tracking-wider">
                        {leader.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-sans font-black text-xl uppercase text-slate-900">
                      {leader.name}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                      {leader.bio}
                    </p>
                  </div>
                </div>

                {leader.verse && (
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs italic text-[#102bde] font-semibold">
                    &quot;{leader.verse}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
