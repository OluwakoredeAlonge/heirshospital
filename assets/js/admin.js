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

  const LOGO = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="ahg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1663D6"/><stop offset="1" stop-color="#14B8A6"/></linearGradient></defs><rect width="48" height="48" rx="14" fill="url(#ahg)"/><path d="M24 13.5c-3.6-4.2-10.5-2.7-10.5 3.3 0 4.8 6.5 9.6 10.5 13.2 4-3.6 10.5-8.4 10.5-13.2 0-6-6.9-7.5-10.5-3.3z" fill="#fff" opacity=".96"/><path d="M10 34h6.5l2.5-5 4 10 3-7 2 2H37" stroke="#F2B84B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const me = window.HeirsUser || { name: 'Admin', role: 'Viewer', initials: 'A', permissions: [], isSuperAdmin: false };
  const can = (mod) => !mod || me.isSuperAdmin || (me.permissions || []).includes(mod);

  // Edit-page sub items are generated from the CMS page registry instead of
  // being hand-duplicated here, so adding a page to HeirsCMS.PAGES is enough.
  const editPages = ((window.HeirsCMS && window.HeirsCMS.PAGES) || [])
    .filter(p => p.key !== 'site')
    .map(p => ({ key: 'edit-' + p.key, label: p.title, icon: p.icon, href: '/admin/pages/' + p.key, sub: true, mod: 'pages' }));

  const NAV = [
    { grp: 'Hospital Admin' },
    { key: 'index', label: 'Overview', icon: 'layout-dashboard', href: '/admin' },
    { key: 'heirs-appointment', label: 'Appointments', icon: 'calendar-check', href: '/admin/appointments', mod: 'appointments' },
    { key: 'contact', label: 'Messages', icon: 'mail', href: '/admin/messages', mod: 'messages' },
    { key: 'blog', label: 'Blog', icon: 'newspaper', href: '/admin/blog', mod: 'blog' },
    { key: 'institute', label: 'Heirs Institute', icon: 'graduation-cap', href: '/admin/institute', mod: 'institute' },
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
  <div class="a-search">${i('search')}<input type="search" placeholder="Search appointments, messages…" id="aSearch"><kbd>/</kbd></div>
  <div class="a-tb-actions">
    <button class="a-icon-btn" title="Notifications">${i('bell')}<span class="dot"></span></button>
    <a class="a-icon-btn" title="My profile" href="/admin/profile">${i('user-round')}</a>
    <button class="a-icon-btn" title="Help" onclick="alert('Heirs Admin Portal v2, contact MASYS for support.')">${i('circle-help')}</button>
  </div>
</header>`;
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
