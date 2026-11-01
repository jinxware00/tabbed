(function (Global) {
  "use strict";

  var ICONS = Global.ICONS || {};

  var FONT_FAMILIES = {
    custom: { Label: 'Custom font', Stack: 'ProfileCustomFont, sans-serif' },
    satoshi: { Label: 'Satoshi', Stack: 'Satoshi, sans-serif' },
    system: { Label: "System UI", Stack: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    inter: { Label: "Inter", Stack: '"Inter", system-ui, sans-serif', Google: "Inter:wght@400;500;600;700" },
    poppins: { Label: "Poppins", Stack: '"Poppins", system-ui, sans-serif', Google: "Poppins:wght@400;500;600;700" },
    montserrat: { Label: "Montserrat", Stack: '"Montserrat", system-ui, sans-serif', Google: "Montserrat:wght@400;500;600;700" },
    outfit: { Label: "Outfit", Stack: '"Outfit", system-ui, sans-serif', Google: "Outfit:wght@400;500;600;700" },
    space: { Label: "Space Grotesk", Stack: '"Space Grotesk", system-ui, sans-serif', Google: "Space+Grotesk:wght@400;500;600;700" },
    jetbrains: { Label: "JetBrains Mono", Stack: '"JetBrains Mono", ui-monospace, monospace', Google: "JetBrains+Mono:wght@400;500;600" },
    playfair: { Label: "Playfair Display", Stack: '"Playfair Display", Georgia, serif', Google: "Playfair+Display:wght@400;600;700" },
    bebas: { Label: "Bebas Neue", Stack: '"Bebas Neue", Impact, sans-serif', Google: "Bebas+Neue" },
    caveat: { Label: "Caveat", Stack: '"Caveat", cursive', Google: "Caveat:wght@500;600;700" }
  };

  var BADGE_COLORS = {
    verified: "#3b9dff",
    premium: "#a06bff",
    gem: "#a06bff",
    staff: "#ff5c5c",
    bug: "#ff9f43",
    legend: "#ff8a3d",
    flame: "#ff8a3d",
    shield: "#4ad991",
    star: "#ffd23f",
    heart: "#ff5c8a",
    crown: "#ffd23f",
    gift: "#ff7ac6",
    trophy: "#ffd23f",
    bolt: "#4ad991",
    rocket: "#ff7ac6",
    booster: "#ff7ac6",
    early: "#4ad991",
    code: "#5bc0eb",
    developer: "#5bc0eb",
    key: "#ffd23f",
    owner: "#ff5c5c",
    partner: "#4ad991"
  };

  var DEFAULT_CONFIG = {
    Version: 1,
    TemplateRevision: 2,
    MediaCredits: [],
    Meta: {
      Description: "",
      AnimatedTitle: false,
      Favicon: "assets/favicon.svg"
    },
    Profile: {
      UserName: "yourname",
      ShowUsername: true,
      AvatarSize: 118,
      BadgesGlow: false,
      DisplayName: "",
      Verified: true,
      Avatar: "assets/web/avatar.webp",
      Banner: "",
      Bio: "",
      BioMessages: [],
      Location: "",
      Status: "",
      StatusMessages: [],
      StatusTypewriter: true,
      Tooltip: "",
      Badges: [],
      ShowViews: true,
      ViewsStart: 0,
      CardOpacity: 0.45,
      CardBlur: 14
    },
    Presence: {
      Enabled: false,
      Platform: "Discord",
      UserName: "",
      Status: "",
      Avatar: "",
      State: "online"
    },
    Layout: {
      Preset: "classic",
      MaxWidth: 440,
      Radius: 28,
      Padding: 26
    },
    Theme: {
      Accent: "#9fd0ff",
      IconColor: "#9fd0ff",
      CardGradient: false,
      CardGradientFrom: "#17121f",
      CardGradientTo: "#34213b",
      TextColor: "#dbe9ff",
      MutedColor: "rgba(219,233,255,0.62)",
      GlowColor: "rgba(120,170,255,0.85)",
      GlowStrength: 0.8,
      UsernameGlow: true,
      Font: "outfit",
      FontCustomUrl: "",
      FontSize: 16,
      CardBackground: "rgba(10,12,20,0.45)",
      CardBorder: "rgba(255,255,255,0.08)",
      CardBorderWidth: 1,
      CardShadow: "0 18px 60px rgba(0,0,0,0.45)",
      CardBlur: 14,
      AccentGradient: ""
    },
    Background: {
      Type: "gradient",
      Effect: "none",
      Color: "#07080d",
      GradientFrom: "#0b1020",
      GradientTo: "#1b0f2a",
      GradientAngle: 145,
      GradientAnimated: true,
      Image: "",
      Video: "",
      Overlay: 0.35,
      Blur: 0
    },
    Effects: {
      Username: "none",
      Particles: { Enabled: true, Type: "stars", Color: "#9fd0ff", Count: 70, Parallax: 0.06 },
      CursorTrail: { Enabled: true, Type: 'stars', Color: "#cfe4ff", Size: 3, Glow: 10 },
      NameGlitch: { Enabled: true, Intensity: 1 },
      AvatarGlitch: { Enabled: false, Intensity: 1 },
      Tilt: { Enabled: true, Intensity: 10 },
      Grain: { Enabled: true, Opacity: 0.05 },
      Vignette: { Enabled: true, Strength: 0.5 },
      EntryScreen: { Enabled: true, Symbol: "*", Text: "click to enter", Icon: '', Subtitle: '', Blur: 16, Dim: 0.55 }
    },
    Music: {
      Enabled: false,
      Title: "",
      Artist: "",
      Src: "",
      Cover: "",
      Tracks: [],
      TrackIndex: 0,
      Volume: 0.7,
      Loop: true,
      Autoplay: false
    },
    Social: {
      IconSize: 34,
      Style: "glow",
      Monochrome: false,
      Links: []
    },
    Cursor: {
      Image: "",
      HotspotX: 4,
      HotspotY: 4
    },
    Controls: {
      Enabled: false,
      Volume: true,
      Opacity: true
    },
    Portfolio: {
      AboutTitle: 'About me', AboutText: '', AboutDetails: '', Tags: [],
      ProjectTitles: [], Projects: [],
      LastFm: { Enabled: false, UserName: 'yourname', Scrobbles: 0, Artists: 0 }
    },
    Widgets: {
      Discord: { Enabled: false, Name: "My community", Invite: "", Icon: "", Online: 0, Members: 0 },
      Clock: { Enabled: false, Timezone: "Europe/London", Label: "My local time" },
      Quote: { Enabled: false, Text: "", Author: "" }
    }
  };

  var PARTICLE_MODES = ["stars", "rain", "snow", "embers", "dust"];

  function IsPlainObject(Value) {
    return Value !== null && typeof Value === "object" && !Array.isArray(Value);
  }

  function MergeDeep(Base, Patch) {
    var Out = {};
    var Key;
    for (Key in Base) {
      if (!Object.prototype.hasOwnProperty.call(Base, Key)) continue;
      var Value = Base[Key];
      Out[Key] = Array.isArray(Value) ? Value.slice() : (IsPlainObject(Value) ? MergeDeep(Value, {}) : Value);
    }
    if (!IsPlainObject(Patch)) return Out;
    for (Key in Patch) {
      if (!Object.prototype.hasOwnProperty.call(Patch, Key)) continue;
      if (!(Key in Out)) continue;
      if (IsPlainObject(Out[Key]) && IsPlainObject(Patch[Key])) {
        Out[Key] = MergeDeep(Out[Key], Patch[Key]);
      } else if (Array.isArray(Out[Key])) {
        if (Array.isArray(Patch[Key])) Out[Key] = Patch[Key].slice();
      } else if (Patch[Key] !== undefined && Patch[Key] !== null) {
        Out[Key] = Patch[Key];
      }
    }
    return Out;
  }

  function ToNumber(Value, Fallback, Min, Max) {
    var N = typeof Value === "number" ? Value : parseFloat(Value);
    if (!isFinite(N)) return Fallback;
    if (typeof Min === "number" && N < Min) return Min;
    if (typeof Max === "number" && N > Max) return Max;
    return N;
  }

  function ToBoolean(Value, Fallback) {
    if (typeof Value === "boolean") return Value;
    if (Value === "true" || Value === 1 || Value === "1") return true;
    if (Value === "false" || Value === 0 || Value === "0") return false;
    return Fallback;
  }

  function ToText(Value, Fallback, MaxLength) {
    if (typeof Value !== "string") return Fallback;
    var Out = Value;
    if (typeof MaxLength === "number" && Out.length > MaxLength) Out = Out.slice(0, MaxLength);
    return Out;
  }

  function ToStringList(Value, Max, MaxLength) {
    if (typeof Value === "string") Value = Value.split(/\r?\n/);
    if (!Array.isArray(Value)) return [];
    return Value.map(function (Item) {
      return ToText(Item, "", MaxLength);
    }).filter(function (Item) {
      return Item && Item.trim();
    }).slice(0, Max);
  }

  function SanitizeUrl(Value, Warnings, Label) {
    if (typeof Value !== "string") return "";
    var Trimmed = Value.trim();
    if (!Trimmed) return "";
    if (/^(javascript|vbscript|data:text\/html)/i.test(Trimmed)) {
      if (Warnings) Warnings.push("Blocked unsafe URL for " + (Label || "a field"));
      return "";
    }
    return Trimmed;
  }

  function SanitizeColor(Value, Fallback) {
    if (typeof Value !== "string") return Fallback;
    var Trimmed = Value.trim();
    if (!Trimmed) return Fallback;
    if (/^(#|rgb|hsl|hwb|oklch|color\(|var\(|[a-z]+$)/i.test(Trimmed)) return Trimmed;
    return Fallback;
  }

  function ValidateConfig(Raw) {
    var Warnings = [];
    var Patch = IsPlainObject(Raw) ? Raw : {};
    if (!IsPlainObject(Raw) && Raw !== undefined) Warnings.push("Config was not an object, using defaults");
    var Config = MergeDeep(DEFAULT_CONFIG, Patch);

    Config.Version = 1;

    Config.Meta.Description = ToText(Config.Meta.Description, "", 300);
    Config.Meta.AnimatedTitle = ToBoolean(Config.Meta.AnimatedTitle, false);
    Config.Meta.Favicon = SanitizeUrl(Config.Meta.Favicon, Warnings, "favicon") || DEFAULT_CONFIG.Meta.Favicon;

    var Profile = Config.Profile;
    Profile.ShowUsername = ToBoolean(Profile.ShowUsername, true);
    Profile.AvatarSize = ToNumber(Profile.AvatarSize, 118, 48, 200);
    Profile.BadgesGlow = ToBoolean(Profile.BadgesGlow, false);
    Profile.UserName = ToText(Profile.UserName, DEFAULT_CONFIG.Profile.UserName, 64).replace(/\s+/g, "");
    if (!Profile.UserName) Profile.UserName = DEFAULT_CONFIG.Profile.UserName;
    Profile.DisplayName = ToText(Profile.DisplayName, Profile.UserName, 80).trim();
    if (!Profile.DisplayName) Profile.DisplayName = Profile.UserName;
    Profile.Verified = ToBoolean(Profile.Verified, true);
    Profile.Avatar = SanitizeUrl(Profile.Avatar, Warnings, "avatar");
    Profile.Banner = SanitizeUrl(Profile.Banner, Warnings, "banner");
    Profile.Bio = ToText(Profile.Bio, "", 400);
    Profile.BioMessages = ToStringList(Profile.BioMessages, 12, 400);
    Profile.Location = ToText(Profile.Location, "", 80);
    Profile.Status = ToText(Profile.Status, "", 240);
    Profile.StatusMessages = ToStringList(Profile.StatusMessages, 12, 240);
    Profile.StatusTypewriter = ToBoolean(Profile.StatusTypewriter, true);
    Profile.Tooltip = ToText(Profile.Tooltip, "", 120);
    Profile.ShowViews = ToBoolean(Profile.ShowViews, true);
    Profile.ViewsStart = Math.max(0, Math.floor(ToNumber(Profile.ViewsStart, 0, 0, 1e12)));
    Profile.CardOpacity = ToNumber(Profile.CardOpacity, 0.45, 0, 1);
    Profile.CardBlur = ToNumber(Profile.CardBlur, 14, 0, 100);

    if (!Array.isArray(Profile.Badges)) Profile.Badges = [];
    Profile.Badges = Profile.Badges.slice(0, 24).map(function (Badge) {
      if (!IsPlainObject(Badge)) return null;
      var Icon = Badge.Icon;
      if (typeof Icon === "string" && !ICONS[Icon] && !BADGE_COLORS[Icon]) {
        Icon = SanitizeUrl(Icon, Warnings, "badge icon");
      } else if (typeof Icon !== "string") {
        Icon = "";
      }
      return {
        Icon: Icon || "",
        Label: ToText(Badge.Label, "", 60),
        Color: SanitizeColor(Badge.Color, "")
      };
    }).filter(function (Badge) { return Badge && (Badge.Icon || Badge.Label); });

    var Presence = Config.Presence;
    Presence.Enabled = ToBoolean(Presence.Enabled, false);
    Presence.Platform = ToText(Presence.Platform, "Discord", 40);
    Presence.UserName = ToText(Presence.UserName, "", 80);
    Presence.Status = ToText(Presence.Status, "", 140);
    Presence.Avatar = SanitizeUrl(Presence.Avatar, Warnings, "presence avatar");
    var States = { online: 1, idle: 1, dnd: 1, offline: 1 };
    Presence.State = States[Presence.State] ? Presence.State : "online";

    var Layout = Config.Layout;
    var LayoutAliases = {classic:'guns',hero:'guns',minimal:'guns',showcase:'guns',afterglow:'modern',reverie:'portfolio'};
    Layout.Preset = LayoutAliases[Layout.Preset] || Layout.Preset;
    if (!['guns','modern','portfolio'].includes(Layout.Preset)) Layout.Preset='guns';
    Layout.MaxWidth = Math.floor(ToNumber(Layout.MaxWidth, 440, 260, 1200));
    Layout.Radius = ToNumber(Layout.Radius, 28, 0, 200);
    Layout.Padding = ToNumber(Layout.Padding, 26, 10, 80);

    var Theme = Config.Theme;
    Theme.Accent = SanitizeColor(Theme.Accent, DEFAULT_CONFIG.Theme.Accent);
    Theme.IconColor = SanitizeColor(Theme.IconColor, Theme.Accent);
    Theme.CardGradient = ToBoolean(Theme.CardGradient, false);
    Theme.CardGradientFrom = SanitizeColor(Theme.CardGradientFrom, '#17121f');
    Theme.CardGradientTo = SanitizeColor(Theme.CardGradientTo, '#34213b');
    Theme.TextColor = SanitizeColor(Theme.TextColor, DEFAULT_CONFIG.Theme.TextColor);
    Theme.MutedColor = SanitizeColor(Theme.MutedColor, DEFAULT_CONFIG.Theme.MutedColor);
    Theme.GlowColor = SanitizeColor(Theme.GlowColor, DEFAULT_CONFIG.Theme.GlowColor);
    Theme.GlowStrength = ToNumber(Theme.GlowStrength, 0.8, 0, 3);
    Theme.UsernameGlow = ToBoolean(Theme.UsernameGlow, true);
    if (!FONT_FAMILIES[Theme.Font]) Theme.Font = "outfit";
    Theme.FontCustomUrl = SanitizeUrl(Theme.FontCustomUrl, Warnings, "custom font");
    Theme.FontSize = ToNumber(Theme.FontSize, 16, 12, 24);
    Theme.CardBackground = ToText(Theme.CardBackground, DEFAULT_CONFIG.Theme.CardBackground, 80);
    Theme.CardBorder = ToText(Theme.CardBorder, DEFAULT_CONFIG.Theme.CardBorder, 80);
    Theme.CardBorderWidth = ToNumber(Theme.CardBorderWidth, 1, 0, 12);
    Theme.CardShadow = ToText(Theme.CardShadow, DEFAULT_CONFIG.Theme.CardShadow, 120);
    Theme.CardBlur = ToNumber(Theme.CardBlur, 14, 0, 60);
    Theme.AccentGradient = ToText(Theme.AccentGradient, "", 160);

    var Background = Config.Background;
    if (['none', 'old-tv', 'aurora', 'plasma', 'night', 'blurred'].indexOf(Background.Effect) === -1) Background.Effect = 'none';
    var BgTypes = { color: 1, gradient: 1, image: 1, video: 1 };
    Background.Type = BgTypes[Background.Type] ? Background.Type : "gradient";
    Background.Color = SanitizeColor(Background.Color, DEFAULT_CONFIG.Background.Color);
    Background.GradientFrom = SanitizeColor(Background.GradientFrom, DEFAULT_CONFIG.Background.GradientFrom);
    Background.GradientTo = SanitizeColor(Background.GradientTo, DEFAULT_CONFIG.Background.GradientTo);
    Background.GradientAngle = ToNumber(Background.GradientAngle, 145, 0, 360);
    Background.GradientAnimated = ToBoolean(Background.GradientAnimated, true);
    Background.Image = SanitizeUrl(Background.Image, Warnings, "background image");
    Background.Video = SanitizeUrl(Background.Video, Warnings, "background video");
    Background.Overlay = ToNumber(Background.Overlay, 0.35, 0, 0.95);
    Background.Blur = ToNumber(Background.Blur, 0, 0, 40);
    if (Background.Type === "image" && !Background.Image) { Background.Type = "gradient"; Warnings.push("Background image missing, using gradient"); }
    if (Background.Type === "video" && !Background.Video) { Background.Type = "gradient"; Warnings.push("Background video missing, using gradient"); }

    var Effects = Config.Effects;
    if (['none', 'rainbow', 'sparkle', 'pulse', 'fuzzy', 'typewriter'].indexOf(Effects.Username) === -1) Effects.Username = 'none';
    Effects.Particles.Enabled = ToBoolean(Effects.Particles.Enabled, true);
    if (PARTICLE_MODES.indexOf(Effects.Particles.Type) === -1) Effects.Particles.Type = "stars";
    Effects.Particles.Color = SanitizeColor(Effects.Particles.Color, DEFAULT_CONFIG.Theme.Accent);
    Effects.Particles.Count = Math.floor(ToNumber(Effects.Particles.Count, 70, 0, 240));
    Effects.Particles.Parallax = ToNumber(Effects.Particles.Parallax, 0.06, 0, 0.5);
    Effects.CursorTrail.Enabled = ToBoolean(Effects.CursorTrail.Enabled, true);
    Effects.CursorTrail.Type = ['stars', 'cat'].includes(Effects.CursorTrail.Type) ? Effects.CursorTrail.Type : 'stars';
    Effects.CursorTrail.Color = SanitizeColor(Effects.CursorTrail.Color, "#cfe4ff");
    Effects.CursorTrail.Size = ToNumber(Effects.CursorTrail.Size, 3, 1, 12);
    Effects.CursorTrail.Glow = ToNumber(Effects.CursorTrail.Glow, 10, 0, 40);
    Effects.NameGlitch.Enabled = ToBoolean(Effects.NameGlitch.Enabled, true);
    Effects.NameGlitch.Intensity = ToNumber(Effects.NameGlitch.Intensity, 1, 0, 3);
    Effects.AvatarGlitch.Enabled = ToBoolean(Effects.AvatarGlitch.Enabled, false);
    Effects.AvatarGlitch.Intensity = ToNumber(Effects.AvatarGlitch.Intensity, 1, 0, 3);
    Effects.Tilt.Enabled = ToBoolean(Effects.Tilt.Enabled, true);
    Effects.Tilt.Intensity = ToNumber(Effects.Tilt.Intensity, 10, 0, 30);
    Effects.Grain.Enabled = ToBoolean(Effects.Grain.Enabled, true);
    Effects.Grain.Opacity = ToNumber(Effects.Grain.Opacity, 0.05, 0, 0.4);
    Effects.Vignette.Enabled = ToBoolean(Effects.Vignette.Enabled, true);
    Effects.Vignette.Strength = ToNumber(Effects.Vignette.Strength, 0.5, 0, 1);
    Effects.EntryScreen.Enabled = ToBoolean(Effects.EntryScreen.Enabled, true);
    Effects.EntryScreen.Symbol = ToText(Effects.EntryScreen.Symbol, "*", 8);
    Effects.EntryScreen.Text = ToText(Effects.EntryScreen.Text, "click to enter", 40);
    Effects.EntryScreen.Blur = ToNumber(Effects.EntryScreen.Blur, 16, 0, 60);
    Effects.EntryScreen.Dim = ToNumber(Effects.EntryScreen.Dim, 0.55, 0, 0.95);
    Effects.EntryScreen.Icon = SanitizeUrl(Effects.EntryScreen.Icon, Warnings, 'entry icon');
    Effects.EntryScreen.Subtitle = ToText(Effects.EntryScreen.Subtitle, '', 160);

    var Music = Config.Music;
    Music.Enabled = ToBoolean(Music.Enabled, false);
    Music.Title = ToText(Music.Title, "", 120);
    Music.Artist = ToText(Music.Artist, "", 120);
    Music.Src = SanitizeUrl(Music.Src, Warnings, "music source");
    Music.Cover = SanitizeUrl(Music.Cover, Warnings, "music cover");
    Music.Tracks = (Array.isArray(Music.Tracks) ? Music.Tracks : []).slice(0, 32).filter(IsPlainObject).map(function (track) {
      return { Src: SanitizeUrl(track.Src, Warnings, 'playlist audio'), Cover: SanitizeUrl(track.Cover, Warnings, 'playlist cover'), Title: ToText(track.Title, 'Untitled', 200), Lyrics: ToText(track.Lyrics, '', 40000) };
    });
    Music.TrackIndex = Math.floor(ToNumber(Music.TrackIndex, 0, 0, Math.max(0, Music.Tracks.length - 1)));
    Music.Volume = ToNumber(Music.Volume, 0.7, 0, 1);
    Music.Loop = ToBoolean(Music.Loop, true);
    Music.Autoplay = ToBoolean(Music.Autoplay, false);
    if (Music.Enabled && !Music.Src) { Music.Enabled = false; Warnings.push("Music enabled without a source, player hidden"); }

    var Social = Config.Social;
    Social.IconSize = ToNumber(Social.IconSize, 34, 18, 72);
    var SocialStyles = { glow: 1, boxed: 1, plain: 1 };
    Social.Style = SocialStyles[Social.Style] ? Social.Style : "glow";
    Social.Monochrome = ToBoolean(Social.Monochrome, false);
    if (!Array.isArray(Social.Links)) Social.Links = [];
    Social.Links = Social.Links.slice(0, 24).map(function (Link) {
      if (!IsPlainObject(Link)) return null;
      var Service = Global.ProfileServices && Global.ProfileServices.ForLink(Link);
      if (!Service) { Warnings.push('Unknown link service'); return null; }
      var Url = Global.ProfileServices.Build(Service, Global.ProfileServices.Suffix(Service, Link.Url));
      if (!Url) return null;
      return {
        Name: ToText(Link.Name, "Link", 60),
        Service: Service.slug,
        Mode: Link.Mode === 'copy' ? 'copy' : 'link',
        CopyText: ToText(Link.CopyText, '', 200),
        Url: Url,
        Icon: SanitizeUrl(ToText(Link.Icon, "", 4000000), Warnings, "social icon"),
        Color: SanitizeColor(Link.Color, "")
      };
    }).filter(Boolean);

    var Cursor = Config.Cursor;
    Cursor.Image = SanitizeUrl(Cursor.Image, Warnings, "cursor");
    Cursor.HotspotX = Math.floor(ToNumber(Cursor.HotspotX, 4, 0, 128));
    Cursor.HotspotY = Math.floor(ToNumber(Cursor.HotspotY, 4, 0, 128));

    var Controls = Config.Controls;
    Controls.Enabled = ToBoolean(Controls.Enabled, false);
    Controls.Volume = ToBoolean(Controls.Volume, true);
    Controls.Opacity = ToBoolean(Controls.Opacity, true);

    var Widgets = Config.Widgets;
    Widgets.Discord.Enabled = ToBoolean(Widgets.Discord.Enabled, false);
    Widgets.Discord.Name = ToText(Widgets.Discord.Name, 'My community', 80);
    Widgets.Discord.Invite = SanitizeUrl(Widgets.Discord.Invite, Warnings, 'Discord invite');
    Widgets.Discord.Icon = SanitizeUrl(Widgets.Discord.Icon, Warnings, 'Discord server icon');
    Widgets.Discord.Online = ToNumber(Widgets.Discord.Online, 0, 0, 1e9);
    Widgets.Discord.Members = ToNumber(Widgets.Discord.Members, 0, 0, 1e9);
    Widgets.Clock.Enabled = ToBoolean(Widgets.Clock.Enabled, false);
    Widgets.Clock.Label = ToText(Widgets.Clock.Label, 'My local time', 80);
    Widgets.Clock.Timezone = ToText(Widgets.Clock.Timezone, 'Europe/London', 80);
    try { new Intl.DateTimeFormat('en', { timeZone: Widgets.Clock.Timezone }); } catch (Err) { Widgets.Clock.Timezone = 'Europe/London'; }
    Widgets.Quote.Enabled = ToBoolean(Widgets.Quote.Enabled, false);
    Widgets.Quote.Text = ToText(Widgets.Quote.Text, '', 800);
    Widgets.Quote.Author = ToText(Widgets.Quote.Author, '', 80);

    var Portfolio = Config.Portfolio;
    Portfolio.AboutTitle = ToText(Portfolio.AboutTitle, 'About me', 100);
    Portfolio.AboutText = ToText(Portfolio.AboutText, '', 800);
    Portfolio.AboutDetails = ToText(Portfolio.AboutDetails, '', 2000);
    Portfolio.Tags = ToStringList(Portfolio.Tags, 12, 40);
    Portfolio.ProjectTitles = ToStringList(Portfolio.ProjectTitles, 4, 100);
    Portfolio.Projects = (Array.isArray(Portfolio.Projects) ? Portfolio.Projects : []).slice(0, 24).filter(IsPlainObject).map(function (project) {
      var service = Global.ProfileServices.ForLink(project) || Global.ProfileServices.Get('github');
      return { Section: Math.floor(ToNumber(project.Section, 0, 0, 3)), Title: ToText(project.Title, 'Project', 100), Description: ToText(project.Description, '', 300), Image: SanitizeUrl(project.Image, Warnings, 'project image'), Service: service.slug, Icon: service.slug, Url: Global.ProfileServices.Build(service, Global.ProfileServices.Suffix(service, project.Url)) };
    });
    Portfolio.LastFm.Enabled = ToBoolean(Portfolio.LastFm.Enabled, false);
    Portfolio.LastFm.UserName = ToText(Portfolio.LastFm.UserName, 'yourname', 80).replace(/[^a-zA-Z0-9_-]/g, '');
    Portfolio.LastFm.Scrobbles = ToNumber(Portfolio.LastFm.Scrobbles, 0, 0, 1e9);
    Portfolio.LastFm.Artists = ToNumber(Portfolio.LastFm.Artists, 0, 0, 1e9);

    return { Config: Config, Warnings: Warnings };
  }

  function H(Tag, Props, Children) {
    var El = document.createElement(Tag);
    if (Props) {
      for (var Key in Props) {
        if (!Object.prototype.hasOwnProperty.call(Props, Key)) continue;
        var Value = Props[Key];
        if (Value === null || Value === undefined || Value === false) continue;
        if (Key === "class") El.className = Value;
        else if (Key === "text") El.textContent = Value;
        else if (Key === "style" && typeof Value === "object") {
          for (var S in Value) if (Object.prototype.hasOwnProperty.call(Value, S)) El.style[S] = Value[S];
        } else if (Key.slice(0, 2) === "on" && typeof Value === "function") {
          El.addEventListener(Key.slice(2).toLowerCase(), Value);
        } else if (Key === "dataset" && typeof Value === "object") {
          for (var D in Value) if (Object.prototype.hasOwnProperty.call(Value, D)) El.dataset[D] = Value[D];
        } else {
          El.setAttribute(Key, Value === true ? "" : String(Value));
        }
      }
    }
    if (Children) {
      (Array.isArray(Children) ? Children : [Children]).forEach(function (Child) {
        if (Child === null || Child === undefined || Child === false) return;
        El.appendChild(typeof Child === "string" ? document.createTextNode(Child) : Child);
      });
    }
    return El;
  }

  function MakeIcon(Slug, ExtraClass) {
    var Data = ICONS[Slug];
    if (!Data) return null;
    var NS = "http://www.w3.org/2000/svg";
    var Svg = document.createElementNS(NS, "svg");
    Svg.setAttribute("viewBox", Data.viewBox || Data.vb || "0 0 24 24");
    Svg.setAttribute("aria-hidden", "true");
    Svg.setAttribute("focusable", "false");
    if (ExtraClass) Svg.setAttribute("class", ExtraClass);
    if (Data.body) { Svg.innerHTML = Data.body; Svg.setAttribute('fill', Data.attrs?.fill || 'currentColor'); if (Data.attrs?.stroke) Svg.setAttribute('stroke', Data.attrs.stroke); return Svg; }
    var Path = document.createElementNS(NS, "path");
    Path.setAttribute("d", Data.d);
    if (Data.fr) Path.setAttribute("fill-rule", Data.fr);
    Path.setAttribute("fill", "currentColor");
    Svg.appendChild(Path);
    return Svg;
  }

  function IsUrl(Value) {
    return typeof Value === "string" && (/^(https?:|data:|blob:|\/|\.\/|\.\.\/)/i.test(Value.trim()) || Value.indexOf('/') >= 0 || /\.[a-z0-9]+(?:[?#]|$)/i.test(Value));
  }

  function ResolveIconNode(IconValue, Name, ExtraClass) {
    if (ICONS[IconValue]) {
      var Node = MakeIcon(IconValue, ExtraClass || "pf-social-svg");
      if (Node) return Node;
    }
    if (IconValue && IsUrl(IconValue)) {
      return H("img", { class: ExtraClass || "pf-social-img", src: IconValue, alt: "", loading: "lazy", decoding: "async" });
    }
    return H("span", { class: "pf-social-fallback", text: (Name || "?").slice(0, 1) });
  }

  function LoadGoogleFont(Family) {
    var Info = FONT_FAMILIES[Family];
    if (!Info || !Info.Google) return;
    var Id = "pf-font-" + Family;
    if (document.getElementById(Id)) return;
    var Link = H("link", {
      id: Id,
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=" + Info.Google + "&display=swap"
    });
    document.head.appendChild(Link);
  }

  function LoadCustomFont(Url) {
    if (!Url) return;
    var Id = "pf-custom-font";
    var Style = document.getElementById(Id);
    if (!Style) { Style = H('style', { id: Id }); document.head.appendChild(Style); }
    if (Style.dataset.url !== Url) { Style.dataset.url = Url; Style.textContent = "@font-face{font-family:'ProfileCustomFont';src:url(" + JSON.stringify(Url) + ");font-display:swap;}"; }
  }

  function ReducedMotionPreferred() {
    return Global.matchMedia && Global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function SetVar(Root, Name, Value) {
    Root.style.setProperty(Name, Value);
  }

  function ApplyTheme(Root, Config) {
    var Theme = Config.Theme;
    var Family = FONT_FAMILIES[Theme.Font] || FONT_FAMILIES.system;
    SetVar(Root, "--pf-accent", Theme.Accent);
    SetVar(Root, "--pf-icon-color", Theme.IconColor);
    SetVar(Root, "--pf-avatar-size", Config.Profile.AvatarSize + 'px');
    SetVar(Root, "--pf-text", Theme.TextColor);
    SetVar(Root, "--pf-muted", Theme.MutedColor);
    SetVar(Root, "--pf-glow", Theme.GlowColor);
    SetVar(Root, "--pf-glow-strength", String(Theme.GlowStrength));
    SetVar(Root, "--pf-font-size", Theme.FontSize + "px");
    var CardBg = 'color-mix(in srgb, ' + (Config.Theme.CardBackground || '#0a0c14') + ' ' + (Config.Profile.CardOpacity * 100) + '%, transparent)';
    // Normalize existing rgba backgrounds so opacity has one source of truth.
    var Match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(Config.Theme.CardBackground);
    if (Match) CardBg = 'rgba(' + Match[1] + ',' + Match[2] + ',' + Match[3] + ',' + Config.Profile.CardOpacity + ')';
    var GradientOpacity = 'calc(' + (Config.Profile.CardOpacity * 100) + '% * var(--pf-card-alpha-number, 1))';
    SetVar(Root, '--pf-card-gradient', Theme.CardGradient ? 'linear-gradient(25deg, color-mix(in srgb, ' + Theme.CardGradientFrom + ' ' + GradientOpacity + ', transparent), color-mix(in srgb, ' + Theme.CardGradientTo + ' ' + GradientOpacity + ', transparent))' : 'none');
    SetVar(Root, "--pf-card-bg", CardBg);
    SetVar(Root, "--pf-card-border", Theme.CardBorder);
    SetVar(Root, "--pf-card-border-width", Theme.CardBorderWidth + "px");
    SetVar(Root, "--pf-card-shadow", Theme.CardShadow);
    SetVar(Root, "--pf-card-blur", (Config.Profile.CardBlur ?? Theme.CardBlur) + "px");
    SetVar(Root, "--pf-card-alpha-pct", "100%");
    SetVar(Root, "--pf-card-alpha-number", "1");
    SetVar(Root, "--pf-max-width", Config.Layout.MaxWidth + "px");
    SetVar(Root, "--pf-radius", Config.Layout.Radius + "px");
    SetVar(Root, "--pf-padding", Config.Layout.Padding + "px");
    SetVar(Root, "--pf-icon-size", Config.Social.IconSize + "px");
    SetVar(Root, "--pf-bg-color", Config.Background.Color);
    SetVar(Root, "--pf-gradient-from", Config.Background.GradientFrom);
    SetVar(Root, "--pf-gradient-to", Config.Background.GradientTo);
    SetVar(Root, "--pf-gradient-angle", Config.Background.GradientAngle + "deg");
    SetVar(Root, "--pf-overlay", String(Config.Background.Overlay));
    SetVar(Root, "--pf-bg-blur", Config.Background.Blur + "px");
    SetVar(Root, '--pf-effect-color', Config.Effects.Particles.Color);
    SetVar(Root, "--pf-accent-gradient", Theme.AccentGradient || ("linear-gradient(120deg, " + Theme.Accent + ", " + Theme.TextColor + ")"));
    SetVar(Root, "--pf-grain-opacity", Config.Effects.Grain.Enabled ? String(Config.Effects.Grain.Opacity) : "0");
    SetVar(Root, "--pf-vignette-opacity", Config.Effects.Vignette.Enabled ? String(Config.Effects.Vignette.Strength) : "0");
    SetVar(Root, "--pf-username-glow", Theme.UsernameGlow ? Theme.GlowColor : "transparent");
    Root.classList.toggle("pf-icons-mono", !!Config.Social.Monochrome);
    Root.classList.toggle('pf-badges-glow', Config.Profile.BadgesGlow);
    Root.classList.add('pf-effect-' + Config.Background.Effect);
    Root.classList.add('pf-username-' + Config.Effects.Username);
    if (Theme.FontCustomUrl) {
      LoadCustomFont(Theme.FontCustomUrl);
      SetVar(Root, "--pf-font-family", "'ProfileCustomFont', " + Family.Stack);
    } else {
      SetVar(Root, "--pf-font-family", Family.Stack);
      if (Theme.Font !== "system") LoadGoogleFont(Theme.Font);
    }
  }

  function BuildBackground(Config) {
    var Bg = Config.Background;
    var Layer = H("div", { class: "pf-bg" });
    if (Bg.Type === "video" && !ReducedMotionPreferred()) {
      var Video = H("video", {
        class: "pf-bg-media",
        autoplay: !document.hidden,
        loop: true,
        muted: true,
        playsinline: true,
        poster: Bg.Image,
        src: Bg.Video
      });
      Video.addEventListener("error", function () {
        Layer.classList.add("pf-bg-fallback");
      });
      Layer.appendChild(Video);
    } else if ((Bg.Type === "image" || Bg.Type === "video") && Bg.Image) {
      var Img = H("img", { class: "pf-bg-media", src: Bg.Image, alt: "" });
      Img.addEventListener("error", function () {
        Layer.classList.add("pf-bg-fallback");
      });
      Layer.appendChild(Img);
    } else {
      Layer.classList.add(Bg.Type === 'color' ? 'pf-bg-solid' : 'pf-bg-fallback');
      if (Bg.Type === "gradient" && Bg.GradientAnimated && !ReducedMotionPreferred()) {
        Layer.classList.add("pf-bg-animated");
      }
    }
    Layer.appendChild(H("div", { class: "pf-overlay" }));
    return Layer;
  }

  function BuildEntry(Config) {
    var Entry = Config.Effects.EntryScreen;
    var El = H("div", {
      class: "pf-entry",
      role: "button",
      tabindex: "0",
      "aria-label": "Enter profile"
    }, [
      H("div", { class: "pf-entry-inner" }, [
        Entry.Icon ? H('img', {class:'pf-entry-icon',src:Entry.Icon,alt:''}) : Entry.Symbol ? H("span", { class: "pf-entry-symbol", text: Entry.Symbol }) : null,
        H("span", { class: "pf-entry-text", text: Entry.Text || 'click to enter' }),
        Entry.Subtitle ? H('span', {class:'pf-entry-subtitle',text:Entry.Subtitle}) : null
      ])
    ]);
    El.style.setProperty("--pf-entry-blur", Entry.Blur + "px");
    El.style.setProperty("--pf-entry-dim", String(Entry.Dim));
    return El;
  }

  function FormatTime(Seconds) {
    if (!isFinite(Seconds) || Seconds < 0) Seconds = 0;
    var M = Math.floor(Seconds / 60);
    var S = Math.floor(Seconds % 60);
    return M + ":" + (S < 10 ? "0" : "") + S;
  }

  function BuildMusicPlayer(Config) {
    var Music = Config.Music;
    var Audio = H("audio", { class: "pf-audio", preload: "metadata", crossorigin: "anonymous" });
    Audio.src = Music.Src;
    Audio.loop = Music.Loop;
    Audio.volume = Math.max(0, Math.min(1, Music.Volume ?? 0.7));

    var Cover = Music.Cover
      ? H("img", { class: "pf-music-cover", src: Music.Cover, alt: "" })
      : H("div", { class: "pf-music-cover pf-music-cover-blank" });

    var PlayIcon = MakeIcon("play", "pf-music-play-icon pf-music-play-icon-play");
    var PauseIcon = MakeIcon("pause", "pf-music-play-icon pf-music-play-icon-pause");
    var PlayBtn = H("button", { class: "pf-music-control pf-music-play", type: "button", "aria-label": "Play music" }, [PlayIcon, PauseIcon]);
    var PrevBtn = H("button", { class: "pf-music-control pf-music-prev", type: "button", "aria-label": "Back 10 seconds" }, [MakeIcon("skip-prev", "pf-music-control-icon")]);
    var NextBtn = H("button", { class: "pf-music-control pf-music-next", type: "button", "aria-label": "Forward 10 seconds" }, [MakeIcon("skip-next", "pf-music-control-icon")]);

    var TimeStart = H("span", { class: "pf-music-time", text: "0:00" });
    var TimeEnd = H("span", { class: "pf-music-time", text: "0:00" });
    var TrackFill = H("div", { class: "pf-music-track-fill" });
    var TrackHandle = H("div", { class: "pf-music-track-handle" });
    var TrackBg = H("div", { class: "pf-music-track-bg" });
    var Track = H("div", {
      class: "pf-music-track",
      tabindex: "0",
      role: "slider",
      "aria-label": "Seek",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": "0"
    }, [TrackBg, TrackFill, TrackHandle]);
    var ProgressRow = H("div", { class: "pf-music-progress-row" }, [TimeStart, Track, TimeEnd]);

    var Title = H("span", { class: "pf-music-title", text: Music.Title || "Untitled" });
    var Artist = H("span", { class: "pf-music-artist", text: Music.Artist || "" });
    var EqBars = H("span", { class: "pf-music-eq", "aria-hidden": "true" }, [
      H("span", { class: "pf-music-eq-bar" }),
      H("span", { class: "pf-music-eq-bar" }),
      H("span", { class: "pf-music-eq-bar" })
    ]);

    var Player = H("div", { class: "pf-music", role: "group", "aria-label": "Music player" }, [
      H("div", { class: "pf-music-body" }, [
        Cover,
        H("div", { class: "pf-music-info" }, [
          H("div", { class: "pf-music-title-row" }, [EqBars, Title]),
          Artist.textContent ? Artist : null,
          H("div", { class: "pf-music-progress-area" }, [
            ProgressRow,
            H("div", { class: "pf-music-controls" }, [PrevBtn, PlayBtn, NextBtn])
          ])
        ])
      ])
    ]);

    function SetFill(Ratio) {
      Ratio = Math.max(0, Math.min(1, Ratio));
      var Pct = (Ratio * 100).toFixed(2) + "%";
      TrackFill.style.width = Pct;
      TrackHandle.style.left = Pct;
      Track.setAttribute("aria-valuenow", String(Math.round(Ratio * 100)));
    }

    function SyncPlayState() {
      var Playing = !Audio.paused && !Audio.ended;
      Player.classList.toggle("pf-music-playing", Playing);
      PlayBtn.setAttribute("aria-label", Playing ? "Pause music" : "Play music");
    }

    PlayBtn.addEventListener("click", function () {
      if (Audio.paused) {
        var PromisePlay = Audio.play();
        if (PromisePlay && PromisePlay.catch) PromisePlay.catch(function () { SyncPlayState(); });
      } else {
        Audio.pause();
      }
    });

    PrevBtn.addEventListener("click", function () {
      if (!isFinite(Audio.duration)) return;
      Audio.currentTime = Math.max(0, Audio.currentTime - 10);
    });
    NextBtn.addEventListener("click", function () {
      if (!isFinite(Audio.duration)) return;
      Audio.currentTime = Math.min(Audio.duration, Audio.currentTime + 10);
    });

    Audio.addEventListener("play", SyncPlayState);
    Audio.addEventListener("pause", SyncPlayState);
    Audio.addEventListener("ended", SyncPlayState);
    Audio.addEventListener("loadedmetadata", function () {
      TimeEnd.textContent = FormatTime(Audio.duration);
    });
    Audio.addEventListener("timeupdate", function () {
      TimeStart.textContent = FormatTime(Audio.currentTime);
      if (!Audio.duration || Track.dragging) return;
      SetFill(Audio.currentTime / Audio.duration);
    });
    Audio.addEventListener("error", function () {
      Player.classList.add("pf-music-error");
      Title.textContent = (Music.Title || "Track") + " (unavailable)";
    });

    function SeekFromEvent(Evt) {
      var Rect = Track.getBoundingClientRect();
      if (!Rect.width) return;
      var Ratio = (Evt.clientX - Rect.left) / Rect.width;
      Ratio = Math.max(0, Math.min(1, Ratio));
      SetFill(Ratio);
      if (Audio.duration) Audio.currentTime = Ratio * Audio.duration;
    }

    Track.addEventListener("pointerdown", function (Evt) {
      Track.dragging = true;
      Track.setPointerCapture(Evt.pointerId);
      SeekFromEvent(Evt);
    });
    Track.addEventListener("pointermove", function (Evt) {
      if (Track.dragging) SeekFromEvent(Evt);
    });
    Track.addEventListener("pointerup", function () { Track.dragging = false; });
    Track.addEventListener("pointercancel", function () { Track.dragging = false; });
    Track.addEventListener("keydown", function (Evt) {
      if (!Audio.duration) return;
      var Step = Audio.duration * 0.02;
      if (Evt.key === "ArrowLeft") { Audio.currentTime = Math.max(0, Audio.currentTime - Step); Evt.preventDefault(); }
      else if (Evt.key === "ArrowRight") { Audio.currentTime = Math.min(Audio.duration, Audio.currentTime + Step); Evt.preventDefault(); }
    });

    function ArmGesture() {
      if (Audio.__pfArmed) return;
      Audio.__pfArmed = true;
      var Fn = function () {
        Audio.__pfArmed = false;
        Global.removeEventListener("pointerdown", Fn);
        Global.removeEventListener("keydown", Fn);
        Global.removeEventListener("touchstart", Fn);
        var PromisePlay = Audio.play();
        if (PromisePlay && PromisePlay.catch) PromisePlay.catch(function () { SyncPlayState(); });
      };
      Global.addEventListener("pointerdown", Fn, { once: true });
      Global.addEventListener("keydown", Fn, { once: true });
      Global.addEventListener("touchstart", Fn, { once: true });
    }

    return { Root: Player, Audio: Audio, TryAutoplay: function () {
      if (!Music.Enabled) return;
      var PromisePlay = Audio.play();
      if (PromisePlay && PromisePlay.catch) PromisePlay.catch(function () { SyncPlayState(); ArmGesture(); });
    }, SetTrack: function (Src, TrackTitle, TrackArtist) {
      if (Src) {
        Audio.src = Src;
        Audio.load();
      }
      if (TrackTitle) Title.textContent = TrackTitle;
      if (TrackArtist !== undefined) Artist.textContent = TrackArtist || "";
    } };
  }

  function BuildCard(Config, Handles) {
    var Profile = Config.Profile;
    var Card = H("article", { class: "pf-card" });

    if (Config.Layout.Preset === "hero" && Profile.Banner) {
      Card.appendChild(H("div", { class: "pf-banner", style: { backgroundImage: "url(\"" + Profile.Banner + "\")" } }));
    }

    var AvatarInner = H("img", {
      class: "pf-avatar",
      src: Profile.Avatar || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
      alt: Profile.DisplayName + " avatar",
      decoding: "async"
    });
    AvatarInner.addEventListener("error", function () { AvatarInner.classList.add("pf-avatar-missing"); });

    var AvatarWrap = H("div", { class: "pf-avatar-wrap" }, [AvatarInner]);
    if (!Profile.Avatar) AvatarWrap.hidden = true;
    Handles.AvatarWrap = AvatarWrap;

    var NameText = H("span", { class: "pf-name-text", text: Profile.DisplayName, "data-text": Profile.DisplayName });
    Handles.NameText = NameText;

    var NameWrap = H("div", { class: "pf-name-wrap" }, [NameText]);
    if (Profile.Tooltip) {
      NameWrap.appendChild(H("span", { class: "pf-tooltip", role: "tooltip", text: Profile.Tooltip }));
    }

    var Head = H("div", { class: "pf-head" }, [
      AvatarWrap,
      H("div", { class: "pf-identity" }, [
        H("h1", { class: "pf-name" }, [NameWrap]),
        Profile.UserName && Profile.ShowUsername ? H("p", { class: "pf-username", text: "@" + Profile.UserName }) : null,
        BuildBadges(Config)
      ])
    ]);

    if (Config.Layout.Preset === "hero" || Config.Layout.Preset === "modern") {
      Card.classList.add("pf-card-" + Config.Layout.Preset);
      Card.appendChild(Head);
    } else {
      Card.classList.add("pf-card-" + Config.Layout.Preset);
      Card.appendChild(H("div", { class: "pf-head pf-head-center" }, [
        AvatarWrap,
        H("div", { class: "pf-identity pf-identity-center" }, [
          H("h1", { class: "pf-name" }, [NameWrap]),
          Profile.UserName && Profile.ShowUsername ? H("p", { class: "pf-username", text: "@" + Profile.UserName }) : null,
          BuildBadges(Config)
        ])
      ]));
    }

    var StatusLine = H("p", { class: "pf-status", text: Profile.Status });
    Handles.StatusLine = StatusLine;
    if (Profile.Status || Profile.StatusMessages.length) Card.appendChild(StatusLine);

    var Bio = H("p", { class: "pf-bio", text: Profile.Bio });
    Handles.Bio = Bio;
    if (Profile.Bio || Profile.BioMessages.length) Card.appendChild(Bio);
    if (Profile.Location) {
      Card.appendChild(H("p", { class: "pf-location" }, [
        MakeIcon("location", "pf-location-icon"),
        H("span", { text: Profile.Location })
      ]));
    }

    if (Config.Presence.Enabled && Config.Presence.UserName) {
      Card.appendChild(BuildPresence(Config));
    }

    if (Config.Music.Enabled) {
      var Player = BuildMusicPlayer(Config);
      Handles.Music = Player;
      Card.appendChild(Player.Root);
    }

    var Links = Config.Social.Links;
    if (Links.length) {
      var Nav = H("nav", { class: "pf-links pf-links-" + Config.Social.Style, "aria-label": "Social links" });
      Links.forEach(function (Link) {
        var Anchor = H("a", {
          class: "pf-link",
          href: Link.Url,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": Link.Name,
          title: Link.Name,
          style: Link.Color ? { color: Link.Color } : null
        }, [ResolveIconNode(Link.Icon, Link.Name)]);
        Nav.appendChild(Anchor);
      });
      Card.appendChild(Nav);
    }

    if (Profile.ShowViews) {
      Card.appendChild(BuildViews(Config));
    }

    var Widgets = H('section', { class: 'pf-widgets', 'aria-label': 'Profile widgets' });
    var W = Config.Widgets;
    if (W.Discord.Enabled) {
      Widgets.appendChild(H('div', { class: 'pf-widget pf-server' }, [
        W.Discord.Icon ? H('img', { src: W.Discord.Icon, alt: '', class: 'pf-server-icon' }) : MakeIcon('discord', 'pf-server-icon'),
        H('div', { class: 'pf-server-info' }, [H('strong', { text: W.Discord.Name }), H('small', { text: W.Discord.Online.toLocaleString() + ' online · ' + W.Discord.Members.toLocaleString() + ' members' })]),
        W.Discord.Invite ? H('a', { href: W.Discord.Invite, target: '_blank', rel: 'noopener noreferrer', class: 'pf-join', text: 'Join' }) : null
      ]));
    }
    if (W.Clock.Enabled) {
      Widgets.appendChild(H('div', { class: 'pf-widget pf-clock' }, [H('span', { class: 'pf-clock-face', text: '◷', 'aria-hidden': 'true' }), H('div', {}, [H('small', { text: W.Clock.Label }), H('strong', { class: 'pf-clock-time' }), H('small', { class: 'pf-clock-date' })])]));
    }
    if (W.Quote.Enabled && W.Quote.Text) Widgets.appendChild(H('blockquote', { class: 'pf-widget pf-quote' }, [H('p', { text: W.Quote.Text }), H('cite', { text: W.Quote.Author })]));
    if (Widgets.children.length) Card.appendChild(Widgets);
    Card.classList.add('pf-card-' + Config.Layout.Preset);
    return Card;
  }

  function BuildBadges(Config) {
    var Badges = Config.Profile.Badges;
    if (!Badges.length && !Config.Profile.Verified) return null;
    var Row = H("div", { class: "pf-badges", "aria-label": "Badges" });
    if (Config.Profile.Verified) {
      Row.appendChild(H("div", {
        class: "pf-badge pf-badge-verified",
        tabindex: "0",
        role: "img",
        "aria-label": "Verified",
        style: { color: BADGE_COLORS.verified }
      }, [
        ResolveIconNode("verified", "Verified", "pf-badge-icon"),
        H("span", { class: "pf-tooltip", role: "tooltip", text: "Verified" })
      ]));
    }
    Badges.forEach(function (Badge) {
      var Slug = typeof Badge.Icon === "string" ? Badge.Icon : "";
      var Color = Badge.Color || (Slug ? BADGE_COLORS[Slug.toLowerCase()] : "") || "";
      var Inner = Slug
        ? ResolveIconNode(Slug, Badge.Label, "pf-badge-icon")
        : H("span", { class: "pf-badge-letter", text: (Badge.Label || "?").slice(0, 1) });
      var Item = H("div", {
        class: "pf-badge",
        tabindex: "0",
        role: "img",
        "aria-label": Badge.Label || "Badge",
        style: Color ? { color: Color } : null
      }, [
        Inner,
        Badge.Label ? H("span", { class: "pf-tooltip", role: "tooltip", text: Badge.Label }) : null
      ]);
      Row.appendChild(Item);
    });
    return Row;
  }

  function BuildPresence(Config) {
    var P = Config.Presence;
    var Avatar = P.Avatar
      ? H("img", { class: "pf-presence-avatar", src: P.Avatar, alt: "" })
      : H("div", { class: "pf-presence-avatar pf-presence-avatar-blank" });
    return H("div", { class: "pf-presence" }, [
      H("div", { class: "pf-presence-avatar-wrap" }, [
        Avatar,
        H("span", { class: "pf-presence-dot pf-presence-" + P.State, "aria-label": P.State })
      ]),
      H("div", { class: "pf-presence-body" }, [
        H("span", { class: "pf-presence-platform", text: P.Platform }),
        H("span", { class: "pf-presence-user", text: P.UserName }),
        P.Status ? H("span", { class: "pf-presence-status", text: P.Status }) : null
      ])
    ]);
  }

  function FormatCount(Value) {
    if (Value >= 1e9) return (Value / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (Value >= 1e6) return (Value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (Value >= 1e3) return (Value / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(Value);
  }

  function BuildViews(Config) {
    var Key = "pf-views:" + Config.Profile.UserName.toLowerCase();
    var Count = Config.Profile.ViewsStart;
    try {
      var Stored = parseInt(localStorage.getItem(Key) || "0", 10);
      if (isFinite(Stored) && Stored > 0) Count += Stored;
      var SessionKey = "pf-views-session:" + Config.Profile.UserName.toLowerCase();
      if (!Config._Preview && !sessionStorage.getItem(SessionKey)) {
        sessionStorage.setItem(SessionKey, "1");
        localStorage.setItem(Key, String((isFinite(Stored) && Stored > 0 ? Stored : 0) + 1));
        Count = Config.Profile.ViewsStart + ((isFinite(Stored) && Stored > 0 ? Stored : 0) + 1);
      }
    } catch (Err) {
      Count = Config.Profile.ViewsStart + 1;
    }
    var Icon = MakeIcon("eye", "pf-views-icon");
    var Number = H("span", { class: "pf-views-count", text: Count.toLocaleString(), "aria-label": Count.toLocaleString() + " views" });
    return H("div", {
      class: "pf-views",
      title: "Counted once per session in this browser. No server involved."
    }, [Icon, Number]);
  }

  function BuildControls(Config, Handles) {
    var Controls = Config.Controls;
    var El = H("div", { class: "pf-controls", role: "group", "aria-label": "Display controls" });
    var HasMusic = Controls.Volume && Config.Music.Enabled && Handles.Music;

    if (HasMusic) {
      var Mute = H("button", {
        class: "pf-control-mute",
        type: "button",
        "aria-label": "Mute music",
        "aria-pressed": "false"
      }, [H("span", { class: "pf-control-mute-icon", "aria-hidden": "true" })]);
      var Volume = H("input", {
        class: "pf-control-range pf-control-volume",
        type: "range",
        min: "0",
        max: "100",
        value: String(Math.round(Handles.Music.Audio.volume * 100)),
        "aria-label": "Music volume"
      });
      Volume.addEventListener("input", function () {
        var V = parseInt(Volume.value, 10) / 100;
        Handles.Music.Audio.volume = Math.max(0, Math.min(1, V));
        Handles.Music.Audio.muted = V <= 0;
        Mute.setAttribute("aria-pressed", V <= 0 ? "true" : "false");
        Mute.classList.toggle("pf-control-muted", V <= 0);
      });
      Mute.addEventListener("click", function () {
        var NowMuted = !Handles.Music.Audio.muted;
        Handles.Music.Audio.muted = NowMuted;
        Mute.setAttribute("aria-pressed", NowMuted ? "true" : "false");
        Mute.classList.toggle("pf-control-muted", NowMuted);
      });
      El.appendChild(Mute);
      El.appendChild(Volume);
    }

    if (Controls.Opacity) {
      if (HasMusic) El.appendChild(H("span", { class: "pf-control-sep", "aria-hidden": "true" }));
      var Opacity = H("input", {
        class: "pf-control-range pf-control-opacity",
        type: "range",
        min: "0",
        max: "100",
        value: "100",
        "aria-label": "Card opacity"
      });
      Opacity.addEventListener("input", function () {
        var Pct = Math.max(0, Math.min(100, parseInt(Opacity.value, 10)));
        Handles.Root.style.setProperty("--pf-card-alpha-pct", Pct + "%");
        Handles.Root.style.setProperty("--pf-card-alpha-number", String(Pct / 100));
      });
      El.appendChild(Opacity);
    }

    return El;
  }

  function StartParticles(Canvas, Config, Mouse) {
    var Ctx = Canvas.getContext("2d");
    if (!Ctx) return function () {};
    var Mode = Config.Effects.Particles.Type;
    var Color = Config.Effects.Particles.Color;
    var Count = Config.Effects.Particles.Count;
    var Parallax = Config.Effects.Particles.Parallax;
    var Width = 0;
    var Height = 0;
    var Dpr = Math.min(Global.devicePixelRatio || 1, 2);
    var Items = [];
    var Frame = 0;
    var Running = true;

    function Resize() {
      var Rect = Canvas.getBoundingClientRect();
      Width = Rect.width;
      Height = Rect.height;
      Canvas.width = Math.max(1, Math.floor(Width * Dpr));
      Canvas.height = Math.max(1, Math.floor(Height * Dpr));
      Ctx.setTransform(Dpr, 0, 0, Dpr, 0, 0);
    }

    function Spawn(Initial) {
      var Item = {
        X: Math.random() * Width,
        Y: Initial ? Math.random() * Height : (Mode === "embers" ? Height + 10 : -10),
        Size: 0.8 + Math.random() * 2.2,
        SpeedY: 0.2 + Math.random() * 0.9,
        Drift: (Math.random() - 0.5) * 0.4,
        Phase: Math.random() * Math.PI * 2,
        Alpha: 0.25 + Math.random() * 0.6
      };
      if (Mode === "rain") { Item.Size = 0.7 + Math.random() * 1.1; Item.SpeedY = 4 + Math.random() * 6; Item.Length = 8 + Math.random() * 14; }
      if (Mode === "snow") { Item.Size = 1 + Math.random() * 2.4; Item.SpeedY = 0.4 + Math.random() * 0.9; }
      if (Mode === "embers") { Item.SpeedY = 0.3 + Math.random() * 1.1; Item.Size = 1 + Math.random() * 2.4; }
      if (Mode === "dust") { Item.SpeedY = 0.05 + Math.random() * 0.2; Item.Size = 0.8 + Math.random() * 1.6; Item.Alpha = 0.08 + Math.random() * 0.25; }
      return Item;
    }

    function Fill() {
      Items = [];
      for (var I = 0; I < Count; I++) Items.push(Spawn(true));
    }

    function Draw() {
      if (!Running) return;
      Ctx.clearRect(0, 0, Width, Height);
      Ctx.fillStyle = Color;
      Ctx.strokeStyle = Color;
      var OffsetX = (Mouse.X - Width / 2) * Parallax;
      var OffsetY = (Mouse.Y - Height / 2) * Parallax * 0.6;
      var Time = Frame * 0.01;
      for (var I = 0; I < Items.length; I++) {
        var P = Items[I];
        P.Y += P.SpeedY;
        P.X += P.Drift + Math.sin(Time + P.Phase) * 0.15;
        if (Mode === "embers") {
          if (P.Y < -12) { Items[I] = Spawn(false); Items[I].Y = Height + 8; }
        } else if (P.Y > Height + 12) {
          Items[I] = Spawn(false);
          continue;
        }
        var X = P.X + OffsetX;
        var Y = P.Y + OffsetY;
        var Twinkle = Mode === "stars" ? (0.55 + 0.45 * Math.sin(Time * 2 + P.Phase)) : 1;
        Ctx.globalAlpha = P.Alpha * Twinkle;
        if (Mode === "rain") {
          Ctx.lineWidth = P.Size;
          Ctx.beginPath();
          Ctx.moveTo(X, Y);
          Ctx.lineTo(X + P.Drift * 2, Y + P.Length);
          Ctx.stroke();
        } else {
          Ctx.beginPath();
          Ctx.arc(X, Y, P.Size, 0, Math.PI * 2);
          Ctx.fill();
        }
      }
      Ctx.globalAlpha = 1;
      Frame++;
      requestAnimationFrame(Draw);
    }

    Resize();
    Fill();
    var OnResize = function () { Resize(); Fill(); };
    Global.addEventListener("resize", OnResize);
    requestAnimationFrame(Draw);
    return function () {
      Running = false;
      Global.removeEventListener("resize", OnResize);
      Ctx.clearRect(0, 0, Width, Height);
    };
  }

  function StartCursorTrail(Canvas, Config) {
    var Ctx = Canvas.getContext("2d");
    if (!Ctx) return function () {};
    var Color = Config.Effects.CursorTrail.Color;
    var Size = Config.Effects.CursorTrail.Size;
    var Glow = Config.Effects.CursorTrail.Glow;
    var Particles = [];
    var Width = 0;
    var Height = 0;
    var Dpr = Math.min(Global.devicePixelRatio || 1, 2);
    var MouseX = -999;
    var MouseY = -999;
    var LastX = -999;
    var LastY = -999;
    var Running = true, AnimationFrame = 0;

    function Resize() {
      var Rect = Canvas.getBoundingClientRect();
      Width = Rect.width;
      Height = Rect.height;
      Canvas.width = Math.max(1, Math.floor(Width * Dpr));
      Canvas.height = Math.max(1, Math.floor(Height * Dpr));
      Ctx.setTransform(Dpr, 0, 0, Dpr, 0, 0);
    }

    function OnMove(Event) {
      MouseX = Event.clientX;
      MouseY = Event.clientY;
      if (!AnimationFrame && !document.hidden) AnimationFrame = requestAnimationFrame(Draw);
    }

    function Star(X, Y, S, Rotation) {
      Ctx.save();
      Ctx.translate(X, Y);
      Ctx.rotate(Rotation);
      Ctx.beginPath();
      Ctx.moveTo(0, -S);
      Ctx.quadraticCurveTo(S * 0.2, -S * 0.2, S, 0);
      Ctx.quadraticCurveTo(S * 0.2, S * 0.2, 0, S);
      Ctx.quadraticCurveTo(-S * 0.2, S * 0.2, -S, 0);
      Ctx.quadraticCurveTo(-S * 0.2, -S * 0.2, 0, -S);
      Ctx.closePath();
      Ctx.fill();
      Ctx.restore();
    }

    function Draw() {
      AnimationFrame = 0;
      if (!Running || document.hidden) return;
      Ctx.clearRect(0, 0, Width, Height);
      if (MouseX !== LastX || MouseY !== LastY) {
        for (var I = 0; I < 3 && Particles.length < 96; I++) {
          Particles.push({
            X: MouseX, Y: MouseY,
            VX: (Math.random() - 0.5) * 1.2,
            VY: (Math.random() - 0.5) * 1.2,
            Life: 1,
            Size: Size * (0.5 + Math.random() * 0.7),
            Rotation: Math.random() * Math.PI * 2,
            RotationSpeed: (Math.random() - 0.5) * 0.12
          });
        }
        LastX = MouseX;
        LastY = MouseY;
      }
      for (var J = 0; J < Particles.length; J++) {
        var P = Particles[J];
        P.X += P.VX;
        P.Y += P.VY;
        P.VX *= 0.97;
        P.VY *= 0.97;
        P.Rotation += P.RotationSpeed;
        P.Life -= 1 / 28;
        if (P.Life <= 0) continue;
        Ctx.globalAlpha = Math.max(P.Life, 0);
        Ctx.fillStyle = Color;
        Ctx.shadowColor = Color;
        Ctx.shadowBlur = Glow;
        Star(P.X, P.Y, P.Size * P.Life, P.Rotation);
      }
      Particles = Particles.filter(function (P) { return P.Life > 0; });
      Ctx.globalAlpha = 1;
      Ctx.shadowBlur = 0;
      if (Particles.length) AnimationFrame = requestAnimationFrame(Draw);
    }

    Resize();
    Global.addEventListener("resize", Resize);
    Global.addEventListener("pointermove", OnMove, { passive: true });
    // Start only when the pointer moves.
    return function () {
      Running = false;
      cancelAnimationFrame(AnimationFrame);
      Global.removeEventListener("resize", Resize);
      Global.removeEventListener("pointermove", OnMove);
      Ctx.clearRect(0, 0, Width, Height);
    };
  }

  function StartNameGlitch(NameEl, Intensity) {
    var Existing = document.getElementById("pf-glitch-defs");
    if (!Existing) {
      var NS = "http://www.w3.org/2000/svg";
      var Svg = document.createElementNS(NS, "svg");
      Svg.setAttribute("id", "pf-glitch-defs");
      Svg.setAttribute("aria-hidden", "true");
      Svg.style.position = "absolute";
      Svg.style.width = "0";
      Svg.style.height = "0";
      var Defs = document.createElementNS(NS, "defs");
      var Filter = document.createElementNS(NS, "filter");
      Filter.setAttribute("id", "pf-name-filter");
      Filter.setAttribute("x", "-20%");
      Filter.setAttribute("y", "-30%");
      Filter.setAttribute("width", "140%");
      Filter.setAttribute("height", "160%");
      var Turb = document.createElementNS(NS, "feTurbulence");
      Turb.setAttribute("id", "pf-name-turb");
      Turb.setAttribute("type", "turbulence");
      Turb.setAttribute("baseFrequency", "0.008 1.2");
      Turb.setAttribute("numOctaves", "1");
      Turb.setAttribute("seed", "1");
      Turb.setAttribute("result", "noise");
      var Disp = document.createElementNS(NS, "feDisplacementMap");
      Disp.setAttribute("id", "pf-name-disp");
      Disp.setAttribute("in", "SourceGraphic");
      Disp.setAttribute("in2", "noise");
      Disp.setAttribute("scale", "4");
      Disp.setAttribute("xChannelSelector", "R");
      Disp.setAttribute("yChannelSelector", "G");
      Filter.appendChild(Turb);
      Filter.appendChild(Disp);
      Defs.appendChild(Filter);
      Svg.appendChild(Defs);
      document.body.appendChild(Svg);
    }
    NameEl.classList.add("pf-name-glitch");
    var TurbEl = document.getElementById("pf-name-turb");
    var DispEl = document.getElementById("pf-name-disp");
    if (!TurbEl || !DispEl) return function () {};
    var Timer = Global.setInterval(function () {
      TurbEl.setAttribute("seed", String(Math.floor(Math.random() * 9999)));
      var Scale = Math.random() < 0.8
        ? (3 + Math.random() * 7) * Intensity
        : (0.4 + Math.random() * 2) * Intensity;
      DispEl.setAttribute("scale", Scale.toFixed(1));
    }, 60);
    return function () {
      Global.clearInterval(Timer);
      NameEl.classList.remove("pf-name-glitch");
    };
  }

  function StartBioCycle(El, Messages, Speed) {
    if (!Messages || !Messages.length) return function () {};
    var Index = 0;
    var Char = 0;
    var Deleting = false;
    var Timer = null;
    function Tick() {
      var Text = Messages[Index];
      if (!Deleting) {
        Char++;
        El.textContent = Text.slice(0, Char);
        if (Char >= Text.length) {
          Deleting = true;
          Timer = Global.setTimeout(Tick, 2000);
          return;
        }
        Timer = Global.setTimeout(Tick, Speed);
      } else {
        Char--;
        El.textContent = Text.slice(0, Char);
        if (Char <= 0) {
          Deleting = false;
          Index = (Index + 1) % Messages.length;
          Timer = Global.setTimeout(Tick, 400);
          return;
        }
        Timer = Global.setTimeout(Tick, Math.round(Speed * 0.5));
      }
    }
    El.textContent = "";
    Timer = Global.setTimeout(Tick, 400);
    return function () { if (Timer) Global.clearTimeout(Timer); };
  }

  function StartAvatarGlitch(Wrap, Intensity) {
    if (!Wrap) return function () {};
    var Timer = null;
    var AutoTimer = null;
    function Trigger() {
      Wrap.classList.add("pf-avatar-glitch");
      if (Timer) Global.clearTimeout(Timer);
      Timer = Global.setTimeout(function () { Wrap.classList.remove("pf-avatar-glitch"); }, 500);
    }
    function ScheduleAuto() {
      var Delay = 2600 + Math.random() * 2600;
      AutoTimer = Global.setTimeout(function () { Trigger(); ScheduleAuto(); }, Delay);
    }
    Wrap.style.setProperty("--pf-avatar-glitch", String(Intensity));
    Wrap.addEventListener("pointerenter", Trigger);
    ScheduleAuto();
    return function () {
      if (Timer) Global.clearTimeout(Timer);
      if (AutoTimer) Global.clearTimeout(AutoTimer);
      Wrap.removeEventListener("pointerenter", Trigger);
      Wrap.classList.remove("pf-avatar-glitch");
    };
  }

  function StartTilt(Card, Config) {
    if (!Global.matchMedia || !Global.matchMedia("(hover: hover) and (pointer: fine)").matches) return function () {};
    var Intensity = Config.Effects.Tilt.Intensity;
    var Perspective = 900;
    var Frame = 0;
    var LastX = 0;
    var LastY = 0;
    var Active = false;
    Card.classList.add("pf-tilt-enabled");
    Card.style.transformStyle = "preserve-3d";
    function Apply() {
      Frame = 0;
      if (!Active) return;
      var Rect = Card.getBoundingClientRect();
      if (!Rect.width || !Rect.height) return;
      var OffX = Math.max(-0.5, Math.min(0.5, (LastX - Rect.left) / Rect.width - 0.5));
      var OffY = Math.max(-0.5, Math.min(0.5, (LastY - Rect.top) / Rect.height - 0.5));
      var X = -OffY * 2 * Intensity;
      var Y = OffX * 2 * Intensity;
      Card.style.transform = "perspective(" + Perspective + "px) rotateX(" + X + "deg) rotateY(" + Y + "deg) translateZ(2px)";
      Card.style.setProperty("--pf-tilt-x", ((OffX + 0.5) * 100) + "%");
      Card.style.setProperty("--pf-tilt-y", ((OffY + 0.5) * 100) + "%");
    }
    function Move(E) {
      if (E.pointerType === "touch") return;
      LastX = E.clientX;
      LastY = E.clientY;
      Active = true;
      if (!Frame) Frame = Global.requestAnimationFrame(Apply);
    }
    function Reset() {
      Active = false;
      if (Frame) Global.cancelAnimationFrame(Frame);
      Frame = 0;
      Card.style.transform = "perspective(" + Perspective + "px) rotateX(0deg) rotateY(0deg)";
      Card.style.setProperty("--pf-tilt-x", "50%");
      Card.style.setProperty("--pf-tilt-y", "50%");
    }
    Card.addEventListener("pointermove", Move, { passive: true });
    Card.addEventListener("pointerleave", Reset, { passive: true });
    return function () {
      Reset();
      Card.removeEventListener("pointermove", Move);
      Card.removeEventListener("pointerleave", Reset);
      Card.classList.remove("pf-tilt-enabled");
      Card.style.transformStyle = "";
      Card.style.removeProperty("--pf-tilt-x");
      Card.style.removeProperty("--pf-tilt-y");
    };
  }

  function Mount(Target, RawConfig, Options) {
    Options = Options || {};
    var Validation = ValidateConfig(RawConfig);
    var Config = Validation.Config;
    Config._Preview = !!Options.Preview;
    var Reduced = ReducedMotionPreferred();
    var Cleanups = [];
    var Handles = { NameText: null, StatusLine: null, Music: null, Bio: null, AvatarWrap: null, Root: null };
    var Entered = false;
    var BgLayer = null;
    var ParticleCanvas = null;
    var TrailCanvas = null;
    var Mouse = null;
    var ParticleStop = null;
    var TrailStop = null;
    var Root = H("div", { class: "pf-root pf-layout-" + Config.Layout.Preset });
    if (Reduced) Root.classList.add("pf-reduced-motion");

    var Container = typeof Target === "string" ? document.querySelector(Target) : Target;
    if (!Container) throw new Error("ProfileRuntime.Mount: target not found");

    Handles.Root = Root;

    function RestartAmbient() {
      if (ParticleStop) { ParticleStop(); ParticleStop = null; }
      if (TrailStop) { TrailStop(); TrailStop = null; }
      if (Reduced || !Mouse || document.hidden) return;
      if (Config.Effects.Particles.Enabled && Config.Effects.Particles.Count > 0 && ParticleCanvas) {
        ParticleStop = StartParticles(ParticleCanvas, Config, Mouse);
      }
      if (Config.Effects.CursorTrail.Enabled && Config.Effects.CursorTrail.Type !== 'cat' && TrailCanvas) {
        TrailStop = StartCursorTrail(TrailCanvas, Config);
      }
      if (Config.Effects.CursorTrail.Enabled && Config.Effects.CursorTrail.Type === 'cat' && Global.ProfileCat) TrailStop = Global.ProfileCat.Attach(Root, Config.Effects.CursorTrail);
    }

    function Render() {
      Entered = false;
      Cleanups.forEach(function (Fn) { try { Fn(); } catch (Err) {} });
      Cleanups = [];
      Root.innerHTML = "";
      Handles.NameText = null;
      Handles.StatusLine = null;
      Handles.Bio = null;
      Handles.AvatarWrap = null;
      Handles.Music = null;
      Root.className = "pf-root pf-layout-" + Config.Layout.Preset + (Reduced ? " pf-reduced-motion" : "");
      ApplyTheme(Root, Config);
      BgLayer = BuildBackground(Config);
      Root.appendChild(BgLayer);
      var BackgroundVideo=BgLayer.querySelector("video");
      if(BackgroundVideo)Cleanups.push(function(){BackgroundVideo.pause();BackgroundVideo.removeAttribute("src");BackgroundVideo.load();});
      Root.appendChild(H("div", { class: "pf-vignette" }));
      Root.appendChild(H("div", { class: "pf-grain" }));
      ParticleCanvas = H("canvas", { class: "pf-canvas pf-canvas-particles", "aria-hidden": "true" });
      TrailCanvas = H("canvas", { class: "pf-canvas pf-canvas-trail", "aria-hidden": "true" });
      if(Config.Effects.Particles.Enabled && !Reduced) Root.appendChild(ParticleCanvas);
      if(Config.Effects.CursorTrail.Enabled && Config.Effects.CursorTrail.Type!=="cat" && !Reduced) Root.appendChild(TrailCanvas);
      Root.appendChild(H("main", { class: "pf-stage" }, [BuildCard(Config, Handles)]));

      if (Config.Controls.Enabled && (Handles.Music || Config.Controls.Opacity)) {
        Root.appendChild(BuildControls(Config, Handles));
      }

      var Entry = null;
      if (Config.Effects.EntryScreen.Enabled && !Options.SkipEntry) {
        Entry = BuildEntry(Config);
        Root.appendChild(Entry);
      }

      Root.classList.toggle("pf-reveal", !Config.Effects.EntryScreen.Enabled || Options.SkipEntry || Reduced);

      if (Options.Embed) {
        Root.classList.add("pf-embed");
      }

      if (Global.ReferenceProfile) Global.ReferenceProfile.Apply(Root, Config, Handles, Options, Cleanups);

      Mouse = { X: Global.innerWidth / 2, Y: Global.innerHeight / 2 };
      if (!Reduced) {
        var OnPointer = function (E) { Mouse.X = E.clientX; Mouse.Y = E.clientY; };
        Global.addEventListener("pointermove", OnPointer, { passive: true });
        Cleanups.push(function () { Global.removeEventListener('pointermove', OnPointer); });
        if ((Config.Effects.NameGlitch.Enabled && Config.Effects.NameGlitch.Intensity > 0 || Config.Effects.Username === 'fuzzy') && Handles.NameText) {
          Cleanups.push(StartNameGlitch(Handles.NameText, Config.Effects.Username === 'fuzzy' ? 0.3 : Config.Effects.NameGlitch.Intensity));
        }
        if (Config.Effects.AvatarGlitch.Enabled && Config.Effects.AvatarGlitch.Intensity > 0 && Handles.AvatarWrap) {
          Cleanups.push(StartAvatarGlitch(Handles.AvatarWrap, Config.Effects.AvatarGlitch.Intensity));
        }
      }
      RestartAmbient();
      function Visibility() {
        RestartAmbient();
        var video=Root.querySelector('.pf-bg video');
        if(video){if(document.hidden)video.pause();else if(Entered&&!Reduced)video.play().catch(function(){});}
      }
      document.addEventListener('visibilitychange',Visibility);
      Cleanups.push(function(){document.removeEventListener('visibilitychange',Visibility);});
      Cleanups.push(function () {
        if (ParticleStop) { ParticleStop(); ParticleStop = null; }
        if (TrailStop) { TrailStop(); TrailStop = null; }
      });

      if (Handles.Bio && Config.Profile.BioMessages.length && !Reduced) {
        Cleanups.push(StartBioCycle(Handles.Bio, Config.Profile.BioMessages, 45));
      }

      var StatusPhrases = (Config.Profile.StatusMessages && Config.Profile.StatusMessages.length)
        ? Config.Profile.StatusMessages
        : (Config.Profile.Status ? [Config.Profile.Status] : []);
      if (StatusPhrases.length && Config.Profile.StatusTypewriter && !Reduced && Handles.StatusLine) {
        Cleanups.push(StartBioCycle(Handles.StatusLine, StatusPhrases, 55));
      }

      if (Config.Effects.Tilt.Enabled && Config.Effects.Tilt.Intensity > 0 && !Reduced) {
        Root.querySelectorAll('[data-profile-tilt], .pf-card').forEach(function (Card) {
          var Reset = StartTilt(Card, Config);
          Cleanups.push(function () { Reset(); Card.style.transform = ''; });
        });
      }

      function Enter() {
        if (Entered) return;
        Entered = true;
        if (Entry) {
          Entry.classList.add("pf-entry-leaving");
          Global.setTimeout(function () { if (Entry.parentNode) Entry.parentNode.removeChild(Entry); }, 600);
        }
        Root.classList.add("pf-reveal");
        if (Handles.Music) Handles.Music.TryAutoplay();
        var BgVideo = Root.querySelector(".pf-bg-media");
        if (BgVideo && BgVideo.tagName === "VIDEO") {
          BgVideo.muted = true;
          var PromisePlay = BgVideo.play();
          if (PromisePlay && PromisePlay.catch) PromisePlay.catch(function () {});
        }
      }

      if (Entry) {
        Entry.addEventListener("click", Enter);
        Entry.addEventListener("keydown", function (E) {
          if (E.key === "Enter" || E.key === " " || E.key === "Spacebar") {
            E.preventDefault();
            Enter();
          }
        });
      } else {
        Entered = true;
        if (Handles.Music && Config.Music.Autoplay && !Options.Preview) Handles.Music.TryAutoplay();
      }

      var Favicon = document.querySelector("link[rel~='icon']");
      if (Config.Meta.Favicon) {
        if (!Favicon) {
          Favicon = H("link", { rel: "icon" });
          document.head.appendChild(Favicon);
        }
        Favicon.setAttribute("href", Config.Meta.Favicon);
      }
      if (!Options.Embed) document.title = Config.Profile.DisplayName || "Profile";
      if (!Options.Preview && !Options.Embed && Config.Meta.AnimatedTitle && !Reduced) {
        var TitleText = '@' + Config.Profile.UserName, TitleIndex = 1, Direction = 1;
        var TitleTimer = setInterval(function () {
          document.title = TitleText.slice(0, TitleIndex) || '@';
          TitleIndex += Direction;
          if (TitleIndex > TitleText.length + 4) Direction = -1;
          if (TitleIndex < 1) { Direction = 1; TitleIndex = 1; }
        }, 260);
        Cleanups.push(function () { clearInterval(TitleTimer); });
      }
      if (Config.Widgets.Clock.Enabled) {
        function TickClock() {
          var Time = Root.querySelector('.pf-clock-time'), DateEl = Root.querySelector('.pf-clock-date');
          var Now = new Date(), Zone = Config.Widgets.Clock.Timezone;
          if (Time) Time.textContent = Now.toLocaleTimeString('en-GB', { timeZone: Zone });
          if (DateEl) DateEl.textContent = Now.toLocaleDateString('en-GB', { timeZone: Zone, weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + Zone.split('/').pop().replace(/_/g, ' ');
        }
        TickClock(); var ClockTimer = setInterval(TickClock, 1000);
        Cleanups.push(function () { clearInterval(ClockTimer); });
      }
      if (Handles.Music) {
        var OldAudio = Handles.Music.Audio;
        Cleanups.push(function () { OldAudio.pause(); OldAudio.removeAttribute('src'); OldAudio.load(); });
      }
      var Desc = document.querySelector("meta[name='description']");
      if (Config.Meta.Description) {
        if (!Desc) {
          Desc = H("meta", { name: "description" });
          document.head.appendChild(Desc);
        }
        Desc.setAttribute("content", Config.Meta.Description);
      }

      if (Global.ProfileCursor) Cleanups.push(Global.ProfileCursor.Attach(Root, Config.Cursor));
    }

    if (!Container.classList.contains("pf-root-host")) Container.classList.add("pf-root-host");
    Container.appendChild(Root);
    Render();

    var MediaQuery = Global.matchMedia ? Global.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var OnMediaChange = function () { Reduced = ReducedMotionPreferred(); Render(); };
    if (MediaQuery && MediaQuery.addEventListener) {
      MediaQuery.addEventListener("change", OnMediaChange);
    }

    return {
      Update: function (NextRaw) {
        var Next = ValidateConfig(NextRaw);
        Config = Next.Config;
        Config._Preview = !!Options.Preview;
        Render();
        return Next.Warnings;
      },
      ReplayEntry: function () {
        Entered = false;
        Render();
      },
      GetConfig: function () { return Config; },
      Destroy: function () {
        if (MediaQuery && MediaQuery.removeEventListener) MediaQuery.removeEventListener('change', OnMediaChange);
        Cleanups.forEach(function (Fn) { try { Fn(); } catch (Err) {} });
        Cleanups = [];
        if (Root.parentNode) Root.parentNode.removeChild(Root);
      }
    };
  }

  var AutoHandle;
  function AutoMount() {
    if (AutoHandle) AutoHandle.Destroy();
    var Target = document.getElementById("profile-root") || document.body;
    var Config = Global.PROFILE_CONFIG || {};
    return AutoHandle = Mount(Target, Config, {
      Embed: window.location.search.indexOf("embed=1") !== -1,
      SkipEntry: window.location.search.indexOf("noentry=1") !== -1
    });
  }

  Global.ProfileRuntime = {
    Mount: Mount,
    AutoMount: AutoMount,
    ValidateConfig: ValidateConfig,
    DefaultConfig: DEFAULT_CONFIG,
    Fonts: FONT_FAMILIES
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { ValidateConfig: ValidateConfig, DefaultConfig: DEFAULT_CONFIG, MergeDeep: MergeDeep };
  }
})(typeof window !== "undefined" ? window : globalThis);
