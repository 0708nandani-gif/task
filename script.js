/* ---------- Tabs ---------- */
const tabClock = document.getElementById('tab-clock');
const tabStopwatch = document.getElementById('tab-stopwatch');
const panelClock = document.getElementById('panel-clock');
const panelStopwatch = document.getElementById('panel-stopwatch');

function activateTab(which) {
  const clockActive = which === 'clock';
  tabClock.classList.toggle('is-active', clockActive);
  tabStopwatch.classList.toggle('is-active', !clockActive);
  tabClock.setAttribute('aria-selected', String(clockActive));
  tabStopwatch.setAttribute('aria-selected', String(!clockActive));
  panelClock.hidden = !clockActive;
  panelStopwatch.hidden = clockActive;
  panelClock.classList.toggle('is-active', clockActive);
  panelStopwatch.classList.toggle('is-active', !clockActive);
}

tabClock.addEventListener('click', () => activateTab('clock'));
tabStopwatch.addEventListener('click', () => activateTab('stopwatch'));

/* ---------- Clock ---------- */
const clockTimeEl = document.getElementById('clockTime');
const clockDateEl = document.getElementById('clockDate');
const clockZoneEl = document.getElementById('clockZone');

function pad(n) { return String(n).padStart(2, '0'); }

function updateClock() {
  const now = new Date();
  clockTimeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  clockDateEl.textContent = now.toLocaleDateString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  clockZoneEl.textContent = tz;
}

updateClock();
setInterval(updateClock, 1000);

/* ---------- Stopwatch ---------- */
const swTimeEl = document.getElementById('swTime');
const swStatusEl = document.getElementById('swStatus');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('lapsList');
const ringSweep = document.getElementById('ringSweep');

const RING_CIRCUMFERENCE = 565.5; // 2 * PI * 90
const LAP_DURATION_MS = 60000; // ring represents a 60s sweep per lap

let elapsedMs = 0;
let running = false;
let startTimestamp = 0;
let rafId = null;
let lapCount = 0;

function formatStopwatch(ms) {
  const totalCentis = Math.floor(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return { main: `${pad(minutes)}:${pad(seconds)}`, ms: `.${pad(centis)}` };
}

function renderStopwatch() {
  const { main, ms } = formatStopwatch(elapsedMs);
  swTimeEl.innerHTML = `${main}<span class="ms">${ms}</span>`;

  const progress = (elapsedMs % LAP_DURATION_MS) / LAP_DURATION_MS;
  ringSweep.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - progress));
}

function tick() {
  elapsedMs = Date.now() - startTimestamp;
  renderStopwatch();
  rafId = requestAnimationFrame(tick);
}

function startStopwatch() {
  running = true;
  startTimestamp = Date.now() - elapsedMs;
  rafId = requestAnimationFrame(tick);

  startStopBtn.textContent = 'Stop';
  startStopBtn.classList.add('is-running');
  swStatusEl.textContent = 'RUNNING';
  swStatusEl.classList.add('is-running');
  ringSweep.classList.add('is-running');
  lapBtn.disabled = false;
  resetBtn.disabled = true;
}

function stopStopwatch() {
  running = false;
  cancelAnimationFrame(rafId);

  startStopBtn.textContent = 'Start';
  startStopBtn.classList.remove('is-running');
  swStatusEl.textContent = 'PAUSED';
  swStatusEl.classList.remove('is-running');
  ringSweep.classList.remove('is-running');
  lapBtn.disabled = true;
  resetBtn.disabled = false;
}

function resetStopwatch() {
  elapsedMs = 0;
  lapCount = 0;
  renderStopwatch();
  lapsList.innerHTML = '';
  swStatusEl.textContent = 'READY';
  resetBtn.disabled = true;
}

function addLap() {
  lapCount += 1;
  const { main, ms } = formatStopwatch(elapsedMs);
  const li = document.createElement('li');
  li.innerHTML = `<span>Lap ${pad(lapCount)}</span><span>${main}${ms}</span>`;
  lapsList.prepend(li);
}

startStopBtn.addEventListener('click', () => {
  if (running) stopStopwatch();
  else startStopwatch();
});

lapBtn.addEventListener('click', addLap);
resetBtn.addEventListener('click', resetStopwatch);

renderStopwatch();