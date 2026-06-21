let satisfactionChart = null;
let timelineChart     = null;

function initCharts() {
  const satisfactionCtx = document.getElementById('satisfaction-chart').getContext('2d');
  const timelineCtx     = document.getElementById('timeline-chart').getContext('2d');

  satisfactionChart = new Chart(satisfactionCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [0, 100],
        backgroundColor: ['#4ecca3', '#22263a'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });

  timelineChart = new Chart(timelineCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Satisfaction %',
        data: [],
        borderColor: '#6c63ff',
        backgroundColor: 'rgba(108,99,255,0.1)',
        borderWidth: 2,
        pointRadius: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: '#7b82a8', font: { size: 10 } },
          grid:  { color: '#2e3250' }
        },
        y: {
          min: 0, max: 100,
          ticks: { color: '#7b82a8', font: { size: 10 } },
          grid:  { color: '#2e3250' }
        }
      }
    }
  });
}

function updateCharts(stats) {
  if (!satisfactionChart || !timelineChart) return;

  const pct = stats.satisfactionPct ?? 0;

  satisfactionChart.data.datasets[0].data = [pct, 100 - pct];
  satisfactionChart.update();

  if (stats.timeline && stats.timeline.length > 0) {
    timelineChart.data.labels   = stats.timeline.map(t => t.month);
    timelineChart.data.datasets[0].data = stats.timeline.map(t => t.avgSatisfaction);
    timelineChart.update();
  }
}
