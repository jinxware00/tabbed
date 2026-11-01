(function (Global) {
  'use strict';
  var web = 'assets/web/';
  var catalog = [
    { id:'tokyo', name:'Tokyo Nights', layout:'guns', wallpaper:'tokyo', accent:'#8ce9ed', description:'City lights, a centered profile, and a compact player.' },
    { id:'alpine', name:'Alpine', layout:'modern', wallpaper:'alpine', accent:'#bad6ff', description:'Mountain air, a floating avatar, and a card that moves with you.' },
    { id:'aurora', name:'Northern Lights', layout:'portfolio', wallpaper:'aurora', accent:'#a6efc8', description:'An open profile with room for your community and music.' },
    { id:'coast', name:'Coastline', layout:'guns', wallpaper:'coast', accent:'#a3ddf0', description:'A living ocean backdrop with sections for your work and community.' },
    { id:'sakura', name:'Wildflower', layout:'modern', wallpaper:'sakura', accent:'#f5dda0', description:'Golden flowers, soft spring colors, and a simple introduction.' },
    { id:'forest', name:'Evergreen', layout:'portfolio', wallpaper:'forest', accent:'#bdd9a8', description:'A quiet forest setting for your music, interests, and favorite words.' }
  ];
  var sources={tokyo:'1513407030348-c983a97b98d8',alpine:'1464822759023-fed622ff2c3b',aurora:'1531366936337-7c912a4589a7',sakura:'1490750967868-88aa4486c946',forest:'1448375240586-882707db888b'};
  function make(t) {
    t.mediaSource=t.id==='coast'?'https://commons.wikimedia.org/wiki/File:Ocean_in_Sommaroy.webm':'https://images.unsplash.com/photo-'+sources[t.id];
    var patch = {
      Profile: { UserName:'yourname', DisplayName:'', Avatar:web+'avatar.webp', Verified:false, ShowUsername:false, Bio:'Creating little things. Collecting good moments.', ViewsStart:0, CardOpacity:.22, CardBlur:12, Badges:[{Icon:'code',Label:'Creator'},{Icon:'heart',Label:'Good energy'},{Icon:'applemusic',Label:'Music lover'}] },
      Layout: { Preset:t.layout, MaxWidth: ['guns','modern'].includes(t.layout)?640:1024, Radius:22, Padding:30 },
      Theme: { Font:'satoshi', Accent:t.accent, IconColor:t.accent, TextColor:'#f4f7fb', MutedColor:'#c3cbd5', GlowColor:t.accent, GlowStrength:.6, CardBackground:'#10151f', CardBorder:'rgba(255,255,255,.1)', CardBorderWidth:1, CardShadow:'0 20px 70px #0004' },
      Background: { Type:'image', Image:web+t.wallpaper+'.webp', Video:'', Color:'#10151f', Overlay:.38, Effect:'none', GradientAnimated:false },
      Effects: { Username:'none', Particles:{Enabled:true,Type:'dust',Count:20,Speed:.25}, CursorTrail:{Enabled:false,Type:'stars',Color:t.accent}, NameGlitch:{Enabled:false}, AvatarGlitch:{Enabled:false}, Tilt:{Enabled:true,Intensity:7}, Grain:{Enabled:false}, Vignette:{Enabled:false}, EntryScreen:{Enabled:true,Text:'click to enter',Subtitle:'Welcome to my little corner of the internet.',Symbol:'✦',Blur:14,Dim:.35} },
      Music: { Enabled:false, Src:'', Title:'', Cover:'', Tracks:[], TrackIndex:0, Autoplay:false, Volume:.35 },
      Presence: { Enabled:false, UserName:'yourname', Avatar:'', Status:'', State:'online' },
      Social: { IconSize:32, Monochrome:true, Style:'glow', Links:[{Service:'github',Icon:'github',Name:'GitHub',Url:'https://github.com/'},{Service:'youtube',Icon:'youtube',Name:'YouTube',Url:'https://youtube.com/'},{Service:'spotify',Icon:'spotify',Name:'Spotify',Url:'https://open.spotify.com/'}] },
      Cursor: { Image:'' }, Controls:{Enabled:true,Volume:true,Opacity:false},
      Widgets:{Discord:{Enabled:false,Name:'Your community',Icon:'',Invite:'',Online:0,Members:0},Clock:{Enabled:true,Timezone:'Europe/London',Label:'Local time'},Quote:{Enabled:false,Text:'A space for what matters to you.',Author:''}},
      Portfolio: { AboutTitle:'A little about me',AboutText:'Curious by nature. Always making something new.',AboutDetails:'This is where my ideas, favorite things, and latest projects live. Stay a while and explore.',Tags:['Creating','Music','Exploring'],ProjectTitles:['My work','My community'],Projects:[],LastFm:{Enabled:false,UserName:'yourname',Scrobbles:0,Artists:0} }
    };
    if (t.layout==='portfolio' || t.layout==='reverie') { patch.Profile.CardOpacity=0; patch.Theme.CardBorderWidth=0; }
    if (t.id==='coast') {
      patch.Background.Type='video'; patch.Background.Video=web+'ocean.webm'; patch.Background.Image=web+'ocean-poster.webp';
      patch.Portfolio.Projects=[{Section:0,Title:'Your project',Description:'Add a project and make it yours.',Image:web+'coast.webp',Service:'github',Icon:'github',Url:'https://github.com/'},{Section:1,Title:'Your community',Description:'Bring your people together.',Image:web+'forest.webp',Service:'discord',Icon:'discord',Url:'https://discord.gg/'}];
    }
    return Object.assign({},t,{thumbnail:web+(t.id==='coast'?'ocean':t.wallpaper)+'-thumb.webp',config:Global.ProfileRuntime.ValidateConfig(patch).Config});
  }
  Global.PROFILE_TEMPLATES=catalog.map(make);
  Global.PROFILE_LAYOUTS=[{value:'guns',label:'Centered'},{value:'modern',label:'Split'},{value:'portfolio',label:'Fullscreen'}];
  Global.TemplateIdentity=function (template, current) {
    var next=structuredClone(template.config), profile=current?.Profile || {};
    next.Profile.UserName=profile.UserName || 'yourname';
    next.Profile.DisplayName=(profile.DisplayName || '').trim() || next.Profile.UserName;
    next.Profile.Avatar=profile.Avatar || web+'avatar.webp';
    next.Presence.UserName=next.Profile.DisplayName; next.Presence.Avatar=next.Profile.Avatar;
    return next;
  };
  Global.TemplateParts=[
    {id:'background',label:'Wallpaper',description:'Background image or video and its overlay.',selected:true},
    {id:'style',label:'Colors and styling',description:'Colors, typography, card appearance, and icon style.',selected:true},
    {id:'layout',label:'Profile layout',description:'Centered, Split, or Fullscreen.',selected:true},
    {id:'entry',label:'Click-to-enter screen',description:'The welcome prompt, icon, and background blur.',selected:true},
    {id:'effects',label:'Motion and effects',description:'Ambient particles, cursor effects, and card tilt.',selected:true},
    {id:'bio',label:'Description and status',description:'The template’s introduction and status text.'},
    {id:'badges',label:'Badges',description:'Decorative interests and creator badges.'},
    {id:'links',label:'Links',description:'Starter service links. Add your own profile paths afterwards.'},
    {id:'widgets',label:'Widgets and sections',description:'About, interests, projects, clock, community, and quote.'},
    {id:'music',label:'Music',description:'Audio, cover, playlist, and player settings.'}
  ];
  Global.ApplyTemplateParts=function(template,current,parts){
    var next=structuredClone(current),source=Global.TemplateIdentity(template,current);
    function copy(target,from,keys){keys.forEach(key=>target[key]=structuredClone(from[key]));}
    if(parts.includes('background'))next.Background=structuredClone(source.Background);
    if(parts.includes('style')){next.Theme=structuredClone(source.Theme);copy(next.Profile,source.Profile,['CardOpacity','CardBlur','AvatarSize','BadgesGlow']);copy(next.Social,source.Social,['IconSize','Monochrome','Style']);}
    if(parts.includes('layout'))next.Layout=structuredClone(source.Layout);
    if(parts.includes('entry'))next.Effects.EntryScreen=structuredClone(source.Effects.EntryScreen);
    if(parts.includes('effects')){copy(next.Effects,source.Effects,Object.keys(source.Effects).filter(key=>key!=='EntryScreen'));next.Cursor=structuredClone(source.Cursor);}
    if(parts.includes('bio'))copy(next.Profile,source.Profile,['Bio','BioMessages','Status','StatusMessages']);
    if(parts.includes('badges'))copy(next.Profile,source.Profile,['Badges','Verified']);
    if(parts.includes('links'))next.Social.Links=structuredClone(source.Social.Links);
    if(parts.includes('widgets')){next.Widgets=structuredClone(source.Widgets);next.Portfolio=structuredClone(source.Portfolio);next.Presence=structuredClone(source.Presence);}
    if(parts.includes('music'))next.Music=structuredClone(source.Music);
    return Global.ProfileRuntime.ValidateConfig(next).Config;
  };
  Global.TemplateAliases={cinematic:'tokyo',jinx:'tokyo',nocturne:'alpine',myr:'alpine',panorama:'aurora',yotme:'aurora',showcase:'coast',afterglow:'sakura',reverie:'forest'};
  // Remove only known imported demonstration content when opening an older local draft.
  Global.CleanLegacyDraft=function (raw) {
    if (!raw || raw.TemplateRevision>=2) return raw;
    var theme=Global.PROFILE_TEMPLATES.find(t=>t.layout===raw.Layout?.Preset)||Global.PROFILE_TEMPLATES[0];
    var next=Global.CleanLegacyFields?Global.CleanLegacyFields(structuredClone(raw),theme.config):structuredClone(raw), changed=false;
    var legacyUrl=value=>typeof value==='string' && (/assets\/(?:examples|reference)\//.test(value) && !/\/(?:satoshi|chillax|technor)\.woff2$/.test(value) || /(?:r2|assets)\.guns\.lol\//.test(value));
    function scrub(obj){if(!obj||typeof obj!=='object')return;Object.keys(obj).forEach(key=>{if(legacyUrl(obj[key])){obj[key]='';changed=true;}else if(typeof obj[key]==='object')scrub(obj[key]);});} scrub(next);
    var oldNames=['jinxware00','Cisek','ksrv','deal','nomad','yotme','!Myr'];
    ['UserName','DisplayName'].forEach(k=>{if(oldNames.includes(next.Profile?.[k])){next.Profile[k]=k==='UserName'?'yourname':'';changed=true;}});
    if(changed){
      var theme=Global.PROFILE_TEMPLATES.find(t=>t.layout===next.Layout?.Preset)||Global.PROFILE_TEMPLATES[0];
      if(!next.Background?.Image&&!next.Background?.Video)next.Background=structuredClone(theme.config.Background);
      if(!next.Profile.Avatar || next.Profile.Avatar==='assets/avatar.svg')next.Profile.Avatar=web+'avatar.webp';
      if(next.Music && !next.Music.Src)next.Music=structuredClone(theme.config.Music);
      if(next.Profile.Badges)next.Profile.Badges=next.Profile.Badges.filter(b=>b.Icon);
      if(next.Social)next.Social.Links=next.Social.Links.filter(l=>!oldNames.some(n=>String(l.Url).includes(n)));
      next.Profile.ViewsStart=0;
    }
    if(next.Profile?.Avatar==='assets/avatar.svg')next.Profile.Avatar=web+'avatar.webp';
    if(next.Social)next.Social.Links=(next.Social.Links||[]).filter(l=>l.Url);
    if(next.Profile)next.Profile.Badges=(next.Profile.Badges||[]).filter(b=>b.Icon);
    if(next.Music){next.Music.Tracks=(next.Music.Tracks||[]).filter(t=>t.Src);if(!next.Music.Src)next.Music.Enabled=false;}
    next.TemplateRevision=2; return next;
  };
})(window);
