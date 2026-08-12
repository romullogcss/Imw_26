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
// HELPER MAPPERS (CAMELCASE / SNAKE_CASE COMPATIBILITY)
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

export function subscribeSchedules(callback: (items: ScheduleItem[]) => void) {
  let isSubscribed = true;

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.warn('[Supabase] Aviso ao buscar schedules:', error.message);
        if (isSubscribed) callback(WEEKLY_SCHEDULE);
        return;
      }

      if (data && data.length > 0) {
        const items = data.map(mapSchedule);
        if (isSubscribed) callback(items);
      } else {
        if (isSubscribed) callback([]);
      }
    } catch (err) {
      console.warn('[Supabase] Exceção ao buscar schedules:', err);
      if (isSubscribed) callback(WEEKLY_SCHEDULE);
    }
  };

  fetchItems();

  const channel = supabase
    .channel('public:schedules')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => {
      fetchItems();
    })
    .subscribe();

  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
}

export async function addSchedule(data: Omit<ScheduleItem, 'id'>) {
  const newId = `sched_${Date.now()}`;
  const payload = {
    id: newId,
    day: data.day,
    time: data.time,
    title: data.title,
    description: data.description || '',
    location: data.location || '',
    category: data.category,
    is_highlight: data.isHighlight || false,
    created_at: new Date().toISOString(),
  };

  const { data: inserted, error } = await supabase
    .from('schedules')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[Supabase] Erro ao adicionar horário:', error);
    throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
  }
  return inserted ? mapSchedule(inserted) : { id: newId, ...data };
}

export async function updateSchedule(id: string, data: Partial<ScheduleItem>) {
  const payload: any = { ...data };
  if (data.isHighlight !== undefined) payload.is_highlight = data.isHighlight;
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
  return true;
}

// -------------------------------------------------------------
// EVENTS
// -------------------------------------------------------------

export function subscribeEvents(callback: (items: ChurchEvent[]) => void) {
  let isSubscribed = true;

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');

      if (error) {
        console.warn('[Supabase] Aviso ao buscar events:', error.message);
        if (isSubscribed) callback(SPECIAL_EVENTS);
        return;
      }

      if (data && data.length > 0) {
        const items = data.map(mapEvent);
        if (isSubscribed) callback(items);
      } else {
        if (isSubscribed) callback([]);
      }
    } catch (err) {
      console.warn('[Supabase] Exceção ao buscar events:', err);
      if (isSubscribed) callback(SPECIAL_EVENTS);
    }
  };

  fetchItems();

  const channel = supabase
    .channel('public:events')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
      fetchItems();
    })
    .subscribe();

  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
}

export async function addEvent(data: Omit<ChurchEvent, 'id'>) {
  const newId = `evt_${Date.now()}`;
  const payload = {
    id: newId,
    title: data.title,
    date: data.date,
    time: data.time,
    location: data.location,
    description: data.description,
    image_url: data.imageUrl || '',
    badge: data.badge || '',
    is_featured: data.isFeatured || false,
    created_at: new Date().toISOString(),
  };

  const { data: inserted, error } = await supabase
    .from('events')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[Supabase] Erro ao adicionar evento:', error);
    throw new Error(`Erro ao salvar evento no Supabase: ${error.message}`);
  }
  return inserted ? mapEvent(inserted) : { id: newId, ...data };
}

export async function updateEvent(id: string, data: Partial<ChurchEvent>) {
  const payload: any = { ...data };
  if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
  if (data.isFeatured !== undefined) payload.is_featured = data.isFeatured;
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
  return true;
}

// -------------------------------------------------------------
// SERMONS
// -------------------------------------------------------------

export function subscribeSermons(callback: (items: Sermon[]) => void) {
  let isSubscribed = true;

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*');

      if (error) {
        console.warn('[Supabase] Aviso ao buscar sermons:', error.message);
        if (isSubscribed) callback(SERMONS_YOUTUBE);
        return;
      }

      if (data && data.length > 0) {
        const items = data.map(mapSermon);
        if (isSubscribed) callback(items);
      } else {
        if (isSubscribed) callback([]);
      }
    } catch (err) {
      console.warn('[Supabase] Exceção ao buscar sermons:', err);
      if (isSubscribed) callback(SERMONS_YOUTUBE);
    }
  };

  fetchItems();

  const channel = supabase
    .channel('public:sermons')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sermons' }, () => {
      fetchItems();
    })
    .subscribe();

  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
}

export async function addSermon(data: Omit<Sermon, 'id'>) {
  const newId = `sermon_${Date.now()}`;
  const ytId = extractYoutubeId(data.youtubeUrl || data.youtubeId || '') || '';
  const embedUrl = getYoutubeEmbedUrl(ytId);
  const watchUrl = data.youtubeUrl || getYoutubeWatchUrl(ytId);
  const thumbnail = data.thumbnail?.trim() || data.imageUrl?.trim() || getYoutubeThumbnailUrl(ytId);
  const imageUrl = data.imageUrl?.trim() || thumbnail;
  const imagePath = data.imagePath?.trim() || '';

  const payload = {
    id: newId,
    title: data.title,
    preacher: data.preacher,
    date: data.date,
    youtube_id: ytId,
    youtube_url: watchUrl,
    embed_url: embedUrl,
    duration: data.duration,
    scripture: data.scripture,
    category: data.category,
    thumbnail: thumbnail,
    image_url: imageUrl,
    image_path: imagePath,
    summary: data.summary || '',
    created_at: new Date().toISOString(),
  };

  const { data: inserted, error } = await supabase
    .from('sermons')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[Supabase] Erro ao adicionar pregação:', error);
    throw new Error(`Erro ao salvar pregação no Supabase: ${error.message}`);
  }
  return inserted ? mapSermon(inserted) : { id: newId, ...data, youtubeId: ytId, embedUrl, youtubeUrl: watchUrl, thumbnail, imageUrl, imagePath };
}

export async function updateSermon(id: string, data: Partial<Sermon>) {
  let payload: any = { ...data };
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
  if (data.imageUrl) payload.image_url = data.imageUrl;
  if (data.imagePath) payload.image_path = data.imagePath;
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
  return true;
}

// -------------------------------------------------------------
// MINISTRIES
// -------------------------------------------------------------

export function subscribeMinistries(callback: (items: Ministry[]) => void) {
  let isSubscribed = true;

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('ministries')
        .select('*');

      if (error) {
        console.warn('[Supabase] Aviso ao buscar ministries:', error.message);
        if (isSubscribed) callback(MINISTRIES_DATA);
        return;
      }

      if (data && data.length > 0) {
        const items = data.map(mapMinistry);
        if (isSubscribed) callback(items);
      } else {
        if (isSubscribed) callback([]);
      }
    } catch (err) {
      console.warn('[Supabase] Exceção ao buscar ministries:', err);
      if (isSubscribed) callback(MINISTRIES_DATA);
    }
  };

  fetchItems();

  const channel = supabase
    .channel('public:ministries')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ministries' }, () => {
      fetchItems();
    })
    .subscribe();

  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
}

export async function addMinistry(data: Omit<Ministry, 'id'> & { id?: string }) {
  const ministryId = data.id || `m_${Date.now()}`;
  const payload = {
    id: ministryId,
    title: data.title,
    subtitle: data.subtitle,
    age_range: data.ageRange,
    description: data.description,
    detailed_description: data.detailedDescription,
    meeting_time: data.meetingTime,
    meeting_location: data.meetingLocation,
    leader_name: data.leaderName,
    leader_role: data.leaderRole,
    leader_photo: data.leaderPhoto,
    leader_contact: data.leaderContact,
    theme_color: data.themeColor,
    is_playful: data.isPlayful || false,
    gallery: data.gallery || [],
    activities: data.activities || [],
    created_at: new Date().toISOString(),
  };

  const { data: inserted, error } = await supabase
    .from('ministries')
    .upsert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[Supabase] Erro ao adicionar/atualizar ministério:', error);
    throw new Error(`Erro ao salvar ministério no Supabase: ${error.message}`);
  }
  return ministryId;
}

export async function updateMinistry(id: string, data: Partial<Ministry>) {
  const payload: any = { ...data };
  if (data.ageRange !== undefined) payload.age_range = data.ageRange;
  if (data.detailedDescription !== undefined) payload.detailed_description = data.detailedDescription;
  if (data.meetingTime !== undefined) payload.meeting_time = data.meetingTime;
  if (data.meetingLocation !== undefined) payload.meeting_location = data.meetingLocation;
  if (data.leaderName !== undefined) payload.leader_name = data.leaderName;
  if (data.leaderRole !== undefined) payload.leader_role = data.leaderRole;
  if (data.leaderPhoto !== undefined) payload.leader_photo = data.leaderPhoto;
  if (data.leaderContact !== undefined) payload.leader_contact = data.leaderContact;
  if (data.themeColor !== undefined) payload.theme_color = data.themeColor;
  if (data.isPlayful !== undefined) payload.is_playful = data.isPlayful;
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
  return true;
}

// -------------------------------------------------------------
// CLEAR / SEED FUNCTIONS
// -------------------------------------------------------------

export async function clearAllSchedules() {
  const { error } = await supabase.from('schedules').delete().neq('id', '0');
  if (error) console.warn('[Supabase] Erro ao limpar schedules:', error);
}

export async function clearAllEvents() {
  const { error } = await supabase.from('events').delete().neq('id', '0');
  if (error) console.warn('[Supabase] Erro ao limpar events:', error);
}

export async function clearAllSermons() {
  const { error } = await supabase.from('sermons').delete().neq('id', '0');
  if (error) console.warn('[Supabase] Erro ao limpar sermons:', error);
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

    console.log('[Supabase Seed] Sincronização concluída com sucesso.');
  } catch (err) {
    console.warn('[Supabase Seed] Aviso/Exceção durante seed:', err);
  }
}

// -------------------------------------------------------------
// SETTINGS / BRANDING
// -------------------------------------------------------------

export function subscribeChurchSettings(callback: (settings: ChurchSettingsData) => void) {
  let isSubscribed = true;

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'church_info')
        .maybeSingle();

      if (error) {
        console.warn('[Supabase] Aviso ao buscar settings:', error.message);
        if (isSubscribed) callback({});
        return;
      }

      if (data) {
        if (isSubscribed) callback(mapSettings(data));
      } else {
        if (isSubscribed) callback({});
      }
    } catch (err) {
      console.warn('[Supabase] Exceção ao buscar settings:', err);
      if (isSubscribed) callback({});
    }
  };

  fetchSettings();

  const channel = supabase
    .channel('public:settings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
      fetchSettings();
    })
    .subscribe();

  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
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
  return data;
}
