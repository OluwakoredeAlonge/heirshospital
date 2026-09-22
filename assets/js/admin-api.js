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
    upload(file, module) {
      const fd = new FormData(); fd.append('image', file); if (module) fd.append('module', module);
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

  const HeirsAdminAppointments = {
    list() { return request('/admin/api/appointments'); },
    create(data) { return request('/admin/api/appointments', { method: 'POST', body: data }); },
    setStatus(id, status) { return request('/admin/api/appointments/' + id, { method: 'PUT', body: { status } }); },
    remove(id) { return request('/admin/api/appointments/' + id, { method: 'DELETE' }); }
  };

  const HeirsAdminMessages = {
    list() { return request('/admin/api/contact-messages'); },
    open(id) { return request('/admin/api/contact-messages/' + id); },
    create(data) { return request('/admin/api/contact-messages', { method: 'POST', body: data }); },
    reply(id, reply) { return request('/admin/api/contact-messages/' + id + '/reply', { method: 'POST', body: { reply } }); },
    archive(id) { return request('/admin/api/contact-messages/' + id + '/archive', { method: 'POST' }); },
    remove(id) { return request('/admin/api/contact-messages/' + id, { method: 'DELETE' }); }
  };

  const HeirsAdminBlog = {
    list() { return request('/admin/api/posts'); },
    create(data) { return request('/admin/api/posts', { method: 'POST', body: data }); },
    update(id, data) { return request('/admin/api/posts/' + id, { method: 'PUT', body: data }); },
    remove(id) { return request('/admin/api/posts/' + id, { method: 'DELETE' }); }
  };

  const HeirsAdminAdmissions = {
    list() { return request('/admin/api/admissions'); },
    create(data) { return request('/admin/api/admissions', { method: 'POST', body: data }); },
    setStatus(id, status) { return request('/admin/api/admissions/' + id, { method: 'PUT', body: { status } }); },
    remove(id) { return request('/admin/api/admissions/' + id, { method: 'DELETE' }); }
  };

  const HeirsAdminMethuselah = {
    list() { return request('/admin/api/methuselah-registrations'); },
    create(data) { return request('/admin/api/methuselah-registrations', { method: 'POST', body: data }); },
    setStatus(id, status) { return request('/admin/api/methuselah-registrations/' + id, { method: 'PUT', body: { status } }); },
    remove(id) { return request('/admin/api/methuselah-registrations/' + id, { method: 'DELETE' }); }
  };

  const HeirsAdminDashboard = {
    summary() { return request('/admin/api/dashboard-summary'); }
  };

  const HeirsAdminSearch = {
    query(q) { return request('/admin/api/search?q=' + encodeURIComponent(q)); }
  };

  window.HeirsAuth = HeirsAuth;
  window.HeirsAdminContent = HeirsAdminContent;
  window.HeirsAdminUsers = HeirsAdminUsers;
  window.HeirsAdminAppointments = HeirsAdminAppointments;
  window.HeirsAdminMessages = HeirsAdminMessages;
  window.HeirsAdminBlog = HeirsAdminBlog;
  window.HeirsAdminAdmissions = HeirsAdminAdmissions;
  window.HeirsAdminMethuselah = HeirsAdminMethuselah;
  window.HeirsAdminDashboard = HeirsAdminDashboard;
  window.HeirsAdminSearch = HeirsAdminSearch;
})();
