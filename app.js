/* ===========================================================
    Pencari Bib Pro – Bottom floating search implementation
    =========================================================== */
(() => {
  // --- Elemen UI Desktop (now hidden) ---
  const bibInput = document.getElementById('bibInput');
  const clearInput = document.getElementById('clearInput');
  const minDigits = document.getElementById('minDigits');
  const ignoreZeros = document.getElementById('ignoreZeros');
  const sameLen = document.getElementById('sameLen');
  const exactOnly = document.getElementById('exactOnly');
  const sortMode = document.getElementById('sortMode');
  
  // --- Elemen UI Bottom Search (now universal) ---
  const bottomSearch = document.getElementById('bottomSearch');
  const bottomBibInput = document.getElementById('bottomBibInput');
  const bottomClearInput = document.getElementById('bottomClearInput');
  const bottomSettingsBtn = document.getElementById('bottomSettingsBtn');
  const bottomSheet = document.getElementById('bottomSheet');
  const bottomSheetClose = document.getElementById('bottomSheetClose');
  
  // Settings elements (now universal)
  const settingsMinDigits = document.getElementById('mobileMinDigits');
  const settingsIgnoreZeros = document.getElementById('mobileIgnoreZeros');
  const settingsSameLen = document.getElementById('mobileSameLen');
  const settingsExactOnly = document.getElementById('mobileExactOnly');
  const settingsSortMode = document.getElementById('mobileSortMode');
  const settingsFilePicker = document.getElementById('mobileFilePicker');
  const settingsBrowseBtn = document.getElementById('mobileBrowseBtn');
  const settingsClearCache = document.getElementById('mobileClearCache');
  
  // Status pills (now universal)
  const universalCountPill = document.getElementById('mobileCountPill');
  const universalDatasetPill = document.getElementById('mobileDatasetPill');
  const universalCachePill = document.getElementById('mobileCachePill');
  
  // --- Elemen UI Umum ---
  const filePicker = document.getElementById('filePicker');
  const browseBtn = document.getElementById('browseBtn');
  const exportCsv = document.getElementById('exportCsv');
  const clearCache = document.getElementById('clearCache');
  const themeToggle = document.getElementById('themeToggle');
  const grid = document.getElementById('grid');
  const sentinel = document.getElementById('sentinel');
  const statusEl = document.getElementById('status');
  const countPill = document.getElementById('countPill');
  const datasetPill = document.getElementById('datasetPill');
  const cachePill = document.getElementById('cachePill');
  const rulePill = document.getElementById('rulePill');
  const noDataEl = document.getElementById('noData');
  const noMatchesEl = document.getElementById('noMatches');
  const toTop = document.getElementById('toTop');
  const resultsToolbar = document.getElementById('results-toolbar');
  const resultsTitle = document.getElementById('results-title');
  const header = document.querySelector('.header');
  
  // Dialog Viewer
  const viewerModal = document.getElementById('viewer');
  const viewerBody = document.querySelector('.viewer-body');
  const viewerTitle = document.getElementById('viewerTitle');
  const viewerImg = document.getElementById('viewerImg');
  const viewerIframe = document.getElementById('viewerIframe');
  const viewerMeta = document.getElementById('viewerMeta');
  const viewerOpenDrv = document.getElementById('viewerOpenDrive');
  const viewerDownload = document.getElementById('viewerDownload');
  const viewerClose = document.getElementById('viewerClose');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // --- UI Enable/Disable Functions ---
  function disableAllUI() {
    // Bottom search inputs
    bottomBibInput.disabled = true;
    bottomClearInput.disabled = true;
    bottomSettingsBtn.disabled = true;
    
    // Settings inputs
    settingsMinDigits.disabled = true;
    settingsIgnoreZeros.disabled = true;
    settingsSameLen.disabled = true;
    settingsExactOnly.disabled = true;
    settingsSortMode.disabled = true;
    settingsFilePicker.disabled = true;
    settingsBrowseBtn.disabled = true;
    settingsClearCache.disabled = true;
    
    // Toolbar buttons
    filePicker.disabled = true;
    browseBtn.disabled = true;
    clearCache.disabled = true;
    themeToggle.disabled = true;
    exportCsv.disabled = true;
    
    // Reload buttons
    document.getElementById('reloadBtn').disabled = true;
    document.getElementById('mobileReloadBtn').disabled = true;
  }

  function enableAllUI() {
    // Bottom search inputs
    bottomBibInput.disabled = false;
    bottomClearInput.disabled = false;
    bottomSettingsBtn.disabled = false;
    
    // Settings inputs
    settingsMinDigits.disabled = false;
    settingsIgnoreZeros.disabled = false;
    settingsSameLen.disabled = false;
    settingsExactOnly.disabled = false;
    settingsSortMode.disabled = false;
    settingsFilePicker.disabled = false;
    settingsBrowseBtn.disabled = false;
    settingsClearCache.disabled = false;
    
    // Toolbar buttons
    filePicker.disabled = false;
    browseBtn.disabled = false;
    clearCache.disabled = false;
    themeToggle.disabled = false;
    exportCsv.disabled = false;
    
    // Reload buttons
    document.getElementById('reloadBtn').disabled = false;
    document.getElementById('mobileReloadBtn').disabled = false;
  }

  // --- Settings Sync Functions ---
  function getCurrentSettings() {
    return {
      minDigits: parseInt(settingsMinDigits.value || '2', 10),
      ignoreZeros: settingsIgnoreZeros.checked,
      sameLen: settingsSameLen.checked,
      exactOnly: settingsExactOnly.checked,
      sortMode: settingsSortMode.value
    };
  }

  // --- Update Pills ---
  function updatePills(type, content) {
    if (type === 'count') {
      countPill.textContent = content;
      universalCountPill.textContent = content;
    } else if (type === 'dataset') {
      datasetPill.textContent = content;
      universalDatasetPill.textContent = content;
    } else if (type === 'cache') {
      cachePill.textContent = content;
      universalCachePill.textContent = content;
    } else if (type === 'rule') {
      rulePill.textContent = content;
    }
  }

  // --- State & Penyimpanan ---
  const DB_NAME = 'bib-finder-cache';
  const DB_STORE = 'datasets';
  const DB_KEY = 'active';
  let idb = null;

  const PREF_KEY = 'bibFinderPrefs';
  const prefs = loadPrefs();
  applyPrefs();

  function loadPrefs() {
    try { const raw = localStorage.getItem(PREF_KEY); return raw ? JSON.parse(raw) : {}; }
    catch { return {}; }
  }

  function savePrefs() {
    try {
      const settings = getCurrentSettings();
      const p = {
        theme: document.documentElement.getAttribute('data-theme') || 'dark',
        ...settings
      };
      localStorage.setItem(PREF_KEY, JSON.stringify(p));
    } catch {}
  }

  function applyPrefs() {
    if (prefs.theme) document.documentElement.setAttribute('data-theme', prefs.theme);
    if (typeof prefs.minDigits === 'number') {
      settingsMinDigits.value = prefs.minDigits;
    }
    if (typeof prefs.ignoreZeros === 'boolean') {
      settingsIgnoreZeros.checked = prefs.ignoreZeros;
    }
    if (typeof prefs.sameLen === 'boolean') {
      settingsSameLen.checked = prefs.sameLen;
    }
    if (typeof prefs.exactOnly === 'boolean') {
      settingsExactOnly.checked = prefs.exactOnly;
    }
    if (typeof prefs.sortMode === 'string') {
      settingsSortMode.value = prefs.sortMode;
    }
    updateThemeToggle();
  }

  function updateThemeToggle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  }

  // Header scroll behavior - simplified for universal layout
  let lastScrollY = 0;
  let isCompact = false;
  let scrollTimeout = null;
  
  const COMPACT_THRESHOLD = 300;
  const EXPAND_THRESHOLD = 50;
  const UPDATE_DELAY = 100;

  function updateHeaderState() {
    const currentScrollY = window.scrollY;
    
    let shouldBeCompact;
    
    if (currentScrollY > COMPACT_THRESHOLD) {
      shouldBeCompact = true;
    } else if (currentScrollY < EXPAND_THRESHOLD) {
      shouldBeCompact = false;
    } else {
      shouldBeCompact = isCompact;
    }
    
    if (shouldBeCompact !== isCompact) {
      isCompact = shouldBeCompact;
      header.classList.toggle('compact', isCompact);
    }
    
    toTop.classList.toggle('visible', currentScrollY > 600);
  }

  function handleScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      updateHeaderState();
      lastScrollY = window.scrollY;
    }, UPDATE_DELAY);
  }

  // Cache functions
  async function idbOpen() {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: 'key' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  async function cachePut(payload) {
    const entry = { key: DB_KEY, ts: Date.now(), ...payload };
    if (idb) {
      try {
        await new Promise((resolve, reject) => {
          const tx = idb.transaction(DB_STORE, 'readwrite');
          tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
          tx.objectStore(DB_STORE).put(entry);
        });
        updatePills('cache', `cache: disimpan (${new Date(entry.ts).toLocaleString()})`);
        return true;
      } catch {}
    }
    try {
      localStorage.setItem('bibFinderCache', JSON.stringify(entry));
      updatePills('cache', `cache: disimpan (localStorage)`); 
      return true;
    } catch {
      updatePills('cache', `cache: gagal menyimpan`); 
      return false;
    }
  }

  async function cacheGet() {
    if (idb) {
      try {
        const result = await new Promise((resolve) => {
          const tx = idb.transaction(DB_STORE, 'readonly');
          tx.onerror = () => resolve(null);
          const req = tx.objectStore(DB_STORE).get(DB_KEY);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
        if (result) return result;
      } catch {}
    }
    try { const raw = localStorage.getItem('bibFinderCache'); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  async function cacheClear() {
    let ok = false;
    if (idb) {
      try {
        await new Promise((resolve) => {
          const tx = idb.transaction(DB_STORE, 'readwrite');
          tx.oncomplete = resolve; tx.onerror = () => resolve();
          tx.objectStore(DB_STORE).delete(DB_KEY);
        });
        ok = true;
      } catch {}
    }
    try { localStorage.removeItem('bibFinderCache'); ok = true; } catch {}
    updatePills('cache', ok ? 'cache: dihapus' : 'cache: gagal dihapus');
  }

  let DATA = [];
  let BROWSE_INDEX = new Map();
  let LAST_RESULTS = [];
  let LAST_QUERY_DIGITS = '';
  let CURRENT_INDEX = -1;
  const RENDER_BATCH = 50;
  let renderedCount = 0;
  let touchStartX = 0, touchEndX = 0;
  const SWIPE_THRESHOLD = 50;
  // Show/hide clear button based on input
  function updateClearButton() {
    const hasValue = bottomBibInput.value.trim() !== '';
    bottomClearInput.classList.toggle('visible', hasValue);
    exportCsv.classList.toggle('visible', hasValue);
  }



  // Add this helper function
  async function loadNextChunk(partNum, loadedData = [], loadingUI) {
    const { loadingBar, loadingMessage, loadingPercent } = loadingUI;
    try {
      loadingMessage.textContent = `Memuat part${partNum}...`;
      const res = await fetch(`./bib_export_part${partNum}.json`, { cache: 'no-store' });
      
      if (!res.ok) {
        if (res.status === 404) {
          // No more parts found, finish loading
          if (loadedData.length > 0) {
            loadingBar.style.width = '100%';
            loadingMessage.textContent = 'Memproses data...';
            loadingPercent.textContent = '100%';
            return loadedData;
          }
          // If no parts loaded at all, throw to try single file
          throw new Error('No parts found');
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
      const chunkData = await res.json();
      loadedData.push(...chunkData);
      
      // Update progress (use rough estimation)
      loadingPercent.textContent = `${loadedData.length} foto dimuat`;
      loadingBar.style.width = '75%'; // Keep some room for more parts
      
      // Update pills
      updatePills('dataset', `dataset: loading... (${loadedData.length} foto)`);
      
      // Recursively load next part
      return loadNextChunk(partNum + 1, loadedData, loadingUI);
      
    } catch (e) {
      if (e.message === 'No parts found' && partNum === 1) throw e;
      return loadedData;
    }
  }

  (async function boot() {
    disableAllUI(); // Disable UI saat mulai loading
    
    idb = await idbOpen();
    updatePills('cache', idb ? 'cache: siap' : 'cache: cadangan localStorage');
    
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    const loadingMessage = document.getElementById('loadingMessage');
    const loadingPercent = document.getElementById('loadingPercent');
    
    // Cek cache terlebih dahulu
    setStatus('Memeriksa cache...', false, true);
    const cached = await cacheGet();
    
    if (cached?.data && Array.isArray(cached.data) && cached.data.length > 0) {
      // Jika ada cache, langsung gunakan
      loadingText.classList.add('visible');
      loadingBar.style.width = '50%';
      loadingMessage.textContent = 'Memuat dari cache...';
      loadingPercent.textContent = `${cached.data.length} foto`;
      
      setTimeout(() => {
        loadingBar.style.width = '100%';
        loadingMessage.textContent = 'Memproses data...';
        
        setTimeout(() => {
          ingest(cached.data, cached.label || 'cache');
          setStatus('Dimuat dari cache. Ketik untuk mencari.');
          loadingText.classList.remove('visible');
          loadingBar.style.width = '0%';
          enableAllUI();
          browseAll();
        }, 300);
      }, 200);
      return;
    }
    
    // Jika tidak ada cache, baru fetch dari server
    try {
      setStatus('Loading dataset dari server...', false, true);
      loadingText.classList.add('visible');
      
      const loadingUI = { loadingBar, loadingMessage, loadingPercent };
      
      // Start loading from part1 and continue until no more parts found
      const allData = await loadNextChunk(1, [], loadingUI);
      
      // If we loaded at least one chunk successfully
      if (allData.length > 0) {
        loadingBar.style.width = '100%';
        loadingMessage.textContent = 'Memproses data...';
        loadingPercent.textContent = '100%';
        
        setTimeout(() => {
          ingest(allData, `chunked dataset (${allData.length} foto)`);
          cachePut({ label: `chunked dataset (${allData.length} foto)`, data: allData });
          setStatus(`Berhasil memuat dataset (${allData.length} foto) dan disimpan ke cache. Ketik untuk mencari.`);
          loadingText.classList.remove('visible');
          loadingBar.style.width = '0%';
          enableAllUI(); // Enable UI setelah loading selesai
          browseAll(); // Tampilkan browse secara default
        }, 500);
        return;
      }

      // Fallback to single file if no parts found
      console.log('No chunks found, trying single file...');
      loadingMessage.textContent = 'Memuat file tunggal...';
      loadingBar.style.width = '0%';
      
      const res = await fetch('./bib_export.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      // Add timeout for large files
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Loading timeout')), 30000)
      );
      
      const jsonPromise = res.json();
      const json = await Promise.race([jsonPromise, timeoutPromise]);
      
      loadingBar.style.width = '100%';
      loadingMessage.textContent = 'Memproses data...';
      loadingPercent.textContent = '100%';
      
      setTimeout(() => {
        ingest(json, 'bib_export.json');
        cachePut({ label: 'bib_export.json', data: json });
        setStatus('Berhasil memuat dari file tunggal dan disimpan ke cache. Ketik untuk mencari.');
        loadingText.classList.remove('visible');
        loadingBar.style.width = '0%';
        enableAllUI(); // Enable UI setelah loading selesai
        browseAll(); // Tampilkan browse secara default
      }, 500);
      
    } catch (e) {
      console.error('Failed to load dataset:', e);
      loadingText.classList.remove('visible');
      loadingBar.style.width = '0%';
      setStatus('Gagal mengambil dataset dari server.');
      noDataEl.hidden = false;
      enableAllUI(); // Enable UI meskipun gagal, agar user bisa pilih file
    }
  })();

  function ingest(json, label = 'dataset') {
    if (!Array.isArray(json)) { setStatus('Root JSON harus berupa array objek.', true); return; }
    DATA = json.map(item => ({
      file_id: item.file_id ?? null, 
      file_name: item.file_name ?? '', 
      web_view_link: item.web_view_link ?? null,
      bib_numbers: Array.isArray(item.bib_numbers) ? item.bib_numbers.filter(x => typeof x === 'string' || typeof x === 'number').map(String) : [],
      confidences: Array.isArray(item.confidences) ? item.confidences : []
    }));
    updatePills('dataset', `dataset: ${label} (${DATA.length} foto)`);
    noDataEl.hidden = true;
    
    setStatus('Mengindeks data untuk browse...', false, true);
    BROWSE_INDEX.clear();
    for (const rec of DATA) {
      const seenInThisRecord = new Set();
      for (const bib of rec.bib_numbers) {
        const cleanBib = digitsOnly(bib);
        if (cleanBib && !seenInThisRecord.has(cleanBib)) {
          BROWSE_INDEX.set(cleanBib, (BROWSE_INDEX.get(cleanBib) || 0) + 1);
          seenInThisRecord.add(cleanBib);
        }
      }
    }
    setStatus('');
    refresh();
  }

  const digitsOnly = s => (s ?? '').toString().replace(/\D+/g, '');
  const stripLeadingZeros = s => {
    const raw = digitsOnly(s);
    if (raw === '') return '';
    const t = raw.replace(/^0+/, '');
    return t === '' ? '0' : t;
  };

  function isWithinOneEdit(a, b) {
    if (a === b) return { ok: true, dist: 0 };
    const la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return { ok: false, dist: 2 };
    if (la === lb) {
      let mismatches = 0;
      for (let i = 0; i < la; i++) { if (a[i] !== b[i] && ++mismatches > 1) return { ok: false, dist: 2 }; }
      return { ok: true, dist: 1 };
    }
    let i = 0, j = 0, skips = 0;
    const long = la > lb ? a : b, short = la > lb ? b : a;
    while (i < long.length && j < short.length) {
      if (long[i] === short[j]) { i++; j++; } 
      else { if (++skips > 1) return { ok: false, dist: 2 }; i++; }
    }
    const dist = skips + ((long.length - i) > 0 ? 1 : 0);
    return { ok: dist <= 1, dist };
  }

  function bestDistance(user, cand, ignoreZerosFlag) {
    const a1 = digitsOnly(user), b1 = digitsOnly(cand);
    const a2 = stripLeadingZeros(user), b2 = stripLeadingZeros(cand);
    let best = { ok: false, dist: 2 };
    const tryPair = (x, y) => { const r = isWithinOneEdit(x, y); if (r.dist < best.dist) best = r; };
    tryPair(a1, b1);
    if (ignoreZerosFlag) tryPair(a2, b2);
    return best;
  }

  const driveDirectImg = (fileId) => fileId ? `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}` : null;
  const drivePreviewUrl = (fileId, webViewLink) => {
    if (fileId) return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
    if (webViewLink) {
      const m = webViewLink.match(/\/d\/([^/]+)/);
      if (m) return `https://drive.google.com/file/d/${encodeURIComponent(m[1])}/preview`;
    }
    return null;
  };

  function refresh() {
    const raw = digitsOnly(bottomBibInput.value);
    const settings = getCurrentSettings();
    const minLen = 3; // Fix minimal digit untuk pencarian adalah 3

    grid.innerHTML = '';
    noMatchesEl.hidden = true;
    resultsTitle.textContent = '';
    renderedCount = 0;
    LAST_RESULTS = [];
    LAST_QUERY_DIGITS = raw || '';


    // Update rule pill
    if (!settings.sameLen && !settings.exactOnly) {
        updatePills('rule', 'aturan: mengandung input');
    } else if (settings.exactOnly) {
        updatePills('rule', 'aturan: cocok tepat');
    } else {
        updatePills('rule', 'aturan: ≤1 edit');
    }

    if (DATA.length === 0) {
      noDataEl.hidden = false;
      updatePills('count', '0 hasil');
      return;
    }
    noDataEl.hidden = true;

    if (!raw || raw.length < minLen) {
      updatePills('count', '0 hasil');
      setStatus('Masukkan minimal 3 digit untuk mencari.');
      return;
    }

    resultsTitle.textContent = `Hasil Pencarian untuk "${raw}"`;
    resultsTitle.classList.remove('empty');
    const results = [];

    for (const rec of DATA) {
      if (!rec || !Array.isArray(rec.bib_numbers) || rec.bib_numbers.length === 0) continue;
      
      const matches = [];
      for (let idx = 0; idx < rec.bib_numbers.length; idx++) {
        const candidate = String(rec.bib_numbers[idx] ?? '');
        const candDigits = digitsOnly(candidate);
        if (!candDigits) continue;

        if (!settings.sameLen && !settings.exactOnly) {
            if (candDigits.includes(raw)) {
                const conf = Array.isArray(rec.confidences) ? rec.confidences[idx] ?? null : null;
                const pseudoDist = (candDigits === raw) ? 0 : 1;
                matches.push({ bib: candidate, dist: pseudoDist, conf });
            }
        } else {
            if (settings.sameLen && candDigits.length !== raw.length) continue;
            const d = bestDistance(raw, candDigits, settings.ignoreZeros);
            if (settings.exactOnly ? (d.ok && d.dist === 0) : (d.ok && d.dist <= 1)) {
                const conf = Array.isArray(rec.confidences) ? rec.confidences[idx] ?? null : null;
                matches.push({ bib: candidate, dist: d.dist, conf });
            }
        }
      }

      if (matches.length) {
        matches.sort((a, b) => (a.dist - b.dist) || ((b.conf ?? -1) - (a.conf ?? -1)));
        results.push({ rec, matches, bestDist: matches[0].dist, bestConf: matches[0].conf ?? -1 });
      }
    }

    if (settings.sortMode === 'conf') {
      results.sort((A, B) => (B.bestConf - A.bestConf) || (A.bestDist - B.bestDist) || String(A.rec.file_name).localeCompare(String(B.rec.file_name)));
    } else if (settings.sortMode === 'name') {
      results.sort((A, B) => String(A.rec.file_name).localeCompare(String(B.rec.file_name)) || (A.bestDist - B.bestDist) || (B.bestConf - A.bestConf));
    } else {
      results.sort((A, B) => (A.bestDist - B.bestDist) || (B.bestConf - A.bestConf) || String(A.rec.file_name).localeCompare(String(B.rec.file_name)));
    }

    LAST_RESULTS = results;
    updatePills('count', `${results.length} hasil`);

    // Update export button visibility
    //resultsToolbar.hidden = results.length === 0;
    
    
    if (results.length === 0) {
      noMatchesEl.hidden = false;
      return;
    }
    
    renderMore(buildCard);
    setupObserver(buildCard);
  }
  
  function buildCard(item, idx) {
    const { rec, matches } = item;
    const card = document.createElement('article');
    card.className = 'result-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Lihat foto ${rec.file_name || 'tanpa nama'}`);
    
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) { return; }
      openPreview(idx);
    });
    
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPreview(idx);
      }
    });
    
    // Card Header
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const icon = document.createElement('div');
    icon.className = 'card-icon';
    icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
    </svg>`;
    
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = rec.file_name || '(tanpa nama berkas)';
    
    header.appendChild(icon);
    header.appendChild(title);
    
    // Card Bibs
    const bibsContainer = document.createElement('div');
    bibsContainer.className = 'card-bibs';
    matches.slice(0, 6).forEach(m => {
      const chip = document.createElement('span');
      chip.className = 'bib-chip';
      chip.dataset.dist = String(m.dist);
      chip.title = (m.conf != null) ? `Jarak: ${m.dist} | Kepercayaan: ${m.conf}` : `Jarak: ${m.dist}`;
      chip.textContent = m.bib;
      bibsContainer.appendChild(chip);
    });
    
    // Card Actions
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    if (rec.web_view_link) {
      const driveLink = document.createElement('a');
      driveLink.href = rec.web_view_link;
      driveLink.target = '_blank';
      driveLink.rel = 'noopener noreferrer';
      driveLink.textContent = 'Drive';
      driveLink.className = 'btn';
      driveLink.title = 'Buka di Google Drive';
      actions.appendChild(driveLink);
    }
    
    card.appendChild(header);
    card.appendChild(bibsContainer);
    card.appendChild(actions);
    return card;
  }

  function browseAll() {
    if (DATA.length === 0) {
      setStatus('Muat dataset terlebih dahulu untuk browse.', true, true);
      return;
    }
    
    bottomBibInput.value = '';
    updateClearButton();
    
    grid.innerHTML = '';
    noMatchesEl.hidden = true;
    //resultsToolbar.hidden = true; 
    renderedCount = 0;
    const settings = getCurrentSettings();
    const minLen = Math.max(1, settings.minDigits);

    setStatus('Memfilter indeks...', false, true);
    setTimeout(() => {
        const filteredBibs = [];
        for (const [bib, count] of BROWSE_INDEX.entries()) {
            if (bib.length >= minLen) {
                filteredBibs.push({ bib, count });
            }
        }
        
        LAST_RESULTS = filteredBibs.sort((a, b) => a.bib - b.bib);
        
        updatePills('count', `${LAST_RESULTS.length} bib terindeks`);
        resultsTitle.textContent = 'Indeks Semua Nomor Bib';
        resultsTitle.classList.remove('empty');
        setStatus('');
        
        if (LAST_RESULTS.length === 0) {
            noMatchesEl.querySelector('.empty-title').textContent = `Tidak ada bib dengan minimal ${minLen} digit`;
            noMatchesEl.hidden = false;
            return;
        }

        renderMore(buildBrowseCard);
        setupObserver(buildBrowseCard);
    }, 10);
  }

  function buildBrowseCard(item, idx) {
    const { bib, count } = item;
    const card = document.createElement('article');
    card.className = 'browse-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Cari bib ${bib}`);
    
    const main = document.createElement('div');
    main.className = 'browse-main';
    
    const icon = document.createElement('div');
    icon.className = 'browse-icon';
    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
    </svg>`;
    
    const bibSpan = document.createElement('span');
    bibSpan.className = 'browse-bib';
    bibSpan.textContent = bib;
    
    main.appendChild(icon);
    main.appendChild(bibSpan);

    const countChip = document.createElement('span');
    countChip.className = 'browse-count';
    countChip.textContent = `${count} foto`;
    countChip.title = `Nomor bib ${bib} ditemukan di ${count} foto`;
    
    card.appendChild(main);
    card.appendChild(countChip);

    card.addEventListener('click', () => {
        bottomBibInput.value = bib;
        updateClearButton();
        refresh();
    });
    
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        bottomBibInput.value = bib;
        updateClearButton();
        refresh();
      }
    });
    
    return card;
  }
  
  function renderMore(builderFn) {
    const frag = document.createDocumentFragment();
    const end = Math.min(renderedCount + RENDER_BATCH, LAST_RESULTS.length);
    for (let i = renderedCount; i < end; i++) {
      frag.appendChild(builderFn(LAST_RESULTS[i], i));
    }
    grid.appendChild(frag);
    renderedCount = end;
  }

  let observer = null;
  function setupObserver(builderFn) {
    observer?.disconnect?.();
    observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && renderedCount < LAST_RESULTS.length) {
          renderMore(builderFn);
        }
      });
    });
    observer.observe(sentinel);
  }

  function openPreview(idx) {
    if (!LAST_RESULTS.length || typeof LAST_RESULTS[idx] !== 'object') return;
    CURRENT_INDEX = Math.min(Math.max(idx, 0), LAST_RESULTS.length - 1);
    updateViewer();
    viewerModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onViewerKey);
    viewerBody.addEventListener('touchstart', handleTouchStart, { passive: true });
    viewerBody.addEventListener('touchmove', handleTouchMove, { passive: true });
    viewerBody.addEventListener('touchend', handleTouchEnd);
  }

  function closePreview() {
    viewerImg.src = '';
    viewerIframe.src = '';
    viewerModal.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onViewerKey);
    viewerBody.removeEventListener('touchstart', handleTouchStart);
    viewerBody.removeEventListener('touchmove', handleTouchMove);
    viewerBody.removeEventListener('touchend', handleTouchEnd);
  }

  function handleTouchStart(e) { touchStartX = e.changedTouches[0].screenX; }
  function handleTouchMove(e) { touchEndX = e.changedTouches[0].screenX; }
  function handleTouchEnd() {
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX < 0) movePreview(1);
        else movePreview(-1);
    }
    touchStartX = 0;
    touchEndX = 0;
  }

  function onViewerKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closePreview(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); movePreview(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); movePreview(1); }
  }

  function movePreview(delta) {
    const next = CURRENT_INDEX + delta;
    if (next < 0 || next >= LAST_RESULTS.length) return;
    CURRENT_INDEX = next;
    updateViewer();
  }

  function updateViewer() {
    const item = LAST_RESULTS[CURRENT_INDEX];
    if (!item) return;
    const { rec, matches } = item;
    const imgUrl = driveDirectImg(rec.file_id);
    const prevUrl = drivePreviewUrl(rec.file_id, rec.web_view_link);
    
    viewerTitle.textContent = rec.file_name || '(tanpa nama berkas)';
    const topBibs = matches.slice(0, 5).map(m => `${m.bib}${m.dist === 0 ? ' (cocok)' : ''}`).join(', ');
    viewerMeta.textContent = topBibs ? `Kecocokan: ${topBibs}` : '';

    if (rec.web_view_link) { 
      viewerOpenDrv.style.display = 'inline-flex'; 
      viewerOpenDrv.href = rec.web_view_link; 
    } else { 
      viewerOpenDrv.style.display = 'none'; 
      viewerOpenDrv.removeAttribute('href'); 
    }

    if (imgUrl) { 
      viewerDownload.style.display = 'inline-flex'; 
      viewerDownload.href = imgUrl; 
    } else { 
      viewerDownload.style.display = 'none'; 
      viewerDownload.removeAttribute('href'); 
    }

    if (prevUrl) {
        viewerIframe.hidden = false; 
        viewerImg.hidden = true;
        viewerIframe.src = prevUrl;
    } else if (imgUrl) {
        viewerImg.hidden = false; 
        viewerIframe.hidden = true;
        viewerImg.src = imgUrl;
    } else {
        viewerImg.hidden = false; 
        viewerIframe.hidden = true;
        viewerImg.src = ''; 
        viewerImg.alt = 'Pratinjau tidak tersedia';
    }
    
    prevBtn.disabled = CURRENT_INDEX <= 0;
    nextBtn.disabled = CURRENT_INDEX >= (LAST_RESULTS.length - 1);
  }

  // Event Listeners
  viewerClose.addEventListener('click', closePreview);
  viewerModal.addEventListener('click', (e) => {
    if (e.target === viewerModal) closePreview();
  });
  prevBtn.addEventListener('click', () => movePreview(-1));
  nextBtn.addEventListener('click', () => movePreview(1));

  // Bottom sheet handlers
  bottomSettingsBtn.addEventListener('click', () => {
    bottomSheet.classList.add('visible');
  });

  bottomSheetClose.addEventListener('click', () => {
    bottomSheet.classList.remove('visible');
    savePrefs();
  });

  // Click outside to close bottom sheet
  bottomSheet.addEventListener('click', (e) => {
    if (e.target === bottomSheet) {
      bottomSheet.classList.remove('visible');
      savePrefs();
    }
  });

  let debounceTimer = null;
  const trigger = () => { 
    clearTimeout(debounceTimer); 
    debounceTimer = setTimeout(() => { 
      savePrefs(); 
      refresh(); 
    }, 150); 
  };

  // Universal input handlers
  bottomBibInput.addEventListener('input', () => {
    updateClearButton();
    trigger();
  });
  
  bottomBibInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      trigger();
    }
  });

  // Settings change handlers
  [settingsMinDigits, settingsIgnoreZeros, settingsSameLen, settingsExactOnly, settingsSortMode].forEach(el => {
    el.addEventListener('input', trigger);
    el.addEventListener('change', trigger);
  });
  
  // Clear button handler
  bottomClearInput.addEventListener('click', () => { 
    bottomBibInput.value = '';
    updateClearButton();
    browseAll(); // Tampilkan browse saat clear
    bottomBibInput.focus(); 
  });

  // File picker handlers
  async function handleFileChange(file) {
    if (!file) return;
    try {
      setStatus(`Membaca ${file.name}…`, false, true);
      const text = await file.text();
      const json = JSON.parse(text);
      ingest(json, file.name);
      await cachePut({ label: file.name, data: json });
      setStatus(`Berhasil memuat ${file.name} dan menyimpannya ke cache. Ketik untuk mencari.`);
      browseAll(); // Tampilkan browse setelah load file
    } catch (e) {
      setStatus(`Gagal membaca berkas JSON: ${e.message}`, true, true);
    }
  }

  filePicker.addEventListener('change', async (ev) => {
    const file = ev.target.files?.[0];
    await handleFileChange(file);
    ev.target.value = '';
  });

  settingsFilePicker.addEventListener('change', async (ev) => {
    const file = ev.target.files?.[0];
    await handleFileChange(file);
    ev.target.value = '';
  });

  // Browse and cache handlers
  browseBtn.addEventListener('click', browseAll);
  settingsBrowseBtn.addEventListener('click', browseAll);
  
  clearCache.addEventListener('click', async () => { await cacheClear(); });
  settingsClearCache.addEventListener('click', async () => { await cacheClear(); });
  
  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    updateThemeToggle();
    savePrefs();
  });

  // Scroll handling with throttling for better performance
  let scrollThrottleTimer = null;
  window.addEventListener('scroll', () => {
    if (scrollThrottleTimer) return;
    
    scrollThrottleTimer = setTimeout(() => {
      handleScroll();
      scrollThrottleTimer = null;
    }, 16); // ~60fps
  }, { passive: true });
  
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Export CSV functionality
  exportCsv.addEventListener('click', () => {
    if (LAST_RESULTS.length === 0) return;
    
    const csvContent = [
      ['Nama File', 'File ID', 'Link', 'Nomor Bib', 'Jarak', 'Kepercayaan'].join(','),
      ...LAST_RESULTS.flatMap(item => 
        item.matches.map(match => [
          `"${item.rec.file_name || ''}"`,
          `"${item.rec.file_id || ''}"`,
          `"${item.rec.web_view_link || ''}"`,
          `"${match.bib}"`,
          match.dist,
          match.conf ?? ''
        ].join(','))
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pencarian-bib-${LAST_QUERY_DIGITS}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  let statusTimer = null;
  function setStatus(msg, isError = false, transient = false) {
    if (msg.includes('…') || msg.includes('...')) {
      statusEl.innerHTML = `<span class="loading"><span class="spinner"></span> ${msg}</span>`;
    } else {
      statusEl.textContent = msg;
    }
    statusEl.style.color = isError ? 'var(--danger)' : 'var(--text-muted)';
    if (transient) {
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => { 
        statusEl.textContent = ''; 
        statusEl.innerHTML = '';
      }, 2000);
    }
  }

  // Initialize
  updateClearButton();

  async function reloadDefault() {
    try {
      disableAllUI(); // Disable UI saat mulai reload
      setStatus('Memuat ulang dataset dari server...', false, true);
      
      const loadingBar = document.getElementById('loadingBar');
      const loadingText = document.getElementById('loadingText');
      const loadingMessage = document.getElementById('loadingMessage');
      const loadingPercent = document.getElementById('loadingPercent');
      
      loadingText.classList.add('visible');
      loadingMessage.textContent = 'Memuat data dari server...';
      loadingBar.style.width = '0%';
      
      const loadingUI = { loadingBar, loadingMessage, loadingPercent };
      
      // Try loading chunked files first
      try {
        const allData = await loadNextChunk(1, [], loadingUI);
        if (allData.length > 0) {
          loadingBar.style.width = '100%';
          loadingMessage.textContent = 'Memproses data...';
          loadingPercent.textContent = '100%';
          
          setTimeout(() => {
            ingest(allData, `chunked dataset (${allData.length} foto)`);
            cachePut({ label: `chunked dataset (${allData.length} foto)`, data: allData });
            setStatus(`Berhasil memuat ulang dataset (${allData.length} foto).`);
            loadingText.classList.remove('visible');
            loadingBar.style.width = '0%';
            enableAllUI(); // Enable UI setelah reload selesai
            browseAll(); // Tampilkan browse secara default
          }, 500);
          return;
        }
      } catch (e) {
        console.log('No chunks found, trying single file...');
      }
      
      // Fallback to single file
      loadingMessage.textContent = 'Memuat file tunggal...';
      loadingBar.style.width = '0%';
      
      const res = await fetch('./bib_export.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      loadingBar.style.width = '50%';
      const json = await res.json();
      
      loadingBar.style.width = '100%';
      loadingMessage.textContent = 'Memproses data...';
      loadingPercent.textContent = '100%';
      
      setTimeout(() => {
        ingest(json, 'bib_export.json');
        cachePut({ label: 'bib_export.json', data: json });
        setStatus('Berhasil memuat ulang dari file tunggal.');
        loadingText.classList.remove('visible');
        loadingBar.style.width = '0%';
        enableAllUI(); // Enable UI setelah reload selesai
        browseAll(); // Tampilkan browse secara default
      }, 500);
      
    } catch (e) {
      setStatus(`Gagal memuat dataset: ${e.message}`, true);
      enableAllUI(); // Enable UI meskipun gagal
    }
  }

  // Add click handlers for reload buttons
  document.getElementById('reloadBtn').addEventListener('click', reloadDefault);
  document.getElementById('mobileReloadBtn').addEventListener('click', reloadDefault);
})();