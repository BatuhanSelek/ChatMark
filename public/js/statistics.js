async function fetchStatistics() {
try {
const res = await fetch('/statistics');
const data = await res.json();
if (!Array.isArray(data) || data.length === 0) {
  document.getElementById('statSummary').textContent =
    '📢 Henüz yeterli veri yok. Lütfen stratejileri favorilere ekleyin.';
  return;
}

const counts = {
  audience: {},
  budget: {},
  marketing_channel: {},
  marketing_goal: {}
};

data.forEach(item => {
  if (item.audience)
    counts.audience[item.audience] = (counts.audience[item.audience] || 0) + 1;
  if (item.budget)
    counts.budget[item.budget] = (counts.budget[item.budget] || 0) + 1;
  if (item.marketing_channel)
    counts.marketing_channel[item.marketing_channel] = (counts.marketing_channel[item.marketing_channel] || 0) + 1;
  if (item.marketing_goal)
    counts.marketing_goal[item.marketing_goal] = (counts.marketing_goal[item.marketing_goal] || 0) + 1;
});

drawPieChart('audienceChart', 'Hedef Kitle Dağılımı', counts.audience);
drawBarChart('budgetChart', 'Bütçe Tercihleri', counts.budget);
drawDoughnutChart('channelChart', 'Pazarlama Kanalı', counts.marketing_channel);
drawRadarChart('goalChart', 'Pazarlama Hedefleri', counts.marketing_goal);

generateSummary(counts);
} catch (err) {
console.error('İstatistik verisi alınamadı:', err);
alert('İstatistikler yüklenirken hata oluştu.');
}
}

function drawPieChart(canvasId, label, dataObject) {
const ctx = document.getElementById(canvasId).getContext('2d');
new Chart(ctx, {
type: 'pie',
data: {
labels: Object.keys(dataObject),
datasets: [{
label,
data: Object.values(dataObject),
backgroundColor: getColors(Object.keys(dataObject).length)
}]
},
options: {
responsive: true,
plugins: {
legend: { position: 'bottom' }
}
}
});
}

function drawBarChart(canvasId, label, dataObject) {
const ctx = document.getElementById(canvasId).getContext('2d');
new Chart(ctx, {
type: 'bar',
data: {
labels: Object.keys(dataObject),
datasets: [{
label,
data: Object.values(dataObject),
backgroundColor: '#4A90E2'
}]
},
options: {
responsive: true,
plugins: {
legend: { display: false }
},
scales: {
y: { beginAtZero: true }
}
}
});
}

function drawDoughnutChart(canvasId, label, dataObject) {
const ctx = document.getElementById(canvasId).getContext('2d');
new Chart(ctx, {
type: 'doughnut',
data: {
labels: Object.keys(dataObject),
datasets: [{
label,
data: Object.values(dataObject),
backgroundColor: getColors(Object.keys(dataObject).length)
}]
},
options: {
responsive: true,
plugins: {
legend: { position: 'bottom' }
}
}
});
}

function drawRadarChart(canvasId, label, dataObject) {
const ctx = document.getElementById(canvasId).getContext('2d');
new Chart(ctx, {
type: 'radar',
data: {
labels: Object.keys(dataObject),
datasets: [{
label,
data: Object.values(dataObject),
backgroundColor: 'rgba(255, 99, 132, 0.3)',
borderColor: 'rgba(255, 99, 132, 1)',
pointBackgroundColor: 'rgba(255, 99, 132, 1)'
}]
},
options: {
responsive: true,
plugins: {
legend: { position: 'top' }
}
}
});
}

function generateSummary(counts) {
const topAudience = getTopKey(counts.audience);
const topBudget = getTopKey(counts.budget);
const topChannel = getTopKey(counts.marketing_channel);
const topGoal = getTopKey(counts.marketing_goal);

const summary = `📈 Analiz Özeti:<br/> ➤ En çok hedeflenen kitle: <strong>${topAudience}</strong><br/> ➤ En çok tercih edilen bütçe: <strong>${topBudget}</strong><br/> ➤ En sık kullanılan kanal: <strong>${topChannel}</strong><br/> ➤ En yoğun pazarlama amacı: <strong>${topGoal}</strong><br/> 💡 Bu bilgiler stratejilerinizin kullanıcı eğilimleriyle nasıl örtüştüğünü gösterir.`;
document.getElementById('statSummary').innerHTML = summary;
}

function getTopKey(obj) {
return Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
}

function getColors(count) {
const palette = [
'#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
'#9966FF', '#FF9F40', '#00C49F', '#8E44AD'
];
return [...palette, ...palette].slice(0, count);
}

fetchStatistics();

