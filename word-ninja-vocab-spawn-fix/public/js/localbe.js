// Word Ninja local account bridge. Works with the same init/import/sync protocol as state.js.
(function () {
  const TOKEN_KEY = 'wordninja_api_token';
  const isOfflineAndroid = () => { try { return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()); } catch { return false; } };
  const USER_KEY = 'wordninja_api_user';
  let token = null;
  let user = null;
  let readyPromise = null;

  try { token = localStorage.getItem(TOKEN_KEY); } catch {}
  try { user = JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { user = null; }

  async function request(url, options = {}, explicitToken) {
    const headers = Object.assign({ 'Accept': 'application/json' }, options.headers || {});
    const bearer = explicitToken !== undefined ? explicitToken : token;
    if (bearer) headers.Authorization = 'Bearer ' + bearer;
    if (options.body != null) headers['Content-Type'] = 'application/json';
    const response = await fetch(url, Object.assign({}, options, { headers, credentials: 'same-origin' }));
    const type = response.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await response.json() : { error: await response.text() };
    if (!response.ok) {
      if (response.status === 401 && url === '/api/auth/me') clearAuth();
      const e = new Error(body.error || ('HTTP ' + response.status));
      e.status = response.status;
      throw e;
    }
    return body;
  }

  function clearAuth() {
    token = null; user = null; readyPromise = null;
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch {}
    updateAccountButton();
  }
  function setAuth(payload) {
    token = payload.token;
    user = payload.user;
    readyPromise = Promise.resolve(true);
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
    updateAccountButton();
  }
  async function whenReady() {
    if (!token) return false;
    if (readyPromise) return readyPromise;
    readyPromise = request('/api/auth/me').then((r) => {
      user = r.user;
      try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
      updateAccountButton();
      return true;
    }).catch(() => {
      // request() already clears credentials on HTTP 401. Do not erase a valid local
      // session token just because the server is temporarily unreachable.
      readyPromise = null;
      return false;
    });
    return readyPromise;
  }

  const bridge = {
    ready() { return !isOfflineAndroid() && !!(token && user); },
    whenReady() { return isOfflineAndroid() ? Promise.resolve(false) : whenReady(); },
    get user() { return user; },
    async act(input) {
      if (!await whenReady()) throw new Error('Bạn chưa đăng nhập tài khoản Word Ninja.');
      return request('/api/world', { method: 'POST', body: JSON.stringify(input || {}) });
    },
    async loadVocabulary() {
      return request('/api/vocab');
    },
    async register(username, password) {
      const r = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }, null);
      setAuth(r);
      return r;
    },
    async login(username, password) {
      const r = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }, null);
      setAuth(r);
      return r;
    },
    async logout() {
      try { if (token) await request('/api/auth/logout', { method: 'POST' }); } finally { clearAuth(); }
    },
  };
  window.LOCALBE = bridge;

  function saveBrowserCopy() {
    try {
      const live = window.S && window.S.d ? JSON.parse(JSON.stringify(window.S.d)) : JSON.parse(localStorage.getItem('wordninja_progress') || 'null');
      if (live) localStorage.setItem('wordninja_progress', JSON.stringify(live));
    } catch (e) { console.warn('Could not preserve a browser copy before logout', e); }
  }
  function currentBrowserSave() {
    try {
      if (window.S && window.S.d) return JSON.parse(JSON.stringify(window.S.d));
      return JSON.parse(localStorage.getItem('wordninja_progress') || 'null');
    } catch { return null; }
  }

  const $ = (selector) => document.querySelector(selector);
  function updateAccountButton() {
    const button = $('#accountAction');
    if (!button) return;
    if (bridge.ready()) {
      button.textContent = '☁ ' + (user.username || 'Đã đăng nhập');
      button.classList.add('is-authenticated');
      button.title = 'Tiến trình game được lưu theo tài khoản';
    } else {
      button.textContent = '☁ Đăng nhập / Lưu cloud';
      button.classList.remove('is-authenticated');
      button.title = 'Đăng nhập để lưu tiến trình theo tài khoản';
    }
  }

  function setMessage(text, kind) {
    const el = $('#accountMessage');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'account-message' + (kind ? ' ' + kind : '');
  }
  function openModal() {
    const modal = $('#accountModal');
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('account-open');
    const loggedIn = bridge.ready();
    $('#accountForm').hidden = loggedIn;
    $('#accountSignedIn').hidden = !loggedIn;
    $('#accountTitle').textContent = loggedIn ? 'Tài khoản Word Ninja' : 'Lưu hành trình của bạn';
    $('#accountUser').textContent = loggedIn ? ('Đã đăng nhập: ' + user.username) : '';
    setMessage(loggedIn ? 'Tiến trình được lưu vào PostgreSQL qua Backend của game.' : 'Đăng ký hoặc đăng nhập để đồng bộ nhân vật giữa các trình duyệt/thiết bị.', 'info');
    if (!loggedIn) $('#accountUsername').focus();
  }
  function closeModal() {
    const modal = $('#accountModal');
    if (modal) modal.hidden = true;
    document.body.classList.remove('account-open');
  }

  async function importLegacySaveIfNeeded() {
    // Probe without creating a server record. The server's init/import contract leaves room
    // for a safe one-time localStorage migration, and never overwrites an existing cloud save.
    const probe = await bridge.act({ cmd: 'init' });
    if (probe && probe.exists && probe.state) return { imported: false, existing: true };
    const local = currentBrowserSave();
    if (!local) return { imported: false, existing: false };
    const result = await bridge.act({ cmd: 'import', data: local, words: local.words || {} });
    if (result && result.refused === 'already') return { imported: false, existing: true };
    if (result && result.refused) throw new Error('Không thể nhập bản lưu cũ: ' + result.refused);
    return { imported: true, existing: false };
  }

  async function doAuth(mode) {
    const username = $('#accountUsername').value.trim();
    const password = $('#accountPassword').value;
    const buttons = document.querySelectorAll('[data-auth-action]');
    buttons.forEach((b) => { b.disabled = true; });
    setMessage(mode === 'register' ? 'Đang tạo tài khoản…' : 'Đang đăng nhập…', 'info');
    try {
      if (mode === 'register') await bridge.register(username, password);
      else await bridge.login(username, password);
      setMessage('Đăng nhập thành công. Đang kiểm tra và đồng bộ tiến trình…', 'success');
      const outcome = await importLegacySaveIfNeeded();
      setMessage(outcome.imported ? 'Đã chuyển tiến trình từ trình duyệt lên tài khoản. Đang tải lại game…' : 'Đã xác nhận tài khoản. Đang tải tiến trình…', 'success');
      setTimeout(() => location.reload(), 500);
    } catch (e) {
      setMessage(e.message || 'Không thể đăng nhập.', 'error');
      buttons.forEach((b) => { b.disabled = false; });
    }
  }

  function setupUI() {
    const button = $('#accountAction');
    if (isOfflineAndroid()) {
      if (button) button.hidden = true;
      const modal = $('#accountModal');
      if (modal) modal.hidden = true;
      return;
    }
    if (!button) return;
    button.addEventListener('click', openModal);
    $('#accountClose')?.addEventListener('click', closeModal);
    $('#accountModal')?.addEventListener('click', (e) => { if (e.target.id === 'accountModal') closeModal(); });
    document.querySelectorAll('[data-auth-action]').forEach((b) => b.addEventListener('click', () => doAuth(b.dataset.authAction)));
    $('#accountLogout')?.addEventListener('click', async () => {
      saveBrowserCopy();
      setMessage('Đang đăng xuất…', 'info');
      try { await bridge.logout(); location.reload(); }
      catch (e) { setMessage(e.message || 'Không thể đăng xuất.', 'error'); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#accountModal') && !$('#accountModal').hidden) closeModal(); });
    whenReady().finally(updateAccountButton);
    updateAccountButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupUI);
  else setupUI();
})();
