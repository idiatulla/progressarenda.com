// prettyPhoto binds its click handlers on DOM ready, which can be delayed by slow
// third-party scripts (Cloudflare analytics, Yandex.Metrika). A click before that moment
// would follow the link to the bare image. Hold such clicks and replay them once ready.
(function () {
  var SELECTOR = 'a[data-rel^="prettyPhoto"]';
  var pending = null;

  function bound(a) {
    var ev = window.jQuery && jQuery._data(a, 'events');
    return !!(ev && ev.click);
  }

  function onClick(e) {
    var a = e.target.closest && e.target.closest(SELECTOR);
    if (!a || bound(a)) return;
    e.preventDefault();
    e.stopPropagation();
    pending = a;
  }
  document.addEventListener('click', onClick, true);

  // replay the held click as soon as the lightbox handlers exist
  var tries = 0;
  (function wait() {
    var first = document.querySelector(SELECTOR);
    if (first && bound(first)) {
      document.removeEventListener('click', onClick, true);
      if (pending) jQuery(pending).trigger('click');
    } else if (++tries < 300) {
      setTimeout(wait, 100);
    } else {
      document.removeEventListener('click', onClick, true); // give up: normal link behaviour
    }
  })();
})();
