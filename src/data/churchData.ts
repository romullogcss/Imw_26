import { Leader, TimelineItem, Ministry, ScheduleItem, ChurchEvent, Sermon, SpotifyTrack, ArticleOfFaith } from '../types';

export const CHURCH_VISION = {
  threeWords: ['Unidade', 'Crescimento', 'Avivamento'],
  coreVision: 'Ser uma igreja unida, vivendo em avivamento para impactar, crescer e alcançar vidas para Deus. Compartilhar o evangelho, implantar igrejas, espalhar a santidade bíblica, capacitar a liderança e viver a unidade.',
  expandedVision: 'Ser uma Região que impacte o Brasil e o mundo através de Igrejas locais saudáveis e influenciadoras, bem como de líderes clérigos e leigos, fiéis, capazes e capacitadores, com corações curados, motivados e abrasados pelo poder do Espírito Santo e a Palavra de Deus, orando e vivendo a santidade bíblica e implantando igrejas em localidades não alcançadas como também compartilhando o evangelho genuíno dentro e fora do templo, usando os meios de comunicação acessíveis.'
};

export const OFFICIAL_HISTORY = {
  foundationDate: '5 de Janeiro de 1967',
  location: 'Nova Friburgo, Estado do Rio de Janeiro',
  bridgeMeetingName: 'Reunião da Ponte',
  directors: ['Pr. Idelmício Cabral dos Santos', 'Pr. Waldemar Gomes de Figueiredo'],
  firstCouncil: {
    superintendenteGeral: 'Waldemar Gomes de Figueiredo',
    secretarioGeral: 'Gessé Teixeira de Carvalho',
    tesoureiroGeral: 'Idelmício Cabral dos Santos'
  },
  bispoDestaque: 'Bispo Gessé Teixeira de Carvalho',
  attendeesBridgeMeeting: [
    'Idelmício Cabral dos Santos',
    'Waldemar Gomes de Figueiredo',
    'José Moreira da Silva',
    'Francisco Teodoro Batista',
    'Gessé Teixeira de Carvalho',
    'Córo da Silva Pereira',
    'José Mendes da Silva',
    'Zeny da Silva Pereira',
    'Dinah Batista Rubim',
    'Ariosto Mendes',
    'Wilson da Silva Mendes',
    'Jacir Vieira',
    'Antônio Faleiro Sobrinho'
  ],
  constituentMembers: [
    'Alice Nely dos Santos', 'Antônio Faleiro Sobrinho', 'Azet Gerd', 'Clarice Alves Pacheco',
    'Córo da Silva Pereira', 'Daniel Pedro de Paula', 'Derly Neves', 'Dílson Pereira Leal',
    'Dinah Batista Rubim', 'Ezequiel Luiz da Costa', 'Francisco Teodoro Batista', 'Geraldo Vieira',
    'Gessé Teixeira de Carvalho', 'Gessy dos Santos', 'Helenice Bastos', 'Idelmício Cabral dos Santos',
    'Isaías da Silva Costa', 'Jair Magalhães', 'Jedidad Hilda da Costa', 'Jeremias Gomes de Araújo',
    'João Coelho Duarte', 'Joaquim R. Penha', 'José Barreto de Macedo', 'José Gonçalves',
    'José M. Galhardo', 'José Marques Pereira', 'José Mendes da Silva', 'José Moreira da Silva',
    'José Tertuliano Pacheco', 'Letreci Teodoro', 'Nacir Neves da Costa', 'Nilson de Paula Carneiro',
    'Octavio Faustino dos Santos', 'Onaldo Rodrigues Pereira', 'Oriele Soares do Nascimento',
    'Pedro Moraes Filho', 'Sebastião Alves Moreira', 'Sebastião Moreira da Silva',
    'Tobias Fernandes dos Santos', 'Waldemar Gomes de Figueiredo', 'Wilson R. Damasceno', 'Wilson Varjão'
  ]
};

export const ARTICLES_OF_FAITH: ArticleOfFaith[] = [
  {
    number: 'I',
    title: 'Deus Vivo e Verdadeiro',
    text: 'Há um só Deus vivo e verdadeiro, soberano, eterno, de infinito poder e sabedoria, criador e conservador de todas as coisas visíveis e invisíveis; que na unidade de Sua divindade há três pessoas de uma só substância, de existência eterna, igual em santidade, justiça, sabedoria, poder e dignidade: o Pai, o Filho e o Espírito Santo.',
    verses: 'Ex 20.2-3; Sl 143.13; Mt 28.19-20; Lc 3.22; Tg 1.17.'
  },
  {
    number: 'II',
    title: 'A Encarnação do Filho de Deus',
    text: 'O Filho, que é a Palavra do Pai, encarnou-se no ventre da virgem Maria, tomando a natureza humana, reunindo assim duas naturezas inteiras e perfeitas: a divina e a humana, para ser conhecido como verdadeiro Deus e verdadeiro homem que sofreu, foi crucificado, morto e sepultado, reconciliando-nos assim com o Pai, fazendo expiação dos nossos pecados.',
    verses: 'Lc 1.35; Jo 3.31; Cl 1.15-20; Hb 4.15.'
  },
  {
    number: 'III',
    title: 'A Expiação e Remissão dos Pecados',
    text: 'Jesus Cristo foi crucificado, morto e sepultado, verteu seu sangue para remissão dos pecados e regeneração dos pecadores arrependidos.',
    verses: 'Rm 5.9; Hb 9.14.'
  },
  {
    number: 'IV',
    title: 'Ressurreição e Segunda Vinda Gloriosa',
    text: 'Cristo verdadeiramente ressuscitou dentre os mortos em seu corpo, glorificado, com todas as características da natureza humana, e subiu ao céu, assentou-se à destra do Pai, de onde há de vir para julgar os vivos e os mortos.',
    verses: 'At 2.32-36; 2Tm 4.1; 1 Jo 3.2.'
  },
  {
    number: 'V',
    title: 'O Espírito Santo',
    text: 'O Espírito Santo, que proceeds do Pai e do Filho, Verdadeiro e eterno Deus.',
    verses: 'Mt 28.19; 2 Co 13.13.'
  },
  {
    number: 'VI',
    title: 'A Bíblia Sagrada',
    text: 'A Bíblia que é a Palavra de Deus, foi escrita por homens divinamente inspirados. Ela é o padrão único e infalível pelo qual a conduta humana e as opiniões devem ser Julgadas.',
    verses: '2 Tm 3.16; 2 Pe 1.19-21.'
  },
  {
    number: 'VII',
    title: 'A Justificação pela Fé',
    text: 'A justificação se realiza somente pela fé em Jesus Cristo.',
    verses: 'Rm 3.28; Ef 2.8.'
  },
  {
    number: 'VIII',
    title: 'A Santificação',
    text: 'A santificação do salvo é uma operação realizada pelo Espírito Santo, adquirida pela fé. A santificação é obra da livre graça de Deus por meio da qual morremos para o pecado e vivemos para a justiça.',
    verses: '1 Ts 4.3; 1 Pe 1.15-16.'
  },
  {
    number: 'IX',
    title: 'O Batismo com o Espírito Santo',
    text: 'O batismo com o Espírito Santo, ato da graça de Deus, é uma experiência de revestimento de poder recebida pela fé para testemunho do evangelho de nosso Senhor Jesus Cristo. Como real evidência do batismo, manifestam-se as línguas estranhas.',
    verses: 'Lc 3.16; 24.49; At 1.8; 2.5-13; 10.44-46.'
  },
  {
    number: 'X',
    title: 'Cura Divina e Milagres',
    text: 'A cura divina, os milagres, são para nossos dias também como partes integrantes da obra expiatória de Cristo.',
    verses: 'Mc 16.17-18; Tg 5.15.'
  },
  {
    number: 'XI',
    title: 'O Batismo Bíblico',
    text: 'O batismo bíblico é a imersão do crente em água, em nome do Pai, do Filho e do Espírito Santo, não como meio de salvação, mas como testemunho da mesma.',
    verses: 'Jo 3.23; Rm 6.3-4; Cl 2.12; 1Pe 3.21.'
  },
  {
    number: 'XII',
    title: 'A Ceia do Senhor',
    text: 'A Ceia do Senhor é uma festa espiritual, através da qual os salvos pelo uso do pão comum e do vinho, lembram juntos a morte de Cristo e perpetuam o sentido de sua morte até que Ele venha.',
    verses: '1 Co 10.16; 11.23-26.'
  },
  {
    number: 'XIII',
    title: 'Dízimos e Ofertas',
    text: 'Os planos de Deus para o sustento de sua obra são: os dízimos e as ofertas. O dízimo é anterior à lei mosaica, na qual foi cumprido e exigido; e permanece como princípio neo-testamentário.',
    verses: 'Ml 3.8-10; Mt 23.23; 2Co 9.5-7.'
  },
  {
    number: 'XIV',
    title: 'A Igreja Visível de Cristo',
    text: 'A Igreja visível de Cristo é uma congregação de crentes batizados, unidos uns aos outros na fé e na comunhão do Evangelho, observando os mandamentos de Cristo, governados por suas leis, exercendo os dons concedidos pelo Espírito Santo.',
    verses: 'Mt 18.17; 1 Co 14.33; Ef 5.23.'
  },
  {
    number: 'XV',
    title: 'A Segunda Vinda de Cristo',
    text: 'A segunda vinda de Cristo será repentina, pessoal e pré-milenial. Nós amamos a Sua vinda e O esperamos, dizendo: "Ora vem Senhor Jesus".',
    verses: 'Mt 24.27-36; 1Ts 4.16-17; Ap 22.20.'
  },
  {
    number: 'XVI',
    title: 'O Destino Eterno',
    text: 'No Céu haverá galardão para os santos e bem-aventurados por toda eternidade, e haverá punição infindável para os ímpios no lago de fogo.',
    verses: 'Mt 25.46; 2 Co 5.10; Fl 3.20; 1Pe 1.4; Ap 22.12.'
  }
];

export const CHURCH_INFO = {
  name: 'Igreja Metodista Wesleyana de Cosmópolis',
  shortName: 'IMW Cosmópolis',
  logoUrl: '/imw-logo.svg',
  motto: 'Uma igreja viva para um Deus vivo',
  verseText: 'Porque onde estiverem dois ou três reunidos em meu nome, ali estou eu no meio deles.',
  verseReference: 'Mateus 18:20',
  address: {
    street: 'R. Marcelo Lugli, 1457',
    neighborhood: 'Jardim Planalto',
    city: 'Cosmópolis',
    state: 'SP',
    zipCode: '13150-000',
    fullAddress: 'R. Marcelo Lugli, 1457 - Jardim Planalto, Cosmópolis - SP',
  },
  contacts: {
    phone: '(19) 3872-1234',
    whatsapp: '5519998765432',
    whatsappFormatted: '(19) 99876-5432',
    email: 'contato@imwcosmopolis.com.br',
    secretaryHours: 'Terça a Sexta: 09h às 17h | Sábado: 09h às 12h',
  },
  socials: {
    instagram: 'https://www.instagram.com/imwcosmopolis/',
    facebook: 'https://www.facebook.com/imwcosmopolis',
    youtube: 'https://www.youtube.com/imwcosmopolis',
    spotify: 'https://open.spotify.com/show/0axmDAHLlBF1rDWvhMkrUA?si=8af466b30f7c44a9',
  },
  pix: {
    key: '13.823.676/0028-47',
    keyNormalized: '13823676002847',
    keyType: 'CNPJ',
    favoredName: 'IMW 3 R Cosmopolis',
    cnpj: '13.823.676/0028-47',
    bankName: 'Santander',
    city: 'Cosmopolis',
    agency: '—',
    account: '—',
    status: 'ativo',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020126360014br.gov.bcb.pix0114138236760028475204000053039865802BR5918IMW%203%20R%20Cosmopolis6010Cosmopolis62070503***630456FB',
    payloadCopiaCola: '00020126360014br.gov.bcb.pix0114138236760028475204000053039865802BR5918IMW 3 R Cosmopolis6010Cosmopolis62070503***630456FB',
  },
};

export const PASTORS_AND_LEADERS: Leader[] = [
  {
    id: 'pastor-titular',
    name: 'Pr. Gessivaldo & Miss. Eugênia',
    role: 'Pastores da IMW Cosmópolis',
    bio: 'À frente da IMW Cosmópolis, o Pr. Gessivaldo e a Miss. Eugênia dedicam-se ao ensino da Palavra, ao pastoreio das famílias, ao acolhimento e ao fortalecimento do compromisso missionário e distrital da igreja.',
    photoUrl: '/foto-pastor-gessivaldo-e-missionaria-eugenia.png',
    verse: 'Combati o bom combate, acabei a carreira, guardei a fé. (2 Timóteo 4:7)',
    email: 'gessivaldo@imwcosmopolis.com.br',
    isActive: true,
    sortOrder: 1,
  },
];

export const TIMELINE_ITEMS: TimelineItem[] = [
  {
    year: '1967',
    title: 'Fundação da IMW no Brasil',
    description: 'A Igreja Metodista Wesleyana nasce no Rio de Janeiro com a missão de renovação espiritual e fervor evangelístico fundamentado no legado wesleyano.',
    iconName: 'Flame',
  },
  {
    year: '1998',
    title: 'Chegada em Cosmópolis',
    description: 'Primeira reunião de oração nos lares e fundação do ponto de pregação no centro da cidade de Cosmópolis/SP.',
    iconName: 'MapPin',
  },
  {
    year: '2008',
    title: 'Dedicação do Novo Templo',
    description: 'Inauguração da sede própria na R. Marcelo Lugli, 1457 - Jardim Planalto, com capacidade para acolher confortavelmente as famílias cosmopolenses.',
    iconName: 'Church',
  },
  {
    year: '2018',
    title: 'Expansão dos Ministérios & Ação Social',
    description: 'Estruturação completa dos 7 ministérios da igreja e implementação dos projetos sociais com crianças e famílias da região.',
    iconName: 'HeartHandshake',
  },
  {
    year: 'Presente',
    title: 'Comunidade Viva & Relevante',
    description: 'Uma igreja acolhedora, vibrante na adoração, forte no ensino e comprometida em transformar Cosmópolis pelo amor do Evangelho.',
    iconName: 'Users',
  },
];

export const MINISTRIES_DATA: Ministry[] = [
  {
    id: 'criancas',
    title: 'Ministério de Crianças',
    subtitle: 'Pequenos Wesleyanos',
    ageRange: '0 a 9 anos',
    description: 'Espaço lúdico, colorido e acolhedor onde as crianças aprendem os caminhos do Senhor através de histórias bíblicas, brincadeiras e muito afeto.',
    detailedDescription: 'O Ministério Infantil "Pequenos Wesleyanos" tem a missão de cultivar a semente da Palavra nos corações das nossas crianças. Contamos com salas equipadas, material pedagógico cristão de excelência, teatros, cânticos vibrantes e voluntários capacitados e apaixonados pelo ensino infantil.',
    meetingTime: 'Domingos às 09h00 (EBD Kids) e 18h00 (Culto Infantil)',
    meetingLocation: 'Espaço Kids / Templo Anexo',
    leaderName: 'Pra. Ana Maria Silva & Equipe Tia Carol',
    leaderRole: 'Coordenadora Geral do Ministério Infantil',
    leaderPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    isPlayful: true,
    themeColor: {
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      bgGradient: 'from-amber-500 via-orange-400 to-yellow-500',
      accent: 'amber',
      border: 'border-amber-400',
      text: 'text-amber-600',
    },
    activities: [
      'Escolinha Bíblica Dominical interativa',
      'Teatrinho dos Fantoches & Musicalização',
      'EBF (Escola Bíblica de Férias) anual',
      'Apoio ao desenvolvimento socioemocional cristão',
    ],
    gallery: [
      {
        id: 'c1',
        url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&q=80&w=800',
        caption: 'Crianças louvando no Culto Infantil',
      },
      {
        id: 'c2',
        url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800',
        caption: 'Oficina de artes e histórias bíblicas',
      },
      {
        id: 'c3',
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
        caption: 'Momento de oração com as crianças',
      },
    ],
  },
  {
    id: 'pre-adolescentes',
    title: 'Pré-Adolescentes',
    subtitle: 'Geração Conectada',
    ageRange: '10 a 12 anos',
    description: 'Uma fase de transição marcante guiada com mentoria, amizades saudáveis e estudos práticos sobre identidade em Cristo.',
    detailedDescription: 'Entendemos os desafios da pré-adolescência. Nosso objetivo é ajudar os garotos e garotas a construírem uma base espiritual sólida antes da juventude, tratando de temas como virtudes, amizades, redes sociais e amor pela Bíblia.',
    meetingTime: 'Domingos às 09h00 e Sábados às 17h00 (Quinzenal)',
    meetingLocation: 'Sala Multimídia 2',
    leaderName: 'Diácono Tiago & Beatriz Mendes',
    leaderRole: 'Líderes de Pré-Adolescentes',
    leaderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    themeColor: {
      badge: 'bg-teal-100 text-teal-800 border-teal-300',
      bgGradient: 'from-teal-600 to-emerald-700',
      accent: 'teal',
      border: 'border-teal-400',
      text: 'text-teal-700',
    },
    activities: [
      'Círculo de bate-papo e mentoria',
      'Atividades esportivas e acampamentos',
      'Desafios de leitura bíblica diária',
    ],
    gallery: [
      {
        id: 'pa1',
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
        caption: 'Encontro dinâmico e integração',
      },
      {
        id: 'pa2',
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
        caption: 'Momento de comunhão ao ar livre',
      },
    ],
  },
  {
    id: 'adolescentes',
    title: 'Adolescentes',
    subtitle: 'Teens IMW',
    ageRange: '13 a 17 anos',
    description: 'Garotada engajada, dinâmica e sem vergonha do Evangelho! Reuniões animadas, adoração sincera e apoio mútuo.',
    detailedDescription: 'O Teens IMW busca formar adolescentes apaixonados por Deus e prontos para testemunhar na escola, na família e no mundo. Oferecemos um ambiente seguro e empolgante para crescer em fé e caráter.',
    meetingTime: 'Sábados às 17h30',
    meetingLocation: 'Templo Principal / Sala Teens',
    leaderName: 'Lucas & Gabriel Vasconcelos',
    leaderRole: 'Líderes Teens IMW',
    leaderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    themeColor: {
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      bgGradient: 'from-indigo-700 to-blue-800',
      accent: 'indigo',
      border: 'border-indigo-400',
      text: 'text-indigo-700',
    },
    activities: [
      'Cultos Teens animados com banda própria',
      'Retiros espirituais e gincanas',
      'Grupos de oração e estudos temáticos',
    ],
    gallery: [
      {
        id: 'a1',
        url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
        caption: 'Louvor e adoração com a banda Teens',
      },
      {
        id: 'a2',
        url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
        caption: 'Roda de conversa sobre propósito e vocação',
      },
    ],
  },
  {
    id: 'jovens',
    title: 'Jovens',
    subtitle: 'Mocidade Wesleyana',
    ageRange: '18 a 30 anos',
    description: 'Juventude forte, fundamentada na palavra e atuante na sociedade, no trabalho e nos estudos universários.',
    detailedDescription: 'A Mocidade Wesleyana de Cosmópolis reúne jovens que buscam viver o Evangelho de maneira autêntica e relevante. Nossos encontros combinam adoração contemporânea, mensagens profundas para a vida adulta e projetos de serviço na comunidade.',
    meetingTime: 'Sábados às 19h30 (Culto de Jovens)',
    meetingLocation: 'Templo Principal',
    leaderName: 'Diácono Lucas & Mariana Santos',
    leaderRole: 'Líderes de Juventude',
    leaderPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    themeColor: {
      badge: 'bg-blue-100 text-blue-900 border-blue-300',
      bgGradient: 'from-blue-900 via-indigo-900 to-slate-900',
      accent: 'blue',
      border: 'border-blue-500',
      text: 'text-blue-800',
    },
    activities: [
      'Cultos de Jovens semanais',
      'Células nos lares e universidades',
      'Conferências de Juventude',
      'Viagens missionárias de curto prazo',
    ],
    gallery: [
      {
        id: 'j1',
        url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800',
        caption: 'Culto da Mocidade no sábado à noite',
      },
      {
        id: 'j2',
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
        caption: 'Célula e comunhão dos Jovens',
      },
    ],
  },
  {
    id: 'homens',
    title: 'Homens',
    subtitle: 'Homens de Honra',
    ageRange: 'Homens de todas as idades',
    description: 'Fortalecendo homens para serem líderes espirituais exemplares em seus lar, trabalho e igreja.',
    detailedDescription: 'O Ministério de Homens promove a fraternidade, a responsabilidade cristã e a oração entre os homens da igreja. Através de cafés da manhã, vigílias e mentoria, incentivamos o crescimento do caráter e liderança bíblica.',
    meetingTime: '1º e 3º Sábado do mês às 07h30 (Café com Oração)',
    meetingLocation: 'Salão Social da Igreja',
    leaderName: 'Presbítero Roberto Alves',
    leaderRole: 'Líder do Ministério de Homens',
    leaderPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    themeColor: {
      badge: 'bg-slate-200 text-slate-800 border-slate-400',
      bgGradient: 'from-slate-800 to-slate-950',
      accent: 'slate',
      border: 'border-slate-500',
      text: 'text-slate-800',
    },
    activities: [
      'Café da manhã com oração e palavra',
      'Mentoria para pais e esposos',
      'Ações práticas de manutenção e apoio comunitário',
    ],
    gallery: [
      {
        id: 'h1',
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
        caption: 'Encontro de homens e oração',
      },
      {
        id: 'h2',
        url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=800',
        caption: 'Café de comunhão dos Homens de Honra',
      },
    ],
  },
  {
    id: 'mulheres',
    title: 'Mulheres',
    subtitle: 'Mulheres Virtuosas',
    ageRange: 'Mulheres de todas as idades',
    description: 'União, oração e edificação mútua para mulheres que desejam florescer em sabedoria e fé.',
    detailedDescription: 'O Ministério de Mulheres é um espaço de cura, renovação e aprendizado sobre o papel da mulher cristã na família, na igreja e na sociedade. Nossas reuniões abordam espiritualidade, saúde emocional e relacionamentos.',
    meetingTime: 'Toda 2ª Quinta-feira do mês às 19h30 (Chá das Mulheres)',
    meetingLocation: 'Salão Social',
    leaderName: 'Pra. Ana Maria Silva',
    leaderRole: 'Líder do Ministério de Mulheres',
    leaderPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    themeColor: {
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      bgGradient: 'from-rose-700 via-pink-800 to-purple-900',
      accent: 'rose',
      border: 'border-rose-400',
      text: 'text-rose-700',
    },
    activities: [
      'Chá com Palavra e Oração',
      'Congressos e Encontros de Mulheres',
      'Círculo de oração por famílias',
    ],
    gallery: [
      {
        id: 'm1',
        url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
        caption: 'Encontro especial de Mulheres Virtuosas',
      },
      {
        id: 'm2',
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
        caption: 'Chá com oração e acolhimento',
      },
    ],
  },
  {
    id: 'melhor-idade',
    title: 'Melhor Idade',
    subtitle: 'Geração Caleb / Ouro',
    ageRange: 'A partir de 60 anos',
    description: 'Acolhimento amoroso, valorização da experiência e comunhão abençoada para os idosos da nossa igreja.',
    detailedDescription: 'Valorizamos profundamente a sabedoria dos nossos idosos. O Ministério da Melhor Idade promove passeios, momentos de oração, confraternizações e atividades que mantêm nossos anciãos ativos e felizes no Senhor.',
    meetingTime: 'Quartas-feiras às 15h00',
    meetingLocation: 'Sala de Acolhimento',
    leaderName: 'Diaconisa Helena & Irmão Benedito',
    leaderRole: 'Líderes da Melhor Idade',
    leaderPhoto: 'https://images.unsplash.com/photo-1581579438747-1dc8d1e292c9?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    themeColor: {
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      bgGradient: 'from-amber-700 via-amber-800 to-yellow-900',
      accent: 'amber',
      border: 'border-amber-400',
      text: 'text-amber-800',
    },
    activities: [
      'Tarde de comunhão e louvores tradicionais',
      'Passeios comunitários e piqueniques',
      'Grupos de oração e apoio espiritual',
    ],
    gallery: [
      {
        id: 'mi1',
        url: 'https://images.unsplash.com/photo-1581579438747-1dc8d1e292c9?auto=format&fit=crop&q=80&w=800',
        caption: 'Reunião alegre da Melhor Idade',
      },
      {
        id: 'mi2',
        url: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&q=80&w=800',
        caption: 'Comunhão e momentos de gratidão',
      },
    ],
  },
  {
    id: 'louvor',
    title: 'Louvor & Adoração',
    subtitle: 'Equipe de Adoração',
    ageRange: 'Músicos e Vocais',
    description: 'Conduzindo a congregação à presença do Senhor através da música, artes e adoração com excelência.',
    detailedDescription: 'O Ministério de Louvor tem como missão conduzir os cultos em profunda adoração, preparando arranjos, ensaios técnicos e alinhamento espiritual para servir à igreja em todos os encontros.',
    meetingTime: 'Quintas às 20h30 e Domingos às 17h00 (Ensaios)',
    meetingLocation: 'Templo Principal',
    leaderName: 'Diácono Lucas & Equipe de Música',
    leaderRole: 'Líder do Ministério de Louvor',
    leaderPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    themeColor: {
      badge: 'bg-purple-100 text-purple-900 border-purple-300',
      bgGradient: 'from-purple-800 to-indigo-950',
      accent: 'purple',
      border: 'border-purple-400',
      text: 'text-purple-800',
    },
    activities: [
      'Ensaios de instrumental e vocal',
      'Escala de cultos e eventos especiais',
      'Discipulado para novos instrumentistas',
    ],
    gallery: [
      {
        id: 'l1',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
        caption: 'Adoração ao vivo no culto de domingo',
      },
    ],
  },
  {
    id: 'intercessao',
    title: 'Intercessão & Oração',
    subtitle: 'Guerreiros de Oração',
    ageRange: 'Todos os membros',
    description: 'Sustentando a igreja, as famílias e os líderes em constante oração e clamor ao Senhor.',
    detailedDescription: 'O Ministério de Intercessão atua como coluna espiritual da igreja, mantendo relógios de oração, atendendo pedidos da comunidade e clamando pelo avivamento em Cosmópolis.',
    meetingTime: 'Terças às 19h00 e Domingos às 17h30',
    meetingLocation: 'Sala de Oração / Templo',
    leaderName: 'Presbítero Roberto Alves',
    leaderRole: 'Coordenador de Intercessão',
    leaderPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    themeColor: {
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      bgGradient: 'from-emerald-800 to-slate-950',
      accent: 'emerald',
      border: 'border-emerald-400',
      text: 'text-emerald-800',
    },
    activities: [
      'Relógio de oração e vigílias',
      'Atendimento aos pedidos de oração do site',
      'Clamor semanal pelas famílias e líderes',
    ],
    gallery: [
      {
        id: 'i1',
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
        caption: 'Momento de oração congregacional',
      },
    ],
  },
  {
    id: 'outros',
    title: 'Outros Ministérios & Ação Social',
    subtitle: 'Serviço & Diaconia',
    ageRange: 'Toda a comunidade',
    description: 'Grupos de apoio, acolhimento, mídia, recepção, e ação social servindo a igreja e a cidade.',
    detailedDescription: 'Engloba a equipe de Recepção, Diaconia, Mídia & Comunicação, Ação Social e Manutenção. Cada voluntário coloca seus talentos à disposição para o bom andamento da casa de Deus.',
    meetingTime: 'Atividades semanais e escalas',
    meetingLocation: 'Diversos espaços da igreja',
    leaderName: 'Equipe de Diaconia e Serviços',
    leaderRole: 'Coordenação Geral de Serviços',
    leaderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    leaderContact: '(19) 99876-5432',
    themeColor: {
      badge: 'bg-blue-100 text-blue-900 border-blue-300',
      bgGradient: 'from-blue-800 to-slate-900',
      accent: 'blue',
      border: 'border-blue-400',
      text: 'text-blue-800',
    },
    activities: [
      'Acolhimento e recepção aos visitantes',
      'Transmissão ao vivo e equipe de som',
      'Arrecadação e doação de mantimentos',
    ],
    gallery: [
      {
        id: 'o1',
        url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=800',
        caption: 'Equipe de recepção e acolhimento',
      },
    ],
  },
];

export interface EventHeaderConfig {
  scope: 'local' | 'distrital' | 'regional';
  title: string;
  badge: string;
  description: string;
  backgroundImageUrl: string;
}

export const EVENT_HEADER_CONFIGS: Record<'local' | 'distrital' | 'regional', EventHeaderConfig> = {
  local: {
    scope: 'local',
    title: 'EVENTOS LOCAIS',
    badge: 'IMW COSMÓPOLIS • PROGRAMAÇÃO DA SEDE',
    description: 'Acompanhe a agenda, cultos presenciais, encontros e celebrações da nossa igreja local. Venha celebrar e se edificar conosco!',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1510519138161-58441065e711?auto=format&fit=crop&q=80&w=1600',
  },
  distrital: {
    scope: 'distrital',
    title: 'EVENTOS DISTRITAIS',
    badge: 'DISTRITO CAMPINAS',
    description: 'Acompanhe a agenda, encontros, retiros e conferências organizados pelo nosso Distrito de Campinas. Fortalecendo a unidade e a comunhão das igrejas da nossa região.',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1600',
  },
  regional: {
    scope: 'regional',
    title: 'EVENTOS REGIONAIS',
    badge: '3ª REGIÃO ECLESIÁSTICA',
    description: 'Acompanhe os congressos, convenções e retiros promovidos pela 3ª Região Eclesiástica da Igreja Metodista Wesleyana.',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1600',
  },
};

export const WEEKLY_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch-1',
    day: 'Domingo',
    time: '09:00',
    title: 'Escola Bíblica Dominical (EBD)',
    description: 'Estudo expositivo e aprofundado das Escrituras para todas as idades (Crianças, Jovens e Adultos).',
    location: 'Templo Principal',
    category: 'Estudo',
    isHighlight: false,
  },
  {
    id: 'sch-2',
    day: 'Domingo',
    time: '18:00',
    title: 'Culto de Celebração & Família',
    description: 'Culto principal da igreja com louvor congregacional, adoração, sermão expositivo e comunhão.',
    location: 'Templo Principal',
    category: 'Culto',
    isHighlight: true,
  },
  {
    id: 'sch-6',
    day: 'Segunda-feira',
    time: '08:00',
    title: 'Intercessão & Oração',
    description: 'Momento dedicado à intercessão pelas famílias, igreja e causas de oração.',
    location: 'Templo Principal',
    category: 'Oração',
    isHighlight: false,
  },
  {
    id: 'sch-3',
    day: 'Terça-feira',
    time: '19:30',
    title: 'Culto de Oração & Clamor',
    description: 'Momento dedicado à oração intercessória, clamor pelas famílias, causas de saúde e edificação.',
    location: 'Templo Principal',
    category: 'Oração',
    isHighlight: false,
  },
  {
    id: 'sch-7',
    day: 'Quarta-feira',
    time: '08:00',
    title: 'Intercessão & Oração',
    description: 'Momento matutino de oração e consagração.',
    location: 'Templo Principal',
    category: 'Oração',
    isHighlight: false,
  },
  {
    id: 'sch-4',
    day: 'Quinta-feira',
    time: '19:30',
    title: 'Culto de Doutrina & Vitória',
    description: 'Estudo sistemático da palavra de Deus, fortalecimento da fé e princípios cristãos para o dia a dia.',
    location: 'Templo Principal',
    category: 'Culto',
    isHighlight: false,
  },
  {
    id: 'sch-8',
    day: 'Sexta-feira',
    time: '19:00',
    title: 'GCEU - Grupo de Crescimento',
    description: 'Reunião nos lares para estudo bíblico, comunhão e fortalecimento espiritual.',
    location: 'Nos Lares',
    category: 'Estudo',
    isHighlight: false,
  },
  {
    id: 'sch-5',
    day: 'Sábado',
    time: '19:30',
    title: 'Culto da Juventude (Mocidade IMW)',
    description: 'Encontro vibrante de jovens e adolescentes com louvor dinâmico, palavra transformadora e comunhão.',
    location: 'Templo Principal',
    category: 'Jovens',
    isHighlight: false,
  },
];

export const SPECIAL_EVENTS: ChurchEvent[] = [
  {
    id: 'evt-1',
    slug: 'conferencia-de-avivamento-2026',
    title: 'Conferência de Avivamento 2026',
    date: '2026-11-15',
    time: '19:30',
    location: 'Templo Principal - IMW Cosmópolis',
    description: 'Dias intensos de louvor, adoração profética e ministração da Palavra de Deus para renovação espiritual de toda a igreja e famílias.',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
    badge: 'CONFERÊNCIA',
    eventType: 'local',
    isFeatured: true,
    enableRegistration: true,
    registrationType: 'simple',
    registrationLimit: 250,
  },
  {
    id: 'evt-2',
    slug: 'retiro-espiritual-de-carnaval',
    title: 'Retiro Espiritual de Carnaval',
    date: '2026-02-28',
    endDate: '2026-03-03',
    time: '08:00',
    location: 'Sítio Recanto da Paz - Artur Nogueira / SP',
    description: 'Um fim de semana inesquecível de imersão espiritual, comunhão profunda, oficinas para jovens e famílias, lazer e buscarmos a presença do Senhor.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200',
    badge: 'RETIRO',
    eventType: 'local',
    isFeatured: true,
    enableRegistration: true,
    registrationType: 'retreat',
    registrationLimit: 120,
    registrationDeadline: '2026-02-20',
  },
  {
    id: 'evt-3',
    slug: 'noite-de-louvor-e-adoracao',
    title: 'Noite de Louvor & Adoração',
    date: '2026-09-20',
    time: '19:00',
    location: 'Templo Principal - IMW Cosmópolis',
    description: 'Uma noite especial dedicada exclusivamente ao louvor congregacional, adoração extravagante e oração comunitária.',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
    badge: 'LOUVOR',
    eventType: 'local',
    isFeatured: false,
    enableRegistration: false,
    registrationType: 'none',
  },
  {
    id: 'evt-dist-1',
    slug: 'encontro-distrital-de-mulheres-2026',
    title: 'Encontro Distrital de Mulheres 2026',
    date: '2026-10-10',
    time: '14:00',
    location: 'IMW Sede do Distrito - Campinas / SP',
    description: 'Grande ajuntamento de mulheres de todas as igrejas do Distrito Wesleyano para ministrações, louvor e edificação espiritual.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200',
    badge: 'DISTRITAL',
    eventType: 'distrital',
    isFeatured: true,
    enableRegistration: true,
    registrationType: 'simple',
    registrationLimit: 300,
  },
  {
    id: 'evt-reg-1',
    slug: 'congresso-regional-de-casais-2026',
    title: 'Congresso Regional de Casais',
    date: '2026-12-04',
    endDate: '2026-12-06',
    time: '18:00',
    location: 'Centro de Convenções Wesleyano - Região Eclesiástica',
    description: 'Congresso anual da Região Eclesiástica reunindo casais para momentos de fortalecimento matrimonial, oficinas e renovo na presença de Deus.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    badge: 'REGIONAL',
    eventType: 'regional',
    isFeatured: true,
    enableRegistration: true,
    registrationType: 'retreat',
    registrationLimit: 500,
  },
];

export const SERMONS_YOUTUBE: Sermon[] = [];

export const SPOTIFY_PLAYLIST = {
  embedUrl: 'https://open.spotify.com/embed/show/0axmDAHLlBF1rDWvhMkrUA?utm_source=generator&theme=0',
  spotifyUrl: 'https://open.spotify.com/show/0axmDAHLlBF1rDWvhMkrUA?si=8af466b30f7c44a9',
  playlistTitle: 'Podcast Oficial IMW Cosmópolis',
  tracks: [
    {
      id: 'sp-1',
      title: 'A Relevância da Graça Preveniente na Prática',
      preacherOrArtist: 'Pr. Gessivaldo - Podcast IMW',
      duration: '38:12',
      spotifyUri: 'spotify:episode:1',
    },
    {
      id: 'sp-2',
      title: 'Restaurando o Altar da Família',
      preacherOrArtist: 'Pra. Ana Maria - Mensagem em Áudio',
      duration: '41:05',
      spotifyUri: 'spotify:episode:2',
    },
    {
      id: 'sp-3',
      title: 'Louvores da Celebração de Domingo (Ao Vivo)',
      preacherOrArtist: 'Ministério de Louvor IMW Cosmópolis',
      duration: '52:40',
      spotifyUri: 'spotify:episode:3',
    },
  ] as SpotifyTrack[],
};
