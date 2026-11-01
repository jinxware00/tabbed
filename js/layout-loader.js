(function (Global) {
  'use strict';
  var base = new URL('templates/', document.currentScript.src), pending = new Map(), recent = [];
  Global.PROFILE_REFERENCE_DATA = Global.PROFILE_REFERENCE_DATA || {};
  Global.LayoutLoader = {
    Load: function (id) {
      if (Global.PROFILE_REFERENCE_DATA[id]) return Promise.resolve(Global.PROFILE_REFERENCE_DATA[id]);
      if (!['guns','modern','portfolio','showcase','afterglow','reverie'].includes(id)) return Promise.resolve(null);
      if (!pending.has(id)) pending.set(id, fetch(new URL(id + '.json', base)).then(function (response) { if (!response.ok) throw new Error('Could not load this layout'); return response.json(); }).then(function (data) {
        Global.PROFILE_REFERENCE_DATA[id] = data; recent.push(id);
        while (recent.length > 2) delete Global.PROFILE_REFERENCE_DATA[recent.shift()];
        return data;
      }).finally(function () { pending.delete(id); }));
      return pending.get(id);
    }
  };
})(window);
