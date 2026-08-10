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

// Collections names
const SCHEDULES_COL = 'schedules';
const EVENTS_COL = 'events';
const SERMONS_COL = 'sermons';
const MINISTRIES_COL = 'ministries';

// Helper for Youtube video ID extraction
export function extractYoutubeId(input: string): string {
  if (!input) return 'dQw4w9WgXcQ';
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match && match[1] ? match[1] : trimmed;
}

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
    const items: Sermon[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as Sermon[];
    
    callback(items);
  }, (err) => {
    console.error('Error fetching sermons:', err);
    callback([]);
  });
}

// Add Sermon
export async function addSermon(data: Omit<Sermon, 'id'>) {
  const ytId = extractYoutubeId(data.youtubeUrl || data.youtubeId || '');
  const thumbnail = data.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  const youtubeUrl = data.youtubeUrl || `https://www.youtube.com/watch?v=${ytId}`;

  return await addDoc(collection(db, SERMONS_COL), {
    ...data,
    youtubeId: ytId,
    youtubeUrl,
    thumbnail,
    createdAt: serverTimestamp()
  });
}

// Update Sermon
export async function updateSermon(id: string, data: Partial<Sermon>) {
  const docRef = doc(db, SERMONS_COL, id);
  let updatedData = { ...data };
  if (data.youtubeUrl || data.youtubeId) {
    const ytId = extractYoutubeId(data.youtubeUrl || data.youtubeId || '');
    updatedData.youtubeId = ytId;
    updatedData.youtubeUrl = data.youtubeUrl || `https://www.youtube.com/watch?v=${ytId}`;
    if (!data.thumbnail) {
      updatedData.thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
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

// Seed initial data to Firestore if empty or forced sync
export async function seedInitialFirestoreData(force = false) {
  try {
    // Check schedules
    const schedSnap = await getDocs(collection(db, SCHEDULES_COL));
    if (schedSnap.empty || force) {
      const existingTitles = new Set(schedSnap.docs.map(d => d.data().title));
      for (const item of WEEKLY_SCHEDULE) {
        if (!existingTitles.has(item.title)) {
          const { id, ...rest } = item;
          try {
            await addDoc(collection(db, SCHEDULES_COL), {
              ...rest,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.warn('Could not seed schedule item:', e);
          }
        }
      }
    }

    // Check events
    const eventSnap = await getDocs(collection(db, EVENTS_COL));
    if (eventSnap.empty || force) {
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

    // Check sermons
    const sermonSnap = await getDocs(collection(db, SERMONS_COL));
    if (sermonSnap.empty || force) {
      const existingTitles = new Set(sermonSnap.docs.map(d => d.data().title));
      for (const sermon of SERMONS_YOUTUBE) {
        if (!existingTitles.has(sermon.title)) {
          const { id, ...rest } = sermon;
          try {
            await addDoc(collection(db, SERMONS_COL), {
              ...rest,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.warn('Could not seed sermon item:', e);
          }
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
