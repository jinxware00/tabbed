(function (Global) {
  'use strict';
  Global.ProfileCursor = {
    Attach: function (root, config) {
      var stopped = false;
      if (!config.Image) return function () {};
      if (!document.getElementById('pf-cursor-style')) {
        var style = document.createElement('style'); style.id = 'pf-cursor-style';
        style.textContent = '.pf-custom-cursor,.pf-custom-cursor *{cursor:var(--pf-cursor,auto)!important}';
        document.head.appendChild(style);
      }
      var img = new Image();
      img.onload = function () {
        if (stopped) return;
        var width = img.naturalWidth || 32, height = img.naturalHeight || 32;
        var scale = Math.min(1, 64 / Math.max(width, height));
        var url = config.Image;
        if (scale < 1 || /^data:image\/svg/i.test(url) || /\.svg(?:[?#]|$)/i.test(url)) {
          try {
            var canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            url = canvas.toDataURL('image/png'); width = canvas.width; height = canvas.height;
          } catch (_) { /* Native URL cursors still work for small remote images without CORS. */ }
        }
        var x = Math.min(width - 1, Math.max(0, Math.round(config.HotspotX * scale)));
        var y = Math.min(height - 1, Math.max(0, Math.round(config.HotspotY * scale)));
        root.style.setProperty('--pf-cursor', 'url(' + JSON.stringify(url) + ') ' + x + ' ' + y + ', auto');
        root.classList.add('pf-custom-cursor');
        root.dataset.cursorReady = 'true';
      };
      img.src = config.Image;
      return function () { stopped = true; img.onload = null; root.classList.remove('pf-custom-cursor'); root.style.removeProperty('--pf-cursor'); delete root.dataset.cursorReady; };
    }
  };
})(window);
