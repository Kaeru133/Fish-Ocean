import { initAnalyticsCharts, renderSimulationChart } from './charts.js';
import { 
  initSimulation, 
  triggerAction, 
  resetSimulation, 
  leaveSimulation,
  simState, 
  subscribeToStateChange, 
  subscribeToLogs,
  generateRoomId
} from './simulation.js';
import { isRealtimeConfigured } from './database.js';

// Importação automática do JSON de conteúdo suportado pelo Vite
import content from './content.json';

// Elementos da UI
const screens = document.querySelectorAll('.screen-view');
const navButtons = document.querySelectorAll('.nav-tab');
const clockDisplay = document.getElementById('clock-display');
const stressIndexDisplay = document.getElementById('stress-index');
const homeCardsContainer = document.getElementById('home-cards-container');

// Elementos da Simulação (Conexão)
const panelConnection = document.getElementById('sim-connection-panel');
const panelRole = document.getElementById('sim-role-panel');
const panelActive = document.getElementById('sim-active-panel');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');
const inputRoomId = document.getElementById('input-room-id');
const connectionWarning = document.getElementById('connection-warning');

// Elementos da Simulação (Papel)
const displayRoomTitle = document.getElementById('display-room-title');
const btnSelectGov = document.getElementById('btn-select-gov');
const btnSelectPrivate = document.getElementById('btn-select-private');
const roleWaiting = document.getElementById('sim-role-waiting');

// Elementos da Simulação (Ativo)
const simRoomIdDisplay = document.getElementById('sim-room-id-display');
const simStatusLabel = document.getElementById('sim-status-label');
const gaugeHealthValue = document.getElementById('gauge-health-value');
const gaugeHealthBar = document.getElementById('gauge-health-bar');
const gaugePollutionValue = document.getElementById('gauge-pollution-value');
const gaugePollutionBar = document.getElementById('gauge-pollution-bar');
const gaugeFishValue = document.getElementById('gauge-fish-value');
const gaugeFishBar = document.getElementById('gauge-fish-bar');
const simMyRoleDisplay = document.getElementById('sim-my-role-display');
const simPointsDisplay = document.getElementById('sim-points-display');
const simRoleInstructions = document.getElementById('sim-role-instructions');
const simActionsContainer = document.getElementById('sim-actions-container');
const btnResetSim = document.getElementById('btn-reset-simulation');
const btnLeaveSim = document.getElementById('btn-leave-simulation');
const simLogsTerminal = document.getElementById('sim-logs-terminal');

// Estado interno de controle de UI
let selectedRoomId = null;

// ==================== INICIALIZAÇÃO E INJEÇÃO DE CONTEÚDO ====================

document.addEventListener('DOMContentLoaded', () => {
  // Injeta todos os textos científicos do arquivo JSON nos elementos correspondentes
  injectTextContent();
  
  // Renderiza dinamicamente os cartões macro da Landing Page
  renderHomeCards();

  // Inicializa relógio e variações no stress index
  startClock();
  startStressFluctuation();

  // Configura aviso se o Supabase não estiver configurado
  if (!isRealtimeConfigured) {
    connectionWarning.classList.remove('hidden');
  }

  // Navegação de Telas (SPA)
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      
      // Atualiza abas ativas
      navButtons.forEach(btn => btn.classList.remove('active-tab'));
      button.classList.add('active-tab');
      
      // Troca de tela
      screens.forEach(screen => {
        if (screen.id === targetId) {
          screen.classList.remove('hidden');
        } else {
          screen.classList.add('hidden');
        }
      });

      // Se navegou para Analytics, inicia os gráficos
      if (targetId === 'screen-problems') {
        initAnalyticsCharts();
      }
    });
  });

  // Links rápidos: Verifica se há parâmetros de sala na URL
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam) {
    document.getElementById('nav-simulation').click();
    inputRoomId.value = roomParam.toUpperCase();
    addLogToTerminal(`[SYSTEM] ID de sala importado via link: ${roomParam.toUpperCase()}`, 'text-ocean-cyan');
  }

  // Eventos de Conexão à Sala
  btnCreateRoom.addEventListener('click', () => {
    selectedRoomId = generateRoomId();
    window.history.pushState({}, '', `?room=${selectedRoomId}`);
    showRoleSelection(selectedRoomId);
  });

  btnJoinRoom.addEventListener('click', () => {
    const rId = inputRoomId.value.trim().toUpperCase();
    if (!rId) {
      alert("Por favor, insira um código de sala válido.");
      return;
    }
    selectedRoomId = rId;
    window.history.pushState({}, '', `?room=${selectedRoomId}`);
    showRoleSelection(selectedRoomId);
  });

  // Eventos de Seleção de Função
  btnSelectGov.addEventListener('click', () => {
    if (!isRealtimeConfigured) {
      initSimulation(selectedRoomId, 'local');
    } else {
      initSimulation(selectedRoomId, 'gov');
    }
  });

  btnSelectPrivate.addEventListener('click', () => {
    if (!isRealtimeConfigured) {
      initSimulation(selectedRoomId, 'local');
    } else {
      initSimulation(selectedRoomId, 'private');
    }
  });

  // Controles de Reinício e Saída
  btnResetSim.addEventListener('click', () => {
    if (confirm("Deseja realmente reiniciar o simulador para os valores padrão?")) {
      resetSimulation();
    }
  });

  btnLeaveSim.addEventListener('click', () => {
    if (confirm("Deseja sair da sala de simulação atual?")) {
      leaveSimulation();
      window.history.pushState({}, '', window.location.pathname);
      showConnectionPanel();
    }
  });

  // Eventos rápidos na Landing Page para navegar pelas abas
  document.getElementById('btn-go-simulation').addEventListener('click', () => {
    document.getElementById('nav-simulation').click();
  });
  document.getElementById('btn-go-problems').addEventListener('click', () => {
    document.getElementById('nav-problems').click();
  });

  // Subscreve as reações às mudanças de estado da simulação
  subscribeToStateChange(updateSimulationUI);
  subscribeToLogs(addLogToTerminal);
});

// ==================== INJEÇÃO DINÂMICA DE TEXTOS ====================

/**
 * Lê os atributos [data-content] no HTML e preenche recursivamente com os textos do content.json
 */
function injectTextContent() {
  const elements = document.querySelectorAll('[data-content]');
  elements.forEach(element => {
    const path = element.getAttribute('data-content');
    const text = getValueByJsonPath(content, path);
    if (text !== undefined) {
      element.innerHTML = text;
    }
  });
}

/**
 * Busca de forma segura uma propriedade aninhada em um objeto usando string (ex: "home.title")
 */
function getValueByJsonPath(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Renderiza os 3 cartões de estatísticas macro da página inicial
 */
function renderHomeCards() {
  homeCardsContainer.innerHTML = '';
  const cards = content.home.cards;

  cards.forEach(card => {
    // Escolhe a cor da borda baseada no ID do cartão
    let colorClass = 'hover:border-ocean-cyan';
    let lineClass = 'bg-ocean-cyan';
    if (card.id === 'acidification') {
      colorClass = 'hover:border-ocean-alert';
      lineClass = 'bg-ocean-alert';
    } else if (card.id === 'plastic') {
      colorClass = 'hover:border-ocean-coral';
      lineClass = 'bg-ocean-coral';
    }

    const cardDiv = document.createElement('div');
    cardDiv.className = `bg-ocean-abyss/50 border border-ocean-navy/60 p-6 rounded-lg relative overflow-hidden group transition-all duration-300 ${colorClass}`;
    cardDiv.innerHTML = `
      <div class="absolute top-0 left-0 w-1 h-full ${lineClass}"></div>
      <span class="text-xs font-mono uppercase tracking-wider block" style="color: ${card.id === 'acidification' ? '#FF4D4D' : card.id === 'plastic' ? '#FF6B4A' : '#00F0FF'}">${card.category}</span>
      <h3 class="text-3xl font-bold text-white my-1 font-mono">${card.value}</h3>
      <p class="text-sm font-semibold text-gray-300 font-sans">${card.title}</p>
      <p class="text-xs text-gray-500 mt-2 leading-relaxed">${card.desc}</p>
    `;
    homeCardsContainer.appendChild(cardDiv);
  });
}

// ==================== CONTROLADORES DE TELAS DA SIMULAÇÃO ====================

function showConnectionPanel() {
  panelConnection.classList.remove('hidden');
  panelRole.classList.add('hidden');
  panelActive.classList.add('hidden');
  roleWaiting.classList.add('hidden');
}

function showRoleSelection(roomId) {
  panelConnection.classList.add('hidden');
  panelRole.classList.remove('hidden');
  panelActive.classList.add('hidden');
  displayRoomTitle.innerText = `${content.simulation.active.roomIdPrefix}${roomId}`;
  
  if (!isRealtimeConfigured) {
    document.getElementById('btn-gov-select-text').innerText = 'INICIAR SIMULADOR LOCAL';
    document.getElementById('btn-private-select-text').innerText = 'INICIAR SIMULADOR LOCAL';
  } else {
    document.getElementById('btn-gov-select-text').innerText = 'SELECIONAR PAPEL →';
    document.getElementById('btn-private-select-text').innerText = 'SELECIONAR PAPEL →';
  }
}

// ==================== RENDERS DA SIMULAÇÃO ATIVA ====================

function updateSimulationUI() {
  if (simState.roomId && simState.myRole) {
    panelRole.classList.add('hidden');
    panelConnection.classList.add('hidden');
    panelActive.classList.remove('hidden');
  }

  // Se multiplayer estiver ativo e aguardando segundo jogador
  if (isRealtimeConfigured && simState.myRole && simState.myRole !== 'local' && !simState.isActive) {
    panelActive.classList.add('hidden');
    panelRole.classList.remove('hidden');
    roleWaiting.classList.remove('hidden');
    return;
  }

  simRoomIdDisplay.innerText = `${content.simulation.active.roomIdPrefix}${simState.roomId}`;
  
  // Rótulo de papel
  if (simState.myRole === 'gov') {
    simMyRoleDisplay.innerText = content.simulation.roleSelection.gov.title;
    simMyRoleDisplay.className = 'text-base font-bold text-ocean-gov font-mono uppercase';
    simRoleInstructions.innerText = content.simulation.roleSelection.gov.instructions;
  } else if (simState.myRole === 'private') {
    simMyRoleDisplay.innerText = content.simulation.roleSelection.private.title;
    simMyRoleDisplay.className = 'text-base font-bold text-ocean-private font-mono uppercase';
    simRoleInstructions.innerText = content.simulation.roleSelection.private.instructions;
  } else {
    simMyRoleDisplay.innerText = 'MODO LOCAL DE CONTROLE';
    simMyRoleDisplay.className = 'text-base font-bold text-ocean-cyan font-mono uppercase';
    simRoleInstructions.innerText = 'Você está controlando ambos os setores (Público e Privado) localmente.';
  }

  simPointsDisplay.innerText = `${simState.points} / 100`;

  // Atualiza medidores
  gaugeHealthValue.innerText = `${simState.health}%`;
  gaugeHealthBar.style.width = `${simState.health}%`;
  
  gaugePollutionValue.innerText = `${simState.pollution}%`;
  gaugePollutionBar.style.width = `${simState.pollution}%`;
  
  gaugeFishValue.innerText = `${simState.fish}%`;
  gaugeFishBar.style.width = `${simState.fish}%`;

  // Estilos de status geral (lê do JSON)
  const statusLabel = document.getElementById('sim-status-label');
  statusLabel.className = 'text-base font-bold font-mono tracking-widest uppercase animate-pulse';
  if (simState.health >= 80) {
    statusLabel.innerText = content.simulation.active.statusStates.stable;
    statusLabel.classList.add('text-emerald-400');
    statusLabel.classList.remove('text-ocean-coral', 'text-ocean-alert');
  } else if (simState.health >= 40) {
    statusLabel.innerText = content.simulation.active.statusStates.unstable;
    statusLabel.classList.add('text-ocean-coral');
    statusLabel.classList.remove('text-emerald-400', 'text-ocean-alert');
  } else {
    statusLabel.innerText = content.simulation.active.statusStates.critical;
    statusLabel.classList.add('text-ocean-alert');
    statusLabel.classList.remove('text-emerald-400', 'text-ocean-coral');
  }

  // Renderiza os botões dinâmicos de ação
  renderActionButtons();

  // Renderiza gráfico em tempo real
  const simCanvas = document.getElementById('chart-simulation-realtime');
  if (simCanvas) {
    renderSimulationChart(simCanvas, simState.history);
  }
}

function renderActionButtons() {
  simActionsContainer.innerHTML = '';

  let actionsToRender = [];
  if (simState.myRole === 'gov') {
    actionsToRender = content.simulation.actions.gov;
  } else if (simState.myRole === 'private') {
    actionsToRender = content.simulation.actions.private;
  } else {
    actionsToRender = [...content.simulation.actions.gov, ...content.simulation.actions.private];
  }

  actionsToRender.forEach(action => {
    const isGovAction = content.simulation.actions.gov.some(a => a.id === action.id);
    const themeColorClass = isGovAction ? 'border-ocean-gov hover:bg-ocean-gov/10 text-ocean-gov' : 'border-ocean-private hover:bg-ocean-private/10 text-ocean-private';
    const activeColorClass = isGovAction ? 'bg-ocean-gov text-white' : 'bg-ocean-private text-white';
    
    const isActive = simState.activeActions[action.id];
    const canAfford = simState.points >= action.cost;

    const btn = document.createElement('button');
    btn.className = `w-full border p-4 rounded text-left transition duration-300 relative overflow-hidden flex flex-col justify-between h-24 font-mono ${isActive ? activeColorClass : themeColorClass} ${(!canAfford && !isActive) ? 'opacity-40 cursor-not-allowed' : ''}`;
    
    btn.innerHTML = `
      <div class="flex justify-between items-start w-full">
        <span class="text-[9px] uppercase tracking-wider text-inherit opacity-85">
          ${isGovAction ? 'GOVERNO' : 'PRIVADO'} ${isActive ? '[ATIVO]' : `[CUSTO: ${action.cost} PTS]`}
        </span>
        ${isActive ? `
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        ` : ''}
      </div>
      <div class="text-sm font-bold truncate pr-6">${action.name}</div>
    `;

    if (!isActive && canAfford) {
      btn.addEventListener('click', () => {
        triggerAction(action.id);
      });
    }

    simActionsContainer.appendChild(btn);
  });
}

// ==================== AUXILIARES VISUAIS ====================

function startClock() {
  setInterval(() => {
    const now = new Date();
    clockDisplay.innerText = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  }, 1000);
}

function startStressFluctuation() {
  setInterval(() => {
    const currentStress = parseFloat(stressIndexDisplay.innerText);
    const fluctuation = (Math.random() - 0.5) * 0.2;
    const nextStress = Math.max(80, Math.min(99, currentStress + fluctuation));
    stressIndexDisplay.innerText = `${nextStress.toFixed(1)}%`;
  }, 4000);
}

function addLogToTerminal(htmlContent) {
  const p = document.createElement('p');
  p.innerHTML = htmlContent;
  simLogsTerminal.appendChild(p);
  simLogsTerminal.scrollTop = simLogsTerminal.scrollHeight;
}
