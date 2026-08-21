-- ====================================================================
-- IGREJA METODISTA WESLEYANA DE COSMÓPOLIS
-- SUPABASE SCHEMA, ROLES & RLS POLICIES
-- Execute este script no SQL Editor do seu Dashboard no Supabase
-- ====================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELA DE PERFIS (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'media', 'intercession')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE CONVITES (INVITES)
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'media', 'intercession')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA DE PEDIDOS DE ORAÇÃO (PRAYER_REQUESTS)
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  category TEXT DEFAULT 'Geral',
  request_text TEXT NOT NULL,
  is_confidential BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'prayed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABELAS ADICIONAIS DO DASHBOARD
CREATE TABLE IF NOT EXISTS public.sermons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  preacher TEXT,
  date TEXT,
  youtube_id TEXT,
  youtube_url TEXT,
  embed_url TEXT,
  duration TEXT,
  scripture TEXT,
  category TEXT,
  thumbnail TEXT,
  image_url TEXT,
  image_path TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  slug TEXT,
  title TEXT NOT NULL,
  date TEXT,
  end_date TEXT,
  time TEXT,
  location TEXT,
  description TEXT,
  image_url TEXT,
  badge TEXT,
  event_type TEXT DEFAULT 'local',
  is_featured BOOLEAN DEFAULT false,
  enable_registration BOOLEAN DEFAULT false,
  registration_type TEXT DEFAULT 'simple',
  registration_deadline TIMESTAMPTZ,
  registration_limit INT,
  registration_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alter table to ensure columns exist if events table already exists
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'local';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS enable_registration BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_type TEXT DEFAULT 'simple';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_limit INT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_message TEXT;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- TABELA DE INSCRIÇÕES EM EVENTOS E RETIROS ESPIRITUAIS
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_type TEXT DEFAULT 'simple',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  
  -- Campos para Retiro / Evento com Pernoite
  birth_date TEXT,
  document_id TEXT,
  gender TEXT,
  city TEXT,
  
  -- Saúde e Cuidados
  has_allergies BOOLEAN DEFAULT false,
  allergies_details TEXT,
  has_medications BOOLEAN DEFAULT false,
  medications_details TEXT,
  health_conditions TEXT,
  has_dietary_restrictions BOOLEAN DEFAULT false,
  dietary_details TEXT,
  medical_notes TEXT,
  
  -- Contato de Emergência
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_phone_alt TEXT,
  
  -- Menor de Idade & Responsável Legal
  is_minor BOOLEAN DEFAULT false,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  guardian_document TEXT,
  guardian_authorization BOOLEAN DEFAULT false,
  emergency_medical_consent BOOLEAN DEFAULT false,
  
  -- Consentimentos
  truthful_info_consent BOOLEAN DEFAULT false,
  terms_consent BOOLEAN DEFAULT false,
  emergency_contact_consent BOOLEAN DEFAULT false,
  
  -- Backup estruturado JSONB
  details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedules (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT,
  is_highlight BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ministries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  age_range TEXT,
  description TEXT,
  detailed_description TEXT,
  meeting_time TEXT,
  meeting_location TEXT,
  leader_name TEXT,
  leader_role TEXT,
  leader_photo TEXT,
  leader_contact TEXT,
  theme_color JSONB,
  is_playful BOOLEAN DEFAULT false,
  gallery JSONB,
  activities JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.church_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  spotify_url TEXT,
  spotify_embed_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- FUNÇÕES AUXILIARES DE CONTROLE DE ACESSO (RBAC)
-- ====================================================================

-- Função para buscar o cargo (role) do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Funções booleanas de verificação
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_media()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role = 'media' FROM public.profiles WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_intercession()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role = 'intercession' FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- Trigger para criar automaticamente perfil quando um novo usuário for inserido no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_role TEXT := NULL;
  v_invite_role TEXT;
  v_invited_by UUID;
  v_full_name TEXT;
BEGIN
  -- 1. Extrair nome completo dos metadados do usuário ou derivar do e-mail
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'first_name',
    INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' '))
  );

  -- 2. Verificar se o cadastro possui invite_token nos metadados
  IF (NEW.raw_user_meta_data->>'invite_token') IS NOT NULL THEN
    SELECT role, invited_by INTO v_invite_role, v_invited_by
    FROM public.invites
    WHERE token = NEW.raw_user_meta_data->>'invite_token'
      AND accepted_at IS NULL
      AND expires_at > now();

    IF v_invite_role IS NOT NULL THEN
      v_role := v_invite_role;
      UPDATE public.invites
      SET accepted_at = now()
      WHERE token = NEW.raw_user_meta_data->>'invite_token';
    END IF;
  END IF;

  -- 3. Se não veio de convite, verificar cargo nos metadados do cadastro
  IF v_role IS NULL THEN
    IF (NEW.raw_user_meta_data->>'role') IS NOT NULL AND (NEW.raw_user_meta_data->>'role') IN ('admin', 'media', 'intercession') THEN
      v_role := NEW.raw_user_meta_data->>'role';
    ELSE
      -- Apenas se for o PRIMEIRO usuário absoluto do sistema, define como admin.
      -- Todos os demais usuários criados sem cargo ou direto no Auth viram 'media' por padrão (NUNCA admin).
      SELECT COUNT(*) INTO v_count FROM public.profiles;
      IF v_count = 0 THEN
        v_role := 'admin';
      ELSE
        v_role := 'media';
      END IF;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, invited_by, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role,
    v_invited_by,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      role = COALESCE(public.profiles.role, EXCLUDED.role),
      updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Sincronização e Backfill: Garantir coluna full_name e popular usuários existentes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'first_name',
    INITCAP(REPLACE(SPLIT_PART(u.email, '@', 1), '.', ' '))
  ) AS full_name,
  COALESCE(u.raw_user_meta_data->>'role', 'media') AS role,
  u.created_at,
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Atualizar perfis existentes que ainda possuem full_name nulo ou em branco
UPDATE public.profiles p
SET full_name = COALESCE(
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'name',
  u.raw_user_meta_data->>'first_name',
  INITCAP(REPLACE(SPLIT_PART(p.email, '@', 1), '.', ' '))
)
FROM auth.users u
WHERE p.id = u.id AND (p.full_name IS NULL OR TRIM(p.full_name) = '');

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- 4.1. EVENT REGISTRATIONS POLICIES
-- Public (anonymous or authenticated) can submit new registrations
DROP POLICY IF EXISTS "Public insert event_registrations" ON public.event_registrations;
CREATE POLICY "Public insert event_registrations" ON public.event_registrations
  FOR INSERT WITH CHECK (true);

-- Only Admin and Media roles can view sensitive registration details (health, emergency contacts, guardians)
DROP POLICY IF EXISTS "Admin and Media select event_registrations" ON public.event_registrations;
CREATE POLICY "Admin and Media select event_registrations" ON public.event_registrations
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_media());

-- Only Admin and Media roles can update registrations
DROP POLICY IF EXISTS "Admin and Media update event_registrations" ON public.event_registrations;
CREATE POLICY "Admin and Media update event_registrations" ON public.event_registrations
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_media());

-- Only Admin and Media roles can delete registrations
DROP POLICY IF EXISTS "Admin and Media delete event_registrations" ON public.event_registrations;
CREATE POLICY "Admin and Media delete event_registrations" ON public.event_registrations
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_media());

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Users view own or admin views all" ON public.profiles;
CREATE POLICY "Users view own or admin views all" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;
CREATE POLICY "Profiles delete policy" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 2. INVITES POLICIES
DROP POLICY IF EXISTS "Invites select policy" ON public.invites;
CREATE POLICY "Invites select policy" ON public.invites
  FOR SELECT TO anon, authenticated
  USING (public.is_admin() OR (accepted_at IS NULL AND expires_at > now()));

DROP POLICY IF EXISTS "Invites insert policy" ON public.invites;
CREATE POLICY "Invites insert policy" ON public.invites
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Invites update policy" ON public.invites;
CREATE POLICY "Invites update policy" ON public.invites
  FOR UPDATE TO anon, authenticated
  USING (public.is_admin() OR accepted_at IS NULL);

DROP POLICY IF EXISTS "Invites delete policy" ON public.invites;
CREATE POLICY "Invites delete policy" ON public.invites
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 3. SERMONS POLICIES (Public read; Admin & Media write)
DROP POLICY IF EXISTS "Public read sermons" ON public.sermons;
CREATE POLICY "Public read sermons" ON public.sermons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin and Media insert sermons" ON public.sermons;
CREATE POLICY "Admin and Media insert sermons" ON public.sermons
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_media());

DROP POLICY IF EXISTS "Admin and Media update sermons" ON public.sermons;
CREATE POLICY "Admin and Media update sermons" ON public.sermons
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_media());

DROP POLICY IF EXISTS "Admin and Media delete sermons" ON public.sermons;
CREATE POLICY "Admin and Media delete sermons" ON public.sermons
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_media());

-- 4. EVENTS POLICIES (Public read; Admin & Media write)
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin and Media insert events" ON public.events;
CREATE POLICY "Admin and Media insert events" ON public.events
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_media());

DROP POLICY IF EXISTS "Admin and Media update events" ON public.events;
CREATE POLICY "Admin and Media update events" ON public.events
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_media());

DROP POLICY IF EXISTS "Admin and Media delete events" ON public.events;
CREATE POLICY "Admin and Media delete events" ON public.events
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_media());

-- 5. SCHEDULES POLICIES (Public read; Admin write)
DROP POLICY IF EXISTS "Public read schedules" ON public.schedules;
CREATE POLICY "Public read schedules" ON public.schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert schedules" ON public.schedules;
CREATE POLICY "Admin insert schedules" ON public.schedules FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update schedules" ON public.schedules;
CREATE POLICY "Admin update schedules" ON public.schedules FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin delete schedules" ON public.schedules;
CREATE POLICY "Admin delete schedules" ON public.schedules FOR DELETE TO authenticated USING (public.is_admin());

-- 6. MINISTRIES POLICIES (Public read; Admin write)
DROP POLICY IF EXISTS "Public read ministries" ON public.ministries;
CREATE POLICY "Public read ministries" ON public.ministries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert ministries" ON public.ministries;
CREATE POLICY "Admin insert ministries" ON public.ministries FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update ministries" ON public.ministries;
CREATE POLICY "Admin update ministries" ON public.ministries FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin delete ministries" ON public.ministries;
CREATE POLICY "Admin delete ministries" ON public.ministries FOR DELETE TO authenticated USING (public.is_admin());

-- 7. CHURCH SETTINGS POLICIES (Public read; Admin write)
DROP POLICY IF EXISTS "Public read settings" ON public.church_settings;
CREATE POLICY "Public read settings" ON public.church_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin all settings" ON public.church_settings;
CREATE POLICY "Admin all settings" ON public.church_settings FOR ALL TO authenticated USING (public.is_admin());

-- 8. PRAYER REQUESTS POLICIES (Public insert; Admin & Intercession read/write)
DROP POLICY IF EXISTS "Public insert prayer_requests" ON public.prayer_requests;
CREATE POLICY "Public insert prayer_requests" ON public.prayer_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin and Intercession select prayer_requests" ON public.prayer_requests;
CREATE POLICY "Admin and Intercession select prayer_requests" ON public.prayer_requests
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_intercession());

DROP POLICY IF EXISTS "Admin and Intercession update prayer_requests" ON public.prayer_requests;
CREATE POLICY "Admin and Intercession update prayer_requests" ON public.prayer_requests
  FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_intercession());

DROP POLICY IF EXISTS "Admin and Intercession delete prayer_requests" ON public.prayer_requests;
CREATE POLICY "Admin and Intercession delete prayer_requests" ON public.prayer_requests
  FOR DELETE TO authenticated USING (public.is_admin() OR public.is_intercession());

-- ====================================================================
-- 9. FUNÇÃO DE EXCLUSÃO DE USUÁRIO POR ADMINISTRADOR (AUTH & PROFILES)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- 1. Verificar se o chamador é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem excluir usuários.';
  END IF;

  -- 2. Impedir que o administrador exclua a si mesmo
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não é permitido excluir seu próprio usuário.';
  END IF;

  -- 3. Deletar da tabela auth.users (o ON DELETE CASCADE removerá de public.profiles)
  DELETE FROM auth.users WHERE id = target_user_id;

  -- 4. Garantir exclusão em public.profiles caso exista desacoplamento
  DELETE FROM public.profiles WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- ====================================================================
-- 10. FUNÇÃO DE EDIÇÃO DE USUÁRIO POR ADMINISTRADOR (AUTH & PROFILES)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.update_user_by_admin(
  target_user_id UUID,
  new_full_name TEXT DEFAULT NULL,
  new_role TEXT DEFAULT NULL,
  new_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_updated_profile JSONB;
BEGIN
  -- 1. Verificar se o chamador é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem editar usuários.';
  END IF;

  -- 2. Validar cargo se fornecido
  IF new_role IS NOT NULL AND new_role NOT IN ('admin', 'media', 'intercession') THEN
    RAISE EXCEPTION 'Cargo inválido. Escolha entre admin, media ou intercession.';
  END IF;

  -- 3. Atualizar a tabela pública public.profiles
  UPDATE public.profiles
  SET 
    full_name = COALESCE(NULLIF(TRIM(new_full_name), ''), full_name),
    role = COALESCE(new_role, role),
    email = COALESCE(NULLIF(TRIM(new_email), ''), email),
    updated_at = now()
  WHERE id = target_user_id;

  -- 4. Sincronizar em auth.users (email, raw_user_meta_data, raw_app_meta_data)
  UPDATE auth.users
  SET 
    email = COALESCE(NULLIF(TRIM(new_email), ''), email),
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) 
      || jsonb_build_object(
          'full_name', COALESCE(NULLIF(TRIM(new_full_name), ''), raw_user_meta_data->>'full_name'),
          'name', COALESCE(NULLIF(TRIM(new_full_name), ''), raw_user_meta_data->>'name'),
          'role', COALESCE(new_role, raw_user_meta_data->>'role')
        ),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', COALESCE(new_role, raw_app_meta_data->>'role')),
    updated_at = now()
  WHERE id = target_user_id;

  -- 5. Retornar os dados atualizados em formato JSON
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'full_name', p.full_name,
    'fullName', p.full_name,
    'role', p.role,
    'updatedAt', p.updated_at
  )::jsonb INTO v_updated_profile
  FROM public.profiles p
  WHERE p.id = target_user_id;

  RETURN v_updated_profile;
END;
$$;
