(function (Global) {
  "use strict";

  var Runtime = Global.ProfileRuntime;
  if (!Runtime) return;

  var Default = Runtime.ValidateConfig(Global.PROFILE_CONFIG || Runtime.DefaultConfig).Config;
  var Fonts = Runtime.Fonts;
  var Icons = Global.ICONS || {};

  var State = {
    Config: null,
    DraftKey: "aboutu-draft-v1"
  };
  var NavObserver = null;

  var Preview = document.getElementById("preview-frame");
  var Stage = document.getElementById("preview-stage");
  var Forms = document.getElementById("forms-panel");
  var Nav = document.getElementById("editor-nav");
  var ToastEl = document.getElementById("toast");
  var PresetSel = document.getElementById("preset-select");
  var BtnExportZip = document.getElementById("btn-export-zip");
  var BtnSaveJson = document.getElementById("btn-save-json");
  var BtnLoadJson = document.getElementById("btn-load-json");
  var BtnReset = document.getElementById("btn-reset");
  var BtnReplay = document.getElementById("btn-replay");
  var JsonFile = document.getElementById("json-file");
  var ChkNoentry = document.getElementById("chk-noentry");
  var ChkEmbed = document.getElementById("chk-embed");

  function Clone(Val) { return structuredClone(Val); }

  function Toast(Text) {
    ToastEl.textContent = Text;
    ToastEl.classList.add("show");
    clearTimeout(Toast._T);
    Toast._T = setTimeout(function () { ToastEl.classList.remove("show"); }, 1900);
  }

  function LoadDraft() {
    try {
      var Raw = localStorage.getItem(State.DraftKey);
      if (Raw) {
        var Parsed = JSON.parse(Raw);
        State.Config = Runtime.ValidateConfig(Global.CleanLegacyDraft(Parsed)).Config;
        return;
      }
    } catch (Err) {}
    State.Config = Clone(Default);
  }

  var SaveTimer = null;
  function SaveDraft() {
    clearTimeout(SaveTimer);
    var Status = document.getElementById('save-status');
    if (Status) Status.textContent = 'Saving...';
    SaveTimer = setTimeout(function () {
      FlushDraft().catch(function () {});
    }, 200);
  }

  function FlushDraft() {
    clearTimeout(SaveTimer);
    return Global.ProfileStore.save(State.Config).then(function () {
      document.getElementById('save-status').textContent = 'Saved locally';
    }).catch(function () {
      document.getElementById('save-status').textContent = 'Save failed';
      Toast('Could not save this draft. Export JSON to keep a copy.');
      throw new Error('Draft could not be saved');
    });
  }

  var PreviewTimer;
  function SendPreview() { clearTimeout(PreviewTimer); PreviewTimer=setTimeout(SendPreviewNow,100); }
  function SendPreviewNow() {
    var Dialog = document.getElementById('preview-dialog');
    if (Dialog && !Dialog.open) { Global.ProfileStore.releaseUnused(State.Config); return; }
    if (State.Config && Preview && Preview.contentWindow) {
      Preview.contentWindow.postMessage({
        source: "aboutu-editor",
        type: "preview-config",
        config: State.Config,
        skipEntry: ChkNoentry.checked,
        embed: ChkEmbed.checked
      }, location.origin);
    }
  }

  function Touch() { SaveDraft(); SendPreview(); if (Global.Dashboard) Global.Dashboard.sync(); }

  window.addEventListener("message", function (Event) {
    var Data = Event.data;
    if (Event.source !== Preview.contentWindow || !Data || Data.source !== "aboutu-preview") return;
    if (Data.type === "preview-ready") SendPreview();
    if (Data.type === "preview-error") Toast("Preview error");
  });

  function Each(Iterable, Fn) {
    if (!Iterable) return;
    var Keys = Object.keys(Iterable);
    for (var I = 0; I < Keys.length; I++) Fn(Keys[I], Iterable[Keys[I]], I);
  }

  function Field(LabelText, Control, WrapClass) {
    var Wrap = document.createElement("div");
    if (WrapClass) Wrap.className = WrapClass;
    var L = document.createElement("label");
    L.className = "field";
    var S = document.createElement("span");
    S.className = "field-label";
    S.textContent = LabelText;
    L.appendChild(S);
    L.appendChild(Control);
    var Controls = Control.matches('input,textarea,select') ? [Control] : Control.querySelectorAll('input:not([type=file]),textarea,select');
    Array.from(Controls).forEach(function (Input, Index) {
      Input.setAttribute('aria-label', LabelText + (Controls.length > 1 ? (Input.type === 'color' ? ' picker' : Index ? ' value' : '') : ''));
    });
    Wrap.appendChild(L);
    return Wrap;
  }

  function TextControl(Value, OnChange, Type, Attrs) {
    var El = document.createElement("input");
    El.type = Type || "text";
    El.value = Value === undefined || Value === null ? "" : Value;
    if (Attrs) Each(Attrs, function (K, V) { El.setAttribute(K, V); });
    El.addEventListener("input", function () { OnChange(El.value); Touch(); });
    return El;
  }

  function NumberControl(Value, OnChange, Attrs) {
    return TextControl(Value, OnChange, "number", Attrs);
  }

  function RangeControl(Value, OnChange, Attrs) {
    var Wrap = document.createElement("div");
    Wrap.className = "range-wrap";
    var El = document.createElement("input");
    El.type = "range";
    if (Attrs) Each(Attrs, function (K, V) { El.setAttribute(K, V); });
    El.value = Value;
    var Out = document.createElement("span");
    Out.className = "range-value";
    Out.textContent = Value;
    function SyncFill() {
      var Min = parseFloat(El.min) || 0;
      var Max = El.max === "" || El.max === undefined ? 100 : parseFloat(El.max);
      var Pct = Max > Min ? ((parseFloat(El.value) - Min) / (Max - Min)) * 100 : 0;
      El.style.setProperty("--fill", Math.max(0, Math.min(100, Pct)) + "%");
    }
    El.addEventListener("input", function () {
      Out.textContent = El.value;
      SyncFill();
      OnChange(parseFloat(El.value));
      Touch();
    });
    SyncFill();
    Wrap.appendChild(El);
    Wrap.appendChild(Out);
    return Wrap;
  }

  function ColorControl(Value, OnChange) {
    var Wrap = document.createElement("div");
    Wrap.className = "color-wrap";
    var Swatch = document.createElement("input");
    Swatch.type = "color";
    Swatch.value = NormalizeHex(Value) || "#000000";
    var Text = document.createElement("input");
    Text.type = "text";
    Text.value = Value || "";
    Text.placeholder = "#rrggbb or rgba(...)";
    function Commit(Val) { OnChange(Val); Touch(); }
    Swatch.addEventListener("input", function () { Text.value = Swatch.value; Commit(Swatch.value); });
    Text.addEventListener("input", function () { Swatch.value = NormalizeHex(Text.value) || Swatch.value; Commit(Text.value); });
    Wrap.appendChild(Swatch);
    Wrap.appendChild(Text);
    return Wrap;
  }

  function NormalizeHex(Value) {
    if (typeof Value !== "string") return null;
    var V = Value.trim();
    if (/^#[0-9a-f]{6}$/i.test(V)) return V;
    if (/^#[0-9a-f]{3}$/i.test(V)) return "#" + V[1] + V[1] + V[2] + V[2] + V[3] + V[3];
    var M = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(V);
    if (M) {
      return "#" + [M[1], M[2], M[3]].map(function (N) {
        var H = Math.max(0, Math.min(255, parseInt(N, 10))).toString(16);
        return H.length === 1 ? "0" + H : H;
      }).join("");
    }
    return null;
  }

  function ToggleControl(Value, OnChange, LabelText) {
    var L = document.createElement("label");
    L.className = "toggle";
    var Cb = document.createElement("input");
    Cb.type = "checkbox";
    Cb.checked = !!Value;
    var Slider = document.createElement("span");
    Slider.className = "toggle-track";
    var Text = document.createElement("span");
    Text.className = "toggle-text";
    Text.textContent = LabelText || "";
    Cb.addEventListener("change", function () { OnChange(Cb.checked); Touch(); });
    L.appendChild(Cb);
    L.appendChild(Slider);
    L.appendChild(Text);
    return L;
  }

  function SelectControl(Options, Value, OnChange) {
    var Sel = document.createElement("select");
    (Options || []).forEach(function (Opt) {
      var O = document.createElement("option");
      O.value = Opt.value;
      O.textContent = Opt.label;
      if (String(O.value) === String(Value)) O.selected = true;
      Sel.appendChild(O);
    });
    Sel.addEventListener("change", function () { OnChange(Sel.value); Touch(); });
    return Sel;
  }

  function UrlField(Value, OnChange, Accept, Placeholder) {
    var Wrap = document.createElement("div");
    Wrap.className = "url-field media-url-field";
    function iconButton(control,label,path){control.textContent='';control.setAttribute('aria-label',label);control.title=label;control.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="'+path+'"/></svg>';}
    var El = document.createElement("input");
    El.type = "text";
    El.value = /^blob:/.test(Value) ? "" : Value || "";
    El.placeholder = /^blob:/.test(Value) ? "Uploaded file" : Placeholder || "URL or upload";
    El.addEventListener("input", function () { OnChange(El.value); Touch(); });
    var Btn = document.createElement("button");
    Btn.type = "button";
    Btn.className = "btn-upload";
    iconButton(Btn,'Upload','M12 16V3m-5 5 5-5 5 5M3 15v6h18v-6');
    var File = document.createElement("input");
    File.type = "file";
    File.accept = Accept || "image/*";
    File.hidden = true;
    Btn.addEventListener("click", function () { File.click(); });
    File.addEventListener("change", function () {
      var F = File.files[0];
      if (!F) return;
      Global.ProfileStore.addAsset(F).then(function (url) {
        OnChange(url);
        El.value = "uploaded:" + F.name;
        Touch();
        Toast("Uploaded " + F.name);
      }).catch(function () { Toast('Could not save this file.'); });
      File.value = "";
    });
    var Clear = document.createElement("button");
    Clear.type = "button";
    Clear.className = "btn-upload ghost";
    iconButton(Clear,'Clear','M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7');
    Clear.addEventListener("click", function () { OnChange(""); El.value = ""; Touch(); });
    Wrap.appendChild(El);
    Wrap.appendChild(Btn);
    if (!Accept || /image|audio|video/.test(Accept)) {
      var Search=document.createElement('button');Search.type='button';Search.className='btn-upload';Search.textContent='Search';
      iconButton(Search,'Search','M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0');
      Search.addEventListener('click',function(){Global.MediaSearch.Open({accept:Accept||'image/*',onSelect:function(url){OnChange(url);El.value='';El.placeholder='Selected media';Touch();}});});Wrap.appendChild(Search);
    }
    Wrap.appendChild(Clear);
    Wrap.appendChild(File);
    return Wrap;
  }

  var SERVICES = Global.ProfileServices.List;

  var BADGE_PRESETS = [
    { slug: "verified", label: "Verified" },
    { slug: "gem", label: "Premium" },
    { slug: "crown", label: "Crown" },
    { slug: "star", label: "Star" },
    { slug: "heart", label: "Heart" },
    { slug: "flame", label: "Legend" },
    { slug: "shield", label: "Shield" },
    { slug: "bug", label: "Bug hunter" },
    { slug: "code", label: "Developer" },
    { slug: "key", label: "Owner" },
    { slug: "bolt", label: "Early" },
    { slug: "rocket", label: "Booster" },
    { slug: "trophy", label: "Trophy" },
    { slug: "gift", label: "Gift" }
  ];

  function IconSvgEl(Slug) {
    var Data = Icons[Slug];
    if (!Data) return null;
    var NS = "http://www.w3.org/2000/svg";
    var Svg = document.createElementNS(NS, "svg");
    Svg.setAttribute("viewBox", Data.viewBox || Data.vb || "0 0 24 24");
    Svg.setAttribute("aria-hidden", "true");
    if (Data.body) { Svg.innerHTML = Data.body; Svg.setAttribute('fill', Data.attrs?.fill || 'currentColor'); if (Data.attrs?.stroke) Svg.setAttribute('stroke', Data.attrs.stroke); return Svg; }
    var Path = document.createElementNS(NS, "path");
    Path.setAttribute("d", Data.d);
    if (Data.fr) Path.setAttribute("fill-rule", Data.fr);
    Path.setAttribute("fill", "currentColor");
    Svg.appendChild(Path);
    return Svg;
  }

  function IconPicker(Value, OnPick, Picker, CustomOnChange, HideCustom) {
    var Wrap = document.createElement("div");
    Wrap.className = "icon-picker";
    var Grid = document.createElement("div");
    Grid.className = "icon-picker-grid";
    var Search = document.createElement('input'); Search.type = 'search'; Search.placeholder = 'Search icons...'; Search.setAttribute('aria-label', 'Search icons');
    Search.addEventListener('input', function () { var term = Search.value.toLowerCase(); Array.from(Grid.children).forEach(function (b) { b.hidden = !b.title.toLowerCase().includes(term) && !b.dataset.slug.includes(term); }); });
    Wrap.appendChild(Search);
    Picker.forEach(function (P) {
      var B = document.createElement("button");
      B.type = "button";
      B.className = "icon-pick" + (Value === P.slug ? " active" : "");
      B.title = P.label;
      B.dataset.slug = P.slug;
      B.setAttribute("aria-label", P.label);
      var Node = IconSvgEl(P.slug);
      if (Node) B.appendChild(Node);
      B.addEventListener("click", function () {
        OnPick(P.slug, P.url, P.label);
        var All = Grid.querySelectorAll(".icon-pick");
        for (var I = 0; I < All.length; I++) All[I].classList.remove("active");
        B.classList.add("active");
      });
      Grid.appendChild(B);
    });
    Wrap.appendChild(Grid);
    if (!HideCustom) {
      var Custom = document.createElement("div");
      Custom.className = "icon-picker-custom";
      Custom.appendChild(IconControl(Value, CustomOnChange || function () {}));
      Wrap.appendChild(Custom);
    }
    return Wrap;
  }

  function IconControl(Value, OnChange) {
    var Wrap = document.createElement("div");
    Wrap.className = "url-field";
    var Names = Object.keys(Icons).sort();
    var List = document.createElement("datalist");
    var ListId = "icon-list";
    List.id = ListId;
    Names.forEach(function (N) {
      var O = document.createElement("option");
      O.value = N;
      List.appendChild(O);
    });
    if (!document.getElementById(ListId)) document.body.appendChild(List);
    var El = document.createElement("input");
    El.type = "text";
    El.value = Value || "";
    El.placeholder = "icon slug (e.g. github) or URL";
    El.setAttribute("list", ListId);
    El.addEventListener("input", function () { OnChange(El.value); Touch(); });
    var Btn = document.createElement("button");
    Btn.type = "button";
    Btn.className = "btn-upload";
    Btn.textContent = "Upload";
    var File = document.createElement("input");
    File.type = "file";
    File.accept = "image/*";
    File.hidden = true;
    Btn.addEventListener("click", function () { File.click(); });
    File.addEventListener("change", function () {
      var F = File.files[0];
      if (!F) return;
      var Reader = new FileReader();
      Reader.onload = async function (E) { OnChange(E.target.result); El.value = "uploaded:" + F.name; Touch(); };
      Reader.readAsDataURL(F);
      File.value = "";
    });
    Wrap.appendChild(El);
    Wrap.appendChild(Btn);
    Wrap.appendChild(File);
    return Wrap;
  }

  Object.keys(Icons).forEach(function (slug) {
    if (!BADGE_PRESETS.some(function (p) { return p.slug === slug; })) BADGE_PRESETS.push({ slug: slug, label: Icons[slug].t || slug });
  });

  function ServiceUrlControl(Item, OnChange) {
    var service = Global.ProfileServices.ForLink(Item) || SERVICES[0];
    Item.Service = service.slug;
    var wrap = document.createElement('div'); wrap.className = 'service-url';
    var prefix = document.createElement('span'); prefix.className = 'service-url-prefix'; prefix.textContent = service.url; prefix.title = 'This service address is fixed';
    var input = document.createElement('input'); input.type = 'text'; input.className = 'service-url-suffix'; input.autocomplete = 'off'; input.placeholder = 'your-profile';
    input.value = Global.ProfileServices.Suffix(service, Item.Url);
    input.addEventListener('input', function () {
      Item.Url = Global.ProfileServices.Build(service, input.value);
      var valid = Item.Url !== service.url || !input.value;
      input.setAttribute('aria-invalid', String(!valid));
      input.setCustomValidity(valid ? '' : 'Enter a profile path for ' + service.label + '.');
      OnChange(); Touch();
    });
    wrap.append(prefix, input); return wrap;
  }

  var CurrentGroup = "";

  function Section(Title) {
    CurrentGroup = Title;
    var El = document.createElement("section");
    El.className = "group";
    var H = document.createElement("h2");
    H.className = "group-title";
    H.textContent = Title;
    El.appendChild(H);
    return El;
  }

  function Card(Title, IconGlyph, Collapsed) {
    var El = document.createElement("div");
    El.className = "card";
    El.id = "card-" + Slug(Title);
    var H = document.createElement("button");
    H.className = "card-head";
    H.type = 'button';
    H.setAttribute('aria-expanded', String(!Collapsed));
    if (IconGlyph) {
      var G = document.createElement("span");
      G.className = "card-glyph";
      G.textContent = IconGlyph;
      H.appendChild(G);
    }
    var T = document.createElement("span");
    T.textContent = Title;
    H.appendChild(T);
    var Chevron = document.createElement("span");
    Chevron.className = "card-chevron";
    Chevron.textContent = "\u25BE";
    Chevron.setAttribute("aria-hidden", "true");
    H.appendChild(Chevron);
    H.addEventListener("click", function () { El.classList.toggle("collapsed"); H.setAttribute('aria-expanded', String(!El.classList.contains('collapsed'))); });
    El.appendChild(H);
    var Body = document.createElement("div");
    Body.className = "card-body";
    El.appendChild(Body);
    if (Collapsed) El.classList.add("collapsed");
    return { Root: El, Body: Body, Title: Title, Id: El.id };
  }

  function Slug(T) { return String(T).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

  function Row(Control, LabelText, Span) {
    return Field(LabelText, Control, Span === "full" ? "span-full" : "");
  }

  var NavEntries = [];

  function AddCard(Container, Def, Build) {
    var Collapsed = Def.Collapsed === true || (Def.Open !== true && Def.Title !== "Profile");
    var C = Card(Def.Title, Def.Glyph, Collapsed);
    NavEntries.push({ Id: C.Id, Title: Def.Title, Glyph: Def.Glyph, Group: CurrentGroup });
    Build(C.Body);
    Container.appendChild(C.Root);
    return C;
  }

  function BuildForms() {
    Forms.innerHTML = "";
    NavEntries = [];
    var C = State.Config;

    var Identity = Section("Identity");
    AddCard(Identity, { Title: "Profile", Glyph: "@" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(TextControl(C.Profile.DisplayName, function (v) { C.Profile.DisplayName = v; }), "Display name"));
      Grid.appendChild(Row(TextControl(C.Profile.UserName, function (v) { C.Profile.UserName = v; }), "Username"));
      Grid.appendChild(Row(UrlField(C.Profile.Avatar, function (v) { C.Profile.Avatar = v; }, "image/*", "avatar image or gif"), "Avatar", "full"));
      Grid.appendChild(Row(UrlField(C.Profile.Banner, function (v) { C.Profile.Banner = v; }, "image/*", "hero banner (optional)"), "Banner", "full"));
      Grid.appendChild(Row(TextAreaControl(C.Profile.Bio, function (v) { C.Profile.Bio = v; }), "Description / bio", "full"));
      Grid.appendChild(Row(TextControl(C.Profile.Location, function (v) { C.Profile.Location = v; }), "Location"));
      Grid.appendChild(Row(TextControl(C.Profile.Tooltip, function (v) { C.Profile.Tooltip = v; }), "Name tooltip"));
      B.appendChild(Grid);

      var Toggles = document.createElement("div");
      Toggles.className = "toggles";
      Toggles.appendChild(ToggleControl(C.Profile.Verified, function (v) { C.Profile.Verified = v; }, "Verified badge"));
      Toggles.appendChild(ToggleControl(C.Profile.ShowViews, function (v) { C.Profile.ShowViews = v; }, "Show view count"));
      B.appendChild(Toggles);
    });

    AddCard(Identity, { Title: "Bio messages", Glyph: "✎" }, function (B) {
      var Info = document.createElement("p");
      Info.className = "help-text";
      Info.textContent = "Optional rotating bio. When set, these messages cycle in place of the static bio.";
      B.appendChild(Info);
      B.appendChild(StringListEditor(C.Profile.BioMessages, function (List) { C.Profile.BioMessages = List; Touch(); }, "a rotating message"));
    });

    AddCard(Identity, { Title: "Status", Glyph: "~" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(TextControl(C.Profile.Status, function (v) { C.Profile.Status = v; }), "Status text", "full"));
      B.appendChild(Grid);
      var Toggles = document.createElement("div");
      Toggles.className = "toggles";
      Toggles.appendChild(ToggleControl(C.Profile.StatusTypewriter, function (v) { C.Profile.StatusTypewriter = v; }, "Typewriter effect"));
      B.appendChild(Toggles);
      var Info = document.createElement("p");
      Info.className = "help-text";
      Info.textContent = "Optional rotating status lines. When several are set they cycle with the typewriter effect.";
      B.appendChild(Info);
      B.appendChild(StringListEditor(C.Profile.StatusMessages, function (List) { C.Profile.StatusMessages = List; Touch(); }, "a rotating status"));
    });

    AddCard(Identity, { Title: "Presence", Glyph: "#" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(SelectControl([{value:"Discord",label:"Discord"},{value:"GitHub",label:"GitHub"},{value:"Spotify",label:"Spotify"},{value:"Custom",label:"Custom"}], C.Presence.Platform, function (v) { C.Presence.Platform = v; }), "Platform"));
      Grid.appendChild(Row(TextControl(C.Presence.UserName, function (v) { C.Presence.UserName = v; }), "Username"));
      Grid.appendChild(Row(SelectControl([{value:"online",label:"Online"},{value:"idle",label:"Idle"},{value:"dnd",label:"Do not disturb"},{value:"offline",label:"Offline"}], C.Presence.State, function (v) { C.Presence.State = v; }), "Status dot"));
      Grid.appendChild(Row(TextControl(C.Presence.Status, function (v) { C.Presence.Status = v; }), "Activity text"));
      Grid.appendChild(Row(UrlField(C.Presence.Avatar, function (v) { C.Presence.Avatar = v; }, "image/*"), "Avatar", "full"));
      B.appendChild(Grid);
      B.appendChild(ToggleControl(C.Presence.Enabled, function (v) { C.Presence.Enabled = v; }, "Show presence"));
    });

    var Appearance = Section("Appearance");
    AddCard(Appearance, { Title: "Layout", Glyph: "▦" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(SelectControl(Global.PROFILE_LAYOUTS, C.Layout.Preset, function (v) { C.Layout.Preset = v; }), "Profile layout"));
      Grid.appendChild(Row(RangeControl(C.Layout.MaxWidth, function (v) { C.Layout.MaxWidth = v; }, { min: 260, max: 1200, step: 1 }), "Max width"));
      Grid.appendChild(Row(RangeControl(C.Layout.Radius, function (v) { C.Layout.Radius = v; }, { min: 0, max: 60, step: 1 }), "Corner radius"));
      Grid.appendChild(Row(RangeControl(C.Layout.Padding, function (v) { C.Layout.Padding = v; }, { min: 10, max: 60, step: 1 }), "Padding"));
      Grid.appendChild(Row(RangeControl(C.Profile.CardOpacity, function (v) { C.Profile.CardOpacity = v; }, { min: 0, max: 1, step: 0.01 }), "Card opacity"));
      Grid.appendChild(Row(RangeControl(C.Profile.CardBlur, function (v) { C.Profile.CardBlur = v; }, { min: 0, max: 40, step: 1 }), "Card blur"));
      B.appendChild(Grid);
    });

    AddCard(Appearance, { Title: "Colors", Glyph: "◐" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(ColorControl(C.Theme.Accent, function (v) { C.Theme.Accent = v; }), "Accent"));
      Grid.appendChild(Row(ColorControl(C.Theme.TextColor, function (v) { C.Theme.TextColor = v; }), "Text"));
      Grid.appendChild(Row(ColorControl(C.Theme.MutedColor, function (v) { C.Theme.MutedColor = v; }), "Muted text"));
      Grid.appendChild(Row(ColorControl(C.Theme.CardBorder, function (v) { C.Theme.CardBorder = v; }), "Card border"));
      Grid.appendChild(Row(ColorControl(C.Theme.GlowColor, function (v) { C.Theme.GlowColor = v; }), "Glow color"));
      Grid.appendChild(Row(RangeControl(C.Theme.GlowStrength, function (v) { C.Theme.GlowStrength = v; }, { min: 0, max: 3, step: 0.05 }), "Glow strength"));
      B.appendChild(Grid);
    });

    AddCard(Appearance, { Title: "Username glow", Glyph: "*" }, function (B) {
      var Info = document.createElement("p");
      Info.className = "help-text";
      Info.textContent = "Glows the username in its own text color.";
      B.appendChild(Info);
      B.appendChild(ToggleControl(C.Theme.UsernameGlow, function (v) { C.Theme.UsernameGlow = v; }, "Enable username glow"));
    });

    AddCard(Appearance, { Title: "Typography", Glyph: "A" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      var FontOptions = Object.keys(Fonts).map(function (K) { return { value: K, label: Fonts[K].Label }; });
      Grid.appendChild(Row(SelectControl(FontOptions, C.Theme.Font, function (v) { C.Theme.Font = v; }), "Font"));
      Grid.appendChild(Row(RangeControl(C.Theme.FontSize, function (v) { C.Theme.FontSize = v; }, { min: 12, max: 24, step: 1 }), "Font size"));
      Grid.appendChild(Row(UrlField(C.Theme.FontCustomUrl, function (v) { C.Theme.FontCustomUrl = v; }, "font/*,.otf,.ttf,.woff2", "custom font URL or upload"), "Custom font", "full"));
      B.appendChild(Grid);
    });

    AddCard(Appearance, { Title: "Background", Glyph: "▤" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(SelectControl([{value:"color",label:"Solid color"},{value:"gradient",label:"Gradient"},{value:"image",label:"Image"},{value:"video",label:"Video"}], C.Background.Type, function (v) { C.Background.Type = v; }), "Type"));
      Grid.appendChild(Row(ColorControl(C.Background.Color, function (v) { C.Background.Color = v; }), "Base color"));
      Grid.appendChild(Row(ColorControl(C.Background.GradientFrom, function (v) { C.Background.GradientFrom = v; }), "Gradient from"));
      Grid.appendChild(Row(ColorControl(C.Background.GradientTo, function (v) { C.Background.GradientTo = v; }), "Gradient to"));
      Grid.appendChild(Row(RangeControl(C.Background.GradientAngle, function (v) { C.Background.GradientAngle = v; }, { min: 0, max: 360, step: 1 }), "Gradient angle"));
      Grid.appendChild(Row(RangeControl(C.Background.Overlay, function (v) { C.Background.Overlay = v; }, { min: 0, max: 0.95, step: 0.01 }), "Dark overlay"));
      Grid.appendChild(Row(RangeControl(C.Background.Blur, function (v) { C.Background.Blur = v; }, { min: 0, max: 40, step: 1 }), "Background blur"));
      Grid.appendChild(Row(UrlField(C.Background.Image, function (v) { C.Background.Image = v; if (v) C.Background.Type = "image"; }, "image/*", "image URL or upload"), "Image", "full"));
      Grid.appendChild(Row(UrlField(C.Background.Video, function (v) { C.Background.Video = v; if (v) C.Background.Type = "video"; }, "video/*", "video URL or upload"), "Video", "full"));
      B.appendChild(Grid);
      B.appendChild(ToggleControl(C.Background.GradientAnimated, function (v) { C.Background.GradientAnimated = v; }, "Animate gradient"));
    });

    AddCard(Appearance, { Title: "Cursor", Glyph: "✜" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(UrlField(C.Cursor.Image, function (v) { C.Cursor.Image = v; }, "image/*", "cursor PNG or upload"), "Custom cursor", "full"));
      Grid.appendChild(Row(NumberControl(C.Cursor.HotspotX, function (v) { C.Cursor.HotspotX = parseInt(v, 10) || 0; }, { min: 0 }), "Hotspot X"));
      Grid.appendChild(Row(NumberControl(C.Cursor.HotspotY, function (v) { C.Cursor.HotspotY = parseInt(v, 10) || 0; }, { min: 0 }), "Hotspot Y"));
      B.appendChild(Grid);
    });

    var Effects = Section("Effects");
    AddCard(Effects, { Title: "Particles", Glyph: "✳" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(SelectControl([{value:"stars",label:"Stars"},{value:"rain",label:"Rain"},{value:"snow",label:"Snow"},{value:"embers",label:"Embers"},{value:"dust",label:"Dust"}], C.Effects.Particles.Type, function (v) { C.Effects.Particles.Type = v; }), "Style"));
      Grid.appendChild(Row(ColorControl(C.Effects.Particles.Color, function (v) { C.Effects.Particles.Color = v; }), "Color"));
      Grid.appendChild(Row(RangeControl(C.Effects.Particles.Count, function (v) { C.Effects.Particles.Count = v; }, { min: 0, max: 240, step: 1 }), "Count"));
      Grid.appendChild(Row(RangeControl(C.Effects.Particles.Parallax, function (v) { C.Effects.Particles.Parallax = v; }, { min: 0, max: 0.5, step: 0.01 }), "Mouse parallax"));
      B.appendChild(Grid);
      B.appendChild(ToggleControl(C.Effects.Particles.Enabled, function (v) { C.Effects.Particles.Enabled = v; }, "Enable particles"));
    });

    AddCard(Effects, { Title: "Cursor effects", Glyph: "✦" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(SelectControl([{value:'stars',label:'Shooting stars'},{value:'cat',label:'Following cat'}], C.Effects.CursorTrail.Type, function (v) { C.Effects.CursorTrail.Type = v; }), 'Cursor effect'));
      Grid.appendChild(Row(ColorControl(C.Effects.CursorTrail.Color, function (v) { C.Effects.CursorTrail.Color = v; }), "Trail color"));
      Grid.appendChild(Row(RangeControl(C.Effects.CursorTrail.Size, function (v) { C.Effects.CursorTrail.Size = v; }, { min: 1, max: 12, step: 0.5 }), "Trail size"));
      Grid.appendChild(Row(RangeControl(C.Effects.CursorTrail.Glow, function (v) { C.Effects.CursorTrail.Glow = v; }, { min: 0, max: 40, step: 1 }), "Trail glow"));
      B.appendChild(Grid);
      B.appendChild(ToggleControl(C.Effects.CursorTrail.Enabled, function (v) { C.Effects.CursorTrail.Enabled = v; }, "Enable cursor trail"));
    });

    AddCard(Effects, { Title: "Name & motion", Glyph: "≈" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(RangeControl(C.Effects.NameGlitch.Intensity, function (v) { C.Effects.NameGlitch.Intensity = v; }, { min: 0, max: 3, step: 0.1 }), "Glitch intensity"));
      Grid.appendChild(Row(RangeControl(C.Effects.Tilt.Intensity, function (v) { C.Effects.Tilt.Intensity = v; }, { min: 0, max: 30, step: 1 }), "Tilt intensity"));
      Grid.appendChild(Row(RangeControl(C.Effects.AvatarGlitch.Intensity, function (v) { C.Effects.AvatarGlitch.Intensity = v; }, { min: 0, max: 3, step: 0.1 }), "Avatar glitch intensity"));
      B.appendChild(Grid);
      var Toggles = document.createElement("div");
      Toggles.className = "toggles";
      Toggles.appendChild(ToggleControl(C.Effects.NameGlitch.Enabled, function (v) { C.Effects.NameGlitch.Enabled = v; }, "Name glitch"));
      Toggles.appendChild(ToggleControl(C.Effects.Tilt.Enabled, function (v) { C.Effects.Tilt.Enabled = v; }, "3D tilt"));
      Toggles.appendChild(ToggleControl(C.Effects.AvatarGlitch.Enabled, function (v) { C.Effects.AvatarGlitch.Enabled = v; }, "Avatar glitch"));
      B.appendChild(Toggles);
    });

    AddCard(Effects, { Title: "Overlays", Glyph: "▣" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(RangeControl(C.Effects.Grain.Opacity, function (v) { C.Effects.Grain.Opacity = v; }, { min: 0, max: 0.4, step: 0.01 }), "Grain opacity"));
      Grid.appendChild(Row(RangeControl(C.Effects.Vignette.Strength, function (v) { C.Effects.Vignette.Strength = v; }, { min: 0, max: 1, step: 0.01 }), "Vignette strength"));
      B.appendChild(Grid);
      var Toggles = document.createElement("div");
      Toggles.className = "toggles";
      Toggles.appendChild(ToggleControl(C.Effects.Grain.Enabled, function (v) { C.Effects.Grain.Enabled = v; }, "Film grain"));
      Toggles.appendChild(ToggleControl(C.Effects.Vignette.Enabled, function (v) { C.Effects.Vignette.Enabled = v; }, "Vignette"));
      B.appendChild(Toggles);
    });

    AddCard(Effects, { Title: "Entry screen", Glyph: "▶" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(TextControl(C.Effects.EntryScreen.Symbol, function (v) { C.Effects.EntryScreen.Symbol = v; }, "text", { maxlength: 8 }), "Symbol"));
      Grid.appendChild(Row(TextControl(C.Effects.EntryScreen.Text, function (v) { C.Effects.EntryScreen.Text = v; }, "text", { maxlength: 40 }), "Prompt text"));
      Grid.appendChild(Row(TextControl(C.Effects.EntryScreen.Subtitle, function (v) { C.Effects.EntryScreen.Subtitle = v; }), 'Entry subtitle'));
      Grid.appendChild(Row(UrlField(C.Effects.EntryScreen.Icon, function (v) { C.Effects.EntryScreen.Icon = v; }, 'image/*', 'Entry image'), 'Entry image', 'full'));
      Grid.appendChild(Row(RangeControl(C.Effects.EntryScreen.Blur, function (v) { C.Effects.EntryScreen.Blur = v; }, { min: 0, max: 60, step: 1 }), "Blur"));
      Grid.appendChild(Row(RangeControl(C.Effects.EntryScreen.Dim, function (v) { C.Effects.EntryScreen.Dim = v; }, { min: 0, max: 0.95, step: 0.01 }), "Dim"));
      B.appendChild(Grid);
      B.appendChild(ToggleControl(C.Effects.EntryScreen.Enabled, function (v) { C.Effects.EntryScreen.Enabled = v; }, "Show entry screen"));
    });

    var Media = Section("Media & title");
    AddCard(Media, { Title: "Music player", Glyph: "♪" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      if (C.Music.Tracks.length) Grid.appendChild(Row(SelectControl(C.Music.Tracks.map(function (track, i) { return { value: i, label: track.Title || 'Track ' + (i + 1) }; }), C.Music.TrackIndex, function (v) {
        C.Music.TrackIndex = Number(v); var track = C.Music.Tracks[C.Music.TrackIndex]; C.Music.Src = track.Src; C.Music.Title = track.Title; C.Music.Cover = track.Cover; BuildForms();
      }), 'Selected track', 'full'));
      if (!C.Music.Tracks.length) Grid.appendChild(Row(TextControl(C.Music.Title, function (v) { C.Music.Title = v; }), "Track title"));
      Grid.appendChild(Row(TextControl(C.Music.Artist, function (v) { C.Music.Artist = v; }), "Artist"));
      if (!C.Music.Tracks.length) {
        Grid.appendChild(Row(UrlField(C.Music.Src, function (v) { C.Music.Src = v; }, "audio/*", "audio URL or upload"), "Audio", "full"));
        Grid.appendChild(Row(UrlField(C.Music.Cover, function (v) { C.Music.Cover = v; }, "image/*", "cover art"), "Cover", "full"));
      }
      Grid.appendChild(Row(RangeControl(C.Music.Volume, function (v) { C.Music.Volume = v; }, { min: 0, max: 1, step: 0.01 }), "Volume"));
      B.appendChild(Grid);
      var Toggles = document.createElement("div");
      Toggles.className = "toggles";
      Toggles.appendChild(ToggleControl(C.Music.Enabled, function (v) { C.Music.Enabled = v; }, "Enable music"));
      Toggles.appendChild(ToggleControl(C.Music.Loop, function (v) { C.Music.Loop = v; }, "Loop"));
      Toggles.appendChild(ToggleControl(C.Music.Autoplay, function (v) { C.Music.Autoplay = v; }, "Autoplay"));
      B.appendChild(Toggles);
    });

    AddCard(Media, { Title: "Favicon & SEO", Glyph: "▭" }, function (B) {
      var Info = document.createElement("p");
      Info.className = "help-text";
      Info.textContent = "The browser tab title is always your display name.";
      B.appendChild(Info);
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(TextAreaControl(C.Meta.Description, function (v) { C.Meta.Description = v; }), "Description meta", "full"));
      Grid.appendChild(Row(UrlField(C.Meta.Favicon, function (v) { C.Meta.Favicon = v; }, "image/*", "favicon"), "Favicon", "full"));
      B.appendChild(Grid);
    });

    AddCard(Media, { Title: 'Playlist', Glyph: '♪' }, function (B) {
      var Help = document.createElement('p'); Help.className = 'help-text'; Help.textContent = 'Add tracks, arrange their order, and paste timestamped LRC lyrics. The selected track is the first one visitors hear.'; B.appendChild(Help);
      B.appendChild(ArrayEditor(C.Music.Tracks, function (tracks) {
        var lengthChanged = tracks.length !== C.Music.Tracks.length;
        C.Music.Tracks = tracks; C.Music.TrackIndex = Math.min(C.Music.TrackIndex, Math.max(0, tracks.length - 1));
        var track = tracks[C.Music.TrackIndex]; if (track) { C.Music.Src = track.Src; C.Music.Title = track.Title; C.Music.Cover = track.Cover; }
        var selected = Forms.querySelector('#card-music-player select');
        if (selected) {
          selected.replaceChildren();
          tracks.forEach(function (item, i) { var option = document.createElement('option'); option.value = i; option.textContent = item.Title || 'Track ' + (i + 1); selected.appendChild(option); });
          selected.value = C.Music.TrackIndex;
        }
        Touch();
        if (lengthChanged) requestAnimationFrame(BuildForms);
      }, function () { return { Title: 'New track', Src: '', Cover: '', Lyrics: '' }; }, [
        { key: 'Title', label: 'Track title', control: 'text', full: true },
        { key: 'Src', label: 'Track audio', control: 'url', accept: 'audio/*', full: true },
        { key: 'Cover', label: 'Track cover', control: 'url', accept: 'image/*', full: true },
        { key: 'Lyrics', label: 'Timed lyrics (LRC)', control: 'textarea', full: true }
      ], 'Add track'));
    });

    AddCard(Media, { Title: 'Portfolio sections', Glyph: '▤' }, function (B) {
      var Grid = document.createElement('div'); Grid.className = 'grid';
      Grid.appendChild(Row(TextControl(C.Portfolio.AboutTitle, function (v) { C.Portfolio.AboutTitle = v; }), 'About heading'));
      Grid.appendChild(Row(TextAreaControl(C.Portfolio.AboutText, function (v) { C.Portfolio.AboutText = v; }), 'About introduction', 'full'));
      Grid.appendChild(Row(TextAreaControl(C.Portfolio.AboutDetails, function (v) { C.Portfolio.AboutDetails = v; }), 'About details', 'full'));
      Grid.appendChild(Row(StringListEditor(C.Portfolio.Tags, function (v) { C.Portfolio.Tags = v; }, 'Interest'), 'Interest tags', 'full'));
      Grid.appendChild(Row(StringListEditor(C.Portfolio.ProjectTitles, function (v) { C.Portfolio.ProjectTitles = v; }, 'Section heading'), 'Project section headings', 'full'));
      Grid.appendChild(Row(TextControl(C.Portfolio.LastFm.UserName, function (v) { C.Portfolio.LastFm.UserName = v; }), 'Last.fm username'));
      Grid.appendChild(Row(NumberControl(C.Portfolio.LastFm.Scrobbles, function (v) { C.Portfolio.LastFm.Scrobbles = Number(v); }, { min: 0 }), 'Scrobbles'));
      Grid.appendChild(Row(NumberControl(C.Portfolio.LastFm.Artists, function (v) { C.Portfolio.LastFm.Artists = Number(v); }, { min: 0 }), 'Artists'));
      B.appendChild(Grid); B.appendChild(ToggleControl(C.Portfolio.LastFm.Enabled, function (v) { C.Portfolio.LastFm.Enabled = v; }, 'Show Last.fm card'));
      B.appendChild(ArrayEditor(C.Portfolio.Projects, function (v) { C.Portfolio.Projects = v; Touch(); }, function () { return { Section: 0, Title: 'New project', Description: '', Image: '', Service: 'github', Icon: 'github', Url: 'https://github.com/' }; }, [
        { key: 'Section', label: 'Section', control: 'select', options: [{value:0,label:'First project section'},{value:1,label:'Second project section'}] },
        { key: 'Title', label: 'Project title', control: 'text', full: true },
        { key: 'Description', label: 'Project description', control: 'textarea', full: true },
        { key: 'Image', label: 'Project image', control: 'url', accept: 'image/*', full: true },
        { key: 'Icon', label: 'Service', control: 'service', full: true },
        { key: 'Url', label: 'Profile path', control: 'serviceurl', full: true }
      ], 'Add project'));
    });

    var Links = Section("Social");
    AddCard(Links, { Title: "Badges", Glyph: "◇" }, function (B) {
      var Editor = ArrayEditor(C.Profile.Badges, function (Badges) { C.Profile.Badges = Badges; Touch(); }, function () {
        return { Icon: "verified", Label: "New badge", Color: "" };
      }, [
        { key: "Label", label: "Label", control: "text" },
        { key: "Icon", label: "Badge icon", control: "badgeicon", full: true },
        { key: "Color", label: "Custom color (optional)", control: "color" }
      ], "Add badge");
      B.appendChild(Editor);
    });

    AddCard(Links, { Title: "Links", Glyph: "↗" }, function (B) {
      var Grid = document.createElement("div");
      Grid.className = "grid";
      Grid.appendChild(Row(SelectControl([{value:"glow",label:"Glow"},{value:"boxed",label:"Boxed"},{value:"plain",label:"Plain"}], C.Social.Style, function (v) { C.Social.Style = v; }), "Style"));
      Grid.appendChild(Row(RangeControl(C.Social.IconSize, function (v) { C.Social.IconSize = v; }, { min: 18, max: 72, step: 1 }), "Icon size"));
      B.appendChild(Grid);
      B.appendChild(ToggleControl(C.Social.Monochrome, function (v) { C.Social.Monochrome = v; }, "Monochrome icons"));
      var Editor = ArrayEditor(C.Social.Links, function (LinkList) { C.Social.Links = LinkList; Touch(); }, function () {
        return { Name: "GitHub", Service: "github", Url: "https://github.com/", Icon: "github", Color: "" };
      }, [
        { key: "Icon", label: "Service", control: "service", full: true },
        { key: "Url", label: "Profile path", control: "serviceurl", full: true },
        { key: 'Mode', label: 'On click', control: 'select', options: [{ value: 'link', label: 'Open profile' }, { value: 'copy', label: 'Copy username' }], rebuild: true },
        { key: 'CopyText', label: 'Username to copy', control: 'text', full: true },
        { key: "Color", label: "Icon color", control: "color" }
      ], "Add link");
      B.appendChild(Editor);
    });

    AddCard(Media, { Title: "Visitor controls", Glyph: "⇄" }, function (B) {
      var Info = document.createElement("p");
      Info.className = "help-text";
      Info.textContent = "Optional on-page controls for visitors: music volume/mute and a card opacity slider.";
      B.appendChild(Info);
      var Toggles = document.createElement("div");
      Toggles.className = "toggles";
      Toggles.appendChild(ToggleControl(C.Controls.Volume, function (v) { C.Controls.Volume = v; }, "Volume + mute"));
      Toggles.appendChild(ToggleControl(C.Controls.Opacity, function (v) { C.Controls.Opacity = v; }, "Opacity slider"));
      B.appendChild(Toggles);
      B.appendChild(ToggleControl(C.Controls.Enabled, function (v) { C.Controls.Enabled = v; }, "Show visitor controls"));
    });

    var Export = Section("Publish");
    AddCard(Export, { Title: "Export", Glyph: "⇩" }, function (B) {
      var Info = document.createElement("p");
      Info.className = "help-text";
      Info.textContent = "Export a standalone website (zip) you can drop on GitHub Pages, Netlify, Cloudflare Pages, or any static host. Uploaded files are bundled into assets/.";
      B.appendChild(Info);
      var RowEl = document.createElement("div");
      RowEl.className = "export-row";
      var ZipBtn = document.createElement("button");
      ZipBtn.type = "button";
      ZipBtn.className = "btn-primary";
      ZipBtn.textContent = "Export website (.zip)";
      ZipBtn.addEventListener("click", DoExportZip);
      var JsonBtn = document.createElement("button");
      JsonBtn.type = "button";
      JsonBtn.className = "btn-secondary";
      JsonBtn.textContent = "Export config (.json)";
      JsonBtn.addEventListener("click", DoExportJson);
      RowEl.appendChild(ZipBtn);
      RowEl.appendChild(JsonBtn);
      B.appendChild(RowEl);
    });

    Forms.appendChild(Identity);
    Forms.appendChild(Appearance);
    Forms.appendChild(Effects);
    Forms.appendChild(Media);
    Forms.appendChild(Links);
    Forms.appendChild(Export);

    BuildNav();
  }

  function TextAreaControl(Value, OnChange) {
    var El = document.createElement("textarea");
    El.value = Value || "";
    El.rows = 3;
    El.addEventListener("input", function () { OnChange(El.value); Touch(); });
    return El;
  }

  function BuildFieldsGrid(Item, Fields, OnChange, OnRebuildNeeded) {
    var Grid = document.createElement("div");
    Grid.className = "grid";
    Fields.forEach(function (F) {
      if (F.key === 'CopyText' && Item.Mode !== 'copy') return;
      function Set(V) { Item[F.key] = V; OnChange(); if (F.rebuild) OnRebuildNeeded(); }
      var Control;
      if (F.control === "icon") Control = IconControl(Item[F.key] || "", Set);
      else if (F.control === "service") {
        Control = IconPicker(Item.Service || Item.Icon || "", function (Slug, Url) {
          Item.Service = Slug;
          Item.Icon = Slug;
          Item.Url = Url;
          for (var S = 0; S < SERVICES.length; S++) {
            if (SERVICES[S].slug === Slug) { Item.Name = SERVICES[S].label; break; }
          }
          OnChange(); OnRebuildNeeded();
        }, SERVICES, null, true);
      }
      else if (F.control === "badgeicon") {
        Control = IconPicker(Item.Icon || "", function (Slug, Url, Label) {
          Item.Icon = Slug;
          Item.Label = Label;
          OnChange(); OnRebuildNeeded();
        }, BADGE_PRESETS, function (V) { Item.Icon = V; OnChange(); });
      }
      else if (F.control === 'serviceurl') Control = ServiceUrlControl(Item, OnChange);
      else if (F.control === 'url') Control = UrlField(Item[F.key] || '', Set, F.accept);
      else if (F.control === 'textarea') Control = TextAreaControl(Item[F.key] || '', Set);
      else if (F.control === "color") Control = ColorControl(Item[F.key] || "", Set);
      else if (F.control === "select") Control = SelectControl(F.options || [], Item[F.key] === undefined ? (F.def || "") : Item[F.key], Set);
      else if (F.control === "range") Control = RangeControl(Item[F.key] === undefined ? (F.def || 0) : Item[F.key], Set, { min: F.min, max: F.max, step: F.step });
      else Control = TextControl(Item[F.key] || "", Set);
      Grid.appendChild(Row(Control, F.label, F.full ? "full" : ""));
    });
    return Grid;
  }

  function OpenModal(Title, BodyNodes) {
    var Backdrop = document.createElement("dialog");
    Backdrop.className = "modal-backdrop";
    var Panel = document.createElement("div");
    Panel.className = "modal-panel";
    Panel.setAttribute("role", "dialog");
    Panel.setAttribute("aria-modal", "true");
    Panel.setAttribute("aria-label", Title);
    var Head = document.createElement("div");
    Head.className = "modal-head";
    var Heading = document.createElement("h3");
    Heading.className = "modal-title";
    Heading.textContent = Title;
    var Close = document.createElement("button");
    Close.type = "button";
    Close.className = "modal-close";
    Close.setAttribute("aria-label", "Close");
    Close.textContent = "✕";
    Head.appendChild(Heading);
    Head.appendChild(Close);
    Panel.appendChild(Head);
    var Body = document.createElement("div");
    Body.className = "modal-body";
    (Array.isArray(BodyNodes) ? BodyNodes : [BodyNodes]).forEach(function (Node) { Body.appendChild(Node); });
    Panel.appendChild(Body);
    Backdrop.appendChild(Panel);
    document.body.appendChild(Backdrop);
    Backdrop.showModal();

    function CloseModal() {
      document.removeEventListener("keydown", OnKey);
      Backdrop.close();
      if (Backdrop.parentNode) Backdrop.parentNode.removeChild(Backdrop);
    }
    function OnKey(Evt) { if (Evt.key === "Escape") CloseModal(); }
    Backdrop.addEventListener("mousedown", function (Evt) { if (Evt.target === Backdrop) CloseModal(); });
    Close.addEventListener("click", CloseModal);
    Backdrop.addEventListener('cancel', function (Evt) { Evt.preventDefault(); CloseModal(); });
    document.addEventListener("keydown", OnKey);

    return CloseModal;
  }

  function OpenAddItemModal(Title, Empty, Fields, OnConfirm) {
    var Draft = Empty();
    var Body = document.createElement("div");
    function RenderGrid() {
      Body.innerHTML = "";
      Body.appendChild(BuildFieldsGrid(Draft, Fields, function () {}, RenderGrid));
    }
    RenderGrid();
    var Actions = document.createElement("div");
    Actions.className = "modal-actions";
    var Cancel = document.createElement("button");
    Cancel.type = "button";
    Cancel.className = "ghost";
    Cancel.textContent = "Cancel";
    var Confirm = document.createElement("button");
    Confirm.type = "button";
    Confirm.className = "primary";
    Confirm.textContent = Title;
    Actions.appendChild(Cancel);
    Actions.appendChild(Confirm);
    var CloseModal = OpenModal(Title, [Body, Actions]);
    Cancel.addEventListener("click", CloseModal);
    Confirm.addEventListener("click", function () {
      OnConfirm(Draft);
      CloseModal();
    });
  }

  function ArrayEditor(List, OnChange, Empty, Fields, AddLabel) {
    var Wrap = document.createElement("div");
    Wrap.className = "array-editor";
    var Items = Clone(List || []);

    function Commit() { OnChange(Clone(Items)); SaveDraft(); }

    function Rebuild() {
      Wrap.innerHTML = "";
      Items.forEach(function (Item, Index) {
        var El = document.createElement("div");
        El.className = "array-item";
        var Head = document.createElement("div");
        Head.className = "array-head";
        var Num = document.createElement("span");
        Num.className = "array-num";
        Num.textContent = "#" + (Index + 1);
        Head.appendChild(Num);
        var Controls = document.createElement("div");
        Controls.className = "array-controls";
        var Up = IconButton("↑", "Move up", function () {
          if (Index === 0) return;
          var T = Items[Index - 1]; Items[Index - 1] = Items[Index]; Items[Index] = T;
          Commit(); SaveDraft(); SendPreview(); Rebuild();
        });
        var Down = IconButton("↓", "Move down", function () {
          if (Index >= Items.length - 1) return;
          var T = Items[Index + 1]; Items[Index + 1] = Items[Index]; Items[Index] = T;
          Commit(); SaveDraft(); SendPreview(); Rebuild();
        });
        var Remove = IconButton("✕", "Remove", function () {
          Items.splice(Index, 1);
          Commit(); SaveDraft(); SendPreview(); Rebuild();
        });
        Controls.appendChild(Up);
        Controls.appendChild(Down);
        Controls.appendChild(Remove);
        Head.appendChild(Controls);
        El.appendChild(Head);
        var Grid = BuildFieldsGrid(Item, Fields, function () { Commit(); SaveDraft(); SendPreview(); }, function () { Commit(); SaveDraft(); SendPreview(); Rebuild(); });
        El.appendChild(Grid);
        Wrap.appendChild(El);
      });
      var Add = document.createElement("button");
      Add.type = "button";
      Add.className = "btn-add";
      Add.textContent = AddLabel || '+ Add';
      Add.addEventListener("click", function () {
        OpenAddItemModal(AddLabel || "Add item", Empty, Fields, function (NewItem) {
          Items.push(NewItem);
          Commit(); SaveDraft(); SendPreview(); Rebuild();
        });
      });
      Wrap.appendChild(Add);
    }

    Rebuild();
    return Wrap;
  }

  function StringListEditor(Values, OnChange, Placeholder) {
    var Wrap = document.createElement("div");
    Wrap.className = "array-editor";
    var Items = (Values || []).slice();

    function Commit() { OnChange(Items.slice()); SaveDraft(); SendPreview(); }

    function Rebuild() {
      Wrap.innerHTML = "";
      Items.forEach(function (Value, Index) {
        var RowEl = document.createElement("div");
        RowEl.className = "array-item array-item-row";
        var Input = document.createElement("input");
        Input.type = "text";
        Input.value = Value || "";
        Input.placeholder = Placeholder || "";
        Input.addEventListener("input", function () { Items[Index] = Input.value; Commit(); });
        var Remove = IconButton("✕", "Remove", function () { Items.splice(Index, 1); Commit(); Rebuild(); });
        RowEl.appendChild(Input);
        RowEl.appendChild(Remove);
        Wrap.appendChild(RowEl);
      });
      var Add = document.createElement("button");
      Add.type = "button";
      Add.className = "btn-add";
      Add.textContent = "+ Add message";
      Add.addEventListener("click", function () { Items.push(""); Commit(); Rebuild(); });
      Wrap.appendChild(Add);
    }

    Rebuild();
    return Wrap;
  }

  function IconButton(Glyph, Title, OnClick) {
    var B = document.createElement("button");
    B.type = "button";
    B.className = "icon-btn";
    B.title = Title;
    B.setAttribute("aria-label", Title);
    B.textContent = Glyph;
    B.addEventListener("click", OnClick);
    return B;
  }

  function BuildNav() {
    if (Global.Dashboard) Global.Dashboard.refresh();
    return;
    Nav.innerHTML = "";
    if (NavObserver) { NavObserver.disconnect(); NavObserver = null; }
    var LastGroup = null;
    var Buttons = [];
    NavEntries.forEach(function (Entry) {
      if (Entry.Group !== LastGroup) {
        LastGroup = Entry.Group;
        var GroupLabel = document.createElement("span");
        GroupLabel.className = "nav-title";
        GroupLabel.textContent = Entry.Group;
        Nav.appendChild(GroupLabel);
      }
      var B = document.createElement("button");
      B.type = "button";
      B.className = "nav-btn";
      B.dataset.target = Entry.Id;
      var Glyph = document.createElement("span");
      Glyph.className = "nav-btn-glyph";
      Glyph.textContent = Entry.Glyph || "";
      Glyph.setAttribute("aria-hidden", "true");
      var Label = document.createElement("span");
      Label.className = "nav-btn-label";
      Label.textContent = Entry.Title;
      B.appendChild(Glyph);
      B.appendChild(Label);
      B.addEventListener("click", function () {
        var Target = document.getElementById(Entry.Id);
        if (Target) {
          Target.classList.remove("collapsed");
          Target.scrollIntoView({ behavior: "smooth", block: "start" });
          Forms.scrollTo({ top: Target.offsetTop - Forms.offsetTop - 12, behavior: "smooth" });
        }
      });
      Nav.appendChild(B);
      Buttons.push(B);
    });
    if (Global.IntersectionObserver) {
      NavObserver = new Global.IntersectionObserver(function (Entries) {
        Entries.forEach(function (ObsEntry) {
          if (!ObsEntry.isIntersecting) return;
          var Match = Buttons.filter(function (B) { return B.dataset.target === ObsEntry.target.id; })[0];
          if (!Match) return;
          Buttons.forEach(function (B) { B.classList.remove("active"); });
          Match.classList.add("active");
        });
      }, { root: Forms, rootMargin: "-10% 0px -75% 0px", threshold: 0 });
      NavEntries.forEach(function (Entry) {
        var Target = document.getElementById(Entry.Id);
        if (Target) NavObserver.observe(Target);
      });
    }
  }

  var PRESETS = {
    crimson: {
      Background: { Type: "gradient", GradientFrom: "#160309", GradientTo: "#2b0a120f", GradientAngle: 160 },
      Theme: { Accent: "#ff5d6c", GlowColor: "rgba(255,80,100,0.85)", TextColor: "#ffe6ea" },
      Effects: { Particles: { Enabled: true, Type: "rain", Color: "#ff5d6c", Count: 90 }, NameGlitch: { Enabled: true, Intensity: 1.2 } }
    },
    cyber: {
      Background: { Type: "gradient", GradientFrom: "#02040a", GradientTo: "#041726", GradientAngle: 120 },
      Theme: { Accent: "#3df5ff", GlowColor: "rgba(61,245,255,0.8)", TextColor: "#ccfaff", Font: "space" },
      Effects: { Particles: { Enabled: true, Type: "stars", Color: "#3df5ff", Count: 110 }, CursorTrail: { Color: "#3df5ff" } }
    },
    sunset: {
      Background: { Type: "gradient", GradientFrom: "#2a0f36", GradientTo: "#ff7a45", GradientAngle: 135 },
      Theme: { Accent: "#ffb86b", GlowColor: "rgba(255,150,90,0.8)", TextColor: "#fff1e0" },
      Effects: { Particles: { Enabled: true, Type: "embers", Color: "#ffb86b", Count: 60 } }
    },
    minimal: {
      Background: { Type: "color", Color: "#0b0c10" },
      Theme: { Accent: "#e8ecf1", GlowColor: "rgba(255,255,255,0.25)", UsernameGlow: false, TextColor: "#e8ecf1" },
      Layout: { Preset: "minimal" },
      Effects: {
        Particles: { Enabled: false }, CursorTrail: { Enabled: false }, NameGlitch: { Enabled: false },
        Tilt: { Enabled: false }, Grain: { Enabled: false }, Vignette: { Enabled: false }, EntryScreen: { Enabled: false }
      },
      Social: { Style: "plain", Monochrome: true }
    },
    nova: {}
  };

  function MergePatch(Target, Patch) {
    Each(Patch, function (K, V) {
      if (V && typeof V === "object" && !Array.isArray(V) && Target[K] && typeof Target[K] === "object") {
        MergePatch(Target[K], V);
      } else {
        Target[K] = V;
      }
    });
    return Target;
  }

  function ApplyPreset(Name) {
    var Next = Clone(Default);
    if (Name === "nova") {
      Next = Clone(Default);
      Next.Profile.UserName = "nova";
      Next.Profile.DisplayName = "nova";
      Next.Profile.Avatar = "assets/web/avatar.webp";
      Next.Profile.Bio = "building open-source tools.";
      Next.Profile.Status = "shipping things on the open web";
      Next.Social.Links = [
        { Name: "GitHub", Url: "https://github.com/", Icon: "github" },
        { Name: "X", Url: "https://x.com/", Icon: "x" },
        { Name: "Spotify", Url: "https://open.spotify.com/", Icon: "spotify" }
      ];
      Next.Profile.Badges = [
        { Icon: "assets/badges/verified.svg", Label: "Verified", Color: "" },
        { Icon: "assets/badges/builder.svg", Label: "Builder", Color: "" }
      ];
      Next.Profile.BioMessages = [
        "building open-source tools.",
        "shipping on the open web."
      ];
      Next.Controls = { Enabled: true, Volume: true, Opacity: true };
    } else if (PRESETS[Name]) {
      MergePatch(Next, PRESETS[Name]);
    }
    State.Config = Next;
    BuildForms();
    SaveDraft();
    SendPreview();
    Toast("Applied preset: " + Name);
  }

  function Validate() {
    var Result = Runtime.ValidateConfig(State.Config);
    State.Config = Result.Config;
    return Result;
  }

  function DownloadBlob(Data, Filename) {
    var A = document.createElement("a");
    A.href = URL.createObjectURL(Data);
    A.download = Filename;
    document.body.appendChild(A);
    A.click();
    setTimeout(function () { URL.revokeObjectURL(A.href); document.body.removeChild(A); }, 1000);
  }

  function DoExportJson() {
    Validate();
    BuildForms();
    Global.ProfileStore.portable(State.Config).then(function (config) { DownloadBlob(new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }), 'tabbed-config.json'); Toast('Config exported'); }).catch(function () { Toast('Could not export this configuration.'); });
  }

  function DoExportZip() {
    if (!Global.AboutuExport || !Global.AboutuZip) { Toast("Export module missing"); return; }
    Validate();
    BuildForms();
    if(BtnExportZip.disabled)return;
    BtnExportZip.disabled=true;
    Toast("Building site...");
    Global.AboutuExport.ExportSite(State.Config).then(function (Result) {
      var Archive = new Blob([Result.Bytes], { type: "application/zip" });
      DownloadBlob(Archive, "tabbed-site.zip");
      Toast("Exported " + Result.Files.length + " files");
    }).catch(function (Err) {
      Toast("Export failed");
      if (Global.console) console.error(Err);
    }).finally(function(){BtnExportZip.disabled=false;});
  }

  PresetSel.addEventListener("change", function () {
    if (PresetSel.value) ApplyPreset(PresetSel.value);
  });

  BtnReplay.addEventListener("click", function () {
    ChkNoentry.checked = false;
    var Url = BuildPreviewUrl();
    Preview.src = Url + (Url.indexOf("?") === -1 ? "?" : "&") + "_r=" + Date.now();
    Toast("Replaying entry");
  });

  BtnReset.addEventListener("click", function () {
    if (!Global.confirm("Reset the editor to the default configuration? This clears your draft.")) return;
    State.Config = Clone(Default);
    PresetSel.value = "";
    BuildForms();
    SaveDraft();
    SendPreview();
    Toast("Reset to defaults");
  });

  function BuildPreviewUrl() {
    var Qs = [];
    if (ChkNoentry.checked) Qs.push("noentry=1");
    if (ChkEmbed.checked) Qs.push("embed=1");
    return "../preview.html" + (Qs.length ? "?" + Qs.join("&") : "");
  }

  function UpdatePreviewSrc() { Preview.src = BuildPreviewUrl(); }
  ChkNoentry.addEventListener("change", UpdatePreviewSrc);
  ChkEmbed.addEventListener("change", UpdatePreviewSrc);

  Each(document.querySelectorAll(".seg-btn"), function (Key, Btn) {
    Btn.addEventListener("click", function () {
      Each(document.querySelectorAll(".seg-btn"), function (K, Other) { Other.classList.remove("active"); });
      Btn.classList.add("active");
      if (Btn.dataset.width === "mobile") {
        Preview.classList.add("mobile");
        Stage.classList.add("mobile");
      } else {
        Preview.classList.remove("mobile");
        Stage.classList.remove("mobile");
      }
    });
  });

  BtnSaveJson.addEventListener("click", DoExportJson);
  BtnLoadJson.addEventListener("click", function () { JsonFile.click(); });
  JsonFile.addEventListener("change", function () {
    var F = JsonFile.files[0];
    if (!F) return;
    var Reader = new FileReader();
    Reader.onload = async function (E) {
      try {
        State.Config = await Global.ProfileStore.prepare(Runtime.ValidateConfig(Global.CleanLegacyDraft(JSON.parse(E.target.result))).Config);
        PresetSel.value = "";
        BuildForms();
        SaveDraft();
        SendPreview();
        Toast("Imported " + F.name);
      } catch (Err) {
        Toast("Invalid JSON file");
      }
    };
    Reader.readAsText(F);
    JsonFile.value = "";
  });

  BtnExportZip.addEventListener("click", DoExportZip);

  Global.Editor = { State: State, Touch: Touch, Toast: Toast, BuildForms: BuildForms, SendPreview: SendPreview, Flush: FlushDraft,
    Clone: Clone, ApplyPreset: ApplyPreset, ExportJson: DoExportJson, ExportZip: DoExportZip, OpenModal: OpenModal,
    Text: TextControl, TextArea: TextAreaControl, Range: RangeControl, Color: ColorControl, Toggle: ToggleControl,
    Select: SelectControl, Url: UrlField, Field: Field, Array: ArrayEditor, Icons: IconPicker };
  Global.ProfileStore.load().then(function (Draft) {
    State.Config = Runtime.ValidateConfig(Draft || (Global.PROFILE_TEMPLATES && Global.PROFILE_TEMPLATES[0].config) || Global.PROFILE_CONFIG || Default).Config;
  }).catch(function () { LoadDraft(); }).then(function () {
    BuildForms();
    Preview.src = BuildPreviewUrl();
    SendPreview();
  });
})(window);
