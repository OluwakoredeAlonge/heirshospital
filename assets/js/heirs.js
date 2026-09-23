/* ==========================================================================
   Heirs Multispecialist Hospital, shared site behaviour
   Injects the top bar, header, footer and floating actions, then wires up
   navigation, counters, tabs and the marquee.
   Set <body data-page="index"> to highlight the active nav item.
   ========================================================================== */
(function () {
  'use strict';

  const SITE = {
    name: 'Heirs Multispecialist Hospital',
    short: 'Heirs',
    tagline: 'Your Caring Family Hospital',
    phone: '+234 708 562 5854',
    phoneHref: 'tel:+2347085625854',
    phone2: '+234 704 248 1085',
    phone2Href: 'tel:+2347042481085',
    whatsapp: 'https://wa.me/2347042481085?text=Hello%20Heirs%20Hospital%2C%20I%20would%20like%20to%20book%20an%20appointment.',
    email: 'contact@heirsspecialisthospital.com.ng',
    oye: 'Beside Aluko House, Irare Estate, Oye-Ekiti, Ekiti State',
    oyePhone: '09165910965',
    oyePhoneHref: 'tel:09165910965',
    ado: 'Plot 3, Orimolade Crescent, Ilokun Estate, Ado-Ekiti, Ekiti State',
    adoPhone: '0704 899 0112',
    adoPhoneHref: 'tel:07048990112',
    mapsOye: 'https://www.google.com/maps/search/Heirs+Specialist+Hospital%2C+Beside+Aluko+House%2C+Irare+Estate%2C+Oye-Ekiti%2C+Ekiti+State',
    mapsAdo: 'https://www.google.com/maps/search/Plot+3+Orimolade+Crescent+Ilokun+Estate+Ado-Ekiti',
    facebook: 'https://www.facebook.com/heirshospitaloyeekiti',
    twitter: 'https://x.com/heirsh60940',
    instagram: 'https://www.instagram.com/dranthoniasoje',
    youtube: 'https://www.youtube.com/@fosterproject2425',
    hoursShort: 'Mon–Fri 8am–8pm · Emergency 24/7',
    footerBlurb: 'A world-class specialist hospital in Ekiti State, bringing the best of medical practice home and ending the need for medical tourism.',
    credit: 'MASYS',
    year: new Date().getFullYear(),
    logo: '', foundersPhoto: ''
  };
  window.HEIRS = SITE;
  // Wrap a block in `hide(value, html)` to render nothing at all when a customisable
  // field has been cleared, instead of showing an empty link/icon/label.
  const hide = (v, html) => (v && String(v).trim()) ? html : '';

  // Shared "this button is working" state for every public form's submit
  // button (contact, heirs-institute, methuselah): a spinner replaces the
  // icon and the button can't be clicked again mid-request, so a slow
  // response or a double-click can never fire the same submission twice.
  window.HeirsUI = {
    busy(btn, active) {
      if (!btn) return;
      if (active) {
        if (btn.dataset.busy) return;
        btn.dataset.busy = '1';
        btn.dataset.busyRestore = btn.innerHTML;
        btn.innerHTML = '<span class="btn-spinner"></span> ' + btn.textContent.trim();
        btn.disabled = true;
      } else {
        if (!btn.dataset.busy) return;
        btn.innerHTML = btn.dataset.busyRestore;
        delete btn.dataset.busy; delete btn.dataset.busyRestore;
        btn.disabled = false;
        if (window.lucide) lucide.createIcons({ nodes: [btn] });
      }
    }
  };

  // Site-wide settings edited from the admin portal (Site settings) override the defaults
  // above - including clearing a field to empty, which hides whatever it powers below (the
  // `hide()` helper) rather than silently falling back to the hardcoded default. HeirsCMS.get
  // is async, so nothing that reads SITE (topbar/header/footer) can render until this
  // resolves - see the bottom of this file, mount() is only called after it settles.
  // A key only appears in `o` once it's been saved at least once, so `k in o` is how a
  // "never customised, keep the default" field is told apart from "customised to blank"
  // (which Laravel's ConvertEmptyStringsToNull middleware stores as null, not '').
  async function loadSiteSettings() {
    if (!window.HeirsCMS) return;
    const o = await window.HeirsCMS.get('site');
    Object.keys(o).forEach(k => { if (k in SITE) SITE[k] = o[k] ?? ''; });
  }

  const logo = () => `<img class="brand-mark" src="${SITE.logo || '/assets/img/logo.png'}" alt="${SITE.name} logo">`;

  const NAV = [
    { key: 'index', label: 'Home', href: '/' },
    {
      key: 'about', label: 'About', href: '/about',
      menu: [
        { key: 'about', icon: 'building-2', t: 'About the Hospital', d: 'Our story, mission & values', href: '/about' },
        { key: 'founders', icon: 'users', t: 'Our Founders', d: 'Dr. Michael & Dr. Anthonia Soje', href: '/about#founders' },
        { key: 'testimonial', icon: 'message-square-heart', t: 'Patient Stories', d: 'What our patients say', href: '/testimonial' },
        { key: 'faq', icon: 'circle-help', t: 'FAQs', d: 'Answers to common questions', href: '/faq' }
      ]
    },
    {
      key: 'care', label: 'Our Care', href: '/services', wide: true,
      menu: [
        { key: 'services', icon: 'stethoscope', t: 'Medical Services', d: 'Dialysis, CT scan, surgery, dental & more', href: '/services' },
        { key: 'department', icon: 'layout-grid', t: 'Departments', d: 'Specialist units across two branches', href: '/department' },
        { key: 'emergency', icon: 'siren', t: 'Emergency & ICU', d: '24/7 critical care, ambulance', href: '/services#emergency' },
        { key: 'facilities', icon: 'hospital', t: 'Facilities', d: '50-bed hospital, solar-powered', href: '/about#facilities' },
        { key: 'book', icon: 'calendar-check', t: 'Book an Appointment', d: 'Online or by phone', href: '/contact#book' },
        { key: 'nhis', icon: 'shield-check', t: 'NHIS & Insurance', d: 'Accredited provider', href: '/faq#payments' }
      ]
    },
    {
      key: 'programmes', label: 'Programmes', href: '/fosterheirs',
      menu: [
        { key: 'fosterheirs', icon: 'brain', t: 'Fosterheirs Mental Health', d: 'Therapy, addiction recovery & coaching', href: '/fosterheirs' },
        { key: 'heirs-institute', icon: 'graduation-cap', t: 'Heirs Institute of Allied Health', d: 'Accredited health training', href: '/heirs-institute' },
        { key: 'methuselah', icon: 'heart-handshake', t: 'Methuselah Project', d: 'Free care for elders 65+', href: '/methuselah' }
      ]
    },
    { key: 'blog', label: 'Health Blog', href: '/blog' },
    { key: 'contact', label: 'Contact', href: '/contact' }
  ];

  const page = document.body.dataset.page || '';
  const i = (name, cls = '') => `<i data-lucide="${name}" class="${cls}"></i>`;

  // Brand icons (Lucide no longer ships these)
  const BRAND = {
    facebook: '<path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/>',
    twitter: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
    instagram: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>',
    youtube: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
    whatsapp: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>'
  };
  const b = name => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${BRAND[name]}</svg>`;

  // Shared social-icon row: each icon only renders if its URL is actually set,
  // so an unset/cleared profile just doesn't appear rather than linking nowhere.
  function socialIcons() {
    return hide(SITE.facebook, `<a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${b('facebook')}</a>`)
      + hide(SITE.twitter, `<a href="${SITE.twitter}" target="_blank" rel="noopener" aria-label="X (Twitter)">${b('twitter')}</a>`)
      + hide(SITE.instagram, `<a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${b('instagram')}</a>`)
      + hide(SITE.youtube, `<a href="${SITE.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${b('youtube')}</a>`);
  }

  /* ---------------- Top bar ---------------- */
  function topbar() {
    return `
<div class="topbar">
  <div class="wrap">
    <div class="tb-left">
      ${hide(SITE.phone, `<a class="tb-item" href="${SITE.phoneHref}">${i('phone')} ${SITE.phone}</a>`)}
      ${hide(SITE.email, `<a class="tb-item tb-hide-m" href="mailto:${SITE.email}">${i('mail')} ${SITE.email}</a>`)}
      ${hide(SITE.hoursShort, `<span class="tb-item tb-hide-m">${i('clock')} ${SITE.hoursShort}</span>`)}
    </div>
    <div class="tb-right">
      <span class="tb-item tb-hide-m">${i('map-pin')} Oye-Ekiti · Ado-Ekiti</span>
      <div class="tb-social">${socialIcons()}</div>
    </div>
  </div>
</div>`;
  }

  /* ---------------- Header ---------------- */
  function header() {
    const items = NAV.map(n => {
      const active = n.key === page || (n.menu && n.menu.some(m => m.key === page));
      if (!n.menu) {
        return `<li class="${active ? 'active' : ''}"><a href="${n.href}">${n.label}</a></li>`;
      }
      const menu = n.menu.map(m => `
        <a href="${m.href}" class="${m.key === page ? 'active' : ''}">
          <span class="mi">${i(m.icon)}</span>
          <span><span class="mt">${m.t}</span><span class="md">${m.d}</span></span>
        </a>`).join('');
      return `<li class="${active ? 'active' : ''}">
        <button type="button" aria-haspopup="true">${n.label} ${i('chevron-down', 'chev')}</button>
        <div class="menu ${n.wide ? 'wide' : ''}">${menu}</div>
      </li>`;
    }).join('');

    return `
<header class="site-header" id="siteHeader">
  <div class="wrap">
    <a href="/" class="brand" aria-label="${SITE.name}">
      ${logo()}
      <span><span class="brand-name">Heirs</span><span class="brand-sub">Multispecialist Hospital</span></span>
    </a>
    <ul class="nav">${items}</ul>
    <div class="header-cta">
      <a href="/contact#book" class="btn btn-primary btn-sm">${i('calendar-check')} Book Appointment</a>
      ${hide(SITE.phone, `<a href="${SITE.phoneHref}" class="btn btn-emergency btn-sm hidden xl:inline-flex">${i('siren')} Emergency</a>`)}
      <button class="burger" id="burger" aria-label="Open menu">${i('menu')}</button>
    </div>
  </div>
</header>
<div class="drawer-overlay" id="drawerOverlay"></div>
<aside class="drawer" id="drawer" aria-label="Mobile navigation">
  <div class="drawer-head">
    <a href="/" class="brand">${logo()}<span><span class="brand-name">Heirs</span><span class="brand-sub">Multispecialist Hospital</span></span></a>
    <button class="burger" id="drawerClose" aria-label="Close menu" style="display:grid">${i('x')}</button>
  </div>
  <nav class="drawer-body">
    <a href="/" class="${page === 'index' ? 'active' : ''}">${i('home')} Home</a>
    <span class="dl">About</span>
    <a href="/about" class="${page === 'about' ? 'active' : ''}">${i('building-2')} About the Hospital</a>
    <a href="/about#founders">${i('users')} Our Founders</a>
    <a href="/testimonial" class="${page === 'testimonial' ? 'active' : ''}">${i('message-square-heart')} Patient Stories</a>
    <a href="/faq" class="${page === 'faq' ? 'active' : ''}">${i('circle-help')} FAQs</a>
    <span class="dl">Our Care</span>
    <a href="/services" class="${page === 'services' ? 'active' : ''}">${i('stethoscope')} Medical Services</a>
    <a href="/department" class="${page === 'department' ? 'active' : ''}">${i('layout-grid')} Departments</a>
    <a href="/services#emergency">${i('siren')} Emergency & ICU</a>
    <span class="dl">Programmes</span>
    <a href="/fosterheirs" class="${page === 'fosterheirs' ? 'active' : ''}">${i('brain')} Fosterheirs Mental Health</a>
    <a href="/heirs-institute" class="${page === 'heirs-institute' ? 'active' : ''}">${i('graduation-cap')} Heirs Institute</a>
    <a href="/methuselah" class="${page === 'methuselah' ? 'active' : ''}">${i('heart-handshake')} Methuselah Project</a>
    <span class="dl">More</span>
    <a href="/blog" class="${page === 'blog' ? 'active' : ''}">${i('newspaper')} Health Blog</a>
    <a href="/contact" class="${page === 'contact' ? 'active' : ''}">${i('mail')} Contact Us</a>
  </nav>
  <div class="drawer-foot">
    <a href="/contact#book" class="btn btn-primary btn-block">${i('calendar-check')} Book Appointment</a>
    ${hide(SITE.phone, `<a href="${SITE.phoneHref}" class="btn btn-emergency btn-block">${i('phone-call')} Emergency: ${SITE.phone}</a>`)}
  </div>
</aside>`;
  }

  /* ---------------- Footer ---------------- */
  function footer() {
    return `
<footer class="site-footer">
  <div class="wrap">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pt-16 pb-12">
      <div class="lg:col-span-4">
        <a href="/" class="brand mb-5">${logo()}<span><span class="brand-name" style="color:#fff">Heirs</span><span class="brand-sub" style="color:var(--gold-500)">Multispecialist Hospital</span></span></a>
        ${hide(SITE.tagline || SITE.footerBlurb, `<p class="text-sm leading-relaxed mb-6" style="max-width:34ch">${[SITE.tagline, SITE.footerBlurb].filter(Boolean).join('. ')}</p>`)}
        ${hide(SITE.phone, `<div class="f-emergency">
          <div class="ic">${i('siren')}</div>
          <div><strong>24/7 Emergency Line</strong><span><a href="${SITE.phoneHref}">${SITE.phone}</a> · Ambulance available</span></div>
        </div>`)}
        <div class="f-social">
          ${hide(SITE.facebook, `<a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${b('facebook')}</a>`)}
          ${hide(SITE.twitter, `<a href="${SITE.twitter}" target="_blank" rel="noopener" aria-label="X">${b('twitter')}</a>`)}
          ${hide(SITE.instagram, `<a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${b('instagram')}</a>`)}
          ${hide(SITE.youtube, `<a href="${SITE.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${b('youtube')}</a>`)}
          ${hide(SITE.whatsapp, `<a href="${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${b('whatsapp')}</a>`)}
        </div>
      </div>
      <div class="lg:col-span-2">
        <h4>Hospital</h4>
        <ul class="f-links">
          <li><a href="/about">About Us</a></li>
          <li><a href="/services">Medical Services</a></li>
          <li><a href="/department">Departments</a></li>
          <li><a href="/testimonial">Patient Stories</a></li>
          <li><a href="/blog">Health Blog</a></li>
          <li><a href="/faq">FAQs</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      <div class="lg:col-span-3">
        <h4>Programmes & Services</h4>
        <ul class="f-links">
          <li><a href="/fosterheirs">Fosterheirs Mental Health</a></li>
          <li><a href="/heirs-institute">Heirs Institute of Allied Health</a></li>
          <li><a href="/methuselah">Methuselah Project (Elders 65+)</a></li>
          <li><a href="/services#dialysis">Renal Dialysis</a></li>
          <li><a href="/services#imaging">CT Scan & Radiology</a></li>
          <li><a href="/services#dental">Dental Clinic</a></li>
          <li><a href="/services#emergency">Emergency & ICU</a></li>
        </ul>
      </div>
      <div class="lg:col-span-3">
        <h4>Find Us</h4>
        <ul class="f-contact">
          ${hide(SITE.oye, `<li>${i('map-pin')}<span><strong>Oye-Ekiti (Main)</strong>${SITE.oye}${hide(SITE.oyePhone, `<br><a href="${SITE.oyePhoneHref}">${SITE.oyePhone}</a>`)}</span></li>`)}
          ${hide(SITE.ado, `<li>${i('map-pin')}<span><strong>Ado-Ekiti Branch</strong>${SITE.ado}${hide(SITE.adoPhone, `<br><a href="${SITE.adoPhoneHref}">${SITE.adoPhone}</a>`)}</span></li>`)}
          ${hide(SITE.phone || SITE.phone2, `<li>${i('phone')}<span><strong>Call / WhatsApp</strong>${hide(SITE.phone, `<a href="${SITE.phoneHref}">${SITE.phone}</a>`)}${SITE.phone && SITE.phone2 ? '<br>' : ''}${hide(SITE.phone2, `<a href="${SITE.phone2Href}">${SITE.phone2}</a>`)}</span></li>`)}
          ${hide(SITE.email, `<li>${i('mail')}<span><strong>Email</strong><a href="mailto:${SITE.email}">${SITE.email}</a></span></li>`)}
        </ul>
        <form class="f-newsletter" onsubmit="event.preventDefault(); this.querySelector('input').value=''; alert('Thank you for subscribing to Heirs health updates.');">
          <input type="email" placeholder="Get health tips by email" required aria-label="Email address">
          <button type="submit" aria-label="Subscribe">${i('send')}</button>
        </form>
      </div>
    </div>
    <div class="f-bottom">
      <p>© ${SITE.year} ${SITE.name}. All rights reserved. NHIS Accredited Provider.</p>
      <div class="legal">
        <a href="/privacy">Privacy Policy</a>
        <a href="/privacy#terms">Terms of Use</a>
        <a href="/faq">Patient Rights</a>
        <span>Designed by <span class="font-semibold" style="color:var(--gold-500)">${SITE.credit}</span></span>
      </div>
    </div>
  </div>
</footer>
<div class="fab-stack">
  <a href="#top" class="fab fab-top" id="toTop" aria-label="Back to top">${i('arrow-up')}</a>
  ${hide(SITE.whatsapp, `<a href="${SITE.whatsapp}" target="_blank" rel="noopener" class="fab fab-wa" aria-label="Chat on WhatsApp">${b('whatsapp')}</a>`)}
  ${hide(SITE.phone, `<a href="${SITE.phoneHref}" class="fab fab-call" aria-label="Call emergency line">${i('phone-call')}</a>`)}
</div>`;
  }

  /* ---------------- Mount ---------------- */
  function mount() {
    const head = document.getElementById('site-header');
    const foot = document.getElementById('site-footer');
    if (head) head.outerHTML = topbar() + header();
    if (foot) foot.outerHTML = footer();
    document.body.id = document.body.id || 'top';

    // Fill any [data-site] tokens, e.g. <span data-site="phone"></span>
    document.querySelectorAll('[data-site]').forEach(el => {
      const key = el.dataset.site; if (SITE[key] != null) el.textContent = SITE[key];
    });
    // Images that are a single site-wide asset (logo, founders photo) rather than
    // per-page CMS content, e.g. <img data-site-img="foundersPhoto" src="...default...">.
    // Only swapped when an admin has actually uploaded one - otherwise the page's own
    // baked-in default image keeps showing, same "no generic fallback" rule as data-site.
    document.querySelectorAll('[data-site-img]').forEach(el => {
      const key = el.dataset.siteImg; if (SITE[key]) el.setAttribute('src', SITE[key]);
    });
    document.querySelectorAll('[data-site-href]').forEach(el => {
      const key = el.dataset.siteHref; if (SITE[key]) el.setAttribute('href', SITE[key]);
    });

    if (window.lucide) lucide.createIcons();
    wire();
  }

  function wire() {
    const hdr = document.getElementById('siteHeader');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawerOverlay');
    const toTop = document.getElementById('toTop');
    const fabWa = document.querySelector('.fab-wa');
    const fabCall = document.querySelector('.fab-call');
    const open = () => { drawer.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const close = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; };
    document.getElementById('burger')?.addEventListener('click', open);
    document.getElementById('drawerClose')?.addEventListener('click', close);
    overlay?.addEventListener('click', close);
    drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    const onScroll = () => {
      const y = window.scrollY;
      hdr?.classList.toggle('scrolled', y > 8);
      toTop?.classList.toggle('show', y > 600);
      // Only matters below the tablet breakpoint (see .fab-wa/.fab-call in
      // heirs.css) - on wider screens these are always visible.
      fabWa?.classList.toggle('show', y > 350);
      fabCall?.classList.toggle('show', y > 350);
    };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

    // Everything is visible immediately (no scroll-triggered reveal). The "in" class is
    // still added so any styling that keys off it applies at once.
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .stagger').forEach(el => el.classList.add('in'));

    // Counters: <span data-count="16612" data-suffix="+">0</span> render their final value at once
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', pre = el.dataset.prefix || '';
      const dec = (el.dataset.count.split('.')[1] || '').length;
      el.textContent = pre + end.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    });

    // Image lightbox: every content image opens full-size so visitors can look closely
    (function () {
      const skip = el => el.closest('.site-header, .site-footer, .topbar, .drawer, .brand, .lb') || el.getAttribute('aria-hidden') === 'true' || el.closest('.hero-bg') || el.dataset.noLightbox !== undefined;
      const imgs = () => [...document.querySelectorAll('main img, section img, article img, aside img')].filter(im => !skip(im) && (im.naturalWidth || im.getAttribute('width') || 200) >= 120);
      const el = document.createElement('div'); el.className = 'lb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Image viewer');
      el.innerHTML = `<span class="lb-count" id="lbCount"></span><button class="lb-close" aria-label="Close">${i('x')}</button><div class="lb-stage"><button class="lb-btn lb-prev" aria-label="Previous image">${i('chevron-left')}</button><img alt=""><button class="lb-btn lb-next" aria-label="Next image">${i('chevron-right')}</button></div><div class="lb-cap"><strong></strong><span></span></div>`;
      document.body.appendChild(el);
      const img = el.querySelector('.lb-stage img'), capT = el.querySelector('.lb-cap strong'), capS = el.querySelector('.lb-cap span'), count = el.querySelector('#lbCount');
      let list = [], n = 0;
      const caption = im => { const c = im.closest('.photo-card, .bcar-slide, .coe, .loc-card, .dept, .post, .blog-mini, .featured, .fac-grid > *') || im.parentElement; const t = c && c.querySelector('.cap strong, .bcar-cap strong, h3, strong'); const sub = c && c.querySelector('.cap span, .bcar-cap span'); return { t: (t && t.textContent.trim()) || im.alt || '', s: sub ? sub.textContent.trim() : (t && im.alt && im.alt !== t.textContent.trim() ? im.alt : '') }; };
      const show = k => { n = (k + list.length) % list.length; const im = list[n]; img.src = im.currentSrc || im.src; img.alt = im.alt; const c = caption(im); capT.textContent = c.t; capS.textContent = c.s; count.textContent = `${n + 1} / ${list.length}`; el.querySelectorAll('.lb-btn').forEach(b => b.style.display = list.length > 1 ? '' : 'none'); };
      const open = im => { list = imgs(); if (!list.includes(im)) list = [im]; show(list.indexOf(im)); el.classList.add('open'); document.body.classList.add('lb-lock'); };
      const close = () => { el.classList.remove('open'); document.body.classList.remove('lb-lock'); };
      document.addEventListener('click', e => {
        const im = e.target.closest('img'); if (!im || !document.contains(im) || skip(im) || el.contains(im)) return;
        if ((im.naturalWidth || 200) < 120) return;
        e.preventDefault(); e.stopPropagation(); open(im);
      }, true);
      el.querySelector('.lb-close').addEventListener('click', close);
      el.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(n - 1); });
      el.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(n + 1); });
      el.addEventListener('click', e => { if (e.target === el || e.target.classList.contains('lb-stage')) close(); });
      document.addEventListener('keydown', e => { if (!el.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(n - 1); if (e.key === 'ArrowRight') show(n + 1); });
      let tx = 0; el.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true }); el.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(dx < 0 ? n + 1 : n - 1); });
      const mark = () => imgs().forEach(im => im.classList.add('lb-img')); mark(); window.addEventListener('load', mark);
      new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
    })();

    // Branch photo carousel(s)
    document.querySelectorAll('.bcar').forEach(car => {
      const slides = () => [...car.querySelectorAll('.bcar-slide')]; const dots = car.querySelector('.bcar-dots'); let n = 0, timer;
      const go = k => { const s = slides(); if (!s.length) return; n = (k + s.length) % s.length; s.forEach((el, j) => el.classList.toggle('on', j === n)); if (dots) [...dots.children].forEach((d, j) => d.classList.toggle('on', j === n)); };
      const build = () => { if (dots) dots.innerHTML = slides().map((_, j) => `<i class="${j === n ? 'on' : ''}"></i>`).join(''); };
      const play = () => { clearInterval(timer); timer = setInterval(() => go(n + 1), +car.dataset.autoplay || 5000); };
      build(); play();
      car.querySelector('.prev')?.addEventListener('click', () => { go(n - 1); play(); });
      car.querySelector('.next')?.addEventListener('click', () => { go(n + 1); play(); });
      car.addEventListener('mouseenter', () => clearInterval(timer)); car.addEventListener('mouseleave', play);
      // slides may be re-rendered by the CMS live preview
      new MutationObserver(() => { build(); go(0); }).observe(car.querySelector('.bcar-track'), { childList: true });
    });

    // Marquee: duplicate content for seamless loop
    document.querySelectorAll('.marquee-track').forEach(t => { t.innerHTML += t.innerHTML; });

    // Tabs: <div class="tabs" data-tabs="x"><button data-tab="a" class="active">…  <div class="tab-panel" data-panel="a">
    document.querySelectorAll('[data-tabs]').forEach(group => {
      const name = group.dataset.tabs;
      group.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
        group.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll(`[data-panel-group="${name}"] .tab-panel, .tab-panel[data-group="${name}"]`).forEach(p => p.classList.toggle('active', p.dataset.panel === btn.dataset.tab));
      }));
    });

    // Smooth anchor offset for sticky header
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(a => a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href')); if (!t) return;
      e.preventDefault(); const y = t.getBoundingClientRect().top + window.scrollY - 90; window.scrollTo({ top: y, behavior: 'smooth' });
    }));

    // Open FAQ item from hash
    if (location.hash) { const d = document.querySelector(location.hash + ' details, details' + location.hash); if (d) d.open = true; }

    if (window.lucide) lucide.createIcons();
  }

  // Start the site-settings fetch immediately (it doesn't need the DOM), then mount once
  // both it and the DOM are ready - so the very first paint of the header/footer already
  // reflects any admin edits, instead of flashing the hardcoded defaults first.
  const siteReady = loadSiteSettings();
  function boot() { siteReady.then(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
