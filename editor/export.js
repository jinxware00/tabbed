(function (Root) {
  "use strict";

  var Zip = Root.AboutuZip;

  function SiteBase() {
    try { return new URL("../", Root.location.href).href; }
    catch (Error) { return null; }
  }

  function ExtFromMime(Mime) {
    var Map = {
      "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/gif": "gif",
      "image/webp": "webp", "image/svg+xml": "svg", "image/avif": "avif", "image/x-icon": "ico",
      "video/mp4": "mp4", "video/webm": "webm", "video/ogg": "ogv",
      "audio/mpeg": "mp3", "audio/mp3": "mp3", "application/ogg":"ogg", "audio/ogg": "ogg", "audio/wav": "wav",
      "audio/webm": "weba", "audio/flac": "flac", "audio/aac": "aac", "audio/mp4": "m4a",
      "font/otf": "otf", "font/ttf": "ttf", "font/woff": "woff", "font/woff2": "woff2",
      "application/octet-stream": "bin"
    };
    return Map[Mime] || "bin";
  }

  function Slug(Text) {
    return String(Text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "asset";
  }

  function ExtractMime(DataUrl) {
    var Match = /^data:([^;,]*)/i.exec(DataUrl || "");
    return Match ? Match[1].toLowerCase() : "application/octet-stream";
  }

  function ExtFromUrl(Url) {
    var Path = String(Url).split("?")[0].split("#")[0];
    var Match = /\.([a-z0-9]+)$/i.exec(Path);
    return Match ? Match[1].toLowerCase() : "";
  }

  function IsRemote(Value) {
    return /^https?:\/\//i.test(Value) || Value.indexOf("//") === 0;
  }

  async function ExportSite(Config, Options) {
    var Sources = await Root.ABOUTU_SOURCES.Load(Config.Layout.Preset);
    var processed = new Map();
    Options = Options || {};
    var Assets = {};
    var Counters = {};
    var Jobs = [];
    var Base = Options.BaseUrl || SiteBase();
    var Clone = JSON.parse(JSON.stringify(Config));

    function Register(Obj, Key, Hint) {
      var Value = Obj && Obj[Key];
      if (typeof Value !== "string" || !Value) return;
      if (!/^(data:|https?:|\/\/)/i.test(Value) && Value.indexOf("/") === -1 && !/\.[a-z0-9]+(?:[?#]|$)/i.test(Value)) return;
      Jobs.push({ Obj: Obj, Key: Key, Hint: Hint });
    }

    function UniqueName(Hint, Ext) {
      var Base = Slug(Hint);
      var Name = Base;
      if (Counters[Name]) { Counters[Name]++; Name = Base + "-" + Counters[Name]; }
      else Counters[Name] = 1;
      return "assets/" + Name + "." + Ext;
    }

    function HandleData(Value, Hint) {
      if (/^data:text\/html/i.test(Value)) return Value;
      var FileName = UniqueName(Hint, ExtFromMime(ExtractMime(Value)));
      Assets[FileName] = Zip.DataUrlToBytes(Value) || new Uint8Array(0);
      return FileName;
    }

    function Process(Job) {
      var Value = Job.Obj[Job.Key];
      if (processed.has(Value)) { Job.Obj[Job.Key] = processed.get(Value); return Promise.resolve(); }
      if (/^data:/i.test(Value)) {
        Job.Obj[Job.Key] = HandleData(Value, Job.Hint); processed.set(Value, Job.Obj[Job.Key]);
        return Promise.resolve();
      }
      if (IsRemote(Value)) return Promise.resolve();
      var Target;
      try { Target = new URL(Value, Base || Root.location.href).href; }
      catch (Error) { Target = Value; }
      return fetch(Target, { cache: "no-store" }).then(function (Res) {
        if (!Res.ok) throw new Error("HTTP " + Res.status);
        var Type = (Res.headers.get("content-type") || "").split(";")[0].trim();
        return Res.arrayBuffer().then(function (Buffer) {
          var Ext = ExtFromUrl(Value) || ExtFromMime(Type);
          var FileName = UniqueName(Job.Hint, Ext);
          Assets[FileName] = new Uint8Array(Buffer);
          Job.Obj[Job.Key] = FileName; processed.set(Value, FileName);
        });
      }).catch(function () { throw new Error('Could not bundle local asset: ' + Value); });
    }

    Register(Clone.Meta, "Favicon", "favicon");
    Register(Clone.Profile, "Avatar", "avatar");
    Register(Clone.Profile, "Banner", "banner");
    Register(Clone.Presence, "Avatar", "presence-avatar");
    Register(Clone.Background, "Image", "background");
    Register(Clone.Background, "Video", "background-video");
    Register(Clone.Music, "Src", "music");
    Register(Clone.Music, "Cover", "music-cover");
    (Clone.Music.Tracks || []).forEach(function (track, index) { Register(track, 'Src', 'track-' + (index + 1)); Register(track, 'Cover', 'track-cover-' + (index + 1)); });
    Register(Clone.Theme, "FontCustomUrl", "font");
    Register(Clone.Cursor, "Image", "cursor");
    Register(Clone.Effects.EntryScreen, 'Icon', 'entry-icon');
    (Clone.Portfolio && Clone.Portfolio.Projects || []).forEach(function (project, i) { Register(project, 'Image', 'project-' + (i + 1)); });
    Register(Clone.Widgets && Clone.Widgets.Discord, "Icon", "discord-server");

    (Clone.Profile.Badges || []).forEach(function (Badge, Index) {
      Register(Badge, "Icon", "badge-" + (Index + 1));
    });
    (Clone.Social.Links || []).forEach(function (Link, Index) {
      Register(Link, "Icon", "icon-" + Slug(Link.Name || String(Index + 1)));
    });

    return Jobs.reduce(function (Chain, Job) {
      return Chain.then(function () { return Process(Job); });
    }, Promise.resolve()).then(function () {
      var Files = {};
      Files["index.html"] = BuildIndex(Clone, Config);
      Files["MEDIA-CREDITS.json"] = JSON.stringify({ stock: JSON.parse(Sources.Credits), selected: Clone.MediaCredits || [] }, null, 2);
      Files["css/style.css"] = Sources.Css || "";
      Files["css/layouts.css"] = Sources.LayoutCss || "";
      Files["js/profile.js"] = Sources.ProfileJs || "";
      Files["js/icons.js"] = Sources.IconsJs || "";
      Files["js/config.js"] = "window.PROFILE_CONFIG = " + JSON.stringify(Clone, null, 2) + ";\n";
      Files["README.md"] = BuildReadme(Clone);
      Files[".nojekyll"] = "";
      Object.keys(Assets).forEach(function (Name) { Files[Name] = Assets[Name]; });
      return Zip.Build(Files).then(function (Bytes) {
        return { Bytes: Bytes, Files: Object.keys(Files), Config: Clone };
      });
    });
  }

  function EscapeHtml(Text) {
    return String(Text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function BuildIndex(ExportConfig, RawConfig) {
    var Meta = RawConfig.Meta || {};
    var Lines = [];
    Lines.push("<!DOCTYPE html>");
    Lines.push('<html lang="en">');
    Lines.push("  <head>");
    Lines.push('    <meta charset="UTF-8" />');
    Lines.push('    <meta name="viewport" content="width=device-width, initial-scale=1.0" />');
    Lines.push("    <title>" + EscapeHtml(ExportConfig.Profile.DisplayName || "Profile") + "</title>");
    if (Meta.Description) Lines.push('    <meta name="description" content="' + EscapeHtml(Meta.Description) + '" />');
    Lines.push('    <link rel="stylesheet" href="css/style.css" />');
    Lines.push('    <link rel="stylesheet" href="css/layouts.css" />');
    Lines.push("  </head>");
    Lines.push("  <body>");
    Lines.push('    <div id="profile-root"></div>');
    Lines.push('    <script src="js/icons.js"></script>');
    Lines.push('    <script src="js/profile.js"></script>');
    Lines.push('    <script src="js/config.js"></script>');
    Lines.push("    <script>ProfileRuntime.AutoMount();</script>");
    Lines.push("  </body>");
    Lines.push("</html>");
    return Lines.join("\n") + "\n";
  }

  function BuildReadme(Config) {
    return [
      "# " + (Config.Profile.DisplayName || "My") + " — profile",
      "",
      "A static, self-hosted profile site exported with **Tabbed**.",
      "No build step, no backend, no tracking. Everything is plain HTML/CSS/JS.",
      "",
      "## Deploy",
      "",
      "### GitHub Pages",
      "1. Create a repository and upload every file in this folder (keep the structure).",
      "2. **Settings → Pages → Source: Deploy from a branch**, pick `main` / `root`.",
      "3. Your profile is live at `https://<user>.github.io/<repo>/`.",
      "",
      "The `.nojekyll` file is included so files starting with `_` are served correctly.",
      "",
      "### Any static host",
      "Drop the folder on Netlify, Cloudflare Pages, Vercel, or any web server. All paths are relative,",
      "so it works from a sub-path without configuration.",
      "",
      "### Locally",
      "Any static server, e.g. `python -m http.server`, then open the URL.",
      "Opening `index.html` directly with `file://` also works for most setups,",
      "but a local server is recommended so video/audio and fonts load reliably.",
      "",
      "## Editing",
      "",
      "All content lives in `js/config.js`. You can edit it by hand, or re-open the Tabbed editor",
      "and import your configuration JSON.",
      "",
      "## Structure",
      "",
      "```",
      "index.html          page shell",
      "css/style.css       styles",
      "js/config.js        your profile configuration",
      "js/profile.js       runtime (renders everything)",
      "js/icons.js         built-in social icon set (CC0)",
      "assets/             your uploaded images, videos, audio, fonts",
      "```",
      "",
      "## Accessibility & preferences",
      "",
      "- Respects `prefers-reduced-motion` (disables animations/particles).",
      "- All interactive controls are keyboard reachable.",
      "- No analytics or cookies. Remote media and Google Fonts, when selected, contact their providers.",
      ""
    ].join("\n");
  }

  Root.AboutuExport = {
    ExportSite: ExportSite,
    BuildIndex: BuildIndex,
    BuildReadme: BuildReadme
  };
})(window);
