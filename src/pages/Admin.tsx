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
  clearAllEvents,
  subscribeEventRegistrations,
  deleteEventRegistration,
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
  seedInitialFirestoreData,
  subscribePrayerRequests,
  updatePrayerRequestStatus,
  deletePrayerRequest,
  getUserProfile,
  getAllUserProfiles,
  updateUserRole,
  updateUserByAdmin,
  deleteUserProfile,
  createDashboardInvite,
  getDashboardInvites,
  deleteDashboardInvite,
  getInviteByToken,
  acceptDashboardInvite,
  fetchDistrictInfo,
  updateDistrictInfo,
  subscribeDistrictCongregations,
  addDistrictCongregation,
  updateDistrictCongregation,
  deleteDistrictCongregation,
  DEFAULT_DISTRICT_INFO
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
import { formatDateToDisplay, formatDateToDb, formatEventDateRange } from '../utils/dateUtils';
import { slugify, getEventSlug } from '../utils/slugUtils';
import { DatePicker } from '../components/DatePicker';
import { ScheduleItem, ChurchEvent, EventRegistration, Sermon, Ministry, PrayerRequest, UserProfile, DashboardInvite, UserRole, RegistrationType, EventType, DistrictInfo, DistrictCongregation } from '../types';
import { Logo } from '../components/Logo';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { SpotifyPlayer } from '../components/SpotifyPlayer';
import { 
  Lock, Mail, LogOut, Plus, Edit2, Trash2, Calendar, Clock, 
  MapPin, Video, Church, ShieldAlert, Check, X, ArrowLeft,
  Sparkles, Layers, Youtube, Tag, AlertCircle, Database,
  Upload, Image as ImageIcon, Loader2, CheckCircle2, ImagePlus, Users, HelpCircle, RefreshCw, Music,
  Heart, Phone, Archive, Filter, Search, MessageCircle, ShieldCheck, UserPlus, Shield, Key, Copy, XCircle, UserCheck, Crown, Radio, HeartHandshake, UserX, ExternalLink, Eye, EyeOff,
  Tent, HeartPulse, ChevronDown, ChevronUp, FileText, User as UserIcon, Building2, Globe, Map
} from 'lucide-react';

interface AdminProps {
  onNavigateSite: () => void;
}

export const AdminPage: React.FC<AdminProps> = ({ onNavigateSite }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('media');
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Invite acceptance states (when URL contains ?invite=TOKEN)
  const [inviteTokenParam, setInviteTokenParam] = useState<string | null>(null);
  const [pendingInvite, setPendingInvite] = useState<DashboardInvite | null>(null);
  const [validatingInvite, setValidatingInvite] = useState(false);
  const [inviteAcceptError, setInviteAcceptError] = useState<string | null>(null);
  const [inviteFullName, setInviteFullName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [invitePasswordConfirm, setInvitePasswordConfirm] = useState('');
  const [submittingInviteAcceptance, setSubmittingInviteAcceptance] = useState(false);
  const [showInvitePassword, setShowInvitePassword] = useState(false);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Navigation tab in Admin CMS
  const [activeTab, setActiveTab] = useState<'schedules' | 'events' | 'sermons' | 'ministries' | 'prayers' | 'users_invites' | 'district'>('schedules');

  // District CMS State
  const [districtInfoState, setDistrictInfoState] = useState<DistrictInfo>(DEFAULT_DISTRICT_INFO);
  const [districtCongregations, setDistrictCongregations] = useState<DistrictCongregation[]>([]);
  const [isSavingDistrictInfo, setIsSavingDistrictInfo] = useState(false);

  // Congregation Modals
  const [congregationModalOpen, setCongregationModalOpen] = useState(false);
  const [editingCongregation, setEditingCongregation] = useState<DistrictCongregation | null>(null);
  const [isSavingCongregation, setIsSavingCongregation] = useState(false);
  const [deleteCongregationModalOpen, setDeleteCongregationModalOpen] = useState(false);
  const [congregationToDelete, setCongregationToDelete] = useState<DistrictCongregation | null>(null);

  // Invites & Users Management State (Admin only)
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [allInvites, setAllInvites] = useState<DashboardInvite[]>([]);
  const [loadingInvitesAndUsers, setLoadingInvitesAndUsers] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState<UserRole>('media');
  const [createdInvite, setCreatedInvite] = useState<DashboardInvite | null>(null);
  const [copiedInviteToken, setCopiedInviteToken] = useState<string | null>(null);
  const [creatingInviteLoading, setCreatingInviteLoading] = useState(false);

  // Firestore / Supabase Collections State
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<EventRegistration[]>([]);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<ChurchEvent | null>(null);
  const [registrationSearchQuery, setRegistrationSearchQuery] = useState('');
  const [copiedRegistrations, setCopiedRegistrations] = useState(false);

  // Prayer Request Filter States
  const [prayerStatusFilter, setPrayerStatusFilter] = useState<'all' | 'pending' | 'prayed' | 'archived'>('all');
  const [prayerCategoryFilter, setPrayerCategoryFilter] = useState<string>('all');
  const [prayerSearchQuery, setPrayerSearchQuery] = useState<string>('');

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
  const [isSavingEvent, setIsSavingEvent] = useState(false);

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

  // User Deletion Modal State
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState<string | null>(null);

  // User Editing Modal State
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [editUserFullName, setEditUserFullName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('media');
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserError, setEditUserError] = useState<string | null>(null);

  // Expanded Registrant Detail State in Modal
  const [expandedRegId, setExpandedRegId] = useState<string | null>(null);

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
    const unsubRegs = subscribeEventRegistrations((data) => setAllRegistrations(data));
    const unsubSermons = subscribeSermons((data) => setSermons(data));
    const unsubMin = subscribeMinistries((data) => setMinistries(data));
    const unsubPrayers = subscribePrayerRequests((data) => setPrayers(data));
    const unsubDistrict = subscribeDistrictCongregations((data) => setDistrictCongregations(data));
    fetchDistrictInfo().then((info) => setDistrictInfoState(info));

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
      unsubRegs();
      unsubSermons();
      unsubMin();
      unsubPrayers();
      unsubDistrict();
      unsubSettings();
    };
  }, [user]);

  // Check URL parameters for invitation token (?invite=TOKEN or ?invite_token=TOKEN)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite') || params.get('invite_token');

    if (token) {
      setInviteTokenParam(token);
      setValidatingInvite(true);
      setInviteAcceptError(null);

      getInviteByToken(token)
        .then((invite) => {
          if (!invite) {
            setPendingInvite(null);
            setInviteAcceptError('Este convite de acesso é inválido ou não foi encontrado.');
          } else if (invite.status === 'accepted') {
            setPendingInvite(null);
            setInviteAcceptError('Este convite de acesso já foi utilizado por outro usuário.');
          } else if (invite.status === 'expired') {
            setPendingInvite(null);
            setInviteAcceptError('Este convite de acesso expirou. Solicite um novo convite ao administrador.');
          } else {
            setPendingInvite(invite);
            setInviteAcceptError(null);
          }
        })
        .catch((err) => {
          console.error('Error validating invite token:', err);
          setInviteAcceptError('Erro ao validar convite de acesso: ' + (err.message || 'Verifique sua conexão.'));
        })
        .finally(() => {
          setValidatingInvite(false);
        });
    }
  }, []);

  // Fetch or sync user profile & role when authenticated
  useEffect(() => {
    if (user) {
      getUserProfile(user.id, user.email || '')
        .then((prof) => {
          setUserProfile(prof);
          setUserRole(prof.role);
        })
        .catch((err) => {
          console.warn('Error getting user profile:', err);
          setUserRole('media');
        });
    } else {
      setUserProfile(null);
      setUserRole('media');
    }
  }, [user]);

  // Route & Tab Guard: Automatically switch to first allowed tab if activeTab is not allowed for userRole
  useEffect(() => {
    if (!user) return;

    const allowedTabsMap: Record<UserRole, Array<'schedules' | 'events' | 'sermons' | 'ministries' | 'prayers' | 'users_invites' | 'district'>> = {
      admin: ['schedules', 'events', 'sermons', 'ministries', 'prayers', 'users_invites', 'district'],
      media: ['sermons', 'events'],
      intercession: ['prayers'],
    };

    const allowed = allowedTabsMap[userRole] || allowedTabsMap.admin;
    if (!allowed.includes(activeTab)) {
      setActiveTab(allowed[0]);
    }
  }, [userRole, activeTab, user]);

  // Load All Profiles and Invites for Admin Tab
  const loadInvitesAndUsers = async () => {
    if (userRole !== 'admin') return;
    setLoadingInvitesAndUsers(true);
    try {
      const [profs, invs] = await Promise.all([
        getAllUserProfiles(),
        getDashboardInvites(),
      ]);
      setAllProfiles(profs);
      setAllInvites(invs);
    } catch (err) {
      console.error('Error loading invites and users:', err);
    } finally {
      setLoadingInvitesAndUsers(false);
    }
  };

  useEffect(() => {
    if (user && userRole === 'admin' && activeTab === 'users_invites') {
      loadInvitesAndUsers();
    }
  }, [user, userRole, activeTab]);

  // Handler: Accept Invitation Submit
  const handleAcceptInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingInvite) return;

    if (invitePassword.length < 6) {
      setInviteAcceptError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (invitePassword !== invitePasswordConfirm) {
      setInviteAcceptError('As senhas digitadas não coincidem. Verifique novamente.');
      return;
    }

    setSubmittingInviteAcceptance(true);
    setInviteAcceptError(null);

    try {
      const res = await acceptDashboardInvite(pendingInvite, invitePassword, inviteFullName);
      setUser(res.user);
      setUserProfile(res.profile);
      setUserRole(res.profile.role);
      setPendingInvite(null);
      setInviteTokenParam(null);

      // Clean token parameter from browser URL without refresh
      window.history.replaceState({}, document.title, window.location.pathname);

      setStatusMsg({
        type: 'success',
        text: `Sua conta foi ativada com sucesso! Cargo: ${
          res.profile.role === 'admin'
            ? 'Administrador'
            : res.profile.role === 'media'
            ? 'Mídia'
            : 'Intercessão'
        }.`,
      });
    } catch (err: any) {
      console.error('Accept invite error:', err);
      setInviteAcceptError(err.message || 'Erro ao aceitar convite. Tente novamente.');
    } finally {
      setSubmittingInviteAcceptance(false);
    }
  };

  // Handler: Create New Invitation (Admin Only)
  const handleCreateInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail.trim()) return;

    setCreatingInviteLoading(true);
    setStatusMsg(null);

    try {
      const invite = await createDashboardInvite(newInviteEmail, newInviteRole, user?.id);
      setCreatedInvite(invite);
      setNewInviteEmail('');
      setStatusMsg({
        type: 'success',
        text: `Convite de acesso para "${invite.email}" (${invite.role.toUpperCase()}) gerado com sucesso!`,
      });
      loadInvitesAndUsers();
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: 'Erro ao gerar convite: ' + (err.message || 'Falha de conexão.'),
      });
    } finally {
      setCreatingInviteLoading(false);
    }
  };

  // Handler: Delete / Revoke Invite
  const handleDeleteInvite = async (inviteId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja revogar o convite para "${email}"?`)) return;
    try {
      await deleteDashboardInvite(inviteId);
      setStatusMsg({ type: 'success', text: 'Convite revogado com sucesso!' });
      loadInvitesAndUsers();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Erro ao revogar convite: ' + err.message });
    }
  };

  // Handler: Update User Role (Admin Only)
  const handleRoleChange = async (targetUserId: string, targetEmail: string, newRole: UserRole) => {
    if (targetUserId === user?.id && newRole !== 'admin') {
      if (!confirm('Atenção: alterar o seu próprio cargo para um nível inferior removerá seu acesso de Administrador. Deseja continuar?')) {
        return;
      }
    }

    try {
      await updateUserRole(targetUserId, newRole);
      setStatusMsg({
        type: 'success',
        text: `Cargo do usuário "${targetEmail}" atualizado para ${newRole.toUpperCase()} com sucesso!`,
      });
      if (targetUserId === user?.id) {
        setUserRole(newRole);
      }
      loadInvitesAndUsers();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Erro ao alterar cargo: ' + err.message });
    }
  };

  // Handler: Open Delete User Modal
  const handleOpenDeleteUserModal = (profile: UserProfile) => {
    if (profile.id === user?.id) {
      setStatusMsg({
        type: 'error',
        text: 'Você não pode excluir a sua própria conta ativa.',
      });
      return;
    }
    setUserToDelete(profile);
    setDeleteUserError(null);
    setDeleteUserModalOpen(true);
  };

  // Handler: Confirm Delete User
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    setDeleteUserError(null);

    try {
      await deleteUserProfile(userToDelete.id);
      setStatusMsg({
        type: 'success',
        text: `O usuário "${userToDelete.email}" foi excluído com sucesso.`,
      });
      setDeleteUserModalOpen(false);
      setUserToDelete(null);
      await loadInvitesAndUsers();
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      setDeleteUserError(err?.message || 'Ocorreu um erro ao tentar excluir o usuário. Tente novamente.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Handler: Open Edit User Modal
  const handleOpenEditUserModal = (profile: UserProfile) => {
    setUserToEdit(profile);
    setEditUserFullName(profile.fullName || profile.full_name || '');
    setEditUserEmail(profile.email || '');
    setEditUserRole(profile.role || 'media');
    setEditUserError(null);
    setEditUserModalOpen(true);
  };

  // Handler: Confirm Edit User
  const handleConfirmEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    if (!editUserFullName.trim()) {
      setEditUserError('O nome do usuário não pode ficar em branco.');
      return;
    }

    if (!editUserEmail.trim() || !editUserEmail.includes('@')) {
      setEditUserError('Informe um e-mail válido.');
      return;
    }

    setIsEditingUser(true);
    setEditUserError(null);

    try {
      const updated = await updateUserByAdmin(userToEdit.id, {
        fullName: editUserFullName,
        role: editUserRole,
        email: editUserEmail,
      });

      setStatusMsg({
        type: 'success',
        text: `Dados do usuário "${updated.fullName || updated.full_name}" (${updated.email}) atualizados com sucesso!`,
      });

      if (userToEdit.id === user?.id) {
        setUserRole(updated.role);
        setUserProfile(updated);
      }

      setEditUserModalOpen(false);
      setUserToEdit(null);
      await loadInvitesAndUsers();
    } catch (err: any) {
      console.error('Edit user error:', err);
      setEditUserError('Erro ao atualizar usuário: ' + (err.message || 'Falha de comunicação.'));
    } finally {
      setIsEditingUser(false);
    }
  };

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
  const [adminEventFilter, setAdminEventFilter] = useState<'all' | 'local' | 'distrital' | 'regional'>('all');
  const [eventForm, setEventForm] = useState<{
    title: string;
    slug?: string;
    date: string;
    endDate?: string;
    time: string;
    location: string;
    description: string;
    imageUrl: string;
    badge: string;
    eventType: EventType;
    enableRegistration: boolean;
    registrationType: RegistrationType;
    registrationDeadline?: string;
    registrationLimit?: number;
    registrationMessage?: string;
  }>({
    title: '',
    slug: '',
    date: '',
    endDate: '',
    time: '19:30',
    location: 'Templo Principal',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
    badge: 'CONFERÊNCIA',
    eventType: 'local',
    enableRegistration: false,
    registrationType: 'none',
    registrationDeadline: '',
    registrationLimit: undefined,
    registrationMessage: '',
  });

  const openEventModal = (item?: ChurchEvent) => {
    setEventImageFile(null);
    setEventImagePreview(null);
    setEventUploadProgress(null);
    setEventUploadError(null);

    if (item) {
      setEditingEvent(item);
      const regType: RegistrationType = item.registrationType || (item.enableRegistration ? 'simple' : 'none');
      setEventForm({
        title: item.title,
        slug: item.slug || getEventSlug(item),
        date: item.date,
        endDate: item.endDate || '',
        time: item.time,
        location: item.location,
        description: item.description,
        imageUrl: item.imageUrl,
        badge: item.badge,
        eventType: item.eventType || 'local',
        enableRegistration: regType !== 'none',
        registrationType: regType,
        registrationDeadline: item.registrationDeadline || '',
        registrationLimit: item.registrationLimit,
        registrationMessage: item.registrationMessage || '',
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '',
        slug: '',
        date: '',
        endDate: '',
        time: '19:30',
        location: 'Templo Principal',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
        badge: 'RETIRO ESPIRITUAL',
        eventType: 'local',
        enableRegistration: false,
        registrationType: 'none',
        registrationDeadline: '',
        registrationLimit: undefined,
        registrationMessage: '',
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
    if (isSavingEvent) return;
    if (!eventForm.title || !eventForm.date) return;
    setEventUploadError(null);

    if (!user) {
      setEventUploadError('Usuário não autenticado. Faça login novamente no painel.');
      return;
    }

    setIsSavingEvent(true);
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

      const finalSlug = eventForm.slug ? slugify(eventForm.slug) : slugify(eventForm.title);

      const payload = {
        ...eventForm,
        slug: finalSlug,
        enableRegistration: eventForm.registrationType !== 'none',
        registrationType: eventForm.registrationType,
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
      setIsSavingEvent(false);
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

  const handleClearAllEvents = async () => {
    if (!confirm('ATENÇÃO: Tem certeza que deseja APAGAR TODOS OS EVENTOS do sistema? Esta ação removerá todos os eventos e inscrições associadas do banco de dados e do cache local. Esta ação NÃO afetará ministérios, membros, pregações ou usuários.')) {
      return;
    }
    try {
      await clearAllEvents();
      setStatusMsg({ type: 'success', text: 'Todos os eventos e inscrições foram removidos do sistema com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao limpar eventos:', err);
      setStatusMsg({ type: 'error', text: 'Erro ao limpar eventos: ' + err.message });
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
  // RENDER LOGIN / INVITE ACCEPTANCE SCREEN (IF NOT AUTHENTICATED)
  // -------------------------------------------------------------
  if (!user) {
    if (inviteTokenParam) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#102bde]/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 relative z-10">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-3">
                <Logo variant="dark" size="lg" />
              </div>
              <h1 className="font-sans font-black text-xl uppercase tracking-tight text-white flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5 text-[#102bde]" />
                <span>ACEITAR CONVITE DE ACESSO</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Ativação de conta no Painel da Igreja Metodista Wesleyana
              </p>
            </div>

            {validatingInvite ? (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#102bde] animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-300 uppercase">Validando convite de acesso...</p>
              </div>
            ) : inviteAcceptError && !pendingInvite ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{inviteAcceptError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInviteTokenParam(null);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Voltar para a Tela de Login
                </button>
              </div>
            ) : pendingInvite ? (
              <form onSubmit={handleAcceptInviteSubmit} className="space-y-4">
                {inviteAcceptError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{inviteAcceptError}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Cargo e Permissão Atribuída:
                  </span>
                  <div className="flex items-center gap-2">
                    {pendingInvite.role === 'admin' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" />
                        <span>ADMINISTRADOR (Acesso Total)</span>
                      </span>
                    ) : pendingInvite.role === 'media' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5" />
                        <span>MÍDIA (Pregações & Eventos)</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>INTERCESSÃO (Pedidos de Oração)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-300 mb-1.5">
                    E-mail Convidado
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={pendingInvite.email}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-sm font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-300 mb-1.5">
                    Seu Nome Completo
                  </label>
                  <input
                    type="text"
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    placeholder="Ex: Pr. João Silva"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#102bde] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-300 mb-1.5">
                    Crie sua Senha de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showInvitePassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#102bde] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowInvitePassword(!showInvitePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 cursor-pointer"
                    >
                      {showInvitePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-300 mb-1.5">
                    Confirme sua Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showInvitePassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={invitePasswordConfirm}
                      onChange={(e) => setInvitePasswordConfirm(e.target.value)}
                      placeholder="Repita a senha criada"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#102bde] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingInviteAcceptance}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] disabled:opacity-50 text-white font-sans font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#102bde]/25 flex items-center justify-center gap-2"
                >
                  {submittingInviteAcceptance ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ATIVANDO SUA CONTA...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CONCLUIR CADASTRO E ENTRAR</span>
                    </>
                  )}
                </button>
              </form>
            ) : null}

            <div className="pt-2 text-center">
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
      );
    }

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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-lg uppercase tracking-tight text-white">
                  PAINEL DE CONTROLE (CMS)
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">
                  Ao Vivo
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">
                  Sessão: <strong className="text-slate-200">{userProfile?.fullName || userProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email}</strong>
                </span>
                {userRole === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-purple-400" />
                    <span>ADMINISTRADOR</span>
                  </span>
                )}
                {userRole === 'media' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-blue-400" />
                    <span>MÍDIA</span>
                  </span>
                )}
                {userRole === 'intercession' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <HeartHandshake className="w-3 h-3 text-emerald-400" />
                    <span>INTERCESSÃO</span>
                  </span>
                )}
              </div>
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

            {(userRole === 'admin') && (
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
            )}

            {(userRole === 'admin' || userRole === 'media') && (
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
            )}

            {(userRole === 'admin' || userRole === 'media') && (
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
            )}

            {(userRole === 'admin') && (
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
            )}

            {(userRole === 'admin' || userRole === 'intercession') && (
              <button
                onClick={() => setActiveTab('prayers')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'prayers'
                    ? 'bg-[#102bde] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                  <span>Pedidos de Oração</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {prayers.filter((p) => p.status === 'pending').length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                      {prayers.filter((p) => p.status === 'pending').length} novos
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'prayers' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {prayers.length}
                  </span>
                </div>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('district')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'district'
                    ? 'bg-[#102bde] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>Distrito & Congregações</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'district' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {districtCongregations.length}
                </span>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('users_invites')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'users_invites'
                    ? 'bg-purple-700 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                  <span>Cargos & Convites</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'users_invites' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800 font-bold'
                }`}>
                  {allProfiles.length || '•'}
                </span>
              </button>
            )}
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
                    CONFERÊNCIAS, ENCONTROS & RETIROS
                  </span>
                  <h2 className="font-black text-2xl uppercase text-slate-900">
                    EVENTOS ESPECIAIS
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {events.length > 0 && (
                    <button
                      onClick={handleClearAllEvents}
                      className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Apagar todos os eventos e inscrições do sistema"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>LIMPAR EVENTOS ({events.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => openEventModal()}
                    className="px-4 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>NOVO EVENTO</span>
                  </button>
                </div>
              </div>

              {/* Scope Filter Bar in CMS */}
              <div className="flex items-center gap-2 flex-wrap bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 text-xs font-bold uppercase">
                <span className="text-slate-500 px-2 text-[11px]">Filtrar por Âmbito:</span>
                <button
                  onClick={() => setAdminEventFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    adminEventFilter === 'all'
                      ? 'bg-[#102bde] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Todos ({events.length})
                </button>
                <button
                  onClick={() => setAdminEventFilter('local')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    adminEventFilter === 'local'
                      ? 'bg-[#102bde] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  🏠 Locais ({events.filter(e => (e.eventType || 'local') === 'local').length})
                </button>
                <button
                  onClick={() => setAdminEventFilter('distrital')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    adminEventFilter === 'distrital'
                      ? 'bg-[#102bde] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  📍 Distritais ({events.filter(e => e.eventType === 'distrital').length})
                </button>
                <button
                  onClick={() => setAdminEventFilter('regional')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    adminEventFilter === 'regional'
                      ? 'bg-[#102bde] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  🏛️ Regionais ({events.filter(e => e.eventType === 'regional').length})
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
                  {events
                    .filter((e) => adminEventFilter === 'all' || (e.eventType || 'local') === adminEventFilter)
                    .map((evt) => {
                    const eventRegs = allRegistrations.filter((r) => r.eventId === evt.id);
                    const scopeLabel = evt.eventType === 'distrital' ? '📍 Distrital' : evt.eventType === 'regional' ? '🏛️ Regional' : '🏠 Local';
                    const scopeBg = evt.eventType === 'distrital' ? 'bg-amber-600 text-white' : evt.eventType === 'regional' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white';

                    return (
                      <div key={evt.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col justify-between">
                        <div className="relative h-36 bg-slate-200 overflow-hidden">
                          <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-[#102bde] text-white font-black text-[10px] uppercase">
                              {evt.badge}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${scopeBg}`}>
                              {scopeLabel}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 space-y-2 flex-1">
                          <h3 className="font-black text-base text-slate-900 uppercase leading-snug">{evt.title}</h3>
                          <p className="text-xs font-bold text-[#102bde]">{formatEventDateRange(evt.date, evt.endDate)} • {evt.time}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span>{evt.location}</span>
                          </p>

                          {/* Badge de Status de Inscrição */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {evt.registrationType === 'retreat' || (evt.enableRegistration && evt.registrationType === 'retreat') ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase border border-amber-300">
                                <Tent className="w-3 h-3 text-amber-600" />
                                Retiro Espiritual (Ficha Completa)
                              </span>
                            ) : evt.enableRegistration || evt.registrationType === 'simple' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                Inscrição Simples
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                                Inscrições Desativadas
                              </span>
                            )}
                            {evt.registrationLimit && evt.registrationLimit > 0 && (
                              <span className="text-[10px] text-slate-500 font-bold">
                                Limite: {evt.registrationLimit} vagas
                              </span>
                            )}
                          </div>

                          {evt.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1">{evt.description}</p>
                          )}
                        </div>
                        <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setSelectedEventForRegistrations(evt);
                              setRegistrationSearchQuery('');
                            }}
                            className="px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-[#102bde] text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" /> Inscritos ({eventRegs.length})
                          </button>

                          <div className="flex items-center gap-2">
                            <a
                              href={`/eventos-especiais/${getEventSlug(evt)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                              title="Ver Página do Evento"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#102bde]" /> Ver Página
                            </a>
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
                      </div>
                    );
                  })}
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
                          <span>{formatDateToDisplay(sermon.date)}</span>
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

          {/* TAB 5: PEDIDOS DE ORAÇÃO & INTERCESSÃO */}
          {activeTab === 'prayers' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Heart className="w-48 h-48 text-white fill-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider mb-2">
                      <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                      <span>Ministério de Intercessão</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">Pedidos de Oração</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Acompanhe, ore e entre em contato com os membros e visitantes que enviaram motivos de oração pelo site.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total de Pedidos</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{prayers.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-[#102bde] rounded-xl">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pendentes (Não orados)</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">
                      {prayers.filter((p) => p.status === 'pending').length}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Em Oração / Atendidos</p>
                    <p className="text-2xl font-black text-emerald-900 mt-1">
                      {prayers.filter((p) => p.status === 'prayed').length}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Arquivados</p>
                    <p className="text-2xl font-black text-slate-700 mt-1">
                      {prayers.filter((p) => p.status === 'archived').length}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-200 text-slate-600 rounded-xl">
                    <Archive className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <button
                    onClick={() => setPrayerStatusFilter('all')}
                    className={`px-3 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                      prayerStatusFilter === 'all'
                        ? 'bg-[#102bde] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Todos ({prayers.length})
                  </button>
                  <button
                    onClick={() => setPrayerStatusFilter('pending')}
                    className={`px-3 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      prayerStatusFilter === 'pending'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Pendentes ({prayers.filter((p) => p.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setPrayerStatusFilter('prayed')}
                    className={`px-3 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      prayerStatusFilter === 'prayed'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Em Oração ({prayers.filter((p) => p.status === 'prayed').length})
                  </button>
                  <button
                    onClick={() => setPrayerStatusFilter('archived')}
                    className={`px-3 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      prayerStatusFilter === 'archived'
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Arquivados ({prayers.filter((p) => p.status === 'archived').length})
                  </button>
                </div>

                {/* Category & Search inputs */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={prayerCategoryFilter}
                    onChange={(e) => setPrayerCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-slate-50 font-medium focus:outline-none focus:border-[#102bde]"
                  >
                    <option value="all">Todas as Categorias</option>
                    <option value="Família e Lar">Família e Lar</option>
                    <option value="Saúde e Cura">Saúde e Cura</option>
                    <option value="Vida Financeira & Trabalho">Vida Financeira & Trabalho</option>
                    <option value="Crescimento Espiritual">Crescimento Espiritual</option>
                    <option value="Libertação & Paz">Libertação & Paz</option>
                    <option value="Agradecimento & Vitória">Agradecimento & Vitória</option>
                  </select>

                  <div className="relative flex-1 md:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={prayerSearchQuery}
                      onChange={(e) => setPrayerSearchQuery(e.target.value)}
                      placeholder="Buscar por nome ou texto..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:border-[#102bde]"
                    />
                  </div>
                </div>
              </div>

              {/* Prayer Requests Grid */}
              {(() => {
                const filtered = prayers.filter((item) => {
                  if (prayerStatusFilter !== 'all' && item.status !== prayerStatusFilter) return false;
                  if (prayerCategoryFilter !== 'all' && item.category !== prayerCategoryFilter) return false;
                  if (prayerSearchQuery.trim()) {
                    const q = prayerSearchQuery.toLowerCase();
                    const nameMatch = (item.name || '').toLowerCase().includes(q);
                    const textMatch = (item.requestText || '').toLowerCase().includes(q);
                    const phoneMatch = (item.phone || '').toLowerCase().includes(q);
                    if (!nameMatch && !textMatch && !phoneMatch) return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-sans space-y-3">
                      <Heart className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                      <p className="font-bold text-sm text-slate-700">Nenhum pedido de oração encontrado</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {prayers.length === 0
                          ? 'Ainda não foram registrados pedidos de oração pelo formulário do site.'
                          : 'Nenhum pedido corresponde aos filtros ou busca selecionados.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((prayer) => {
                      const formattedDate = formatDateToDisplay(prayer.createdAt);

                      const cleanPhone = (prayer.phone || '').replace(/\D/g, '');
                      const whatsappUrl = cleanPhone
                        ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                            `A paz do Senhor Jesus, ${prayer.name || 'irmão(ã)'}! Vi seu pedido de oração no site da IMW Cosmópolis. Estamos orando por você!`
                          )}`
                        : '';

                      return (
                        <div
                          key={prayer.id}
                          className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between gap-4 font-sans ${
                            prayer.status === 'pending'
                              ? 'border-amber-300 bg-amber-50/20'
                              : prayer.status === 'prayed'
                              ? 'border-emerald-200 bg-emerald-50/10'
                              : 'border-slate-200 opacity-75 bg-slate-50/50'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Card Header: Category & Status */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="px-2.5 py-1 rounded-lg bg-[#102bde]/10 text-[#102bde] font-bold text-[11px] uppercase tracking-wider border border-[#102bde]/20">
                                {prayer.category}
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-slate-400">
                                  {formattedDate}
                                </span>

                                {prayer.status === 'pending' && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase border border-amber-300 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Pendente
                                  </span>
                                )}
                                {prayer.status === 'prayed' && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase border border-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Em Oração
                                  </span>
                                )}
                                {prayer.status === 'archived' && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase flex items-center gap-1">
                                    <Archive className="w-3 h-3" />
                                    Arquivado
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Requester Info */}
                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <h4 className="font-bold text-sm text-slate-900">
                                  {prayer.name || 'Anônimo'}
                                </h4>
                                {prayer.phone && (
                                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{prayer.phone}</span>
                                  </p>
                                )}
                              </div>

                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                  title="Enviar mensagem no WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>

                            {/* Prayer Request Text */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-xs leading-relaxed italic relative">
                              "{prayer.requestText}"
                            </div>

                            {/* Confidentiality tag */}
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Confidencial / Acesso Restrito à Liderança</span>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              {prayer.status !== 'prayed' && (
                                <button
                                  onClick={() => updatePrayerRequestStatus(prayer.id, 'prayed')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Marcar como Orado</span>
                                </button>
                              )}

                              {prayer.status === 'prayed' && (
                                <button
                                  onClick={() => updatePrayerRequestStatus(prayer.id, 'pending')}
                                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Voltar a Pendente</span>
                                </button>
                              )}

                              {prayer.status !== 'archived' ? (
                                <button
                                  onClick={() => updatePrayerRequestStatus(prayer.id, 'archived')}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  <span>Arquivar</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => updatePrayerRequestStatus(prayer.id, 'pending')}
                                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Desarquivar</span>
                                </button>
                              )}
                            </div>

                            <button
                              onClick={async () => {
                                if (window.confirm('Tem certeza que deseja excluir este pedido de oração?')) {
                                  await deletePrayerRequest(prayer.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Excluir pedido de oração"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 6: CARGOS & CONVITES DE ACESSO (ADMIN ONLY) */}
          {activeTab === 'users_invites' && userRole === 'admin' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-purple-600 text-xs font-black uppercase tracking-widest block mb-0.5">
                      SEGURANÇA E GERENCIAMENTO DE ACESSOS (RBAC)
                    </span>
                    <h2 className="font-black text-2xl uppercase text-slate-900 flex items-center gap-2">
                      <UserPlus className="w-6 h-6 text-purple-600" />
                      <span>CARGOS & CONVITES NO DASHBOARD</span>
                    </h2>
                  </div>

                  <button
                    onClick={loadInvitesAndUsers}
                    disabled={loadingInvitesAndUsers}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingInvitesAndUsers ? 'animate-spin' : ''}`} />
                    <span>Atualizar Lista</span>
                  </button>
                </div>

                {/* Role explanations callout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1.5">
                    <div className="flex items-center gap-2 font-black text-xs text-purple-900 uppercase">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span>Administrador</span>
                    </div>
                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      Acesso total a todas as áreas do dashboard (Programação, Eventos, Pregações, Ministérios, Pedidos de Oração e Gestão de Convites/Cargos).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
                    <div className="flex items-center gap-2 font-black text-xs text-blue-900 uppercase">
                      <Radio className="w-4 h-4 text-blue-600" />
                      <span>Mídia</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Acesso restrito exclusivamente às abas de <strong>Pregações (Sermões)</strong> e <strong>Eventos Especiais</strong>. Não possui acesso a convites ou outras áreas.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-2 font-black text-xs text-emerald-900 uppercase">
                      <HeartHandshake className="w-4 h-4 text-emerald-600" />
                      <span>Intercessão</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Acesso restrito exclusivamente à área de <strong>Pedidos de Oração</strong> para acompanhar e orar pelos membros. Não possui acesso a convites.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form: Convidar Nova Pessoa */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-black text-base uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span>Gerar Novo Convite de Acesso</span>
                </h3>

                <form onSubmit={handleCreateInviteSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      E-mail do Convidado
                    </label>
                    <input
                      type="email"
                      required
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      placeholder="exemplo@imwcosmopolis.org"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Cargo / Nível de Permissão
                    </label>
                    <select
                      value={newInviteRole}
                      onChange={(e: any) => setNewInviteRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
                    >
                      <option value="media">Mídia (Pregações & Eventos)</option>
                      <option value="intercession">Intercessão (Pedidos de Oração)</option>
                      <option value="admin">Administrador (Acesso Total)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      disabled={creatingInviteLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      {creatingInviteLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Gerar Convite</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Show created invite callout box with copy button */}
                {createdInvite && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-purple-900 uppercase">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        <span>Convite Gerado para {createdInvite.email}!</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-800 text-[10px] font-black uppercase">
                        Cargo: {createdInvite.role}
                      </span>
                    </div>

                    <p className="text-xs text-purple-800">
                      Envie este link direto de cadastro para a pessoa convidada:
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/admin?invite=${createdInvite.token}`}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-purple-300 text-xs font-mono text-purple-950 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/admin?invite=${createdInvite.token}`);
                          setCopiedInviteToken(createdInvite.token);
                          setTimeout(() => setCopiedInviteToken(null), 3000);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                      >
                        {copiedInviteToken === createdInvite.token ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table: Convites Ativos & Pendentes */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-black text-base uppercase text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Convites Enviados ({allInvites.length})</span>
                  </div>
                  <span className="text-xs text-slate-400 font-normal">
                    Convites pendentes e histórico
                  </span>
                </h3>

                {loadingInvitesAndUsers ? (
                  <div className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <span className="text-xs font-bold uppercase">Carregando convites...</span>
                  </div>
                ) : allInvites.length === 0 ? (
                  <p className="text-xs text-slate-500 font-bold uppercase py-4 text-center">
                    Nenhum convite gerado até o momento.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-black uppercase tracking-wider">
                          <th className="py-3 px-4">E-mail Convidado</th>
                          <th className="py-3 px-4">Cargo Permissão</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Data do Convite</th>
                          <th className="py-3 px-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {allInvites.map((inv) => {
                          const inviteUrl = `${window.location.origin}/admin?invite=${inv.token}`;
                          const isCopied = copiedInviteToken === inv.token;

                          return (
                            <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-900">{inv.email}</td>
                              <td className="py-3 px-4">
                                {inv.role === 'admin' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                                    ADMIN
                                  </span>
                                ) : inv.role === 'media' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                                    MÍDIA
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    INTERCESSÃO
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {inv.status === 'pending' ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                                    Pendente
                                  </span>
                                ) : inv.status === 'accepted' ? (
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                                    Aceito
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                                    Expirado
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-500">
                                {inv.createdAt ? formatDateToDisplay(inv.createdAt) : '—'}
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <div className="inline-flex items-center gap-2">
                                  {inv.status === 'pending' && (
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(inviteUrl);
                                        setCopiedInviteToken(inv.token);
                                        setTimeout(() => setCopiedInviteToken(null), 3000);
                                      }}
                                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Copiar Link do Convite"
                                    >
                                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                      <span>{isCopied ? 'Copiado' : 'Copiar Link'}</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteInvite(inv.id, inv.email)}
                                    className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Revogar Convite"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Table: Usuários Ativos do Dashboard */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-black text-base uppercase text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Integrantes com Acesso Ativo ({allProfiles.length})</span>
                  </div>
                  <span className="text-xs text-slate-400 font-normal">
                    Gerenciar cargos de usuários cadastrados
                  </span>
                </h3>

                {loadingInvitesAndUsers ? (
                  <div className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <span className="text-xs font-bold uppercase">Carregando usuários...</span>
                  </div>
                ) : allProfiles.length === 0 ? (
                  <p className="text-xs text-slate-500 font-bold uppercase py-4 text-center">
                    Nenhum usuário cadastrado na tabela de perfis.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-black uppercase tracking-wider">
                          <th className="py-3 px-4">Nome / Usuário</th>
                          <th className="py-3 px-4">E-mail</th>
                          <th className="py-3 px-4">Cargo Atual</th>
                          <th className="py-3 px-4">Alterar Cargo</th>
                          {userRole === 'admin' && <th className="py-3 px-4 text-right">Ações</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {allProfiles.map((prof) => (
                          <tr key={prof.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs border border-purple-200 shrink-0">
                                  {(prof.fullName || prof.full_name || prof.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-slate-900">
                                    {prof.fullName || prof.full_name || prof.email.split('@')[0]}
                                  </span>
                                  {prof.id === user?.id && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[9px] font-black uppercase">
                                      Você
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{prof.email}</td>
                            <td className="py-3 px-4">
                              {prof.role === 'admin' ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                                  <Crown className="w-3 h-3 text-purple-600" />
                                  <span>Administrador</span>
                                </span>
                              ) : prof.role === 'media' ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                                  <Radio className="w-3 h-3 text-blue-600" />
                                  <span>Mídia</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                  <HeartHandshake className="w-3 h-3 text-emerald-600" />
                                  <span>Intercessão</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={prof.role}
                                onChange={(e) => handleRoleChange(prof.id, prof.email, e.target.value as UserRole)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-purple-600 cursor-pointer"
                              >
                                <option value="admin">Administrador</option>
                                <option value="media">Mídia</option>
                                <option value="intercession">Intercessão</option>
                              </select>
                            </td>
                            {userRole === 'admin' && (
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditUserModal(prof)}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                                    title="Editar Nome, E-mail ou Cargo"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Editar</span>
                                  </button>
                                  {prof.id === user?.id ? (
                                    <span className="text-[10px] text-slate-400 font-semibold italic ml-1">Conta Ativa</span>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenDeleteUserModal(prof)}
                                      className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                                      title="Excluir Usuário do Sistema"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                      <span>Excluir</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
                  onChange={(e) => {
                    const title = e.target.value;
                    const autoSlug = slugify(title);
                    setEventForm({ 
                      ...eventForm, 
                      title, 
                      slug: eventForm.slug ? eventForm.slug : autoSlug 
                    });
                  }}
                  placeholder="ex: Conferência de Avivamento 2026"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  URL Amigável / Slug (Link Único do Evento)
                </label>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-3 py-2 border border-slate-300">
                  <span className="text-slate-500 font-mono text-[11px] select-none shrink-0">/eventos-especiais/</span>
                  <input
                    type="text"
                    value={eventForm.slug !== undefined ? eventForm.slug : slugify(eventForm.title)}
                    onChange={(e) => setEventForm({ ...eventForm, slug: slugify(e.target.value) })}
                    placeholder="conferencia-de-avivamento-2026"
                    className="w-full bg-transparent font-mono text-slate-800 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <DatePicker
                    label="DATA DE INÍCIO"
                    required
                    value={eventForm.date}
                    onChange={(dbVal) => setEventForm({ ...eventForm, date: dbVal })}
                    placeholder="DD-MM-YYYY"
                  />
                </div>

                <div>
                  <DatePicker
                    label="DATA FIM (OPCIONAL)"
                    value={eventForm.endDate || ''}
                    onChange={(dbVal) => setEventForm({ ...eventForm, endDate: dbVal })}
                    placeholder="Para vários dias"
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

              {(eventForm.date || eventForm.endDate) && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex items-center gap-2 text-slate-700 font-medium">
                  <Calendar className="w-4 h-4 text-[#102bde] shrink-0" />
                  <span>
                    <strong className="uppercase text-[#102bde]">Prévia da Data no Site:</strong> {formatEventDateRange(eventForm.date, eventForm.endDate)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Âmbito / Tipo do Evento</label>
                  <select
                    value={eventForm.eventType}
                    onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value as EventType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white focus:outline-none focus:border-[#102bde]"
                  >
                    <option value="local">🏠 Local (IMW Cosmópolis)</option>
                    <option value="distrital">📍 Distrital (Distrito)</option>
                    <option value="regional">🏛️ Regional (Região)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Etiqueta / Badge</label>
                  <input
                    type="text"
                    value={eventForm.badge}
                    onChange={(e) => setEventForm({ ...eventForm, badge: e.target.value })}
                    placeholder="CONFERÊNCIA, RETIRO, etc"
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

              {/* SEÇÃO DE CONFIGURAÇÃO DE INSCRIÇÕES */}
              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/50 space-y-4">
                <div>
                  <h4 className="font-sans font-black text-xs uppercase text-slate-900 flex items-center gap-1.5 mb-1">
                    <UserPlus className="w-4 h-4 text-[#102bde]" />
                    <span>Inscrições Online para este Evento</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Escolha se este evento possui formulário de inscrição e qual o modelo ideal.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold uppercase text-slate-700 text-[10px]">
                    Tipo de Formulário de Inscrição *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Opção 1: Sem Inscrição */}
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, enableRegistration: false, registrationType: 'none' })}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        !eventForm.enableRegistration || eventForm.registrationType === 'none'
                          ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <XCircle className="w-4 h-4 text-slate-400" />
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Off</span>
                      </div>
                      <div>
                        <span className="font-bold text-xs block leading-tight">Sem Inscrição</span>
                        <span className="text-[10px] opacity-75 font-normal block mt-0.5">Apenas divulgação</span>
                      </div>
                    </button>

                    {/* Opção 2: Inscrição Simples */}
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, enableRegistration: true, registrationType: 'simple' })}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        eventForm.enableRegistration && eventForm.registrationType === 'simple'
                          ? 'border-[#102bde] bg-blue-600 text-white shadow-md'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <UserCheck className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-700 text-blue-100">Simples</span>
                      </div>
                      <div>
                        <span className="font-bold text-xs block leading-tight">Inscrição Simples</span>
                        <span className="text-[10px] opacity-80 font-normal block mt-0.5">Nome, e-mail, telefone</span>
                      </div>
                    </button>

                    {/* Opção 3: Retiro Espiritual */}
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, enableRegistration: true, registrationType: 'retreat' })}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        eventForm.enableRegistration && eventForm.registrationType === 'retreat'
                          ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-md font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Tent className="w-4 h-4 text-amber-950" />
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">Retiro</span>
                      </div>
                      <div>
                        <span className="font-bold text-xs block leading-tight">Retiro Espiritual</span>
                        <span className="text-[10px] opacity-85 font-normal block mt-0.5">Pernoite, saúde, responsável</span>
                      </div>
                    </button>
                  </div>
                </div>

                {eventForm.enableRegistration && eventForm.registrationType !== 'none' && (
                  <div className="pt-3 border-t border-blue-200/60 space-y-3">
                    {eventForm.registrationType === 'retreat' && (
                      <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-900 text-xs font-medium leading-relaxed flex items-start gap-2">
                        <Tent className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          <strong>Formulário Avançado de Retiro Ativado:</strong> O site solicitará RG/CPF, data de nascimento, contatos de emergência, histórico de saúde/alergias/medicamentos e autorização do responsável legal caso o participante seja menor de idade.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold uppercase text-slate-700 text-[10px] mb-1">
                          Limite de Vagas (Opcional)
                        </label>
                        <input
                          type="number"
                          min={1}
                          placeholder="Ex: 50 (Vazio = Ilimitado)"
                          value={eventForm.registrationLimit || ''}
                          onChange={(e) => setEventForm({ ...eventForm, registrationLimit: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#102bde]"
                        />
                      </div>

                      <div>
                        <DatePicker
                          label="PRAZO FINAL DE INSCRIÇÃO (OPCIONAL)"
                          value={eventForm.registrationDeadline || ''}
                          onChange={(dbVal) => setEventForm({ ...eventForm, registrationDeadline: dbVal })}
                          placeholder="DD-MM-YYYY"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-slate-700 text-[10px] mb-1">
                        Instruções ou Avisos no Formulário (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: 'Trazer bíblia, roupas de cama e documento no dia da saída.'"
                        value={eventForm.registrationMessage || ''}
                        onChange={(e) => setEventForm({ ...eventForm, registrationMessage: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#102bde]"
                      />
                    </div>
                  </div>
                )}
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
                  disabled={isSavingEvent || eventUploadProgress !== null}
                  className={`px-5 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition-all ${
                    isSavingEvent || eventUploadProgress !== null
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-[#102bde] hover:bg-[#0d23b8] text-white cursor-pointer'
                  }`}
                >
                  {isSavingEvent ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando evento...</span>
                    </>
                  ) : eventUploadProgress !== null ? (
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
                  <DatePicker
                    label="DATA DA PREGAÇÃO"
                    required
                    value={sermonForm.date}
                    onChange={(dbVal) => setSermonForm({ ...sermonForm, date: dbVal })}
                    placeholder="DD-MM-YYYY"
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: CONFIRMAÇÃO DE EXCLUSÃO DE USUÁRIO                       */}
      {/* ------------------------------------------------------------- */}
      {deleteUserModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                  Excluir Usuário
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Esta ação removerá permanentemente o acesso deste integrante ao sistema.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isDeletingUser) {
                    setDeleteUserModalOpen(false);
                    setUserToDelete(null);
                  }
                }}
                disabled={isDeletingUser}
                className="text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deleteUserError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{deleteUserError}</span>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <p className="text-slate-800 font-bold">
                Deseja realmente excluir este usuário?
              </p>
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-slate-800 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Nome:</span>
                  <span className="font-black text-slate-900">{userToDelete.fullName || userToDelete.full_name || 'Usuário Sem Nome'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">E-mail:</span>
                  <span className="font-bold text-slate-700">{userToDelete.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Cargo Atual:</span>
                  <span className="font-bold uppercase text-purple-700">{userToDelete.role}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                A exclusão é realizada com segurança via backend, removendo o usuário do Supabase Auth e limpando os perfis públicos (cascade).
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => {
                  setDeleteUserModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-wider cursor-pointer shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 6: EDITAR USUÁRIO (ADMIN ONLY)                          */}
      {/* ------------------------------------------------------------- */}
      {editUserModalOpen && userToEdit && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#102bde]" />
                <h3 className="font-black text-lg uppercase text-slate-900">
                  Editar Usuário
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditUserModalOpen(false);
                  setUserToEdit(null);
                }}
                disabled={isEditingUser}
                className="text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editUserError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{editUserError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmEditUser} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={editUserFullName}
                  onChange={(e) => setEditUserFullName(e.target.value)}
                  placeholder="Ex: Pr. João Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  placeholder="Ex: usuario@igreja.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Cargo / Nível de Acesso
                </label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white focus:outline-none focus:border-[#102bde] cursor-pointer"
                >
                  <option value="admin">Administrador (Acesso Total)</option>
                  <option value="media">Mídia (Gerencia Pregações e Eventos)</option>
                  <option value="intercession">Intercessão (Gerencia Pedidos de Oração)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#102bde] shrink-0 mt-0.5" />
                <span>
                  As alterações serão atualizadas com segurança na tabela pública e sincronizadas no Supabase Auth.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isEditingUser}
                  onClick={() => {
                    setEditUserModalOpen(false);
                    setUserToEdit(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isEditingUser}
                  className="px-5 py-2.5 rounded-xl bg-[#102bde] hover:bg-[#0d23b8] text-white font-black uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isEditingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAINEL DO DISTRITO & CONGREGAÇÕES */}
      {activeTab === 'district' && (
        <div className="space-y-10">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs uppercase mb-2">
                <Building2 className="w-4 h-4" />
                <span>Página Institucional do Distrito</span>
              </div>
              <h2 className="text-2xl font-black uppercase text-slate-900">
                Distrito Missionário de Campinas
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Gerencie o conteúdo institucional do distrito e cadastre as congregações locais ativas.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCongregation(null);
                setCongregationModalOpen(true);
              }}
              className="px-5 py-3 rounded-xl bg-[#102bde] text-white font-black text-xs uppercase tracking-wider hover:bg-[#0d23b8] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Congregação</span>
            </button>
          </div>

          {/* Form 1: Informações Gerais do Distrito */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Informações Institucionais do Distrito
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Estes dados serão exibidos no cabeçalho e na apresentação da página do Distrito.
                </p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingDistrictInfo(true);
                try {
                  const updated = await updateDistrictInfo(districtInfoState);
                  setDistrictInfoState(updated);
                  alert('Informações do distrito salvas com sucesso!');
                } catch (err: any) {
                  alert(err.message || 'Erro ao salvar distrito.');
                } finally {
                  setIsSavingDistrictInfo(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Título Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={districtInfoState.title}
                    onChange={(e) => setDistrictInfoState({ ...districtInfoState, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Subtítulo / Região *
                  </label>
                  <input
                    type="text"
                    required
                    value={districtInfoState.subtitle}
                    onChange={(e) => setDistrictInfoState({ ...districtInfoState, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Texto de Apresentação *
                </label>
                <textarea
                  rows={3}
                  required
                  value={districtInfoState.description}
                  onChange={(e) => setDistrictInfoState({ ...districtInfoState, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Texto de Propósito Regional / Missão *
                </label>
                <textarea
                  rows={3}
                  required
                  value={districtInfoState.purpose}
                  onChange={(e) => setDistrictInfoState({ ...districtInfoState, purpose: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  URL da Imagem de Banner/Destaque
                </label>
                <input
                  type="text"
                  value={districtInfoState.bannerUrl || ''}
                  onChange={(e) => setDistrictInfoState({ ...districtInfoState, bannerUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingDistrictInfo}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSavingDistrictInfo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salvar Informações do Distrito</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Lista de Congregações Cadastradas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Congregações do Distrito ({districtCongregations.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Todas as igrejas locais cadastradas que compõem o Distrito Missionário de Campinas.
                </p>
              </div>
            </div>

            {districtCongregations.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600 uppercase">Nenhuma congregação cadastrada</p>
                <p className="text-xs text-slate-400">Clique no botão "Nova Congregação" para adicionar a primeira igreja do distrito.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Imagem / Cidade</th>
                      <th className="py-3 px-4">Nome da Congregação</th>
                      <th className="py-3 px-4">Pastor Responsável</th>
                      <th className="py-3 px-4">WhatsApp & Endereço</th>
                      <th className="py-3 px-4">Ordem</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {districtCongregations.map((cong) => (
                      <tr key={cong.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={cong.imageUrl || 'https://images.unsplash.com/photo-1548625361-181358913a0e?auto=format&fit=crop&q=80&w=200'}
                              alt={cong.name}
                              className="w-12 h-10 object-cover rounded-lg border border-slate-200 shadow-xs"
                            />
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded text-[11px] uppercase">
                              {cong.city}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-black text-slate-900 uppercase block">{cong.name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">
                          {cong.pastorName || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="block font-mono text-[11px] text-emerald-700 font-bold">{cong.whatsapp}</span>
                          <span className="block text-[11px] text-slate-500 line-clamp-1">{cong.address}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-500">
                          #{cong.sortOrder}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={async () => {
                              try {
                                await updateDistrictCongregation(cong.id, { isActive: !cong.isActive });
                              } catch (err: any) {
                                alert(err.message);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer transition-colors ${
                              cong.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {cong.isActive ? 'Ativa' : 'Inativa'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingCongregation(cong);
                                setCongregationModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#102bde] hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Editar Congregação"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setCongregationToDelete(cong);
                                setDeleteCongregationModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Excluir Congregação"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR CONGREGAÇÃO */}
      {congregationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg uppercase text-slate-900">
                {editingCongregation ? 'Editar Congregação' : 'Nova Congregação do Distrito'}
              </h3>
              <button
                onClick={() => setCongregationModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingCongregation(true);

                const form = e.currentTarget;
                const formData = new FormData(form);

                const dataPayload = {
                  name: formData.get('name') as string,
                  city: formData.get('city') as string,
                  pastorName: formData.get('pastorName') as string,
                  address: formData.get('address') as string,
                  whatsapp: formData.get('whatsapp') as string,
                  googleMapsEmbedUrl: formData.get('googleMapsEmbedUrl') as string,
                  socialType: formData.get('socialType') as 'facebook' | 'instagram' | 'youtube',
                  socialUrl: formData.get('socialUrl') as string,
                  imageUrl: formData.get('imageUrl') as string,
                  sortOrder: Number(formData.get('sortOrder')) || 0,
                  isActive: formData.get('isActive') === 'on',
                };

                try {
                  if (editingCongregation) {
                    await updateDistrictCongregation(editingCongregation.id, dataPayload);
                  } else {
                    await addDistrictCongregation(dataPayload);
                  }
                  setCongregationModalOpen(false);
                  setEditingCongregation(null);
                } catch (err: any) {
                  alert(err.message || 'Erro ao salvar congregação.');
                } finally {
                  setIsSavingCongregation(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Nome da Congregação *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingCongregation?.name || ''}
                    placeholder="Ex: IMW Artur Nogueira"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Cidade *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    defaultValue={editingCongregation?.city || ''}
                    placeholder="Ex: Artur Nogueira"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Pastor(a) Responsável</label>
                <input
                  type="text"
                  name="pastorName"
                  defaultValue={editingCongregation?.pastorName || ''}
                  placeholder="Ex: Pr. Carlos & Miss. Ana"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Endereço Completo *</label>
                <input
                  type="text"
                  name="address"
                  required
                  defaultValue={editingCongregation?.address || ''}
                  placeholder="Ex: Rua Duque de Caxias, 450 - Centro, Artur Nogueira - SP"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">WhatsApp de Contato *</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    defaultValue={editingCongregation?.whatsapp || ''}
                    placeholder="Ex: 19991234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#102bde]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={editingCongregation?.sortOrder ?? (districtCongregations.length + 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">URL do Iframe/Embed do Google Maps (Opcional)</label>
                <input
                  type="text"
                  name="googleMapsEmbedUrl"
                  defaultValue={editingCongregation?.googleMapsEmbedUrl || ''}
                  placeholder="https://maps.google.com/maps?q=...&output=embed"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Rede Social</label>
                  <select
                    name="socialType"
                    defaultValue={editingCongregation?.socialType || 'instagram'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">URL da Rede Social</label>
                  <input
                    type="text"
                    name="socialUrl"
                    defaultValue={editingCongregation?.socialUrl || ''}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#102bde]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">URL da Foto da Congregação</label>
                <input
                  type="text"
                  name="imageUrl"
                  defaultValue={editingCongregation?.imageUrl || ''}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#102bde]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingCongregation ? editingCongregation.isActive : true}
                  className="w-4 h-4 text-[#102bde] rounded border-slate-300"
                />
                <label htmlFor="isActive" className="font-bold uppercase text-slate-800 text-xs cursor-pointer">
                  Exibir esta congregação no site público
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCongregationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCongregation}
                  className="px-5 py-2 rounded-xl bg-[#102bde] text-white font-black uppercase tracking-wider hover:bg-[#0d23b8] cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingCongregation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Congregação</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXCLUIR CONGREGAÇÃO */}
      {deleteCongregationModalOpen && congregationToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-black text-lg uppercase">Excluir Congregação?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza que deseja excluir a congregação <strong className="text-slate-900 uppercase">{congregationToDelete.name}</strong>? Ela deixará de ser exibida no site do distrito.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteCongregationModalOpen(false);
                  setCongregationToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteDistrictCongregation(congregationToDelete.id);
                    setDeleteCongregationModalOpen(false);
                    setCongregationToDelete(null);
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs uppercase hover:bg-red-700 transition-all cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LISTA DE INSCRITOS DO EVENTO (ADMIN) */}
      {selectedEventForRegistrations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-6 max-h-[90vh] flex flex-col my-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#102bde] font-bold text-xs uppercase mb-2">
                  <Users className="w-4 h-4" />
                  <span>Gestão de Inscritos</span>
                </div>
                <h2 className="font-sans font-black text-2xl uppercase text-slate-900">
                  {selectedEventForRegistrations.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {formatDateToDisplay(selectedEventForRegistrations.date)} • {selectedEventForRegistrations.time}
                </p>
              </div>
              <button
                onClick={() => setSelectedEventForRegistrations(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            {(() => {
              const eventRegs = allRegistrations.filter((r) => r.eventId === selectedEventForRegistrations.id);
              const filteredRegs = eventRegs.filter((r) => {
                if (!registrationSearchQuery) return true;
                const q = registrationSearchQuery.toLowerCase();
                return (
                  r.fullName.toLowerCase().includes(q) ||
                  r.email.toLowerCase().includes(q) ||
                  r.phone.toLowerCase().includes(q)
                );
              });

              const limit = selectedEventForRegistrations.registrationLimit;

              const handleCopyList = () => {
                const lines = [
                  `LISTA DE INSCRITOS: ${selectedEventForRegistrations.title.toUpperCase()}`,
                  `Data: ${formatDateToDisplay(selectedEventForRegistrations.date)}`,
                  `Total de Inscritos: ${eventRegs.length}${limit ? ` / Limite: ${limit}` : ''}`,
                  `----------------------------------------------------`,
                  ...eventRegs.map((r, i) => `${i + 1}. ${r.fullName} | Tel: ${r.phone} | Email: ${r.email}${r.notes ? ` (Obs: ${r.notes})` : ''}`),
                ].join('\n');

                navigator.clipboard.writeText(lines);
                setCopiedRegistrations(true);
                setTimeout(() => setCopiedRegistrations(false), 2500);
              };

              return (
                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Total de Inscritos</span>
                      <span className="text-2xl font-black text-slate-900">{eventRegs.length}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Limite de Vagas</span>
                      <span className="text-2xl font-black text-slate-900">
                        {limit ? `${limit} vagas` : 'Ilimitado'}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Status das Inscrições</span>
                      <span className={`text-sm font-black uppercase ${selectedEventForRegistrations.enableRegistration ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {selectedEventForRegistrations.enableRegistration ? 'Inscrições Abertas' : 'Inscrições Fechadas'}
                      </span>
                    </div>
                  </div>

                  {/* Filter & Copy */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar por nome, e-mail ou telefone..."
                        value={registrationSearchQuery}
                        onChange={(e) => setRegistrationSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#102bde]"
                      />
                    </div>

                    <button
                      onClick={handleCopyList}
                      disabled={eventRegs.length === 0}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {copiedRegistrations ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-600">Lista Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#102bde]" />
                          <span>Copiar Lista de Inscritos</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Table */}
                  <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-white min-h-[220px]">
                    {filteredRegs.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-xs uppercase">Nenhum participante inscrito.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                            <th className="py-2.5 px-4">#</th>
                            <th className="py-2.5 px-4">Nome Completo</th>
                            <th className="py-2.5 px-4">E-mail / Telefone</th>
                            <th className="py-2.5 px-4">Tipo Inscrição</th>
                            <th className="py-2.5 px-4">Data</th>
                            <th className="py-2.5 px-4 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredRegs.map((reg, idx) => {
                            const isExpanded = expandedRegId === reg.id;
                            const isRetreatReg = reg.registrationType === 'retreat' || Boolean(reg.rgCpf || reg.emergencyContactName);

                            return (
                              <React.Fragment key={reg.id}>
                                <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-amber-50/40' : ''}`}>
                                  <td className="py-3 px-4 font-mono font-bold text-slate-400 text-[11px]">
                                    {idx + 1}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-slate-900 block">{reg.fullName}</span>
                                    {reg.isMinor && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5">
                                        Menor de Idade
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-slate-800 font-medium block">{reg.email}</span>
                                    <span className="text-slate-500 text-[11px] block">{reg.phone}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    {isRetreatReg ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[10px] uppercase border border-amber-200">
                                        <Tent className="w-3 h-3 text-amber-700" /> Retiro (Completo)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#102bde] font-bold text-[10px] uppercase">
                                        Simples
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                                    {formatDateToDisplay(reg.createdAt)}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {isRetreatReg && (
                                        <button
                                          onClick={() => setExpandedRegId(isExpanded ? null : reg.id)}
                                          className={`px-2.5 py-1.5 rounded text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                                            isExpanded
                                              ? 'bg-amber-200 text-amber-950 hover:bg-amber-300'
                                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                          }`}
                                          title="Ver Ficha Completa do Retiro"
                                        >
                                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                                          <span>{isExpanded ? 'Ocultar' : 'Ficha'}</span>
                                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                      )}
                                      <button
                                        onClick={async () => {
                                          if (confirm(`Remover a inscrição de ${reg.fullName}?`)) {
                                            await deleteEventRegistration(reg.id);
                                          }
                                        }}
                                        className="p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Remover Inscrição"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* DETALHES EXPANDIDOS PARA INSCRIÇÃO DE RETIRO */}
                                {isExpanded && isRetreatReg && (
                                  <tr className="bg-amber-50/60 border-b border-amber-200">
                                    <td colSpan={6} className="p-4 space-y-4">
                                      <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm space-y-4 text-xs">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                          <div className="flex items-center gap-2 text-amber-900 font-black uppercase tracking-wider text-xs">
                                            <Tent className="w-4 h-4 text-amber-600" />
                                            <span>Ficha Completa de Inscrição — Retiro Espiritual</span>
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-400">
                                            ID: {reg.id}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* Bloco 1: Dados Pessoais */}
                                          <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                                            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block text-[#102bde]">
                                              1. Identificação & Contato
                                            </span>
                                            <div className="space-y-1 text-slate-700">
                                              <p><strong>Nome Completo:</strong> {reg.fullName}</p>
                                              <p><strong>RG / CPF:</strong> {reg.rgCpf || 'Não informado'}</p>
                                              <p><strong>Data de Nasc.:</strong> {formatDateToDisplay(reg.birthDate) || 'Não informada'}</p>
                                              <p><strong>Gênero:</strong> {reg.gender || 'Não informado'}</p>
                                              <p><strong>Cidade/UF:</strong> {reg.cityState || 'Não informada'}</p>
                                              <p><strong>E-mail:</strong> {reg.email}</p>
                                              <p><strong>WhatsApp/Telefone:</strong> {reg.phone}</p>
                                            </div>
                                          </div>

                                          {/* Bloco 2: Contato de Emergência */}
                                          <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                                            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block text-red-600 flex items-center gap-1">
                                              <Phone className="w-3 h-3" /> 2. Contato de Emergência
                                            </span>
                                            <div className="space-y-1 text-slate-700">
                                              <p><strong>Nome do Contato:</strong> {reg.emergencyContactName || 'Não informado'}</p>
                                              <p><strong>Parentesco / Relação:</strong> {reg.emergencyRelationship || 'Não informado'}</p>
                                              <p><strong>Telefone Emergência:</strong> <a href={`tel:${reg.emergencyPhone}`} className="text-[#102bde] underline font-bold">{reg.emergencyPhone || 'Não informado'}</a></p>
                                              {reg.notes && (
                                                <p className="mt-2 pt-2 border-t border-slate-200 italic text-slate-600">
                                                  <strong>Observações Gerais:</strong> "{reg.notes}"
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* Bloco 3: Saúde & Cuidados */}
                                          <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
                                            <span className="font-bold text-red-900 uppercase text-[10px] tracking-wider block flex items-center gap-1">
                                              <HeartPulse className="w-3.5 h-3.5 text-red-600" /> 3. Ficha de Saúde e Medicamentos
                                            </span>
                                            <div className="space-y-1.5 text-slate-800">
                                              <p>
                                                <strong>Alergias:</strong>{' '}
                                                {reg.hasAllergies ? (
                                                  <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded">Sim: {reg.allergiesDetails}</span>
                                                ) : (
                                                  <span className="text-slate-600">Não</span>
                                                )}
                                              </p>
                                              <p>
                                                <strong>Uso de Medicamento Contínuo:</strong>{' '}
                                                {reg.takesMedication ? (
                                                  <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded">Sim: {reg.medicationDetails}</span>
                                                ) : (
                                                  <span className="text-slate-600">Não</span>
                                                )}
                                              </p>
                                              <p>
                                                <strong>Restrição Alimentar:</strong>{' '}
                                                {reg.hasDietaryRestrictions ? (
                                                  <span className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Sim: {reg.dietaryDetails}</span>
                                                ) : (
                                                  <span className="text-slate-600">Não</span>
                                                )}
                                              </p>
                                              {reg.healthNotes && (
                                                <p className="text-slate-700">
                                                  <strong>Outras Condições de Saúde:</strong> {reg.healthNotes}
                                                </p>
                                              )}
                                            </div>
                                          </div>

                                          {/* Bloco 4: Responsável Legal (Menor de Idade) */}
                                          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                                            <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block flex items-center gap-1">
                                              <UserIcon className="w-3.5 h-3.5 text-amber-700" /> 4. Status de Idade & Responsável Legal
                                            </span>
                                            {reg.isMinor ? (
                                              <div className="space-y-1 text-slate-800">
                                                <p className="text-amber-900 font-bold bg-amber-200/80 px-2 py-0.5 rounded inline-block">
                                                  Participante Menor de Idade
                                                </p>
                                                <p><strong>Nome do Responsável:</strong> {reg.guardianName || 'Não informado'}</p>
                                                <p><strong>Parentesco:</strong> {reg.guardianRelationship || 'Não informado'}</p>
                                                <p><strong>Telefone do Responsável:</strong> {reg.guardianPhone || 'Não informado'}</p>
                                                <p><strong>RG/CPF do Responsável:</strong> {reg.guardianRgCpf || 'Não informado'}</p>
                                              </div>
                                            ) : (
                                              <p className="text-slate-600 font-medium">Participante Maior de Idade.</p>
                                            )}

                                            <div className="pt-2 border-t border-amber-200/60 space-y-1 text-[11px] text-slate-600">
                                              <p>
                                                <strong>Aceitou Regras do Retiro:</strong>{' '}
                                                {reg.acceptedRetreatTerms ? (
                                                  <span className="text-emerald-700 font-bold">Sim (Confirmado)</span>
                                                ) : (
                                                  <span className="text-red-600 font-bold">Não</span>
                                                )}
                                              </p>
                                              <p>
                                                <strong>Autorização de Imagem e Som:</strong>{' '}
                                                {reg.acceptedMediaRelease ? (
                                                  <span className="text-emerald-700 font-bold">Sim (Autorizado)</span>
                                                ) : (
                                                  <span className="text-slate-500">Não autorizou</span>
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEventForRegistrations(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
