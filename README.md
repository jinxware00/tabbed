# Tabbed

A local profile builder with three layouts: **Centered** (Example 1), **Split** (Example 2), and **Fullscreen** (Example 3). All three support 3D hover tilt, enabled by default in all six wallpaper templates: Tokyo Nights, Alpine, Northern Lights, Coastline, Wildflower, and Evergreen. Each includes a welcome screen, starter description, decorative badges, service links, and animated sections. The Templates gallery keeps the thumbnails simple; the starter bio and badges appear in the full preview. Templates use independent stock media with no captured users' content. Previews use your display name (or username) and avatar.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:8766/editor/. On Windows PowerShell, use `npm.cmd` when needed. Keep the same hostname and port to access your saved draft.

## Customize

Account controls your identity. Customize covers appearance; Links contains both links and badges, the complete icon collection, and locked service prefixes. Effects includes cursor images, shooting stars, the following cat, tilt, and entry effects. Widgets includes presence, community, clock, quote, about, and project sections. All three layouts support these sections. A wheel gesture, swipe, Page Down, or navigation dot moves smoothly to the next section with staggered reveals. Long content remains scrollable within its section. Reduced-motion preferences disable animation.

**Use template** opens a checklist for wallpaper, styling, layout, entry screen, effects, description, badges, links, widgets, and music. Only selected parts are replaced; your name and avatar stay yours. Starter links point to service homepages until you add your profile paths. The asset boxes contain upload, URL, search, and remove icons with tooltips and keyboard labels.

Assets supports uploaded files, direct URLs, and **Search** for wallpapers, GIFs, live wallpapers, and audio through Wikimedia Commons. No API key is required. Search results show creator, license, and source; full media loads only on preview or selection. Selected search files are downloaded into local storage. Default templates contain no music. Add your own audio and optionally a playlist with timed LRC lyrics.

Drafts and files are saved in IndexedDB. Files use Blob storage, so routine edits do not copy base64 media. Older drafts are migrated to remove known demonstration content while preserving edited fields. Closing preview stops playback and effects. Background video and ambient effects pause in hidden tabs.

## Export

**Export site** downloads a standalone ZIP for any static host. It bundles your selected layout, local assets, and media credits. Direct remote URLs remain external. **Account ? Export JSON** creates a portable backup with uploaded media included. Import that JSON to continue editing. See [docs/EXPORT.md](docs/EXPORT.md).

The dashboard is local: community and presence details are entered manually. Profile views are counted in each visitor's browser.

## Development

```sh
npm run build
npm test
```

Build writes a small export loader; runtime sources and the selected layout are fetched only during export. Profile layouts load individually, with at most two cached. ZIP assets are deduplicated and compressed sequentially. If needed, install the browser with `npx playwright install chromium`.

Tests cover all six website exports, the three desktop/mobile layouts, selective template copying, entry screens, identity, persistence, URL prefixes, badge placement, cursor/tilt/section animation, wheel momentum, touch navigation, and mocked media search. Test artifacts are generated under `.test-artifacts/`.

Layout structure and styles are retained from the supplied saved pages, with new local behavior and content-free bindings. To regenerate those files from the sibling `Guns_Lol_Examples` folder, run `node tools/build-layouts.cjs`. Stock media can be fetched with `node tools/fetch-stock-media.cjs`, then `node tools/make-ocean-poster.cjs` generates the matching video thumbnail.

## Main files

- `js/themes.js`: template settings and identity binding.
- `js/templates/`: content-free layout skeletons; the first three are active and older layouts remain archived.
- `js/layout-loader.js`: on-demand layout loading.
- `js/profile.js` and `js/reference.js`: profile behavior and layout bindings.
- `js/sections.js`: shared widget pages and animated section navigation.
- `js/media-store.js`: drafts and uploaded files.
- `editor/media-search.js`: Commons search and media selection.
- `editor/export.js` and `editor/zip.js`: standalone exports.
- `assets/web/credits.json`: stock media sources and licenses.

Project code is MIT; see [LICENSE](LICENSE) and [THIRD_PARTY.md](THIRD_PARTY.md). Configuration documentation is in [docs/CONFIG.md](docs/CONFIG.md).
