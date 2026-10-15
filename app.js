/* Tardy Sign-In Kiosk
   A static page. Everything is stored in this browser (localStorage).
   Check-ins are sent one way to a Google Form's formResponse address. */
(function () {
  'use strict';

  // ---------- Settings you might want to change ----------
  const TIMEOUTS = {
    hello: 20000,      // "Hi, name" screen returns to names after 20 s
    notlisted: 45000,  // typing screen
    pickclass: 30000,
    done: 4000,        // confirmation screen
    pin: 30000,
    setup: 5 * 60000   // setup locks itself after 5 idle minutes
  };
  const DUPLICATE_WINDOW_MIN = 10; // same student tapping again within 10 min isn't sent twice
  const RETRY_MS = 30000;
  const LOG_KEEP = 400;

  // ---------- Storage ----------
  const K = { config: 'tk.config', classes: 'tk.classes', queue: 'tk.queue', log: 'tk.log' };
  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { alert('This device could not save. Its storage may be full or blocked.'); return false; }
  }

  let config = load(K.config, null) || { formId: '', map: {}, room: '', pin: '', mode: 'auto' };
  let classes = load(K.classes, []);
  let queue = load(K.queue, []);
  let log = load(K.log, []);
  const saveConfig = () => save(K.config, config);
  const saveClasses = () => save(K.classes, classes);
  const saveQueue = () => save(K.queue, queue);
  const saveLog = () => save(K.log, log);

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const pad = (n) => String(n).padStart(2, '0');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function clockText(d) {
    const h = d.getHours() % 12 || 12;
    return h + ':' + pad(d.getMinutes());
  }
  function stamp(d) { // 2026-10-15 09:16:42 (Sheets reads this as a date-time)
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }
  const toMin = (t) => { const p = String(t || '').split(':'); return (+p[0]) * 60 + (+p[1] || 0); };
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function fmt12(t) { if (!t) return ''; const m = toMin(t); const h = Math.floor(m / 60); return ((h % 12) || 12) + ':' + pad(m % 60); }

  // ---------- Screens & idle timers ----------
  const STUDENT_SCREENS = ['names', 'pickclass', 'hello', 'notlisted'];
  let current = '';
  let idleTimer = null;

  function show(name) {
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.id !== 'screen-' + name; });
    current = name;
    $('topbar').hidden = STUDENT_SCREENS.indexOf(name) === -1;
    const onNames = name === 'names' || name === 'pickclass';
    $('where').hidden = !onNames;
    $('btn-gear').hidden = !onNames;
    $('btn-back').hidden = onNames;
    $('btn-back-label').textContent = name === 'hello' ? "That's not me" : 'Back to names';
    armIdle();
    window.scrollTo(0, 0);
  }
  function armIdle() {
    clearTimeout(idleTimer);
    const ms = TIMEOUTS[current];
    if (!ms || current === 'done') return;
    idleTimer = setTimeout(() => { goHome(); }, ms);
  }
  ['pointerdown', 'keydown', 'input'].forEach((ev) => document.addEventListener(ev, armIdle, { passive: true }));

  // ---------- Which class is showing ----------
  let pickedClass = null; // { id, until } when a student chose a class from the picker

  function activeClass() {
    if (!classes.length) return null;
    if (config.mode && config.mode !== 'auto') return classes.find((c) => c.id === config.mode) || null;
    const m = nowMin();
    const inSession = classes.find((c) => c.start && c.end && m >= toMin(c.start) - 5 && m <= toMin(c.end));
    if (inSession) return inSession;
    if (pickedClass && Date.now() < pickedClass.until) return classes.find((c) => c.id === pickedClass.id) || null;
    return null;
  }

  function goHome() {
    if (!config.pin) { startPin('create'); return; }
    const cls = activeClass();
    if (!cls && classes.length > 1) { renderClassPicker(); show('pickclass'); updateWhere(null); return; }
    renderNames(cls || classes[0] || null);
    show('names');
  }

  function updateWhere(cls) {
    $('where-room').textContent = config.room || 'Room not set';
    $('where-class').textContent = cls ? cls.name : '';
  }

  // ---------- Names ----------
  function displayNames(students) {
    const counts = {};
    students.forEach((s) => { const k = (s.first + ' ' + (s.last || '').charAt(0)).toLowerCase(); counts[k] = (counts[k] || 0) + 1; });
    return students.map((s) => {
      const k = (s.first + ' ' + (s.last || '').charAt(0)).toLowerCase();
      const last = !s.last ? '' : counts[k] > 1 ? s.last : s.last.charAt(0) + '.';
      return { first: s.first, lastShown: last, full: (s.first + ' ' + (s.last || '')).trim() };
    }).sort((a, b) => a.first.localeCompare(b.first) || a.lastShown.localeCompare(b.lastShown));
  }

  let showingClass = null;
  function renderNames(cls) {
    showingClass = cls;
    updateWhere(cls);
    const grid = $('name-grid');
    grid.textContent = '';
    const empty = $('names-empty');
    if (!cls) {
      empty.textContent = 'No class lists on this device yet. Teacher: tap the gear in the top corner to set up.';
      empty.hidden = false; return;
    }
    if (!cls.students || !cls.students.length) {
      empty.textContent = 'This class has no names yet. Use "Not on the list?" below.';
      empty.hidden = false; return;
    }
    empty.hidden = true;
    displayNames(cls.students).forEach((n) => {
      const b = el('button', 'name-btn');
      b.type = 'button';
      b.appendChild(el('span', 'first', n.first));
      if (n.lastShown) b.appendChild(el('span', 'last', n.lastShown));
      b.setAttribute('aria-label', n.first + ' ' + n.lastShown);
      b.addEventListener('click', () => openHello(n.full, n.first, false));
      grid.appendChild(b);
    });
  }

  function renderClassPicker() {
    const grid = $('class-grid');
    grid.textContent = '';
    classes.slice().sort((a, b) => toMin(a.start) - toMin(b.start)).forEach((c) => {
      const b = el('button', 'class-btn', c.name);
      b.type = 'button';
      if (c.start && c.end) b.appendChild(el('small', null, fmt12(c.start) + '–' + fmt12(c.end)));
      b.addEventListener('click', () => {
        pickedClass = { id: c.id, until: Date.now() + 60 * 60000 };
        renderNames(c); show('names');
      });
      grid.appendChild(b);
    });
  }

  // ---------- Hello / reasons ----------
  let pending = null; // { full, first, typed }
  let reason = '';
  function openHello(full, first, typed) {
    pending = { full, first, typed };
    reason = '';
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    $('hello-name').textContent = 'Hi, ' + first + '!';
    show('hello');
  }
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const r = chip.dataset.reason;
      reason = reason === r ? '' : r;
      document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.reason === reason)));
    });
  });
  $('btn-late').addEventListener('click', () => {
    if (!pending) return goHome();
    checkIn(pending.typed ? pending.full + ' (typed in)' : pending.full, pending.first, 'Tardy', reason);
  });

  // ---------- Not on the list ----------
  $('btn-notlisted').addEventListener('click', () => {
    $('nl-first').value = ''; $('nl-last').value = '';
    show('notlisted');
    setTimeout(() => $('nl-first').focus(), 50);
  });
  $('form-notlisted').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = $('nl-first').value.trim(), l = $('nl-last').value.trim();
    if (!f || !l) return;
    pending = { full: f + ' ' + l, first: f, typed: true };
    reason = '';
    checkIn(f + ' ' + l + ' (typed in)', f, 'Tardy', '');
  });
  $('btn-back').addEventListener('click', goHome);

  // ---------- Check in ----------
  function checkIn(student, first, type, why) {
    const now = new Date();
    const recent = log.find((e) => e.student === student && e.type === type && !e.test &&
      (now - new Date(e.at)) < DUPLICATE_WINDOW_MIN * 60000);
    if (recent) { showDone(first, new Date(recent.at), recent.reason, true); return; }

    const cls = showingClass;
    const entry = {
      id: uid(), at: now.toISOString(), room: config.room || '', student,
      cls: cls ? cls.name : '', type, reason: why || '', test: false
    };
    queue.push(entry); saveQueue();
    log.unshift({ id: entry.id, at: entry.at, student, type, reason: entry.reason, sent: false, test: false });
    log = log.slice(0, LOG_KEEP); saveLog();
    flushQueue();
    showDone(first, now, entry.reason, false);
  }

  let doneTimer = null;
  function showDone(first, when, why, already) {
    $('done-title').textContent = (already ? 'You already checked in at ' : "You're checked in at ") + clockText(when) + '.';
    $('done-seat').textContent = 'Have a seat, ' + first + '.';
    $('done-detail').textContent = 'Late' + (why ? ' · ' + why : '');
    const bar = $('done-bar');
    bar.classList.remove('run'); void bar.offsetWidth;
    bar.style.setProperty('--done-ms', TIMEOUTS.done + 'ms');
    bar.classList.add('run');
    show('done');
    clearTimeout(doneTimer);
    doneTimer = setTimeout(goHome, TIMEOUTS.done);
  }
  $('btn-done-now').addEventListener('click', () => { clearTimeout(doneTimer); goHome(); });

  // ---------- Sending to Google Forms ----------
  let flushing = false, retryTimer = null, lastAttemptFailed = false;

  function buildBody(e) {
    const m = config.map || {}, p = new URLSearchParams();
    const add = (field, value) => { if (m[field]) p.append(m[field], value); };
    add('room', e.room); add('student', e.student); add('type', e.type);
    add('reason', e.reason); add('cls', e.cls); add('time', stamp(new Date(e.at)));
    return p;
  }
  function sendOne(e) {
    const ctrl = ('AbortController' in window) ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), 15000) : null;
    // no-cors: Google gets the entry but we can't read its answer.
    // The promise only fails if the internet/network fails.
    return fetch('https://docs.google.com/forms/d/e/' + encodeURIComponent(config.formId) + '/formResponse', {
      method: 'POST', mode: 'no-cors', credentials: 'include', body: buildBody(e), signal: ctrl ? ctrl.signal : undefined
    }).finally(() => { if (t) clearTimeout(t); });
  }
  async function flushQueue() {
    if (flushing) return;
    if (!queue.length || !formReady()) { updateStatus(); return; }
    if (navigator.onLine === false) { lastAttemptFailed = true; updateStatus(); scheduleRetry(); return; }
    flushing = true;
    while (queue.length) {
      const e = queue[0];
      try {
        await sendOne(e);
        queue.shift(); saveQueue();
        const l = log.find((x) => x.id === e.id); if (l) { l.sent = true; saveLog(); }
        lastAttemptFailed = false;
      } catch (err) {
        lastAttemptFailed = true;
        break;
      }
    }
    flushing = false;
    updateStatus();
    if (queue.length) scheduleRetry();
  }
  function scheduleRetry() { clearTimeout(retryTimer); retryTimer = setTimeout(flushQueue, RETRY_MS); }
  window.addEventListener('online', flushQueue);
  window.addEventListener('offline', updateStatus);
  setInterval(flushQueue, 60000);

  function formReady() { return !!(config.formId && config.map && config.map.student && config.map.type); }

  function updateStatus() {
    const s = $('status'), t = $('status-text');
    s.classList.remove('waiting', 'problem');
    if (!formReady()) { s.classList.add('problem'); t.textContent = 'Not connected to a form'; }
    else if (!queue.length) { t.textContent = 'All check-ins sent'; }
    else if (navigator.onLine === false || lastAttemptFailed) {
      s.classList.add('waiting'); t.textContent = 'No internet · ' + queue.length + ' saved, will send';
    } else { s.classList.add('waiting'); t.textContent = 'Sending ' + queue.length + '…'; }
    if (current === 'setup') renderStatusArea();
  }

  // ---------- Clock ----------
  let lastActiveId = null;
  function tick() {
    $('clock').textContent = clockText(new Date());
    // when the period changes, refresh the name list (only if idle on names)
    if (current === 'names' || current === 'pickclass') {
      const a = activeClass();
      const id = a ? a.id : null;
      if (id !== lastActiveId) { lastActiveId = id; goHome(); }
    }
  }
  setInterval(tick, 5000);

  // ---------- PIN ----------
  let pinMode = 'enter', pinEntry = '', pinFirst = '', pinFails = 0, pinLockUntil = 0;
  function buildPad() {
    const pad = $('pin-pad');
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Delete'].forEach((k) => {
      const b = el('button', k.length > 1 ? 'word' : '', k === 'Delete' ? '⌫' : k);
      b.type = 'button';
      if (k === 'Delete') b.setAttribute('aria-label', 'Delete');
      b.addEventListener('click', () => pinKey(k));
      pad.appendChild(b);
    });
  }
  function startPin(mode) {
    pinMode = mode; pinEntry = ''; pinFirst = '';
    const titles = {
      enter: ['Teacher setup', 'Enter your 4-digit PIN'],
      create: ['Welcome! Create a teacher PIN', 'Choose 4 digits. You\'ll need it to open setup.'],
      change: ['Change PIN', 'Choose a new 4-digit PIN']
    };
    $('pin-title').textContent = titles[mode][0];
    $('pin-sub').textContent = titles[mode][1];
    $('pin-msg').textContent = '';
    $('btn-pin-cancel').hidden = mode === 'create';
    drawDots(); show('pin');
  }
  function drawDots() {
    [...$('pin-dots').children].forEach((d, i) => d.classList.toggle('on', i < pinEntry.length));
  }
  function pinKey(k) {
    if (Date.now() < pinLockUntil) return;
    if (k === 'Clear') pinEntry = '';
    else if (k === 'Delete') pinEntry = pinEntry.slice(0, -1);
    else if (pinEntry.length < 4) pinEntry += k;
    drawDots();
    if (pinEntry.length === 4) setTimeout(pinDone, 150);
  }
  function pinDone() {
    if (pinMode === 'enter') {
      if (pinEntry === config.pin) { pinFails = 0; openSetup(); return; }
      pinFails++;
      pinEntry = ''; drawDots();
      const dots = $('pin-dots'); dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
      if (pinFails >= 5) {
        pinLockUntil = Date.now() + 30000; pinFails = 0;
        $('pin-msg').textContent = 'Too many tries. Wait 30 seconds.';
      } else $('pin-msg').textContent = "That PIN didn't match.";
      return;
    }
    // create / change: ask twice
    if (!pinFirst) {
      pinFirst = pinEntry; pinEntry = ''; drawDots();
      $('pin-sub').textContent = 'Type the same 4 digits again';
      return;
    }
    if (pinEntry !== pinFirst) {
      pinFirst = ''; pinEntry = ''; drawDots();
      $('pin-msg').textContent = "Those didn't match. Start again.";
      $('pin-sub').textContent = 'Choose 4 digits';
      return;
    }
    config.pin = pinEntry; saveConfig();
    openSetup();
  }
  $('btn-pin-cancel').addEventListener('click', () => {
    if (pinMode === 'change') openSetup(); else goHome();
  });
  $('btn-gear').addEventListener('click', () => startPin('enter'));

  // ---------- Setup ----------
  function openSetup() {
    $('in-room').value = config.room || '';
    renderModeSelect();
    renderFormCurrent();
    renderClassList();
    $('class-editor').hidden = true;
    $('map-box').hidden = true;
    $('form-msg').textContent = ''; $('test-msg').textContent = ''; $('code-msg').textContent = '';
    $('out-code').hidden = true;
    renderStatusArea();
    show('setup');
  }
  $('btn-setup-done').addEventListener('click', () => {
    config.room = $('in-room').value.trim();
    config.mode = $('in-mode').value || 'auto';
    saveConfig();
    pickedClass = null; lastActiveId = null;
    goHome(); flushQueue();
  });
  $('btn-change-pin').addEventListener('click', () => {
    config.room = $('in-room').value.trim(); saveConfig();
    startPin('change');
  });
  $('btn-fullscreen').addEventListener('click', () => {
    const d = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen(); else if (d.requestFullscreen) d.requestFullscreen().catch(() => {});
  });

  function renderModeSelect() {
    const s = $('in-mode'); s.textContent = '';
    const o = el('option', null, 'Switch automatically by bell schedule'); o.value = 'auto'; s.appendChild(o);
    classes.forEach((c) => { const x = el('option', null, 'Always show ' + c.name); x.value = c.id; s.appendChild(x); });
    s.value = classes.some((c) => c.id === config.mode) ? config.mode : 'auto';
  }

  // --- Form link ---
  const FIELDS = [
    { key: 'room', label: 'Room', words: ['room'] },
    { key: 'student', label: 'Student', words: ['student', 'name'] },
    { key: 'type', label: 'Type', words: ['type'] },
    { key: 'reason', label: 'Reason', words: ['reason'] },
    { key: 'cls', label: 'Class / period', words: ['class', 'period'] },
    { key: 'time', label: 'Kiosk time', words: ['time', 'kiosk'] }
  ];
  let parsed = null;

  function parsePrefill(link) {
    let url;
    try { url = new URL(link.trim()); } catch (e) { return { error: "That doesn't look like a link. Copy the whole pre-filled link and paste it again." }; }
    if (url.hostname === 'forms.gle') return { error: 'This is a short link. In Google Forms use ⋮ › Get pre-filled link, and copy the long link it gives you.' };
    if (!/(^|\.)google\.com$/.test(url.hostname)) return { error: "This isn't a Google Forms link." };
    const m = url.pathname.match(/\/forms\/(?:.*\/)?d\/e\/([A-Za-z0-9_-]+)/);
    if (!m) {
      if (/\/forms\/d\/[^/]+\/edit/.test(url.pathname)) return { error: "This is the form's editing link. Use ⋮ › Get pre-filled link instead." };
      return { error: "I couldn't find the form ID in that link. Make sure it's the pre-filled link." };
    }
    const entries = [];
    url.searchParams.forEach((v, k) => { if (/^entry\.\d+$/.test(k)) entries.push({ key: k, value: v }); });
    if (!entries.length) return { error: 'No answers were found in the link. Type something in each question before clicking Get link.' };
    // Guess which answer box is which from what the teacher typed, then by order.
    const used = {};
    entries.forEach((e) => {
      const v = e.value.toLowerCase();
      const f = FIELDS.find((f) => !used[f.key] && f.words.some((w) => v.indexOf(w) !== -1));
      if (f) { e.guess = f.key; used[f.key] = true; }
    });
    entries.forEach((e) => {
      if (e.guess) return;
      const f = FIELDS.find((f) => !used[f.key]);
      e.guess = f ? f.key : ''; if (f) used[f.key] = true;
    });
    return { formId: m[1], entries };
  }

  $('btn-read-link').addEventListener('click', () => {
    const r = parsePrefill($('in-prefill').value);
    const msg = $('form-msg');
    if (r.error) { msg.textContent = r.error; msg.className = 'msg bad'; $('map-box').hidden = true; return; }
    parsed = r;
    msg.textContent = 'Found the form and ' + r.entries.length + ' question' + (r.entries.length === 1 ? '' : 's') + '.';
    msg.className = 'msg ok';
    const box = $('map-rows'); box.textContent = '';
    r.entries.forEach((e) => {
      const row = el('div', 'map-row');
      const left = el('div');
      left.appendChild(el('div', null, 'You typed “' + e.value + '”'));
      left.appendChild(el('code', null, e.key));
      const sel = el('select'); sel.dataset.key = e.key;
      sel.setAttribute('aria-label', 'Question for ' + e.key);
      FIELDS.concat([{ key: '', label: 'Not used' }]).forEach((f) => { const o = el('option', null, f.label); o.value = f.key; sel.appendChild(o); });
      sel.value = e.guess || '';
      row.appendChild(left); row.appendChild(sel);
      box.appendChild(row);
    });
    $('map-box').hidden = false;
  });

  $('btn-save-map').addEventListener('click', () => {
    if (!parsed) return;
    const map = {}, msg = $('form-msg');
    let dup = false;
    $('map-rows').querySelectorAll('select').forEach((s) => {
      if (!s.value) return;
      if (map[s.value]) dup = true;
      map[s.value] = s.dataset.key;
    });
    if (dup) { msg.textContent = 'Two answer boxes are matched to the same question. Fix that and save again.'; msg.className = 'msg bad'; return; }
    if (!map.student || !map.type) { msg.textContent = 'Student and Type must be matched before saving.'; msg.className = 'msg bad'; return; }
    config.formId = parsed.formId; config.map = map; saveConfig();
    msg.textContent = 'Saved. Now send a test entry (section 4).'; msg.className = 'msg ok';
    $('map-box').hidden = true; $('in-prefill').value = '';
    renderFormCurrent(); flushQueue();
  });

  function renderFormCurrent() {
    const p = $('form-current');
    if (!formReady()) { p.hidden = true; return; }
    const names = FIELDS.filter((f) => config.map[f.key]).map((f) => f.label);
    p.textContent = 'Connected. Sending: ' + names.join(', ') + '.' + (config.map.time ? '' : ' Tip: add a “Kiosk time” question so resent check-ins keep the real arrival time.');
    p.hidden = false;
  }

  // --- Classes ---
  let editingId = null;
  function renderClassList() {
    const list = $('class-list'); list.textContent = '';
    if (!classes.length) { list.appendChild(el('p', 'help', 'No classes yet.')); }
    classes.slice().sort((a, b) => toMin(a.start) - toMin(b.start)).forEach((c) => {
      const row = el('div', 'class-item');
      const t = el('span');
      const b = el('strong', null, c.name); t.appendChild(b);
      t.appendChild(document.createTextNode(' · ' + fmt12(c.start) + '–' + fmt12(c.end) + ' · ' + (c.students || []).length + ' students'));
      const edit = el('button', null, 'Edit'); edit.type = 'button';
      edit.addEventListener('click', () => openEditor(c));
      row.appendChild(t); row.appendChild(edit); list.appendChild(row);
    });
  }
  function openEditor(c) {
    editingId = c ? c.id : null;
    $('ce-title').textContent = c ? 'Edit ' + c.name : 'Add a class';
    $('ce-name').value = c ? c.name : '';
    $('ce-start').value = c ? c.start : '';
    $('ce-end').value = c ? c.end : '';
    $('ce-names').value = c ? (c.students || []).map((s) => (s.first + ' ' + s.last).trim()).join('\n') : '';
    $('ce-delete').hidden = !c;
    $('ce-file').value = '';
    updateCount();
    $('class-editor').hidden = false;
    $('ce-name').focus();
  }
  $('btn-add-class').addEventListener('click', () => openEditor(null));
  $('ce-cancel').addEventListener('click', () => { $('class-editor').hidden = true; });
  $('ce-delete').addEventListener('click', () => {
    if (!editingId) return;
    const c = classes.find((x) => x.id === editingId);
    if (!confirm('Delete ' + (c ? c.name : 'this class') + ' and its names from this device?')) return;
    classes = classes.filter((x) => x.id !== editingId); saveClasses();
    if (config.mode === editingId) { config.mode = 'auto'; saveConfig(); }
    $('class-editor').hidden = true; renderClassList(); renderModeSelect();
  });
  $('ce-names').addEventListener('input', updateCount);
  function updateCount() {
    const n = parseNames($('ce-names').value).length;
    $('ce-count').textContent = n ? n + ' student' + (n === 1 ? '' : 's') + ' found' : '';
  }
  $('ce-file').addEventListener('change', () => {
    const f = $('ce-file').files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const names = parseNames(String(r.result));
      $('ce-names').value = names.map((s) => (s.first + ' ' + s.last).trim()).join('\n');
      updateCount();
      if (!names.length) alert("I couldn't find names in that file. Try pasting them instead, one per line.");
    };
    r.readAsText(f);
  });
  $('class-editor').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('ce-name').value.trim(), start = $('ce-start').value, end = $('ce-end').value;
    if (!name || !start || !end) return;
    if (toMin(end) <= toMin(start)) { alert('The end time needs to be after the start time.'); return; }
    const students = parseNames($('ce-names').value);
    if (editingId) {
      const c = classes.find((x) => x.id === editingId);
      Object.assign(c, { name, start, end, students });
    } else classes.push({ id: uid(), name, start, end, students });
    saveClasses();
    $('class-editor').hidden = true; renderClassList(); renderModeSelect();
  });

  function splitRow(line) {
    const out = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',' || ch === '\t') { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  }
  function fromOneName(s) {
    s = s.replace(/\s+/g, ' ').trim();
    if (!s) return null;
    if (s.indexOf(',') !== -1) { // "Rivera, Maya"
      const i = s.indexOf(',');
      return { first: s.slice(i + 1).trim(), last: s.slice(0, i).trim() };
    }
    const parts = s.split(' ');
    return { first: parts[0], last: parts.slice(1).join(' ') };
  }
  function parseNames(text) {
    const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const head = splitRow(lines[0]).map((h) => h.toLowerCase());
    const fi = head.findIndex((h) => /first/.test(h));
    const li = head.findIndex((h) => /last/.test(h));
    const ni = head.findIndex((h) => /name/.test(h));
    let people = [];
    if (fi !== -1 && li !== -1) {
      people = lines.slice(1).map(splitRow).map((r) => ({ first: (r[fi] || '').trim(), last: (r[li] || '').trim() }));
    } else if (ni !== -1 && head.length > 1) {
      people = lines.slice(1).map(splitRow).map((r) => fromOneName(r[ni] || ''));
    } else {
      people = lines.map((l) => {
        if (l.indexOf('\t') !== -1) { const r = l.split('\t').map((x) => x.trim()).filter(Boolean); return { first: r[0], last: r.slice(1).join(' ') }; }
        return fromOneName(l.replace(/^"|"$/g, ''));
      });
    }
    const seen = {};
    return people.filter((p) => p && p.first).filter((p) => {
      const k = (p.first + '|' + p.last).toLowerCase(); if (seen[k]) return false; seen[k] = true; return true;
    }).sort((a, b) => a.first.localeCompare(b.first));
  }

  // --- Test & status ---
  $('btn-test').addEventListener('click', () => {
    const msg = $('test-msg');
    if (!formReady()) { msg.textContent = 'Connect the form first (section 1).'; msg.className = 'msg bad'; return; }
    config.room = $('in-room').value.trim(); saveConfig();
    const now = new Date();
    const e = { id: uid(), at: now.toISOString(), room: config.room || '', student: 'TEST', cls: '', type: 'Test', reason: 'Setup test', test: true };
    queue.push(e); saveQueue();
    log.unshift({ id: e.id, at: e.at, student: 'TEST', type: 'Test', reason: '', sent: false, test: true }); saveLog();
    msg.textContent = 'Sending…'; msg.className = 'msg';
    flushQueue().then(() => {
      if (queue.some((q) => q.id === e.id)) { msg.textContent = "Couldn't reach Google (no internet?). It will keep trying."; msg.className = 'msg bad'; }
      else { msg.textContent = 'Sent at ' + clockText(now) + '. Open your Sheet and look for a row with Student = TEST. No row within a minute? See "If the test doesn\'t show up" in the guide.'; msg.className = 'msg ok'; }
      renderStatusArea();
    });
  });
  $('btn-send-now').addEventListener('click', () => { lastAttemptFailed = false; flushQueue(); });

  function renderStatusArea() {
    $('queue-count').textContent = queue.length + ' check-in' + (queue.length === 1 ? '' : 's');
    const box = $('today-list'); box.textContent = '';
    const today = new Date();
    const rows = log.filter((l) => sameDay(new Date(l.at), today));
    if (!rows.length) { box.appendChild(el('div', 'today-empty', 'No check-ins yet today.')); return; }
    rows.forEach((l) => {
      const r = el('div', 'today-row');
      r.appendChild(el('span', null, clockText(new Date(l.at))));
      r.appendChild(el('span', null, l.student + (l.reason ? ' · ' + l.reason : '')));
      const waiting = queue.some((q) => q.id === l.id);
      r.appendChild(el('span', waiting ? 'w' : 's', waiting ? 'Waiting' : 'Sent'));
      box.appendChild(r);
    });
  }
  $('btn-clear-today').addEventListener('click', () => {
    if (!confirm("Clear this device's list? (The Google Sheet is not changed.)")) return;
    log = log.filter((l) => queue.some((q) => q.id === l.id)); saveLog(); renderStatusArea();
  });

  // --- Setup codes ---
  function enc(obj) { return 'TK1:' + btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
  function dec(str) { return JSON.parse(decodeURIComponent(escape(atob(str.trim().replace(/^TK1:/, ''))))); }
  $('btn-make-code').addEventListener('click', () => {
    if (!formReady()) { const m = $('code-msg'); m.textContent = 'Connect the form first.'; m.className = 'msg bad'; return; }
    const data = { v: 1, formId: config.formId, map: config.map };
    if ($('in-include-bell').checked) data.bell = classes.map((c) => ({ name: c.name, start: c.start, end: c.end }));
    const out = $('out-code'); out.value = enc(data); out.hidden = false; out.select();
    try { navigator.clipboard.writeText(out.value); $('code-msg').textContent = 'Code copied. Paste it into the other device\'s setup.'; $('code-msg').className = 'msg ok'; } catch (e) { /* select is enough */ }
  });
  $('btn-use-code').addEventListener('click', () => {
    const m = $('code-msg');
    let data;
    try { data = dec($('in-code').value); } catch (e) { m.textContent = "That code didn't work. Copy the whole code and try again."; m.className = 'msg bad'; return; }
    if (!data || !data.formId || !data.map) { m.textContent = "That code didn't work."; m.className = 'msg bad'; return; }
    config.formId = String(data.formId); config.map = data.map; saveConfig();
    let added = 0;
    (data.bell || []).forEach((b) => {
      if (!b || !b.name) return;
      if (classes.some((c) => c.name === b.name)) return;
      classes.push({ id: uid(), name: String(b.name), start: String(b.start || ''), end: String(b.end || ''), students: [] }); added++;
    });
    saveClasses();
    $('in-code').value = '';
    m.textContent = 'Form connected' + (added ? ' and ' + added + ' class' + (added === 1 ? '' : 'es') + ' added (add student names next)' : '') + '. Set the room name and send a test.';
    m.className = 'msg ok';
    renderFormCurrent(); renderClassList(); renderModeSelect();
  });

  // --- Erase ---
  $('btn-erase').addEventListener('click', () => {
    if (queue.length && !confirm(queue.length + ' check-in(s) have not been sent yet and will be lost. Continue?')) return;
    if (!confirm('Erase everything on this device?')) return;
    Object.values(K).forEach((k) => localStorage.removeItem(k));
    location.reload();
  });

  // ---------- Keep the screen awake (where supported) ----------
  let wakeLock = null;
  async function keepAwake() {
    try { if ('wakeLock' in navigator && document.visibilityState === 'visible') wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* not supported */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { keepAwake(); flushQueue(); } });

  // ---------- Works offline after first load ----------
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // ---------- Start ----------
  buildPad();
  $('clock').textContent = clockText(new Date());
  lastActiveId = (activeClass() || {}).id || null;
  goHome();
  updateStatus();
  flushQueue();
  keepAwake();
})();
