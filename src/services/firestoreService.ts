import { supabase } from '../lib/supabase';
import { ScheduleItem, ChurchEvent, EventRegistration, Sermon, Ministry, PrayerRequest, UserProfile, DashboardInvite, UserRole } from '../types';
import { WEEKLY_SCHEDULE, SPECIAL_EVENTS, SERMONS_YOUTUBE, MINISTRIES_DATA } from '../data/churchData';
import { 
  extractYoutubeId, 
  getYoutubeEmbedUrl, 
  getYoutubeWatchUrl, 
  getYoutubeThumbnailUrl 
} from '../utils/youtube';

export { extractYoutubeId };

// -------------------------------------------------------------
// HELPER MAPPERS (CAMELCASE <-> SNAKE_CASE COMPATIBILITY)
// -------------------------------------------------------------

function mapSchedule(row: any): ScheduleItem {
  return {
    id: String(row.id),
    day: row.day,
    time: row.time,
    title: row.title,
    description: row.description || '',
    location: row.location || '',
    category: row.category,
    isHighlight: row.is_highlight ?? row.isHighlight ?? false,
  };
}

function mapScheduleToDbPayload(data: Partial<ScheduleItem>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (data.id !== undefined) payload.id = data.id;
  if (data.day !== undefined) payload.day = data.day;
  if (data.time !== undefined) payload.time = data.time;
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.location !== undefined) payload.location = data.location;
  if (data.category !== undefined) payload.category = data.category;
  if (data.isHighlight !== undefined) payload.is_highlight = data.isHighlight;
  return payload;
}

function getLocalEventConfigs(): Record<string, Partial<ChurchEvent>> {
  try {
    const raw = localStorage.getItem('imw_event_configs');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalEventConfig(eventId: string, config: Partial<ChurchEvent>) {
  try {
    const all = getLocalEventConfigs();
    all[eventId] = {
      ...(all[eventId] || {}),
      enableRegistration: config.enableRegistration,
      registrationDeadline: config.registrationDeadline,
      registrationLimit: config.registrationLimit,
      registrationMessage: config.registrationMessage,
    };
    localStorage.setItem('imw_event_configs', JSON.stringify(all));
  } catch (err) {
    console.warn('[LocalEventConfig] Erro ao salvar:', err);
  }
}

function mapEvent(row: any): ChurchEvent {
  const localConfigs = getLocalEventConfigs();
  const localCfg = localConfigs[String(row.id)] || {};

  return {
    id: String(row.id),
    title: row.title,
    date: row.date,
    time: row.time,
    location: row.location,
    description: row.description,
    imageUrl: row.image_url || row.imageUrl || '',
    badge: row.badge || '',
    isFeatured: row.is_featured ?? row.isFeatured ?? false,
    enableRegistration: row.enable_registration ?? row.enableRegistration ?? localCfg.enableRegistration ?? false,
    registrationDeadline: row.registration_deadline ?? row.registrationDeadline ?? localCfg.registrationDeadline ?? '',
    registrationLimit: row.registration_limit !== undefined && row.registration_limit !== null
      ? Number(row.registration_limit)
      : (row.registrationLimit !== undefined ? Number(row.registrationLimit) : localCfg.registrationLimit),
    registrationMessage: row.registration_message ?? row.registrationMessage ?? localCfg.registrationMessage ?? '',
  };
}

function mapEventToDbPayload(data: Partial<ChurchEvent>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (data.id !== undefined) payload.id = data.id;
  if (data.title !== undefined) payload.title = data.title;
  if (data.date !== undefined) payload.date = data.date;
  if (data.time !== undefined) payload.time = data.time;
  if (data.location !== undefined) payload.location = data.location;
  if (data.description !== undefined) payload.description = data.description;
  if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
  if (data.badge !== undefined) payload.badge = data.badge;
  if (data.isFeatured !== undefined) payload.is_featured = data.isFeatured;
  if (data.enableRegistration !== undefined) payload.enable_registration = data.enableRegistration;
  if (data.registrationDeadline !== undefined) payload.registration_deadline = data.registrationDeadline;
  if (data.registrationLimit !== undefined) payload.registration_limit = data.registrationLimit;
  if (data.registrationMessage !== undefined) payload.registration_message = data.registrationMessage;
  return payload;
}

const PORTUGUESE_MONTHS: Record<string, number> = {
  jan: 0, janeiro: 0,
  fev: 1, fevereiro: 1,
  mar: 2, marco: 2, março: 2,
  abr: 3, abril: 3,
  mai: 4, maio: 4,
  jun: 5, junho: 5,
  jul: 6, julho: 6,
  ago: 7, agosto: 7,
  set: 8, setembro: 8,
  out: 9, outubro: 9,
  nov: 10, novembro: 10,
  dez: 11, dezembro: 11,
};

export function parseSermonDate(dateStr?: string, fallbackDateStr?: string): number {
  if (!dateStr || !dateStr.trim()) {
    if (fallbackDateStr) {
      const fb = Date.parse(fallbackDateStr);
      if (!isNaN(fb)) return fb;
    }
    return 0;
  }

  const str = dateStr.trim().toLowerCase();

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) return parsed;
  }

  const brMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    let year = parseInt(brMatch[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  const ptMatch = str.match(/^(\d{1,2})\s+(?:de\s+)?([a-zçáéíóúãõ]+)(?:\s+de|\s*,)?\s+(\d{4})/i);
  if (ptMatch) {
    const day = parseInt(ptMatch[1], 10);
    const monthName = ptMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const year = parseInt(ptMatch[3], 10);
    const month = PORTUGUESE_MONTHS[monthName];
    if (month !== undefined) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }

  const standard = Date.parse(str);
  if (!isNaN(standard)) return standard;

  if (fallbackDateStr) {
    const fb = Date.parse(fallbackDateStr);
    if (!isNaN(fb)) return fb;
  }

  return 0;
}

export function sortSermonsByDateDesc(a: Sermon, b: Sermon): number {
  const timeA = parseSermonDate(a.date, a.createdAt);
  const timeB = parseSermonDate(b.date, b.createdAt);

  if (timeB !== timeA) {
    return timeB - timeA;
  }

  const createdA = a.createdAt ? Date.parse(a.createdAt) : 0;
  const createdB = b.createdAt ? Date.parse(b.createdAt) : 0;
  if (createdB !== createdA) {
    return createdB - createdA;
  }

  return b.id.localeCompare(a.id);
}

function mapSermon(row: any): Sermon {
  const ytId = extractYoutubeId(row.youtube_url || row.youtubeUrl || row.youtube_id || row.youtubeId || '') || '';
  const embedUrl = row.embed_url || row.embedUrl || (ytId ? getYoutubeEmbedUrl(ytId) : '');
  const watchUrl = row.youtube_url || row.youtubeUrl || (ytId ? getYoutubeWatchUrl(ytId) : '');
  const thumbnail = row.thumbnail || row.image_url || row.imageUrl || (ytId ? getYoutubeThumbnailUrl(ytId) : '');
  const imageUrl = row.image_url || row.imageUrl || thumbnail;
  const imagePath = row.image_path || row.imagePath || '';

  return {
    id: String(row.id),
    title: row.title || '',
    preacher: row.preacher || '',
    date: row.date || '',
    youtubeId: ytId || row.youtube_id || row.youtubeId || '',
    youtubeUrl: watchUrl || row.youtube_url || row.youtubeUrl || '',
    embedUrl: embedUrl,
    duration: row.duration || '',
    scripture: row.scripture || '',
    category: row.category || '',
    thumbnail: thumbnail,
    imageUrl: imageUrl,
    imagePath: imagePath,
    summary: row.summary || '',
    createdAt: row.created_at || row.createdAt || '',
  };
}

function mapSermonToDbPayload(data: Partial<Sermon>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (data.id !== undefined) payload.id = data.id;
  if (data.title !== undefined) payload.title = data.title;
  if (data.preacher !== undefined) payload.preacher = data.preacher;
  if (data.date !== undefined) payload.date = data.date;
  if (data.duration !== undefined) payload.duration = data.duration;
  if (data.scripture !== undefined) payload.scripture = data.scripture;
  if (data.category !== undefined) payload.category = data.category;
  if (data.summary !== undefined) payload.summary = data.summary;

  if (data.youtubeUrl || data.youtubeId) {
    const ytId = extractYoutubeId(data.youtubeUrl || data.youtubeId || '') || '';
    payload.youtube_id = ytId;
    payload.embed_url = getYoutubeEmbedUrl(ytId);
    payload.youtube_url = data.youtubeUrl || getYoutubeWatchUrl(ytId);
    if (!data.thumbnail && !data.imageUrl) {
      payload.thumbnail = getYoutubeThumbnailUrl(ytId);
      payload.image_url = payload.thumbnail;
    }
  }

  if (data.thumbnail !== undefined) payload.thumbnail = data.thumbnail;
  if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
  if (data.imagePath !== undefined) payload.image_path = data.imagePath;

  return payload;
}

function mapMinistry(row: any): Ministry {
  return {
    id: row.id,
    title: row.title || '',
    subtitle: row.subtitle || '',
    ageRange: row.age_range || row.ageRange || '',
    description: row.description || '',
    detailedDescription: row.detailed_description || row.detailedDescription || '',
    meetingTime: row.meeting_time || row.meetingTime || '',
    meetingLocation: row.meeting_location || row.meetingLocation || '',
    leaderName: row.leader_name || row.leaderName || '',
    leaderRole: row.leader_role || row.leaderRole || '',
    leaderPhoto: row.leader_photo || row.leaderPhoto || '',
    leaderContact: row.leader_contact || row.leaderContact || '',
    themeColor: row.theme_color || row.themeColor || {
      badge: 'bg-blue-100 text-[#102bde]',
      bgGradient: 'from-blue-50/50 to-indigo-50/50',
      accent: 'text-[#102bde]',
      border: 'border-blue-200',
      text: 'text-slate-800'
    },
    isPlayful: row.is_playful ?? row.isPlayful ?? false,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    activities: Array.isArray(row.activities) ? row.activities : [],
  };
}

function mapMinistryToDbPayload(data: Record<string, any>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (data.id !== undefined) payload.id = data.id;
  if (data.title !== undefined) payload.title = data.title;
  if (data.subtitle !== undefined) payload.subtitle = data.subtitle;

  if (data.ageRange !== undefined || data.age_range !== undefined) {
    payload.age_range = data.ageRange ?? data.age_range ?? '';
  }
  if (data.description !== undefined) payload.description = data.description;
  if (data.detailedDescription !== undefined || data.detailed_description !== undefined) {
    payload.detailed_description = data.detailedDescription ?? data.detailed_description ?? '';
  }
  if (data.meetingTime !== undefined || data.meeting_time !== undefined) {
    payload.meeting_time = data.meetingTime ?? data.meeting_time ?? '';
  }
  if (data.meetingLocation !== undefined || data.meeting_location !== undefined) {
    payload.meeting_location = data.meetingLocation ?? data.meeting_location ?? '';
  }
  if (data.leaderName !== undefined || data.leader_name !== undefined) {
    payload.leader_name = data.leaderName ?? data.leader_name ?? '';
  }
  if (data.leaderRole !== undefined || data.leader_role !== undefined) {
    payload.leader_role = data.leaderRole ?? data.leader_role ?? '';
  }
  if (data.leaderPhoto !== undefined || data.leader_photo !== undefined) {
    payload.leader_photo = data.leaderPhoto ?? data.leader_photo ?? '';
  }
  if (data.leaderContact !== undefined || data.leader_contact !== undefined) {
    payload.leader_contact = data.leaderContact ?? data.leader_contact ?? '';
  }
  if (data.themeColor !== undefined || data.theme_color !== undefined) {
    payload.theme_color = data.themeColor ?? data.theme_color;
  }
  if (data.isPlayful !== undefined || data.is_playful !== undefined) {
    payload.is_playful = data.isPlayful ?? data.is_playful ?? false;
  }
  if (data.gallery !== undefined) payload.gallery = data.gallery;
  if (data.activities !== undefined) payload.activities = data.activities;
  return payload;
}

export interface ChurchSettingsData {
  logoUrl?: string;
  spotifyUrl?: string;
  spotifyEmbedUrl?: string;
  updatedAt?: any;
}

function mapSettings(row: any): ChurchSettingsData {
  if (!row) return {};
  return {
    logoUrl: row.logo_url || row.logoUrl || '',
    spotifyUrl: row.spotify_url || row.spotifyUrl || '',
    spotifyEmbedUrl: row.spotify_embed_url || row.spotifyEmbedUrl || '',
    updatedAt: row.updated_at || row.updatedAt || null,
  };
}

// -------------------------------------------------------------
// SCHEDULES
// -------------------------------------------------------------

const scheduleListeners = new Set<(items: ScheduleItem[]) => void>();
let schedulesChannel: any = null;

async function fetchAndNotifySchedules() {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('id', { ascending: true });

    let items: ScheduleItem[] = [];
    if (error) {
      console.warn('[Supabase] Aviso ao buscar schedules:', error.message);
      items = WEEKLY_SCHEDULE;
    } else if (data && data.length > 0) {
      items = data.map(mapSchedule);
    } else {
      items = [];
    }

    scheduleListeners.forEach((cb) => cb(items));
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar schedules:', err);
    scheduleListeners.forEach((cb) => cb(WEEKLY_SCHEDULE));
  }
}

function initSchedulesRealtime() {
  if (!schedulesChannel) {
    schedulesChannel = supabase
      .channel('public:schedules')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => {
        fetchAndNotifySchedules();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Canal public:schedules conectado com sucesso.');
        }
      });
  }
}

export function subscribeSchedules(callback: (items: ScheduleItem[]) => void) {
  scheduleListeners.add(callback);
  fetchAndNotifySchedules();
  initSchedulesRealtime();

  return () => {
    scheduleListeners.delete(callback);
    if (scheduleListeners.size === 0 && schedulesChannel) {
      supabase.removeChannel(schedulesChannel);
      schedulesChannel = null;
    }
  };
}

export async function addSchedule(data: Omit<ScheduleItem, 'id'>) {
  const newId = `sched_${Date.now()}`;
  const payload = mapScheduleToDbPayload(data);
  payload.id = newId;
  payload.created_at = new Date().toISOString();
  payload.updated_at = new Date().toISOString();

  const { data: inserted, error } = await supabase
    .from('schedules')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[Supabase] Erro ao adicionar horário:', error);
    throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
  }

  fetchAndNotifySchedules();
  return inserted ? mapSchedule(inserted) : { id: newId, ...data };
}

export async function updateSchedule(id: string, data: Partial<ScheduleItem>) {
  const payload = mapScheduleToDbPayload(data);
  payload.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('schedules')
    .update(payload)
    .eq('id', id)
    .select('*');

  if (error) {
    console.error('[Supabase] Erro ao atualizar horário:', error);
    throw new Error(`Erro ao atualizar no Supabase: ${error.message}`);
  }

  fetchAndNotifySchedules();
  return updated;
}

export async function deleteSchedule(id: string) {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Erro ao excluir horário:', error);
    throw new Error(`Erro ao excluir no Supabase: ${error.message}`);
  }

  fetchAndNotifySchedules();
  return true;
}

// -------------------------------------------------------------
// EVENTS
// -------------------------------------------------------------

const eventListeners = new Set<(items: ChurchEvent[]) => void>();
let eventsChannel: any = null;

async function fetchAndNotifyEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');

    let items: ChurchEvent[] = [];
    if (error) {
      console.warn('[Supabase] Aviso ao buscar events:', error.message);
      items = SPECIAL_EVENTS;
    } else if (data && data.length > 0) {
      items = data.map(mapEvent);
    } else {
      items = [];
    }

    eventListeners.forEach((cb) => cb(items));
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar events:', err);
    eventListeners.forEach((cb) => cb(SPECIAL_EVENTS));
  }
}

function initEventsRealtime() {
  if (!eventsChannel) {
    eventsChannel = supabase
      .channel('public:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchAndNotifyEvents();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Canal public:events conectado com sucesso.');
        }
      });
  }
}

export function subscribeEvents(callback: (items: ChurchEvent[]) => void) {
  eventListeners.add(callback);
  fetchAndNotifyEvents();
  initEventsRealtime();

  return () => {
    eventListeners.delete(callback);
    if (eventListeners.size === 0 && eventsChannel) {
      supabase.removeChannel(eventsChannel);
      eventsChannel = null;
    }
  };
}

export async function addEvent(data: Omit<ChurchEvent, 'id'>) {
  const newId = `evt_${Date.now()}`;
  saveLocalEventConfig(newId, data);

  const payload = mapEventToDbPayload(data);
  payload.id = newId;
  payload.created_at = new Date().toISOString();
  payload.updated_at = new Date().toISOString();

  let { data: inserted, error } = await supabase
    .from('events')
    .insert(payload)
    .select('*')
    .single();

  if (error && error.message.includes('schema cache')) {
    delete payload.enable_registration;
    delete payload.registration_deadline;
    delete payload.registration_limit;
    delete payload.registration_message;

    const retry = await supabase
      .from('events')
      .insert(payload)
      .select('*')
      .single();
    inserted = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('[Supabase] Erro ao adicionar evento:', error);
    throw new Error(`Erro ao salvar evento no Supabase: ${error.message}`);
  }

  fetchAndNotifyEvents();
  return inserted ? mapEvent(inserted) : { id: newId, ...data };
}

export async function updateEvent(id: string, data: Partial<ChurchEvent>) {
  saveLocalEventConfig(id, data);

  const payload = mapEventToDbPayload(data);
  payload.updated_at = new Date().toISOString();

  let { data: updated, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select('*');

  if (error && error.message.includes('schema cache')) {
    delete payload.enable_registration;
    delete payload.registration_deadline;
    delete payload.registration_limit;
    delete payload.registration_message;

    const retry = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
      .select('*');
    updated = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('[Supabase] Erro ao atualizar evento:', error);
    throw new Error(`Erro ao atualizar evento no Supabase: ${error.message}`);
  }

  fetchAndNotifyEvents();
  return updated;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Erro ao excluir evento:', error);
    throw new Error(`Erro ao excluir evento no Supabase: ${error.message}`);
  }

  fetchAndNotifyEvents();
  return true;
}

// -------------------------------------------------------------
// EVENT REGISTRATIONS
// -------------------------------------------------------------

const registrationListeners = new Set<(items: EventRegistration[]) => void>();
let registrationsChannel: any = null;

const REGISTRATIONS_LOCAL_KEY = 'imw_event_registrations';

function getLocalRegistrations(): EventRegistration[] {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRegistrations(items: EventRegistration[]) {
  try {
    localStorage.setItem(REGISTRATIONS_LOCAL_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[LocalRegistrations] Erro ao salvar:', err);
  }
}

function mapEventRegistration(row: any): EventRegistration {
  return {
    id: String(row.id),
    eventId: String(row.event_id || row.eventId),
    fullName: row.full_name || row.fullName || '',
    email: row.email || '',
    phone: row.phone || '',
    notes: row.notes || '',
    status: row.status || 'confirmed',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

async function fetchAndNotifyRegistrations() {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    let items: EventRegistration[] = [];
    if (error) {
      items = getLocalRegistrations();
    } else if (data) {
      items = data.map(mapEventRegistration);
      const localItems = getLocalRegistrations();
      const dbIds = new Set(items.map((i) => i.id));
      const unsynced = localItems.filter((i) => !dbIds.has(i.id));
      if (unsynced.length > 0) {
        items = [...unsynced, ...items];
      }
    } else {
      items = getLocalRegistrations();
    }

    saveLocalRegistrations(items);
    registrationListeners.forEach((cb) => cb(items));
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar event_registrations:', err);
    const localItems = getLocalRegistrations();
    registrationListeners.forEach((cb) => cb(localItems));
  }
}

function initRegistrationsRealtime() {
  if (!registrationsChannel) {
    registrationsChannel = supabase
      .channel('public:event_registrations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => {
        fetchAndNotifyRegistrations();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Canal public:event_registrations conectado com sucesso.');
        }
      });
  }
}

export function subscribeEventRegistrations(callback: (items: EventRegistration[]) => void) {
  registrationListeners.add(callback);
  fetchAndNotifyRegistrations();
  initRegistrationsRealtime();

  return () => {
    registrationListeners.delete(callback);
    if (registrationListeners.size === 0 && registrationsChannel) {
      supabase.removeChannel(registrationsChannel);
      registrationsChannel = null;
    }
  };
}

export async function addEventRegistration(
  event: ChurchEvent,
  data: { fullName: string; email: string; phone: string; notes?: string }
): Promise<EventRegistration> {
  // 1. Check enableRegistration
  if (!event.enableRegistration) {
    throw new Error('As inscrições para este evento não estão ativadas.');
  }

  // 2. Check deadline
  if (event.registrationDeadline && event.registrationDeadline.trim()) {
    const deadlineDate = new Date(event.registrationDeadline);
    if (!isNaN(deadlineDate.getTime()) && new Date() > deadlineDate) {
      throw new Error('O prazo de inscrição para este evento já se encerrou.');
    }
  }

  // Fetch current registrations
  let currentRegs: EventRegistration[] = [];
  try {
    const { data: dbData } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', event.id);
    if (dbData && dbData.length > 0) {
      currentRegs = dbData.map(mapEventRegistration);
    } else {
      currentRegs = getLocalRegistrations().filter((r) => r.eventId === event.id);
    }
  } catch {
    currentRegs = getLocalRegistrations().filter((r) => r.eventId === event.id);
  }

  // 3. Check limit
  if (event.registrationLimit && event.registrationLimit > 0) {
    const activeCount = currentRegs.filter((r) => r.status !== 'cancelled').length;
    if (activeCount >= event.registrationLimit) {
      throw new Error('As vagas para este evento já estão esgotadas!');
    }
  }

  // 4. Check duplicate email for same event
  const cleanEmail = data.email.trim().toLowerCase();
  const existing = currentRegs.find(
    (r) => r.email.trim().toLowerCase() === cleanEmail && r.status !== 'cancelled'
  );
  if (existing) {
    throw new Error('Este e-mail já está inscrito neste evento.');
  }

  const newId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newReg: EventRegistration = {
    id: newId,
    eventId: event.id,
    fullName: data.fullName.trim(),
    email: cleanEmail,
    phone: data.phone.trim(),
    notes: data.notes?.trim() || '',
    status: 'confirmed',
    createdAt: now,
  };

  const localItems = getLocalRegistrations();
  saveLocalRegistrations([newReg, ...localItems]);

  try {
    const payload = {
      id: newId,
      event_id: event.id,
      full_name: newReg.fullName,
      email: newReg.email,
      phone: newReg.phone,
      notes: newReg.notes,
      status: 'confirmed',
      created_at: now,
    };

    const { error } = await supabase.from('event_registrations').insert([payload]);
    if (error) {
      console.warn('[Supabase] Aviso ao inserir em event_registrations:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao inserir em event_registrations:', err);
  }

  fetchAndNotifyRegistrations();
  return newReg;
}

export async function deleteEventRegistration(id: string): Promise<void> {
  const localItems = getLocalRegistrations().filter((r) => r.id !== id);
  saveLocalRegistrations(localItems);

  try {
    const { error } = await supabase.from('event_registrations').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase] Aviso ao deletar de event_registrations:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao deletar de event_registrations:', err);
  }

  fetchAndNotifyRegistrations();
}

// -------------------------------------------------------------
// SERMONS
// -------------------------------------------------------------

const sermonListeners = new Set<(items: Sermon[]) => void>();
let sermonsChannel: any = null;

async function fetchAndNotifySermons() {
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('created_at', { ascending: false });

    let items: Sermon[] = [];
    if (error) {
      console.warn('[Supabase] Aviso ao buscar sermons:', error.message);
      items = [...SERMONS_YOUTUBE].sort(sortSermonsByDateDesc);
    } else if (data && data.length > 0) {
      items = data.map(mapSermon).sort(sortSermonsByDateDesc);
    } else {
      items = [];
    }

    sermonListeners.forEach((cb) => cb(items));
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar sermons:', err);
    sermonListeners.forEach((cb) => cb([...SERMONS_YOUTUBE].sort(sortSermonsByDateDesc)));
  }
}

function initSermonsRealtime() {
  if (!sermonsChannel) {
    sermonsChannel = supabase
      .channel('public:sermons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sermons' }, () => {
        fetchAndNotifySermons();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Canal public:sermons conectado com sucesso.');
        }
      });
  }
}

export function subscribeSermons(callback: (items: Sermon[]) => void) {
  sermonListeners.add(callback);
  fetchAndNotifySermons();
  initSermonsRealtime();

  return () => {
    sermonListeners.delete(callback);
    if (sermonListeners.size === 0 && sermonsChannel) {
      supabase.removeChannel(sermonsChannel);
      sermonsChannel = null;
    }
  };
}

export async function addSermon(data: Omit<Sermon, 'id'>) {
  const newId = `sermon_${Date.now()}`;
  const payload = mapSermonToDbPayload(data);
  payload.id = newId;
  payload.created_at = new Date().toISOString();
  payload.updated_at = new Date().toISOString();

  const { data: inserted, error } = await supabase
    .from('sermons')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[Supabase] Erro ao adicionar pregação:', error);
    throw new Error(`Erro ao salvar pregação no Supabase: ${error.message}`);
  }

  fetchAndNotifySermons();
  return inserted ? mapSermon(inserted) : { id: newId, ...data };
}

export async function updateSermon(id: string, data: Partial<Sermon>) {
  const payload = mapSermonToDbPayload(data);
  payload.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('sermons')
    .update(payload)
    .eq('id', id)
    .select('*');

  if (error) {
    console.error('[Supabase] Erro ao atualizar pregação:', error);
    throw new Error(`Erro ao atualizar pregação no Supabase: ${error.message}`);
  }

  fetchAndNotifySermons();
  return updated;
}

export async function deleteSermon(id: string) {
  const { error } = await supabase
    .from('sermons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Erro ao excluir pregação:', error);
    throw new Error(`Erro ao excluir pregação no Supabase: ${error.message}`);
  }

  fetchAndNotifySermons();
  return true;
}

// -------------------------------------------------------------
// MINISTRIES
// -------------------------------------------------------------

const ministryListeners = new Set<(items: Ministry[]) => void>();
let ministriesChannel: any = null;

async function fetchAndNotifyMinistries() {
  try {
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .order('title', { ascending: true });

    let items: Ministry[] = [];
    if (error) {
      console.warn('[Supabase] Aviso ao buscar ministries:', error.message);
      items = MINISTRIES_DATA.map(mapMinistry).sort((a, b) =>
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
      );
    } else if (data && data.length > 0) {
      items = data
        .map(mapMinistry)
        .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));
    } else {
      items = [];
    }

    ministryListeners.forEach((cb) => cb(items));
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar ministries:', err);
    const fallback = MINISTRIES_DATA.map(mapMinistry).sort((a, b) =>
      a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
    );
    ministryListeners.forEach((cb) => cb(fallback));
  }
}

function initMinistriesRealtime() {
  if (!ministriesChannel) {
    ministriesChannel = supabase
      .channel('public:ministries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ministries' }, () => {
        fetchAndNotifyMinistries();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Canal public:ministries conectado com sucesso.');
        }
      });
  }
}

export function subscribeMinistries(callback: (items: Ministry[]) => void) {
  ministryListeners.add(callback);
  fetchAndNotifyMinistries();
  initMinistriesRealtime();

  return () => {
    ministryListeners.delete(callback);
    if (ministryListeners.size === 0 && ministriesChannel) {
      supabase.removeChannel(ministriesChannel);
      ministriesChannel = null;
    }
  };
}

export async function addMinistry(data: Omit<Ministry, 'id'> & { id?: string }) {
  const ministryId = data.id || `m_${Date.now()}`;
  const payload = mapMinistryToDbPayload(data);
  payload.id = ministryId;
  payload.created_at = new Date().toISOString();
  payload.updated_at = new Date().toISOString();

  const { data: inserted, error } = await supabase
    .from('ministries')
    .upsert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[Supabase] Erro ao adicionar/atualizar ministério:', error);
    throw new Error(`Erro ao salvar ministério no Supabase: ${error.message}`);
  }

  fetchAndNotifyMinistries();
  return ministryId;
}

export async function updateMinistry(id: string, data: Partial<Ministry>) {
  const payload = mapMinistryToDbPayload(data);
  payload.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('ministries')
    .update(payload)
    .eq('id', id)
    .select('*');

  if (error) {
    console.error('[Supabase] Erro ao atualizar ministério:', error);
    throw new Error(`Erro ao atualizar ministério no Supabase: ${error.message}`);
  }

  fetchAndNotifyMinistries();
  return updated;
}

export async function deleteMinistry(id: string) {
  const { error } = await supabase
    .from('ministries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Erro ao excluir ministério:', error);
    throw new Error(`Erro ao excluir ministério no Supabase: ${error.message}`);
  }

  fetchAndNotifyMinistries();
  return true;
}

// -------------------------------------------------------------
// CLEAR / SEED FUNCTIONS
// -------------------------------------------------------------

export async function clearAllSchedules() {
  const { error } = await supabase.from('schedules').delete().neq('id', '0');
  if (error) console.warn('[Supabase] Erro ao limpar schedules:', error);
  fetchAndNotifySchedules();
}

export async function clearAllEvents() {
  const { error } = await supabase.from('events').delete().neq('id', '0');
  if (error) console.warn('[Supabase] Erro ao limpar events:', error);
  fetchAndNotifyEvents();
}

export async function clearAllSermons() {
  const { error } = await supabase.from('sermons').delete().neq('id', '0');
  if (error) console.warn('[Supabase] Erro ao limpar sermons:', error);
  fetchAndNotifySermons();
}

export async function seedInitialFirestoreData(force = false) {
  console.log('[Supabase Seed] Iniciando sincronização/seed de dados para Supabase...');
  try {
    // 1. Seed Ministries
    const { data: minData } = await supabase.from('ministries').select('id');
    if (!minData || minData.length === 0 || force) {
      for (const min of MINISTRIES_DATA) {
        await addMinistry(min);
      }
    }

    // 2. Seed Events
    const { data: evtData } = await supabase.from('events').select('id');
    if ((!evtData || evtData.length === 0) && SPECIAL_EVENTS.length > 0) {
      for (const evt of SPECIAL_EVENTS) {
        const { id, ...rest } = evt;
        await addEvent(rest);
      }
    }

    // 3. Seed Sermons
    const { data: sermonData } = await supabase.from('sermons').select('id');
    if ((!sermonData || sermonData.length === 0) && SERMONS_YOUTUBE.length > 0) {
      for (const s of SERMONS_YOUTUBE) {
        const { id, ...rest } = s;
        await addSermon(rest);
      }
    }

    // 4. Seed Schedules
    const { data: schedData } = await supabase.from('schedules').select('id');
    if ((!schedData || schedData.length === 0) && WEEKLY_SCHEDULE.length > 0) {
      for (const sch of WEEKLY_SCHEDULE) {
        const { id, ...rest } = sch;
        await addSchedule(rest);
      }
    }

    fetchAndNotifySchedules();
    fetchAndNotifyEvents();
    fetchAndNotifySermons();
    fetchAndNotifyMinistries();
    fetchAndNotifyChurchSettings();

    console.log('[Supabase Seed] Sincronização concluída com sucesso.');
  } catch (err) {
    console.warn('[Supabase Seed] Aviso/Exceção durante seed:', err);
  }
}

// -------------------------------------------------------------
// SETTINGS / BRANDING
// -------------------------------------------------------------

const settingsListeners = new Set<(settings: ChurchSettingsData) => void>();
let settingsChannel: any = null;

async function fetchAndNotifyChurchSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'church_info')
      .maybeSingle();

    let settings: ChurchSettingsData = {};
    if (error) {
      console.warn('[Supabase] Aviso ao buscar settings:', error.message);
    } else if (data) {
      settings = mapSettings(data);
    }

    settingsListeners.forEach((cb) => cb(settings));
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar settings:', err);
    settingsListeners.forEach((cb) => cb({}));
  }
}

function initChurchSettingsRealtime() {
  if (!settingsChannel) {
    settingsChannel = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchAndNotifyChurchSettings();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Canal public:settings conectado com sucesso.');
        }
      });
  }
}

export function subscribeChurchSettings(callback: (settings: ChurchSettingsData) => void) {
  settingsListeners.add(callback);
  fetchAndNotifyChurchSettings();
  initChurchSettingsRealtime();

  return () => {
    settingsListeners.delete(callback);
    if (settingsListeners.size === 0 && settingsChannel) {
      supabase.removeChannel(settingsChannel);
      settingsChannel = null;
    }
  };
}

export async function updateChurchSettings(settings: ChurchSettingsData) {
  const payload = {
    id: 'church_info',
    logo_url: settings.logoUrl || '',
    spotify_url: settings.spotifyUrl || '',
    spotify_embed_url: settings.spotifyEmbedUrl || '',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('settings')
    .upsert(payload)
    .select('*');

  if (error) {
    console.error('[Supabase] Erro ao atualizar configurações:', error);
    throw new Error(`Erro ao salvar configurações no Supabase: ${error.message}`);
  }

  fetchAndNotifyChurchSettings();
  return data;
}

// -------------------------------------------------------------
// PRAYER REQUESTS
// -------------------------------------------------------------

const PRAYER_REQUESTS_LOCAL_KEY = 'imw_prayer_requests';

function getLocalPrayerRequests(): PrayerRequest[] {
  try {
    const raw = localStorage.getItem(PRAYER_REQUESTS_LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[PrayerRequests] Erro ao ler do localStorage:', err);
  }
  return [];
}

function saveLocalPrayerRequests(items: PrayerRequest[]) {
  try {
    localStorage.setItem(PRAYER_REQUESTS_LOCAL_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[PrayerRequests] Erro ao salvar no localStorage:', err);
  }
}

function mapPrayerRequest(row: any): PrayerRequest {
  return {
    id: String(row.id),
    name: row.name || row.user_name || '',
    phone: row.phone || row.user_phone || '',
    category: row.category || 'Geral',
    requestText: row.request_text || row.requestText || row.text || '',
    isConfidential: row.is_confidential ?? row.isConfidential ?? true,
    status: (row.status === 'prayed' || row.status === 'archived') ? row.status : 'pending',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

function mapPrayerRequestToDbPayload(data: Partial<PrayerRequest>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (data.id !== undefined) payload.id = data.id;
  if (data.name !== undefined) payload.name = data.name;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.category !== undefined) payload.category = data.category;
  if (data.requestText !== undefined) payload.request_text = data.requestText;
  if (data.isConfidential !== undefined) payload.is_confidential = data.isConfidential;
  if (data.status !== undefined) payload.status = data.status;
  if (data.createdAt !== undefined) payload.created_at = data.createdAt;
  return payload;
}

const prayerListeners = new Set<(prayers: PrayerRequest[]) => void>();
let prayerChannel: any = null;

async function fetchAndNotifyPrayerRequests() {
  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    let items: PrayerRequest[] = [];
    if (error) {
      items = getLocalPrayerRequests();
    } else if (data && data.length > 0) {
      items = data.map(mapPrayerRequest);
      // Merge local un-synced items if any
      const localItems = getLocalPrayerRequests();
      const existingIds = new Set(items.map((i) => i.id));
      const unsynced = localItems.filter((i) => !existingIds.has(i.id));
      if (unsynced.length > 0) {
        items = [...unsynced, ...items];
      }
      saveLocalPrayerRequests(items);
    } else {
      items = getLocalPrayerRequests();
    }

    prayerListeners.forEach((cb) => cb(items));
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar prayer_requests:', err);
    const items = getLocalPrayerRequests();
    prayerListeners.forEach((cb) => cb(items));
  }
}

function initPrayerRequestsRealtime() {
  if (!prayerChannel) {
    prayerChannel = supabase
      .channel('public:prayer_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_requests' }, () => {
        fetchAndNotifyPrayerRequests();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Canal public:prayer_requests conectado.');
        }
      });
  }
}

export function subscribePrayerRequests(callback: (prayers: PrayerRequest[]) => void) {
  prayerListeners.add(callback);
  fetchAndNotifyPrayerRequests();
  initPrayerRequestsRealtime();

  return () => {
    prayerListeners.delete(callback);
    if (prayerListeners.size === 0 && prayerChannel) {
      supabase.removeChannel(prayerChannel);
      prayerChannel = null;
    }
  };
}

export async function addPrayerRequest(data: Omit<PrayerRequest, 'id' | 'createdAt' | 'status'>): Promise<PrayerRequest> {
  const newId = `prayer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newRequest: PrayerRequest = {
    id: newId,
    name: data.name || '',
    phone: data.phone || '',
    category: data.category || 'Geral',
    requestText: data.requestText || '',
    isConfidential: data.isConfidential ?? true,
    status: 'pending',
    createdAt: now,
  };

  const localItems = getLocalPrayerRequests();
  const updatedLocal = [newRequest, ...localItems];
  saveLocalPrayerRequests(updatedLocal);

  try {
    const payload = mapPrayerRequestToDbPayload(newRequest);
    const { error } = await supabase.from('prayer_requests').insert([payload]);
    if (error) {
      console.warn('[Supabase] Aviso ao inserir prayer_requests:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao salvar pedido de oração:', err);
  }

  fetchAndNotifyPrayerRequests();
  return newRequest;
}

export async function updatePrayerRequestStatus(id: string, status: 'pending' | 'prayed' | 'archived'): Promise<void> {
  const localItems = getLocalPrayerRequests();
  const updatedLocal = localItems.map((p) => (p.id === id ? { ...p, status } : p));
  saveLocalPrayerRequests(updatedLocal);

  try {
    const { error } = await supabase
      .from('prayer_requests')
      .update({ status })
      .eq('id', id);
    if (error) {
      console.warn('[Supabase] Aviso ao atualizar status de prayer_requests:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao atualizar status:', err);
  }

  fetchAndNotifyPrayerRequests();
}

export async function deletePrayerRequest(id: string): Promise<void> {
  const localItems = getLocalPrayerRequests();
  const updatedLocal = localItems.filter((p) => p.id !== id);
  saveLocalPrayerRequests(updatedLocal);

  try {
    const { error } = await supabase
      .from('prayer_requests')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn('[Supabase] Aviso ao deletar de prayer_requests:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao deletar pedido de oração:', err);
  }

  fetchAndNotifyPrayerRequests();
}

// -------------------------------------------------------------
// USER PROFILES & ROLES
// -------------------------------------------------------------

function getLocalProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem('imw_user_profiles');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem('imw_user_profiles', JSON.stringify(profiles));
  } catch (err) {
    console.warn('Erro ao salvar perfis locais:', err);
  }
}

function mapProfile(row: any): UserProfile {
  const rawName = row.full_name || row.fullName || row.name || '';
  const fallbackName = row.email
    ? row.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'Usuário';
  const resolvedName = rawName.trim() || fallbackName;

  return {
    id: String(row.id),
    email: row.email || '',
    role: (row.role === 'admin' || row.role === 'media' || row.role === 'intercession') ? row.role : 'media',
    fullName: resolvedName,
    full_name: resolvedName,
    invitedBy: row.invited_by || row.invitedBy || null,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

export async function getUserProfile(userId: string, email?: string): Promise<UserProfile> {
  let profile: UserProfile | null = null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      profile = mapProfile(data);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao carregar perfil:', err);
  }

  // Fallback to local cache if not found in DB
  if (!profile) {
    const local = getLocalProfiles();
    const found = local.find((p) => p.id === userId);
    if (found) {
      profile = found;
    }
  }

  // If still no profile, determine role based on total profiles count or pending invite (never default to 'admin')
  if (!profile) {
    let assignedRole: UserRole = 'media';
    try {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (count === 0) {
        assignedRole = 'admin';
      } else if (email) {
        const cleanEmail = email.trim().toLowerCase();
        const { data: inv } = await supabase.from('invites').select('role').eq('email', cleanEmail).maybeSingle();
        if (inv && (inv.role === 'admin' || inv.role === 'media' || inv.role === 'intercession')) {
          assignedRole = inv.role as UserRole;
        }
      }
    } catch {
      // ignore
    }

    const defaultName = email ? email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Usuário';
    const newProfile: UserProfile = {
      id: userId,
      email: email || '',
      role: assignedRole,
      fullName: defaultName,
      full_name: defaultName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    profile = newProfile;
    upsertUserProfile(newProfile).catch(() => {});
  }

  return profile;
}

export async function upsertUserProfile(profile: UserProfile): Promise<UserProfile> {
  const local = getLocalProfiles();
  const index = local.findIndex((p) => p.id === profile.id);
  const updatedName = profile.fullName || profile.full_name || '';

  if (index >= 0) {
    local[index] = { ...local[index], ...profile, fullName: updatedName, full_name: updatedName, updatedAt: new Date().toISOString() };
  } else {
    local.unshift({ ...profile, fullName: updatedName, full_name: updatedName });
  }
  saveLocalProfiles(local);

  try {
    const payload = {
      id: profile.id,
      email: profile.email,
      full_name: updatedName || null,
      role: profile.role,
      invited_by: profile.invitedBy || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('profiles').upsert(payload);
    if (error) {
      console.warn('[Supabase] Aviso ao atualizar perfil:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao atualizar perfil:', err);
  }

  return profile;
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const items = data.map(mapProfile);
      saveLocalProfiles(items);
      return items;
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar todos os perfis:', err);
  }

  return getLocalProfiles();
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  await updateUserByAdmin(userId, { role: newRole });
}

export async function updateUserByAdmin(
  userId: string,
  params: { fullName?: string; role?: UserRole; email?: string }
): Promise<UserProfile> {
  const cleanName = params.fullName?.trim();
  const cleanEmail = params.email?.trim().toLowerCase();
  const newRole = params.role;

  // 1. Atualizar em cache local
  const local = getLocalProfiles();
  const index = local.findIndex((p) => p.id === userId);
  let updatedLocalProfile: UserProfile | null = null;

  if (index >= 0) {
    local[index] = {
      ...local[index],
      ...(cleanName ? { fullName: cleanName, full_name: cleanName } : {}),
      ...(newRole ? { role: newRole } : {}),
      ...(cleanEmail ? { email: cleanEmail } : {}),
      updatedAt: new Date().toISOString(),
    };
    updatedLocalProfile = local[index];
  }
  saveLocalProfiles(local);

  // 2. Executar RPC no Supabase (com verificação de admin no backend)
  try {
    const { data, error } = await supabase.rpc('update_user_by_admin', {
      target_user_id: userId,
      new_full_name: cleanName || null,
      new_role: newRole || null,
      new_email: cleanEmail || null,
    });

    if (error) {
      console.warn('[Supabase] RPC update_user_by_admin falhou, aplicando fallback direto em profiles:', error.message);
      
      const updateData: any = { updated_at: new Date().toISOString() };
      if (cleanName) updateData.full_name = cleanName;
      if (newRole) updateData.role = newRole;
      if (cleanEmail) updateData.email = cleanEmail;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (profileError) {
        throw new Error(profileError.message);
      }
    } else if (data) {
      return mapProfile(data);
    }
  } catch (err: any) {
    console.warn('[Supabase] Exceção ao atualizar perfil do usuário:', err);
    throw err;
  }

  if (updatedLocalProfile) return updatedLocalProfile;

  return {
    id: userId,
    email: cleanEmail || '',
    role: newRole || 'media',
    fullName: cleanName || 'Usuário',
    full_name: cleanName || 'Usuário',
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteUserProfile(userId: string): Promise<void> {
  const local = getLocalProfiles().filter((p) => p.id !== userId);
  saveLocalProfiles(local);

  try {
    // Tenta deletar do Supabase Auth e Profiles via RPC de admin
    const { error: rpcError } = await supabase.rpc('delete_user_by_admin', {
      target_user_id: userId,
    });

    if (rpcError) {
      console.warn('[Supabase] RPC delete_user_by_admin falhou, executando deleção direta em profiles:', rpcError.message);
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
      if (profileError) {
        throw new Error(profileError.message);
      }
    }
  } catch (err: any) {
    console.warn('[Supabase] Exceção ao deletar perfil:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// DASHBOARD INVITES
// -------------------------------------------------------------

function getLocalInvites(): DashboardInvite[] {
  try {
    const raw = localStorage.getItem('imw_dashboard_invites');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalInvites(invites: DashboardInvite[]): void {
  try {
    localStorage.setItem('imw_dashboard_invites', JSON.stringify(invites));
  } catch (err) {
    console.warn('Erro ao salvar convites locais:', err);
  }
}

function parseDateMs(dateStr?: string | null): number {
  if (!dateStr) return NaN;
  let cleanStr = String(dateStr).trim();
  if (!cleanStr.includes('T') && cleanStr.includes(' ')) {
    cleanStr = cleanStr.replace(' ', 'T');
  }
  if (!cleanStr.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(cleanStr)) {
    cleanStr += 'Z';
  }
  return new Date(cleanStr).getTime();
}

export function getInviteStatus(params: {
  acceptedAt?: string | null;
  accepted_at?: string | null;
  expiresAt?: string | null;
  expires_at?: string | null;
  status?: string | null;
}): 'pending' | 'accepted' | 'expired' {
  const accepted = params.acceptedAt || params.accepted_at;
  if (accepted || params.status === 'accepted') {
    return 'accepted';
  }

  const expires = params.expiresAt || params.expires_at;
  if (expires) {
    const expireTime = parseDateMs(expires);
    if (!isNaN(expireTime) && expireTime <= Date.now()) {
      return 'expired';
    }
  }

  if (params.status === 'expired') {
    return 'expired';
  }

  return 'pending';
}

function mapInvite(row: any): DashboardInvite {
  const expiresAt = row.expires_at || row.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const acceptedAt = row.accepted_at || row.acceptedAt || null;
  const createdAt = row.created_at || row.createdAt || new Date().toISOString();
  const status = getInviteStatus({ acceptedAt, expiresAt, status: row.status });

  return {
    id: String(row.id),
    email: row.email || '',
    role: (row.role === 'admin' || row.role === 'media' || row.role === 'intercession') ? row.role : 'media',
    token: row.token || '',
    invitedBy: row.invited_by || row.invitedBy || null,
    expiresAt,
    acceptedAt,
    createdAt,
    status,
  };
}

export async function createDashboardInvite(email: string, role: UserRole, invitedByUserId?: string): Promise<DashboardInvite> {
  const cleanEmail = email.trim().toLowerCase();
  const token = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).substring(2, 10)
    : Math.random().toString(36).substring(2) + Date.now().toString(36);

  const nowMs = Date.now();
  const createdAt = new Date(nowMs).toISOString();
  // Convite válido por 7 dias em tempo real UTC
  const expiresAt = new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Validar formato UUID do autor do convite para garantir integridade com PostgreSQL
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const validInvitedBy = invitedByUserId && uuidRegex.test(invitedByUserId) ? invitedByUserId : null;

  const newInvite: DashboardInvite = {
    id: `inv_${nowMs}_${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    role,
    token,
    invitedBy: validInvitedBy,
    expiresAt,
    acceptedAt: null,
    createdAt,
    status: 'pending',
  };

  const local = getLocalInvites();
  const filteredLocal = local.filter((i) => i.token !== token);
  filteredLocal.unshift(newInvite);
  saveLocalInvites(filteredLocal);

  try {
    const payload: any = {
      email: cleanEmail,
      role,
      token,
      invited_by: validInvitedBy,
      expires_at: expiresAt,
      created_at: createdAt,
    };

    let { data, error } = await supabase.from('invites').insert([payload]).select('*').single();

    // Caso a chave estrangeira em invited_by falhe (ex: usuário autor não sincronizado no auth.users), tenta com NULL
    if (error && (error.code === '23503' || error.message?.includes('invited_by') || error.message?.includes('foreign key'))) {
      console.warn('[Supabase] Chave de autor inválida, tentando re-inserir convite com invited_by NULL...');
      payload.invited_by = null;
      const retry = await supabase.from('invites').insert([payload]).select('*').single();
      data = retry.data;
      error = retry.error;
    }

    if (!error && data) {
      const dbInvite = mapInvite(data);
      const updatedLocal = filteredLocal.map((inv) => (inv.token === token ? dbInvite : inv));
      saveLocalInvites(updatedLocal);
      return dbInvite;
    } else if (error) {
      console.warn('[Supabase] Erro ao criar convite no banco:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao criar convite:', err);
  }

  return newInvite;
}

export async function getDashboardInvites(): Promise<DashboardInvite[]> {
  try {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map(mapInvite);
      // Mesclar dados do banco com o armazenamento local para prevenir perda de convites locais pendentes
      const local = getLocalInvites().map(mapInvite);
      const dbTokens = new Set(mapped.map((i) => i.token));
      const dbIds = new Set(mapped.map((i) => i.id));

      const localOnly = local.filter((l) => !dbTokens.has(l.token) && !dbIds.has(l.id));
      const combined = [...mapped, ...localOnly];

      saveLocalInvites(combined);
      return combined;
    } else if (error) {
      console.warn('[Supabase] Erro ao buscar convites do banco:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar convites:', err);
  }

  const local = getLocalInvites();
  return local.map(mapInvite);
}

export async function deleteDashboardInvite(inviteId: string): Promise<void> {
  const local = getLocalInvites().filter((i) => i.id !== inviteId);
  saveLocalInvites(local);

  try {
    const { error } = await supabase.from('invites').delete().eq('id', inviteId);
    if (error) {
      console.warn('[Supabase] Erro ao deletar convite:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao deletar convite:', err);
  }
}

export async function getInviteByToken(token: string): Promise<DashboardInvite | null> {
  if (!token || !token.trim()) return null;

  try {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token.trim())
      .maybeSingle();

    if (!error && data) {
      return mapInvite(data);
    }
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar convite por token:', err);
  }

  // Fallback local check
  const local = getLocalInvites();
  const found = local.find((i) => i.token === token.trim());
  if (found) {
    return mapInvite(found);
  }

  return null;
}

export async function acceptDashboardInvite(
  invite: DashboardInvite,
  password: string,
  fullName?: string
): Promise<{ user: any; profile: UserProfile }> {
  const cleanName = (fullName || '').trim();
  const fallbackName = invite.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const resolvedName = cleanName || fallbackName;

  // 1. SignUp user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invite.email,
    password: password,
    options: {
      data: {
        full_name: resolvedName,
        name: resolvedName,
        invite_token: invite.token,
        role: invite.role,
      },
    },
  });

  if (authError) {
    // If user already registered, attempt signIn
    if (authError.message.includes('User already registered')) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: invite.email,
        password: password,
      });

      if (signInError) {
        throw new Error(`Este e-mail já possui conta cadastrada. Tente entrar com a sua senha existente ou contate o administrador.`);
      }

      if (!signInData.user) {
        throw new Error('Falha ao autenticar usuário.');
      }

      const profile: UserProfile = {
        id: signInData.user.id,
        email: invite.email,
        fullName: resolvedName,
        full_name: resolvedName,
        role: invite.role,
        invitedBy: invite.invitedBy,
        updatedAt: new Date().toISOString(),
      };

      await upsertUserProfile(profile);
      await markInviteAccepted(invite.token);
      return { user: signInData.user, profile };
    }
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Erro ao criar conta com o convite.');
  }

  // 2. Create User Profile with assigned invite role and full name
  const profile: UserProfile = {
    id: authData.user.id,
    email: invite.email,
    fullName: resolvedName,
    full_name: resolvedName,
    role: invite.role,
    invitedBy: invite.invitedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await upsertUserProfile(profile);

  // 3. Mark Invite as Accepted
  await markInviteAccepted(invite.token);

  return { user: authData.user, profile };
}

async function markInviteAccepted(token: string): Promise<void> {
  const local = getLocalInvites();
  const nowIso = new Date().toISOString();
  const updatedLocal = local.map((i) => (i.token === token ? { ...i, acceptedAt: nowIso, status: 'accepted' as const } : i));
  saveLocalInvites(updatedLocal);

  try {
    await supabase
      .from('invites')
      .update({ accepted_at: nowIso })
      .eq('token', token);
  } catch (err) {
    console.warn('[Supabase] Exceção ao marcar convite como aceito:', err);
  }
}


