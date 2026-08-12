import { supabase } from '../lib/supabase';
import { ScheduleItem, ChurchEvent, Sermon, Ministry } from '../types';
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

function mapEvent(row: any): ChurchEvent {
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
  return payload;
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
    gallery: row.gallery || [],
    activities: row.activities || [],
  };
}

function mapMinistryToDbPayload(data: Record<string, any>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (data.id !== undefined) payload.id = data.id;
  if (data.title !== undefined) payload.title = data.title;
  if (data.subtitle !== undefined) payload.subtitle = data.subtitle;
  if (data.ageRange !== undefined) payload.age_range = data.ageRange;
  if (data.description !== undefined) payload.description = data.description;
  if (data.detailedDescription !== undefined) payload.detailed_description = data.detailedDescription;
  if (data.meetingTime !== undefined) payload.meeting_time = data.meetingTime;
  if (data.meetingLocation !== undefined) payload.meeting_location = data.meetingLocation;
  if (data.leaderName !== undefined) payload.leader_name = data.leaderName;
  if (data.leaderRole !== undefined) payload.leader_role = data.leaderRole;
  if (data.leaderPhoto !== undefined) payload.leader_photo = data.leaderPhoto;
  if (data.leaderContact !== undefined) payload.leader_contact = data.leaderContact;
  if (data.themeColor !== undefined) payload.theme_color = data.themeColor;
  if (data.isPlayful !== undefined) payload.is_playful = data.isPlayful;
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
  const payload = mapEventToDbPayload(data);
  payload.id = newId;
  payload.created_at = new Date().toISOString();
  payload.updated_at = new Date().toISOString();

  const { data: inserted, error } = await supabase
    .from('events')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[Supabase] Erro ao adicionar evento:', error);
    throw new Error(`Erro ao salvar evento no Supabase: ${error.message}`);
  }

  fetchAndNotifyEvents();
  return inserted ? mapEvent(inserted) : { id: newId, ...data };
}

export async function updateEvent(id: string, data: Partial<ChurchEvent>) {
  const payload = mapEventToDbPayload(data);
  payload.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select('*');

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
// SERMONS
// -------------------------------------------------------------

const sermonListeners = new Set<(items: Sermon[]) => void>();
let sermonsChannel: any = null;

async function fetchAndNotifySermons() {
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*');

    let items: Sermon[] = [];
    if (error) {
      console.warn('[Supabase] Aviso ao buscar sermons:', error.message);
      items = SERMONS_YOUTUBE;
    } else if (data && data.length > 0) {
      items = data.map(mapSermon);
    } else {
      items = [];
    }

    sermonListeners.forEach((cb) => cb(items));
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar sermons:', err);
    sermonListeners.forEach((cb) => cb(SERMONS_YOUTUBE));
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
      .select('*');

    let items: Ministry[] = [];
    if (error) {
      console.warn('[Supabase] Aviso ao buscar ministries:', error.message);
      items = MINISTRIES_DATA;
    } else if (data && data.length > 0) {
      items = data.map(mapMinistry);
    } else {
      items = [];
    }

    ministryListeners.forEach((cb) => cb(items));
  } catch (err) {
    console.warn('[Supabase] Exceção ao buscar ministries:', err);
    ministryListeners.forEach((cb) => cb(MINISTRIES_DATA));
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
