const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { chromium, expect } = require('@playwright/test');
const { createServer } = require('../tools/serve.cjs');
const { Crc32, DataUrlToBytes } = require('../editor/zip.js');

const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, '.test-artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const run = fs.mkdtempSync(path.join(artifacts, 'dashboard-'));
const errors = [];
let passed = 0;
function pass(name) { console.log('PASS ' + name); passed++; }

// Independently inspect the ZIP headers and CRCs before serving the real files.
function extract(archive, destination) {
  const bytes = fs.readFileSync(archive);
  const names = [];
  let offset = 0;
  while (bytes.readUInt32LE(offset) === 0x04034b50) {
    const method = bytes.readUInt16LE(offset + 8);
    const length = bytes.readUInt32LE(offset + 18);
    const nameLength = bytes.readUInt16LE(offset + 26);
    const extraLength = bytes.readUInt16LE(offset + 28);
    const name = bytes.toString('utf8', offset + 30, offset + 30 + nameLength);
    const start = offset + 30 + nameLength + extraLength;
    const compressed = bytes.subarray(start, start + length);
    assert.ok(method === 0 || method === 8, 'Unsupported ZIP compression');
    const data = method === 8 ? zlib.inflateRawSync(compressed) : compressed;
    assert.equal(data.length, bytes.readUInt32LE(offset + 22), name + ' size');
    assert.equal(Crc32(data), bytes.readUInt32LE(offset + 14), name + ' CRC');
    const target = path.resolve(destination, name);
    assert.ok(target.startsWith(destination + path.sep), 'Archive path stays inside test output');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
    names.push(name);
    offset = start + length;
  }
  assert.equal(bytes.readUInt32LE(offset), 0x02014b50, 'ZIP central directory');
  return names;
}

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    context.on('page', p => {
      p.on('pageerror', e => errors.push(e.message));
      p.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const active = () => page.locator('.dashboard-page:not([hidden])');
    const frame = () => page.frameLocator('#preview-frame');
    async function ready() { await expect(page.locator('.asset-visual').first()).toBeAttached(); }
    async function nav(name) {
      if (await page.locator('#btn-menu').isVisible()) await page.locator('#btn-menu').click();
      await page.getByRole('navigation', { name: 'Dashboard' }).getByRole('button', { name, exact: true }).click();
    }
    async function preview() {
      await page.getByRole('button', { name: 'Preview', exact: true }).click();
      await expect(frame().locator('[data-profile-role=card]')).toBeVisible();
    }
    async function closePreview() { await page.getByRole('button', { name: 'Close preview' }).click(); }
    async function fullTemplate(name) {
      await nav('Templates');
      await page.getByRole('button', { name: 'Use ' + name, exact: true }).click();
      await page.getByRole('button', { name: 'Apply selected', exact: true }).click();
      await expect(page.locator('#page-name')).toHaveText('Customize');
    }
    async function noOverflow(p, label) {
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + ' fits viewport');
      assert.ok(await p.evaluate(() => [...document.querySelectorAll('.pf-stage')].every(el => el.scrollWidth <= el.clientWidth + 1)), label + ' profile contents fit');
    }

    await page.goto(base + '/');
    await expect(page).toHaveURL(/\/editor\//);
    await ready();
    await expect(page.locator('.dashboard-page')).toHaveCount(7);
    await expect(frame().locator('.pf-root')).toHaveCount(0);
    await page.screenshot({ path: path.join(artifacts, 'dashboard-desktop.png'), fullPage: true });
    await nav('Assets');
    await expect(active().getByLabel('Volume', { exact: true })).toHaveValue('0.35');
    await nav('Customize');
    await page.locator('#card-layout .card-head').click();
    await expect(active().getByLabel('Max width', { exact: true })).toHaveValue('640');
    pass('Dashboard routing, sections, and initial slider values');

    await active().getByLabel('Description', { exact: true }).fill('A profile built here.');
    await active().getByLabel('Location', { exact: true }).fill('London');
    await active().getByLabel('Profile Opacity', { exact: true }).fill('0.65');
    await active().getByLabel('Icon Color value', { exact: true }).fill('#50d9c3');
    await expect(page.locator('#save-status')).toHaveText('Saved locally');
    await page.reload(); await ready();
    await expect(active().getByLabel('Location', { exact: true })).toHaveValue('London');
    await expect(active().getByLabel('Profile Opacity', { exact: true })).toHaveValue('0.65');
    await preview();
    await expect(frame().locator('[data-profile-role=bio]')).toHaveText('A profile built here.');
    await expect(frame().locator('[data-profile-role=location]')).toContainText('London');
    await expect(frame().locator('.pf-root')).not.toHaveClass(/pf-embed/);
    assert.equal(await page.evaluate(()=>Editor.State.Config.Theme.IconColor),'#50d9c3');
    const previewFrame = page.frames().find(f => f.url().includes('/preview.html'));
    assert.match(await previewFrame.locator('[data-profile-role=card]').evaluate(el => getComputedStyle(el).backgroundColor), /0\.65/);
    await page.getByLabel('Embed', { exact: true }).check();
    await expect(frame().locator('.pf-root')).toHaveClass(/pf-embed/);
    await page.getByRole('button', { name: 'Replay entry' }).click();
    await expect(frame().locator('.pf-entry')).toBeVisible();
    await frame().locator('.pf-entry').click();
    await expect(frame().locator('.pf-entry')).toBeHidden();
    await page.getByLabel('Skip entry', { exact: true }).check();
    await page.getByRole('button', { name: 'Mobile', exact: true }).click();
    await expect(page.locator('#preview-frame')).toHaveCSS('width', '390px');
    await closePreview();
    await expect(frame().locator('.pf-root')).toHaveCount(0);
    await active().getByLabel('Location', { exact: true }).fill('Bristol');
    await expect(page.locator('#save-status')).toHaveText('Saved locally');
    await expect(frame().locator('.pf-root')).toHaveCount(0);
    await active().getByLabel('Profile Gradient', { exact: true }).check();
    await nav('Effects');
    await active().getByLabel('Opacity slider', { exact: true }).check();
    await preview();
    await frame().getByLabel('Card opacity', { exact: true }).fill('0');
    const gradient = await frame().locator('[data-profile-role=card]').evaluate(el => getComputedStyle(el).backgroundImage);
    assert.notEqual(gradient, 'none', 'Gradient remains valid CSS');
    assert.ok((gradient.match(/\/ 0\)/g) || []).length >= 2, 'Visitor opacity fades both gradient colors');
    await closePreview();
    await nav('Customize');
    pass('Persistent edits, preview colors/opacity, embed, entry replay, and paused preview');

    const avatar = active().locator('.asset-tile').filter({ has: page.getByRole('heading', { name: 'Profile Avatar', exact: true }) });
    await avatar.locator('input[type=file]').setInputFiles(path.join(root, 'assets/web/avatar.webp'));
    await expect(avatar.locator('.asset-visual')).toHaveAttribute('data-value', /^blob:/);
    await expect(page.locator('#save-status')).toHaveText('Saved locally');
    await page.reload(); await ready();
    await expect(avatar.locator('.asset-visual')).toHaveAttribute('data-value', /^blob:/);
    const popupPromise = page.waitForEvent('popup');
    await page.locator('#my-page').click();
    const popup = await popupPromise;
    await expect(popup.locator('[data-profile-role=location]')).toContainText('Bristol');
    await expect(popup.locator('[data-profile-role=avatar]')).toHaveAttribute('src', /^blob:/);
    await popup.close();
    pass('Uploaded assets survive reload and My Page receives the saved draft');

    await nav('Account');
    await active().getByLabel('Display name', { exact: true }).fill('Kelvin');
    const jsonPromise = page.waitForEvent('download');
    await active().getByRole('button', { name: 'Export JSON', exact: true }).click();
    const jsonDownload = await jsonPromise;
    const jsonPath = path.join(run, 'config.json');
    await jsonDownload.saveAs(jsonPath);
    assert.equal(JSON.parse(fs.readFileSync(jsonPath, 'utf8')).Profile.DisplayName, 'Kelvin');
    await nav('Templates');
    await page.getByRole('button', { name: 'Use Alpine', exact: true }).click();
    await page.getByRole('button', { name: 'Apply selected', exact: true }).click();
    assert.equal(await page.evaluate(() => Editor.State.Config.Profile.DisplayName), 'Kelvin');
    assert.equal(await page.evaluate(() => Editor.State.Config.Layout.Preset), 'modern');
    await page.locator('#json-file').setInputFiles(jsonPath);
    await expect(page.locator('#toast')).toContainText('Imported');
    assert.equal(await page.evaluate(() => Editor.State.Config.Layout.Preset), 'guns');
    pass('JSON export/import and applying template style while preserving identity');

    await page.locator('#btn-search').click();
    await page.getByRole('searchbox', { name: 'Search features' }).fill('Timezone');
    await page.getByRole('button', { name: 'Timezone · Widgets' }).first().click();
    await expect(page.locator('#page-name')).toHaveText('Widgets');
    await active().getByLabel('Show Local Time', { exact: true }).check();
    await active().getByLabel('Show Local Time', { exact: true }).focus();
    await page.keyboard.press('Space');
    await expect(active().getByLabel('Show Local Time', { exact: true })).not.toBeChecked();
    await page.keyboard.press('Space');
    await expect(active().getByLabel('Show Local Time', { exact: true })).toBeChecked();
    await active().getByLabel('Timezone', { exact: true }).selectOption('Asia/Tokyo');
    await preview();
    await expect(frame().locator('.pf-clock-time')).toHaveText(/\d{2}:\d{2}:\d{2}/);
    await expect(frame().locator('.pf-clock-date')).toContainText('Tokyo');
    await closePreview();
    pass('Feature search and configured timezone widget');

    await nav('Links');
    await active().getByRole('button', { name: /Add link$/ }).click();
    const modal = page.locator('.modal-backdrop[open]');
    for (const [label, prefix] of [['Bandcamp', 'https://bandcamp.com/'], ['Spotify', 'https://open.spotify.com/user/'], ['YouTube', 'https://youtube.com/@'], ['Bandcamp', 'https://bandcamp.com/']]) {
      await modal.getByRole('button', { name: label, exact: true }).click();
      await expect(modal.locator('.service-url-prefix')).toHaveText(prefix);
      await expect(modal.getByLabel('Profile path', { exact: true })).toHaveValue('');
      await modal.getByLabel('Profile path', { exact: true }).fill('example-profile');
    }
    await expect(modal.locator('.service-url-prefix input')).toHaveCount(0);
    await modal.getByRole('button', { name: 'Add link', exact: true }).click();
    let linkItem = active().locator('#card-links .array-item').last();
    await linkItem.getByRole('button', { name: 'GitHub', exact: true }).click();
    await expect(linkItem.locator('.service-url-prefix')).toHaveText('https://github.com/');
    await linkItem.getByRole('button', { name: 'Bandcamp', exact: true }).click();
    await linkItem.getByLabel('Profile path', { exact: true }).fill('my-music');
    assert.equal(await page.evaluate(() => Editor.State.Config.Social.Links.at(-1).Url), 'https://bandcamp.com/my-music');
    const invalidLinks = await page.evaluate(() => {
      const bad = ['https://evil.test/', '//evil.test/', '\\evil.test', 'https://bandcamp.com.evil.test/', 'https://bandcamp.com@evil.test/'];
      return ProfileServices.List.filter(s => s.slug !== 'mail').flatMap(service => bad.map(value => {
        const url = ProfileRuntime.ValidateConfig({ Social: { Links: [{ Service: service.slug, Icon: service.slug, Url: value }] } }).Config.Social.Links[0].Url;
        return { base: service.url, url };
      }));
    });
    for (const { base, url } of invalidLinks) { assert.ok(url.startsWith(base)); assert.equal(new URL(url).origin, new URL(base).origin); }
    pass('Repeated service changes, locked URL prefixes, and import/export URL enforcement');

    await nav('Links');
    await page.locator('#card-badges .card-head').click();
    await page.getByRole('button', { name: /Add badge$/ }).click();
    await modal.getByRole('button', { name: 'Premium', exact: true }).click();
    await expect(modal.getByLabel('Label', { exact: true })).toHaveValue('Premium');
    await modal.getByRole('button', { name: 'Verified', exact: true }).click();
    await expect(modal.getByLabel('Label', { exact: true })).toHaveValue('Verified');
    await expect(modal.locator('.icon-picker-custom input[type=text]')).toHaveValue('verified');
    assert.ok(await modal.locator('.icon-pick').count() > 100, 'Full icon collection is selectable');
    await modal.getByRole('button', { name: 'Add badge', exact: true }).click();
    const badgeItem = page.locator('#card-badges .array-item').last();
    await badgeItem.getByRole('button', { name: 'Heart', exact: true }).click();
    await expect(badgeItem.getByLabel('Label', { exact: true })).toHaveValue('Heart');
    pass('Badge switching updates the label and custom-icon field every time');
    await nav('Customize');

    await expect(active().getByRole('button', { name: 'Remove Custom Cursor', exact: true })).toBeDisabled();
    await preview();
    await expect(frame().locator('.pf-root')).not.toHaveClass(/pf-custom-cursor/);
    await closePreview();
    const cursorBytes = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 512; const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 512, 512); return c.toDataURL().split(',')[1]; });
    const cursorTile = active().locator('.asset-tile').filter({ has: page.getByRole('heading', { name: 'Custom Cursor', exact: true }) });
    await cursorTile.locator('input[type=file]').setInputFiles({ name: 'large-cursor.png', mimeType: 'image/png', buffer: Buffer.from(cursorBytes, 'base64') });
    await expect(page.locator('#save-status')).toHaveText('Saved locally');
    await preview();
    await expect(frame().locator('.pf-root')).toHaveAttribute('data-cursor-ready', 'true');
    const cursorSize = await frame().locator('.pf-root').evaluate(async el => { const value = el.style.getPropertyValue('--pf-cursor'); const url = JSON.parse(value.slice(4, value.indexOf(')'))); const img = new Image(); img.src = url; await img.decode(); return [img.naturalWidth, img.naturalHeight]; });
    assert.deepEqual(cursorSize, [64, 64]);
    await closePreview();
    pass('Adding a cursor after an empty render and scaling oversized cursor uploads');

    await fullTemplate('Northern Lights');
    await page.evaluate(()=>{var C=Editor.State.Config;C.Music.Enabled=true;C.Music.Tracks=[{Title:'First',Src:'',Cover:'',Lyrics:'[00:00.00]First line'},{Title:'Second',Src:'',Cover:'',Lyrics:''}];Editor.BuildForms();});
    await nav('Assets');
    const playlist=page.locator('#card-playlist');
    await expect(playlist.locator('.array-item')).toHaveCount(2);
    const wav=Buffer.alloc(16044);wav.write('RIFF');wav.writeUInt32LE(16036,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);
    const audioTile=active().locator('.asset-tile').filter({has:page.getByRole('heading',{name:'Audio',exact:true})});
    await audioTile.locator('input[type=file]').setInputFiles({name:'sample.wav',mimeType:'audio/wav',buffer:wav});
    await expect(playlist.getByLabel('Track title',{exact:true}).first()).toHaveValue('sample');
    assert.ok(await page.evaluate(()=>Editor.State.Config.Music.Tracks[0].Src.startsWith('blob:')));
    assert.equal(await page.evaluate(()=>Editor.State.Config.Music.Tracks[0].Lyrics),'');
    await active().getByLabel('Selected track',{exact:true}).selectOption('1');
    await active().getByLabel('Selected track',{exact:true}).selectOption('0');
    assert.equal(await page.evaluate(()=>Editor.State.Config.Music.Title),'sample');
    pass('Uploaded audio and playlist edits persist across track changes');

    for (const [name, layout, display] of [['Tokyo Nights','guns','Kelvin'],['Alpine','modern','Kelvin'],['Northern Lights','portfolio','Kelvin'],['Coastline','guns','Kelvin'],['Wildflower','modern','Kelvin'],['Evergreen','portfolio','Kelvin']]) {
      await fullTemplate(name);
      const downloadPromise = page.waitForEvent('download', { timeout: 120000 });
      await page.locator('#btn-export-zip').click();
      const download = await downloadPromise;
      const archive = path.join(run, name + '.zip');
      await download.saveAs(archive);
      const directory = path.join(run, name);
      const names = extract(archive, directory);
      for (const file of ['index.html', 'css/style.css', 'css/layouts.css', 'js/profile.js', 'js/config.js']) assert.ok(names.includes(file), file);
      assert.ok(names.filter(n => n.startsWith('assets/')).length >= 3, 'Local template media bundled');
      assert.equal(fs.readFileSync(path.join(directory, 'css/layouts.css'), 'utf8'), fs.readFileSync(path.join(root, 'css/layouts.css'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'css/reference-bindings.css'), 'utf8'));
      const exported = await context.newPage();
      const exportPath = path.relative(root, directory).split(path.sep).join('/');
      await exported.goto(base + '/' + exportPath + '/index.html?noentry=1');
      await expect(exported.locator('.ref-stage[data-layout=' + layout + ']')).toBeVisible();
      await expect(exported.locator('.pf-name-text')).toHaveText(display);
      await exported.waitForFunction(() => [...document.images].filter(img => img.hasAttribute('src')).every(img => img.complete && img.naturalWidth > 0));
      assert.deepEqual(await exported.evaluate(()=>Object.keys(PROFILE_REFERENCE_DATA)),[layout]);
      assert.doesNotMatch(fs.readFileSync(path.join(directory,'js/profile.js'),'utf8'),/r2\.guns\.lol|jinxware00|Cisek|yotme/);
      if(name==='Northern Lights'){
        await expect(exported.locator('[data-profile-role=clock-time]')).toHaveText(/\d{2}:\d{2}:\d{2}/);
        await exported.clock.setFixedTime(new Date('2026-10-27T19:42:18Z'));
        await expect(exported.locator('[data-profile-role=clock-time]')).toHaveText('04:42:18');
      }
      await noOverflow(exported, name + ' desktop');
      await exported.screenshot({ path: path.join(artifacts, name.toLowerCase() + '-desktop.png'), fullPage: true });

      await exported.setViewportSize({ width: 390, height: 844 });
      await noOverflow(exported, name + ' mobile');
      await exported.screenshot({ path: path.join(artifacts, name.toLowerCase() + '-mobile.png'), fullPage: true });

      await exported.close();
      pass(name + ' ZIP integrity, bundled assets, and desktop/mobile rendering');
    }

    await page.setViewportSize({ width: 390, height: 844 });
    for (const name of ['Account', 'Customize', 'Links', 'Effects', 'Widgets', 'Assets', 'Templates']) {
      await nav(name); await noOverflow(page, 'Mobile ' + name);
      await expect(page.locator('#btn-menu')).toHaveAttribute('aria-expanded', 'false');
    }
    await nav('Customize');
    await page.screenshot({ path: path.join(artifacts, 'dashboard-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 320, height: 640 });
    await noOverflow(page, '320px dashboard');
    pass('All dashboard sections and navigation fit mobile screens');

    const text = '<svg xmlns="http://www.w3.org/2000/svg"><text>★ 東京</text></svg>';
    assert.equal(Buffer.from(DataUrlToBytes('data:image/svg+xml,' + encodeURIComponent(text))).toString('utf8'), text);
    pass('Unicode SVG data URLs preserve their bytes during export');
    assert.deepEqual(errors, [], 'No page errors or HTTP errors');
    console.log(`\n${passed} checks passed. Screenshots: ${artifacts}`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
