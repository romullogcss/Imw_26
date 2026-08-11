import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ScheduleItem, ChurchEvent, Sermon, Ministry } from '../types';
import { WEEKLY_SCHEDULE, SPECIAL_EVENTS, SERMONS_YOUTUBE, MINISTRIES_DATA } from '../data/churchData';
import { 
  extractYoutubeId, 
  getYoutubeEmbedUrl, 
  getYoutubeWatchUrl, 
  getYoutubeThumbnailUrl 
} from '../utils/youtube';

// Collections names
const SCHEDULES_COL = 'schedules';
const EVENTS_COL = 'events';
const SERMONS_COL = 'sermons';
const MINISTRIES_COL = 'ministries';

export { extractYoutubeId };

// Subscribe to Schedules
export function subscribeSchedules(callback: (items: ScheduleItem[]) => void) {
  const q = query(collection(db, SCHEDULES_COL));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: ScheduleItem[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as ScheduleItem[];
    callback(items);
  }, (err) => {
    console.error('Error fetching schedules:', err);
    callback([]);
  });
}

// Add Schedule
export async function addSchedule(data: Omit<ScheduleItem, 'id'>) {
  return await addDoc(collection(db, SCHEDULES_COL), {
    ...data,
    createdAt: serverTimestamp()
  });
}

// Update Schedule
export async function updateSchedule(id: string, data: Partial<ScheduleItem>) {
  const docRef = doc(db, SCHEDULES_COL, id);
  return await updateDoc(docRef, { ...data });
}

// Delete Schedule
export async function deleteSchedule(id: string) {
  const docRef = doc(db, SCHEDULES_COL, id);
  return await deleteDoc(docRef);
}

// Subscribe to Events
export function subscribeEvents(callback: (items: ChurchEvent[]) => void) {
  const q = query(collection(db, EVENTS_COL));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: ChurchEvent[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as ChurchEvent[];
    callback(items);
  }, (err) => {
    console.error('Error fetching events:', err);
    callback([]);
  });
}

// Add Event
export async function addEvent(data: Omit<ChurchEvent, 'id'>) {
  return await addDoc(collection(db, EVENTS_COL), {
    ...data,
    createdAt: serverTimestamp()
  });
}

// Update Event
export async function updateEvent(id: string, data: Partial<ChurchEvent>) {
  const docRef = doc(db, EVENTS_COL, id);
  return await updateDoc(docRef, { ...data });
}

// Delete Event
export async function deleteEvent(id: string) {
  const docRef = doc(db, EVENTS_COL, id);
  return await deleteDoc(docRef);
}

// Subscribe to Sermons
export function subscribeSermons(callback: (items: Sermon[]) => void) {
  const q = query(collection(db, SERMONS_COL));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: Sermon[] = snapshot.docs.map((d) => {
      const data = d.data();
      const ytId = extractYoutubeId(data.youtubeUrl || data.youtubeId || '') || '';
      const embedUrl = data.embedUrl || (ytId ? getYoutubeEmbedUrl(ytId) : '');
      const watchUrl = data.youtubeUrl || (ytId ? getYoutubeWatchUrl(ytId) : '');
      const thumbnail = data.thumbnail || (ytId ? getYoutubeThumbnailUrl(ytId) : '');

      return {
        id: d.id,
        ...data,
        youtubeId: ytId || data.youtubeId || '',
        youtubeUrl: watchUrl || data.youtubeUrl || '',
        embedUrl: embedUrl,
        thumbnail: thumbnail,
      } as Sermon;
    });
    
    callback(items);
  }, (err) => {
    console.error('Error fetching sermons:', err);
    callback([]);
  });
}

// Add Sermon
export async function addSermon(data: Omit<Sermon, 'id'>) {
  const ytId = extractYoutubeId(data.youtubeUrl || data.youtubeId || '') || '';
  const embedUrl = getYoutubeEmbedUrl(ytId);
  const watchUrl = data.youtubeUrl || getYoutubeWatchUrl(ytId);
  const thumbnail = data.thumbnail?.trim() || getYoutubeThumbnailUrl(ytId);

  return await addDoc(collection(db, SERMONS_COL), {
    ...data,
    youtubeId: ytId,
    youtubeUrl: watchUrl,
    embedUrl,
    thumbnail,
    createdAt: serverTimestamp()
  });
}

// Update Sermon
export async function updateSermon(id: string, data: Partial<Sermon>) {
  const docRef = doc(db, SERMONS_COL, id);
  let updatedData = { ...data };
  if (data.youtubeUrl || data.youtubeId) {
    const ytId = extractYoutubeId(data.youtubeUrl || data.youtubeId || '') || '';
    updatedData.youtubeId = ytId;
    updatedData.embedUrl = getYoutubeEmbedUrl(ytId);
    updatedData.youtubeUrl = data.youtubeUrl || getYoutubeWatchUrl(ytId);
    if (!data.thumbnail) {
      updatedData.thumbnail = getYoutubeThumbnailUrl(ytId);
    }
  }
  return await updateDoc(docRef, updatedData);
}

// Delete Sermon
export async function deleteSermon(id: string) {
  const docRef = doc(db, SERMONS_COL, id);
  return await deleteDoc(docRef);
}

// Subscribe to Ministries
export function subscribeMinistries(callback: (items: Ministry[]) => void) {
  const q = query(collection(db, MINISTRIES_COL));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: Ministry[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as Ministry[];
    callback(items);
  }, (err) => {
    console.error('Error fetching ministries:', err);
    callback([]);
  });
}

// Add Ministry
export async function addMinistry(data: Omit<Ministry, 'id'> & { id?: string }) {
  const ministryId = data.id || `m_${Date.now()}`;
  const docRef = doc(db, MINISTRIES_COL, ministryId);
  await setDoc(docRef, {
    ...data,
    id: ministryId,
    createdAt: serverTimestamp()
  });
  return ministryId;
}

// Update Ministry
export async function updateMinistry(id: string, data: Partial<Ministry>) {
  const docRef = doc(db, MINISTRIES_COL, id);
  return await updateDoc(docRef, { ...data });
}

// Delete Ministry
export async function deleteMinistry(id: string) {
  const docRef = doc(db, MINISTRIES_COL, id);
  return await deleteDoc(docRef);
}

// Delete all schedules from Firestore
export async function clearAllSchedules() {
  const schedSnap = await getDocs(collection(db, SCHEDULES_COL));
  for (const docItem of schedSnap.docs) {
    try {
      await deleteDoc(doc(db, SCHEDULES_COL, docItem.id));
    } catch (e) {
      console.warn('Could not delete schedule doc:', e);
    }
  }
}

// Delete all sermons from Firestore
export async function clearAllSermons() {
  const sermonSnap = await getDocs(collection(db, SERMONS_COL));
  for (const docItem of sermonSnap.docs) {
    try {
      await deleteDoc(doc(db, SERMONS_COL, docItem.id));
    } catch (e) {
      console.warn('Could not delete sermon doc:', e);
    }
  }
}

// Delete all events from Firestore
export async function clearAllEvents() {
  const eventSnap = await getDocs(collection(db, EVENTS_COL));
  for (const docItem of eventSnap.docs) {
    try {
      await deleteDoc(doc(db, EVENTS_COL, docItem.id));
    } catch (e) {
      console.warn('Could not delete event doc:', e);
    }
  }
}

// Seed initial data to Firestore if empty or forced sync
export async function seedInitialFirestoreData(force = false) {
  try {
    // Check and clear schedules if requested or if seeding runs
    const schedSnap = await getDocs(collection(db, SCHEDULES_COL));
    if (!schedSnap.empty && WEEKLY_SCHEDULE.length === 0) {
      for (const docItem of schedSnap.docs) {
        try {
          await deleteDoc(doc(db, SCHEDULES_COL, docItem.id));
        } catch (e) {
          console.warn('Could not clear schedule doc:', e);
        }
      }
    }

    // Check and clear events if requested or if seeding runs
    const eventSnap = await getDocs(collection(db, EVENTS_COL));
    if (!eventSnap.empty && SPECIAL_EVENTS.length === 0) {
      for (const docItem of eventSnap.docs) {
        try {
          await deleteDoc(doc(db, EVENTS_COL, docItem.id));
        } catch (e) {
          console.warn('Could not clear event doc:', e);
        }
      }
    } else if (eventSnap.empty && SPECIAL_EVENTS.length > 0) {
      const existingTitles = new Set(eventSnap.docs.map(d => d.data().title));
      for (const event of SPECIAL_EVENTS) {
        if (!existingTitles.has(event.title)) {
          const { id, ...rest } = event;
          try {
            await addDoc(collection(db, EVENTS_COL), {
              ...rest,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.warn('Could not seed event item:', e);
          }
        }
      }
    }

    // Check and clear sermons if requested or if seeding runs
    const sermonSnap = await getDocs(collection(db, SERMONS_COL));
    if (!sermonSnap.empty && SERMONS_YOUTUBE.length === 0) {
      for (const docItem of sermonSnap.docs) {
        try {
          await deleteDoc(doc(db, SERMONS_COL, docItem.id));
        } catch (e) {
          console.warn('Could not clear sermon doc:', e);
        }
      }
    }

    // Check ministries
    const minSnap = await getDocs(collection(db, MINISTRIES_COL));
    if (minSnap.empty || force) {
      const existingTitles = new Set(minSnap.docs.map(d => d.data().title));
      for (const min of MINISTRIES_DATA) {
        if (!existingTitles.has(min.title)) {
          try {
            await setDoc(doc(db, MINISTRIES_COL, min.id), {
              ...min,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.warn('Could not seed ministry item:', e);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Auto-seeding skipped or constrained by permissions:', err);
  }
}

// Church Settings (Logo, Branding, etc.)
const SETTINGS_COL = 'settings';
const CHURCH_INFO_DOC = 'church_info';

export interface ChurchSettingsData {
  logoUrl?: string;
  spotifyUrl?: string;
  spotifyEmbedUrl?: string;
  updatedAt?: any;
}

export function subscribeChurchSettings(callback: (settings: ChurchSettingsData) => void) {
  const docRef = doc(db, SETTINGS_COL, CHURCH_INFO_DOC);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as ChurchSettingsData);
    } else {
      callback({});
    }
  }, (err) => {
    console.warn('Could not listen to church settings in Firestore:', err);
    callback({});
  });
}

export async function updateChurchSettings(settings: ChurchSettingsData) {
  const docRef = doc(db, SETTINGS_COL, CHURCH_INFO_DOC);
  return await setDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
