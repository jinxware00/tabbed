(function (Global) {
  'use strict';
  Global.ProfileMotion = {
    Attach: function (root, surface, config) {
      if (root.classList.contains('pf-reduced-motion')) return function () {};
      var viewport = root.querySelector('.ref-scroll'), animations = new Map(), observer, entranceObserver;
      var sections = Array.from(surface.querySelectorAll('[data-profile-section]'));
      if (!sections.length) sections = [surface.querySelector('[data-profile-role=card]') || surface];
      var targets = new Map(), shown = new Set(), entered = false, stopped = false;
      root.classList.add('ref-motion');
      sections.forEach(function (section) {
        var nodes = Array.from(section.querySelectorAll('[data-reveal-part]')).filter(function (node) {
          return !['hero-identity', 'about-root', 'projects-grid'].includes(node.dataset.revealPart) || !node.querySelector('[data-reveal-part]');
        });
        if (!nodes.length) nodes = Array.from(section.children).filter(function (n) { return !n.hidden; });
        section.querySelectorAll('[data-reveal-part]').forEach(function (node) { node.style.removeProperty('opacity'); node.style.removeProperty('transform'); });
        section.dataset.revealActive = 'true'; section.dataset.revealDone = 'true';
        // Animate the profile details individually inside the copied title wrappers.
        section.querySelectorAll('[data-profile-role=badge], [data-profile-role=links] > *, [data-profile-role=server], [data-profile-role=clock], [data-profile-role=lastfm], .pf-widget').forEach(function (node) { nodes.push(node); });
        nodes = Array.from(new Set(nodes)); targets.set(section, nodes); nodes.forEach(function (node) { node.style.opacity = '0'; });
      });
      function reveal(section) {
        if (shown.has(section) || !entered || stopped) return;
        shown.add(section); section.dataset.motionState = 'entering';
        var nodes = targets.get(section), style = section.dataset.animation || 'unfold';
        nodes.forEach(function (node, i) {
          var previous = animations.get(node); if (previous) previous.cancel();
          var from = style === 'pop' ? 'translateY(32px) scale(.93)' : style === 'fade' ? 'translateY(18px)' : 'perspective(900px) translateY(38px) rotateX(-9deg) scale(.97)';
          var animation = node.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }], {
            duration: 680, delay: Math.min(i * 65, 390), easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'both'
          });
          animations.set(node, animation);
          animation.onfinish = function () { node.style.opacity = '1'; animation.cancel(); animations.delete(node); if (i === nodes.length - 1) section.dataset.motionState = 'visible'; };
        });
      }
      function hide(section) {
        shown.delete(section); section.dataset.motionState = 'hidden';
        targets.get(section).forEach(function (node) { var animation = animations.get(node); if (animation) animation.cancel(); animations.delete(node); node.style.opacity = '0'; });
      }
      function observe() {
        if (entered || stopped) return; entered = true;
        observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { if (entry.isIntersecting && entry.intersectionRatio >= Math.min(.15, viewport.clientHeight / entry.target.offsetHeight * .15)) reveal(entry.target); else if (!entry.isIntersecting || entry.intersectionRatio <= .001) hide(entry.target); });
        }, { root: viewport, threshold: [0, .001, .05, .15, .3] });
        sections.forEach(function (section) { observer.observe(section); });
      }
      if (root.classList.contains('pf-reveal')) observe();
      else { entranceObserver = new MutationObserver(function () { if (root.classList.contains('pf-reveal')) { observe(); entranceObserver.disconnect(); } }); entranceObserver.observe(root, { attributes: true, attributeFilter: ['class'] }); }
      return function () {
        stopped = true; if (observer) observer.disconnect(); if (entranceObserver) entranceObserver.disconnect();
        animations.forEach(function (animation) { animation.cancel(); }); animations.clear();
        targets.forEach(function (nodes) { nodes.forEach(function (node) { node.style.removeProperty('opacity'); }); });
        root.classList.remove('ref-motion');
      };
    }
  };
})(window);
