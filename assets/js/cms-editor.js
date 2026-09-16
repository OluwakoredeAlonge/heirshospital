/* ==========================================================================
   Heirs CMS editor - builds a form from a public page's data-cms markers,
   previews changes live in an iframe and publishes them via HeirsCMS.
   Page: <body data-admin="pages" data-cms-page="about">  + <div id="cmsEditor"></div>
   ========================================================================== */
(function () {
  'use strict';
  const page = document.body.dataset.cmsPage;
  const meta = HeirsCMS.PAGES.find(p => p.key === page);
  const root = document.getElementById('cmsEditor');
  if (!page || !meta || !root) return;

  let schema = [], defaults = {}, data = {}, dirty = false, previewTimer = null;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const i = n => `<i data-lucide="${n}"></i>`;

  /* ---------------- load ---------------- */
  async function load() {
    root.innerHTML = `<div class="empty"><i data-lucide="loader-circle" class="animate-spin"></i><b>Loading ${esc(meta.title)}…</b></div>`; HeirsAdmin.icons();
    const html = await fetch('../' + meta.file, { cache: 'no-store' }).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, 'text/html');
    schema = HeirsCMS.schema(doc);
    defaults = {}; schema.forEach(s => s.fields.forEach(f => defaults[f.key] = clone(f.value)));
    const saved = HeirsCMS.get(page);
    data = clone(defaults); Object.keys(saved).forEach(k => { if (k in defaults) data[k] = saved[k]; });
    dirty = false; render();
  }
  const clone = v => JSON.parse(JSON.stringify(v));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /* ---------------- render ---------------- */
  function render() {
    const modified = Object.keys(data).filter(k => !same(data[k], defaults[k])).length;
    root.innerHTML = `
      <div class="a-head">
        <div><a href="pages.html" class="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-2">${i('arrow-left')} All pages</a><h1>Edit: ${esc(meta.title)}</h1><p>${esc(meta.desc)}</p></div>
        <div class="actions">
          <span class="tag ${modified ? 'tag-gold' : 'tag-gray'}" id="modBadge">${modified ? modified + ' field(s) changed from default' : 'Using default content'}</span>
          <a href="../${meta.file}" target="_blank" class="btn btn-outline">${i('external-link')} View page</a>
          <button class="btn btn-ghost" id="btnReset">${i('rotate-ccw')} Reset to defaults</button>
          <button class="btn btn-outline" id="btnDiscard">${i('undo-2')} Discard changes</button>
          <button class="btn btn-primary" id="btnSave">${i('upload-cloud')} Save & publish</button>
        </div>
      </div>
      <div class="cms-layout">
        <div class="cms-form" id="cmsForm">${schema.map((s, si) => section(s, si)).join('')}</div>
        <div class="cms-preview">
          <div class="cms-preview-bar">
            <div class="seg"><button class="on" data-w="100%">${i('monitor')} Desktop</button><button data-w="820px">${i('tablet')} Tablet</button><button data-w="390px">${i('smartphone')} Phone</button></div>
            <span class="text-xs text-muted ml-auto" id="pvStatus">Live preview</span>
            <button class="a-icon-btn" id="pvReload" title="Reload preview">${i('refresh-cw')}</button>
          </div>
          <div class="cms-frame-wrap"><iframe id="pvFrame" src="../${meta.file}?preview=1" title="Preview"></iframe></div>
        </div>
      </div>`;
    HeirsAdmin.icons(); wire();
  }

  function section(s, si) {
    return `<details class="cms-sec" ${si < 2 ? 'open' : ''}>
      <summary><span class="n">${si + 1}</span><span class="t">${esc(s.name)}</span><span class="c">${s.fields.length} field(s)</span>${i('chevron-down')}</summary>
      <div class="cms-sec-b">${s.fields.map(f => field(f)).join('')}</div>
    </details>`;
  }

  function field(f) {
    const v = data[f.key]; const changed = !same(v, defaults[f.key]);
    const head = `<div class="cms-fh"><label>${esc(f.label)}</label>${changed ? '<span class="tag tag-gold">edited</span>' : ''}<button type="button" class="cms-revert" data-revert="${esc(f.key)}" title="Revert to default" ${changed ? '' : 'hidden'}>${i('rotate-ccw')}</button></div>${f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ''}`;
    if (f.type === 'list') return `<div class="cms-field cms-list" data-key="${esc(f.key)}">${head}<div class="cms-items">${v.map((it, n) => listItem(f, it, n)).join('')}</div><button type="button" class="btn btn-soft btn-sm mt-2" data-add="${esc(f.key)}">${i('plus')} Add item</button></div>`;
    return `<div class="cms-field" data-key="${esc(f.key)}">${head}${control(f, v, `data-k="${esc(f.key)}"`)}</div>`;
  }

  function listItem(f, it, n) {
    return `<div class="cms-item" data-n="${n}">
      <div class="cms-item-h"><b>Item ${n + 1}</b><span class="ml-auto flex gap-1"><button type="button" class="a-icon-btn" data-mv="-1" title="Move up">${i('chevron-up')}</button><button type="button" class="a-icon-btn" data-mv="1" title="Move down">${i('chevron-down')}</button><button type="button" class="a-icon-btn" data-dup title="Duplicate">${i('copy')}</button><button type="button" class="a-icon-btn" data-del title="Delete" style="color:var(--coral-600)">${i('trash-2')}</button></span></div>
      <div class="cms-item-b">${f.fields.map(sf => `<div class="cms-field"><div class="cms-fh"><label>${esc(sf.label)}</label></div>${sf.hint ? `<div class="hint">${esc(sf.hint)}</div>` : ''}${control(sf, it[sf.key], `data-k="${esc(f.key)}" data-n="${n}" data-f="${esc(sf.key)}"`)}</div>`).join('')}</div>
    </div>`;
  }

  function control(f, v, bind) {
    const t = f.type;
    if (t === 'link') return `<div class="grid sm:grid-cols-2 gap-2"><input class="input" ${bind} data-part="text" value="${esc(v?.text)}" placeholder="Label"><input class="input" ${bind} data-part="href" value="${esc(v?.href)}" placeholder="Link (URL, tel:, mailto:)"></div>`;
    if (t === 'image') return `<div class="cms-img"><img src="${esc(v).startsWith('data:') || /^https?:/.test(v) ? esc(v) : '../' + esc(v)}" alt="" onerror="this.style.opacity=.2"><div class="flex-1 grid gap-2"><input class="input" ${bind} value="${esc(v)}" placeholder="Image URL or path"><label class="btn btn-outline btn-sm" style="width:max-content">${i('upload')} Upload image<input type="file" accept="image/*" hidden ${bind} data-upload></label></div></div>`;
    if (t === 'icon') return `<div class="flex items-center gap-2"><span class="ic blue" style="width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex:none"><i data-lucide="${esc(v)}"></i></span><input class="input" ${bind} value="${esc(v)}" placeholder="lucide icon name, e.g. heart-pulse"><a href="https://lucide.dev/icons" target="_blank" class="text-xs text-brand-600 font-semibold whitespace-nowrap">Browse icons</a></div>`;
    if (t === 'lines') return `<textarea class="textarea" ${bind} data-lines rows="${Math.max(3, (v || []).length + 1)}" placeholder="One item per line">${esc((v || []).join('\n'))}</textarea>`;
    if (t === 'html') return `<textarea class="textarea" ${bind} rows="4">${esc(v)}</textarea>`;
    if (t === 'attr') return `<input class="input" ${bind} value="${esc(v)}">`;
    return String(v).length > 90 ? `<textarea class="textarea" ${bind} rows="3">${esc(v)}</textarea>` : `<input class="input" ${bind} value="${esc(v)}">`;
  }

  /* ---------------- wire ---------------- */
  function wire() {
    const form = document.getElementById('cmsForm');
    form.addEventListener('input', e => {
      const el = e.target; if (!el.dataset.k || el.dataset.upload !== undefined) return;
      setVal(el, el.tagName === 'TEXTAREA' && el.hasAttribute('data-lines') ? el.value.split('\n').map(x => x.trim()).filter(Boolean) : el.value);
      if (el.previousElementSibling?.querySelector?.('i,svg') && el.closest('.flex')?.querySelector('span.ic')) { const ic = el.closest('.flex').querySelector('span.ic'); ic.innerHTML = `<i data-lucide="${el.value}"></i>`; HeirsAdmin.icons(); }
      if (el.closest('.cms-img')) el.closest('.cms-img').querySelector('img').src = el.value.startsWith('data:') || /^https?:/.test(el.value) ? el.value : '../' + el.value;
      markDirty(el);
    });
    form.addEventListener('change', async e => {
      const el = e.target; if (el.dataset.upload === undefined || !el.files?.[0]) return;
      const url = await fileToDataUrl(el.files[0]); setVal(el, url);
      const wrap = el.closest('.cms-img'); wrap.querySelector('input.input').value = url; wrap.querySelector('img').src = url; markDirty(el);
    });
    form.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.revert) { data[b.dataset.revert] = clone(defaults[b.dataset.revert]); dirty = true; return render(); }
      if (b.dataset.add) { const f = findField(b.dataset.add); const tpl = defaults[f.key][0] ? clone(defaults[f.key][0]) : Object.fromEntries(f.fields.map(x => [x.key, ''])); data[f.key].push(tpl); dirty = true; return render(); }
      const item = b.closest('.cms-item'); if (!item) return; const key = item.closest('.cms-list').dataset.key; const n = +item.dataset.n; const arr = data[key];
      if (b.hasAttribute('data-del')) { if (arr.length > 1 && confirm('Delete this item?')) arr.splice(n, 1); }
      else if (b.hasAttribute('data-dup')) arr.splice(n + 1, 0, clone(arr[n]));
      else if (b.dataset.mv) { const m = n + +b.dataset.mv; if (m >= 0 && m < arr.length) [arr[n], arr[m]] = [arr[m], arr[n]]; }
      dirty = true; render();
    });
    document.getElementById('btnSave').onclick = () => { HeirsCMS.set(page, data); dirty = false; HeirsAdmin.toast('Published: ' + meta.title + ' updated on the website'); document.getElementById('pvFrame').contentWindow.location.reload(); };
    document.getElementById('btnDiscard').onclick = () => { if (!dirty || confirm('Discard unsaved changes?')) load(); };
    document.getElementById('btnReset').onclick = () => { if (confirm('Reset every field on this page to the original content? This removes all saved edits for this page.')) { HeirsCMS.reset(page); load(); } };
    document.getElementById('pvReload').onclick = () => document.getElementById('pvFrame').contentWindow.location.reload();
    document.querySelectorAll('.cms-preview-bar [data-w]').forEach(b => b.onclick = () => { document.querySelectorAll('.cms-preview-bar [data-w]').forEach(x => x.classList.toggle('on', x === b)); document.getElementById('pvFrame').style.width = b.dataset.w; });
    window.onbeforeunload = () => dirty ? 'You have unsaved changes.' : undefined;
    document.getElementById('pvFrame').addEventListener('load', pushPreview);
  }

  function findField(key) { for (const s of schema) for (const f of s.fields) if (f.key === key) return f; }
  function setVal(el, value) {
    const { k, n, f, part } = el.dataset;
    let target = n !== undefined ? data[k][+n] : data; let prop = n !== undefined ? f : k;
    if (part) { target[prop] = Object.assign({}, target[prop], { [part]: value }); } else target[prop] = value;
  }
  function markDirty(el) {
    dirty = true; const fieldEl = el.closest('.cms-field[data-key]') || el.closest('.cms-list'); if (fieldEl) { const key = fieldEl.dataset.key; const changed = !same(data[key], defaults[key]); const rev = fieldEl.querySelector(`[data-revert="${CSS.escape(key)}"]`); if (rev) rev.hidden = !changed; let tag = fieldEl.querySelector(':scope > .cms-fh .tag'); if (changed && !tag) { rev.insertAdjacentHTML('beforebegin', '<span class="tag tag-gold">edited</span>'); } else if (!changed && tag) tag.remove(); }
    const modified = Object.keys(data).filter(k => !same(data[k], defaults[k])).length; const badge = document.getElementById('modBadge'); badge.className = 'tag ' + (modified ? 'tag-gold' : 'tag-gray'); badge.textContent = modified ? modified + ' field(s) changed from default' : 'Using default content';
    clearTimeout(previewTimer); previewTimer = setTimeout(pushPreview, 350);
  }
  function pushPreview() { const fr = document.getElementById('pvFrame'); const st = document.getElementById('pvStatus'); try { fr.contentWindow.postMessage({ type: 'heirs-cms-preview', page, data }, '*'); if (st) st.textContent = dirty ? 'Previewing unsaved changes' : 'Live preview'; } catch (e) {} }
  function fileToDataUrl(file) {
    return new Promise(res => { const img = new Image(); const u = URL.createObjectURL(file); img.onload = () => { const max = 1600; const sc = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.82)); }; img.src = u; });
  }

  load();
})();
