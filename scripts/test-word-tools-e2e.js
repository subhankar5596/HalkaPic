import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const downloadDir = path.join(rootDir, 'test-downloads');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function createTestAssets() {
  console.log('[Setup] Creating test assets...');
  await ensureDir(downloadDir);

  // 1. Create a 2-page sample PDF
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  page1.drawText('HalkaPic Engineering Report', {
    x: 50,
    y: 780,
    size: 22,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.5),
  });
  page1.drawText('This document tests the client-side PDF to Word conversion engine.', {
    x: 50,
    y: 740,
    size: 12,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });
  page1.drawText('Section 1: Architecture & Zero Server Footprint', {
    x: 50,
    y: 700,
    size: 15,
    font: boldFont,
    color: rgb(0.15, 0.15, 0.15),
  });
  page1.drawText('All PDF parsing and Word document generation runs locally inside the browser memory sandbox.', {
    x: 50,
    y: 675,
    size: 11,
    font: font,
    color: rgb(0.25, 0.25, 0.25),
  });

  // Page 2
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawText('Section 2: Verification Checklist', {
    x: 50,
    y: 780,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.5),
  });
  page2.drawText('1. Drag and drop file handling works smoothly.', {
    x: 50,
    y: 740,
    size: 12,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });
  page2.drawText('2. Downloaded DOCX opens cleanly in Microsoft Word.', {
    x: 50,
    y: 715,
    size: 12,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  const pdfBytes = await pdfDoc.save();
  const samplePdfPath = path.join(rootDir, 'test-sample-input.pdf');
  fs.writeFileSync(samplePdfPath, pdfBytes);
  console.log(`[Setup] Created sample PDF: ${samplePdfPath} (${pdfBytes.length} bytes)`);

  // 2. Create a sample DOCX using docx
  const docxDoc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'HalkaPic Word to PDF Conversion Test',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'This is a sample Microsoft Word document designed to verify high-fidelity Word to PDF rendering.',
                bold: false,
                size: 24, // 12pt
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Features verified: bold typography, table borders, and multi-element alignment.',
                bold: true,
                color: '2563EB',
                size: 24,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Feature' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Status' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Word Parsing' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Active & Verified' })] }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const docxBuffer = await Packer.toBuffer(docxDoc);
  const sampleDocxPath = path.join(rootDir, 'test-sample-input.docx');
  fs.writeFileSync(sampleDocxPath, docxBuffer);
  console.log(`[Setup] Created sample DOCX: ${sampleDocxPath} (${docxBuffer.length} bytes)`);

  return { samplePdfPath, sampleDocxPath };
}

let samplePdfPath = '';
let sampleDocxPath = '';
let testProfileDir = '';

async function run() {
  const assets = await createTestAssets();
  samplePdfPath = assets.samplePdfPath;
  sampleDocxPath = assets.sampleDocxPath;

  console.log('[Server] Starting Vite preview server...');
  const server = await preview({
    root: rootDir,
    preview: { port: 4180, host: '127.0.0.1' },
  });
  const port = server.httpServer.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Server] Preview server listening at ${baseUrl}`);

  testProfileDir = path.join(rootDir, `.chrome-word-test-profile-${Date.now()}`);
  if (!fs.existsSync(testProfileDir)) {
    fs.mkdirSync(testProfileDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
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
      '--disable-web-security',
    ],
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('BROWSER PAGE ERROR:', err.message));
    await page.setViewport({ width: 1280, height: 900 });

    // Enable download tracking via CDP
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
    });

    // -------------------------------------------------------------
    // TEST 1: PDF to Word Converter Page (/pdf-to-word)
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: PDF to Word Converter (/pdf-to-word) ---');
    await page.goto(`${baseUrl}/pdf-to-word`, { waitUntil: 'networkidle0' });

    // Verify title and heading
    const title1 = await page.title();
    console.log(`Page title: "${title1}"`);
    if (!title1.toLowerCase().includes('pdf to word')) {
      throw new Error(`Unexpected page title for /pdf-to-word: ${title1}`);
    }

    const h1Text1 = await page.$eval('h1', (el) => el.innerText);
    console.log(`H1 text: "${h1Text1}"`);

    // Verify file input exists
    const fileInput1 = await page.waitForSelector('input[type="file"]', { timeout: 5000 });
    console.log('Found file input. Uploading sample PDF...');
    await fileInput1.uploadFile(samplePdfPath);

    // Wait for file details card to display
    await page.waitForFunction(
      () => document.body.innerText.includes('test-sample-input.pdf'),
      { timeout: 7000 }
    );
    console.log('✓ File details shown: test-sample-input.pdf displayed');

    // Click "Convert to Word (.docx)"
    const convertBtn1 = await page.waitForFunction(
      () => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find((b) => b.innerText && b.innerText.includes('Convert to Word'));
      },
      { timeout: 5000 }
    );
    console.log('Clicking "Convert to Word (.docx)" button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.innerText && b.innerText.includes('Convert to Word'));
      btn.click();
    });

    // Wait for conversion completion
    console.log('Waiting for conversion to complete...');
    await page.waitForFunction(
      () => document.body.innerText.includes('Conversion Complete') || document.body.innerText.includes('Download Word'),
      { timeout: 20000 }
    );
    console.log('✓ Conversion completed successfully!');

    // Click download button
    console.log('Clicking Download Word (.docx)...');
    await page.waitForSelector('#download-pdf-word-btn', { timeout: 5000 });
    await page.click('#download-pdf-word-btn');

    // Check for downloaded .docx in downloadDir
    let downloadedDocx = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const files = fs.readdirSync(downloadDir).filter((f) => f.endsWith('.docx'));
      if (files.length > 0) {
        downloadedDocx = path.join(downloadDir, files[0]);
        break;
      }
    }
    if (!downloadedDocx) {
      throw new Error('Downloaded DOCX file not found in download directory.');
    }
    const docxStats = fs.statSync(downloadedDocx);
    console.log(`✓ Downloaded DOCX verified: ${downloadedDocx} (${docxStats.size} bytes)`);

    // Verify DOCX internal structure (valid zip containing word/document.xml)
    const docxZip = await JSZip.loadAsync(fs.readFileSync(downloadedDocx));
    const hasDocXml = docxZip.file('word/document.xml') !== null;
    console.log(`✓ Valid Office Open XML verified (word/document.xml present: ${hasDocXml})`);
    if (!hasDocXml) {
      throw new Error('Downloaded DOCX is missing word/document.xml');
    }

    // -------------------------------------------------------------
    // TEST 2: Word to PDF Converter Page (/word-to-pdf)
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Word to PDF Converter (/word-to-pdf) ---');
    await page.goto(`${baseUrl}/word-to-pdf`, { waitUntil: 'networkidle0' });

    // Re-assert download permission on newly navigated document
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
    });

    const title2 = await page.title();
    console.log(`Page title: "${title2}"`);
    if (!title2.toLowerCase().includes('word to pdf')) {
      throw new Error(`Unexpected page title for /word-to-pdf: ${title2}`);
    }

    const h1Text2 = await page.$eval('h1', (el) => el.innerText);
    console.log(`H1 text: "${h1Text2}"`);

    // Upload sample DOCX
    const fileInput2 = await page.waitForSelector('input[type="file"]', { timeout: 5000 });
    console.log('Uploading sample DOCX...');
    await fileInput2.uploadFile(sampleDocxPath);

    // Wait for file details card
    await page.waitForFunction(
      () => document.body.innerText.includes('test-sample-input.docx'),
      { timeout: 7000 }
    );
    console.log('✓ File details shown: test-sample-input.docx displayed');

    // Click "Convert to PDF"
    console.log('Clicking "Convert to PDF" button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.innerText && b.innerText.includes('Convert to PDF'));
      btn.click();
    });

    // Wait for conversion completion or error
    console.log('Waiting for Word-to-PDF conversion to complete...');
    let conversionSucceeded = false;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const hasDownloadBtn = await page.$('#download-word-pdf-btn');
      if (hasDownloadBtn) {
        conversionSucceeded = true;
        break;
      }
      const errorText = await page.evaluate(() => {
        const alert = document.querySelector('[role="alert"]');
        return alert ? alert.innerText : null;
      });
      if (errorText) {
        throw new Error(`Word to PDF conversion failed with error in UI: ${errorText}`);
      }
      const progress = await page.evaluate(() => {
        const el = document.querySelector('.text-blue-600.font-bold');
        return el ? el.innerText : null;
      });
      if (progress && i % 4 === 0) {
        console.log(`Conversion progress: "${progress}"`);
      }
    }

    if (!conversionSucceeded) {
      const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 500));
      throw new Error(`Conversion timed out. Page text:\n${bodySnippet}`);
    }
    console.log('✓ Word to PDF conversion completed successfully!');

    // Re-assert download permission right before clicking download
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
    });

    // Click download button
    console.log('Clicking Download PDF...');
    await page.click('#download-word-pdf-btn');

    // Check for downloaded .pdf in downloadDir
    let downloadedPdf = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const files = fs.readdirSync(downloadDir).filter((f) => f.endsWith('.pdf'));
      if (files.length > 0) {
        downloadedPdf = path.join(downloadDir, files[0]);
        break;
      }
    }
    if (!downloadedPdf) {
      throw new Error('Downloaded PDF file not found in download directory.');
    }
    const pdfStats = fs.statSync(downloadedPdf);
    console.log(`✓ Downloaded PDF verified: ${downloadedPdf} (${pdfStats.size} bytes)`);

    const pdfBuffer = fs.readFileSync(downloadedPdf);
    const pdfHeader = pdfBuffer.slice(0, 5).toString('ascii');
    console.log(`✓ Valid PDF header verified: "${pdfHeader}"`);
    if (pdfHeader !== '%PDF-') {
      throw new Error(`Invalid PDF header: ${pdfHeader}`);
    }

    // -------------------------------------------------------------
    // TEST 3: Navigation, Header Dropdown & Tools Directory Links
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Navigation & Tools Directory Verification ---');
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Check Tools Directory has both tools
    const pageText = await page.evaluate(() => document.body.innerText);
    if (!pageText.includes('PDF to Word Converter')) {
      throw new Error('Homepage Tools Directory missing "PDF to Word Converter"');
    }
    if (!pageText.includes('Word to PDF Converter')) {
      throw new Error('Homepage Tools Directory missing "Word to PDF Converter"');
    }
    console.log('✓ Tools directory contains both new tools.');

    // -------------------------------------------------------------
    // TEST 4: Mobile Responsive Viewport (390x844)
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Mobile Responsive Viewport (390x844) ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/pdf-to-word`, { waitUntil: 'networkidle0' });

    // Verify mobile hamburger menu opens and has new tools
    const hamburgerBtn = await page.waitForSelector('button[aria-label="Toggle Navigation Menu"]');
    await hamburgerBtn.click();
    await page.waitForFunction(
      () => document.body.innerText.includes('PDF to Word Converter'),
      { timeout: 5000 }
    );
    console.log('✓ Mobile hamburger menu successfully opens and displays new tools');

    console.log('\n========================================');
    console.log('ALL E2E CONVERSION & UI TESTS PASSED!');
    console.log('========================================\n');
  } finally {
    await browser.close();
    server.httpServer.close();

    // Clean up temporary files
    try {
      if (fs.existsSync(samplePdfPath)) fs.unlinkSync(samplePdfPath);
      if (fs.existsSync(sampleDocxPath)) fs.unlinkSync(sampleDocxPath);
      if (fs.existsSync(downloadDir)) fs.rmSync(downloadDir, { recursive: true, force: true });
      if (fs.existsSync(testProfileDir)) fs.rmSync(testProfileDir, { recursive: true, force: true });
    } catch (e) {
      // ignore cleanup errors
    }
  }
}

run().catch((err) => {
  console.error('\nE2E TEST FAILURE:', err);
  process.exit(1);
});
