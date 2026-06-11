import { supabase, isRealtimeConfigured } from './database.js';
import { renderSimulationChart, destroySimulationChart } from './charts.js';
import content from './content.json';

// Estado global da simulação local
export let simState = {
  roomId: null,
  myRole: null, // 'gov' (Governo) ou 'private' (Privado/ONG) ou 'local' (se Single Player)
  playersJoined: { gov: false, private: false },
  isActive: false,
  health: 50,
  pollution: 75,
  fish: 40,
  points: 100,
  history: [],
  tickCount: 0,
  activeActions: {
    amp: false,        // Governo
    subsidies: false,  // Governo
    recycling: false,  // Privado
    tracking: false    // Privado
  }
};

let simInterval = null;
let pointsInterval = null;
let supabaseChannel = null;

// Callbacks para atualizar a interface (serão configurados pelo main.js)
let onStateChangeCallback = () => {};
let onLogCallback = () => {};

/**
 * Registra o callback para reações de mudança de estado da UI
 */
export function subscribeToStateChange(callback) {
  onStateChangeCallback = callback;
}

/**
 * Registra o callback para postagem de logs no terminal científico
 */
export function subscribeToLogs(callback) {
  onLogCallback = callback;
}

/**
 * Adiciona log local e envia para callback
 */
function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString('pt-BR', { hour12: false });
  let colorClass = 'text-gray-400';
  if (type === 'gov') colorClass = 'text-ocean-gov';
  if (type === 'private') colorClass = 'text-ocean-private';
  if (type === 'alert') colorClass = 'text-ocean-alert font-bold';
  if (type === 'success') colorClass = 'text-emerald-400 font-bold';
  if (type === 'system') colorClass = 'text-ocean-cyan';

  onLogCallback(`<span class="text-gray-600">[${timestamp}]</span> <span class="${colorClass}">${message}</span>`);
}

/**
 * Gera um ID de sala aleatório
 */
export function generateRoomId() {
  return 'ROOM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Carrega as ações do arquivo JSON de conteúdo
export const ACTIONS = content.simulation.actions;

/**
 * Inicializa a sala de simulação
 */
export function initSimulation(roomId, role) {
  simState.roomId = roomId;
  simState.myRole = role;
  simState.points = 100;
  simState.health = 50;
  simState.pollution = 75;
  simState.fish = 40;
  simState.tickCount = 0;
  simState.history = [{ health: 50, pollution: 75, fish: 40, label: '0s' }];
  simState.activeActions = { amp: false, subsidies: false, recycling: false, tracking: false };

  destroySimulationChart();

  const logTemplates = content.simulation.logs;

  if (role === 'local' || !isRealtimeConfigured) {
    // Modo Single-Player / Offline
    simState.playersJoined = { gov: true, private: true };
    simState.isActive = true;
    addLog(logTemplates.systemLocal, 'system');
    addLog(logTemplates.systemLocalDesc, 'system');
    startLoop();
    onStateChangeCallback();
  } else {
    // Modo Multiplayer via Supabase Realtime
    connectToSupabaseRealtime(roomId, role);
  }
}

/**
 * Configuração dos canais Realtime do Supabase (Broadcast + Presence)
 */
function connectToSupabaseRealtime(roomId, role) {
  const logTemplates = content.simulation.logs;
  addLog(logTemplates.databaseConnecting.replace('{roomId}', roomId), 'system');

  // Inicializa o canal do Supabase baseado no ID único da sala
  supabaseChannel = supabase.channel(`room:${roomId}`, {
    config: {
      broadcast: { self: true },
      presence: { key: role }
    }
  });

  // 1. Escuta ações acionadas por qualquer um dos jogadores
  supabaseChannel.on('broadcast', { event: 'action-triggered' }, ({ payload }) => {
    const { actionId, actionName, userRole } = payload;
    simState.activeActions[actionId] = true;
    
    // Loga no terminal usando template do JSON
    const logText = logTemplates.actionTriggered
      .replace('{userRole}', userRole === 'gov' ? 'GOVERNO' : 'PRIVADO')
      .replace('{actionName}', actionName);
    addLog(logText, userRole);
    
    // Aplica o impacto instantâneo
    applyImmediateImpact(actionId);
    
    // Configura o desligamento automático após a duração da ação
    const actionDef = [...ACTIONS.gov, ...ACTIONS.private].find(a => a.id === actionId);
    if (actionDef) {
      setTimeout(() => {
        simState.activeActions[actionId] = false;
        addLog(logTemplates.actionExpired.replace('{actionName}', actionName), 'info');
        onStateChangeCallback();
      }, actionDef.duration * 1000);
    }
    
    onStateChangeCallback();
  });

  // 2. Escuta atualizações de estado do ecossistema
  supabaseChannel.on('broadcast', { event: 'state-update' }, ({ payload }) => {
    if (simState.myRole !== 'gov') {
      simState.health = payload.health;
      simState.pollution = payload.pollution;
      simState.fish = payload.fish;
      simState.tickCount = payload.tickCount;
      simState.activeActions = payload.activeActions;
      
      simState.history.push({
        health: simState.health,
        pollution: simState.pollution,
        fish: simState.fish,
        label: `${simState.tickCount * 3}s`
      });

      onStateChangeCallback();
    }
  });

  // 3. Escuta eventos de reinício da simulação
  supabaseChannel.on('broadcast', { event: 'reset-request' }, () => {
    simState.health = 50;
    simState.pollution = 75;
    simState.fish = 40;
    simState.tickCount = 0;
    simState.history = [{ health: 50, pollution: 75, fish: 40, label: '0s' }];
    simState.activeActions = { amp: false, subsidies: false, recycling: false, tracking: false };
    destroySimulationChart();
    addLog(logTemplates.logReset, 'system');
    onStateChangeCallback();
  });

  // 4. Configuração de Presença
  supabaseChannel
    .on('presence', { event: 'sync' }, () => {
      const state = supabaseChannel.presenceState();
      const roles = Object.keys(state);
      
      simState.playersJoined.gov = roles.includes('gov');
      simState.playersJoined.private = roles.includes('private');

      addLog(logTemplates.presenceSync.replace('{roles}', roles.map(r => r.toUpperCase()).join(' & ')), 'system');
      
      if (simState.playersJoined.gov && simState.playersJoined.private) {
        if (!simState.isActive) {
          simState.isActive = true;
          addLog(logTemplates.presenceJoined, 'success');
          startLoop();
        }
      } else {
        if (simState.isActive) {
          simState.isActive = false;
          stopLoop();
          addLog(logTemplates.presenceLeft, 'alert');
        }
      }
      onStateChangeCallback();
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await supabaseChannel.track({ online_at: new Date().toISOString() });
        addLog(logTemplates.systemWaiting, 'system');
      }
    });
}

/**
 * Aplica o impacto imediato da ação ativada
 */
function applyImmediateImpact(actionId) {
  switch (actionId) {
    case 'amp':
      simState.fish = Math.min(100, simState.fish + 15);
      simState.health = Math.min(100, simState.health + 8);
      simState.pollution = Math.max(0, simState.pollution - 3);
      break;
    case 'subsidies':
      simState.fish = Math.min(100, simState.fish + 8);
      simState.pollution = Math.max(0, simState.pollution - 8);
      simState.health = Math.min(100, simState.health + 5);
      break;
    case 'recycling':
      simState.pollution = Math.max(0, simState.pollution - 22);
      simState.health = Math.min(100, simState.health + 6);
      break;
    case 'tracking':
      simState.fish = Math.min(100, simState.fish + 14);
      simState.health = Math.min(100, simState.health + 4);
      simState.pollution = Math.max(0, simState.pollution - 2);
      break;
  }
}

/**
 * Ativa uma ação e gasta pontos
 */
export function triggerAction(actionId) {
  const allActions = [...ACTIONS.gov, ...ACTIONS.private];
  const action = allActions.find(a => a.id === actionId);

  if (!action) return;
  const logTemplates = content.simulation.logs;

  if (simState.points < action.cost) {
    addLog(logTemplates.budgetInsufficient.replace('{actionName}', action.name), 'alert');
    return;
  }

  simState.points -= action.cost;

  if (supabaseChannel && simState.myRole !== 'local') {
    supabaseChannel.send({
      type: 'broadcast',
      event: 'action-triggered',
      payload: {
        actionId: action.id,
        actionName: action.name,
        userRole: simState.myRole
      }
    });
  } else {
    simState.activeActions[actionId] = true;
    addLog(logTemplates.actionTriggered.replace('{userRole}', 'LOCAL').replace('{actionName}', action.name), 'success');
    applyImmediateImpact(actionId);
    
    setTimeout(() => {
      simState.activeActions[actionId] = false;
      addLog(logTemplates.actionExpired.replace('{actionName}', action.name), 'info');
      onStateChangeCallback();
    }, action.duration * 1000);
    
    onStateChangeCallback();
  }
}

/**
 * Loop principal da simulação
 */
function startLoop() {
  stopLoop();
  const logTemplates = content.simulation.logs;

  pointsInterval = setInterval(() => {
    if (simState.points < 100) {
      simState.points = Math.min(100, simState.points + 10);
      onStateChangeCallback();
    }
  }, 5000);

  simInterval = setInterval(() => {
    if (simState.myRole === 'gov' || simState.myRole === 'local') {
      simState.tickCount++;

      let pollutionDelta = 1.2;
      let fishDelta = -1.5;
      let healthDelta = -1.5;

      if (simState.activeActions.recycling) {
        pollutionDelta -= 2.5;
      }
      
      if (simState.activeActions.amp) {
        if (simState.activeActions.tracking) {
          fishDelta += 3.5;
          healthDelta += 2.0;
        } else {
          fishDelta += 1.5;
          healthDelta += 0.8;
          if (simState.tickCount % 2 === 0) {
            addLog(logTemplates.alertIllegalFishing, 'alert');
          }
        }
      }

      if (simState.activeActions.subsidies) {
        fishDelta += 1.2;
        pollutionDelta -= 0.8;
      }

      if (simState.activeActions.tracking) {
        fishDelta += 1.8;
      }

      if (simState.pollution > 60) {
        const excessPollution = (simState.pollution - 60) / 10;
        healthDelta -= 0.5 * excessPollution;
        fishDelta -= 0.3 * excessPollution;
        if (simState.tickCount % 4 === 0) {
          addLog(logTemplates.alertToxicity, 'alert');
        }
      }

      simState.pollution = Math.max(0, Math.min(100, simState.pollution + pollutionDelta));
      simState.fish = Math.max(0, Math.min(100, simState.fish + fishDelta));
      simState.health = Math.max(0, Math.min(100, simState.health + healthDelta));

      simState.pollution = Math.round(simState.pollution * 10) / 10;
      simState.fish = Math.round(simState.fish * 10) / 10;
      simState.health = Math.round(simState.health * 10) / 10;

      simState.history.push({
        health: simState.health,
        pollution: simState.pollution,
        fish: simState.fish,
        label: `${simState.tickCount * 3}s`
      });

      if (simState.health <= 10) {
        addLog(logTemplates.logCollapse, 'alert');
      } else if (simState.health >= 90 && simState.pollution <= 20 && simState.fish >= 80) {
        addLog(logTemplates.logVictory, 'success');
      }

      if (supabaseChannel && simState.myRole === 'gov') {
        supabaseChannel.send({
          type: 'broadcast',
          event: 'state-update',
          payload: {
            health: simState.health,
            pollution: simState.pollution,
            fish: simState.fish,
            tickCount: simState.tickCount,
            activeActions: simState.activeActions
          }
        });
      }

      onStateChangeCallback();
    }
  }, 3000);
}

function stopLoop() {
  if (simInterval) clearInterval(simInterval);
  if (pointsInterval) clearInterval(pointsInterval);
  simInterval = null;
  pointsInterval = null;
}

export function resetSimulation() {
  if (supabaseChannel && simState.myRole !== 'local') {
    supabaseChannel.send({
      type: 'broadcast',
      event: 'reset-request',
      payload: {}
    });
  } else {
    simState.health = 50;
    simState.pollution = 75;
    simState.fish = 40;
    simState.tickCount = 0;
    simState.history = [{ health: 50, pollution: 75, fish: 40, label: '0s' }];
    simState.activeActions = { amp: false, subsidies: false, recycling: false, tracking: false };
    destroySimulationChart();
    addLog(content.simulation.logs.logReset, 'system');
    onStateChangeCallback();
  }
}

export function leaveSimulation() {
  stopLoop();
  destroySimulationChart();
  if (supabaseChannel) {
    supabaseChannel.unsubscribe();
    supabaseChannel = null;
  }
  simState.roomId = null;
  simState.myRole = null;
  simState.isActive = false;
  simState.playersJoined = { gov: false, private: false };
  addLog(content.simulation.logs.logLeave, 'info');
}
