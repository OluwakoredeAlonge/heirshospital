/* ==========================================================================
   Heirs Multispecialist Hospital, shared site behaviour
   Injects the top bar, header, footer and floating actions, then wires up
   navigation, reveal animations, counters, tabs and the marquee.
   Set <body data-page="index"> to highlight the active nav item.
   ========================================================================== */
(function () {
  'use strict';

  const SITE = {
    name: 'Heirs Multispecialist Hospital',
    short: 'Heirs',
    tagline: 'Your Caring Family Hospital',
    phone: '+234 803 638 6440',
    phoneHref: 'tel:+2348036386440',
    phone2: '+234 704 248 1085',
    phone2Href: 'tel:+2347042481085',
    whatsapp: 'https://wa.me/2347042481085?text=Hello%20Heirs%20Hospital%2C%20I%20would%20like%20to%20book%20an%20appointment.',
    email: 'contact@heirsspecialisthospital.com.ng',
    oye: 'Beside Aluko House, Irare Estate, Oye-Ekiti, Ekiti State',
    ado: 'Plot 3, Orimolade Crescent, Ilokun Estate, Ado-Ekiti, Ekiti State',
    mapsOye: 'https://www.google.com/maps/search/Heirs+Specialist+Hospital%2C+Beside+Aluko+House%2C+Irare+Estate%2C+Oye-Ekiti%2C+Ekiti+State',
    mapsAdo: 'https://www.google.com/maps/search/Plot+3+Orimolade+Crescent+Ilokun+Estate+Ado-Ekiti',
    facebook: 'https://www.facebook.com/heirshospitaloyeekiti',
    twitter: 'https://x.com/heirsh60940',
    instagram: 'https://www.instagram.com/dranthoniasoje',
    youtube: 'https://www.youtube.com/@fosterproject2425',
    hoursShort: 'Mon–Fri 8am–8pm · Emergency 24/7',
    footerBlurb: 'A world-class specialist hospital in Ekiti State, bringing the best of medical practice home and ending the need for medical tourism.',
    credit: 'MASYS',
    year: new Date().getFullYear()
  };
  // Site-wide settings edited from the admin portal (Site settings) override the defaults above
  if (window.HeirsCMS) { const o = window.HeirsCMS.get('site'); Object.keys(o).forEach(k => { if (k in SITE && o[k] !== '' && o[k] != null) SITE[k] = o[k]; }); }
  window.HEIRS = SITE;

  const LOGO = `
<svg class="brand-mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1663D6"/><stop offset="1" stop-color="#14B8A6"/></linearGradient></defs>
  <rect width="48" height="48" rx="14" fill="url(#hg)"/>
  <path d="M24 13.5c-3.6-4.2-10.5-2.7-10.5 3.3 0 4.8 6.5 9.6 10.5 13.2 4-3.6 10.5-8.4 10.5-13.2 0-6-6.9-7.5-10.5-3.3z" fill="#fff" opacity=".96"/>
  <path d="M10 34h6.5l2.5-5 4 10 3-7 2 2H37" stroke="#F2B84B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  const NAV = [
    { key: 'index', label: 'Home', href: 'index.html' },
    {
      key: 'about', label: 'About', href: 'about.html',
      menu: [
        { key: 'about', icon: 'building-2', t: 'About the Hospital', d: 'Our story, mission & values', href: 'about.html' },
        { key: 'founders', icon: 'users', t: 'Our Founders', d: 'Dr. Michael & Dr. Anthonia Soje', href: 'about.html#founders' },
        { key: 'testimonial', icon: 'message-square-heart', t: 'Patient Stories', d: 'What our patients say', href: 'testimonial.html' },
        { key: 'faq', icon: 'circle-help', t: 'FAQs', d: 'Answers to common questions', href: 'faq.html' }
      ]
    },
    {
      key: 'care', label: 'Our Care', href: 'services.html', wide: true,
      menu: [
        { key: 'services', icon: 'stethoscope', t: 'Medical Services', d: 'Dialysis, CT scan, surgery, dental & more', href: 'services.html' },
        { key: 'department', icon: 'layout-grid', t: 'Departments', d: 'Specialist units across two branches', href: 'department.html' },
        { key: 'emergency', icon: 'siren', t: 'Emergency & ICU', d: '24/7 critical care, ambulance', href: 'services.html#emergency' },
        { key: 'facilities', icon: 'hospital', t: 'Facilities', d: '50-bed hospital, solar-powered', href: 'about.html#facilities' },
        { key: 'book', icon: 'calendar-check', t: 'Book an Appointment', d: 'Online or by phone', href: 'contact.html#book' },
        { key: 'nhis', icon: 'shield-check', t: 'NHIS & Insurance', d: 'Accredited provider', href: 'faq.html#payments' }
      ]
    },
    {
      key: 'programmes', label: 'Programmes', href: 'fosterheirs.html',
      menu: [
        { key: 'fosterheirs', icon: 'brain', t: 'Fosterheirs Mental Health', d: 'Therapy, addiction recovery & coaching', href: 'fosterheirs.html' },
        { key: 'heirs-institute', icon: 'graduation-cap', t: 'Heirs Institute of Allied Health', d: 'Accredited health training', href: 'heirs-institute.html' },
        { key: 'methuselah', icon: 'heart-handshake', t: 'Methuselah Project', d: 'Free care for elders 65+', href: 'methuselah.html' }
      ]
    },
    { key: 'blog', label: 'Health Blog', href: 'blog.html' },
    { key: 'contact', label: 'Contact', href: 'contact.html' }
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

  /* ---------------- Top bar ---------------- */
  function topbar() {
    return `
<div class="topbar">
  <div class="wrap">
    <div class="tb-left">
      <a class="tb-item" href="${SITE.phoneHref}">${i('phone')} ${SITE.phone}</a>
      <a class="tb-item tb-hide-m" href="mailto:${SITE.email}">${i('mail')} ${SITE.email}</a>
      <span class="tb-item tb-hide-m">${i('clock')} ${SITE.hoursShort}</span>
    </div>
    <div class="tb-right">
      <span class="tb-item tb-hide-m">${i('map-pin')} Oye-Ekiti · Ado-Ekiti</span>
      <div class="tb-social">
        <a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${b('facebook')}</a>
        <a href="${SITE.twitter}" target="_blank" rel="noopener" aria-label="X (Twitter)">${b('twitter')}</a>
      </div>
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
    <a href="index.html" class="brand" aria-label="${SITE.name}">
      ${LOGO}
      <span><span class="brand-name">Heirs</span><span class="brand-sub">Multispecialist Hospital</span></span>
    </a>
    <ul class="nav">${items}</ul>
    <div class="header-cta">
      <a href="contact.html#book" class="btn btn-primary btn-sm">${i('calendar-check')} Book Appointment</a>
      <a href="${SITE.phoneHref}" class="btn btn-emergency btn-sm hidden xl:inline-flex">${i('siren')} Emergency</a>
      <button class="burger" id="burger" aria-label="Open menu">${i('menu')}</button>
    </div>
  </div>
</header>
<div class="drawer-overlay" id="drawerOverlay"></div>
<aside class="drawer" id="drawer" aria-label="Mobile navigation">
  <div class="drawer-head">
    <a href="index.html" class="brand">${LOGO}<span><span class="brand-name">Heirs</span><span class="brand-sub">Multispecialist Hospital</span></span></a>
    <button class="burger" id="drawerClose" aria-label="Close menu" style="display:grid">${i('x')}</button>
  </div>
  <nav class="drawer-body">
    <a href="index.html" class="${page === 'index' ? 'active' : ''}">${i('home')} Home</a>
    <span class="dl">About</span>
    <a href="about.html" class="${page === 'about' ? 'active' : ''}">${i('building-2')} About the Hospital</a>
    <a href="about.html#founders">${i('users')} Our Founders</a>
    <a href="testimonial.html" class="${page === 'testimonial' ? 'active' : ''}">${i('message-square-heart')} Patient Stories</a>
    <a href="faq.html" class="${page === 'faq' ? 'active' : ''}">${i('circle-help')} FAQs</a>
    <span class="dl">Our Care</span>
    <a href="services.html" class="${page === 'services' ? 'active' : ''}">${i('stethoscope')} Medical Services</a>
    <a href="department.html" class="${page === 'department' ? 'active' : ''}">${i('layout-grid')} Departments</a>
    <a href="services.html#emergency">${i('siren')} Emergency & ICU</a>
    <span class="dl">Programmes</span>
    <a href="fosterheirs.html" class="${page === 'fosterheirs' ? 'active' : ''}">${i('brain')} Fosterheirs Mental Health</a>
    <a href="heirs-institute.html" class="${page === 'heirs-institute' ? 'active' : ''}">${i('graduation-cap')} Heirs Institute</a>
    <a href="methuselah.html" class="${page === 'methuselah' ? 'active' : ''}">${i('heart-handshake')} Methuselah Project</a>
    <span class="dl">More</span>
    <a href="blog.html" class="${page === 'blog' ? 'active' : ''}">${i('newspaper')} Health Blog</a>
    <a href="contact.html" class="${page === 'contact' ? 'active' : ''}">${i('mail')} Contact Us</a>
  </nav>
  <div class="drawer-foot">
    <a href="contact.html#book" class="btn btn-primary btn-block">${i('calendar-check')} Book Appointment</a>
    <a href="${SITE.phoneHref}" class="btn btn-emergency btn-block">${i('phone-call')} Emergency: ${SITE.phone}</a>
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
        <a href="index.html" class="brand mb-5">${LOGO}<span><span class="brand-name" style="color:#fff">Heirs</span><span class="brand-sub" style="color:var(--gold-500)">Multispecialist Hospital</span></span></a>
        <p class="text-sm leading-relaxed mb-6" style="max-width:34ch">${SITE.tagline}. ${SITE.footerBlurb}</p>
        <div class="f-emergency">
          <div class="ic">${i('siren')}</div>
          <div><strong>24/7 Emergency Line</strong><span><a href="${SITE.phoneHref}">${SITE.phone}</a> · Ambulance available</span></div>
        </div>
        <div class="f-social">
          <a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${b('facebook')}</a>
          <a href="${SITE.twitter}" target="_blank" rel="noopener" aria-label="X">${b('twitter')}</a>
          <a href="${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${b('whatsapp')}</a>
        </div>
      </div>
      <div class="lg:col-span-2">
        <h4>Hospital</h4>
        <ul class="f-links">
          <li><a href="about.html">About Us</a></li>
          <li><a href="services.html">Medical Services</a></li>
          <li><a href="department.html">Departments</a></li>
          <li><a href="testimonial.html">Patient Stories</a></li>
          <li><a href="blog.html">Health Blog</a></li>
          <li><a href="faq.html">FAQs</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="lg:col-span-3">
        <h4>Programmes & Services</h4>
        <ul class="f-links">
          <li><a href="fosterheirs.html">Fosterheirs Mental Health</a></li>
          <li><a href="heirs-institute.html">Heirs Institute of Allied Health</a></li>
          <li><a href="methuselah.html">Methuselah Project (Elders 65+)</a></li>
          <li><a href="services.html#dialysis">Renal Dialysis</a></li>
          <li><a href="services.html#imaging">CT Scan & Radiology</a></li>
          <li><a href="services.html#dental">Dental Clinic</a></li>
          <li><a href="services.html#emergency">Emergency & ICU</a></li>
        </ul>
      </div>
      <div class="lg:col-span-3">
        <h4>Find Us</h4>
        <ul class="f-contact">
          <li>${i('map-pin')}<span><strong>Oye-Ekiti (Main)</strong>${SITE.oye}</span></li>
          <li>${i('map-pin')}<span><strong>Ado-Ekiti Branch</strong>${SITE.ado}</span></li>
          <li>${i('phone')}<span><strong>Call / WhatsApp</strong><a href="${SITE.phoneHref}">${SITE.phone}</a><br><a href="${SITE.phone2Href}">${SITE.phone2}</a></span></li>
          <li>${i('mail')}<span><strong>Email</strong><a href="mailto:${SITE.email}">${SITE.email}</a></span></li>
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
        <a href="privacy_policy.html">Privacy Policy</a>
        <a href="privacy_policy.html#terms">Terms of Use</a>
        <a href="faq.html">Patient Rights</a>
        <span>Designed by <span class="font-semibold" style="color:var(--gold-500)">${SITE.credit}</span></span>
      </div>
    </div>
  </div>
</footer>
<div class="fab-stack">
  <a href="#top" class="fab fab-top" id="toTop" aria-label="Back to top">${i('arrow-up')}</a>
  <a href="${SITE.whatsapp}" target="_blank" rel="noopener" class="fab fab-wa" aria-label="Chat on WhatsApp">${b('whatsapp')}</a>
  <a href="${SITE.phoneHref}" class="fab fab-call" aria-label="Call emergency line">${i('phone-call')}</a>
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
    };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

    // Reveal on scroll
    const t0 = performance.now();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        // Content already on screen at load appears instantly (no fade), better LCP and hash-link landings
        if (performance.now() - t0 < 1200) { el.style.transition = 'none'; el.querySelectorAll(':scope > *').forEach(c => c.style.transition = 'none'); }
        el.classList.add('in'); io.unobserve(el);
        if (el.style.transition) requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = ''; el.querySelectorAll(':scope > *').forEach(c => c.style.transition = ''); }));
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .stagger').forEach(el => io.observe(el));

    // Counters: <span data-count="16612" data-suffix="+">0</span>
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return; cio.unobserve(en.target);
        const el = en.target, end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', pre = el.dataset.prefix || '';
        const dec = (el.dataset.count.split('.')[1] || '').length; const dur = 1600; const t0 = performance.now();
        const step = now => {
          const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + (end * e).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
