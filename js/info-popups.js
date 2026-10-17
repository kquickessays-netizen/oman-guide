/* INFO POP-UPS
   Tapping an Info-tab item ("Do I need a visa?", "Drones", "1 OMR"...) opens it
   as a pop-up over the screen, the same panel a place opens in on Explore,
   instead of unfolding underneath. Each item also has its own address,
   /info/<slug>.html, a real page (tools/build_info_pages.py) that opens the app
   on the Info tab with that pop-up showing.

   The content is exactly what the app already shows for the item: app.js still
   renders it into the section's .xp box as before; this file keeps that box
   off the page and shows it in the pop-up. Nothing in app.js changes. */
(function () {
  var style = document.createElement('style');
  style.textContent =
    '#view .isec .xp{display:none!important}' +                 /* the app still fills it; it shows in the pop-up */
    '.ipop .sheet-body{padding:58px 18px 34px}' +
    '.ipop .xp{display:block!important;margin:0;animation:none}' +
    '.ipop .xp.ipop-sos{border-color:#f2c4bf;background:#fdf3f2}' +
    /* laptops: a short card glued to the bottom edge looked cut off, so it
       floats in the middle of the screen instead (phones keep the bottom sheet) */
    '@media(min-width:760px){.sheet.ipop{top:50%;bottom:auto;transform:translate(-50%,-50%);' +
    'border-radius:22px;max-height:80vh;animation:ipopIn .22s cubic-bezier(.2,.8,.2,1)}' +
    '.ipop .sheet-body{padding-bottom:22px}}' +
    '@keyframes ipopIn{from{opacity:0;transform:translate(-50%,-44%)}to{opacity:1;transform:translate(-50%,-50%)}}';
  document.head.appendChild(style);

  var bd = document.createElement('div');
  bd.className = 'sheet-backdrop'; bd.hidden = true;
  var panel = document.createElement('section');
  panel.className = 'sheet ipop'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
  panel.innerHTML = '<button class="sheet-close" aria-label="Close">✕</button><div class="sheet-body"></div>';
  document.body.appendChild(bd); document.body.appendChild(panel);
  var body = panel.querySelector('.sheet-body');

  var open = null, busy = false;
  function slug(t) {
    return String(t).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function title(xp) { var s = xp.querySelector('strong'); return s ? s.textContent.trim() : ''; }
  function boxOf(row) { return row.closest('.isec').querySelector('.xp'); }

  function show(row, push) {
    var xp = boxOf(row);
    if (!xp || xp.hidden || !xp.innerHTML.trim()) return;
    var sos = row.closest('.isec').classList.contains('isec-sos');
    body.innerHTML = '<div class="xp' + (sos ? ' ipop-sos' : '') + '">' + xp.innerHTML + '</div>';
    panel.hidden = false; bd.hidden = false; panel.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    open = { row: row, slug: slug(title(xp)) };
    if (push) history.pushState({ ipop: open.slug }, '', '/info/' + open.slug + '.html' + location.hash);
  }
  function collapse() {  // put the app's own state back (its item is closed again)
    if (open && open.row.classList.contains('on')) { busy = true; open.row.click(); busy = false; }
  }
  function hide(how) {
    if (!open) return;
    collapse();
    panel.hidden = true; bd.hidden = true; document.body.style.overflow = '';
    var pushed = history.state && history.state.ipop;
    open = null;
    if (how === 'ui') { if (pushed) history.back(); else history.replaceState(null, '', '#/info'); }
  }

  // After the app has handled the tap (it fills .xp), show what it rendered.
  document.addEventListener('click', function (e) {
    if (busy) return;
    var row = e.target.closest && e.target.closest('#view .isec [data-xi]');
    if (!row) return;
    setTimeout(function () { if (!busy) show(row, true); }, 0);
  });
  panel.querySelector('.sheet-close').onclick = function () { hide('ui'); };
  bd.onclick = function () { hide('ui'); };
  addEventListener('keydown', function (e) { if (open && e.key === 'Escape') hide('ui'); });

  // Find an item by its address: open each row invisibly until the title matches.
  function openBySlug(s, push) {
    var rows = document.querySelectorAll('#view .isec [data-xi]');
    for (var i = 0; i < rows.length; i++) {
      busy = true; rows[i].click(); busy = false;
      var xp = boxOf(rows[i]);
      if (xp && !xp.hidden && slug(title(xp)) === s) { show(rows[i], push); return true; }
      if (rows[i].classList.contains('on')) { busy = true; rows[i].click(); busy = false; }
    }
    return false;
  }
  addEventListener('popstate', function () {
    var s = history.state && history.state.ipop;
    if (open && !s) hide('pop');
    else if (s && !open) openBySlug(s, false);
  });

  // Landing on /info/<slug>.html: wait for the Info tab, then open that item.
  var m = /^\/info\/([a-z0-9-]+)\.html$/.exec(location.pathname);
  if (m) {
    var tries = 0, t = setInterval(function () {
      if (document.querySelector('#view .isec [data-xi]') || ++tries > 100) {
        clearInterval(t);
        // the app has decided on its welcome screen by now: undo the one-visit skip
        if (window.__welcomeTemp) { try { localStorage.removeItem('oman_welcomed'); } catch (e) {} }
        if (!openBySlug(m[1], false)) history.replaceState(null, '', '#/info');
      }
    }, 50);
  }
})();
