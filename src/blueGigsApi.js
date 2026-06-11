import { supabase } from './supabaseClient'

// Detecta se as variáveis de ambiente ainda são as originais/placeholders
const isMockMode = 
  !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL.includes('your-project-id') || 
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

if (isMockMode) {
  console.log('%c[BlueGigs] Executando em MODO MOCK (localStorage). Configure o arquivo .env com chaves reais do Supabase para conectar ao banco online.', 'color: #06b6d4; font-weight: bold; font-size: 12px;')
  
  // Inicializa dados falsos se o localStorage estiver vazio
  if (!localStorage.getItem('bluegigs_profiles')) {
    const mockProfiles = [
      {
        id: 'mock-poster-1',
        role: 'poster',
        name: 'Instituto Baleia Jubarte',
        bio: 'ONG dedicada ao monitoramento e preservação de baleias e da biodiversidade marinha costeira.',
        avatar_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop',
        skills: ['Monitoramento Científico', 'Biologia Marinha', 'Educação'],
        rating: 4.9,
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-poster-2',
        role: 'poster',
        name: 'EcoResort Porto de Galinhas',
        bio: 'Resort focado em turismo sustentável e conservação dos recifes de corais da região.',
        avatar_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop',
        skills: ['Gestão de Resíduos', 'Turismo Sustentável'],
        rating: 4.5,
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-doer-1',
        role: 'doer',
        name: 'Lucas Pescador',
        bio: 'Pescador artesanal e mergulhador autônomo local. Comprometido com a pesca limpa e sustentável.',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        skills: ['Mergulho PADI', 'Navegação', 'Pesca Artesanal'],
        rating: 4.8,
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-doer-2',
        role: 'doer',
        name: 'Mariana Costa',
        bio: 'Estudante de Oceanografia apaixonada por conservação costeira e manguezais.',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        skills: ['Identificação de Espécies', 'Restauração de Mangue', 'Educação'],
        rating: 5.0,
        created_at: new Date().toISOString()
      }
    ]
    localStorage.setItem('bluegigs_profiles', JSON.stringify(mockProfiles))
  }

  if (!localStorage.getItem('bluegigs_gigs')) {
    const mockGigs = [
      {
        id: 'gig-1',
        title: 'Mutirão de Remoção de Plásticos e Microplásticos',
        description: 'Precisamos de voluntários/prestadores para realizar uma varredura fina de microplásticos na praia do Atalaia. O lixo coletado será pesado e encaminhado para cooperativas de reciclagem parceiras. Alimentação e translado inclusos.',
        reward: 150.00,
        location: 'Praia do Atalaia, Fernando de Noronha',
        category: 'Limpeza de Praia',
        status: 'open',
        poster_id: 'mock-poster-1',
        doer_id: null,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'gig-2',
        title: 'Mapeamento de Recifes de Corais Saudáveis',
        description: 'Buscamos um mergulhador credenciado (mínimo Advanced Open Water) para auxiliar biólogos a tirar fotos em quadrantes pré-definidos de monitoramento de branqueamento de corais nos recifes costeiros.',
        reward: 350.00,
        location: 'Recifes de Porto de Galinhas, PE',
        category: 'Monitoramento Marinho',
        status: 'open',
        poster_id: 'mock-poster-2',
        doer_id: null,
        created_at: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: 'gig-3',
        title: 'Plantio de Mudas de Mangue Vermelho',
        description: 'Ação de reflorestamento do estuário local para proteger a área de reprodução de caranguejos e espécies marinhas juvenis. Serviço fisicamente puxado, mas de enorme impacto.',
        reward: 200.00,
        location: 'Estuário do Rio Sergipe, Aracaju',
        category: 'Preservação de Mangue',
        status: 'in_progress',
        poster_id: 'mock-poster-1',
        doer_id: 'mock-doer-2',
        created_at: new Date(Date.now() - 3600000 * 72).toISOString()
      }
    ]
    localStorage.setItem('bluegigs_gigs', JSON.stringify(mockGigs))
  }
}

// Funções Auxiliares para o Banco de Dados Local (LocalStorage)
function getLocalProfiles() {
  return JSON.parse(localStorage.getItem('bluegigs_profiles') || '[]')
}
function saveLocalProfiles(profiles) {
  localStorage.setItem('bluegigs_profiles', JSON.stringify(profiles))
}
function getLocalGigs() {
  return JSON.parse(localStorage.getItem('bluegigs_gigs') || '[]')
}
function saveLocalGigs(gigs) {
  localStorage.setItem('bluegigs_gigs', JSON.stringify(gigs))
}

/**
 * Autenticação - Cadastrar Usuário
 */
export async function signUpUser(email, password, name, role) {
  if (isMockMode) {
    await new Promise(res => setTimeout(res, 500))
    const profiles = getLocalProfiles()
    
    const newId = 'mock-user-' + Math.random().toString(36).substr(2, 9)
    const newProfile = {
      id: newId,
      role,
      name,
      bio: 'Bem-vindo ao BlueGigs! Conectando trabalho e sustentabilidade marinha.',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      skills: [],
      rating: 5.0,
      created_at: new Date().toISOString()
    }
    
    profiles.push(newProfile)
    saveLocalProfiles(profiles)

    const sessionUser = { id: newId, email, user_metadata: { name, role } }
    localStorage.setItem('bluegigs_current_user', JSON.stringify(sessionUser))
    return { user: sessionUser, session: {} }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: role
        }
      }
    })

    if (error) throw error

    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          name: name,
          role: role,
          bio: 'Bem-vindo ao BlueGigs! Conectando trabalho e sustentabilidade.',
          created_at: new Date().toISOString()
        })
      if (profileError) {
        console.warn('Erro ao criar perfil no fallback:', profileError.message)
      }
    }

    return { user: data.user, session: data.session }
  } catch (err) {
    console.error('Erro no cadastro:', err.message)
    throw err
  }
}

/**
 * Autenticação - Login
 */
export async function signInUser(email, password) {
  if (isMockMode) {
    await new Promise(res => setTimeout(res, 500))
    const profiles = getLocalProfiles()
    const existing = profiles.find(p => p.name.toLowerCase().includes(email.split('@')[0]) || p.role === (email.includes('poster') ? 'poster' : 'doer'))
    
    const userToLogin = existing || profiles[2]
    const sessionUser = { 
      id: userToLogin.id, 
      email, 
      user_metadata: { name: userToLogin.name, role: userToLogin.role } 
    }
    localStorage.setItem('bluegigs_current_user', JSON.stringify(sessionUser))
    return { user: sessionUser, session: {} }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return { user: data.user, session: data.session }
  } catch (err) {
    console.error('Erro no login:', err.message)
    throw err
  }
}

/**
 * Autenticação - Logout
 */
export async function signOutUser() {
  if (isMockMode) {
    localStorage.removeItem('bluegigs_current_user')
    return
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (err) {
    console.error('Erro no logout:', err.message)
    throw err
  }
}

/**
 * Obter Usuário Logado Atualmente
 */
export async function getCurrentUser() {
  if (isMockMode) {
    const u = localStorage.getItem('bluegigs_current_user')
    return u ? JSON.parse(u) : null
  }
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Buscar Perfil de Usuário
 */
export async function getUserProfile(userId) {
  if (isMockMode) {
    const profiles = getLocalProfiles()
    const p = profiles.find(prof => prof.id === userId)
    if (!p) throw new Error('Perfil não encontrado no mock')
    return p
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Erro ao buscar perfil:', err.message)
    throw err
  }
}

/**
 * Atualizar Perfil de Usuário
 */
export async function updateUserProfile(userId, updates) {
  if (isMockMode) {
    const profiles = getLocalProfiles()
    const index = profiles.findIndex(p => p.id === userId)
    if (index === -1) throw new Error('Perfil não encontrado')
    
    profiles[index] = { ...profiles[index], ...updates }
    saveLocalProfiles(profiles)
    return profiles[index]
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err.message)
    throw err
  }
}

/**
 * Buscar todos os serviços (Gigs) com filtros opcionais
 */
export async function fetchGigs(filters = {}) {
  if (isMockMode) {
    await new Promise(res => setTimeout(res, 400))
    let gigs = getLocalGigs()
    const profiles = getLocalProfiles()

    gigs = gigs.map(gig => ({
      ...gig,
      poster: profiles.find(p => p.id === gig.poster_id) || { name: 'Poster Desconhecido', rating: 5.0 },
      doer: gig.doer_id ? (profiles.find(p => p.id === gig.doer_id) || { name: 'Prestador Desconhecido', rating: 5.0 }) : null
    }))

    if (filters.status) {
      gigs = gigs.filter(g => g.status === filters.status)
    }
    if (filters.category && filters.category !== 'Todos') {
      gigs = gigs.filter(g => g.category === filters.category)
    }
    if (filters.poster_id) {
      gigs = gigs.filter(g => g.poster_id === filters.poster_id)
    }
    if (filters.doer_id) {
      gigs = gigs.filter(g => g.doer_id === filters.doer_id)
    }

    return gigs
  }

  try {
    let query = supabase
      .from('gigs')
      .select(`
        *,
        poster:profiles!gigs_poster_id_fkey(name, rating, avatar_url, bio),
        doer:profiles!gigs_doer_id_fkey(name, rating, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.category && filters.category !== 'Todos') {
      query = query.eq('category', filters.category)
    }
    if (filters.poster_id) {
      query = query.eq('poster_id', filters.poster_id)
    }
    if (filters.doer_id) {
      query = query.eq('doer_id', filters.doer_id)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  } catch (err) {
    console.error('Erro ao buscar serviços:', err.message)
    throw err
  }
}

/**
 * Criar um novo serviço (Apenas Contratantes)
 */
export async function createGig(title, description, reward, location, category, posterId) {
  if (isMockMode) {
    const gigs = getLocalGigs()
    const newGig = {
      id: 'gig-' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      reward: parseFloat(reward),
      location,
      category,
      status: 'open',
      poster_id: posterId,
      doer_id: null,
      created_at: new Date().toISOString()
    }
    gigs.unshift(newGig)
    saveLocalGigs(gigs)
    return newGig
  }

  try {
    const { data, error } = await supabase
      .from('gigs')
      .insert({
        title,
        description,
        reward: parseFloat(reward),
        location,
        category,
        poster_id: posterId,
        status: 'open'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Erro ao criar serviço:', err.message)
    throw err
  }
}

/**
 * Candidatar-se / Aceitar um serviço (Apenas Prestadores)
 */
export async function acceptGig(gigId, doerId) {
  if (isMockMode) {
    const gigs = getLocalGigs()
    const index = gigs.findIndex(g => g.id === gigId)
    if (index === -1) throw new Error('Serviço não encontrado')
    
    gigs[index].doer_id = doerId
    gigs[index].status = 'in_progress'
    saveLocalGigs(gigs)
    return gigs[index]
  }

  try {
    const { data, error } = await supabase
      .from('gigs')
      .update({
        doer_id: doerId,
        status: 'in_progress'
      })
      .eq('id', gigId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Erro ao aceitar serviço:', err.message)
    throw err
  }
}

/**
 * Concluir / Finalizar um serviço
 */
export async function completeGig(gigId) {
  if (isMockMode) {
    const gigs = getLocalGigs()
    const index = gigs.findIndex(g => g.id === gigId)
    if (index === -1) throw new Error('Serviço não encontrado')
    
    gigs[index].status = 'completed'
    saveLocalGigs(gigs)
    return gigs[index]
  }

  try {
    const { data, error } = await supabase
      .from('gigs')
      .update({
        status: 'completed'
      })
      .eq('id', gigId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Erro ao concluir serviço:', err.message)
    throw err
  }
}
