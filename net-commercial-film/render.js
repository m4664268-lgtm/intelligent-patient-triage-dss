// usage: node render.js preview out_dir t1,t2,...   |  node render.js range out.mp4 startFrame endFrame
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const FILM = 'file://' + path.join(__dirname, "film", "index.html");
(async () => {
  const [mode, out, a, b] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: mode === 'preview' ? 1 : 2 });
  page.on('console', m => { if (m.type() === 'error') console.error('PAGE', m.text()); });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto(FILM);
  await page.evaluate(() => window.ready);
  if (mode === 'preview') {
    for (const t of a.split(',').map(Number)) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: `${out}/f_${String(t).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 80 });
    }
  } else {
    const s = +a, e = +b;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '24', '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '24', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = s; f < e; f++) {
      await page.evaluate(t => window.seek(t), f / 24);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - s) % 48 === 0) console.log(`${path.basename(out)} frame ${f}/${e} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
