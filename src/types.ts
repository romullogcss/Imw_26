export type PageId = 'home' | 'history' | 'ministries' | 'schedule' | 'district-events' | 'regional-events' | 'sermons' | 'contact' | 'donations' | 'admin' | 'event-detail';

export type EventType = 'local' | 'distrital' | 'regional';

export interface Leader {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  verse?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Ministry {
  id: string;
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

export type RegistrationType = 'none' | 'simple' | 'retreat';

export interface ChurchEvent {
  id: string;
  slug?: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  description: string;
  imageUrl: string;
  badge: string;
  eventType?: EventType;
  isFeatured?: boolean;
  enableRegistration?: boolean;
  registrationType?: RegistrationType;
  registrationDeadline?: string;
  registrationLimit?: number;
  registrationMessage?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  registrationType?: RegistrationType;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  status?: 'confirmed' | 'cancelled';
  createdAt: string;

  // Campos Avançados para Retiro Espiritual
  birthDate?: string;
  documentId?: string; // RG ou CPF
  gender?: string;
  city?: string;

  // Saúde e Cuidados
  hasAllergies?: boolean;
  allergiesDetails?: string;
  hasMedications?: boolean;
  medicationsDetails?: string;
  healthConditions?: string;
  hasDietaryRestrictions?: boolean;
  dietaryDetails?: string;
  medicalNotes?: string;

  // Contato de Emergência
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactPhoneAlt?: string;

  // Menor de Idade & Responsável Legal
  isMinor?: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianDocument?: string;
  guardianAuthorization?: boolean;
  emergencyMedicalConsent?: boolean;

  // Consentimentos Obrigatórios
  truthfulInfoConsent?: boolean;
  termsConsent?: boolean;
  emergencyContactConsent?: boolean;
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
  createdAt?: string;
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

export interface PrayerRequest {
  id: string;
  name?: string;
  phone?: string;
  category: string;
  requestText: string;
  isConfidential?: boolean;
  status: 'pending' | 'prayed' | 'archived';
  createdAt: string;
}

export type UserRole = 'admin' | 'media' | 'intercession';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  full_name?: string;
  invitedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardInvite {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  invitedBy?: string | null;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt?: string;
  status: 'pending' | 'accepted' | 'expired';
}

export interface DistrictInfo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  purpose: string;
  bannerUrl?: string;
  updatedAt?: string;
}

export interface DistrictCongregation {
  id: string;
  name: string;
  city: string;
  slug?: string;
  pastorName: string;
  address: string;
  whatsapp: string;
  googleMapsEmbedUrl?: string;
  socialType?: 'facebook' | 'instagram' | 'youtube';
  socialUrl?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

