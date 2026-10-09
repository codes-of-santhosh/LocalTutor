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

/**
 * Robustly chunk document text by page segments or paragraphs,
 * guaranteeing that every page's text is captured and non-empty.
 */
export function chunkText(
  text: string,
  docId: string,
  docName: string,
  options: ChunkOptions = {}
): DocumentChunk[] {
  const { wordsPerChunk = 250, wordOverlap = 40 } = options;

  if (!text.trim()) return [];

  // Check if text has page markers like [Page X]
  const hasPageMarkers = /\[Page \d+\]/i.test(text);

  let pageBlocks: { pageNum: number; content: string }[] = [];

  if (hasPageMarkers) {
    // Split by page marker lookahead
    const rawBlocks = text.split(/(?=\[Page \d+\])/i);
    for (const b of rawBlocks) {
      const match = b.match(/^\[Page (\d+)\]/i);
      const pageNum = match ? parseInt(match[1], 10) : 1;
      const cleanContent = b.replace(/^\[Page \d+\]/i, '').trim();
      if (cleanContent.length > 0) {
        pageBlocks.push({ pageNum, content: cleanContent });
      }
    }
  }

  // If no page blocks were formed (e.g., txt or docx without [Page]), treat whole text as 1 block
  if (pageBlocks.length === 0) {
    pageBlocks = [{ pageNum: 1, content: text.trim() }];
  }

  const chunks: DocumentChunk[] = [];
  let chunkCounter = 0;

  for (const block of pageBlocks) {
    const paragraphs = block.content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    let currentWords: string[] = [];

    for (const para of paragraphs) {
      const words = para.split(/\s+/).filter(w => w.length > 0);

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
            pageNumber: block.pageNum,
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
              pageNumber: block.pageNum,
              tokenEstimate: Math.round(slice.length * 1.3)
            });
            chunkCounter++;
          }
          currentWords = [];
        }
      }
    }

    // Flush any leftover words in this page block
    if (currentWords.length > 0) {
      chunks.push({
        id: `${docId}-chunk-${chunkCounter}`,
        docId,
        docName,
        chunkIndex: chunkCounter,
        text: currentWords.join(' '),
        pageNumber: block.pageNum,
        tokenEstimate: Math.round(currentWords.length * 1.3)
      });
      chunkCounter++;
    }
  }

  // Fallback safety: if still 0 chunks but text was not empty, create at least 1 chunk
  if (chunks.length === 0 && text.trim().length > 0) {
    const fallbackClean = cleanDocumentText(text);
    if (fallbackClean.length > 0) {
      chunks.push({
        id: `${docId}-chunk-0`,
        docId,
        docName,
        chunkIndex: 0,
        text: fallbackClean.slice(0, 1500),
        pageNumber: 1,
        tokenEstimate: 250
      });
    }
  }

  return chunks;
}
