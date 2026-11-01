# Exporting and deploying

The editor's **Export site** button builds a complete standalone website and
downloads it as `tabbed-site.zip`. It runs entirely in the browser — there is
no server, build step, or external service involved.

## What's in the ZIP

```
index.html            the page shell (mounts the runtime with js/config.js)
MEDIA-CREDITS.json     stock and selected-media attribution
css/style.css         profile styles
css/layouts.css       template layouts, effects, and widgets
js/config.js          your configuration
js/profile.js         the runtime
js/icons.js           the built-in icon set
README.md             a short deploy note, generated for you
.nojekyll             tells GitHub Pages not to run Jekyll
assets/               uploaded files and bundled local template media
```

Every path is **relative**, so the site works from a domain root *or* a
sub-directory (for example a GitHub Pages project path) without changes.

## Uploaded assets

When you upload an image, video, audio, or font in the editor, it is stored as a
Blob in IndexedDB. On export, the generator walks the config, writes each one into
`assets/`, and rewrites the config to point at the relative path. Files you
reference by URL are left as-is.

The generator also bundles same-origin relative assets already in the config
(for example the demo's `assets/web/avatar.webp` and its badge SVGs) by fetching them
and writing them into `assets/`.

## Deploying

### GitHub Pages

1. Create a repository and upload the unzipped files, keeping the folder
   structure.
2. **Settings → Pages → Source: Deploy from a branch**, pick your branch and
   `/ (root)`.
3. Your profile is live at `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so filenames starting with `_` are served correctly.

### Any static host

Drop the folder on Netlify, Cloudflare Pages, Vercel, or any web server. No
configuration is required.

### Locally

```sh
python -m http.server
# open http://localhost:8000/
```

Opening `index.html` directly via `file://` works for most setups, but a local
server is recommended so video/audio and fonts load reliably.

## Editing an exported site

All content is in `js/config.js`. You can edit it by hand, or re-open the
dashboard, choose **Account → Import JSON**, and load a backup made with
**Export JSON**, then export again. The importer accepts JSON, not the
JavaScript assignment in `js/config.js`.

If you change the source `css/style.css`, `css/layouts.css`, `js/profile.js`, `js/icons.js`, or
`preview.html` in the repo, regenerate the bundle the editor bakes into its
export:

```sh
node tools/build-sources.js
```

Without that step, exports still use the previously bundled copy.

## Theming

Edit the `Theme`, `Background`, and `Effects` sections of `js/config.js`. The
stylesheet reads everything through `--pf-*` custom properties set by the
runtime, so no CSS edits are needed for normal theming.

## Privacy

Remote media URLs remain external and are requested when the profile loads.
Google Fonts are requested only when a Google font is selected in `Theme.Font`.
There is no analytics service or cookie tracking. The dashboard stores its draft
and uploads in IndexedDB on the dashboard's origin. View counts use the visitor's
local browser storage; they are not a shared visitor counter.
