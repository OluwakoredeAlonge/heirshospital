/* ==========================================================================
   Heirs Admin - authenticated fetch helper and API wrappers
   --------------------------------------------------------------------------
   Every admin page is now served by Laravel behind a real login (session
   cookie + CSRF), not a static file. HeirsAuth.fetch() is a thin wrapper
   around window.fetch that:
     - always sends the session cookie (credentials: 'same-origin')
     - attaches the CSRF token from <meta name="csrf-token"> on writes
     - redirects to /admin/login if a request comes back 401/419 (session
       expired or CSRF mismatch), so a stale tab doesn't just silently fail
   HeirsAdminContent / HeirsAdminUsers are small wrappers over that for the
   two write APIs the admin UI needs (page content, users).
   ========================================================================== */
(function () {
  'use strict';

  function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
  }

  async function request(url, opts = {}) {
    const method = (opts.method || 'GET').toUpperCase();
    const headers = Object.assign({ Accept: 'application/json' }, opts.headers || {});
    if (!(opts.body instanceof FormData) && opts.body && typeof opts.body !== 'string') {
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }
    if (method !== 'GET' && method !== 'HEAD') headers['X-CSRF-TOKEN'] = csrfToken();

    const res = await fetch(url, Object.assign({ credentials: 'same-origin' }, opts, { headers }));

    if (res.status === 401 || res.status === 419) {
      window.location.href = '/admin/login';
      throw new Error('Not authenticated');
    }
    if (!res.ok) {
      let message = 'Request failed (' + res.status + ')';
      try { const j = await res.json(); message = j.message || message; } catch (e) {}
      const err = new Error(message); err.status = res.status; throw err;
    }
    if (res.status === 204) return null;
    return res.json().catch(() => null);
  }

  const HeirsAuth = { fetch: request };

  const HeirsAdminContent = {
    get(page) { return request('/admin/api/content/' + encodeURIComponent(page)); },
    set(page, data) { return request('/admin/api/content/' + encodeURIComponent(page), { method: 'PUT', body: data }); },
    resetOne(page) { return request('/admin/api/content/' + encodeURIComponent(page), { method: 'DELETE' }); },
    exportAll() { return request('/admin/api/content'); },
    importAll(data) { return request('/admin/api/content', { method: 'PUT', body: data }); },
    resetAll() { return request('/admin/api/content', { method: 'DELETE' }); },
    upload(file) {
      const fd = new FormData(); fd.append('image', file);
      return request('/admin/api/uploads', { method: 'POST', body: fd });
    }
  };

  const HeirsAdminUsers = {
    list() { return request('/admin/api/users'); },
    create(data) { return request('/admin/api/users', { method: 'POST', body: data }); },
    update(id, data) { return request('/admin/api/users/' + id, { method: 'PUT', body: data }); },
    remove(id) { return request('/admin/api/users/' + id, { method: 'DELETE' }); },
    setStatus(id, status) { return request('/admin/api/users/' + id + '/status', { method: 'PATCH', body: { status } }); },
    resendInvite(id) { return request('/admin/api/users/' + id + '/resend-invite', { method: 'POST' }); }
  };

  window.HeirsAuth = HeirsAuth;
  window.HeirsAdminContent = HeirsAdminContent;
  window.HeirsAdminUsers = HeirsAdminUsers;
})();
