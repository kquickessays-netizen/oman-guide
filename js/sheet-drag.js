/* PULL TO CLOSE
   Every bottom sheet (a place, a plan, an Info pop-up) wears a grab handle at
   the top. This makes it work like the phone's own: drag the sheet down and
   it follows the finger; let go past a third of the way (or with a quick
   flick) and it closes through its own X button, so each sheet's normal close
   path runs (history, app state). Let go early and it snaps back.

   Where a drag can start: the handle strip at the top always; anywhere else
   only when the sheet is scrolled to the very top and the finger moves
   straight down, so reading, scrolling and the photo slider are untouched.
   Phones only (under 760px): on laptops the sheets sit centred and have an X.
   Nothing in app.js changes. */
(function () {
  var HANDLE = 44;          // px from the top of the sheet that always drags
  var s = null;             // the drag in progress

  function phone() { return !matchMedia('(min-width:760px)').matches; }
  function backdropOf(p) {
    var b = p.previousElementSibling;
    return b && b.classList.contains('sheet-backdrop') ? b : null;
  }
  function reset(p, b) {
    p.style.transition = ''; p.style.transform = '';
    if (b) { b.style.transition = ''; b.style.opacity = ''; }
  }

  document.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1 || !phone()) return;
    var p = e.target.closest && e.target.closest('.sheet');
    if (!p || p.hidden) return;
    var t = e.touches[0], top = p.getBoundingClientRect().top;
    var onHandle = t.clientY - top < HANDLE && !e.target.closest('button,a,input,textarea,select');
    if (!onHandle && p.scrollTop > 0) return;
    s = { p: p, b: backdropOf(p), y0: t.clientY, x0: t.clientX, t0: Date.now(),
          dy: 0, on: false, handle: onHandle, h: p.getBoundingClientRect().height };
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!s) return;
    var t = e.touches[0], dy = t.clientY - s.y0, dx = t.clientX - s.x0;
    if (!s.on) {
      if (Math.abs(dy) < 8 && Math.abs(dx) < 8) return;
      // a sideways swipe (photo slider) or an upward scroll is not ours
      if (dy <= 0 || Math.abs(dx) > Math.abs(dy) || (!s.handle && s.p.scrollTop > 0)) { s = null; return; }
      s.on = true; s.y0 = t.clientY; dy = 0;
      s.p.style.transition = 'none';
      if (s.b) s.b.style.transition = 'none';
    }
    e.preventDefault();               // the page must not scroll under the drag
    s.dy = Math.max(0, dy);
    s.p.style.transform = 'translateY(' + s.dy + 'px)';
    if (s.b) s.b.style.opacity = String(Math.max(0, 1 - s.dy / s.h));
  }, { passive: false });

  function end() {
    if (!s) return;
    var d = s; s = null;
    if (!d.on) return;
    var speed = d.dy / Math.max(1, Date.now() - d.t0);   // px per ms
    var close = d.dy > d.h * 0.33 || (speed > 0.6 && d.dy > 40);
    var ease = 'transform .22s cubic-bezier(.2,.8,.2,1)';
    d.p.style.transition = ease;
    if (d.b) d.b.style.transition = 'opacity .22s';
    if (close) {
      d.p.style.transform = 'translateY(100%)';
      if (d.b) d.b.style.opacity = '0';
      setTimeout(function () {
        var x = d.p.querySelector(':scope > .sheet-close');
        if (x) x.click();
        reset(d.p, d.b);
      }, 200);
    } else {
      d.p.style.transform = 'translateY(0)';
      if (d.b) d.b.style.opacity = '';
      setTimeout(function () { reset(d.p, d.b); }, 230);
    }
  }
  document.addEventListener('touchend', end, { passive: true });
  document.addEventListener('touchcancel', end, { passive: true });

  // a slightly wider handle reads as grabbable
  var st = document.createElement('style');
  st.textContent = '@media(max-width:759px){.sheet::before{width:52px;height:5px}}';
  document.head.appendChild(st);
})();
