/* GOOGLE ANALYTICS (20 Oct 2026)
   A second counter next to stats.html, for a two-week side-by-side check of
   the numbers (property "exploresoman.com", G-VTT7L4CYPM). Nothing shows on
   screen and there is no cookie banner; the privacy page says visits are counted.
   - Sends only from exploresoman.com: nothing from localhost or the github.io
     copy, from test runs or crawlers (navigator.webdriver), or from a browser
     marked as ours (?me=on / 7 logo taps, see the top of analytics.js).
   - The app is one page that routes on '#/...' and Google reads only the
     path, so every tab and place goes in as its own page: '#/plan' -> /plan,
     '#/s/wadi-shab' -> /s/wadi-shab.html (that place's real address).
   - The events stats.html counts are copied across: open_place ("Opened a
     place"), whatsapp_click + header_cta + book_click ("Reached out"),
     generate_lead (the lead pop-up), purchase (PayPal). Never names, emails or
     phone numbers: Google's rules forbid sending them.
   Loads after analytics.js (it wraps Analytics.track) and before app.js. */
(function () {
  var ID = 'G-VTT7L4CYPM';
  if (!/(^|\.)exploresoman\.com$/.test(location.hostname)) return;
  if (navigator.webdriver || /bot|crawl|spider|Lighthouse|HeadlessChrome|PageSpeed|facebookexternalhit|meta-external/i.test(navigator.userAgent)) return;
  function ours() { try { return localStorage.getItem('oman_internal') === '1'; } catch (e) { return false; } }
  if (ours()) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ID, { send_page_view: false });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);

  function send(name, params) {
    if (ours()) { window['ga-disable-' + ID] = true; return; }  // marked mid-visit (7 logo taps)
    gtag('event', name, params);
  }

  /* ---- pages ---- */
  var D = window.OMAN_DATA || {};
  function place(id) {
    var all = (D.spots || []).concat(D.itineraries || []);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i].name || all[i].title;
  }
  function where() {
    var h = location.hash.replace(/^#\/?/, '').split('?')[0];
    if (!h) return { path: location.pathname, title: document.title };  // '/', '/info/x.html', '/p/x.html'
    var m = /^s\/([\w-]+)$/.exec(h);
    if (m) return { path: '/s/' + m[1] + '.html', title: place(m[1]) || m[1] };
    return { path: '/' + h, title: h.charAt(0).toUpperCase() + h.slice(1) };
  }
  // Where the visit came from is read off the first page only. Our own ?src=
  // tags (stats.html counts them like utm_source) become utm_source here.
  function search() {
    var q = new URLSearchParams(location.search);
    if (q.get('src') && !q.get('utm_source')) q.set('utm_source', q.get('src'));
    q.delete('me');
    var t = q.toString();
    return t ? '?' + t : '';
  }
  var last = null, first = true;
  function page() {
    var w = where();
    if (w.path === last) return;
    last = w.path;
    // 'set', so the events after it (open_place, whatsapp_click...) are filed under this page too
    gtag('set', { page_location: location.origin + w.path + (first ? search() : ''), page_title: w.title });
    send('page_view', {});
    first = false;
  }
  window.addEventListener('hashchange', page);  // the SPOT ADDRESSES script turns Back/Forward into hashchange too
  page();

  /* ---- the events stats.html counts ---- */
  var MAP = { spot: 'open_place', whatsapp_click: 'whatsapp_click', header_cta: 'header_cta', book_click: 'book_click', lead: 'generate_lead', purchase: 'purchase' };
  var KEEP = ['id', 'cat', 'source', 'tier', 'plan', 'product'];
  var A = window.Analytics;
  if (!A || !A.track) return;
  var track = A.track;
  A.track = function (ev, props) {
    try {
      if (MAP[ev]) {
        var src = props || {}, p = {};
        KEEP.forEach(function (k) {
          var v = src[k];
          if (v != null && v !== '' && String(v).indexOf('@') < 0) p[k] = String(v).slice(0, 100);
        });
        if (ev === 'purchase') {
          p.value = Number(src.amount) || 0;
          p.currency = src.currency || 'USD';
          p.transaction_id = String(src.capture || src.order || '');
        }
        send(MAP[ev], p);
      }
    } catch (e) {}
    return track.apply(this, arguments);
  };
})();
