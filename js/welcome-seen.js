/* WELCOME SCREEN SEEN
   app.js records "welcome" only when someone LEAVES the first-visit welcome
   screen (action: plan / explore / dismissed). Nothing recorded it being shown,
   so people who saw it and left without tapping were invisible. This sends one
   "welcome_shown" when the screen appears; stats.html sets the two side by side
   (saw it, tapped which button, left without tapping). Changes nothing on screen. */
(function () {
  var sent = false;
  function check() {
    if (sent || !document.querySelector('.welcome') || !window.Analytics) return;
    sent = true;
    obs.disconnect();
    try { Analytics.track('welcome_shown', {}); } catch (e) {}
  }
  var obs = new MutationObserver(check);
  obs.observe(document.body, { childList: true, subtree: true });
  check();
  setTimeout(function () { obs.disconnect(); }, 20000);  // the screen only ever appears at start-up
})();
