import * as pdfjsLib from 'pdfjs-dist';

// Configure local worker to guarantee offline & cross-origin isolation compatibility
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export interface PdfParseResult {
  text: string;
  pageCount: number;
}

export async function parsePdf(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PdfParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true
  });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    if (onProgress && pageNum % 5 === 0) {
      onProgress(pageNum, pageCount);
    }
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter((s: string) => s.trim().length > 0);

    const pageText = strings.join(' ').trim();
    if (pageText.length > 0) {
      fullText += `\n\n[Page ${pageNum}]\n` + pageText;
    }
  }

  return {
    text: fullText.trim(),
    pageCount
  };
}
