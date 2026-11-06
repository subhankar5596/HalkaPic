import { Document, Paragraph, TextRun, Packer, HeadingLevel, AlignmentType, PageBreak } from 'docx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { renderAsync as renderDocxAsync } from 'docx-preview';
import { pdfjsLib } from './pdfWorker';

type DocxAlignment = (typeof AlignmentType)[keyof typeof AlignmentType];

export interface ConversionProgressCallback {
  (current: number, total: number, stepMessage: string): void;
}

export interface ConvertedDocumentResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  size: number;
  objectUrl: string;
}

/**
 * Helper to determine if a string is a bullet/numbered list marker
 */
function isListMarker(text: string): boolean {
  return /^[\u2022\u2023\u25E6\u2043\u2219\*\-]\s+/.test(text) || /^\d+[\.\)]\s+/.test(text);
}

/**
 * Helper to clean font name and detect style
 */
function parseFontStyle(fontName: string): { isBold: boolean; isItalic: boolean } {
  const lower = (fontName || '').toLowerCase();
  const isBold =
    lower.includes('bold') ||
    lower.includes('black') ||
    lower.includes('heavy') ||
    lower.includes('demi') ||
    /-b$|_b$/.test(lower);
  const isItalic =
    lower.includes('italic') ||
    lower.includes('oblique') ||
    /-i$|_i$/.test(lower);
  return { isBold, isItalic };
}

/**
 * CONVERT PDF TO WORD (.docx)
 * Extracts structured text, headings, paragraphs, and styles from PDF pages
 * and compiles a genuine Microsoft Word (.docx) document using Office Open XML.
 */
export async function convertPdfToDocx(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<ConvertedDocumentResult> {
  if (onProgress) onProgress(1, 10, 'Loading and verifying PDF document...');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  if (numPages === 0) {
    throw new Error('The uploaded PDF does not contain any readable pages.');
  }

  const docChildren: Paragraph[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const percent = Math.round(10 + (pageNum / numPages) * 70);
    if (onProgress) {
      onProgress(percent, 100, `Extracting text and structure from page ${pageNum} of ${numPages}...`);
    }

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent({ includeMarkedContent: true });

    // Filter valid text items
    const rawItems = (textContent.items || []) as Array<{
      str: string;
      transform: number[];
      width: number;
      height: number;
      fontName: string;
      hasEOL?: boolean;
    }>;

    const validItems = rawItems
      .filter((it) => it.str && it.str.trim().length > 0)
      .map((it) => {
        const x = it.transform[4];
        const y = it.transform[5];
        return { ...it, x, y };
      });

    if (validItems.length === 0) {
      // Empty page or scanned image page
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[Page ${pageNum} - Contains scanned image or non-selectable content]`,
              italics: true,
              color: '888888',
            }),
          ],
          spacing: { after: 200 },
        })
      );
    } else {
      // Calculate median font size on this page to detect body text vs headings
      const fontSizes = validItems.map((it) => it.height).filter((h) => h > 0);
      fontSizes.sort((a, b) => a - b);
      const medianFontSize = fontSizes[Math.floor(fontSizes.length / 2)] || 12;

      // Sort items top-to-bottom (higher y in PDF first), then left-to-right (smaller x first)
      validItems.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 3.5) return yDiff;
        return a.x - b.x;
      });

      // Group into lines based on vertical proximity
      const lines: Array<typeof validItems> = [];
      let currentLine: typeof validItems = [];
      let lastY: number | null = null;

      for (const item of validItems) {
        if (lastY === null || Math.abs(item.y - lastY) > 3.8) {
          if (currentLine.length > 0) lines.push(currentLine);
          currentLine = [item];
          lastY = item.y;
        } else {
          currentLine.push(item);
        }
      }
      if (currentLine.length > 0) lines.push(currentLine);

      // Group lines into paragraphs based on vertical spacing
      const paragraphs: Array<{
        items: typeof validItems;
        isHeading1: boolean;
        isHeading2: boolean;
        isHeading3: boolean;
        alignment: DocxAlignment;
      }> = [];

      let currentParagraphLines: typeof validItems = [];
      let prevLineY: number | null = null;
      let prevLineHeight = medianFontSize;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineY = line[0].y;
        const maxLineHeight = Math.max(...line.map((it) => it.height));

        const isNewParagraph =
          prevLineY !== null &&
          Math.abs(prevLineY - lineY) > prevLineHeight * 1.6;

        if (isNewParagraph && currentParagraphLines.length > 0) {
          const maxH = Math.max(...currentParagraphLines.map((it) => it.height));
          const lineStartX = currentParagraphLines[0]?.x || 0;
          const lineEndX = (currentParagraphLines[currentParagraphLines.length - 1]?.x || 0) +
            (currentParagraphLines[currentParagraphLines.length - 1]?.width || 0);

          // Detect alignment
          const leftMargin = lineStartX;
          const rightMargin = viewport.width - lineEndX;
          let alignment: DocxAlignment = AlignmentType.LEFT;
          if (Math.abs(leftMargin - rightMargin) < 35 && lineStartX > 40) {
            alignment = AlignmentType.CENTER;
          } else if (rightMargin < 40 && leftMargin > 100) {
            alignment = AlignmentType.RIGHT;
          }

          paragraphs.push({
            items: currentParagraphLines,
            isHeading1: maxH >= medianFontSize * 1.7 && maxH >= 18,
            isHeading2: maxH >= medianFontSize * 1.35 && maxH < medianFontSize * 1.7 && maxH >= 14,
            isHeading3: maxH >= medianFontSize * 1.15 && maxH < medianFontSize * 1.35,
            alignment,
          });

          currentParagraphLines = [];
        }

        currentParagraphLines.push(...line);
        prevLineY = lineY;
        prevLineHeight = maxLineHeight || medianFontSize;
      }

      if (currentParagraphLines.length > 0) {
        const maxH = Math.max(...currentParagraphLines.map((it) => it.height));
        paragraphs.push({
          items: currentParagraphLines,
          isHeading1: maxH >= medianFontSize * 1.7 && maxH >= 18,
          isHeading2: maxH >= medianFontSize * 1.35 && maxH < medianFontSize * 1.7 && maxH >= 14,
          isHeading3: maxH >= medianFontSize * 1.15 && maxH < medianFontSize * 1.35,
          alignment: AlignmentType.LEFT,
        });
      }

      // Convert paragraphs into docx Paragraphs
      for (const p of paragraphs) {
        const runs: TextRun[] = [];
        let prevItemX: number | null = null;
        let prevItemWidth = 0;

        for (const item of p.items) {
          const { isBold, isItalic } = parseFontStyle(item.fontName);
          const needsSpace =
            prevItemX !== null &&
            item.x - (prevItemX + prevItemWidth) > 3.0 &&
            !item.str.startsWith(' ');

          const textToInsert = (needsSpace ? ' ' : '') + item.str;
          // docx size is in half-points (e.g. 12pt font = size: 24)
          const fontSizeHalfPt = Math.max(16, Math.min(72, Math.round(item.height * 2)));

          runs.push(
            new TextRun({
              text: textToInsert,
              bold: isBold || p.isHeading1 || p.isHeading2,
              italics: isItalic,
              size: fontSizeHalfPt,
              font: 'Calibri',
            })
          );

          prevItemX = item.x;
          prevItemWidth = item.width;
        }

        docChildren.push(
          new Paragraph({
            children: runs,
            heading: p.isHeading1
              ? HeadingLevel.HEADING_1
              : p.isHeading2
              ? HeadingLevel.HEADING_2
              : p.isHeading3
              ? HeadingLevel.HEADING_3
              : undefined,
            alignment: p.alignment,
            spacing: {
              after: p.isHeading1 ? 180 : p.isHeading2 ? 140 : 100,
              line: 276, // 1.15 line spacing
            },
          })
        );
      }
    }

    // Add page break between pages (except last page)
    if (pageNum < numPages) {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  }

  if (onProgress) onProgress(85, 100, 'Compiling Microsoft Word (.docx) document...');

  const doc = new Document({
    creator: 'HalkaPic Document Converter',
    description: 'Converted from PDF by HalkaPic (100% Client-Side)',
    title: file.name.replace(/\.[^/.]+$/, ''),
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in dxa
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const docxBlob = await Packer.toBlob(doc);
  const outFilename = file.name.replace(/\.[^/.]+$/, '') + '.docx';

  if (onProgress) onProgress(100, 100, 'Conversion completed successfully!');

  return {
    blob: docxBlob,
    filename: outFilename,
    pageCount: numPages,
    size: docxBlob.size,
    objectUrl: URL.createObjectURL(docxBlob),
  };
}

/**
 * CONVERT WORD (.docx / .doc) TO PDF
 * Uses docx-preview to render full layout, typography, tables, and images to canvas,
 * and compiles a crisp, multi-page PDF document via jsPDF.
 */
export async function convertWordToPdf(
  file: File,
  renderContainer: HTMLElement,
  onProgress?: ConversionProgressCallback
): Promise<ConvertedDocumentResult> {
  const isDocx = file.name.toLowerCase().endsWith('.docx');
  const isDoc = file.name.toLowerCase().endsWith('.doc');

  if (!isDocx && !isDoc) {
    throw new Error('Please select a valid Word document (.docx or .doc).');
  }

  if (onProgress) onProgress(5, 100, 'Reading Word document...');

  const arrayBuffer = await file.arrayBuffer();

  if (isDocx) {
    // Modern Office Open XML .docx file
    if (onProgress) onProgress(20, 100, 'Parsing Word styles, tables & layout...');

    renderContainer.innerHTML = '';
    renderContainer.style.background = '#ffffff';

    await renderDocxAsync(arrayBuffer, renderContainer, undefined, {
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      renderHeaders: true,
      renderFooters: true,
    });

    if (onProgress) onProgress(45, 100, 'Analyzing rendered document pages...');

    // Wait for images and web fonts inside rendered container to paint
    await new Promise((resolve) => setTimeout(resolve, 350));

    // In docx-preview, pages are rendered as section.docx or .docx-wrapper > section
    let pageElements = Array.from(renderContainer.querySelectorAll<HTMLElement>('section.docx, .docx-wrapper > section, article.docx'));

    if (pageElements.length === 0) {
      // Fallback: use all direct child sections or the wrapper itself
      const wrapper = renderContainer.querySelector<HTMLElement>('.docx-wrapper') || renderContainer;
      pageElements = [wrapper];
    }

    const totalPages = pageElements.length;
    let pdfDoc: jsPDF | null = null;

    for (let i = 0; i < totalPages; i++) {
      const pageEl = pageElements[i];
      const percent = Math.round(45 + ((i + 1) / totalPages) * 45);
      if (onProgress) {
        onProgress(percent, 100, `Rendering PDF page ${i + 1} of ${totalPages}...`);
      }

      const canvas = await html2canvas(pageEl, {
        scale: 2.0, // High quality 2x resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          // Remove outer stylesheets that contain Tailwind v4 modern CSS color functions (lab, oklch)
          const links = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
          for (const link of links) {
            link.remove();
          }

          // Sanitize any remaining style tags
          const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
          for (const s of styleTags) {
            if (s.textContent && (s.textContent.includes('lab(') || s.textContent.includes('oklch('))) {
              s.textContent = s.textContent
                .replace(/lab\([^)]+\)/g, '#000000')
                .replace(/oklch\([^)]+\)/g, '#000000');
            }
          }

          if (clonedDoc.body) {
            clonedDoc.body.style.color = '#0f172a';
            clonedDoc.body.style.backgroundColor = '#ffffff';
          }
        },
      });

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const orientation = imgWidthPx > imgHeightPx ? 'landscape' : 'portrait';

      // Standard A4 dimensions in pt: 595.28 x 841.89
      const pageWidthPt = 595.28;
      const pageHeightPt = (imgHeightPx * pageWidthPt) / imgWidthPx;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i === 0) {
        pdfDoc = new jsPDF({
          orientation,
          unit: 'pt',
          format: [pageWidthPt, pageHeightPt],
        });
        pdfDoc.addImage(imgData, 'JPEG', 0, 0, pageWidthPt, pageHeightPt, undefined, 'FAST');
      } else if (pdfDoc) {
        pdfDoc.addPage([pageWidthPt, pageHeightPt], orientation);
        pdfDoc.addImage(imgData, 'JPEG', 0, 0, pageWidthPt, pageHeightPt, undefined, 'FAST');
      }
    }

    if (!pdfDoc) {
      throw new Error('Failed to generate PDF pages from Word document.');
    }

    if (onProgress) onProgress(95, 100, 'Finalizing PDF output...');

    const pdfBlob = pdfDoc.output('blob');
    const outFilename = file.name.replace(/\.[^/.]+$/, '') + '.pdf';

    if (onProgress) onProgress(100, 100, 'Word to PDF conversion complete!');

    return {
      blob: pdfBlob,
      filename: outFilename,
      pageCount: totalPages,
      size: pdfBlob.size,
      objectUrl: URL.createObjectURL(pdfBlob),
    };
  } else {
    // Legacy Word 97-2003 binary .doc file
    if (onProgress) onProgress(30, 100, 'Extracting text from legacy Word (.doc)...');

    // Extract ASCII / UTF-16 text chunks from binary stream
    const bytes = new Uint8Array(arrayBuffer);
    let extractedText = '';

    // Search for printable text runs in binary
    let currentAscii = '';
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
        currentAscii += String.fromCharCode(b);
      } else {
        if (currentAscii.trim().length > 3) {
          extractedText += currentAscii + '\n';
        }
        currentAscii = '';
      }
    }
    if (currentAscii.trim().length > 3) {
      extractedText += currentAscii + '\n';
    }

    if (!extractedText.trim()) {
      throw new Error('Could not extract readable text from legacy .doc file. Please re-save as modern .docx in Word.');
    }

    if (onProgress) onProgress(60, 100, 'Formatting PDF pages...');

    const pdfDoc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const lines = extractedText.split('\n').filter((l) => l.trim().length > 0);
    const margin = 50;
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const maxLineWidth = pageWidth - margin * 2;
    let cursorY = 60;
    let pageCount = 1;

    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(11);

    for (const rawLine of lines) {
      const wrapped = pdfDoc.splitTextToSize(rawLine.trim(), maxLineWidth);
      for (const subLine of wrapped) {
        if (cursorY + 16 > pageHeight - margin) {
          pdfDoc.addPage();
          pageCount++;
          cursorY = 60;
        }
        pdfDoc.text(subLine, margin, cursorY);
        cursorY += 16;
      }
      cursorY += 6; // paragraph spacing
    }

    if (onProgress) onProgress(95, 100, 'Finalizing PDF output...');

    const pdfBlob = pdfDoc.output('blob');
    const outFilename = file.name.replace(/\.[^/.]+$/, '') + '.pdf';

    if (onProgress) onProgress(100, 100, 'Word to PDF conversion complete!');

    return {
      blob: pdfBlob,
      filename: outFilename,
      pageCount,
      size: pdfBlob.size,
      objectUrl: URL.createObjectURL(pdfBlob),
    };
  }
}
