'use strict';

const STORAGE_KEY = 'bird-diary-sightings';

let allBirds = [];
let sightings = loadSightings();
let currentView = 'guide';

// ─── Utilities ───────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showError(msg) {
  const el = document.getElementById('error-banner');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 6000);
}

function loadSightings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

// ─── Boot ───────────────────────────────────────────────────────────────────

async function init() {
  try {
    const res = await fetch('data/birds.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allBirds = await res.json();
  } catch (err) {
    showError(`Failed to load bird data: ${err.message}. Please reload the page.`);
    return;
  }
  renderGuide();
  bindNav();
  renderDiary();
  updateStats();
}

// ─── Navigation ─────────────────────────────────────────────────────────────

function bindNav() {
  document.querySelectorAll('nav [role="tab"]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      document.querySelectorAll('nav [role="tab"]').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
      document.getElementById(`view-${currentView}`).classList.remove('hidden');
    });
  });
}

// ─── Field Guide ────────────────────────────────────────────────────────────

function renderGuide(filter = '', family = '') {
  const detail = document.getElementById('bird-detail');
  const grid = document.getElementById('bird-grid');
  detail.classList.add('hidden');
  grid.classList.remove('hidden');

  const birds = allBirds.filter(b => {
    const matchName = b.commonName.toLowerCase().includes(filter.toLowerCase()) ||
                      b.scientificName.toLowerCase().includes(filter.toLowerCase());
    const matchFamily = !family || b.family === family;
    return matchName && matchFamily;
  });

  const countEl = document.getElementById('guide-count');
  countEl.textContent = (filter || family)
    ? `${birds.length} result${birds.length !== 1 ? 's' : ''}`
    : `${birds.length} birds`;

  if (birds.length === 0) {
    grid.innerHTML = '<p class="diary-empty">No birds match your search. Try a different name or family.</p>';
    return;
  }

  grid.innerHTML = birds.map(b => `
    <div class="bird-card" data-id="${b.id}" tabindex="0" role="button"
         aria-label="${escapeHtml(b.commonName)}, ${escapeHtml(b.family)}">
      <span class="size-tag" aria-hidden="true">${b.size}</span>
      <h3>${b.commonName}</h3>
      <div class="sci">${b.scientificName}</div>
      <span class="family-badge">${b.family}</span>
      <p class="desc">${b.description.slice(0, 90)}…</p>
    </div>
  `).join('');

  grid.querySelectorAll('.bird-card').forEach(card => {
    const open = () => showBirdDetail(parseInt(card.dataset.id));
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

function showBirdDetail(id) {
  const bird = allBirds.find(b => b.id === id);
  if (!bird) return;

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
  document.getElementById('back-btn').focus();

  document.getElementById('back-btn').addEventListener('click', () => {
    panel.classList.add('hidden');
    document.getElementById('bird-grid').classList.remove('hidden');
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
    <div class="sighting-card" data-sid="${escapeHtml(s.id)}">
      <div class="sighting-body">
        <h4>${escapeHtml(s.birdName)}</h4>
        <div class="meta">${formatDate(s.date)}${s.location ? ' · ' + escapeHtml(s.location) : ''}</div>
        ${s.notes ? `<div class="notes">"${escapeHtml(s.notes)}"</div>` : ''}
      </div>
      <div class="sighting-actions">
        <button class="edit-btn" title="Edit" aria-label="Edit sighting of ${escapeHtml(s.birdName)}" data-sid="${escapeHtml(s.id)}">✎</button>
        <button class="del-btn" title="Delete" aria-label="Delete sighting of ${escapeHtml(s.birdName)}" data-sid="${escapeHtml(s.id)}">✕</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editSighting(btn.dataset.sid));
  });
  list.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteSighting(btn.dataset.sid));
  });
}

function editSighting(id) {
  const entry = sightings.find(s => s.id === id);
  if (!entry) return;
  const card = document.querySelector(`.sighting-card[data-sid="${CSS.escape(id)}"]`);
  if (!card) return;

  card.innerHTML = `
    <div class="edit-form">
      <div class="edit-row">
        <select class="edit-bird" aria-label="Bird species">
          ${allBirds.map(b =>
            `<option value="${escapeHtml(b.commonName)}"${b.commonName === entry.birdName ? ' selected' : ''}>${escapeHtml(b.commonName)}</option>`
          ).join('')}
        </select>
        <input type="date" class="edit-date" value="${escapeHtml(entry.date)}" aria-label="Date" />
      </div>
      <input type="text" class="edit-location" value="${escapeHtml(entry.location || '')}" placeholder="Location (optional)" aria-label="Location" />
      <textarea class="edit-notes" placeholder="Notes (optional)" aria-label="Notes">${escapeHtml(entry.notes || '')}</textarea>
      <div class="edit-actions">
        <button class="submit-btn edit-save">Save</button>
        <button class="back-btn edit-cancel">Cancel</button>
      </div>
    </div>
  `;

  card.querySelector('.edit-save').addEventListener('click', () => {
    const birdName = card.querySelector('.edit-bird').value;
    const date = card.querySelector('.edit-date').value;
    const location = card.querySelector('.edit-location').value.trim();
    const notes = card.querySelector('.edit-notes').value.trim();
    if (!birdName || !date) return;
    const idx = sightings.findIndex(s => s.id === id);
    if (idx === -1) return;
    sightings[idx] = { ...sightings[idx], birdName, date, location, notes };
    saveSightings();
    renderDiary();
    updateStats();
  });

  card.querySelector('.edit-cancel').addEventListener('click', renderDiary);
  card.querySelector('.edit-bird').focus();
}

function deleteSighting(id) {
  const entry = sightings.find(s => s.id === id);
  if (!entry) return;
  if (!confirm(`Delete sighting of "${entry.birdName}" on ${formatDate(entry.date)}?`)) return;
  sightings = sightings.filter(s => s.id !== id);
  saveSightings();
  renderDiary();
  updateStats();
}

function saveSightings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sightings));
  } catch {
    showError('Could not save — storage may be full. Export your data as a backup.');
  }
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function switchToDiaryLog(bird) {
  document.querySelectorAll('nav [role="tab"]').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  const diaryBtn = document.querySelector('[data-view="diary"]');
  diaryBtn.classList.add('active');
  diaryBtn.setAttribute('aria-selected', 'true');
  document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
  document.getElementById('view-diary').classList.remove('hidden');
  currentView = 'diary';

  const sel = document.getElementById('log-bird-select');
  sel.value = bird.commonName;
  document.getElementById('log-date').valueAsDate = new Date();
  document.getElementById('log-location').focus();
}

// ─── Export / Import ─────────────────────────────────────────────────────────

function exportSightings() {
  const blob = new Blob([JSON.stringify(sightings, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bird-diary-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function bindImport() {
  document.getElementById('export-btn').addEventListener('click', exportSightings);

  const fileInput = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error('Expected an array');
        const existingIds = new Set(sightings.map(s => s.id));
        const newEntries = imported.filter(s => s.id && s.birdName && s.date && !existingIds.has(s.id));
        sightings = [...sightings, ...newEntries];
        saveSightings();
        renderDiary();
        updateStats();
        alert(`Imported ${newEntries.length} new sighting(s). ${imported.length - newEntries.length} skipped (duplicates or invalid).`);
      } catch {
        showError('Import failed: file is not a valid Bird Diary backup.');
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });
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

    sightings.push({ id: Date.now().toString(), birdName, date, location, notes });
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

  const speciesCount = {};
  sightings.forEach(s => {
    speciesCount[s.birdName] = (speciesCount[s.birdName] || 0) + 1;
  });
  document.getElementById('stat-species').textContent = Object.keys(speciesCount).length;

  const thisMonth = sightings.filter(s => {
    const d = new Date(s.date + 'T12:00:00');
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById('stat-month').textContent = thisMonth;

  const section = document.getElementById('top-species-section');
  if (sightings.length === 0) {
    section.innerHTML = '<p style="color:var(--muted);font-size:.9rem">Log sightings in your diary to build up statistics.</p>';
    return;
  }

  const topSpecies = Object.entries(speciesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  section.innerHTML = `
    <h3 class="top-species-heading">Top Species</h3>
    <div class="top-species-list">
      ${topSpecies.map(([name, count], i) => `
        <div class="top-species-row">
          <span class="top-rank">${i + 1}</span>
          <span class="top-name">${escapeHtml(name)}</span>
          <span class="top-bar-wrap"><span class="top-bar" style="width:${Math.round(count / topSpecies[0][1] * 100)}%"></span></span>
          <span class="top-count">${count}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Guide controls ───────────────────────────────────────────────────────────

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
    if (allBirds.length === 0) return;
    populateFamilyFilter();
    bindGuideControls();
    bindLogForm();
    bindImport();
  });
});
