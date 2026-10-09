import type { DocumentChunk, QuizQuestion, Flashcard } from '../types';

interface ConceptFact {
  subject: string;
  predicate: string;
  originalSentence: string;
  sourceDoc: string;
  page?: number;
}

/**
 * Clean unwanted artifacts like page tags, brackets, and extra spaces
 */
function cleanSentence(s: string): string {
  return s
    .replace(/\[Page \d+\]/gi, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract sentences with rich educational statements
 */
function extractFactSentences(chunks: DocumentChunk[]): ConceptFact[] {
  const facts: ConceptFact[] = [];
  const definitionRegexes = [
    /\b(?:is|are|refers to|represents|serves as|functions as|defined as|consists of|enables|provides)\b/i
  ];

  for (const chunk of chunks) {
    const rawSentences = chunk.text
      .split(/(?<=[.?!])\s+/)
      .map(cleanSentence)
      .filter(s => s.length >= 35 && s.length <= 260);

    for (const raw of rawSentences) {
      // Skip headings, table fragments, or sentences without letters
      if (!/[a-zA-Z]/.test(raw) || raw.split(' ').length < 6) continue;
      if (raw.toLowerCase().startsWith('page ') || raw.toLowerCase().startsWith('chapter ')) continue;

      for (const regex of definitionRegexes) {
        const match = raw.match(regex);
        if (match && match.index && match.index > 3) {
          const subject = raw.slice(0, match.index).trim();
          const predicate = raw.slice(match.index).trim();
          if (subject.length > 2 && subject.split(' ').length <= 6 && predicate.length > 10) {
            facts.push({
              subject,
              predicate,
              originalSentence: raw,
              sourceDoc: chunk.docName,
              page: chunk.pageNumber
            });
            break;
          }
        }
      }
    }
  }

  return facts;
}

/**
 * Generate accurate, document-grounded quizzes directly from document text chunks
 */
export function generateQuizzesFromChunks(chunks: DocumentChunk[], count: number = 4): QuizQuestion[] {
  if (chunks.length === 0) return [];

  const quizzes: QuizQuestion[] = [];
  const facts = extractFactSentences(chunks);

  // Pool of subjects from the user's document to create realistic distractors
  const documentSubjects = Array.from(new Set(facts.map(f => f.subject))).filter(s => s.length > 3);

  // 1. Generate definition & mechanism questions from extracted facts
  for (let i = 0; i < facts.length && quizzes.length < count; i++) {
    const fact = facts[i];
    const correctSubject = fact.subject;

    // Pick 3 distractors from the same document if possible, or contextually plausible variations
    const distractors: string[] = [];
    const otherSubjects = documentSubjects.filter(s => s.toLowerCase() !== correctSubject.toLowerCase());

    while (distractors.length < 3 && otherSubjects.length > 0) {
      const randomIdx = Math.floor(Math.random() * otherSubjects.length);
      const candidate = otherSubjects.splice(randomIdx, 1)[0];
      if (!distractors.includes(candidate)) {
        distractors.push(candidate);
      }
    }

    // Fallback plausible distractors if document didn't have enough distinct entities
    const fallbackTerms = [
      'The outer peripheral interface',
      'The secondary transport protocol',
      'The inactive standby subsystem',
      'The legacy static framework'
    ];
    let fbIdx = 0;
    while (distractors.length < 3) {
      distractors.push(fallbackTerms[fbIdx++] || `Alternative mechanism ${distractors.length + 1}`);
    }

    const options = [correctSubject, ...distractors];
    // Shuffle options
    const shuffled = options
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item) => item.value);

    const correctIndex = shuffled.indexOf(correctSubject);

    quizzes.push({
      id: `quiz-doc-${i}-${Date.now()}`,
      docId: chunks[0]?.docId || 'default',
      docName: fact.sourceDoc,
      question: `According to your document${fact.page ? ` (Page ${fact.page})` : ''}, what ${fact.predicate.charAt(0).toLowerCase() + fact.predicate.slice(1)}?`,
      options: shuffled,
      correctIndex,
      explanation: `As stated in ${fact.sourceDoc}${fact.page ? ` (p.${fact.page})` : ''}: "${fact.originalSentence}"`,
      socraticHint: `Look for the key component described as: "${fact.predicate.slice(0, 90)}..." in your notes.`
    });
  }

  // 2. If facts were sparse, generate direct comprehension questions from full chunks
  if (quizzes.length < count) {
    for (let cIdx = 0; cIdx < chunks.length && quizzes.length < count; cIdx++) {
      const chunk = chunks[cIdx];
      const cleanText = cleanSentence(chunk.text);
      const sentences = cleanText.split(/(?<=[.?!])\s+/).filter(s => s.length > 25);
      if (sentences.length < 2) continue;

      const targetSentence = sentences[Math.min(1, sentences.length - 1)];
      const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';

      quizzes.push({
        id: `quiz-comp-${chunk.id}-${cIdx}`,
        docId: chunk.docId,
        docName: chunk.docName,
        question: `Based on the excerpt from "${chunk.docName}"${pageInfo}, which statement accurately reflects the material?`,
        options: [
          targetSentence,
          `The text refutes this, claiming the opposite regarding ${chunk.docName.replace(/\.[^/.]+$/, '')}.`,
          `The excerpt specifies that this process occurs without any active components or inputs.`,
          `This concept has been superseded and is marked deprecated in modern implementations.`
        ],
        correctIndex: 0,
        explanation: `Verified directly in ${chunk.docName}${pageInfo}: "${targetSentence}"`,
        socraticHint: `Re-read excerpt #${chunk.chunkIndex + 1} from ${chunk.docName} to verify the explicit finding.`
      });
    }
  }

  return quizzes;
}

/**
 * Generate accurate, document-derived active recall flashcards
 */
export function generateFlashcardsFromChunks(chunks: DocumentChunk[]): Flashcard[] {
  if (chunks.length === 0) return [];

  const cards: Flashcard[] = [];
  const facts = extractFactSentences(chunks);

  for (let i = 0; i < facts.length && cards.length < 8; i++) {
    const fact = facts[i];
    cards.push({
      id: `fc-doc-${i}-${Date.now()}`,
      docId: chunks[0]?.docId || 'default',
      front: `What ${fact.predicate.charAt(0).toLowerCase() + fact.predicate.slice(1)}?`,
      back: `${fact.subject}.\n\nSource context: "${fact.originalSentence}"`,
      sourceRef: `${fact.sourceDoc}${fact.page ? `, p. ${fact.page}` : ''}`
    });
  }

  // Fallback if document text format didn't produce enough statement pairs
  if (cards.length < 3) {
    chunks.slice(0, 4).forEach((chunk, idx) => {
      const clean = cleanSentence(chunk.text);
      const sentences = clean.split(/(?<=[.?!])\s+/).filter(Boolean);
      if (sentences.length >= 1) {
        cards.push({
          id: `fc-fallback-${idx}`,
          docId: chunk.docId,
          front: `Key Takeaway from Excerpt #${chunk.chunkIndex + 1}:`,
          back: sentences.slice(0, 2).join(' '),
          sourceRef: `${chunk.docName}${chunk.pageNumber ? `, p. ${chunk.pageNumber}` : ''}`
        });
      }
    });
  }

  return cards;
}

/**
 * Generate document-grounded suggested questions for the chat desk
 */
export function generateSuggestedQuestions(chunks: DocumentChunk[]): string[] {
  if (chunks.length === 0) {
    return [
      'What are the core foundational topics covered in this document?',
      'Can you summarize the major principles in simple terms?',
      'What are the key technical terms and their definitions?',
      'Can you test my understanding with a conceptual problem?'
    ];
  }

  const facts = extractFactSentences(chunks);
  const questions: string[] = [];

  for (const fact of facts) {
    if (questions.length >= 4) break;
    const q = `How does ${fact.subject} work, and why is it important in ${fact.sourceDoc.replace(/\.[^/.]+$/, '')}?`;
    if (!questions.includes(q)) questions.push(q);
  }

  // Fallback questions using document name and chunk keywords
  while (questions.length < 4) {
    const docName = chunks[0]?.docName.replace(/\.[^/.]+$/, '') || 'your notes';
    const fallbacks = [
      `Summarize the key architectural concepts in ${docName}.`,
      `Explain the most important mechanism detailed in this chapter.`,
      `What are the practical applications described in ${docName}?`,
      `Walk me through the foundational definitions step-by-step.`
    ];
    for (const fb of fallbacks) {
      if (!questions.includes(fb) && questions.length < 4) questions.push(fb);
    }
  }

  return questions;
}
