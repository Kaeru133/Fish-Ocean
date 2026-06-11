import Chart from 'chart.js/auto';
import content from './content.json';

// Paleta de cores para os gráficos
const COLORS = {
  cyan: '#00F0FF',
  cyanAlpha: 'rgba(0, 240, 255, 0.15)',
  alert: '#FF4D4D',
  alertAlpha: 'rgba(255, 77, 77, 0.15)',
  coral: '#FF6B4A',
  coralAlpha: 'rgba(255, 107, 74, 0.15)',
  grid: '#0F1A2D',
  text: '#9CA3AF',
  textMuted: '#4B5563'
};

// Fontes padrão para o Chart.js
Chart.defaults.font.family = 'JetBrains Mono, monospace';
Chart.defaults.font.size = 10;
Chart.defaults.color = COLORS.text;

let charts = {};

/**
 * Inicializa os gráficos científicos da Tela 2 (Analytics)
 */
export function initAnalyticsCharts() {
  const chartConfig = content.analytics.charts;

  // 1. Gráfico de Acidificação
  const ctxAcid = document.getElementById('chart-acidification');
  if (ctxAcid && !charts.acidification) {
    charts.acidification = new Chart(ctxAcid, {
      type: 'line',
      data: {
        labels: ['1850', '1950', '1990', '2010', '2020', '2026', '2040 (Proj.)', '2050 (Proj.)'],
        datasets: [{
          label: chartConfig.acidification.label,
          data: [8.21, 8.15, 8.11, 8.08, 8.06, 8.05, 7.98, 7.92],
          borderColor: COLORS.cyan,
          backgroundColor: COLORS.cyanAlpha,
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointBackgroundColor: COLORS.cyan,
          pointBorderColor: '#fff',
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` pH: ${context.parsed.y}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: COLORS.grid },
            ticks: { color: COLORS.text }
          },
          y: {
            min: 7.8,
            max: 8.3,
            grid: { color: COLORS.grid },
            ticks: {
              stepSize: 0.05,
              color: COLORS.text
            }
          }
        }
      }
    });
  }

  // 2. Gráfico de Acúmulo de Plástico
  const ctxPlastic = document.getElementById('chart-plastic');
  if (ctxPlastic && !charts.plastic) {
    charts.plastic = new Chart(ctxPlastic, {
      type: 'line',
      data: {
        labels: ['2015', '2020', '2025', '2030', '2035', '2040', '2045', '2050'],
        datasets: [{
          label: chartConfig.plastic.label,
          data: [150, 240, 360, 520, 720, 980, 1300, 1700],
          borderColor: COLORS.alert,
          backgroundColor: COLORS.alertAlpha,
          fill: true,
          tension: 0.2,
          borderWidth: 2,
          pointBackgroundColor: COLORS.alert,
          pointBorderColor: '#fff',
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: COLORS.grid },
            ticks: { color: COLORS.text }
          },
          y: {
            min: 0,
            grid: { color: COLORS.grid },
            ticks: {
              callback: (value) => `${value}M T`,
              color: COLORS.text
            }
          }
        }
      }
    });
  }

  // 3. Gráfico de Biodiversidade e Sobrepesca
  const ctxOverfishing = document.getElementById('chart-overfishing');
  if (ctxOverfishing && !charts.overfishing) {
    charts.overfishing = new Chart(ctxOverfishing, {
      type: 'bar',
      data: {
        labels: chartConfig.overfishing.species,
        datasets: [
          {
            label: chartConfig.overfishing.labelSustainable,
            data: [100, 100, 100, 100, 100],
            backgroundColor: '#0F1A2D',
            borderColor: COLORS.textMuted,
            borderWidth: 1,
            barThickness: 20
          },
          {
            label: chartConfig.overfishing.labelCurrent,
            data: [14, 21, 8, 38, 29],
            backgroundColor: COLORS.coral,
            borderColor: COLORS.coral,
            borderWidth: 1,
            barThickness: 20
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              color: COLORS.text
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'transparent' },
            ticks: { color: COLORS.text }
          },
          y: {
            min: 0,
            max: 120,
            grid: { color: COLORS.grid },
            ticks: {
              callback: (value) => `${value}%`,
              color: COLORS.text
            }
          }
        }
      }
    });
  }
}

/**
 * Cria ou atualiza o gráfico em tempo real para a simulação do laboratório (Tela 3)
 */
export function renderSimulationChart(canvasElement, historyData) {
  if (!canvasElement) return null;

  const labels = historyData.map(h => h.label);
  const healthData = historyData.map(h => h.health);
  const pollutionData = historyData.map(h => h.pollution);
  const fishData = historyData.map(h => h.fish);

  const rtLabels = content.simulation.active.chartLabels;

  if (charts.simulation) {
    charts.simulation.data.labels = labels;
    charts.simulation.data.datasets[0].data = healthData;
    charts.simulation.data.datasets[1].data = pollutionData;
    charts.simulation.data.datasets[2].data = fishData;
    charts.simulation.update('none');
    return charts.simulation;
  }

  charts.simulation = new Chart(canvasElement, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: rtLabels.health,
          data: healthData,
          borderColor: COLORS.cyan,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          label: rtLabels.pollution,
          data: pollutionData,
          borderColor: COLORS.alert,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          label: rtLabels.fish,
          data: fishData,
          borderColor: '#10B981',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            color: COLORS.text
          }
        }
      },
      scales: {
        x: {
          grid: { color: COLORS.grid },
          ticks: { display: false }
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: COLORS.grid },
          ticks: {
            stepSize: 20,
            callback: (value) => `${value}%`,
            color: COLORS.text
          }
        }
      }
    }
  });

  return charts.simulation;
}

/**
 * Destrói o gráfico de simulação para reiniciar limpo
 */
export function destroySimulationChart() {
  if (charts.simulation) {
    charts.simulation.destroy();
    charts.simulation = null;
  }
}
