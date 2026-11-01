(function (Global) {
  'use strict';
  var C = {
    stage: 'tb-93-3c334130', centered: 'tb-19-00d4b0cd', stack: 'tb-6b-6c9a4d69',
    card: 'tb-82-8f867934', modern: 'tb-00-d29502d5', identity: 'tb-de-fbf4b626',
    avatar: 'tb-33-b5793ec5', badges: 'tb-ad-72202e03', badge: 'tb-33-a7e3be74',
    links: 'tb-d7-fb8c6083', link: 'tb-8b-14239d9a', location: 'tb-c9-c79d2a8a', views: 'tb-c4-52afb1ed',
    music: 'tb-7a-b515ab01', cover: 'tb-89-74c71f7d', title: 'tb-4a-ced57475',
    progress: 'tb-fc-03ce5e2f', progressRow: 'tb-5a-9d9e5c3d', fill: 'tb-03-b858da30', thumb: 'tb-0f-890c4356',
    controls: 'tb-91-5d3a15c3', volume: 'tb-90-2f1123ac', volumeFill: 'tb-57-039aee70',
    presence: 'tb-94-1fcf4741', presenceAvatar: 'tb-c8-ce842370', presenceName: 'tb-ff-9ae899fc', presenceText: 'tb-29-07f9604e',
    hero: 'tb-07-9f3b6c9b', server: 'tb-97-571fc87f', clock: 'tb-ff-068e59b5', clockText: 'tb-b8-54e72ad2',
    widgetGrid: 'tb-75-0fd8ed4e', widgetShell: 'tb-78-fd8143c6', dots: 'tb-91-10a31676',
    lyrics: 'tb-5f-a7f2729c', lyricsPanel: 'tb-8a-508a5a8b', tooltip: 'tb-ca-42ad2aff'
  };
  function q(root, key) { return root.querySelector('[class*="' + (C[key] || key) + '"]'); }
  function all(root, key) { return Array.from(root.querySelectorAll('[class*="' + (C[key] || key) + '"]')); }
  function parse(html) { var t = document.createElement('template'); t.innerHTML = html; return t.content.firstElementChild; }
  function text(node, value) { if (node) node.textContent = value; }
  function attr(node, name, value) { if (node) node.setAttribute(name, value); }
  function directText(node, value) {
    if (!node) return;
    Array.from(node.childNodes).filter(function (n) { return n.nodeType === 3; }).forEach(function (n) { n.remove(); });
    node.appendChild(document.createTextNode(value));
  }
  function image(node, src) { if (!node) return; node.hidden = !src; if (src) node.src = src; else node.removeAttribute('src'); }
  function svg(slug) {
    var data = Global.ICONS[slug]; if (!data) return null;
    var node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    node.setAttribute('viewBox', data.viewBox || data.vb || '0 0 24 24');
    node.setAttribute('width', '1em'); node.setAttribute('height', '1em'); node.setAttribute('aria-hidden', 'true');
    node.setAttribute('fill', data.attrs?.fill || 'currentColor');
    if (data.attrs?.stroke) node.setAttribute('stroke', data.attrs.stroke);
    if (data.body) node.innerHTML = data.body;
    else { var p = document.createElementNS(node.namespaceURI, 'path'); p.setAttribute('d', data.d); if (data.fr) p.setAttribute('fill-rule', data.fr); node.appendChild(p); }
    return node;
  }
  function interactive(node, name, callback) {
    if (!node) return;
    node.setAttribute('role', 'button'); node.tabIndex = 0; node.setAttribute('aria-label', name);
    node.addEventListener('click', callback);
    node.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(event); } });
  }
  function time(value) { value = Number.isFinite(value) ? Math.max(0, value) : 0; return Math.floor(value / 60) + ':' + String(Math.floor(value % 60)).padStart(2, '0'); }
  function Apply(root, config, handles, options, cleanups) {
    var reference = Global.PROFILE_REFERENCE_DATA?.[config.Layout.Preset];
    if (!reference) return;
    root.classList.add('pf-reference');
    var layout = reference.kind || config.Layout.Preset, saved = parse(reference.html), stage = q(saved, 'stage');
    var original = root.querySelector('.pf-stage');
    var originalViews = original.querySelector('.pf-views');
    var originalLinks = original.querySelector('.pf-links');
    var originalWidgets = original.querySelector('.pf-widgets');
    var originalPresence = original.querySelector('.pf-presence');
    var name = handles.NameText, bio = handles.Bio;
    var p = config.Profile, theme = config.Theme;
    saved.classList.add('ref-theme');
    stage.classList.add('ref-stage');
    stage.dataset.layout = config.Layout.Preset;
    var profileCard = q(saved, 'card') || q(saved, 'modern') || q(saved, 'hero');
    if (profileCard) profileCard.dataset.profileRole = 'card';
    var tiltTargets = Array.from(saved.querySelectorAll('[style*="perspective("]'));
    if (!tiltTargets.length && profileCard) tiltTargets = [profileCard];
    tiltTargets.forEach(function (node) { node.dataset.profileTilt = ''; });
    var outer = document.createElement('main'); outer.className = 'pf-stage ref-scroll'; outer.appendChild(saved);
    var vars = saved.style;
    function set(key, value) { vars.setProperty('--' + key, value); }
    function color(value, opacity) { return 'color-mix(in srgb, ' + value + ' ' + (opacity * 100) + '%, transparent)'; }
    var opacity = 'calc(' + p.CardOpacity * 100 + '% * var(--pf-card-alpha-number, 1))';
    set('textColor', theme.TextColor); set('iconColor', theme.IconColor); set('textColorDarker', color(theme.TextColor, 0.5));
    set('presenceUsernameColor', theme.TextColor); set('presenceStatusColor', color(theme.TextColor, 0.7));
    set('discordServerMembers', color(theme.TextColor, 0.6)); set('joinStatus', color(theme.TextColor, 0.65));
    set('colorUsernameGlow', theme.UsernameGlow ? '0px 0px ' + (16.5 * theme.GlowStrength) + 'px ' + theme.GlowColor : 'none');
    set('containerColor', 'color-mix(in srgb, ' + theme.CardBackground + ' ' + opacity + ', transparent)');
    var gradient = theme.CardGradient ? 'linear-gradient(25deg,color-mix(in srgb,' + theme.CardGradientFrom + ' ' + opacity + ',transparent),color-mix(in srgb,' + theme.CardGradientTo + ' ' + opacity + ',transparent))' : 'none';
    set('containerGradient', gradient); set('containerBackgroundImage', gradient);
    set('containerBorder', theme.CardBorderWidth + 'px solid ' + theme.CardBorder);
    set('containerBlur', 'calc(' + p.CardBlur + 'px * var(--pf-card-alpha-number,1))');
    set('containerWidth', config.Layout.MaxWidth + 'px'); set('containerRadius', config.Layout.Radius + 'px');
    set('containerPadding', layout === 'guns' ? config.Layout.Padding + 'px 15px' : config.Layout.Padding + 'px');
    set('volumeBackgroundcolor', color(theme.CardBackground, Math.max(0.01, p.CardOpacity))); set('volumeBorder', '2px solid ' + color(theme.TextColor, 0.05));
    ['progessBarPlaying', 'controlButtonPlaying'].forEach(function (k) { set(k, theme.Accent); });
    set('progessBarFull', color(theme.TextColor, 0.3)); set('controlButtonsOther', color(theme.TextColor, 0.5)); set('controlTextColor', color(theme.TextColor, 0.7));
    set('badgeContainerBackground', color(theme.TextColor, layout === 'guns' ? 0.2 : 0.08)); set('badgeContainerBorder', '2px solid ' + color(theme.TextColor, 0.04));
    set('secondTabBackground', color(theme.TextColor, 0.07)); set('secondTabBorder', '2px solid ' + color(theme.TextColor, 0.05));
    set('platformTextColor', color(theme.TextColor, 0.4)); set('secondTabWidgetDescription', color(theme.TextColor, 0.6));

    // Keep the saved header wrappers. Canvas-only names in a browser save have no pixels;
    // their editable text is bound back into the same header position.
    var titleHost;
    if (layout === 'guns') {
      titleHost = q(saved, 'identity');
      var heading = document.createElement('h1'); heading.className = 'ref-name'; heading.appendChild(name);
      titleHost.prepend(heading);
      titleHost.querySelectorAll('canvas').forEach(function (n) { n.parentElement.remove(); });
      titleHost = heading;
    } else if (layout === 'modern') {
      titleHost = saved.querySelector('.username-typewriter');
      var writer = titleHost.querySelector('.Typewriter');
      if (writer) { writer.firstElementChild.replaceChildren(name); writer.lastElementChild.hidden = config.Effects.Username !== 'typewriter'; }
      else titleHost.replaceChildren(name);
      titleHost.classList.add('ref-name');
    } else {
      titleHost = q(saved, 'hero').querySelector('h1'); titleHost.replaceChildren(name); titleHost.classList.add('ref-name');
    }
    attr(name, 'data-profile-role', 'name');
    if (p.Tooltip) { name.dataset.tip = p.Tooltip; name.tabIndex = 0; }
    name.style.textShadow = theme.UsernameGlow ? 'var(--colorUsernameGlow)' : 'none';
    name.style.color = 'var(--textColor)';
    name.style.fontSize = (layout === 'modern' ? 30 : 39) / 16 * theme.FontSize + 'px';
    if (layout === 'portfolio') name.style.fontSize = 36 / 16 * theme.FontSize + 'px';
    if (config.Effects.Username === 'typewriter' && !root.classList.contains('pf-reduced-motion')) {
      var fullName = p.DisplayName, position = fullName.length, deleting = true, nameTimer;
      titleHost.setAttribute('aria-label', fullName);
      function typeName() {
        position += deleting ? -1 : 1; name.textContent = fullName.slice(0, Math.max(0, position));
        var delay = deleting ? 85 : 140;
        if (position <= 0) { deleting = false; delay = 600; }
        if (position >= fullName.length) { deleting = true; delay = 1800; }
        nameTimer = setTimeout(typeName, delay);
      }
      nameTimer = setTimeout(typeName, 1800); cleanups.push(function () { clearTimeout(nameTimer); });
    }
    if (p.ShowUsername && p.UserName) { var user = document.createElement('p'); user.className = 'ref-username'; user.textContent = '@' + p.UserName; titleHost.appendChild(user); }
    var description = saved.querySelector('[data-reveal-part="hero-description"]');
    if (description) { description.replaceChildren(); description.hidden = !p.Bio && !p.BioMessages.length; }
    if (p.Bio || p.BioMessages.length) { bio.className = 'ref-bio'; bio.dataset.profileRole = 'bio'; (description || titleHost).appendChild(bio); }
    if (p.Status || p.StatusMessages.length) { handles.StatusLine.className = 'ref-status'; titleHost.appendChild(handles.StatusLine); }
    var avatar = q(saved, 'avatar');
    if (avatar) { image(avatar.querySelector('img'), p.Avatar); avatar.hidden = !p.Avatar; var av = avatar.querySelector('img'); av.alt = 'Profile picture'; av.style.width = p.AvatarSize + 'px'; av.style.height = p.AvatarSize + 'px'; av.dataset.profileRole = 'avatar'; }
    else if (p.Avatar) {
      avatar = handles.AvatarWrap; avatar.classList.add('ref-portfolio-avatar'); avatar.dataset.revealPart = 'hero-avatar';
      var heroTitle = titleHost.closest('[data-reveal-part="hero-title"]'); (heroTitle || titleHost).before(avatar);
      avatar.querySelector('img').dataset.profileRole = 'avatar';
    }
    handles.AvatarWrap = avatar;

    // Reuse the exact badge and link containers, including their original SVG viewboxes.
    var badgeList = q(saved, 'badges');
    if (!badgeList) { badgeList = document.createElement('div'); badgeList.className = 'tb-ad-72202e03-c9fc57d0-e66456c1'; titleHost.appendChild(badgeList); }
    var badgeInner = q(badgeList, 'tb-f5-a3fa5675') || badgeList;
    badgeInner.replaceChildren();
    var badges = p.Badges.slice();
    if (p.Verified && !badges.some(function (b) { return b.Icon === 'verified'; })) badges.unshift({ Icon: 'verified', Label: 'Verified' });
    badgeList.hidden = !badges.length;
    badges.forEach(function (badge) {
      var wrap = document.createElement('span'); wrap.className = 'tb-ba-7f5364ea-c3a36c5d-b0f3d011';
      var item = document.createElement('div'); item.className = 'tb-33-a7e3be74-7ba891f5-11c92848'; item.dataset.profileRole = 'badge'; item.tabIndex = 0;
      var icon = svg(badge.Icon);
      if (!icon && badge.Icon) { icon = document.createElement('img'); icon.src = badge.Icon; icon.alt = ''; icon.className = 'tb-a2-331a9a55-79687ca1-e102ba79'; }
      if (icon) { icon.style.color = badge.Color || theme.IconColor; icon.style.filter = p.BadgesGlow ? 'drop-shadow(0 0 5px currentColor)' : 'none'; item.appendChild(icon); }
      item.dataset.tip = badge.Label; item.setAttribute('aria-label', badge.Label); wrap.appendChild(item); badgeInner.appendChild(wrap);
    });
    var links = q(saved, 'links');
    if (!links && config.Social.Links.length) { links = document.createElement('div'); links.className = 'tb-d7-fb8c6083-4dc99f7b-a375925f'; (q(saved, 'modern') || titleHost).appendChild(links); }
    if (links) {
      links.replaceChildren(); links.hidden = !config.Social.Links.length; links.dataset.profileRole = 'links';
      config.Social.Links.forEach(function (link) {
        var wrap = document.createElement('div'); wrap.className = 'tb-8b-14239d9a-1d4a3e5a-6c1a2be6';
        var a = document.createElement('a'); a.href = link.Url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', link.Name); a.dataset.tip = link.Name;
        if (link.Mode === 'copy') {
          a.dataset.tip = 'Copy ' + link.Name;
          a.addEventListener('click', function (event) {
            event.preventDefault();
            if (!navigator.clipboard) { a.dataset.tip = 'Copy unavailable'; return; }
            navigator.clipboard.writeText(link.CopyText).then(function () { a.dataset.tip = 'Copied!'; a.dispatchEvent(new Event('pointerenter')); }).catch(function () { a.dataset.tip = 'Copy unavailable'; });
          });
        }
        var icon = svg(link.Icon); if (!icon) { icon = document.createElement('img'); icon.src = link.Icon; icon.alt = ''; }
        icon.style.width = config.Social.IconSize + 'px'; icon.style.height = config.Social.IconSize + 'px';
        a.style.color = config.Social.Monochrome ? theme.IconColor : (link.Color || theme.IconColor);
        icon.style.filter = config.Social.Style === 'glow' ? 'drop-shadow(0 0 6px currentColor)' : 'none';
        if (config.Social.Style === 'boxed') a.classList.add('ref-link-boxed');
        a.appendChild(icon); wrap.appendChild(a); links.appendChild(wrap);
      });
    }
    all(saved, 'location').forEach(function (el) { directText(el, p.Location); el.hidden = !p.Location; el.dataset.profileRole = 'location'; el.dataset.tip = 'Location'; });
    all(saved, 'tb-08-25508449').forEach(function (el) { directText(el, p.Location); el.parentElement.hidden = !p.Location; el.dataset.profileRole = 'location'; });
    var views = q(saved, 'views');
    if (views) { views.hidden = !p.ShowViews; var number = views.querySelector('span span'); if (number) directText(number, originalViews?.textContent.trim() || p.ViewsStart.toLocaleString()); views.dataset.tip = 'Profile Views'; views.dataset.profileRole = 'views'; }

    var expandedPresence = q(saved, 'tb-37-09597e09');
    var presence = q(saved, 'presence') || expandedPresence;
    if (presence) {
      presence.hidden = !config.Presence.Enabled;
      if (presence === expandedPresence) {
        image(presence.querySelector('img[alt="Discord Avatar"]'), config.Presence.Avatar || p.Avatar);
        text(q(presence, 'tb-3c-6a7c3513')?.querySelector('span'), config.Presence.UserName);
        text(presence.querySelector('h3'), config.Presence.Status);
        var activity = q(presence, 'tb-52-52910c19'); if (activity) activity.hidden = true;
        var tag = q(presence, 'tb-9b-72af2915'); if (tag) tag.hidden = true;
        var stateIcon = q(presence, 'tb-22-0c0e9afd'); if (stateIcon) { var stateDot = document.createElement('span'); stateDot.className = 'ref-presence-dot ref-state-' + config.Presence.State; stateIcon.replaceWith(stateDot); }
      }
      image(q(presence, 'presenceAvatar')?.querySelector('img'), config.Presence.Avatar || p.Avatar);
      text(q(presence, 'presenceName')?.querySelector('span'), config.Presence.UserName);
      text(q(presence, 'presenceText'), config.Presence.Status);
      var status = q(presence, 'presenceAvatar')?.querySelector('img:nth-child(2)');
      if (status) { var dot = document.createElement('span'); dot.className = 'ref-presence-dot ref-state-' + config.Presence.State; dot.setAttribute('aria-label', config.Presence.State); status.replaceWith(dot); }
      presence.dataset.profileRole = 'presence';
    } else if (originalPresence) { (q(saved, 'stack') || titleHost.parentElement).appendChild(originalPresence); }

    var server = q(saved, 'server'), clock = q(saved, 'clock');
    if (server) {
      server.closest('[class*="' + C.widgetShell + '"]').hidden = !config.Widgets.Discord.Enabled;
      image(server.querySelector('img'), config.Widgets.Discord.Icon);
      text(server.querySelector('h1'), config.Widgets.Discord.Name);
      var members = server.querySelectorAll('h3 span span');
      directText(members[0], config.Widgets.Discord.Online.toLocaleString() + ' Online'); directText(members[1], config.Widgets.Discord.Members.toLocaleString() + ' Members');
      var join = server.querySelector('a'); join.href = config.Widgets.Discord.Invite; text(join, 'Join'); join.hidden = !config.Widgets.Discord.Invite;
      server.dataset.profileRole = 'server';
    }
    if (clock) {
      clock.closest('[class*="' + C.widgetShell + '"]').hidden = !config.Widgets.Clock.Enabled;
      clock.dataset.profileRole = 'clock'; clock.dataset.tip = config.Widgets.Clock.Timezone;
      var clockSvg = clock.querySelector('svg');
      var hands = clockSvg ? Array.from(clockSvg.querySelectorAll('g')).filter(function (group) { return group.querySelector('line[x1="35"][y1="35"]'); }) : [];
      function tick() {
        var date = new Date(), zone = config.Widgets.Clock.Timezone;
        var panel = q(clock, 'clockText'), h = panel.querySelector('h1'); h.dataset.profileRole = 'clock-time';
        h.textContent = date.toLocaleTimeString('en-GB', { timeZone: zone });
        var parts = date.toLocaleTimeString('en-GB', { timeZone: zone, hour12: false }).split(':').map(Number);
        var angles = [parts[0] % 12 * 30 + parts[1] / 2 + parts[2] / 120, parts[1] * 6 + parts[2] / 10, parts[2] * 6];
        hands.forEach(function (group, i) { group.style.transform = 'rotate(' + angles[i] + 'deg)'; });
        var detail = panel.querySelector('h3'); detail.dataset.profileRole = 'clock-date';
        detail.textContent = date.toLocaleDateString('en-US', { timeZone: zone, weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + zone.split('/').pop().replaceAll('_', ' ');
        text(panel.querySelector('div span'), 'Your time: ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      }
      tick(); var clockTimer = setInterval(tick, 1000); cleanups.push(function () { clearInterval(clockTimer); });
    }
    if (originalWidgets) {
      if (server) originalWidgets.querySelector('.pf-server')?.remove();
      if (clock) originalWidgets.querySelector('.pf-clock')?.remove();
      if (saved.querySelector('[data-reveal-part="custom-body"]')) originalWidgets.querySelector('.pf-quote')?.remove();
      if (originalWidgets.children.length) (q(saved, 'stack') || q(saved, 'centered') || q(saved, 'hero')).appendChild(originalWidgets);
    }

    // Bind editable content to the original portfolio section and project wrappers.
    var portfolio = config.Portfolio;
    saved.querySelectorAll('[data-reveal-part="about-root"]').forEach(function (node) {
      text(node.querySelector('h1'), portfolio.AboutTitle); text(node.querySelector('p'), portfolio.AboutText);
    });
    saved.querySelectorAll('[data-reveal-part="about-secondary"]').forEach(function (node) {
      var content = node.querySelector('[data-link-style]') || node.lastElementChild;
      content.textContent = portfolio.AboutDetails; content.style.whiteSpace = 'pre-line';
    });
    saved.querySelectorAll('[data-reveal-part="about-tags"]').forEach(function (node) {
      var item = node.querySelector('[data-reveal-part="about-tag-item"]')?.cloneNode(true); node.replaceChildren();
      portfolio.Tags.forEach(function (label) { var tag = item ? item.cloneNode(true) : document.createElement('span'); tag.textContent = label; node.appendChild(tag); });
    });
    saved.querySelectorAll('[data-reveal-part="projects-grid"]').forEach(function (grid, index) {
      var template = grid.querySelector('[data-reveal-part="project-card-item"]').cloneNode(true);
      var section = grid.closest('[class*="tb-a7-42c2b4ef"]');
      text(section.querySelector('h1'), portfolio.ProjectTitles[index] || 'Projects'); grid.replaceChildren();
      portfolio.Projects.filter(function (project) { return project.Section === index; }).forEach(function (project) {
        var card = template.cloneNode(true); card.href = project.Url; card.dataset.profileRole = 'project'; card.setAttribute('aria-label', project.Title);
        text(card.querySelector('h2'), project.Title); text(card.querySelector('p'), project.Description);
        var background = q(card, 'tb-12-ec678af2'); if (background) background.style.backgroundImage = project.Image ? 'url(' + JSON.stringify(project.Image) + ')' : 'none';
        grid.appendChild(card);
      });
    });
    var lastFmAvatar = saved.querySelector('img[alt="Last.fm Avatar"]');
    if (lastFmAvatar) {
      var lastFm = lastFmAvatar.closest('[class*="' + C.widgetShell + '"]'); lastFm.hidden = !portfolio.LastFm.Enabled; lastFm.dataset.profileRole = 'lastfm';
      image(lastFmAvatar, p.Avatar); text(lastFm.querySelector('h1'), portfolio.LastFm.UserName);
      var numbers = lastFm.querySelectorAll('h3 span span'); directText(numbers[0], portfolio.LastFm.Scrobbles.toLocaleString() + ' Scrobbles'); directText(numbers[1], portfolio.LastFm.Artists.toLocaleString() + ' Artists');
      lastFm.querySelectorAll('a').forEach(function (a) { a.href = 'https://last.fm/user/' + encodeURIComponent(portfolio.LastFm.UserName); text(a, 'View profile'); });
    }
    saved.querySelectorAll('[data-reveal-part="custom-body"]').forEach(function (node) {
      node.hidden = !config.Widgets.Quote.Enabled; node.replaceChildren();
      var heading = document.createElement('h2'), author = document.createElement('p'); heading.textContent = config.Widgets.Quote.Text; author.textContent = config.Widgets.Quote.Author; node.append(heading, author);
    });
    saved.querySelectorAll('img:not([src])').forEach(function (img) { img.hidden = true; });
    var music = q(saved, 'music'), audio = handles.Music?.Audio;
    if (audio) { audio.hidden = true; root.appendChild(audio); }
    if (music) {
      music.hidden = !config.Music.Enabled; music.dataset.profileRole = 'music';
      image(q(music, 'cover'), config.Music.Cover); text(q(music, 'title'), config.Music.Title || 'Untitled');
      var coverBg = q(music, 'tb-0a-392f124d'); if (coverBg) coverBg.style.backgroundImage = config.Music.Cover ? 'url(' + JSON.stringify(config.Music.Cover) + ')' : 'none';
      if (audio) {
        audio.hidden = true; root.appendChild(audio);
        var tracks = config.Music.Tracks.length ? config.Music.Tracks : [{ Src: config.Music.Src, Cover: config.Music.Cover, Title: config.Music.Title, Lyrics: '' }];
        var trackIndex = Math.min(config.Music.TrackIndex, tracks.length - 1);
        tracks[trackIndex] = Object.assign({}, tracks[trackIndex], { Src: config.Music.Src, Cover: config.Music.Cover, Title: config.Music.Title });
        audio.loop = tracks.length === 1 && config.Music.Loop;
        var progress = q(music, 'progress'), progressRow = q(music, 'progressRow'), fill = q(music, 'fill'), thumb = q(music, 'thumb');
        var buttons = q(music, 'controls').children, play = buttons[1];
        var timeNodes = Array.from(progressRow.children).filter(function (n) { return n.tagName === 'SPAN'; });
        function playback() { var playing = !audio.paused && !audio.ended; play.replaceChildren(svg(playing ? 'pause' : 'play')); play.setAttribute('aria-label', playing ? 'Pause music' : 'Play music'); }
        function updateTime() {
          text(timeNodes[0], time(audio.currentTime)); text(timeNodes[1], time(audio.duration));
          var pct = audio.duration ? Math.min(100, audio.currentTime / audio.duration * 100) : 0;
          fill.style.width = pct + '%'; thumb.style.left = pct + '%'; progress.setAttribute('aria-valuenow', String(Math.round(pct)));
          syncLyrics();
        }
        interactive(play, 'Play music', function () { if (audio.paused) audio.play().catch(playback); else audio.pause(); });
        interactive(buttons[0], 'Previous track', function () { changeTrack((trackIndex - 1 + tracks.length) % tracks.length, !audio.paused); });
        interactive(buttons[2], 'Next track', function () { changeTrack((trackIndex + 1) % tracks.length, !audio.paused); });
        progress.setAttribute('role', 'slider'); progress.setAttribute('aria-label', 'Seek'); progress.setAttribute('aria-valuemax', '100');
        var dragging = false;
        function seek(event) { var box = progress.getBoundingClientRect(); if (audio.duration && box.width) audio.currentTime = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)) * audio.duration; updateTime(); }
        progress.addEventListener('pointerdown', function (e) { dragging = true; progress.setPointerCapture(e.pointerId); seek(e); });
        progress.addEventListener('pointermove', function (e) { if (dragging) seek(e); });
        ['pointerup', 'pointercancel'].forEach(function (type) { progress.addEventListener(type, function () { dragging = false; }); });
        progress.addEventListener('keydown', function (e) { if (!isFinite(audio.duration)) return; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + (e.key === 'ArrowRight' ? 5 : -5))); } });
        ['play', 'pause', 'ended'].forEach(function (e) { audio.addEventListener(e, playback); });
        ['timeupdate', 'loadedmetadata'].forEach(function (e) { audio.addEventListener(e, updateTime); });
        var lyrics = q(music, 'lyrics'), lines = [], rows = [], lyricTemplate = lyrics?.firstElementChild?.cloneNode(true);
        function buildLyrics(track) {
          if (!lyrics) return;
          lines = String(track.Lyrics || '').split(/\r?\n/).map(function (line) {
            var match = /^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/.exec(line);
            return match ? { time: Number(match[1]) * 60 + Number(match[2]), text: match[3] } : null;
          }).filter(Boolean);
          lyrics.replaceChildren(); q(music, 'lyricsPanel').hidden = !lines.length;
          rows = lines.map(function (line, i) {
            var row = lyricTemplate.cloneNode(true); row.className = 'tb-2e-d242fe25-ffd8fad1-13d3e894'; row.dataset.lyricsLine = i;
            text(row.firstElementChild, line.text);
            interactive(row, line.text || 'Instrumental', function () { audio.currentTime = line.time; updateTime(); });
            lyrics.appendChild(row); return row;
          });
          syncLyrics();
        }
        function syncLyrics() {
          if (!lines || !rows) return;
          var current = 0; lines.forEach(function (line, i) { if (line.time <= audio.currentTime) current = i; });
          rows.forEach(function (row, i) {
            var offset = i - current; row.style.setProperty('--lyrics-line-offset', offset);
            row.classList.toggle('tb-4a-47d44945-22d13b20-20f78547', offset === 0);
            row.classList.toggle('tb-c5-db06c013-692dacc5-962a153e', Math.abs(offset) <= 1);
            row.classList.toggle('tb-bf-2bf24bb0-5db579c3-b9b1813d', offset < 0);
            row.classList.toggle('tb-59-d51bd889-d18dc8c2-de301fe0', offset > 4 || offset < -1);
            row.setAttribute('aria-current', String(offset === 0));
          });
        }
        function changeTrack(index, playNow) {
          trackIndex = index; var track = tracks[index];
          audio.src = track.Src; audio.load();
          text(q(music, 'title'), track.Title || 'Untitled'); image(q(music, 'cover'), track.Cover);
          if (coverBg) coverBg.style.backgroundImage = track.Cover ? 'url(' + JSON.stringify(track.Cover) + ')' : 'none';
          buildLyrics(track); updateTime();
          if (playNow) audio.play().catch(playback);
        }
        audio.addEventListener('ended', function () { if (trackIndex + 1 < tracks.length || config.Music.Loop) changeTrack((trackIndex + 1) % tracks.length, true); });
        buildLyrics(tracks[trackIndex]); playback(); updateTime();
      }
    }
    var volume = q(saved, 'volume');
    if (volume) {
      volume.hidden = !config.Controls.Enabled || !config.Controls.Volume || !audio;
      if (audio) {
        var input = volume.querySelector('input'), volumeIcon = volume.firstElementChild;
        input.setAttribute('aria-label', 'Music volume'); input.value = Math.round(audio.volume * 100);
        var vfill = q(volume, 'volumeFill');
        function volumeSync() { vfill.style.width = (audio.muted ? 0 : audio.volume * 100) + '%'; input.value = audio.muted ? 0 : Math.round(audio.volume * 100); volumeIcon.setAttribute('aria-label', audio.muted ? 'Unmute music' : 'Mute music'); }
        input.addEventListener('input', function () { audio.volume = Number(input.value) / 100; audio.muted = audio.volume === 0; volumeSync(); });
        interactive(volumeIcon, 'Mute music', function () { audio.muted = !audio.muted; volumeSync(); }); volumeSync();
      }
    }
    var oldControls = root.querySelector('.pf-controls');
    if (oldControls) {
      if (volume || !config.Controls.Volume) oldControls.querySelectorAll('.pf-control-mute,.pf-control-volume,.pf-control-sep').forEach(function (n) { n.remove(); });
      if (!oldControls.children.length) oldControls.remove();
    }
    if (config.Background.Effect === 'old-tv' && reference.overlay) { root.classList.remove('pf-effect-old-tv'); var overlay = parse(reference.overlay); overlay.classList.add('ref-tv-overlay'); root.appendChild(overlay); }
    var video = root.querySelector('.pf-bg video');
    if (video) { video.style.width = '112%'; video.style.height = '112%'; video.style.left = '-6%'; video.style.top = '-6%'; }

    if (Global.ProfileSections) Global.ProfileSections.Attach(root, saved, config, cleanups);
    // Tooltips use the saved tooltip shell, positioned for the current viewport.
    var tooltip = document.createElement('span'); tooltip.className = 'tb-ca-42ad2aff-c7e7db33-534468e1'; tooltip.dataset.placement = 'top'; tooltip.dataset.visible = 'false'; tooltip.setAttribute('role', 'tooltip');
    root.appendChild(tooltip);
    saved.querySelectorAll('[data-tip]').forEach(function (node) {
      function show() { text(tooltip, node.dataset.tip); tooltip.dataset.visible = 'true'; var box = node.getBoundingClientRect(); var t = tooltip.getBoundingClientRect(); tooltip.style.left = Math.max(8, Math.min(innerWidth - t.width - 8, box.left + box.width / 2 - t.width / 2)) + 'px'; tooltip.style.top = Math.max(8, box.top - t.height - 9) + 'px'; }
      function hide() { tooltip.dataset.visible = 'false'; }
      node.addEventListener('pointerenter', show); node.addEventListener('pointerleave', hide); node.addEventListener('focus', show); node.addEventListener('blur', hide);
    });
    original.replaceWith(outer);
    if (Global.ProfileMotion) cleanups.push(Global.ProfileMotion.Attach(root, saved, config));
  }
  Global.ReferenceProfile = { Apply: Apply };
})(window);
