(function (Global) {
  'use strict';
  var Services = [
    { slug: "globe", label: "Website", url: "https://" },
    { slug: "github", label: "GitHub", url: "https://github.com/" },
    { slug: "x", label: "X", url: "https://x.com/" },
    { slug: "instagram", label: "Instagram", url: "https://instagram.com/" },
    { slug: "tiktok", label: "TikTok", url: "https://tiktok.com/@" },
    { slug: "youtube", label: "YouTube", url: "https://youtube.com/@" },
    { slug: "twitch", label: "Twitch", url: "https://twitch.tv/" },
    { slug: "discord", label: "Discord", url: "https://discord.gg/" },
    { slug: "spotify", label: "Spotify", url: "https://open.spotify.com/user/" },
    { slug: "applemusic", label: "Apple Music", url: "https://music.apple.com/" },
    { slug: "soundcloud", label: "SoundCloud", url: "https://soundcloud.com/" },
    { slug: "bandcamp", label: "Bandcamp", url: "https://bandcamp.com/" },
    { slug: "reddit", label: "Reddit", url: "https://reddit.com/user/" },
    { slug: "steam", label: "Steam", url: "https://steamcommunity.com/id/" },
    { slug: "roblox", label: "Roblox", url: "https://roblox.com/users/" },
    { slug: "telegram", label: "Telegram", url: "https://t.me/" },
    { slug: "whatsapp", label: "WhatsApp", url: "https://wa.me/" },
    { slug: "snapchat", label: "Snapchat", url: "https://snapchat.com/add/" },
    { slug: "pinterest", label: "Pinterest", url: "https://pinterest.com/" },
    { slug: "bluesky", label: "Bluesky", url: "https://bsky.app/profile/" },
    { slug: "threads", label: "Threads", url: "https://threads.net/@" },
    { slug: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/" },
    { slug: "vk", label: "VK", url: "https://vk.com/" },
    { slug: "gitlab", label: "GitLab", url: "https://gitlab.com/" },
    { slug: "devdotto", label: "DEV", url: "https://dev.to/" },
    { slug: "medium", label: "Medium", url: "https://medium.com/@" },
    { slug: "substack", label: "Substack", url: "https://substack.com/@" },
    { slug: "linktree", label: "Linktree", url: "https://linktr.ee/" },
    { slug: "bilibili", label: "Bilibili", url: "https://space.bilibili.com/" },
    { slug: "pixiv", label: "Pixiv", url: "https://pixiv.me/" },
    { slug: "rumble", label: "Rumble", url: "https://rumble.com/user/" },
    { slug: "kick", label: "Kick", url: "https://kick.com/" },
    { slug: "vimeo", label: "Vimeo", url: "https://vimeo.com/" },
    { slug: "patreon", label: "Patreon", url: "https://patreon.com/" },
    { slug: "kofi", label: "Ko-fi", url: "https://ko-fi.com/" },
    { slug: "buymeacoffee", label: "Buy Me a Coffee", url: "https://buymeacoffee.com/" },
    { slug: "paypal", label: "PayPal", url: "https://paypal.me/" },
    { slug: "cashapp", label: "Cash App", url: "https://cash.app/$" },
    { slug: "venmo", label: "Venmo", url: "https://venmo.com/u/" },
    { slug: "dropbox", label: "Dropbox", url: "https://dropbox.com/" },
    { slug: "facebook", label: "Facebook", url: "https://facebook.com/" },
    { slug: "etsy", label: "Etsy", url: "https://etsy.com/shop/" },
    { slug: "ebay", label: "eBay", url: "https://ebay.com/usr/" },
    { slug: "lastdotfm", label: "Last.fm", url: "https://last.fm/user/" },
    { slug: "figma", label: "Figma", url: "https://figma.com/@" },
    { slug: "mail", label: "Email", url: "mailto:" },
    { slug: "link", label: "Link", url: "https://" }
  ];
  Services = Services.filter(function (s) { return s.slug !== 'globe' && s.slug !== 'link'; });
  Services.push({ slug: 'namemc', label: 'NameMC', url: 'https://namemc.com/profile/' });
  Services.push({ slug: 'tracker', label: 'Tracker', url: 'https://tracker.gg/' }, { slug: 'osu', label: 'osu!', url: 'https://osu.ppy.sh/users/' });
  function Get(slug) { return Services.find(function (s) { return s.slug === slug; }) || null; }
  function ForLink(link) {
    if (link.Service) return Get(link.Service);
    var icon = Get(link.Icon); if (icon) return icon;
    return Services.find(function (s) { return String(link.Url || '').indexOf(s.url) === 0; }) || null;
  }
  function Suffix(service, value) {
    if (!service) return '';
    value = String(value || '').trim();
    if (value.indexOf(service.url) === 0) return value.slice(service.url.length);
    return '';
  }
  function Build(service, suffix) {
    service = typeof service === 'string' ? Get(service) : service;
    if (!service) return '';
    suffix = String(suffix || '').trim();
    if (suffix.indexOf(service.url) === 0) suffix = suffix.slice(service.url.length);
    if (/[\\\\\x00-\x20\x7f]/.test(suffix) || /^[a-z][a-z0-9+.-]*:/i.test(suffix) || /^\/\//.test(suffix)) return service.url;
    if (service.slug === 'mail') return !suffix || /^[^@?&#]+@[^@?&#]+\.[^@?&#]+$/.test(suffix) ? service.url + suffix : service.url;
    try {
      var base = new URL(service.url), url = new URL(service.url + suffix);
      if (url.origin !== base.origin || url.username || url.password || !url.pathname.startsWith(base.pathname)) return service.url;
      return service.url + suffix;
    } catch (_) { return service.url; }
  }
  Global.ProfileServices = { List: Services, Get: Get, ForLink: ForLink, Suffix: Suffix, Build: Build };
})(typeof window !== 'undefined' ? window : globalThis);
