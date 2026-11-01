(function (Global) {
  var base = new URL('../', document.currentScript.src);
  Global.ABOUTU_SOURCES = { Load: async function (preset) {
    async function read(path) { var response = await fetch(new URL(path, base)); if (!response.ok) throw new Error('Could not load export source: ' + path); return response.text(); }
    var paths = ['css/reference.css','css/style.css','css/layouts.css','css/reference-bindings.css','js/services.js','js/cursor.js','js/cat.js','js/motion.js','js/sections.js','js/reference.js','js/profile.js','js/icons.js','js/reference-icons.js','assets/web/credits.json'];
    var files = await Promise.all(paths.map(read));
    var data = {};
    if (['guns','modern','portfolio','showcase','afterglow','reverie'].includes(preset)) data[preset] = JSON.parse(await read('js/templates/' + preset + '.json'));
    return { Css:files[0]+'\n'+files[1], LayoutCss:files[2]+'\n'+files[3], ProfileJs:'window.PROFILE_REFERENCE_DATA = '+JSON.stringify(data)+';\n'+files.slice(4,11).join('\n'), IconsJs:files[11]+'\n'+files[12], Credits:files[13] };
  }};
})(window);
