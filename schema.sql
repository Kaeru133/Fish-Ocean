-- SQL Schema para o banco de dados Supabase do BlueGigs

-- 1. Tabela de Perfis (perfis adicionais dos usuários da tabela auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('poster', 'doer')) NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    skills TEXT[] DEFAULT '{}',
    rating NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS) na tabela de Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso para Profiles
CREATE POLICY "Qualquer pessoa pode ler perfis" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);


-- 2. Tabela de Gigs (Serviços)
CREATE TABLE IF NOT EXISTS public.gigs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward NUMERIC(10, 2) NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Limpeza de Praia', 'Monitoramento Marinho', 'Preservação de Mangue', 'Pesca Sustentável', 'Educação Ambiental', 'Outros')),
    status TEXT CHECK (status IN ('open', 'in_progress', 'completed')) DEFAULT 'open' NOT NULL,
    poster_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS) na tabela de Gigs
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso para Gigs
CREATE POLICY "Qualquer pessoa autenticada pode ler gigs" 
ON public.gigs FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Qualquer contratante (poster) pode criar gigs" 
ON public.gigs FOR INSERT 
WITH CHECK (
    auth.uid() = poster_id AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'poster'
    )
);

CREATE POLICY "Donos dos gigs ou prestador associado podem atualizar" 
ON public.gigs FOR UPDATE 
USING (
    auth.uid() = poster_id OR 
    auth.uid() = doer_id OR 
    (status = 'open' AND doer_id IS NULL) -- permite que um prestador se candidate (associe seu id)
);

CREATE POLICY "Apenas criador pode deletar gig" 
ON public.gigs FOR DELETE 
USING (auth.uid() = poster_id);


-- 3. Função e Trigger para criar perfil automaticamente no SignUp (Opcional, mas Altamente Recomendado)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, bio)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'),
    COALESCE(new.raw_user_meta_data->>'role', 'doer'),
    'Bem-vindo ao BlueGigs!'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparado ao criar um novo usuário no Auth do Supabase
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
