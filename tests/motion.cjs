const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');
const { createServer } = require('../tools/serve.cjs');

(async () => {
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  const errors = [];
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const id of ['tokyo', 'alpine', 'aurora', 'coast', 'sakura', 'forest']) {
      await page.goto(base + '/profile.html?template=' + id + '&noentry=1');
      await expect(page.locator('[data-profile-role=avatar]')).toHaveAttribute('src', 'assets/web/avatar.webp');
      await expect(page.locator('[data-profile-role=avatar]')).toBeVisible();
      await page.locator('img').evaluateAll(images=>images.forEach(image=>image.loading='eager'));
      await page.waitForFunction(() => [...document.images].filter(i => i.hasAttribute('src')).every(i => i.complete && i.naturalWidth > 0));
      const tilt = page.locator('[data-profile-tilt]').first();
      await expect(tilt).toHaveClass(/pf-tilt-enabled/);
      const box = await tilt.boundingBox();
      await page.mouse.move(box.x + box.width * .75, box.y + box.height * .4);
      await expect.poll(() => tilt.evaluate(el => el.style.transform)).toMatch(/rotateY\([1-9][\d.]*deg\).*translateZ\(2px\)/);
      await page.mouse.move(2, 2);
      await expect.poll(() => tilt.evaluate(el => el.style.transform)).toContain('rotateX(0deg) rotateY(0deg)');
    }
    console.log('PASS All six templates load their images and tilt on hover across Centered, Split, and Fullscreen');

    await page.goto(base + '/profile.html?template=aurora&noentry=1');
    await page.mouse.move(500,300);await page.mouse.wheel(0,150);await page.waitForTimeout(350);
    const offset=await page.locator('.ref-scroll').evaluate(el=>el.scrollTop);assert.ok(offset>0&&offset<1000,'Wheel movement animates towards the next section');
    await expect.poll(()=>page.locator('.ref-scroll').evaluate(el=>Math.round(el.scrollTop))).toBe(1000);
    const about = page.locator('[data-profile-section="1"]');
    const nav = page.locator('[data-profile-role=section-nav]');
    await nav.getByRole('button', { name: 'Profile', exact: true }).click();
    await expect.poll(()=>page.locator('.ref-scroll').evaluate(el=>Math.round(el.scrollTop))).toBe(0);
    await expect(about).toHaveAttribute('data-motion-state', 'hidden');
    await nav.getByRole('button', { name: 'About', exact: true }).click();
    await expect(about).toHaveAttribute('data-motion-state', 'entering');
    assert.ok(await about.evaluate(el => el.getAnimations({ subtree: true }).some(a => a.effect.getKeyframes().some(f => Number(f.opacity) === 0))), 'Reveal animates opacity');
    await expect(about).toHaveAttribute('data-motion-state', 'visible');
    await nav.getByRole('button', { name: 'Profile', exact: true }).click();
    await expect(about).toHaveAttribute('data-motion-state', 'hidden');
    await nav.getByRole('button', { name: 'About', exact: true }).click();
    await expect(about).toHaveAttribute('data-motion-state', 'entering');
    await expect(about).toHaveAttribute('data-motion-state', 'visible');
    console.log('PASS Northern Lights reveals its sections again when scrolling back and forward');

    await page.goto(base + '/profile.html?template=alpine&noentry=1');
    const tilt = page.locator('[data-profile-tilt]').first();
    await expect(tilt).toHaveClass(/pf-tilt-enabled/);
    const box = await tilt.boundingBox();
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .3);
    await expect.poll(() => tilt.evaluate(el => el.style.transform)).toMatch(/translateZ\(2px\)/);
    await page.mouse.move(2, 2);
    await expect.poll(() => tilt.evaluate(el => el.style.transform)).toContain('rotateX(0deg) rotateY(0deg)');
    await page.evaluate(()=>{var c=structuredClone(PROFILE_CONFIG);c.Effects.CursorTrail.Enabled=true;c.Effects.CursorTrail.Type='stars';window.PROFILE_CONFIG=c;ProfileRuntime.AutoMount();});
    await page.mouse.move(500, 300);
    await page.mouse.move(650, 400, { steps: 8 });
    await expect.poll(() => page.locator('.pf-canvas-trail').evaluate(canvas => {
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < data.length; i += 4) if (data[i]) return true;
      return false;
    })).toBe(true);
    console.log('PASS Alpine tilts its visible card and draws cursor trail particles');

    await page.goto(base + '/profile.html?template=forest&noentry=1');
    await expect(page.locator('.ref-stage')).toBeVisible();
    await page.evaluate(()=>{var c=structuredClone(PROFILE_CONFIG);c.Effects.CursorTrail.Enabled=true;c.Effects.CursorTrail.Type='cat';window.PROFILE_CONFIG=c;ProfileRuntime.AutoMount();});
    const cat = page.locator('.pf-cursor-cat'); await expect(cat).toHaveCount(1);
    const start = await cat.evaluate(el => el.style.left);
    await page.mouse.move(1100, 500);
    await expect.poll(() => cat.evaluate(el => el.style.left)).not.toBe(start);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(cat).toHaveCount(0);
    await expect(page.locator('.pf-tilt-enabled')).toHaveCount(0);
    await expect(page.locator('.pf-root')).toHaveClass(/pf-reduced-motion/);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(cat).toHaveCount(1);
    await expect(page.locator('[data-profile-tilt]').first()).toHaveClass(/pf-tilt-enabled/);
    await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(cat).toHaveCount(0);
    console.log('PASS Cat cursor follows the pointer and respects repeated reduced-motion changes');

    for (const id of ['coast', 'sakura', 'forest']) {
      await page.goto(base + '/profile.html?template=' + id + '&noentry=1');
      const sections = page.locator('[data-profile-section]:not([hidden])');
      for (let i = 0; i < await sections.count(); i++) {
        await sections.nth(i).scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.resolve(__dirname, '../.test-artifacts/' + id + '-section-' + i + '.png') });
      }
    }
    assert.deepEqual(errors, []);
    console.log('4 motion checks passed.');
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
