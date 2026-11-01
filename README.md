# Tabbed

<div align="center">

### Your profile. Your style. Your space.

A local-first profile builder for creating, customising and exporting personal websites. Three layouts, six wallpaper templates, extensive customisation and standalone website exports.

[![License](https://img.shields.io/badge/license-PolyForm%20Shield%201.0.0-8b7cf6?style=flat-square)](LICENSE)
[![Self Hosted](https://img.shields.io/badge/self--hosted-yes-64748b?style=flat-square)](#run)
[![No API Key](https://img.shields.io/badge/API%20key-not%20required-64748b?style=flat-square)](#customize)
[![Static Export](https://img.shields.io/badge/export-static%20ZIP-64748b?style=flat-square)](#export)

[Features](#features) · [Run](#run) · [Customize](#customize) · [Export](#export) · [Development](#development)

</div>

---

## Overview

Tabbed is a local profile builder with three layouts:

| Centered | Split | Fullscreen |
|:---:|:---:|:---:|
| Example 1 | Example 2 | Example 3 |

All three layouts support 3D hover tilt, enabled by default across all six wallpaper templates:

- Tokyo Nights
- Alpine
- Northern Lights
- Coastline
- Wildflower
- Evergreen

Each template includes a welcome screen, starter description, decorative badges, service links and animated sections.

Templates use independent stock media with no captured users' content. Previews use your display name (or username) and avatar.

## Features

**Profile layouts**

- Three independently loaded layouts.
- Desktop and mobile support.
- 3D hover tilt.
- Smooth section navigation.
- Staggered animation reveals.
- Scrollable long-form content.
- Reduced-motion support.

**Customisation**

- Identity and avatar controls.
- Themes, wallpapers and styling.
- Custom links, badges and icons.
- Cursor images and animated effects.
- Widgets for presence, community, clock, quotes, about and projects.
- Optional background music and timed LRC lyrics.

**Templates**

The template gallery keeps thumbnails simple. Starter descriptions and badges appear in the full preview.

The **Use template** checklist lets you choose which parts to replace:

- Wallpaper
- Styling
- Layout
- Entry screen
- Effects
- Description
- Badges
- Links
- Widgets
- Music

Only selected parts are replaced. Your name and avatar stay yours.

**Media library**

Assets supports uploads, direct URLs and search through Wikimedia Commons.

- Wallpapers, GIFs, live wallpapers and audio.
- No API key required.
- Creator, licence and source information.
- Full media loads on preview or selection.
- Selected search files are downloaded into local storage.

Default templates contain no music.

## Run

**Requirements:** Node.js and npm.

```sh
git clone https://github.com/jinxware00/tabbed.git
cd tabbed
npm install
npm run dev
```

Open:

```text
http://localhost:8766/editor/
```

On Windows PowerShell, use `npm.cmd` when needed.

Keep the same hostname and port to access your saved draft.

## Storage

Drafts and uploaded files are saved in IndexedDB.

- Files use Blob storage instead of copying base64 media during routine edits.
- Older drafts are migrated to remove known demonstration content while preserving edited fields.
- Closing preview stops playback and effects.
- Background video and ambient effects pause in hidden tabs.

## Export

**Export site** downloads a standalone ZIP ready for any static host.

The export includes:

- Your selected layout.
- Local assets and uploaded media.
- Media credits.
- Required runtime files.

Direct remote URLs remain external.

For a portable editing backup, use **Account → Export JSON**. Uploaded media is included, and the JSON can be imported later to continue editing.

See [Export documentation](docs/EXPORT.md).

## Dashboard

The dashboard is local.

- Community and presence details are entered manually.
- Profile views are counted in each visitor's browser.

## Development

Install dependencies:

```sh
npm install
```

Build and test:

```sh
npm run build
npm test
```

Build writes a small export loader. Runtime sources and the selected layout are fetched only during export.

Profile layouts load individually, with at most two cached. ZIP assets are deduplicated and compressed sequentially.

If needed, install the browser:

```sh
npx playwright install chromium
```

### Tests

Tests cover:

- All six website exports.
- Three desktop/mobile layouts.
- Selective template copying.
- Entry screens and identity.
- Persistence and URL prefixes.
- Badge placement.
- Cursor, tilt and section animations.
- Wheel momentum and touch navigation.
- Mocked media search.

Test artifacts are generated under `.test-artifacts/`.

### Reference assets

Layout structure and styles are retained from the supplied saved pages, with new local behaviour and content-free bindings.

To regenerate layouts from the sibling `Guns_Lol_Examples` folder:

```sh
node tools/build-layouts.cjs
```

Fetch stock media:

```sh
node tools/fetch-stock-media.cjs
```

Generate the matching video thumbnail:

```sh
node tools/make-ocean-poster.cjs
```

## Project structure

| Path | Description |
|---|---|
| `js/themes.js` | Template settings and identity binding |
| `js/templates/` | Content-free layout skeletons |
| `js/layout-loader.js` | On-demand layout loading |
| `js/profile.js` | Profile behaviour |
| `js/reference.js` | Layout bindings |
| `js/sections.js` | Shared widgets and section navigation |
| `js/media-store.js` | Drafts and uploaded files |
| `editor/media-search.js` | Commons search and media selection |
| `editor/export.js` | Standalone website exports |
| `editor/zip.js` | ZIP generation |
| `assets/web/credits.json` | Stock media sources and licences |

## Documentation

- [Configuration](docs/CONFIG.md)
- [Export](docs/EXPORT.md)
- [Third-party credits](THIRD_PARTY.md)
- [Licence](LICENSE)

---

<div align="center">

**Tabbed**

Built by [Jinxware00](https://github.com/jinxware00)

[GitHub Repository](https://github.com/jinxware00/tabbed)

</div>
