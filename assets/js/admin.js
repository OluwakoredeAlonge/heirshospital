/* ==========================================================================
   Heirs Admin Portal, shared shell
   Usage: <body data-admin="blog" data-title="Blog" data-section="Hospital Admin">
          <div id="admin-shell"></div>   (sidebar + overlay injected here)
          <div class="a-main"><div id="admin-topbar"></div> ... </div>
   window.HeirsUser is injected server-side by resources/views/layouts/admin.blade.php
   (name, role, initials, permissions, isSuperAdmin) - there is no more
   localStorage "current user" flag; this is a real authenticated session.
   ========================================================================== */
(function () {
  'use strict';
  const b = document.body;
  const page = b.dataset.admin || '';
  const title = b.dataset.title || document.title;
  const section = b.dataset.section || 'Heirs Admin';
  const i = (n) => `<i data-lucide="${n}"></i>`;

  const LOGO = `<img src="/assets/img/logo.png" alt="Heirs Multispecialist Hospital logo">`;

  const me = window.HeirsUser || { name: 'Admin', role: 'Viewer', initials: 'A', permissions: [], isSuperAdmin: false };
  const can = (mod) => !mod || me.isSuperAdmin || (me.permissions || []).includes(mod);

  // Edit-page sub items are generated from the CMS page registry instead of
  // being hand-duplicated here, so adding a page to HeirsCMS.PAGES is enough.
  const editPages = ((window.HeirsCMS && window.HeirsCMS.PAGES) || [])
    .filter(p => p.key !== 'site')
    .map(p => ({ key: 'edit-' + p.key, label: p.title, icon: p.icon, href: '/admin/pages/' + p.key, sub: true, mod: 'pages' }));

  const NAV = [
    { grp: 'Operations' },
    { key: 'index', label: 'Overview', icon: 'layout-dashboard', href: '/admin' },
    { key: 'heirs-appointment', label: 'Appointments', icon: 'calendar-check', href: '/admin/appointments', mod: 'appointments' },
    { key: 'contact', label: 'Messages', icon: 'mail', href: '/admin/messages', mod: 'messages' },
    { key: 'blog', label: 'Blog', icon: 'newspaper', href: '/admin/blog', mod: 'blog' },
    { key: 'institute', label: 'Heirs Institute', icon: 'graduation-cap', href: '/admin/institute', mod: 'institute' },
    { key: 'methuselah', label: 'Methuselah Project', icon: 'heart-handshake', href: '/admin/methuselah', mod: 'methuselah' },
    { grp: 'Website content' },
    { key: 'pages', label: 'All Pages', icon: 'layout-template', href: '/admin/pages', mod: 'pages' },
    { key: 'settings', label: 'Site Settings', icon: 'settings', href: '/admin/settings', mod: 'settings' },
    ...editPages,
    { key: 'site', label: 'View Website', icon: 'external-link', href: '/' },
    { grp: 'Administration' },
    { key: 'users', label: 'Users & Roles', icon: 'shield', href: '/admin/users', mod: 'users' }
  ].filter(n => n.grp || can(n.mod));

  function sidebar() {
    const items = NAV.map(n => n.grp ? `<div class="grp">${n.grp}</div>` :
      `<a href="${n.href}" class="${n.key === page ? 'active' : ''}${n.sub ? ' sub' : ''}">${i(n.icon)} ${n.label}${n.cnt ? `<span class="cnt">${n.cnt}</span>` : ''}</a>`).join('');
    return `
<div class="a-sb-overlay" id="aOverlay"></div>
<aside class="a-sidebar" id="aSidebar">
  <a href="/admin" class="a-brand">${LOGO}<span><b>Heirs Admin</b><small>Multispecialist Hospital</small></span></a>
  <nav class="a-nav">${items}</nav>
  <div class="a-sb-foot">
    <div class="a-user"><div class="av">${me.initials}</div><div><b>${me.name}</b><span>${me.role}</span></div>
      <form method="POST" action="/admin/logout" style="display:contents">
        <input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]')?.content || ''}">
        <button type="submit" class="a-icon-btn" title="Log out" style="background:none;border:0;cursor:pointer">${i('log-out')}</button>
      </form>
    </div>
  </div>
</aside>`;
  }

  function topbar() {
    return `
<header class="a-topbar">
  <button class="a-burger" id="aBurger" aria-label="Open menu">${i('menu')}</button>
  <div class="a-crumb"><span>${section}</span>${i('chevron-right')}<b>${title}</b></div>
  <div class="a-search" id="aSearchWrap">${i('search')}<input type="search" placeholder="Search appointments, messages…" id="aSearch" autocomplete="off"><kbd>/</kbd>
    <div class="a-drop" id="aSearchResults" hidden></div>
  </div>
  <div class="a-tb-actions">
    <div id="aNotifWrap" style="position:relative">
      <button class="a-icon-btn" title="Notifications" id="aNotifBtn">${i('bell')}<span class="badge" id="aNotifBadge" hidden></span></button>
      <div class="a-drop" id="aNotifPanel" hidden></div>
    </div>
    <a class="a-icon-btn" title="My profile" href="/admin/profile">${i('user-round')}</a>
    <button class="a-icon-btn" title="Help" onclick="alert('Heirs Admin Portal v2, contact MASYS for support.')">${i('circle-help')}</button>
  </div>
</header>`;
  }

  const escHtml = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dropItem = (icon, tone, title, sub, link) => `<a class="a-drop-item" href="${link}"><span class="ic ${tone}" style="width:32px;height:32px;border-radius:9px;display:grid;place-items:center;flex:none">${i(icon)}</span><span class="min-w-0"><b>${escHtml(title)}</b><span class="sub">${escHtml(sub)}</span></span></a>`;

  function wireSearch() {
    const wrap = document.getElementById('aSearchWrap');
    const input = document.getElementById('aSearch');
    const panel = document.getElementById('aSearchResults');
    if (!wrap || !input || !panel || !window.HeirsAdminSearch) return;
    let timer = null;
    const close = () => { panel.hidden = true; };
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) { close(); return; }
      timer = setTimeout(async () => {
        let results = [];
        try { ({ results } = await HeirsAdminSearch.query(q)); } catch (e) { close(); return; }
        panel.innerHTML = results.length
          ? results.map(r => dropItem(r.icon, 'blue', r.title, r.type + ' · ' + r.subtitle, r.link)).join('')
          : `<div class="a-drop-empty">No matches for "${escHtml(q)}"</div>`;
        panel.hidden = false;
        if (window.lucide) lucide.createIcons({ nodes: [panel] });
      }, 250);
    });
    document.addEventListener('click', e => { if (!panel.hidden && !e.target.closest('#aSearchWrap')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  function wireNotifications() {
    const btn = document.getElementById('aNotifBtn');
    const panel = document.getElementById('aNotifPanel');
    const badge = document.getElementById('aNotifBadge');
    if (!btn || !panel || !badge || !window.HeirsAdminDashboard) return;
    let items = [];
    function render() {
      panel.innerHTML = items.length
        ? items.map(x => dropItem(x.icon, x.tone, x.title, x.text + ' · ' + x.when, x.link)).join('')
        : `<div class="a-drop-empty">You're all caught up.</div>`;
      if (window.lucide) lucide.createIcons({ nodes: [panel] });
    }
    async function load() {
      try {
        const r = await HeirsAdminDashboard.summary();
        items = r.attention || [];
        badge.hidden = items.length === 0;
        badge.textContent = items.length > 9 ? '9+' : String(items.length);
      } catch (e) { items = []; badge.hidden = true; }
      render();
    }
    btn.addEventListener('click', () => {
      const willOpen = panel.hidden;
      panel.hidden = !panel.hidden;
      if (willOpen) load();
    });
    document.addEventListener('click', e => { if (!panel.hidden && !e.target.closest('#aNotifWrap')) panel.hidden = true; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.hidden = true; });
    load();
  }

  function mount() {
    const s = document.getElementById('admin-shell'); if (s) s.outerHTML = sidebar();
    const t = document.getElementById('admin-topbar'); if (t) t.outerHTML = topbar();
    const sb = document.getElementById('aSidebar'), ov = document.getElementById('aOverlay');
    const open = () => { sb.classList.add('open'); ov.classList.add('open'); };
    const close = () => { sb.classList.remove('open'); ov.classList.remove('open'); };
    document.getElementById('aBurger')?.addEventListener('click', open);
    ov?.addEventListener('click', close);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); document.getElementById('aSearch')?.focus(); }
    });
    wireSearch();
    wireNotifications();
    if (window.lucide) lucide.createIcons();
  }

  // Toast helper: HeirsAdmin.toast('Saved')
  window.HeirsAdmin = {
    toast(msg, icon = 'check-circle-2') {
      const t = document.createElement('div'); t.className = 'toast fade-in'; t.innerHTML = `${i(icon)}<span>${msg}</span>`;
      document.body.appendChild(t); if (window.lucide) lucide.createIcons({ nodes: [t] }); setTimeout(() => t.remove(), 3200);
    },
    icons() { if (window.lucide) lucide.createIcons(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  // Re-render icons whenever Alpine adds nodes (x-for, x-if, modals)
  let pending = null;
  const mo = new MutationObserver(() => {
    if (pending) return;
    pending = setTimeout(() => { pending = null; if (window.lucide && document.querySelector('i[data-lucide]')) lucide.createIcons(); }, 40);
  });
  document.addEventListener('DOMContentLoaded', () => mo.observe(document.body, { childList: true, subtree: true }));
})();
