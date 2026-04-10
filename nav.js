/**
 * Finance Toolkit — Global Navigation & Auth
 *
 * Renders the nav bar on every page and manages:
 *   - Supabase auth (email/password + magic link)
 *   - Cloud sync for tool states (when logged in)
 *   - Graceful fallback to localStorage when not configured or not logged in
 *
 * Usage (in each page):
 *   <script src="nav.js"></script>
 *   FinanceNav.init({ toolName: 'Mortgage Offset Calculator' });
 *
 * Cloud sync (in each tool):
 *   CloudSync.save('mortgage-offset', stateObject);
 *   const state = await CloudSync.load('mortgage-offset');
 */

(function () {
  'use strict';

  // ─── config check ──────────────────────────────────────────────────────────
  const cfg = window.APP_CONFIG || {};
  const PLACEHOLDER = 'https://YOUR_PROJECT_REF.supabase.co';
  const supabaseConfigured = !!(
    cfg.supabaseUrl &&
    cfg.supabaseKey &&
    cfg.supabaseUrl !== PLACEHOLDER
  );

  // ─── supabase client ───────────────────────────────────────────────────────
  let sb = null;
  if (supabaseConfigured) {
    // Supabase JS v2 loaded via CDN in pages that include nav.js
    if (window.supabase) {
      sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
    }
  }

  // ─── auth state ────────────────────────────────────────────────────────────
  let currentUser = null;
  let authModal = null;

  // ─── cloud sync ────────────────────────────────────────────────────────────
  let syncDebounceTimers = {};

  window.CloudSync = {
    /**
     * Save tool state to cloud (debounced 2s) + localStorage.
     * Falls back to localStorage-only if not logged in or not configured.
     */
    save: function (toolKey, data) {
      // Always save locally first
      try {
        localStorage.setItem(toolKey, JSON.stringify(data));
      } catch (e) { /* storage full */ }

      if (!sb || !currentUser) return;

      // Debounce cloud writes to avoid hammering on every keystroke
      clearTimeout(syncDebounceTimers[toolKey]);
      syncDebounceTimers[toolKey] = setTimeout(async function () {
        try {
          await sb.from('tool_states').upsert(
            { user_id: currentUser.id, tool: toolKey, data: data },
            { onConflict: 'user_id,tool' }
          );
          updateSyncIndicator('synced');
        } catch (e) {
          console.warn('Cloud sync save failed:', e);
          updateSyncIndicator('error');
        }
      }, 2000);
    },

    /**
     * Load tool state — cloud-first if logged in, otherwise localStorage.
     * Returns null if nothing found.
     */
    load: async function (toolKey) {
      if (sb && currentUser) {
        try {
          const { data, error } = await sb
            .from('tool_states')
            .select('data, updated_at')
            .eq('user_id', currentUser.id)
            .eq('tool', toolKey)
            .single();

          if (!error && data) {
            const hasLocal   = !!localStorage.getItem(toolKey);
            const cloudTime  = new Date(data.updated_at).getTime();
            const localTsRaw = localStorage.getItem(toolKey + '_updated_at');
            const localTime  = localTsRaw ? parseInt(localTsRaw, 10) : 0;

            if (!hasLocal) {
              // Nothing local — silently adopt cloud data
              localStorage.setItem(toolKey, JSON.stringify(data.data));
              localStorage.setItem(toolKey + '_updated_at', cloudTime.toString());
              return data.data;
            }

            if (cloudTime > localTime) {
              // Cloud is newer than local — ask user
              const useCloud = await showConflictPrompt(cloudTime, localTime);
              if (useCloud) {
                localStorage.setItem(toolKey, JSON.stringify(data.data));
                localStorage.setItem(toolKey + '_updated_at', cloudTime.toString());
                return data.data;
              }
            }
          }
        } catch (e) {
          console.warn('Cloud sync load failed, using local:', e);
        }
      }

      // Fall back to localStorage
      try {
        const raw = localStorage.getItem(toolKey);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    /** Call after a successful local save to stamp the timestamp */
    stampLocal: function (toolKey) {
      localStorage.setItem(toolKey + '_updated_at', Date.now().toString());
    },
  };

  // ─── conflict prompt ───────────────────────────────────────────────────────
  function showConflictPrompt(cloudTime, localTime) {
    return new Promise(function (resolve) {
      const fmt = function (ts) {
        return new Date(ts).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' });
      };
      const useCloud = confirm(
        'Your cloud data (' + fmt(cloudTime) + ') is newer than your local data (' + fmt(localTime) + ').\n\nUse cloud data?'
      );
      resolve(useCloud);
    });
  }

  // ─── sync indicator ────────────────────────────────────────────────────────
  function updateSyncIndicator(state) {
    const el = document.getElementById('nav-sync-indicator');
    if (!el) return;
    el.className = 'nav-sync ' + state;
    el.title = state === 'synced' ? 'Synced to cloud' : 'Sync failed';
  }

  // ─── nav render ────────────────────────────────────────────────────────────
  function renderNav(toolName) {
    const isHome = !toolName;
    const navEl = document.getElementById('global-nav');
    if (!navEl) return;

    navEl.innerHTML =
      '<div class="gnav-inner">' +
        '<div class="gnav-left">' +
          (isHome
            ? '<span class="gnav-brand">Finance Toolkit</span>'
            : '<a href="index.html" class="gnav-back">&#8592; Finance Toolkit</a>' +
              '<span class="gnav-sep">/</span>' +
              '<span class="gnav-tool">' + toolName + '</span>') +
        '</div>' +
        '<div class="gnav-right">' +
          (supabaseConfigured
            ? '<div id="nav-auth-area">' + renderAuthArea() + '</div>'
            : '') +
        '</div>' +
      '</div>';

    // Wire up auth events after rendering
    wireAuthEvents();
  }

  function renderAuthArea() {
    if (currentUser) {
      const email = currentUser.email || '';
      const initial = email.charAt(0).toUpperCase();
      return (
        '<div class="nav-user">' +
          '<div class="nav-avatar" title="' + email + '">' + initial + '</div>' +
          '<span class="nav-email">' + email + '</span>' +
          '<span id="nav-sync-indicator" class="nav-sync" title=""></span>' +
          '<button class="nav-signout-btn" id="nav-signout">Sign out</button>' +
        '</div>'
      );
    }
    return '<button class="nav-signin-btn" id="nav-signin">Sign in</button>';
  }

  function wireAuthEvents() {
    const signinBtn = document.getElementById('nav-signin');
    if (signinBtn) signinBtn.addEventListener('click', openAuthModal);

    const signoutBtn = document.getElementById('nav-signout');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', async function () {
        await sb.auth.signOut();
        currentUser = null;
        refreshAuthArea();
      });
    }
  }

  function refreshAuthArea() {
    const area = document.getElementById('nav-auth-area');
    if (area) {
      area.innerHTML = renderAuthArea();
      wireAuthEvents();
    }
  }

  // ─── auth modal ────────────────────────────────────────────────────────────
  function openAuthModal() {
    if (authModal) { authModal.style.display = 'flex'; return; }

    authModal = document.createElement('div');
    authModal.id = 'auth-modal';
    authModal.className = 'auth-modal-backdrop';
    authModal.innerHTML =
      '<div class="auth-modal">' +
        '<button class="auth-modal-close" id="auth-close">&times;</button>' +
        '<h2 class="auth-title">Sign in to Finance Toolkit</h2>' +
        '<p class="auth-subtitle">Save your data across devices</p>' +

        '<div id="auth-error" class="auth-error" style="display:none"></div>' +
        '<div id="auth-success" class="auth-success" style="display:none"></div>' +

        '<div class="auth-tabs">' +
          '<button class="auth-tab active" data-tab="password">Password</button>' +
          '<button class="auth-tab" data-tab="magic">Magic link</button>' +
        '</div>' +

        '<div id="auth-panel-password" class="auth-panel">' +
          '<div class="auth-field"><label>Email</label><input type="email" id="auth-email-pw" placeholder="you@example.com" autocomplete="email"></div>' +
          '<div class="auth-field"><label>Password</label><input type="password" id="auth-password" placeholder="••••••••" autocomplete="current-password"></div>' +
          '<button class="auth-btn-primary" id="auth-signin-pw">Sign in</button>' +
          '<button class="auth-btn-secondary" id="auth-signup-pw">Create account</button>' +
        '</div>' +

        '<div id="auth-panel-magic" class="auth-panel" style="display:none">' +
          '<div class="auth-field"><label>Email</label><input type="email" id="auth-email-ml" placeholder="you@example.com" autocomplete="email"></div>' +
          '<button class="auth-btn-primary" id="auth-magic-send">Send magic link</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(authModal);

    // Close
    document.getElementById('auth-close').addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', function (e) {
      if (e.target === authModal) closeAuthModal();
    });

    // Tab switching
    authModal.querySelectorAll('.auth-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        authModal.querySelectorAll('.auth-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        const which = tab.dataset.tab;
        document.getElementById('auth-panel-password').style.display = which === 'password' ? '' : 'none';
        document.getElementById('auth-panel-magic').style.display    = which === 'magic'    ? '' : 'none';
        clearAuthMessages();
      });
    });

    // Password sign in
    document.getElementById('auth-signin-pw').addEventListener('click', async function () {
      const email = document.getElementById('auth-email-pw').value.trim();
      const password = document.getElementById('auth-password').value;
      if (!email || !password) { showAuthError('Please enter your email and password.'); return; }
      setAuthLoading(true);
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setAuthLoading(false);
      if (error) { showAuthError(error.message); return; }
      closeAuthModal();
    });

    // Password sign up
    document.getElementById('auth-signup-pw').addEventListener('click', async function () {
      const email = document.getElementById('auth-email-pw').value.trim();
      const password = document.getElementById('auth-password').value;
      if (!email || !password) { showAuthError('Please enter your email and password.'); return; }
      if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
      setAuthLoading(true);
      const { error } = await sb.auth.signUp({ email, password });
      setAuthLoading(false);
      if (error) { showAuthError(error.message); return; }
      showAuthSuccess('Account created! Check your email to confirm, then sign in.');
    });

    // Magic link
    document.getElementById('auth-magic-send').addEventListener('click', async function () {
      const email = document.getElementById('auth-email-ml').value.trim();
      if (!email) { showAuthError('Please enter your email address.'); return; }
      setAuthLoading(true);
      const { error } = await sb.auth.signInWithOtp({ email });
      setAuthLoading(false);
      if (error) { showAuthError(error.message); return; }
      showAuthSuccess('Magic link sent! Check your email and click the link to sign in.');
    });

    // Enter key support
    ['auth-email-pw', 'auth-password'].forEach(function (id) {
      document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('auth-signin-pw').click();
      });
    });
    document.getElementById('auth-email-ml').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('auth-magic-send').click();
    });
  }

  function closeAuthModal() {
    if (authModal) authModal.style.display = 'none';
    clearAuthMessages();
  }

  function showAuthError(msg) {
    const el = document.getElementById('auth-error');
    if (el) { el.textContent = msg; el.style.display = ''; }
  }

  function showAuthSuccess(msg) {
    const el = document.getElementById('auth-success');
    if (el) { el.textContent = msg; el.style.display = ''; }
  }

  function clearAuthMessages() {
    ['auth-error', 'auth-success'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  function setAuthLoading(loading) {
    ['auth-signin-pw', 'auth-signup-pw', 'auth-magic-send'].forEach(function (id) {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = loading;
    });
  }

  // ─── favourites sync ───────────────────────────────────────────────────────
  var FAV_KEY = 'finance-toolkit-favourites';

  window.FavouritesSync = {
    get: function () {
      try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch(e) { return []; }
    },
    set: function (keys) {
      localStorage.setItem(FAV_KEY, JSON.stringify(keys));
      if (window.CloudSync && sb && currentUser) {
        CloudSync.save('favourites', { keys: keys });
      }
    },
    toggle: function (toolKey) {
      var keys = this.get();
      var idx = keys.indexOf(toolKey);
      if (idx === -1) keys.push(toolKey);
      else keys.splice(idx, 1);
      this.set(keys);
      return keys;
    },
    isFavourite: function (toolKey) {
      return this.get().indexOf(toolKey) !== -1;
    },
  };

  // ─── public API ────────────────────────────────────────────────────────────
  window.FinanceNav = {
    init: async function (opts) {
      opts = opts || {};

      // Render nav immediately (unauthenticated state)
      renderNav(opts.toolName || null);

      // Then check auth state and update if logged in
      if (sb) {
        const { data: { session } } = await sb.auth.getSession();
        if (session) {
          currentUser = session.user;
          refreshAuthArea();
          // Load cloud data into tool if handler provided
          if (opts.cloudKey && opts.onCloudLoad) {
            window.CloudSync.load(opts.cloudKey).then(function (data) {
              if (data) opts.onCloudLoad(data);
            }).catch(function (e) { console.warn('Cloud load failed:', e); });
          }
          // Load cloud favourites if handler provided
          if (opts.onFavouritesLoad) {
            window.CloudSync.load('favourites').then(function (data) {
              if (data && Array.isArray(data.keys)) {
                localStorage.setItem(FAV_KEY, JSON.stringify(data.keys));
                opts.onFavouritesLoad(data.keys);
              }
            }).catch(function (e) { console.warn('Favourites cloud load failed:', e); });
          }
        }

        // Listen for auth state changes
        sb.auth.onAuthStateChange(async function (event, session) {
          currentUser = session ? session.user : null;
          refreshAuthArea();

          if (event === 'SIGNED_IN' && opts.onSignIn) {
            opts.onSignIn(currentUser);
          }
        });
      }
    },

    isLoggedIn: function () { return !!currentUser; },
    getUser:    function () { return currentUser; },
  };

})();
