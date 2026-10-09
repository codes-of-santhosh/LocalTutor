import type { DocumentChunk } from '../types';

export interface ChunkOptions {
  wordsPerChunk?: number;
  wordOverlap?: number;
}

/**
 * Clean text from page tags and normalize spacing
 */
export function cleanDocumentText(text: string): string {
  return text
    .replace(/\[Page \d+\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function chunkText(
  text: string,
  docId: string,
  docName: string,
  options: ChunkOptions = {}
): DocumentChunk[] {
  const { wordsPerChunk = 250, wordOverlap = 40 } = options;

  // Split text by page headers or paragraphs
  const rawSections = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);

  const chunks: DocumentChunk[] = [];
  let currentWords: string[] = [];
  let currentPage = 1;
  let chunkCounter = 0;

  for (const section of rawSections) {
    // Check if section contains page marker
    const pageMatch = section.match(/\[Page (\d+)\]/i);
    if (pageMatch) {
      const parsedPage = parseInt(pageMatch[1], 10);
      if (!isNaN(parsedPage)) currentPage = parsedPage;
    }

    // Clean out [Page X] headers from content
    const cleaned = section.replace(/\[Page \d+\]/gi, '').trim();
    if (!cleaned) continue;

    const words = cleaned.split(/\s+/).filter(w => w.length > 0);

    if (currentWords.length + words.length <= wordsPerChunk) {
      currentWords.push(...words);
    } else {
      if (currentWords.length > 0) {
        const chunkContent = currentWords.join(' ');
        chunks.push({
          id: `${docId}-chunk-${chunkCounter}`,
          docId,
          docName,
          chunkIndex: chunkCounter,
          text: chunkContent,
          pageNumber: currentPage,
          tokenEstimate: Math.round(currentWords.length * 1.3)
        });
        chunkCounter++;

        const overlapCount = Math.min(wordOverlap, currentWords.length);
        const overlap = currentWords.slice(currentWords.length - overlapCount);
        currentWords = [...overlap, ...words];
      } else {
        for (let i = 0; i < words.length; i += (wordsPerChunk - wordOverlap)) {
          const slice = words.slice(i, i + wordsPerChunk);
          chunks.push({
            id: `${docId}-chunk-${chunkCounter}`,
            docId,
            docName,
            chunkIndex: chunkCounter,
            text: slice.join(' '),
            pageNumber: currentPage,
            tokenEstimate: Math.round(slice.length * 1.3)
          });
          chunkCounter++;
        }
        currentWords = [];
      }
    }
  }

  // Final flush
  if (currentWords.length > 0) {
    chunks.push({
      id: `${docId}-chunk-${chunkCounter}`,
      docId,
      docName,
      chunkIndex: chunkCounter,
      text: currentWords.join(' '),
      pageNumber: currentPage,
      tokenEstimate: Math.round(currentWords.length * 1.3)
    });
  }

  return chunks;
}
