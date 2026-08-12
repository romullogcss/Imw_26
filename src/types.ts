export type PageId = 'home' | 'history' | 'ministries' | 'schedule' | 'sermons' | 'contact' | 'admin';

export interface Leader {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  verse?: string;
  email?: string;
  phone?: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Ministry {
  id: 'criancas' | 'pre-adolescentes' | 'adolescentes' | 'jovens' | 'homens' | 'mulheres' | 'melhor-idade';
  title: string;
  subtitle: string;
  ageRange: string;
  description: string;
  detailedDescription: string;
  meetingTime: string;
  meetingLocation: string;
  leaderName: string;
  leaderRole: string;
  leaderPhoto: string;
  leaderContact: string;
  themeColor: {
    badge: string;
    bgGradient: string;
    accent: string;
    border: string;
    text: string;
  };
  isPlayful?: boolean; // For Crianças
  gallery: {
    id: string;
    url: string;
    caption: string;
  }[];
  activities: string[];
}

export interface ScheduleItem {
  id: string;
  day: 'Domingo' | 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado';
  time: string;
  title: string;
  description: string;
  location: string;
  category: 'Culto' | 'Oração' | 'Estudo' | 'Reunião' | 'Jovens';
  isHighlight?: boolean;
}

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl: string;
  badge: string;
  isFeatured?: boolean;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  youtubeId: string;
  youtubeUrl: string;
  embedUrl?: string;
  duration: string;
  scripture: string;
  category: string;
  thumbnail: string;
  imageUrl?: string;
  imagePath?: string;
  summary?: string;
}

export interface ArticleOfFaith {
  number: string;
  title: string;
  text: string;
  verses: string;
}

export interface SpotifyTrack {
  id: string;
  title: string;
  preacherOrArtist: string;
  duration: string;
  spotifyUri: string;
}
