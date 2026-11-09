/* ==========================================================================
   Gallery sharing. The share links themselves are plain server-rendered
   hrefs (they work with no JavaScript); this adds the extras:
   - on devices with the native share sheet (most phones), the Share button
     opens it directly instead of the menu
   - "Copy link" with a confirmation
   - menu open/close (button, outside click, Escape)
   Markup: <div class="gshare" data-share data-url data-title> ... </div>
   ========================================================================== */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('.gshare-menu').forEach(function (m) {
      if (m !== except && !m.hidden) {
        m.hidden = true;
        var b = m.parentElement && m.parentElement.querySelector('[data-share-toggle]');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function copy(url, btn) {
    var done = function () {
      var label = btn.querySelector('[data-copy-label]') || btn;
      var prev = label.textContent;
      label.textContent = 'Link copied';
      setTimeout(function () { label.textContent = prev; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () { fallback(url, done); });
    } else {
      fallback(url, done);
    }
  }
  function fallback(url, done) {
    var t = document.createElement('textarea');
    t.value = url; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch (e) { window.prompt('Copy this link:', url); }
    document.body.removeChild(t);
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-share-toggle]');
    var copyBtn = e.target.closest('[data-share-copy]');
    var native = e.target.closest('[data-share-native]');
    var holder = e.target.closest('[data-share]');

    if (toggle && holder) {
      var data = { title: holder.dataset.title, text: holder.dataset.text || holder.dataset.title, url: holder.dataset.url };
      if (navigator.share) {
        navigator.share(data).catch(function () { /* cancelled */ });
        return;
      }
      var menu = holder.querySelector('.gshare-menu');
      var willOpen = menu.hidden;
      closeAll(menu);
      menu.hidden = !willOpen;
      toggle.setAttribute('aria-expanded', String(willOpen));
      return;
    }
    if (native && holder) {
      navigator.share({ title: holder.dataset.title, text: holder.dataset.text || holder.dataset.title, url: holder.dataset.url }).catch(function () {});
      return;
    }
    if (copyBtn && holder) { copy(holder.dataset.url, copyBtn); return; }
    if (!e.target.closest('.gshare-menu')) closeAll();
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // Show the native-share button on the item page only where it's supported.
  if (navigator.share) {
    document.querySelectorAll('[data-share-native]').forEach(function (b) { b.hidden = false; });
  }
})();
