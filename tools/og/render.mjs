// Renders tools/og/og.html → assets/brand/og.png (1200×630, rendered at 2×).
// Run from the site root with the site served over http (fonts are blocked from file://):
//   python3 -m http.server 3000 &  node tools/og/render.mjs http://localhost:3000
import { createRequire } from 'node:module';
const { chromium } = createRequire(process.cwd() + '/')('playwright');
const base = process.argv[2] || 'http://127.0.0.1:3000';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.goto(base.replace(/\/$/, '') + '/tools/og/og.html', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'assets/brand/og.png', type: 'png' });
await browser.close();
console.log('assets/brand/og.png');
