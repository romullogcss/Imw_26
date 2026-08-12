import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { 
  subscribeSchedules, 
  addSchedule, 
  updateSchedule, 
  deleteSchedule,
  subscribeEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  subscribeSermons,
  addSermon,
  updateSermon,
  deleteSermon,
  subscribeMinistries,
  addMinistry,
  updateMinistry,
  deleteMinistry,
  subscribeChurchSettings,
  updateChurchSettings,
  ChurchSettingsData,
  seedInitialFirestoreData
} from '../services/firestoreService';
import { 
  uploadFile,
  uploadImageToStorage, 
  deleteFile,
  deleteImageFromStorageUrl, 
  validateImageFile 
} from '../services/storageService';
import { 
  extractYoutubeId, 
  isValidYoutubeUrl, 
  getYoutubeEmbedUrl, 
  getYoutubeWatchUrl, 
  getYoutubeThumbnailUrl 
} from '../utils/youtube';
import { 
  isValidSpotifyUrl, 
  getSpotifyEmbedUrl 
} from '../utils/spotify';
import { SPOTIFY_PLAYLIST } from '../data/churchData';
import { ScheduleItem, ChurchEvent, Sermon, Ministry } from '../types';
import { Logo } from '../components/Logo';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { SpotifyPlayer } from '../components/SpotifyPlayer';
import { 
  Lock, Mail, LogOut, Plus, Edit2, Trash2, Calendar, Clock, 
  MapPin, Video, Church, ShieldAlert, Check, X, ArrowLeft,
  Sparkles, Layers, Youtube, Tag, AlertCircle, Database,
  Upload, Image as ImageIcon, Loader2, CheckCircle2, ImagePlus, Users, HelpCircle, RefreshCw, Music
} from 'lucide-react';

interface AdminProps {
  onNavigateSite: () => void;
}

export const AdminPage: React.FC<AdminProps> = ({ onNavigateSite }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Navigation tab in Admin CMS
  const [activeTab, setActiveTab] = useState<'schedules' | 'events' | 'sermons' | 'ministries'>('schedules');

  // Firestore Collections State
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);

  // Modals state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);

  const [sermonModalOpen, setSermonModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);

  const [ministryModalOpen, setMinistryModalOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);

  // Event Image Upload State
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [eventUploadProgress, setEventUploadProgress] = useState<number | null>(null);
  const [eventUploadError, setEventUploadError] = useState<string | null>(null);

  // Ministry Leader Image Upload State
  const [leaderPhotoFile, setLeaderPhotoFile] = useState<File | null>(null);
  const [leaderPhotoPreview, setLeaderPhotoPreview] = useState<string | null>(null);
  const [leaderUploadProgress, setLeaderUploadProgress] = useState<number | null>(null);
  const [leaderUploadError, setLeaderUploadError] = useState<string | null>(null);

  // Ministry Gallery Upload State
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<number | null>(null);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);
  const [newGalleryCaption, setNewGalleryCaption] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [isSavingMinistry, setIsSavingMinistry] = useState(false);

  // Sermon Cover Image Upload State
  const [sermonCoverFile, setSermonCoverFile] = useState<File | null>(null);
  const [sermonCoverPreview, setSermonCoverPreview] = useState<string | null>(null);
  const [sermonUploadProgress, setSermonUploadProgress] = useState<number | null>(null);
  const [sermonUploadError, setSermonUploadError] = useState<string | null>(null);

  // Status/Feedback messages
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [seedingLoading, setSeedingLoading] = useState(false);

  // Church Settings (Spotify link, branding)
  const [churchSettings, setChurchSettings] = useState<ChurchSettingsData>({});
  const [spotifyUrlInput, setSpotifyUrlInput] = useState('');
  const [savingSpotify, setSavingSpotify] = useState(false);

  // Track auth status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to collections when logged in & auto-seed if empty
  useEffect(() => {
    if (!user) return;

    const unsubSched = subscribeSchedules((data) => setSchedules(data));
    const unsubEvts = subscribeEvents((data) => setEvents(data));
    const unsubSermons = subscribeSermons((data) => setSermons(data));
    const unsubMin = subscribeMinistries((data) => setMinistries(data));
    const unsubSettings = subscribeChurchSettings((settings) => {
      setChurchSettings(settings);
      if (settings.spotifyUrl) {
        setSpotifyUrlInput(settings.spotifyUrl);
      } else {
        setSpotifyUrlInput(SPOTIFY_PLAYLIST.spotifyUrl);
      }
    });

    // Automatically check and import initial site data to Supabase if tables are empty
    seedInitialFirestoreData(false).catch((err) => {
      console.error('Error auto-seeding Supabase:', err);
    });

    return () => {
      unsubSched();
      unsubEvts();
      unsubSermons();
      unsubMin();
      unsubSettings();
    };
  }, [user]);

  // Handle Save Spotify Settings
  const handleSaveSpotifySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = spotifyUrlInput.trim();
    if (!trimmed) {
      setStatusMsg({ type: 'error', text: 'Por favor, informe uma URL do Spotify.' });
      return;
    }

    if (!isValidSpotifyUrl(trimmed)) {
      setStatusMsg({ type: 'error', text: 'Link do Spotify inválido. Cole uma URL válida de show, episódio, playlist ou música do Spotify.' });
      return;
    }

    setSavingSpotify(true);
    try {
      const embedUrl = getSpotifyEmbedUrl(trimmed);
      await updateChurchSettings({
        spotifyUrl: trimmed,
        spotifyEmbedUrl: embedUrl
      });
      setStatusMsg({ type: 'success', text: 'Link do Spotify e Podcast atualizado com sucesso!' });
    } catch (err) {
      console.error('Error updating Spotify settings:', err);
      setStatusMsg({ type: 'error', text: 'Erro ao salvar link do Spotify. Tente novamente.' });
    } finally {
      setSavingSpotify(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmittingLogin(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setLoginError('E-mail ou senha incorretos. Verifique suas credenciais.');
        } else {
          setLoginError(`Erro ao fazer login: ${error.message || 'Verifique sua conexão'}`);
        }
      } else {
        setUser(data.user);
        setStatusMsg({ type: 'success', text: 'Login realizado com sucesso!' });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(`Erro ao fazer login: ${err.message || 'Verifique sua conexão'}`);
    } finally {
      setSubmittingLogin(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStatusMsg(null);
  };

  // Seed Initial Data to Supabase
  const handleSeedData = async () => {
    if (!confirm('Deseja analisar e importar todos os eventos, horários e pregações do site para o banco de dados CMS (Supabase)?')) return;
    setSeedingLoading(true);
    try {
      await seedInitialFirestoreData(true);
      setStatusMsg({ type: 'success', text: 'Todas as pregações, horários e eventos do site foram sincronizados e inseridos com sucesso no CMS!' });
    } catch (err: any) {
      console.error('Error seeding data:', err);
      setStatusMsg({ type: 'error', text: 'Erro ao sincronizar dados: ' + err.message });
    } finally {
      setSeedingLoading(false);
    }
  };

  // -------------------------------------------------------------
  // SCHEDULE FORM & HANDLERS
  // -------------------------------------------------------------
  const [scheduleForm, setScheduleForm] = useState<{
    day: ScheduleItem['day'];
    time: string;
    title: string;
    description: string;
    location: string;
    category: ScheduleItem['category'];
    isHighlight: boolean;
  }>({
    day: 'Domingo',
    time: '18:00',
    title: '',
    description: '',
    location: 'Templo Principal',
    category: 'Culto',
    isHighlight: false,
  });

  const openScheduleModal = (item?: ScheduleItem) => {
    if (item) {
      setEditingSchedule(item);
      setScheduleForm({
        day: item.day,
        time: item.time,
        title: item.title,
        description: item.description || '',
        location: item.location || 'Templo Principal',
        category: item.category || 'Culto',
        isHighlight: !!item.isHighlight
      });
    } else {
      setEditingSchedule(null);
      setScheduleForm({
        day: 'Domingo',
        time: '18:00',
        title: '',
        description: '',
        location: 'Templo Principal',
        category: 'Culto',
        isHighlight: false,
      });
    }
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.title || !scheduleForm.time) return;
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleForm);
        setStatusMsg({ type: 'success', text: 'Horário atualizado com sucesso!' });
      } else {
        await addSchedule(scheduleForm);
        setStatusMsg({ type: 'success', text: 'Novo horário criado com sucesso!' });
      }
      setScheduleModalOpen(false);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Erro ao salvar horário: ' + err.message });
    }
  };

  const handleDeleteSchedule = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${title}"?`)) return;
    try {
      await deleteSchedule(id);
      setStatusMsg({ type: 'success', text: 'Horário excluído com sucesso!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Erro ao excluir: ' + err.message });
    }
  };

  // -------------------------------------------------------------
  // EVENT FORM & HANDLERS
  // -------------------------------------------------------------
  const [eventForm, setEventForm] = useState<{
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    imageUrl: string;
    badge: string;
  }>({
    title: '',
    date: '',
    time: '19:30',
    location: 'Templo Principal',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
    badge: 'CONFERÊNCIA',
  });

  const openEventModal = (item?: ChurchEvent) => {
    setEventImageFile(null);
    setEventImagePreview(null);
    setEventUploadProgress(null);
    setEventUploadError(null);

    if (item) {
      setEditingEvent(item);
      setEventForm({
        title: item.title,
        date: item.date,
        time: item.time,
        location: item.location,
        description: item.description,
        imageUrl: item.imageUrl,
        badge: item.badge,
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '',
        date: '15 a 17 de Novembro de 2026',
        time: '19:30',
        location: 'Templo Principal',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
        badge: 'CONFERÊNCIA',
      });
    }
    setEventModalOpen(true);
  };

  const handleEventFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEventUploadError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setEventUploadError(validation.error || 'Arquivo de imagem inválido.');
      return;
    }

    setEventImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setEventImagePreview(previewUrl);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) return;
    setEventUploadError(null);

    if (!user) {
      setEventUploadError('Usuário não autenticado. Faça login novamente no painel.');
      return;
    }

    try {
      let finalImageUrl = eventForm.imageUrl;

      // If user selected a file to upload
      if (eventImageFile) {
        const folderId = editingEvent ? editingEvent.id : `evt_${Date.now()}`;
        setEventUploadProgress(0);
        finalImageUrl = await uploadImageToStorage(
          eventImageFile,
          'eventos',
          folderId,
          (progress) => setEventUploadProgress(progress)
        );

        // Delete old image from storage if replaced
        if (editingEvent && editingEvent.imageUrl && editingEvent.imageUrl !== finalImageUrl) {
          deleteImageFromStorageUrl(editingEvent.imageUrl).catch(() => {});
        }
      }

      const payload = {
        ...eventForm,
        imageUrl: finalImageUrl,
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        setStatusMsg({ type: 'success', text: 'Evento e capa salvos com sucesso!' });
      } else {
        await addEvent(payload);
        setStatusMsg({ type: 'success', text: 'Novo evento e capa criados com sucesso!' });
      }

      setEventImageFile(null);
      setEventImagePreview(null);
      setEventModalOpen(false);
    } catch (err: any) {
      console.error('Save event error:', err);
      setEventUploadError('Erro ao enviar imagem ou salvar evento: ' + (err.message || 'Falha de conexão.'));
    } finally {
      setEventUploadProgress(null);
    }
  };

  const handleDeleteEvent = async (id: string, title: string, imageUrl?: string) => {
    if (!confirm(`Tem certeza que deseja excluir o evento "${title}"?`)) return;
    try {
      await deleteEvent(id);
      if (imageUrl) {
        deleteImageFromStorageUrl(imageUrl).catch(() => {});
      }
      setStatusMsg({ type: 'success', text: 'Evento excluído com sucesso!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Erro ao excluir evento: ' + err.message });
    }
  };

  // -------------------------------------------------------------
  // MINISTRY FORM & HANDLERS
  // -------------------------------------------------------------
  const [ministryForm, setMinistryForm] = useState<Ministry>({
    id: 'criancas',
    title: '',
    subtitle: '',
    ageRange: '',
    description: '',
    detailedDescription: '',
    meetingTime: '',
    meetingLocation: '',
    leaderName: '',
    leaderRole: '',
    leaderPhoto: '',
    leaderContact: '',
    themeColor: {
      badge: 'bg-[#102bde] text-white',
      bgGradient: 'from-blue-600 to-indigo-700',
      accent: 'blue',
      border: 'border-blue-400',
      text: 'text-[#102bde]'
    },
    activities: [],
    gallery: []
  });

  const openMinistryModal = (item?: Ministry) => {
    setLeaderPhotoFile(null);
    setLeaderPhotoPreview(null);
    setLeaderUploadProgress(null);
    setLeaderUploadError(null);
    setGalleryUploadProgress(null);
    setGalleryUploadError(null);
    setNewGalleryCaption('');
    setNewGalleryUrl('');

    if (item) {
      setEditingMinistry(item);
      setMinistryForm({
        ...item,
        title: item.title || '',
        subtitle: item.subtitle || '',
        ageRange: item.ageRange || '',
        description: item.description || '',
        detailedDescription: item.detailedDescription || '',
        meetingTime: item.meetingTime || '',
        meetingLocation: item.meetingLocation || '',
        leaderName: item.leaderName || '',
        leaderRole: item.leaderRole || '',
        leaderPhoto: item.leaderPhoto || '',
        leaderContact: item.leaderContact || '',
        themeColor: item.themeColor ? { ...item.themeColor } : {
          badge: 'bg-[#102bde] text-white',
          bgGradient: 'from-blue-600 to-indigo-700',
          accent: 'blue',
          border: 'border-blue-400',
          text: 'text-[#102bde]'
        },
        isPlayful: item.isPlayful ?? false,
        activities: Array.isArray(item.activities) ? [...item.activities] : [],
        gallery: Array.isArray(item.gallery) ? item.gallery.map((g) => ({ ...g })) : []
      });
    } else {
      setEditingMinistry(null);
      setMinistryForm({
        id: `min_${Date.now()}`,
        title: '',
        subtitle: 'Ministério',
        ageRange: 'Geral',
        description: '',
        detailedDescription: '',
        meetingTime: 'Aos sábados, 19:30',
        meetingLocation: 'Templo Principal',
        leaderName: '',
        leaderRole: 'Líder de Ministério',
        leaderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        leaderContact: 'ministerio@igrejametodista.org.br',
        themeColor: {
          badge: 'bg-[#102bde] text-white',
          bgGradient: 'from-blue-600 to-indigo-700',
          accent: 'blue',
          border: 'border-blue-400',
          text: 'text-[#102bde]'
        },
        activities: ['Encontros semanais', 'Impacto Evangelístico'],
        gallery: []
      });
    }
    setMinistryModalOpen(true);
  };

  const handleLeaderPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLeaderUploadError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setLeaderUploadError(validation.error || 'Foto inválida.');
      return;
    }

    setLeaderPhotoFile(file);
    setLeaderPhotoPreview(URL.createObjectURL(file));
  };

  const handleGalleryFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      setGalleryUploadError('Usuário não autenticado. Faça login no painel para realizar o upload.');
      e.target.value = '';
      return;
    }

    setGalleryUploadError(null);
    setGalleryUploadProgress(5);

    const folderId = editingMinistry ? editingMinistry.id : ministryForm.id || `min_${Date.now()}`;
    const uploadedItems: { id: string; url: string; caption: string }[] = [];

    try {
      const totalFiles = files.length;
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setGalleryUploadError(validation.error || `Arquivo ${file.name} inválido`);
          continue;
        }

        const url = await uploadImageToStorage(
          file,
          'ministerios',
          folderId,
          (progress) => {
            const overallProgress = Math.round(((i + progress / 100) / totalFiles) * 100);
            setGalleryUploadProgress(overallProgress);
          }
        );

        uploadedItems.push({
          id: `img_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          url,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Foto do Ministério'
        });
      }

      setMinistryForm((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...uploadedItems]
      }));

      setStatusMsg({ type: 'success', text: `${uploadedItems.length} foto(s) enviada(s) para a galeria com sucesso!` });
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      setGalleryUploadError('Erro ao enviar foto(s): ' + (err.message || 'Falha de comunicação.'));
    } finally {
      setGalleryUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleRemoveGalleryItem = (photoId: string, photoUrl: string) => {
    setMinistryForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((item) => item.id !== photoId)
    }));
    if (photoUrl) {
      deleteImageFromStorageUrl(photoUrl).catch(() => {});
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl) return;
    setMinistryForm((prev) => ({
      ...prev,
      gallery: [
        ...prev.gallery,
        {
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          url: newGalleryUrl,
          caption: newGalleryCaption || 'Foto da Galeria'
        }
      ]
    }));
    setNewGalleryUrl('');
    setNewGalleryCaption('');
  };

  const handleSaveMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ministryForm.title) return;
    setLeaderUploadError(null);

    if (!user) {
      setLeaderUploadError('Usuário não autenticado. Faça login novamente no painel.');
      return;
    }

    setIsSavingMinistry(true);

    try {
      let finalLeaderPhoto = ministryForm.leaderPhoto;

      if (leaderPhotoFile) {
        const folderId = editingMinistry ? editingMinistry.id : ministryForm.id || `min_${Date.now()}`;
        setLeaderUploadProgress(0);
        finalLeaderPhoto = await uploadImageToStorage(
          leaderPhotoFile,
          'ministerios',
          folderId,
          (progress) => setLeaderUploadProgress(progress)
        );

        if (editingMinistry && editingMinistry.leaderPhoto && editingMinistry.leaderPhoto !== finalLeaderPhoto) {
          deleteImageFromStorageUrl(editingMinistry.leaderPhoto).catch(() => {});
        }
      }

      const cleanedActivities = (ministryForm.activities || [])
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const payload = {
        ...ministryForm,
        activities: cleanedActivities,
        leaderPhoto: finalLeaderPhoto,
      };

      if (editingMinistry) {
        await updateMinistry(editingMinistry.id, payload);
        setStatusMsg({ type: 'success', text: `Ministério "${payload.title}" atualizado com sucesso!` });
      } else {
        await addMinistry(payload);
        setStatusMsg({ type: 'success', text: `Novo ministério "${payload.title}" cadastrado com sucesso!` });
      }

      setLeaderPhotoFile(null);
      setLeaderPhotoPreview(null);
      setMinistryModalOpen(false);
    } catch (err: any) {
      console.error('Save ministry error:', err);
      setLeaderUploadError('Erro ao salvar ministério: ' + (err.message || 'Falha de conexão.'));
      setStatusMsg({ type: 'error', text: 'Erro ao salvar ministério: ' + (err.message || 'Falha de conexão.') });
    } finally {
      setLeaderUploadProgress(null);
      setIsSavingMinistry(false);
    }
  };

  const handleDeleteMinistry = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o ministério "${title}"?`)) return;
    try {
      await deleteMinistry(id);
      setStatusMsg({ type: 'success', text: 'Ministério excluído com sucesso!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Erro ao excluir ministério: ' + err.message });
    }
  };

  // -------------------------------------------------------------
  // SERMON FORM & HANDLERS
  // -------------------------------------------------------------
  const [sermonForm, setSermonForm] = useState<{
    title: string;
    preacher: string;
    date: string;
    scripture: string;
    duration: string;
    category: string;
    youtubeUrl: string;
    summary: string;
    thumbnail: string;
    imagePath?: string;
  }>({
    title: '',
    preacher: 'Pr. Gessivaldo Gomes Rebouças',
    date: '10 de Agosto de 2026',
    scripture: 'João 3:16',
    duration: '45 min',
    category: 'Domingo da Família',
    youtubeUrl: '',
    summary: '',
    thumbnail: '',
    imagePath: '',
  });

  const openSermonModal = (item?: Sermon) => {
    setSermonCoverFile(null);
    setSermonCoverPreview(null);
    setSermonUploadProgress(null);
    setSermonUploadError(null);

    if (item) {
      setEditingSermon(item);
      setSermonForm({
        title: item.title,
        preacher: item.preacher,
        date: item.date,
        scripture: item.scripture,
        duration: item.duration,
        category: item.category,
        youtubeUrl: item.youtubeUrl || item.youtubeId || '',
        summary: item.summary || '',
        thumbnail: item.thumbnail || item.imageUrl || '',
        imagePath: item.imagePath || '',
      });
    } else {
      setEditingSermon(null);
      setSermonForm({
        title: '',
        preacher: 'Pr. Gessivaldo Gomes Rebouças',
        date: '10 de Agosto de 2026',
        scripture: 'João 3:16',
        duration: '45 min',
        category: 'Domingo da Família',
        youtubeUrl: '',
        summary: '',
        thumbnail: '',
        imagePath: '',
      });
    }
    setSermonModalOpen(true);
  };

  const handleSermonFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSermonUploadError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setSermonUploadError(validation.error || 'Arquivo de capa inválido.');
      return;
    }

    setSermonCoverFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSermonCoverPreview(previewUrl);
  };

  const handleSaveSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sermonForm.title || !sermonForm.preacher) return;
    setSermonUploadError(null);

    if (!isValidYoutubeUrl(sermonForm.youtubeUrl)) {
      setStatusMsg({ type: 'error', text: 'Link do YouTube inválido. Cole a URL completa do vídeo.' });
      return;
    }

    try {
      const ytId = extractYoutubeId(sermonForm.youtubeUrl) || '';
      const embedUrl = getYoutubeEmbedUrl(ytId);
      const watchUrl = getYoutubeWatchUrl(sermonForm.youtubeUrl);
      
      let finalImageUrl = sermonForm.thumbnail.trim();
      let finalImagePath = sermonForm.imagePath || '';

      // Upload sermon cover file if user selected one
      if (sermonCoverFile) {
        const folderId = editingSermon ? editingSermon.id : `sermon_${Date.now()}`;
        setSermonUploadProgress(0);

        const uploadRes = await uploadFile(
          sermonCoverFile,
          'pregacoes',
          folderId,
          undefined,
          (progress) => setSermonUploadProgress(progress)
        );

        finalImageUrl = uploadRes.publicUrl;
        finalImagePath = uploadRes.storagePath;

        // If editing and replaced an existing uploaded cover, delete old cover from Supabase Storage
        if (editingSermon) {
          const oldPathOrUrl = editingSermon.imagePath || editingSermon.thumbnail;
          if (oldPathOrUrl && oldPathOrUrl !== finalImageUrl) {
            deleteFile(oldPathOrUrl).catch(() => {});
          }
        }
      }

      // If no custom image or upload, default to YouTube thumbnail
      if (!finalImageUrl) {
        finalImageUrl = getYoutubeThumbnailUrl(ytId);
      }

      const fullSermon = {
        ...sermonForm,
        youtubeId: ytId,
        youtubeUrl: watchUrl,
        embedUrl,
        thumbnail: finalImageUrl,
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
      };

      if (editingSermon) {
        await updateSermon(editingSermon.id, fullSermon);
        setStatusMsg({ type: 'success', text: 'Pregação e capa atualizadas com sucesso!' });
      } else {
        await addSermon(fullSermon);
        setStatusMsg({ type: 'success', text: 'Nova pregação salva com sucesso!' });
      }

      setSermonCoverFile(null);
      setSermonCoverPreview(null);
      setSermonModalOpen(false);
    } catch (err: any) {
      console.error('Error saving sermon:', err);
      setSermonUploadError('Erro ao enviar capa ou salvar pregação: ' + (err.message || 'Falha de conexão.'));
    } finally {
      setSermonUploadProgress(null);
    }
  };

  const handleDeleteSermon = async (id: string, title: string, thumbnail?: string, imagePath?: string) => {
    if (!confirm(`Tem certeza que deseja excluir a pregação "${title}"?`)) return;
    try {
      await deleteSermon(id);
      if (imagePath || thumbnail) {
        deleteFile(imagePath || thumbnail).catch(() => {});
      }
      setStatusMsg({ type: 'success', text: 'Pregação excluída com sucesso!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Erro ao excluir pregação: ' + err.message });
    }
  };

  // -------------------------------------------------------------
  // RENDER LOADING / AUTH CHECK
  // -------------------------------------------------------------
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#102bde] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-sans font-bold uppercase tracking-wider text-slate-300">
          Carregando Painel Administrativo...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER LOGIN SCREEN (IF NOT AUTHENTICATED)
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#102bde]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <Logo variant="dark" size="lg" />
            </div>
            <h1 className="font-sans font-black text-xl uppercase tracking-tight text-white flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-[#102bde]" />
              <span>PAINEL ADMINISTRATIVO</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Acesso restrito para líderes e secretários autorizados da IMW Cosmópolis.
            </p>
          </div>

          {loginError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-extrabold uppercase text-slate-300 mb-1.5">
                E-mail de Administrador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@imwcosmopolis.org"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#102bde] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-extrabold uppercase text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#102bde] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingLogin}
              className="w-full py-3.5 px-4 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] disabled:opacity-50 text-white font-sans font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#102bde]/25 flex items-center justify-center gap-2"
            >
              {submittingLogin ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AUTENTICANDO...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ENTRAR NO PAINEL</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center space-y-3">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#102bde] hover:underline font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Como criar meu usuário no Firebase Console?</span>
            </button>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              * O cadastro de novos administradores é gerenciado com segurança via Firebase Console.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateSite}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para o site público</span>
              </button>
            </div>
          </div>
        </div>

        {/* HELP MODAL FOR CREATING ADMIN USER */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative space-y-5 my-8">
              <button
                onClick={() => setShowHelpModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#102bde]/20 border border-[#102bde]/30 text-[#102bde] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-black text-lg text-white uppercase">
                    Como criar seu usuário Admin
                  </h3>
                  <p className="text-xs text-slate-400">
                    Siga o passo a passo para cadastrar seu e-mail e senha no Supabase
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#102bde] text-white flex items-center justify-center text-xs">1</span>
                    <span>Acesse o Supabase Dashboard</span>
                  </div>
                  <p className="pl-7 text-slate-400">
                    Entre em <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#102bde] underline font-bold">supabase.com/dashboard</a> com sua conta.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#102bde] text-white flex items-center justify-center text-xs">2</span>
                    <span>Selecione seu Projeto</span>
                  </div>
                  <p className="pl-7 text-slate-400">
                    Selecione seu projeto na lista do Supabase.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#102bde] text-white flex items-center justify-center text-xs">3</span>
                    <span>Acesse Authentication &gt; Users</span>
                  </div>
                  <p className="pl-7 text-slate-400">
                    No menu lateral esquerdo, clique no ícone de <strong className="text-white">Authentication</strong> e depois na aba <strong className="text-white">Users</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#102bde] text-white flex items-center justify-center text-xs">4</span>
                    <span>Clique em "Add User" &gt; "Create User"</span>
                  </div>
                  <p className="pl-7 text-slate-400">
                    Clique em <strong className="text-white">Add User</strong>, selecione <strong className="text-white">Create User</strong>, informe o seu e-mail e defina uma senha.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#102bde] text-white flex items-center justify-center text-xs">5</span>
                    <span>Acesse o Painel Admin</span>
                  </div>
                  <p className="pl-7 text-slate-400">
                    Volte para esta tela de login e entre usando o e-mail e a senha que acabou de cadastrar!
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full py-3 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Entendi, vou cadastrar!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER ADMIN DASHBOARD (LOGGED IN)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      
      {/* ADMIN HEADER BAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#102bde] text-white flex items-center justify-center font-black text-base shadow-sm">
              IMW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg uppercase tracking-tight text-white">
                  PAINEL DE CONTROLE (CMS)
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">
                  Ao Vivo
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Sessão ativa: <strong className="text-slate-200">{user.email}</strong>
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onNavigateSite}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Ver Site Público</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* FEEDBACK STATUS BANNER */}
      {statusMsg && (
        <div className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider text-center flex items-center justify-center gap-2 ${
          statusMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="underline cursor-pointer ml-2">Fechar</button>
        </div>
      )}

      {/* MAIN CONTENT WITH SIDEBAR OR TOP TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 block mb-1">
              GESTÃO DE CONTEÚDO
            </span>

            <button
              onClick={() => setActiveTab('schedules')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-[#102bde] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>Programação</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'schedules' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {schedules.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-[#102bde] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>Eventos Especiais</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'events' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sermons')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'sermons'
                  ? 'bg-[#102bde] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Youtube className="w-4 h-4" />
                <span>Pregações (Sermões)</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'sermons' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {sermons.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ministries')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'ministries'
                  ? 'bg-[#102bde] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Ministérios & Galeria</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'ministries' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {ministries.length}
              </span>
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-white uppercase text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Sincronização em Tempo Real</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Quaisquer alterações feitas nesta tela são salvas diretamente no banco de dados Supabase e entram em vigor instantaneamente para todos os visitantes do site.
            </p>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="lg:col-span-9 space-y-6">

          {/* TAB 1: PROGRAMAÇÃO (SCHEDULES) */}
          {activeTab === 'schedules' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-0.5">
                    AGENDA SEMANAL DA IGREJA
                  </span>
                  <h2 className="font-black text-2xl uppercase text-slate-900">
                    PROGRAMAÇÃO E CULTOS
                  </h2>
                </div>

                <button
                  onClick={() => openScheduleModal()}
                  className="px-4 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>NOVO CULTO / HORÁRIO</span>
                </button>
              </div>

              {schedules.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm uppercase">Nenhum horário cadastrado no banco.</p>
                  <button
                    onClick={handleSeedData}
                    className="text-xs font-bold text-[#102bde] underline cursor-pointer"
                  >
                    Clique aqui para carregar a programação padrão
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-black uppercase tracking-wider">
                        <th className="py-3 px-4">Dia</th>
                        <th className="py-3 px-4">Horário</th>
                        <th className="py-3 px-4">Culto / Evento</th>
                        <th className="py-3 px-4">Categoria</th>
                        <th className="py-3 px-4">Local</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {schedules.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-black text-slate-900 whitespace-nowrap">
                            {item.day}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#102bde] whitespace-nowrap">
                            {item.time}h
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-black text-slate-900">{item.title}</div>
                            {item.description && (
                              <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.description}</div>
                            )}
                            {item.isHighlight && (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-[#102bde] text-white text-[9px] font-black uppercase mt-1">
                                Destaque
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.location}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => openScheduleModal(item)}
                                className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(item.id, item.title)}
                                className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVENTOS (EVENTS) */}
          {activeTab === 'events' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-0.5">
                    CONFERÊNCIAS & RETIROS
                  </span>
                  <h2 className="font-black text-2xl uppercase text-slate-900">
                    EVENTOS ESPECIAIS
                  </h2>
                </div>

                <button
                  onClick={() => openEventModal()}
                  className="px-4 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>NOVO EVENTO</span>
                </button>
              </div>

              {events.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm uppercase">Nenhum evento especial cadastrado.</p>
                  <button
                    onClick={handleSeedData}
                    className="text-xs font-bold text-[#102bde] underline cursor-pointer"
                  >
                    Clique aqui para carregar os eventos padrão
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((evt) => (
                    <div key={evt.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col justify-between">
                      <div className="relative h-36 bg-slate-200 overflow-hidden">
                        <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#102bde] text-white font-black text-[10px] uppercase">
                          {evt.badge}
                        </span>
                      </div>
                      <div className="p-4 space-y-2 flex-1">
                        <h3 className="font-black text-base text-slate-900 uppercase leading-snug">{evt.title}</h3>
                        <p className="text-xs font-bold text-[#102bde]">{evt.date} • {evt.time}</p>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>{evt.location}</span>
                        </p>
                        {evt.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{evt.description}</p>
                        )}
                      </div>
                      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEventModal(evt)}
                          className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PREGAÇÕES (SERMONS) */}
          {activeTab === 'sermons' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-0.5">
                    MENSAGENS & TRANSMISSÕES
                  </span>
                  <h2 className="font-black text-2xl uppercase text-slate-900">
                    PREGAÇÕES & SERMÕES
                  </h2>
                </div>

                <button
                  onClick={() => openSermonModal()}
                  className="px-4 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>NOVA PREGAÇÃO</span>
                </button>
              </div>

              {/* CARD: CONFIGURAÇÃO DO SPOTIFY / PODCAST */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Music className="w-5 h-5 shrink-0" />
                    <h3 className="font-extrabold text-base uppercase tracking-tight text-slate-900">
                      Integração Spotify & Podcast
                    </h3>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                    Página Mensagens
                  </span>
                </div>

                <form onSubmit={handleSaveSpotifySettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Link do Spotify (Podcast / Show / Playlist / Episódio / Música)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={spotifyUrlInput}
                        onChange={(e) => setSpotifyUrlInput(e.target.value)}
                        placeholder="https://open.spotify.com/show/..."
                        className={`flex-1 px-3.5 py-2.5 rounded-xl border font-medium text-slate-800 text-sm focus:outline-none ${
                          spotifyUrlInput.trim() && !isValidSpotifyUrl(spotifyUrlInput)
                            ? 'border-red-500 bg-red-50/50 focus:border-red-600'
                            : 'border-slate-300 focus:border-emerald-600'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={savingSpotify}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <Check className="w-4 h-4" />
                        <span>{savingSpotify ? 'Salvando...' : 'Salvar Link'}</span>
                      </button>
                    </div>

                    {/* Validation Message */}
                    {spotifyUrlInput.trim() && (
                      <div className="mt-2">
                        {isValidSpotifyUrl(spotifyUrlInput) ? (
                          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Link do Spotify reconhecido com sucesso! Formato de embed gerado.</span>
                          </p>
                        ) : (
                          <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Link do Spotify inválido. Cole a URL completa (ex: https://open.spotify.com/show/0axmDAHLlBF1rDWvhMkrUA).</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Live Preview in CMS */}
                  {spotifyUrlInput.trim() && isValidSpotifyUrl(spotifyUrlInput) && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                        Pré-visualização do Player do Spotify no CMS:
                      </span>
                      <SpotifyPlayer
                        spotifyUrl={spotifyUrlInput}
                        title="Pré-visualização do Spotify no CMS"
                      />
                    </div>
                  )}
                </form>
              </div>

              {sermons.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <Youtube className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm uppercase">Nenhuma pregação cadastrada.</p>
                  <button
                    onClick={handleSeedData}
                    className="text-xs font-bold text-[#102bde] underline cursor-pointer"
                  >
                    Clique aqui para carregar as pregações padrão
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sermons.map((sermon) => (
                    <div key={sermon.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col justify-between">
                      <div className="relative h-40 bg-slate-900 overflow-hidden">
                        <img src={sermon.thumbnail} alt={sermon.title} className="w-full h-full object-cover opacity-80" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#102bde] text-white font-black text-[10px] uppercase">
                          {sermon.category}
                        </span>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-slate-200 text-[10px] font-bold">
                          {sermon.duration}
                        </span>
                      </div>

                      <div className="p-4 space-y-2 flex-1">
                        <h3 className="font-black text-base text-slate-900 uppercase leading-snug">{sermon.title}</h3>
                        <p className="text-xs font-bold text-[#102bde]">Pregador: {sermon.preacher}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Texto: {sermon.scripture}</span>
                          <span>{sermon.date}</span>
                        </div>
                      </div>

                      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between">
                        <a 
                          href={sermon.youtubeUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline"
                        >
                          <Youtube className="w-4 h-4" /> Ver no YouTube
                        </a>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openSermonModal(sermon)}
                            className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSermon(sermon.id, sermon.title, sermon.thumbnail, sermon.imagePath)}
                            className="px-2.5 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MINISTÉRIOS & GALERIA */}
          {activeTab === 'ministries' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[#102bde] text-xs font-black uppercase tracking-widest block mb-0.5">
                    GRUPOS, LIDERANÇAS & FOTOS
                  </span>
                  <h2 className="font-black text-2xl uppercase text-slate-900">
                    MINISTÉRIOS DA IGREJA
                  </h2>
                </div>

                <button
                  onClick={() => openMinistryModal()}
                  className="px-4 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>NOVO MINISTÉRIO</span>
                </button>
              </div>

              {ministries.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm uppercase">Nenhum ministério cadastrado.</p>
                  <button
                    onClick={handleSeedData}
                    className="text-xs font-bold text-[#102bde] underline cursor-pointer"
                  >
                    Clique aqui para carregar os 7 ministérios padrão
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ministries.map((min) => (
                    <div key={min.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 flex flex-col justify-between">
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-[#102bde] text-white font-black text-[10px] uppercase">
                            {min.ageRange || 'Geral'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-[#102bde]" />
                            {min.gallery?.length || 0} fotos na galeria
                          </span>
                        </div>

                        <div>
                          <h3 className="font-black text-lg text-slate-900 uppercase leading-snug">{min.title}</h3>
                          <p className="text-xs font-bold text-[#102bde]">{min.subtitle}</p>
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                          <img 
                            src={min.leaderPhoto} 
                            alt={min.leaderName} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-[#102bde] shrink-0" 
                          />
                          <div className="text-xs">
                            <p className="font-bold text-slate-800">{min.leaderName}</p>
                            <p className="text-[10px] text-slate-500">{min.leaderRole}</p>
                          </div>
                        </div>

                        {min.gallery && min.gallery.length > 0 && (
                          <div className="flex gap-1.5 overflow-x-auto pt-2">
                            {min.gallery.slice(0, 4).map((g) => (
                              <img key={g.id} src={g.url} alt={g.caption} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                            ))}
                            {min.gallery.length > 4 && (
                              <div className="w-12 h-12 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                +{min.gallery.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
                        <button
                          onClick={() => openMinistryModal(min)}
                          className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar / Gerenciar Fotos
                        </button>
                        <button
                          onClick={() => handleDeleteMinistry(min.id, min.title)}
                          className="px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: PROGRAMAÇÃO (SCHEDULE FORM)                          */}
      {/* ------------------------------------------------------------- */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-xl uppercase text-slate-900">
                {editingSchedule ? 'Editar Horário / Culto' : 'Novo Horário / Culto'}
              </h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Dia da Semana</label>
                  <select
                    value={scheduleForm.day}
                    onChange={(e: any) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  >
                    <option value="Domingo">Domingo</option>
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Horário (ex: 19:30)</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Nome do Culto / Evento</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="ex: Culto da Família"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Categoria</label>
                  <select
                    value={scheduleForm.category}
                    onChange={(e: any) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  >
                    <option value="Culto">Culto</option>
                    <option value="Oração">Oração</option>
                    <option value="Estudo">Estudo</option>
                    <option value="Reunião">Reunião</option>
                    <option value="Jovens">Jovens</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Local</label>
                  <input
                    type="text"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Descrição (opcional)</label>
                <textarea
                  rows={2}
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isHighlight"
                  checked={scheduleForm.isHighlight}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, isHighlight: e.target.checked })}
                  className="w-4 h-4 text-[#102bde] rounded"
                />
                <label htmlFor="isHighlight" className="font-bold uppercase text-slate-700 cursor-pointer">
                  Marcar como cultivo principal / destaque
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: EVENTOS (EVENT FORM)                                 */}
      {/* ------------------------------------------------------------- */}
      {eventModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-xl uppercase text-slate-900">
                {editingEvent ? 'Editar Evento Especial' : 'Novo Evento Especial'}
              </h3>
              <button onClick={() => setEventModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="ex: Conferência de Avivamento 2026"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Data (ex: 15 a 17 de Nov)</label>
                  <input
                    type="text"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Horário (ex: 19:30)</label>
                  <input
                    type="text"
                    required
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Etiqueta / Badge</label>
                  <input
                    type="text"
                    value={eventForm.badge}
                    onChange={(e) => setEventForm({ ...eventForm, badge: e.target.value })}
                    placeholder="CONFERÊNCIA, ACAMPAMENTO, etc"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Local</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              {/* EVENT COVER IMAGE UPLOAD & PREVIEW */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                <label className="block font-bold uppercase text-slate-800 text-xs flex items-center justify-between">
                  <span>Imagem de Capa do Evento</span>
                  <span className="text-[10px] text-slate-500 font-normal">.JPG, .PNG, .WEBP (Até 5MB)</span>
                </label>

                {/* Upload Error Banner */}
                {eventUploadError && (
                  <div className="p-2 rounded bg-red-100 border border-red-300 text-red-700 text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{eventUploadError}</span>
                  </div>
                )}

                {/* Image Preview Box */}
                {(eventImagePreview || eventForm.imageUrl) && (
                  <div className="relative h-40 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 group">
                    <img 
                      src={eventImagePreview || eventForm.imageUrl} 
                      alt="Pré-visualização da Capa" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg backdrop-blur-sm">
                      <span className="text-[10px] text-white font-bold px-1.5 uppercase">
                        {eventImagePreview ? 'Nova Imagem Selecionada' : 'Imagem Atual'}
                      </span>
                    </div>
                  </div>
                )}

                {/* File Upload Progress Bar */}
                {eventUploadProgress !== null && (
                  <div className="space-y-1 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-xs font-bold text-[#102bde]">
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Enviando imagem para o Supabase Storage...
                      </span>
                      <span>{eventUploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#102bde] h-full transition-all duration-300"
                        style={{ width: `${eventUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* File Upload Button & Direct URL Option */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Enviar do Computador
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleEventFileSelect}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#102bde] file:text-white hover:file:bg-[#0d23b8] file:cursor-pointer cursor-pointer border border-slate-300 rounded-lg bg-white p-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Ou Cole uma URL da Web
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={eventForm.imageUrl}
                      onChange={(e) => {
                        setEventImageFile(null);
                        setEventImagePreview(null);
                        setEventForm({ ...eventForm, imageUrl: e.target.value });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#102bde]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Descrição do Evento</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={eventUploadProgress !== null}
                  className={`px-5 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition-all ${
                    eventUploadProgress !== null
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-[#102bde] hover:bg-[#0d23b8] text-white cursor-pointer'
                  }`}
                >
                  {eventUploadProgress !== null ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando ({eventUploadProgress}%)...</span>
                    </>
                  ) : (
                    <span>Salvar Evento</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: PREGAÇÕES (SERMON FORM)                               */}
      {/* ------------------------------------------------------------- */}
      {sermonModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-xl uppercase text-slate-900">
                {editingSermon ? 'Editar Pregação' : 'Nova Pregação'}
              </h3>
              <button onClick={() => setSermonModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSermon} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Título da Pregação</label>
                <input
                  type="text"
                  required
                  value={sermonForm.title}
                  onChange={(e) => setSermonForm({ ...sermonForm, title: e.target.value })}
                  placeholder="ex: O Poder da Oração Persistente"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Pregador</label>
                  <input
                    type="text"
                    required
                    value={sermonForm.preacher}
                    onChange={(e) => setSermonForm({ ...sermonForm, preacher: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Data (ex: 10/08/2026)</label>
                  <input
                    type="text"
                    required
                    value={sermonForm.date}
                    onChange={(e) => setSermonForm({ ...sermonForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Texto Bíblico Base</label>
                  <input
                    type="text"
                    value={sermonForm.scripture}
                    onChange={(e) => setSermonForm({ ...sermonForm, scripture: e.target.value })}
                    placeholder="ex: Mateus 6:9-13"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Duração (ex: 45 min)</label>
                  <input
                    type="text"
                    value={sermonForm.duration}
                    onChange={(e) => setSermonForm({ ...sermonForm, duration: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={sermonForm.category}
                  onChange={(e) => setSermonForm({ ...sermonForm, category: e.target.value })}
                  placeholder="ex: Domingo da Família, Culto de Doutrina"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Link do Vídeo no YouTube (ou ID do vídeo)</label>
                <input
                  type="text"
                  required
                  value={sermonForm.youtubeUrl}
                  onChange={(e) => setSermonForm({ ...sermonForm, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`w-full px-3 py-2.5 rounded-xl border font-medium text-slate-800 focus:outline-none ${
                    sermonForm.youtubeUrl.trim() && !isValidYoutubeUrl(sermonForm.youtubeUrl)
                      ? 'border-red-500 focus:border-red-600 bg-red-50/50'
                      : 'border-slate-300 focus:border-[#102bde]'
                  }`}
                />
                {sermonForm.youtubeUrl.trim() && !isValidYoutubeUrl(sermonForm.youtubeUrl) && (
                  <p className="text-xs font-bold text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Link do YouTube inválido. Cole a URL completa do vídeo.</span>
                  </p>
                )}
              </div>

              {/* Realtime Video Embed Preview */}
              {sermonForm.youtubeUrl.trim() && isValidYoutubeUrl(sermonForm.youtubeUrl) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Pré-visualização do Player:</span>
                  <YouTubePlayer
                    urlOrId={sermonForm.youtubeUrl}
                    title={sermonForm.title || 'Pré-visualização do Vídeo'}
                    thumbnail={sermonForm.thumbnail}
                  />
                </div>
              )}

              {/* Capa da Pregação Upload & Link (Supabase Storage) */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-xs uppercase text-slate-800 tracking-wider">
                    Capa da Pregação (Imagem Personalizada)
                  </label>
                  <span className="text-[10px] font-bold text-[#102bde] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                    Supabase Storage
                  </span>
                </div>

                {/* Upload Error Banner */}
                {sermonUploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{sermonUploadError}</span>
                  </div>
                )}

                {/* File Upload Progress Bar */}
                {sermonUploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-[#102bde]">
                      <span>Enviando capa para o Supabase Storage...</span>
                      <span>{sermonUploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#102bde] h-full transition-all duration-300"
                        style={{ width: `${sermonUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* File Upload Selector */}
                <div className="space-y-2">
                  <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#102bde] rounded-xl cursor-pointer bg-white transition-colors group">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-[#102bde]">
                      <Upload className="w-4 h-4 text-[#102bde]" />
                      <span>
                        {sermonCoverFile ? sermonCoverFile.name : 'Upload de Capa (JPG, PNG ou WEBP)'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Limite máximo de 5MB</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleSermonFileSelect}
                      disabled={sermonUploadProgress !== null}
                      className="hidden"
                    />
                  </label>

                  {/* Option for Direct URL */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Ou cole o link direto da imagem na web:
                    </label>
                    <input
                      type="text"
                      value={sermonForm.thumbnail}
                      onChange={(e) => {
                        setSermonForm({ ...sermonForm, thumbnail: e.target.value });
                        setSermonCoverFile(null);
                        setSermonCoverPreview(null);
                      }}
                      placeholder="https://exemplo.com/minha-capa.jpg"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#102bde] bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Cover Preview Box */}
                {(sermonCoverPreview || sermonForm.thumbnail.trim() || (sermonForm.youtubeUrl.trim() && isValidYoutubeUrl(sermonForm.youtubeUrl))) && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Pré-visualização da Capa:
                    </span>
                    <div className="relative aspect-video max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-slate-200 shadow-xs">
                      <img
                        src={sermonCoverPreview || sermonForm.thumbnail.trim() || getYoutubeThumbnailUrl(sermonForm.youtubeUrl)}
                        alt="Pré-visualização da capa"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Resumo / Esboço da Mensagem (Opcional)</label>
                <textarea
                  rows={3}
                  value={sermonForm.summary}
                  onChange={(e) => setSermonForm({ ...sermonForm, summary: e.target.value })}
                  placeholder="Breve resumo dos pontos principais ou versículos citados na pregação..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={sermonUploadProgress !== null}
                  onClick={() => setSermonModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sermonUploadProgress !== null}
                  className="px-5 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {sermonUploadProgress !== null ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando Capa ({sermonUploadProgress}%)...</span>
                    </>
                  ) : (
                    <span>{editingSermon ? 'Salvar Alterações' : 'Cadastrar Pregação'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: MINISTÉRIOS & GALERIA (MINISTRY FORM)                */}
      {/* ------------------------------------------------------------- */}
      {ministryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[#102bde] text-[10px] font-black uppercase tracking-widest block">
                  GESTÃO DE MINISTÉRIO & GALERIA
                </span>
                <h3 className="font-black text-xl uppercase text-slate-900">
                  {editingMinistry ? `Editar ${editingMinistry.title}` : 'Novo Ministério'}
                </h3>
              </div>
              <button onClick={() => setMinistryModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMinistry} className="space-y-5 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Nome do Ministério</label>
                  <input
                    type="text"
                    required
                    value={ministryForm.title}
                    onChange={(e) => setMinistryForm({ ...ministryForm, title: e.target.value })}
                    placeholder="ex: Ministério de Crianças"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Subtítulo / Lema</label>
                  <input
                    type="text"
                    value={ministryForm.subtitle}
                    onChange={(e) => setMinistryForm({ ...ministryForm, subtitle: e.target.value })}
                    placeholder="ex: Geração Futuro"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Faixa Etária</label>
                  <input
                    type="text"
                    value={ministryForm.ageRange}
                    onChange={(e) => setMinistryForm({ ...ministryForm, ageRange: e.target.value })}
                    placeholder="ex: 0 a 9 anos"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Horário dos Encontros</label>
                  <input
                    type="text"
                    value={ministryForm.meetingTime}
                    onChange={(e) => setMinistryForm({ ...ministryForm, meetingTime: e.target.value })}
                    placeholder="ex: Domingos, 19:30"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Local</label>
                  <input
                    type="text"
                    value={ministryForm.meetingLocation}
                    onChange={(e) => setMinistryForm({ ...ministryForm, meetingLocation: e.target.value })}
                    placeholder="ex: Sala Infantil / Anexo"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              {/* LIDERANÇA INFO & FOTO DO LÍDER */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <span className="font-black text-xs uppercase text-[#102bde] block">Liderança do Ministério</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Nome do Líder</label>
                    <input
                      type="text"
                      value={ministryForm.leaderName}
                      onChange={(e) => setMinistryForm({ ...ministryForm, leaderName: e.target.value })}
                      placeholder="ex: Maria Oliveira"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-bold focus:outline-none focus:border-[#102bde]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      value={ministryForm.leaderRole}
                      onChange={(e) => setMinistryForm({ ...ministryForm, leaderRole: e.target.value })}
                      placeholder="ex: Coordenadora Geral"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:border-[#102bde]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Contato / E-mail</label>
                    <input
                      type="text"
                      value={ministryForm.leaderContact}
                      onChange={(e) => setMinistryForm({ ...ministryForm, leaderContact: e.target.value })}
                      placeholder="contato@..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:border-[#102bde]"
                    />
                  </div>
                </div>

                {/* Foto do Líder Upload */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block font-bold uppercase text-slate-700 text-[11px] flex items-center justify-between">
                    <span>Foto do Líder</span>
                    <span className="text-[10px] text-slate-400 font-normal">.JPG, .PNG, .WEBP (Até 5MB)</span>
                  </label>

                  {leaderUploadError && (
                    <div className="p-2 rounded bg-red-100 border border-red-300 text-red-700 text-xs font-bold">
                      {leaderUploadError}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <img
                      src={leaderPhotoPreview || ministryForm.leaderPhoto}
                      alt={ministryForm.leaderName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#102bde] shadow-sm shrink-0"
                    />

                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleLeaderPhotoSelect}
                        className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#102bde] file:text-white hover:file:bg-[#0d23b8] file:cursor-pointer cursor-pointer border border-slate-300 rounded-lg bg-white p-1"
                      />

                      {leaderUploadProgress !== null && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-[#102bde]">
                            <span>Enviando foto do líder...</span>
                            <span>{leaderUploadProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#102bde] h-full" style={{ width: `${leaderUploadProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* UPLOAD DE MÚLTIPLAS IMAGENS PARA A GALERIA */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs uppercase text-[#102bde] block">Galeria de Fotos do Ministério</span>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Envie múltiplos arquivos (.jpg, .png, .webp) para atualizar a galeria do ministério.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#102bde] text-white font-black text-xs">
                    {ministryForm.gallery.length} fotos
                  </span>
                </div>

                {galleryUploadError && (
                  <div className="p-2 rounded bg-red-100 border border-red-300 text-red-700 text-xs font-bold">
                    {galleryUploadError}
                  </div>
                )}

                {/* Multi-file Upload Input Box */}
                <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#102bde]" />
                    <span>Upload de Múltiplas Fotos (Supabase Storage)</span>
                  </label>
                  
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleGalleryFilesUpload}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#102bde] file:text-white hover:file:bg-[#0d23b8] file:cursor-pointer cursor-pointer border border-slate-300 rounded-xl bg-slate-50 p-2"
                  />

                  {galleryUploadProgress !== null && (
                    <div className="space-y-1 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#102bde]">
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Enviando galeria para Supabase Storage...
                        </span>
                        <span>{galleryUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#102bde] h-full transition-all duration-300" style={{ width: `${galleryUploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Current Gallery Photos Grid */}
                {ministryForm.gallery.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="block font-bold uppercase text-slate-700 text-[11px]">Fotos Atuais na Galeria</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
                      {ministryForm.gallery.map((img) => (
                        <div key={img.id} className="relative rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-sm flex flex-col">
                          <div className="h-24 bg-slate-100 overflow-hidden relative">
                            <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryItem(img.id, img.url)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-md"
                              title="Remover foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-2">
                            <input
                              type="text"
                              value={img.caption}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMinistryForm((prev) => ({
                                  ...prev,
                                  gallery: prev.gallery.map((g) => g.id === img.id ? { ...g, caption: val } : g)
                                }));
                              }}
                              className="w-full text-[10px] p-1 border border-slate-200 rounded font-bold text-slate-700"
                              placeholder="Legenda da foto..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Descrição Curta</label>
                  <textarea
                    rows={3}
                    value={ministryForm.description}
                    onChange={(e) => setMinistryForm({ ...ministryForm, description: e.target.value })}
                    placeholder="Descrição resumida exibida nos cartões..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Descrição Detalhada / Propósito</label>
                  <textarea
                    rows={3}
                    value={ministryForm.detailedDescription}
                    onChange={(e) => setMinistryForm({ ...ministryForm, detailedDescription: e.target.value })}
                    placeholder="Descrição completa exibida na página do ministério..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              {/* PRINCIPAIS ATIVIDADES */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs uppercase text-[#102bde] block">
                    Principais Atividades
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setMinistryForm((prev) => ({
                        ...prev,
                        activities: [...prev.activities, ''],
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#102bde] hover:bg-[#0d23b8] text-white text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden">Adicionar Atividade</span>
                  </button>
                </div>

                {ministryForm.activities.length === 0 ? (
                  <p className="hidden text-[11px] text-slate-400 italic">Nenhuma atividade cadastrada. Clique no botão acima para adicionar.</p>
                ) : (
                  <div className="space-y-2">
                    {ministryForm.activities.map((act, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={act}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMinistryForm((prev) => {
                              const nextAct = [...prev.activities];
                              nextAct[idx] = val;
                              return { ...prev, activities: nextAct };
                            });
                          }}
                          placeholder="ex: Reunião de Oração Semanal"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#102bde]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setMinistryForm((prev) => ({
                              ...prev,
                              activities: prev.activities.filter((_, i) => i !== idx),
                            }))
                          }
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                          title="Remover atividade"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMinistryModalOpen(false)}
                  disabled={isSavingMinistry}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingMinistry || leaderUploadProgress !== null || galleryUploadProgress !== null}
                  className={`px-5 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition-all ${
                    isSavingMinistry || leaderUploadProgress !== null || galleryUploadProgress !== null
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-[#102bde] hover:bg-[#0d23b8] text-white cursor-pointer'
                  }`}
                >
                  {isSavingMinistry ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : leaderUploadProgress !== null ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando Líder ({leaderUploadProgress}%)...</span>
                    </>
                  ) : galleryUploadProgress !== null ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando Galeria ({galleryUploadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salvar Ministério</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
