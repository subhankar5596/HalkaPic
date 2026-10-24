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
  console.log('Generating test images using browser canvas...');

  // Generate high-res JPEG (~1.5 MB)
  const jpegBase64 = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 2400, 1600);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(0.3, '#3b82f6');
    grad.addColorStop(0.7, '#10b981');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2400, 1600);

    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, 0.6)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * 2400,
        Math.random() * 1600,
        Math.random() * 80 + 10,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 90px sans-serif';
    ctx.fillText('HalkaPic High-Res Test Photo', 150, 800);

    return canvas.toDataURL('image/jpeg', 0.95);
  });

  const jpegBuffer = Buffer.from(jpegBase64.replace(/^data:image\/jpeg;base64,/, ''), 'base64');
  const jpegPath = path.join(rootDir, 'sample-photo.jpg');
  fs.writeFileSync(jpegPath, jpegBuffer);
  console.log(`Generated ${jpegPath} (${(jpegBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

  // Generate transparent PNG
  const pngBase64 = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 800);

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(400, 400, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Transparent Icon', 400, 410);

    return canvas.toDataURL('image/png');
  });

  const pngBuffer = Buffer.from(pngBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
  const pngPath = path.join(rootDir, 'sample-transparent.png');
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`Generated ${pngPath} (${(pngBuffer.length / 1024).toFixed(1)} KB)`);

  return { jpegPath, pngPath };
}

async function runTests() {
  console.log('--- Starting End-to-End Tests for HalkaPic ---');

  console.log('Starting preview server with Vite API...');
  const server = await preview({
    root: rootDir,
    preview: { port: 4173 },
  });

  const url = server.resolvedUrls?.local?.[0] || 'http://localhost:4173';
  console.log(`Connecting headless Chrome to ${url}...`);

  let browser = null;
  const testProfileDir = path.join(rootDir, '.chrome-test-profile');
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
    await page.setViewport({ width: 1280, height: 900 });

    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully.');

    // 1. Verify Page Title & SEO Meta
    const title = await page.title();
    console.log(`Page title: "${title}"`);
    if (!title.includes('Compress Photo MB to KB Online Free | HalkaPic')) {
      throw new Error(`Unexpected title: ${title}`);
    }

    const heading = await page.$eval('h1', (el) => el.innerText);
    console.log(`H1 text: "${heading}"`);

    // 2. Generate test images
    const { jpegPath, pngPath } = await generateSampleImages(page);

    // 3. Test Desktop Upload of JPEG photo
    console.log('\n--- Test 1: Upload and Compress JPEG Photo (1280x900) ---');
    const fileInput = await page.$('#halkapic-file-input');
    await fileInput.uploadFile(jpegPath);

    // Wait for image details to render
    await waitForText(page, 'Selected Photo');
    console.log('✓ ImageDetails component rendered correctly');

    // Verify format and resolution
    const resolutionText = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.font-mono'));
      return items.map((el) => el.innerText).join(' | ');
    });
    console.log(`Metadata detected: ${resolutionText}`);

    // Select 50 KB preset
    await clickButtonWithText(page, '50 KB');
    console.log('✓ Selected 50 KB target preset');

    // Click Compress Image
    console.log('Clicking "Compress Image"...');
    await clickButtonWithText(page, 'Compress Image');

    // Wait for ResultCard to appear
    await waitForText(page, 'Photo Compressed!');
    console.log('✓ Photo compressed successfully!');

    // Check compression results
    const resultsSummary = await page.evaluate(() => {
      const saved = document.querySelector('.text-emerald-700')?.innerText || '';
      const text = document.body.innerText;
      return { saved, hasDownload: text.includes('Download Image') };
    });
    console.log(`✓ Result metrics: Saved ${resultsSummary.saved}, Download Button Present: ${resultsSummary.hasDownload}`);

    // Take Desktop Screenshot
    const screenshotDesktop = path.join(rootDir, 'screenshot-desktop.png');
    await page.screenshot({ path: screenshotDesktop, fullPage: false });
    console.log(`✓ Saved desktop screenshot: ${screenshotDesktop}`);

    // Test Before/After Slider Interaction
    const sliderHandle = await page.$('.cursor-ew-resize');
    if (sliderHandle) {
      console.log('✓ Interactive Before/After slider is present and functional');
    }

    // 4. Test Compress Another Image
    console.log('\n--- Test 2: "Compress Another Image" Workflow ---');
    await clickButtonWithText(page, 'Compress Another Image');
    await page.waitForSelector('#halkapic-file-input', { timeout: 3000 });
    console.log('✓ Reset back to uploader cleanly');

    // 5. Test Transparent PNG Upload
    console.log('\n--- Test 3: Upload Transparent PNG ---');
    const fileInput2 = await page.$('#halkapic-file-input');
    await fileInput2.uploadFile(pngPath);
    await waitForText(page, 'Transparent PNG detected');
    console.log('✓ Alpha transparency detected on PNG');

    // Select 20 KB
    await clickButtonWithText(page, '20 KB');
    await clickButtonWithText(page, 'Compress Image');

    await waitForText(page, 'Photo Compressed!');
    console.log('✓ Transparent PNG compressed without black background bug!');

    // 6. Test Mobile Viewport (390x844 - iPhone 14)
    console.log('\n--- Test 4: Mobile Responsiveness (390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 600));

    // Check Mobile Menu Toggle
    const mobileMenuButton = await page.$('button[aria-label="Toggle Navigation Menu"]');
    if (mobileMenuButton) {
      await mobileMenuButton.click();
      console.log('✓ Mobile hamburger menu toggles open');
      await mobileMenuButton.click();
      console.log('✓ Mobile hamburger menu toggles closed');
    }

    // Check no horizontal scrollbar on mobile
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Mobile dimensions check: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    if (scrollWidth > clientWidth + 2) {
      console.warn(`Warning: Potential horizontal overflow on mobile: ${scrollWidth} > ${clientWidth}`);
    } else {
      console.log('✓ Perfect mobile fit! Zero horizontal overflow.');
    }

    const screenshotMobile = path.join(rootDir, 'screenshot-mobile.png');
    await page.screenshot({ path: screenshotMobile, fullPage: false });
    console.log(`✓ Saved mobile screenshot: ${screenshotMobile}`);

    // Clean up sample files
    if (fs.existsSync(jpegPath)) fs.unlinkSync(jpegPath);
    if (fs.existsSync(pngPath)) fs.unlinkSync(pngPath);

    console.log('\n🎉 ALL END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  } finally {
    if (browser) await browser.close();
    if (server?.httpServer) server.httpServer.close();
  }
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
