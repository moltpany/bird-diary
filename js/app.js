'use strict';

const STORAGE_KEY = 'bird-diary-sightings';

let allBirds = [];
let sightings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentView = 'guide';
let selectedBird = null;

// ─── Boot ───────────────────────────────────────────────────────────────────

async function init() {
  const res = await fetch('data/birds.json');
  allBirds = await res.json();
  renderGuide();
  bindNav();
  renderDiary();
  updateStats();
}

// ─── Navigation ─────────────────────────────────────────────────────────────

function bindNav() {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
      document.getElementById(`view-${currentView}`).classList.remove('hidden');
    });
  });
}

// ─── Field Guide ────────────────────────────────────────────────────────────

function renderGuide(filter = '', family = '') {
  const section = document.getElementById('view-guide');
  const detail = document.getElementById('bird-detail');
  detail.classList.add('hidden');

  const grid = document.getElementById('bird-grid');
  const birds = allBirds.filter(b => {
    const matchName = b.commonName.toLowerCase().includes(filter.toLowerCase()) ||
                      b.scientificName.toLowerCase().includes(filter.toLowerCase());
    const matchFamily = !family || b.family === family;
    return matchName && matchFamily;
  });

  grid.innerHTML = birds.map(b => `
    <div class="bird-card" data-id="${b.id}">
      <span class="size-tag">${b.size}</span>
      <h3>${b.commonName}</h3>
      <div class="sci">${b.scientificName}</div>
      <span class="family-badge">${b.family}</span>
      <p class="desc">${b.description.slice(0, 90)}…</p>
    </div>
  `).join('');

  grid.querySelectorAll('.bird-card').forEach(card => {
    card.addEventListener('click', () => showBirdDetail(parseInt(card.dataset.id)));
  });
}

function showBirdDetail(id) {
  const bird = allBirds.find(b => b.id === id);
  if (!bird) return;
  selectedBird = bird;

  const panel = document.getElementById('bird-detail');
  panel.innerHTML = `
    <button class="back-btn" id="back-btn">← Back to guide</button>
    <button class="log-btn" id="quick-log-btn">+ Log Sighting</button>
    <hr style="margin:1rem 0; border-color:var(--border)">
    <h2>${bird.commonName}</h2>
    <div class="sci">${bird.scientificName}</div>
    <p class="full-desc">${bird.description}</p>
    <div class="detail-grid">
      <div class="detail-item"><label>Family</label><p>${bird.family}</p></div>
      <div class="detail-item"><label>Size</label><p style="text-transform:capitalize">${bird.size}</p></div>
      <div class="detail-item"><label>Habitat</label><p>${bird.habitat.join(', ')}</p></div>
      <div class="detail-item"><label>Diet</label><p>${bird.diet.join(', ')}</p></div>
      <div class="detail-item"><label>Song</label><p><em>${bird.song}</em></p></div>
      <div class="detail-item"><label>Migratory</label><p>${bird.migrant ? 'Yes' : 'No'}</p></div>
      <div class="detail-item"><label>Conservation</label><p>${bird.conservationStatus}</p></div>
    </div>
  `;
  panel.classList.remove('hidden');
  document.getElementById('bird-grid').classList.add('hidden');

  document.getElementById('back-btn').addEventListener('click', () => {
    panel.classList.add('hidden');
    document.getElementById('bird-grid').classList.remove('hidden');
    selectedBird = null;
  });

  document.getElementById('quick-log-btn').addEventListener('click', () => {
    switchToDiaryLog(bird);
  });
}

function populateFamilyFilter() {
  const families = [...new Set(allBirds.map(b => b.family))].sort();
  const sel = document.getElementById('family-filter');
  families.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = f;
    sel.appendChild(opt);
  });
}

// ─── Diary ───────────────────────────────────────────────────────────────────

function renderDiary() {
  const list = document.getElementById('sighting-list');
  if (sightings.length === 0) {
    list.innerHTML = '<p class="diary-empty">No sightings yet. Use the Field Guide to log your first bird!</p>';
    return;
  }
  const sorted = [...sightings].sort((a, b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = sorted.map(s => `
    <div class="sighting-card" data-sid="${s.id}">
      <div>
        <h4>${s.birdName}</h4>
        <div class="meta">${formatDate(s.date)}${s.location ? ' · ' + s.location : ''}</div>
        ${s.notes ? `<div class="notes">"${s.notes}"</div>` : ''}
      </div>
      <button class="del-btn" title="Delete" data-sid="${s.id}">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteSighting(btn.dataset.sid));
  });
}

function deleteSighting(id) {
  sightings = sightings.filter(s => s.id !== id);
  saveSightings();
  renderDiary();
  updateStats();
}

function saveSightings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sightings));
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function switchToDiaryLog(bird) {
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-view="diary"]').classList.add('active');
  document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
  document.getElementById('view-diary').classList.remove('hidden');
  currentView = 'diary';

  const sel = document.getElementById('log-bird-select');
  sel.value = bird.commonName;
  document.getElementById('log-date').valueAsDate = new Date();
  document.getElementById('log-location').focus();
}

// ─── Log Form ────────────────────────────────────────────────────────────────

function bindLogForm() {
  const sel = document.getElementById('log-bird-select');
  allBirds.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.commonName;
    opt.textContent = b.commonName;
    sel.appendChild(opt);
  });

  document.getElementById('log-date').valueAsDate = new Date();

  document.getElementById('log-form').addEventListener('submit', e => {
    e.preventDefault();
    const birdName = sel.value;
    const date = document.getElementById('log-date').value;
    const location = document.getElementById('log-location').value.trim();
    const notes = document.getElementById('log-notes').value.trim();
    if (!birdName || !date) return;

    sightings.push({
      id: Date.now().toString(),
      birdName,
      date,
      location,
      notes
    });
    saveSightings();
    renderDiary();
    updateStats();
    e.target.reset();
    sel.value = '';
    document.getElementById('log-date').valueAsDate = new Date();
    document.getElementById('log-success').textContent = `✓ ${birdName} logged!`;
    setTimeout(() => { document.getElementById('log-success').textContent = ''; }, 2500);
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function updateStats() {
  document.getElementById('stat-total').textContent = sightings.length;
  document.getElementById('stat-species').textContent = new Set(sightings.map(s => s.birdName)).size;
  const thisMonth = sightings.filter(s => {
    const d = new Date(s.date + 'T12:00:00');
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById('stat-month').textContent = thisMonth;
}

// ─── Guide search / filter ────────────────────────────────────────────────────

function bindGuideControls() {
  const search = document.getElementById('bird-search');
  const family = document.getElementById('family-filter');
  const update = () => renderGuide(search.value, family.value);
  search.addEventListener('input', update);
  family.addEventListener('change', update);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  init().then(() => {
    populateFamilyFilter();
    bindGuideControls();
    bindLogForm();
  });
});
