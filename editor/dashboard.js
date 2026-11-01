(function (Global) {
  'use strict';
  var E = Global.Editor;
  var Forms = document.getElementById('forms-panel');
  var pages = [['account', 'Account', 'user'], ['customize', 'Customize', 'brush'], ['links', 'Links', 'link'], ['effects', 'Effects', 'sparkles'], ['widgets', 'Widgets', 'grid'], ['assets', 'Assets', 'image'], ['templates', 'Templates', 'templates']];
  var active = location.hash.slice(1) || 'customize';
  var sections = {}, cards = {}, assetSync = [];
  var icons = {
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    user: '<circle cx="10" cy="7" r="4"/><path d="M3 21v-3a7 7 0 0 1 14 0v3m3-11v6m-3-3h6"/>',
    brush: '<path d="m14 4 6-2 2 2-10 11-4-4ZM8 13c-5-1-1 7-6 7 5 4 11-1 8-5"/>',
    link: '<path d="m10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 0 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',
    sparkles: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Zm8-1v4m-2-2h4M3 18v4m-2-2h4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 4-7 5 8"/>',
    templates: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>',
    external: '<path d="M14 3h7v7m0-7L10 14m0-11H4v17h17v-7"/>',
    share: '<circle cx="18" cy="4" r="3"/><circle cx="5" cy="12" r="3"/><circle cx="18" cy="20" r="3"/><path d="m8 10 7-4M8 14l7 4"/>',
    more: '<circle cx="4" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="20" cy="12" r="1"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M12 2v13m-5-5 5 5 5-5M3 15v6h18v-6"/>',
    upload: '<path d="M12 16V3m-5 5 5-5 5 5M3 15v6h18v-6"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    music: '<path d="M9 18V5l12-3v14M9 9l12-3"/><ellipse cx="5" cy="18" rx="4" ry="3"/><ellipse cx="17" cy="16" rx="4" ry="3"/>',
    cursor: '<path d="m5 2 14 12-7 1-3 7Z"/>',
    menu: '<path d="M3 5h18M3 12h18M3 19h18"/>'
  };
  function node(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
  function icon(name) { var n = node('span', 'dash-icon'); n.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (icons[name] || icons.grid) + '</svg>'; return n; }
  function button(label, fn, cls, glyph) { var b = node('button', cls || 'ghost', label); b.type = 'button'; if (glyph) b.prepend(icon(glyph)); b.addEventListener('click', fn); return b; }
  function section(parent, title, desc, cls) {
    var s = node('section', 'dash-section'); s.appendChild(node('h2', '', title));
    if (desc) s.appendChild(node('p', 'section-description', desc));
    var body = node('div', 'dash-panel ' + (cls || '')); s.appendChild(body); parent.appendChild(s); return body;
  }
  function field(grid, label, control) { var f = E.Field(label, control); grid.appendChild(f); return f; }
  function range(grid, label, value, set, min, max, step, unit) {
    var control = E.Range(value, set, { min: min, max: max, step: step });
    var input = control.querySelector('input'), output = control.querySelector('.range-value');
    function format() { output.textContent = (unit === '%' ? Math.round(Number(input.value) * 100) : input.value) + (unit || ''); }
    input.addEventListener('input', format); format(); field(grid, label, control);
  }
  function options(values) { return values.map(function (v) { return { value: v[0], label: v[1] }; }); }
  function localUrl(value) { try { return new URL(value, new URL('../', location.href)).href; } catch (_) { return ''; } }
  function moveCard(id, page, open) {
    if (!cards[id]) return;
    if (open) cards[id].classList.remove('collapsed');
    sections[page].appendChild(cards[id]);
  }
  function assetTile(parent, title, glyph, get, set, accept) {
    var tile = node('div', 'asset-tile'); tile.appendChild(node('h3', '', title));
    var visual = button('', function () { file.click(); }, 'asset-visual'); visual.setAttribute('aria-label', 'Upload ' + title);
    var file = node('input'); file.type = 'file'; file.accept = accept; file.hidden = true;
    var box = node('div','asset-box'), actions = node('div', 'asset-actions');
    function action(label,fn,glyph,cls){var control=button('',fn,cls,glyph);control.setAttribute('aria-label',label);control.title=label;return control;}
    var urlButton = action('Use URL', function () {
      var input = E.Text(get(), function () {}); input.placeholder = 'https://...'; input.setAttribute('aria-label', title + ' URL');
      var wrap = node('div', 'url-dialog'); wrap.appendChild(input);
      var close = E.OpenModal(title + ' URL', wrap);
      wrap.appendChild(button('Apply', function () {
        var safe = Global.ProfileRuntime.ValidateConfig({ Profile: { Avatar: input.value } }).Config.Profile.Avatar;
        set(safe); E.Touch(); syncVisual(); close();
      }, 'primary'));
    }, 'link','asset-url');
    var clear = action('Remove ' + title, function () { set(''); E.Touch(); syncVisual(); }, 'trash','asset-remove');
    actions.append(action('Upload ' + title, function(){file.click();},'upload','asset-upload'),urlButton, action('Search',function(){
      Global.MediaSearch.Open({accept:accept, onSelect:function(value,media){set(value,{type:media.mime,name:media.title});E.Touch();syncVisual();}});
    },'search','asset-search'), clear);
    function syncVisual() {
      var value = get(); if (visual.dataset.value === value) return; visual.dataset.value = value; visual.replaceChildren();
      if (value && glyph !== 'music') {
        var media = node(/\.(mp4|webm)(?:[?#]|$)|^data:video/i.test(value) || Global.ProfileStore.type(value).startsWith('video/') ? 'video' : 'img');
        media.loading = 'lazy'; media.src = localUrl(value); media.alt = ''; if (media.tagName === 'VIDEO') { media.muted = true; media.preload = 'none'; }
        visual.appendChild(media);
      } else { visual.append(icon(glyph), node('span', '', value ? 'Audio uploaded' : 'Click to upload')); }
      visual.appendChild(node('span', 'asset-hover', 'Change ' + title.toLowerCase()));
      clear.disabled = !value;
    }
    function upload(f) {
      if (!f) return;
      var allowed = accept.split(',').some(function (type) { return f.type.indexOf(type.trim().replace('/*', '/')) === 0; });
      if (accept.includes('audio/') && f.type==='application/ogg') allowed=true;
      if (!allowed) { E.Toast('Choose a supported ' + title.toLowerCase() + ' file.'); return; }
      Global.ProfileStore.addAsset(f).then(function (url) { set(url, f); E.Touch(); syncVisual(); E.Toast(title + ' uploaded'); }).catch(function () { E.Toast('Could not save this file.'); });
    }
    file.addEventListener('change', function () { upload(file.files[0]); file.value = ''; });
    visual.addEventListener('dragover', function (ev) { ev.preventDefault(); visual.classList.add('dragging'); });
    visual.addEventListener('dragleave', function () { visual.classList.remove('dragging'); });
    visual.addEventListener('drop', function (ev) { ev.preventDefault(); visual.classList.remove('dragging'); upload(ev.dataTransfer.files[0]); });
    box.append(visual,actions);tile.append(box, file); parent.appendChild(tile); syncVisual(); assetSync.push(syncVisual);
  }
  function assetFields(parent, C) {
    var panel = section(parent, 'Assets Uploader', '', 'asset-grid');
    assetTile(panel, 'Background', 'image', function () { return C.Background.Type === 'video' ? C.Background.Video : C.Background.Image; }, function (value, file) { var video = file ? file.type.indexOf('video/') === 0 : /\.(mp4|webm)(?:[?#]|$)|^data:video/i.test(value); C.Background.Type = value ? (video ? 'video' : 'image') : 'color'; C.Background.Video = video ? value : ''; C.Background.Image = video ? '' : value; }, 'image/*,video/*');
    assetTile(panel, 'Audio', 'music', function () { return C.Music.Src; }, function (value, file) {
      C.Music.Src = value; C.Music.Enabled = !!value;
      if (file) C.Music.Title = file.name.replace(/\.[^.]+$/, '');
      var track = C.Music.Tracks[C.Music.TrackIndex];
      if (track) { if (track.Src !== value) track.Lyrics = ''; track.Src = value; track.Title = C.Music.Title; }
      E.BuildForms();
    }, 'audio/*');
    assetTile(panel, 'Profile Avatar', 'user', function () { return C.Profile.Avatar; }, function (value) { C.Profile.Avatar = value; }, 'image/*');
    assetTile(panel, 'Custom Cursor', 'cursor', function () { return C.Cursor.Image; }, function (value) { C.Cursor.Image = value; }, 'image/*');
  }
  function customize(C) {
    var page = sections.customize; assetFields(page, C);
    var banner = button('', function () { navigate('templates'); }, 'template-banner');
    banner.append(icon('sparkles'), node('span', '', 'A profile that feels like you.'), node('strong', '', 'Explore templates'), node('span', '', '→')); page.appendChild(banner);
    var grid = section(page, 'General Customization', '', 'general-grid');
    field(grid, 'Description', E.TextArea(C.Profile.Bio, function (v) { C.Profile.Bio = v; C.Profile.BioMessages = []; }));
    var presence = button(C.Presence.Enabled ? 'Discord Presence Enabled' : 'Discord Presence Disabled', function () { navigate('widgets'); }, 'setting-button'); presence.prepend(icon('user'));
    field(grid, 'Profile Widget', presence);
    range(grid, 'Profile Opacity', C.Profile.CardOpacity, function (v) { C.Profile.CardOpacity = v; }, 0, 1, 0.01, '%');
    range(grid, 'Profile Blur', C.Profile.CardBlur, function (v) { C.Profile.CardBlur = v; }, 0, 100, 1, 'px');
    var effect = C.Effects.Particles.Enabled && ['snow', 'rain'].indexOf(C.Effects.Particles.Type) >= 0 ? C.Effects.Particles.Type : C.Background.Effect;
    field(grid, 'Background Effects', E.Select(options([['none', 'None'], ['old-tv', 'Old TV'], ['aurora', 'Aurora'], ['plasma', 'Plasma'], ['snow', 'Snowflakes'], ['rain', 'Rain'], ['blurred', 'Blurred Background'], ['night', 'Night Time']]), effect, function (v) { C.Background.Effect = v === 'snow' || v === 'rain' ? 'none' : v; C.Effects.Particles.Enabled = v === 'snow' || v === 'rain'; if (C.Effects.Particles.Enabled) C.Effects.Particles.Type = v; }));
    field(grid, 'Username Effects', E.Select(options([['none', 'None'], ['rainbow', 'Rainbow'], ['sparkle', 'Sparkles'], ['pulse', 'Pulse'], ['fuzzy', 'Fuzzy'], ['typewriter', 'Typewriter'], ['glitch', 'Glitch']]), C.Effects.NameGlitch.Enabled ? 'glitch' : C.Effects.Username, function (v) { C.Effects.NameGlitch.Enabled = v === 'glitch'; C.Effects.Username = v === 'glitch' ? 'none' : v; }));
    field(grid, 'Location', E.Text(C.Profile.Location, function (v) { C.Profile.Location = v; }));
    var glow = node('div', 'glow-toggles');
    glow.append(E.Toggle(C.Theme.UsernameGlow, function (v) { C.Theme.UsernameGlow = v; }, 'Username'), E.Toggle(C.Social.Style === 'glow', function (v) { C.Social.Style = v ? 'glow' : 'plain'; }, 'Socials'), E.Toggle(C.Profile.BadgesGlow, function (v) { C.Profile.BadgesGlow = v; }, 'Badges'));
    field(grid, 'Glow Settings', glow);
    var colors = section(page, 'Color Customization', '', 'color-grid');
    [['Accent Color', C.Theme, 'Accent'], ['Text Color', C.Theme, 'TextColor'], ['Background Color', C.Background, 'Color'], ['Icon Color', C.Theme, 'IconColor'], ['Background Effect Color', C.Effects.Particles, 'Color'], ['Profile Color', C.Theme, 'CardBackground']].forEach(function (entry) { field(colors, entry[0], E.Color(entry[1][entry[2]], function (v) { entry[1][entry[2]] = v; })); });
    var gradient = node('div', 'gradient-settings'); gradient.appendChild(E.Toggle(C.Theme.CardGradient, function (v) { C.Theme.CardGradient = v; }, 'Profile Gradient'));
    field(gradient, 'Primary Color', E.Color(C.Theme.CardGradientFrom, function (v) { C.Theme.CardGradientFrom = v; }));
    field(gradient, 'Secondary Color', E.Color(C.Theme.CardGradientTo, function (v) { C.Theme.CardGradientTo = v; })); colors.appendChild(gradient);
    var other = section(page, 'Other Customization', '', 'other-grid');
    other.append(E.Toggle(C.Social.Monochrome, function (v) { C.Social.Monochrome = v; }, 'Monochrome Icons'), E.Toggle(C.Meta.AnimatedTitle, function (v) { C.Meta.AnimatedTitle = v; }, 'Animated Title'), E.Toggle(C.Controls.Enabled && C.Controls.Volume, function (v) { C.Controls.Enabled = v || C.Controls.Opacity; C.Controls.Volume = v; }, 'Volume Control'), E.Toggle(C.Profile.ShowUsername, function (v) { C.Profile.ShowUsername = v; }, 'Show Username'), E.Toggle(C.Profile.ShowViews, function (v) { C.Profile.ShowViews = v; }, 'Show View Count'), E.Toggle(C.Effects.EntryScreen.Enabled, function (v) { C.Effects.EntryScreen.Enabled = v; }, 'Click to Enter'));
    other.appendChild(button('Swap Profile Colors', function () { var color = C.Theme.CardGradientFrom; C.Theme.CardGradientFrom = C.Theme.CardGradientTo; C.Theme.CardGradientTo = color; E.Touch(); E.BuildForms(); }, 'setting-button'));
    ['layout', 'typography', 'background', 'bio-messages', 'status'].forEach(function (id) { moveCard(id, 'customize'); });
  }
  function widgets(C) {
    var page = sections.widgets; page.appendChild(node('p', 'page-intro', 'Add a little more to your profile. Presence and community details are entered manually.'));
    moveCard('presence', 'widgets', true);
    var g = section(page, 'Discord Server', '', 'grid'); var d = C.Widgets.Discord;
    g.appendChild(E.Toggle(d.Enabled, function (v) { d.Enabled = v; }, 'Show Discord Server'));
    field(g, 'Server Name', E.Text(d.Name, function (v) { d.Name = v; })); field(g, 'Invite URL', E.Text(d.Invite, function (v) { d.Invite = v; }));
    field(g, 'Server Icon', E.Url(d.Icon, function (v) { d.Icon = v; }));
    field(g, 'Online Members', E.Text(d.Online, function (v) { d.Online = Number(v); }, 'number', { min: 0, step: 1 }));
    field(g, 'Total Members', E.Text(d.Members, function (v) { d.Members = Number(v); }, 'number', { min: 0, step: 1 }));
    g = section(page, 'Timezone', '', 'grid'); var t = C.Widgets.Clock;
    g.appendChild(E.Toggle(t.Enabled, function (v) { t.Enabled = v; }, 'Show Local Time'));
    field(g, 'Clock Label', E.Text(t.Label, function (v) { t.Label = v; }));
    var zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['Europe/London', 'America/Toronto', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'];
    zones = Array.from(new Set(['UTC', t.Timezone].concat(zones))).sort();
    field(g, 'Timezone', E.Select(zones.map(function (z) { return { value: z, label: z.replace(/_/g, ' ') }; }), t.Timezone, function (v) { t.Timezone = v; }));
    g = section(page, 'Quote', '', 'grid'); var q = C.Widgets.Quote;
    g.appendChild(E.Toggle(q.Enabled, function (v) { q.Enabled = v; }, 'Show Quote'));
    field(g, 'Quote Text', E.TextArea(q.Text, function (v) { q.Text = v; })); field(g, 'Author', E.Text(q.Author, function (v) { q.Author = v; }));
  }
  function templates() {
    var page = sections.templates, current = E.State.Config.Profile;
    page.append(node('div','page-eyebrow','MAKE IT YOURS'),node('h1','page-heading','Find your starting point.'),node('p','page-intro','Six looks, three simple layouts. Preview with your name and avatar, then choose what to copy.'));
    var grid = node('div','template-grid');
    Global.PROFILE_TEMPLATES.forEach(function(t,i){
      var card=node('article','template-card'),art=node('div','template-art');
      var wallpaper=node('img','template-wallpaper');wallpaper.src=localUrl(t.thumbnail);wallpaper.alt=t.name+' wallpaper';wallpaper.loading='lazy';wallpaper.decoding='async';
      var avatar=node('img','template-avatar');avatar.src=localUrl(current.Avatar||'assets/web/avatar.webp');avatar.alt='';avatar.loading='lazy';
      art.append(wallpaper,node('span','template-number','0'+(i+1)),avatar,node('strong','template-display-name',current.DisplayName.trim()||current.UserName));
      if(t.config.Background.Type==='video')art.appendChild(node('span','template-live','Live wallpaper'));
      var body=node('div','template-body');body.append(node('span','template-layout-label',Global.PROFILE_LAYOUTS.find(l=>l.value===t.layout).label+' layout'),node('h2','',t.name),node('p','',t.description));
      var actions=node('div','template-actions');
      var previewButton=button('Preview',function(){
        var win=window.open('about:blank','_blank');if(win)win.opener=null;
        E.Flush().then(function(){if(win)win.location.href=new URL('../profile.html?template='+t.id,location.href).href;}).catch(function(){if(win)win.close();});
      },'ghost');
      previewButton.setAttribute('aria-label','Preview '+t.name);
      var useButton=button('Use template',function(){
        var content=node('div','template-copy'),choices=node('div','template-copy-options'),inputs=[];
        content.appendChild(node('p','page-intro','Choose what to copy from '+t.name+'. Your name and avatar stay yours. Checked content replaces your current settings.'));
        var apply=button('Apply selected',function(){
          E.State.Config=Global.ApplyTemplateParts(t,E.State.Config,inputs.filter(input=>input.checked).map(input=>input.value));
          close();active='customize';history.replaceState(null,'','#customize');E.BuildForms();E.Touch();E.Toast(t.name+' applied');
        },'primary');
        function update(){apply.disabled=!inputs.some(input=>input.checked);}
        var shortcuts=node('div','template-copy-shortcuts');
        shortcuts.append(button('Select all',function(){inputs.forEach(input=>input.checked=true);update();}),button('Clear selection',function(){inputs.forEach(input=>input.checked=false);update();}));
        content.appendChild(shortcuts);
        Global.TemplateParts.forEach(function(part){var label=node('label','template-copy-option'),input=node('input');input.type='checkbox';input.value=part.id;input.checked=!!part.selected;input.setAttribute('aria-label',part.label);input.onchange=update;inputs.push(input);var text=node('span');text.append(node('strong','',part.label),node('small','',part.description));label.append(input,text);choices.appendChild(label);});
        content.append(choices,apply);var close=E.OpenModal('Use '+t.name,content);content.closest('dialog').classList.add('template-copy-dialog');
      },'primary');
      useButton.setAttribute('aria-label','Use '+t.name);
      actions.append(previewButton,useButton);
      body.appendChild(actions);card.append(art,body);grid.appendChild(card);
    });page.appendChild(grid);
  }
  function refresh() {
    cards = {}; assetSync = [];
    Forms.querySelectorAll('.card').forEach(function (card) { cards[card.id.replace('card-', '')] = card; card.remove(); }); Forms.replaceChildren();
    pages.forEach(function (p) { sections[p[0]] = node('div', 'dashboard-page'); sections[p[0]].dataset.page = p[0]; Forms.appendChild(sections[p[0]]); });
    var C = E.State.Config; customize(C); widgets(C); moveCard('portfolio-sections', 'widgets', true); templates();
    sections.account.appendChild(node('h1', 'page-heading', 'Your profile'));
    sections.account.appendChild(node('p', 'page-intro', 'Your changes save on this browser. Export a website to publish your profile, or keep a JSON backup to edit later.'));
    ['profile', 'favicon-seo', 'export'].forEach(function (id) { moveCard(id, 'account', true); });
    var actions = section(sections.account, 'Manage Your Draft', '', 'draft-actions');
    actions.append(button('Import JSON', function () { document.getElementById('btn-load-json').click(); }), button('Export JSON', E.ExportJson), button('Reset profile', function () { document.getElementById('btn-reset').click(); }, 'ghost danger'));
    sections.links.appendChild(node('h1', 'page-heading', 'Your links and badges')); sections.links.appendChild(node('p', 'page-intro', 'Your places and interests, together. Arrange links and badges in your preferred order.')); moveCard('links', 'links', true);moveCard('badges','links');
    sections.effects.appendChild(node('h1', 'page-heading', 'Make an entrance'));
    ['particles', 'cursor-effects', 'name-motion', 'overlays', 'entry-screen', 'visitor-controls'].forEach(function (id) { moveCard(id, 'effects', true); });
    assetFields(sections.assets, C); ['music-player', 'playlist', 'cursor'].forEach(function (id) { moveCard(id, 'assets', true); });
    showPage(); sync();
  }
  function showPage() {
    if (!sections[active]) active = 'customize';
    pages.forEach(function (p) { if (sections[p[0]]) sections[p[0]].hidden = p[0] !== active; });
    document.querySelectorAll('.dashboard-nav-button').forEach(function (b) { b.classList.toggle('active', b.dataset.page === active); if (b.dataset.page === active) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    document.getElementById('page-name').textContent = pages.find(function (p) { return p[0] === active; })[1];
    document.title = 'Tabbed | ' + document.getElementById('page-name').textContent;
  }
  function navigate(page) {
    active = page; history.pushState(null, '', '#' + page); if (E.State.Config) E.BuildForms(); menu(false); window.scrollTo(0, 0);
  }
  function sync() {
    if (!E.State.Config) return;
    var P = E.State.Config.Profile; document.getElementById('account-name').textContent = P.DisplayName.trim() || P.UserName;
    document.querySelectorAll('.template-display-name').forEach(n=>n.textContent=P.DisplayName.trim()||P.UserName);
    document.querySelectorAll('.template-avatar').forEach(n=>{var src=localUrl(P.Avatar||'assets/web/avatar.webp');if(n.src!==src)n.src=src;});
    document.getElementById('account-avatar').src = localUrl(P.Avatar || 'assets/web/avatar.webp'); assetSync.forEach(function (fn) { fn(); });
  }
  function menu(open) { document.body.classList.toggle('menu-open', open); document.getElementById('btn-menu').setAttribute('aria-expanded', String(open)); }
  function search() {
    var content = node('div'), input = node('input'); input.type = 'search'; input.placeholder = 'Search customization, links, effects...'; input.setAttribute('aria-label', 'Search features');
    var results = node('div', 'search-results'); content.append(input, results); var close = E.OpenModal('Find a feature', content);
    function filter() {
      results.replaceChildren(); var term = input.value.toLowerCase().trim(), count = 0;
      pages.forEach(function (p) {
        var labels = Array.from(sections[p[0]].querySelectorAll('.field-label,h2,.card-head,.toggle-text'));
        var matches = labels.filter(function (label) { return label.textContent.toLowerCase().includes(term); });
        if (!term || p[1].toLowerCase().includes(term)) matches.unshift(null);
        matches.slice(0, 5).forEach(function (label) {
          var title = label ? label.textContent : p[1]; count++;
          results.appendChild(button(title + (label ? ' · ' + p[1] : ''), function () {
            close(); navigate(p[0]);
            if (label) {
              var target = Array.from(sections[p[0]].querySelectorAll('.field-label,h2,.card-head,.toggle-text')).find(function (n) { return n.textContent === title; });
              if (target) { var card = target.closest('.card'); if (card) card.classList.remove('collapsed'); target.scrollIntoView({ block: 'center' }); var control = target.parentElement.querySelector('input,textarea,select,button'); if (control) control.focus({ preventScroll: true }); }
            }
          }, 'search-result'));
        });
      }); if (!count) results.appendChild(node('p', 'page-intro', 'No matching features. Try “color”, “audio”, or “links”.'));
    }
    input.addEventListener('input', filter); filter(); input.focus();
  }
  var nav = document.getElementById('editor-nav');
  pages.forEach(function (p) { var b = button(p[1], function () { navigate(p[0]); }, 'dashboard-nav-button', p[2]); b.dataset.page = p[0]; nav.appendChild(b); });
  document.querySelectorAll('[data-icon]').forEach(function (el) { el.replaceWith(icon(el.dataset.icon)); });
  document.querySelectorAll('[data-page]:not(.dashboard-nav-button)').forEach(function (el) { el.addEventListener('click', function () { navigate(el.dataset.page); }); });
  document.getElementById('btn-menu').addEventListener('click', function () { menu(!document.body.classList.contains('menu-open')); });
  document.getElementById('sidebar-scrim').addEventListener('click', function () { menu(false); });
  document.getElementById('btn-search').addEventListener('click', search);
  document.addEventListener('keydown', function (ev) { if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k' && E.State.Config) { ev.preventDefault(); search(); } if (ev.key === 'Escape') menu(false); });
  window.addEventListener('popstate', function () { active = location.hash.slice(1) || 'customize'; if (E.State.Config) E.BuildForms(); });
  var previewDialog = document.getElementById('preview-dialog');
  document.getElementById('btn-preview').addEventListener('click', function () { previewDialog.showModal(); E.SendPreview(); });
  function closePreview() { previewDialog.close(); var frame = document.getElementById('preview-frame'); frame.contentWindow.postMessage({ source: 'aboutu-editor', type: 'preview-pause' }, location.origin); }
  document.getElementById('btn-close-preview').addEventListener('click', closePreview);
  previewDialog.addEventListener('cancel', function (ev) { ev.preventDefault(); closePreview(); });
  document.getElementById('my-page').addEventListener('click', function (ev) {
    ev.preventDefault(); var win = window.open('about:blank', '_blank'); if (win) win.opener = null;
    E.Flush().then(function () { if (win) win.location.href = new URL('../profile.html', location.href).href; }).catch(function () { if (win) win.close(); });
  });
  document.getElementById('btn-share').addEventListener('click', function () {
    var body = node('div'); body.appendChild(node('p', 'page-intro', 'Export your profile and upload the ZIP contents to Vercel, Netlify, or GitHub Pages. Your host gives you a public link to share.'));
    body.appendChild(button('Export website', E.ExportZip, 'primary', 'download')); E.OpenModal('Share Your Profile', body);
  });
  Global.Dashboard = { refresh: refresh, sync: sync, navigate: navigate };
  if (E.State.Config) E.BuildForms();
})(window);
