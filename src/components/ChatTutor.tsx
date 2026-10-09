import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sliders,
  Bot,
  User,
  ExternalLink,
  Square,
  Compass,
  CheckCircle,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import type { ChatMessage, ReadingLevel, SourceCitation } from '../types';

interface ChatTutorProps {
  messages: ChatMessage[];
  readingLevel: ReadingLevel;
  onChangeReadingLevel: (level: ReadingLevel) => void;
  isSocratic: boolean;
  onToggleSocratic: (val: boolean) => void;
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
  onStopGeneration: () => void;
  onSelectCitation: (citation: SourceCitation) => void;
  hasDocuments: boolean;
  suggestedQuestions?: string[];
}

const READING_LEVELS: { id: ReadingLevel; label: string; desc: string; icon: string }[] = [
  { id: 'elementary', label: 'Age 10 (Fun)', desc: 'Simple analogies & fun visual metaphors', icon: '🧒' },
  { id: 'high_school', label: 'High School', desc: 'Clear fundamentals & real-world connections', icon: '🎒' },
  { id: 'undergraduate', label: 'Undergraduate', desc: 'Rigorous collegiate terminology & mechanisms', icon: '🎓' },
  { id: 'expert', label: 'Expert / Research', desc: 'Deep scientific principles & formal models', icon: '🔬' }
];

export const ChatTutor = ({
  messages,
  readingLevel,
  onChangeReadingLevel,
  isSocratic,
  onToggleSocratic,
  onSendMessage,
  isGenerating,
  onStopGeneration,
  onSelectCitation,
  hasDocuments,
  suggestedQuestions = []
}: ChatTutorProps) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const currentLevelIndex = READING_LEVELS.findIndex(l => l.id === readingLevel);

  return (
    <div className="flex flex-col h-full bg-[#0f1117] text-slate-200">
      {/* Adaptive Learning Controls Bar */}
      <div className="border-b border-slate-800 bg-[#13161f]/80 backdrop-blur-md p-3.5 space-y-3">
        {/* Complexity Slider Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300">
              Adaptive Level:
            </span>
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              <span>{READING_LEVELS[currentLevelIndex].icon}</span>
              <span>{READING_LEVELS[currentLevelIndex].label}</span>
            </span>
          </div>

          {/* Socratic Mode Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 hover:bg-slate-850 px-2.5 py-1 rounded-xl border border-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={isSocratic}
                onChange={(e) => onToggleSocratic(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
              />
              <div className="flex items-center gap-1.5 text-xs">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold text-slate-300">Socratic Mentor</span>
                <span className="text-[10px] text-purple-300 font-bold px-1.5 py-0.2 rounded-full bg-purple-500/10 border border-purple-500/20">
                  {isSocratic ? 'Guiding' : 'Direct'}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* 4-Step Interactive Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={currentLevelIndex}
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              onChangeReadingLevel(READING_LEVELS[idx].id);
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="grid grid-cols-4 text-[10px] text-slate-400 text-center font-medium">
            {READING_LEVELS.map((lvl, idx) => (
              <span
                key={lvl.id}
                onClick={() => onChangeReadingLevel(lvl.id)}
                className={`cursor-pointer transition-colors ${
                  idx === currentLevelIndex
                    ? 'text-indigo-400 font-bold'
                    : 'hover:text-slate-200'
                }`}
              >
                {lvl.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-md">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              Welcome to Your Study Space
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Upload your textbook or lecture slides. LocalTutor indexes your material with local embeddings and answers questions with precise citations.
            </p>

            {hasDocuments && suggestedQuestions.length > 0 && (
              <div className="mt-6 w-full space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold justify-center">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Try asking one of these:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(q)}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-950/20 text-xs text-slate-300 transition-all text-left font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
                }`}
              >
                {/* Assistant Metadata Pill */}
                {msg.role === 'assistant' && (msg.readingLevel || msg.isSocratic) && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800 text-[10px] text-slate-400">
                    {msg.readingLevel && (
                      <span className="capitalize px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                        Level: {msg.readingLevel.replace('_', ' ')}
                      </span>
                    )}
                    {msg.isSocratic && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                        Socratic Guidance
                      </span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans text-[13px] text-slate-200 leading-relaxed">
                  {msg.content}
                </div>

                {/* Source Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Verified Sources:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cite, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => onSelectCitation(cite)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-[11px] text-indigo-300 font-semibold transition-colors"
                          title="Click to view exact source excerpt"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>
                            Source {cIdx + 1}
                            {cite.pageNumber ? ` (p.${cite.pageNumber})` : ''}
                          </span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-[#13161f]/90 backdrop-blur-md p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              hasDocuments
                ? isSocratic
                  ? 'Ask a question or explain what you think...'
                  : 'Ask about any concept in your uploaded notes...'
                : 'Upload notes using the left sidebar to begin...'
            }
            disabled={isGenerating}
            className="flex-1 bg-slate-900 border border-slate-750 text-slate-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-500 transition-all shadow-inner"
          />

          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors shadow-md flex items-center gap-1.5 text-xs font-semibold"
              title="Stop generating"
            >
              <Square className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-indigo-600 shadow-md"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
