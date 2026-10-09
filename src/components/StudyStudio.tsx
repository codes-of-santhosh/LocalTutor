import { useState } from 'react';
import {
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Compass,
  FileCheck2,
  SmilePlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { QuizQuestion, Flashcard, DocumentChunk } from '../types';

interface StudyStudioProps {
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
  chunks?: DocumentChunk[];
  onGenerateQuizzes: () => void;
  hasDocuments: boolean;
}

export const StudyStudio = ({
  quizzes,
  flashcards,
  chunks = [],
  onGenerateQuizzes,
  hasDocuments
}: StudyStudioProps) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards' | 'notes'>('quiz');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizState, setQuizState] = useState<{ [quizId: string]: { selected: number; isAnswered: boolean } }>({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Confetti trigger
  const fireConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSelectOption = (quiz: QuizQuestion, optionIndex: number) => {
    if (quizState[quiz.id]?.isAnswered) return;

    const isCorrect = optionIndex === quiz.correctIndex;
    if (isCorrect) {
      fireConfetti();
    }

    setQuizState(prev => ({
      ...prev,
      [quiz.id]: {
        selected: optionIndex,
        isAnswered: true
      }
    }));
  };

  const handleResetQuiz = () => {
    setQuizState({});
    setCurrentQuizIndex(0);
  };

  const totalAnswered = Object.keys(quizState).length;
  const correctCount = quizzes.filter(
    q => quizState[q.id]?.selected === q.correctIndex
  ).length;

  const currentQuiz = quizzes[currentQuizIndex];
  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="flex flex-col h-full bg-[#13161f] border-l border-slate-800 p-4 overflow-y-auto text-slate-200">
      {/* Studio Navigation Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl text-xs w-full border border-slate-800">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Quiz Desk</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'flashcards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>
        </div>
      </div>

      {/* QUIZ TAB */}
      {activeTab === 'quiz' && (
        <div className="mt-4 flex-1 flex flex-col justify-between">
          {!hasDocuments ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 my-auto">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-white font-bold">Document-Grounded Quizzes</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Upload your notes to generate instant, tailored quiz questions with feedback and page citations.
              </p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center p-6 my-auto">
              <button
                onClick={onGenerateQuizzes}
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Adaptive Quiz</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quiz Header & Progress */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  Question {currentQuizIndex + 1} of {quizzes.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Score: {correctCount}/{totalAnswered}
                  </span>
                  <button
                    onClick={handleResetQuiz}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                    title="Reset quiz"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5">
                {quizzes.map((q, idx) => {
                  const state = quizState[q.id];
                  const isCur = idx === currentQuizIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuizIndex(idx)}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        isCur
                          ? 'bg-indigo-500 ring-2 ring-indigo-500/30'
                          : state
                          ? state.selected === q.correctIndex
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                          : 'bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Question Card */}
              {currentQuiz && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-indigo-400">{currentQuiz.docName}</span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                    {currentQuiz.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 mt-3">
                    {currentQuiz.options.map((opt, optIdx) => {
                      const state = quizState[currentQuiz.id];
                      const isSelected = state?.selected === optIdx;
                      const isCorrect = optIdx === currentQuiz.correctIndex;
                      const isAnswered = state?.isAnswered;

                      let btnStyle =
                        'border-slate-800 bg-slate-950/50 hover:bg-slate-800/80 hover:border-slate-700 text-slate-200';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle =
                            'border-emerald-500/40 bg-emerald-950/40 text-emerald-200 font-semibold';
                        } else if (isSelected) {
                          btnStyle =
                            'border-rose-500/40 bg-rose-950/40 text-rose-300 line-through';
                        } else {
                          btnStyle = 'border-slate-800/60 bg-slate-950/30 text-slate-500 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQuiz, optIdx)}
                          disabled={isAnswered}
                          className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all flex items-start gap-2 shadow-sm ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 bg-slate-900 text-slate-300">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                          {isAnswered && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Socratic Feedback & Explanation */}
                  {quizState[currentQuiz.id]?.isAnswered && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      {quizState[currentQuiz.id].selected === currentQuiz.correctIndex ? (
                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
                          <p className="font-bold flex items-center gap-1.5 text-emerald-400">
                            <SmilePlus className="w-4 h-4 text-emerald-400" />
                            Correct! Great recall!
                          </p>
                          <p className="text-[11px] text-emerald-300/90 mt-1 leading-relaxed">
                            {currentQuiz.explanation}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
                          <p className="font-bold flex items-center gap-1.5 text-amber-400">
                            <Compass className="w-4 h-4 text-amber-400" />
                            Socratic Hint:
                          </p>
                          <p className="text-[11px] text-amber-300/90 mt-1 leading-relaxed">
                            {currentQuiz.socraticHint}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question Nav */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuizIndex === 0}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-750 disabled:opacity-40 flex items-center gap-1 font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <button
                      onClick={() =>
                        setCurrentQuizIndex(prev => Math.min(quizzes.length - 1, prev + 1))
                      }
                      disabled={currentQuizIndex === quizzes.length - 1}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-xs text-white hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1 font-semibold shadow-sm"
                    >
                      Next <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FLASHCARDS TAB */}
      {activeTab === 'flashcards' && (
        <div className="mt-4 flex-1 flex flex-col justify-between">
          {flashcards.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 my-auto">
              <Award className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-white font-bold">Study Flashcards</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Upload your notes to automatically generate active recall flashcards from your material.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </span>
                <span className="text-[11px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {currentCard?.sourceRef || 'Document Source'}
                </span>
              </div>

              {/* Flashcard 3D Card */}
              <div
                onClick={() => setIsFlipped(f => !f)}
                className="min-h-[240px] p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-indigo-500/60 hover:shadow-lg transition-all"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                  <span>{isFlipped ? 'Answer (Recall)' : 'Prompt (Question)'}</span>
                  <span className="text-slate-500 font-normal">Click anywhere to flip 🔄</span>
                </div>

                <div className="my-auto text-center py-4">
                  <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {isFlipped ? currentCard?.back : currentCard?.front}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 text-center font-medium">
                  Active Recall Practice
                </div>
              </div>

              {/* Flashcard Nav */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(prev => Math.max(0, prev - 1));
                  }}
                  disabled={currentCardIndex === 0}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-750 disabled:opacity-40 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                  }}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-xs text-white hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1 font-semibold shadow-sm"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUMMARY NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="mt-4 flex-1 space-y-3 text-xs leading-relaxed text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-indigo-400 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Core Takeaways from Uploaded Notes</span>
            </div>
            {chunks.length > 0 ? (
              <ul className="list-disc pl-4 space-y-2.5 text-slate-300 text-[12px] leading-relaxed">
                {chunks.slice(0, 6).map((chunk, idx) => {
                  const clean = chunk.text
                    .replace(/\[Page \d+\]/gi, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                  const firstSentence = clean.split(/(?<=[.?!])\s+/)[0] || clean.slice(0, 120);
                  return (
                    <li key={idx}>
                      <span className="font-semibold text-white">
                        {chunk.docName.replace(/\.[^/.]+$/, '')}
                        {chunk.pageNumber ? ` (p.${chunk.pageNumber})` : ''}:
                      </span>{' '}
                      {firstSentence}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-slate-500 italic text-[11px]">
                Upload notes or study guides to auto-extract core takeaways here.
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 space-y-1">
            <span className="font-bold text-indigo-400">Adaptive Study Tip:</span>
            <p>
              Switch the Complexity slider above to <em>&quot;Age 10 (Fun)&quot;</em> for story-based metaphors, or to <em>&quot;Undergraduate/Expert&quot;</em> for rigorous terminology and step-by-step mechanisms.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
