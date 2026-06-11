import React, { useState, useEffect } from 'react'
import { 
  Anchor, 
  Briefcase, 
  DollarSign, 
  MapPin, 
  User, 
  LogOut, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Search, 
  Award, 
  Star, 
  ShieldCheck, 
  Sparkles,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { 
  signUpUser, 
  signInUser, 
  signOutUser, 
  getCurrentUser, 
  getUserProfile, 
  updateUserProfile, 
  fetchGigs, 
  createGig, 
  acceptGig, 
  completeGig 
} from './blueGigsApi'

export default function App() {
  // Autenticação e Perfil
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  
  // Formulário de Autenticação
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('doer')
  
  // Gigs e UI Estado
  const [gigs, setGigs] = useState([])
  const [gigsLoading, setGigsLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  
  // Formulário de Criação de Gig
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newReward, setNewReward] = useState('')
  const [newLoc, setNewLoc] = useState('')
  const [newCat, setNewCat] = useState('Limpeza de Praia')

  // Formulário de Perfil
  const [profileBio, setProfileBio] = useState('')
  const [profileSkills, setProfileSkills] = useState('')

  // Toast Notificações
  const [toast, setToast] = useState(null)

  const categories = [
    'Todos',
    'Limpeza de Praia',
    'Monitoramento Marinho',
    'Preservação de Mangue',
    'Pesca Sustentável',
    'Educação Ambiental',
    'Outros'
  ]

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    async function loadSession() {
      try {
        const user = await getCurrentUser()
        if (user) {
          setCurrentUser(user)
          const userProf = await getUserProfile(user.id)
          setProfile(userProf)
          setProfileBio(userProf.bio || '')
          setProfileSkills(userProf.skills?.join(', ') || '')
        }
      } catch (err) {
        console.error('Erro de carregamento inicial:', err)
      } finally {
        setAuthLoading(false)
      }
    }
    loadSession()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadGigs()
    }
  }, [currentUser, categoryFilter, statusFilter])

  const loadGigs = async () => {
    setGigsLoading(true)
    try {
      const filters = {}
      if (categoryFilter !== 'Todos') filters.category = categoryFilter
      
      if (statusFilter === 'my_jobs' && profile?.role === 'doer') {
        filters.doer_id = currentUser.id
      } else if (statusFilter === 'my_posts' && profile?.role === 'poster') {
        filters.poster_id = currentUser.id
      } else if (statusFilter !== 'all') {
        filters.status = statusFilter
      }

      const data = await fetchGigs(filters)
      setGigs(data)
    } catch (err) {
      showToast('Erro ao carregar serviços.', 'error')
    } finally {
      setGigsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!email || !password || !name) {
      showToast('Preencha todos os campos.', 'error')
      return
    }
    setAuthLoading(true)
    try {
      const { user } = await signUpUser(email, password, name, role)
      setCurrentUser(user)
      const userProf = await getUserProfile(user.id)
      setProfile(userProf)
      setProfileBio(userProf.bio || '')
      setProfileSkills('')
      showToast('Conta criada com sucesso!')
    } catch (err) {
      showToast(err.message || 'Erro ao criar conta.', 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('Preencha todos os campos.', 'error')
      return
    }
    setAuthLoading(true)
    try {
      const { user } = await signInUser(email, password)
      setCurrentUser(user)
      const userProf = await getUserProfile(user.id)
      setProfile(userProf)
      setProfileBio(userProf.bio || '')
      setProfileSkills(userProf.skills?.join(', ') || '')
      showToast(`Bem-vindo de volta, ${userProf.name}!`)
    } catch (err) {
      showToast('Credenciais inválidas ou erro de rede.', 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOutUser()
      setCurrentUser(null)
      setProfile(null)
      showToast('Sessão encerrada.')
    } catch (err) {
      showToast('Erro ao sair.', 'error')
    }
  }

  const handleCreateGig = async (e) => {
    e.preventDefault()
    if (!newTitle || !newDesc || !newReward || !newLoc) {
      showToast('Preencha todos os campos do serviço.', 'error')
      return
    }
    try {
      await createGig(newTitle, newDesc, newReward, newLoc, newCat, currentUser.id)
      showToast('Serviço ecológico publicado!')
      setShowCreateModal(false)
      setNewTitle('')
      setNewDesc('')
      setNewReward('')
      setNewLoc('')
      setNewCat('Limpeza de Praia')
      loadGigs()
    } catch (err) {
      showToast('Erro ao criar serviço.', 'error')
    }
  }

  const handleAcceptGig = async (gigId) => {
    try {
      await acceptGig(gigId, currentUser.id)
      showToast('Você aceitou o serviço! Vá para a aba "Meus Serviços" para ver detalhes.')
      loadGigs()
    } catch (err) {
      showToast('Erro ao aceitar o serviço.', 'error')
    }
  }

  const handleCompleteGig = async (gigId) => {
    try {
      await completeGig(gigId)
      showToast('Serviço marcado como concluído! Excelente contribuição à ODS 14.')
      loadGigs()
    } catch (err) {
      showToast('Erro ao concluir o serviço.', 'error')
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const skillsArray = profileSkills.split(',').map(s => s.trim()).filter(Boolean)
      const updated = await updateUserProfile(currentUser.id, {
        bio: profileBio,
        skills: skillsArray
      })
      setProfile(updated)
      setShowProfileModal(false)
      showToast('Perfil azul atualizado com sucesso!')
    } catch (err) {
      showToast('Erro ao atualizar perfil.', 'error')
    }
  }

  const filteredGigs = gigs.filter(gig => {
    const query = searchQuery.toLowerCase()
    return (
      gig.title.toLowerCase().includes(query) ||
      gig.description.toLowerCase().includes(query) ||
      gig.location.toLowerCase().includes(query) ||
      gig.poster?.name.toLowerCase().includes(query)
    )
  })

  if (authLoading && !currentUser) {
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <Anchor className="animate-pulse" size={48} color="var(--primary)" />
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>Navegando no oceano de dados...</h2>
      </div>
    )
  }

  return (
    <div id="root">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <Award size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      <nav className="navbar">
        <a href="#" className="logo">
          <Anchor size={28} />
          <span>BlueGigs</span>
        </a>
        
        {currentUser && (
          <div className="nav-links">
            <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={12} />
              {profile?.role === 'poster' ? 'Contratante / ODS 8' : 'Prestador / ODS 14'}
            </span>
            
            <button 
              className="nav-link" 
              onClick={() => setShowProfileModal(true)} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <User size={16} />
              {profile?.name}
            </button>
            
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              <LogOut size={14} />
              Sair
            </button>
          </div>
        )}
      </nav>

      {!currentUser ? (
        <div className="auth-container">
          <div className="glass-panel auth-card">
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Anchor size={36} />
              </div>
              <h1>BlueGigs</h1>
              <p style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Empregos costeiros decentes (ODS 8) para proteger a nossa vida marinha (ODS 14).
              </p>
            </div>

            <div className="ods-badges" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
              <span className="badge badge-primary">ODS 8: Trabalho Decente</span>
              <span className="badge badge-secondary">ODS 14: Vida na Água</span>
            </div>

            {authMode === 'register' ? (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Qual o seu objetivo na plataforma?</label>
                  <div className="role-selector">
                    <div 
                      className={`role-option ${role === 'doer' ? 'selected' : ''}`}
                      onClick={() => setRole('doer')}
                    >
                      <Briefcase size={20} color={role === 'doer' ? 'var(--primary)' : 'var(--text-secondary)'} />
                      <h4>Quero Trabalhar</h4>
                      <p>Aceitar gigs de limpeza e preservação marinha</p>
                    </div>
                    <div 
                      className={`role-option ${role === 'poster' ? 'selected' : ''}`}
                      onClick={() => setRole('poster')}
                    >
                      <PlusCircle size={20} color={role === 'poster' ? 'var(--primary)' : 'var(--text-secondary)'} />
                      <h4>Quero Contratar</h4>
                      <p>Publicar oportunidades e apoiar a comunidade</p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nome Completo / Instituição</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: Lucas Pescador ou Instituto Biologia" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="nome@email.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Senha</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Mínimo 6 caracteres" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={authLoading}>
                  {authLoading ? 'Criando Conta...' : 'Cadastrar na Plataforma'}
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
                  Já possui conta?{' '}
                  <button type="button" className="btn-text" onClick={() => setAuthMode('login')} style={{ padding: 0, textDecoration: 'underline' }}>
                    Entrar aqui
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="nome@email.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Senha</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Digite sua senha" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={authLoading}>
                  {authLoading ? 'Entrando...' : 'Entrar no Painel'}
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
                  Não tem conta?{' '}
                  <button type="button" className="btn-text" onClick={() => setAuthMode('register')} style={{ padding: 0, textDecoration: 'underline' }}>
                    Cadastre-se gratuitamente
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          <aside className="sidebar">
            <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Award size={18} color="var(--primary)" />
                <h4 style={{ fontSize: '0.95rem' }}>Alinhamento ONU</h4>
              </div>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                O BlueGigs promove a <strong>ODS 8 (Trabalho Decente)</strong> garantindo compensação financeira justa para serviços de impacto ambiental na <strong>ODS 14 (Vida de Baixo d'Água)</strong>.
              </p>
            </div>

            <div className="glass-panel">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={18} color="var(--primary)" />
                Navegação
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setStatusFilter('all')}
                  style={{ justifyContent: 'flex-start', width: '100%' }}
                >
                  <Briefcase size={16} />
                  Todos os Serviços
                </button>

                {profile?.role === 'doer' && (
                  <button 
                    className={`btn ${statusFilter === 'my_jobs' ? 'btn-primary' : 'btn-secondary'}`} 
                    onClick={() => setStatusFilter('my_jobs')}
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                  >
                    <CheckCircle2 size={16} />
                    Meus Serviços Aceitos
                  </button>
                )}

                {profile?.role === 'poster' && (
                  <>
                    <button 
                      className={`btn ${statusFilter === 'my_posts' ? 'btn-primary' : 'btn-secondary'}`} 
                      onClick={() => setStatusFilter('my_posts')}
                      style={{ justifyContent: 'flex-start', width: '100%' }}
                    >
                      <CheckCircle2 size={16} />
                      Meus Serviços Criados
                    </button>

                    <button 
                      className="btn btn-coral" 
                      onClick={() => setShowCreateModal(true)}
                      style={{ justifyContent: 'flex-start', width: '100%', marginTop: '0.5rem' }}
                    >
                      <PlusCircle size={16} />
                      Publicar Oportunidade
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="glass-panel">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Filtrar Categoria</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className="btn-text"
                    style={{ 
                      textAlign: 'left', 
                      padding: '0.4rem 0.6rem', 
                      borderRadius: '4px',
                      background: categoryFilter === cat ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                      color: categoryFilter === cat ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: categoryFilter === cat ? '600' : 'normal',
                      cursor: 'pointer',
                      border: 'none'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Status da Comunidade</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(2, 6, 23, 0.4)', padding: '0.75rem', borderRadius: '8px' }}>
                  <TrendingUp size={16} color="var(--success)" style={{ marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+12k</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Rendimento ODS 8</div>
                </div>
                <div style={{ background: 'rgba(2, 6, 23, 0.4)', padding: '0.75rem', borderRadius: '8px' }}>
                  <Anchor size={16} color="var(--primary)" style={{ marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>150+</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ações ODS 14</div>
                </div>
              </div>
            </div>
          </aside>

          <main className="main-content">
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h2>Olá, {profile?.name}!</h2>
                <p>
                  {profile?.role === 'poster' 
                    ? 'Publique ofertas de trabalho voltadas para a conservação e monitore o andamento dos projetos costeiros.' 
                    : 'Explore oportunidades de remuneração direta apoiando ações de conservação marinha e limpeza de costas.'}
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '2.8rem' }}
                  placeholder="Pesquisar por título do serviço, localidade ou instituição..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={20} color="var(--primary)" />
                  Serviços Disponíveis ({filteredGigs.length})
                </h3>
              </div>

              {gigsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', gap: '1rem' }}>
                  <Anchor className="animate-pulse" size={36} color="var(--primary)" />
                  <p>Buscando nas correntes marítimas...</p>
                </div>
              ) : filteredGigs.length === 0 ? (
                <div className="glass-panel empty-state">
                  <Compass className="empty-state-icon" size={48} />
                  <h3>Nenhum serviço ecológico encontrado</h3>
                  <p>Tente ajustar os filtros de pesquisa ou categoria na barra lateral.</p>
                  {profile?.role === 'poster' && (
                    <button className="btn btn-coral" onClick={() => setShowCreateModal(true)}>
                      <Plus size={16} /> Publicar Primeiro Serviço
                    </button>
                  )}
                </div>
              ) : (
                <div className="gigs-grid">
                  {filteredGigs.map(gig => (
                    <div key={gig.id} className="gig-card">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className="badge badge-primary">{gig.category}</span>
                          {gig.status === 'open' && <span className="badge badge-success">Aberto</span>}
                          {gig.status === 'in_progress' && <span className="badge badge-warning">Em Andamento</span>}
                          {gig.status === 'completed' && <span className="badge badge-coral">Concluído</span>}
                        </div>

                        <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>{gig.title}</h4>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {gig.description}
                        </p>
                      </div>

                      <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <MapPin size={12} />
                            <span>{gig.location}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '1.15rem', color: 'var(--coral)', fontWeight: 'bold' }}>
                            <DollarSign size={18} />
                            <span>R$ {gig.reward.toFixed(2)}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          <img 
                            src={gig.poster?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${gig.poster?.name || 'Poster'}`} 
                            alt={gig.poster?.name} 
                            style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{gig.poster?.name}</div>
                            <div className="stars" style={{ fontSize: '0.65rem' }}>
                              <Star size={8} fill="currentColor" />
                              <span style={{ marginLeft: '0.15rem' }}>{gig.poster?.rating || '5.0'}</span>
                            </div>
                          </div>
                        </div>

                        {profile?.role === 'doer' && gig.status === 'open' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ width: '100%' }}
                            onClick={() => handleAcceptGig(gig.id)}
                          >
                            Aceitar Serviço
                            <ArrowRight size={14} />
                          </button>
                        )}

                        {profile?.role === 'doer' && gig.status === 'in_progress' && gig.doer_id === currentUser.id && (
                          <div className="badge badge-warning" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
                            <Clock size={14} style={{ marginRight: '0.25rem' }} />
                            Aguardando você finalizar
                          </div>
                        )}

                        {profile?.role === 'poster' && gig.poster_id === currentUser.id && gig.status === 'in_progress' && (
                          <button 
                            className="btn btn-coral" 
                            style={{ width: '100%' }}
                            onClick={() => handleCompleteGig(gig.id)}
                          >
                            <CheckCircle2 size={14} />
                            Validar e Concluir Gig
                          </button>
                        )}

                        {gig.status === 'completed' && (
                          <div className="badge badge-coral" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', background: 'rgba(244, 63, 94, 0.08)' }}>
                            <ShieldCheck size={14} style={{ marginRight: '0.25rem' }} />
                            Concluído & Remunerado
                          </div>
                        )}
                        
                        {gig.doer && gig.status !== 'open' && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                            Prestador associado: <strong>{gig.doer?.name}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: '500' }}>
            <Anchor size={16} color="var(--primary)" />
            BlueGigs &copy; 2026 - Concorrendo ao Prêmio ODS da ONU
          </p>
          <div className="ods-badges">
            <span className="badge badge-primary">ODS 8 - Trabalho Decente</span>
            <span className="badge badge-secondary">ODS 14 - Vida debaixo d'Água</span>
          </div>
          <p className="footer-info">
            Projeto construído em dupla para incentivar a economia azul circular nas comunidades costeiras globais.
          </p>
        </div>
      </footer>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={22} color="var(--primary)" />
                Publicar Serviço ODS 14
              </h3>
              <button className="btn-text" onClick={() => setShowCreateModal(false)} style={{ fontSize: '1.25rem', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleCreateGig}>
              <div className="form-group">
                <label className="form-label">Título da Oportunidade</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Mutirão Ecológico na Praia de Mucuripe" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoria de Ação Marítima</label>
                <select 
                  className="form-select" 
                  value={newCat} 
                  onChange={(e) => setNewCat(e.target.value)}
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição das Atividades (Seja Claro)</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  style={{ resize: 'none' }}
                  placeholder="Descreva detalhadamente o que o prestador fará, materiais necessários, e impacto ambiental esperado." 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Compensação (R$)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Ex: 250.00" 
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Localização Costeira</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: Fortaleza, CE" 
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Publicar Vaga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={22} color="var(--primary)" />
                Gerenciar Perfil Azul
              </h3>
              <button className="btn-text" onClick={() => setShowProfileModal(false)} style={{ fontSize: '1.25rem', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(2, 6, 23, 0.4)', padding: '1rem', borderRadius: '8px' }}>
              <img 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name}`} 
                alt="Avatar" 
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--primary)' }}
              />
              <div>
                <h4 style={{ fontSize: '1.2rem' }}>{profile?.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Papel: {profile?.role === 'poster' ? 'Contratante / ODS 8' : 'Prestador / ODS 14'}</p>
                <div className="stars" style={{ marginTop: '0.25rem' }}>
                  <Star size={12} fill="currentColor" />
                  <span style={{ fontSize: '0.85rem', marginLeft: '0.2rem' }}>{profile?.rating} (Avaliação do usuário)</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Biografia / Missão Institucional</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  style={{ resize: 'none' }}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Escreva sobre suas motivações ecológicas ou histórico institucional de apoio à ODS 14."
                ></textarea>
              </div>

              {profile?.role === 'doer' && (
                <div className="form-group">
                  <label className="form-label">Certificações e Habilidades (Separadas por vírgula)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profileSkills}
                    onChange={(e) => setProfileSkills(e.target.value)}
                    placeholder="Ex: Mergulho PADI, Biologia Marinha, Direção de Barcos, Coleta Fina"
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Essas habilidades ajudam contratantes a validar seu currículo para serviços complexos.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>
                  Fechar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
