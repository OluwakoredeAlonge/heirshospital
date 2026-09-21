/* ==========================================================================
   Heirs CMS - content layer shared by the public site and the admin portal
   --------------------------------------------------------------------------
   Public pages mark editable content with attributes:
     data-cms="key"                 single field (text by default)
     data-cms-type="html|link|image|icon|lines"
     data-cms-attr="href"           write value to an attribute instead of text
     data-cms-label="Hero headline" label shown in the admin editor
     data-cms-section="Hero"        groups fields into an editor section (on an ancestor)
     data-cms-list="key"            repeatable list; its first child is the template
       data-cms-field="name"        field inside a list item (same type/attr/label options)
   Storage: a real backend (GET /api/content/{page}), served from
   HeirsMultiSpecialist_2026. Public pages fetch their content on load and
   apply it over the page's own baked-in defaults, so every visitor sees the
   same admin-edited content, not just the browser that made the edit.
   Admin writes go through the separate HeirsAdminContent API wrapper in
   admin-api.js (this file only ever reads, for the public boot path).
   ========================================================================== */
(function () {
  'use strict';

  // Registry of public pages the admin can edit
  const PAGES = [
    { key: 'site', title: 'Site settings', file: null, icon: 'settings', desc: 'Phone numbers, emails, addresses, hours and social links used across every page.' },
    { key: 'index', title: 'Home page', file: 'index.html', icon: 'home', desc: 'Hero, stats, services, programmes, founders, testimonials and locations.' },
    { key: 'about', title: 'About us', file: 'about.html', icon: 'building-2', desc: 'Story, mission, timeline, founders, values and facilities.' },
    { key: 'services', title: 'Medical services', file: 'services.html', icon: 'stethoscope', desc: 'Featured centres, the full service directory and patient journey.' },
    { key: 'department', title: 'Departments', file: 'department.html', icon: 'layout-grid', desc: 'Department cards with images, features and branch details.' },
    { key: 'fosterheirs', title: 'Fosterheirs mental health', file: 'fosterheirs.html', icon: 'brain', desc: 'Services, team, courses, books and booking details.' },
    { key: 'heirs-institute', title: 'Heirs Institute', file: 'heirs-institute.html', icon: 'graduation-cap', desc: 'Programmes, admissions, dates and scholarships.' },
    { key: 'methuselah', title: 'Methuselah Project', file: 'methuselah.html', icon: 'heart-handshake', desc: 'Free elder-care programme details and eligibility.' },
    { key: 'testimonial', title: 'Patient stories', file: 'testimonial.html', icon: 'message-square-heart', desc: 'Testimonials and the feedback section.' },
    { key: 'faq', title: 'FAQs', file: 'faq.html', icon: 'circle-help', desc: 'Every question and answer, grouped by topic.' },
    { key: 'blog', title: 'Health blog', file: 'blog.html', icon: 'newspaper', desc: 'Featured article, article cards and sidebar.' },
    { key: 'detailed-blog', title: 'Blog article', file: 'detailed-blog.html', icon: 'file-text', desc: 'The article body, author and related links.' },
    { key: 'contact', title: 'Contact & booking', file: 'contact.html', icon: 'mail', desc: 'Contact tiles, booking form copy, branches and quick answers.' },
    { key: 'privacy', title: 'Privacy & terms', file: 'privacy_policy.html', icon: 'shield-check', desc: 'Legal text sections.' }
  ];

  /* ---------- element <-> value ---------- */
  function typeOf(el) {
    if (el.dataset.cmsType) return el.dataset.cmsType;
    if (el.tagName === 'IMG') return 'image';
    if (el.dataset.cmsAttr) return 'attr';
    return 'text';
  }
  function readEl(el) {
    const t = typeOf(el);
    if (t === 'image') return el.getAttribute('src') || '';
    if (t === 'attr') return el.getAttribute(el.dataset.cmsAttr) || '';
    if (t === 'icon') return el.getAttribute('data-lucide') || '';
    if (t === 'link') return { text: el.textContent.trim(), href: el.getAttribute('href') || '' };
    if (t === 'html') return el.innerHTML.trim();
    if (t === 'lines') return [...el.children].map(c => (c.querySelector('[data-cms-text]') || c).textContent.trim());
    return el.textContent.trim();
  }
  function writeEl(el, v) {
    const t = typeOf(el);
    if (t === 'image') { if (v) el.setAttribute('src', v); return; }
    if (t === 'attr') { el.setAttribute(el.dataset.cmsAttr, v); return; }
    if (t === 'icon') { el.setAttribute('data-lucide', v); return; }
    if (t === 'link') { if (v && typeof v === 'object') { el.textContent = v.text; el.setAttribute('href', v.href); } return; }
    if (t === 'html') { el.innerHTML = v; return; }
    if (t === 'lines') {
      if (!Array.isArray(v)) return; const proto = el.firstElementChild; if (!proto) return; const tpl = proto.cloneNode(true); el.innerHTML = '';
      v.forEach(line => { const n = tpl.cloneNode(true); const tgt = n.querySelector('[data-cms-text]'); if (tgt) tgt.textContent = line; else { [...n.childNodes].filter(x => x.nodeType === 3).forEach(x => x.remove()); n.appendChild(document.createTextNode(' ' + line)); } el.appendChild(n); });
      return;
    }
    el.textContent = v;
  }

  /* ---------- apply stored content to a document ---------- */
  const fieldsIn = el => (el.hasAttribute('data-cms-field') ? [el] : []).concat([...el.querySelectorAll('[data-cms-field]')]); // fields in a list item, incl. the item itself
  function apply(data, root) {
    root = root || document;
    if (!data || !Object.keys(data).length) return;
    root.querySelectorAll('[data-cms]').forEach(el => { const k = el.dataset.cms; if (k in data) writeEl(el, data[k]); });
    root.querySelectorAll('[data-cms-list]').forEach(list => {
      const items = data[list.dataset.cmsList]; if (!Array.isArray(items)) return;
      const proto = list.firstElementChild; if (!proto) return; const tpl = proto.cloneNode(true); list.innerHTML = '';
      items.forEach(it => { const n = tpl.cloneNode(true); fieldsIn(n).forEach(f => { const fk = f.dataset.cmsField; if (fk in it) writeEl(f, it[fk]); }); list.appendChild(n); });
    });
  }

  /* ---------- build an editor schema from a page's DOM (used by the admin) ---------- */
  function schema(doc) {
    const sections = []; const byName = {};
    const sec = el => { const s = el.closest('[data-cms-section]'); const name = s ? s.dataset.cmsSection : 'General'; if (!byName[name]) { byName[name] = { name, fields: [] }; sections.push(byName[name]); } return byName[name]; };
    const fieldOf = (el, key, labelAttr) => ({ key, type: typeOf(el), label: el.dataset[labelAttr] || el.dataset.cmsLabel || key.split('.').pop().replace(/[-_]/g, ' '), value: readEl(el), hint: el.dataset.cmsHint || '' });
    doc.querySelectorAll('[data-cms], [data-cms-list]').forEach(el => {
      if (el.closest('[data-cms-list] > *') && !el.hasAttribute('data-cms-list')) return; // fields inside list items are handled by the list
      if (el.hasAttribute('data-cms-list')) {
        const key = el.dataset.cmsList; const proto = el.firstElementChild; if (!proto) return;
        const fields = fieldsIn(proto).map(f => ({ key: f.dataset.cmsField, type: typeOf(f), label: f.dataset.cmsLabel || f.dataset.cmsField.replace(/[-_]/g, ' '), hint: f.dataset.cmsHint || '' }));
        const items = [...el.children].map(item => { const o = {}; fieldsIn(item).forEach(f => { o[f.dataset.cmsField] = readEl(f); }); return o; });
        sec(el).fields.push({ key, type: 'list', label: el.dataset.cmsLabel || key.split('.').pop().replace(/[-_]/g, ' '), fields, value: items, hint: el.dataset.cmsHint || '' });
      } else {
        sec(el).fields.push(fieldOf(el, el.dataset.cms));
      }
    });
    return sections;
  }

  const CMS = {
    PAGES,
    pageKey() { return document.body.dataset.cmsPage || document.body.dataset.page || ''; },
    // Public, unauthenticated read of one page's admin-edited content.
    async get(page) {
      try {
        const r = await fetch('/api/content/' + encodeURIComponent(page), { headers: { Accept: 'application/json' } });
        if (!r.ok) return {};
        const d = await r.json();
        return (d && typeof d === 'object') ? d : {};
      } catch (e) { return {}; }
    },
    apply, schema, readEl, writeEl, typeOf
  };
  window.HeirsCMS = CMS;

  // Public pages: fetch and apply saved content as soon as the DOM is ready
  // (script sits at the end of <body>). Admin pages load this file for
  // PAGES/apply/schema only and never call boot's fetch path.
  async function boot() {
    if (!document.body || document.body.dataset.admin) return;
    const key = CMS.pageKey();
    if (key) apply(await CMS.get(key));
    // Live preview from the admin editor (same-origin iframe)
    window.addEventListener('message', e => { if (e.data && e.data.type === 'heirs-cms-preview' && e.data.page === key) { apply(e.data.data); if (window.lucide) lucide.createIcons(); } });
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
