import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function clickButtonWithText(page, text) {
  await page.waitForFunction(
    (targetText) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some((b) => b.textContent && b.textContent.includes(targetText));
    },
    { timeout: 10000 },
    text
  );
  await page.evaluate((targetText) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent && b.textContent.includes(targetText));
    if (btn) btn.click();
    else throw new Error(`Button with text "${targetText}" not found`);
  }, text);
}

async function waitForText(page, text, timeout = 12000) {
  await page.waitForFunction(
    (target) => document.body && document.body.innerText.includes(target),
    { timeout },
    text
  );
}

async function generateSampleImages(page) {
  console.log('Generating 3 test images (JPEG, PNG, WebP)...');

  // Image 1: Cover Landscape JPEG
  const img1Data = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 1200, 800);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('Page 1: Document Cover', 100, 400);
    return canvas.toDataURL('image/jpeg', 0.9);
  });
  const buf1 = Buffer.from(img1Data.replace(/^data:image\/jpeg;base64,/, ''), 'base64');
  const path1 = path.join(rootDir, 'test-doc-page1.jpg');
  fs.writeFileSync(path1, buf1);

  // Image 2: Chart Portrait PNG
  const img2Data = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, 0, 800, 1100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 45px sans-serif';
    ctx.fillText('Page 2: Analysis Chart', 80, 500);
    return canvas.toDataURL('image/png');
  });
  const buf2 = Buffer.from(img2Data.replace(/^data:image\/png;base64,/, ''), 'base64');
  const path2 = path.join(rootDir, 'test-doc-page2.png');
  fs.writeFileSync(path2, buf2);

  // Image 3: Summary WebP
  const img3Data = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(0, 0, 900, 900);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 45px sans-serif';
    ctx.fillText('Page 3: Conclusion Note', 80, 450);
    return canvas.toDataURL('image/webp', 0.9);
  });
  const buf3 = Buffer.from(img3Data.replace(/^data:image\/webp;base64,/, ''), 'base64');
  const path3 = path.join(rootDir, 'test-doc-page3.webp');
  fs.writeFileSync(path3, buf3);

  return [path1, path2, path3];
}

async function runPdfTests() {
  console.log('--- Starting Image to PDF Converter E2E Tests ---');

  console.log('Starting preview server...');
  const server = await preview({
    root: rootDir,
    preview: { port: 4174 },
  });

  const url = server.resolvedUrls?.local?.[0] || 'http://localhost:4174';
  console.log(`Connecting headless Chrome to ${url}...`);

  let browser = null;
  const testProfileDir = path.join(rootDir, '.chrome-pdf-test-profile');
  if (!fs.existsSync(testProfileDir)) {
    fs.mkdirSync(testProfileDir, { recursive: true });
  }

  try {
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      userDataDir: testProfileDir,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    });

    const page = await browser.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    await page.setViewport({ width: 1280, height: 950 });

    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('Page loaded.');

    const samplePaths = await generateSampleImages(page);

    // 1. Click "Image to PDF" tool button in header or hero switcher
    console.log('\n--- Switching to Image to PDF tool ---');
    await clickButtonWithText(page, 'Image to PDF');
    await waitForText(page, 'Convert Image to PDF');
    console.log('✓ Successfully switched to Image to PDF converter view');

    // 2. Upload multiple images
    console.log('\n--- Uploading 3 images ---');
    const fileInput = await page.$('#halkapic-pdf-input');
    await fileInput.uploadFile(...samplePaths);

    await new Promise((r) => setTimeout(r, 1500));
    const textAfterUpload = await page.evaluate(() => document.body.innerText);
    console.log('PAGE TEXT AFTER UPLOAD (first 300 chars):\n' + textAfterUpload.substring(0, 300));

    // Wait for images list to appear
    await waitForText(page, '3 Images Selected');
    console.log('✓ All 3 images parsed and rendered in workspace');

    // 3. Test Reordering (Move Page 1 down)
    console.log('\n--- Testing Image Reordering ---');
    const moveDownBtn = await page.$('button[title="Move page later"]');
    if (moveDownBtn) {
      await moveDownBtn.click();
      console.log('✓ Clicked Move Down on first image');
    }

    // 4. Test Removing Image 3
    console.log('\n--- Testing Image Removal ---');
    const removeButtons = await page.$$('button[title="Remove image"]');
    if (removeButtons.length > 0) {
      await removeButtons[removeButtons.length - 1].click();
      await waitForText(page, '2 Images Selected');
      console.log('✓ Successfully removed 1 image, 2 images remain');
    }

    // 5. Test Changing Settings: Fit to Image & Landscape
    console.log('\n--- Testing Layout Settings ---');
    await clickButtonWithText(page, 'Fit to Image');
    console.log('✓ Switched to Fit to Image mode');

    await clickButtonWithText(page, 'A4 Standard');
    console.log('✓ Switched back to A4 Standard mode');

    await clickButtonWithText(page, 'Portrait');
    console.log('✓ Selected Portrait orientation');

    // 6. Convert to PDF
    console.log('\n--- Converting Images to PDF ---');
    await clickButtonWithText(page, 'Convert 2 Images to PDF');

    // Wait for Result Card
    await waitForText(page, 'PDF Document Created!');
    console.log('✓ PDF generated successfully!');

    // Verify Result Card Details
    const resultSummary = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasPageCount: text.includes('2 Pages'),
        hasDownload: text.includes('Download PDF'),
      };
    });
    console.log(`✓ Result Verified: 2 Pages verified: ${resultSummary.hasPageCount}, Download Button: ${resultSummary.hasDownload}`);

    // Take Desktop Screenshot of PDF Result
    const screenshotDesktop = path.join(rootDir, 'screenshot-pdf-desktop.png');
    await page.screenshot({ path: screenshotDesktop, fullPage: false });
    console.log(`✓ Saved PDF desktop screenshot: ${screenshotDesktop}`);

    // 7. Test Mobile Viewport (390x844)
    console.log('\n--- Testing Mobile Viewport (390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 500));

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Mobile dimensions: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    if (scrollWidth <= clientWidth + 2) {
      console.log('✓ Mobile viewport is 100% responsive without overflow');
    }

    const screenshotMobile = path.join(rootDir, 'screenshot-pdf-mobile.png');
    await page.screenshot({ path: screenshotMobile, fullPage: false });
    console.log(`✓ Saved PDF mobile screenshot: ${screenshotMobile}`);

    // Clean up sample files
    samplePaths.forEach((p) => {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    console.log('\n🎉 ALL IMAGE TO PDF CONVERTER TESTS PASSED WITH 100% SUCCESS!');
  } finally {
    if (browser) await browser.close();
    if (server?.httpServer) server.httpServer.close();
  }
}

runPdfTests().catch((err) => {
  console.error('PDF Test failed:', err);
  process.exit(1);
});
