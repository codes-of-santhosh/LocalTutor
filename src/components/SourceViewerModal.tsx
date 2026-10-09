import { X, BookOpen, CheckCircle2, Bookmark } from 'lucide-react';
import type { SourceCitation } from '../types';

interface SourceViewerModalProps {
  citation: SourceCitation | null;
  onClose: () => void;
}

export const SourceViewerModal = ({ citation, onClose }: SourceViewerModalProps) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 text-slate-200">
      <div className="bg-[#13161f] border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Source Citation</span>
                {citation.pageNumber && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                    Page {citation.pageNumber}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {citation.docName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 bg-[#13161f]">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Indexed Chunk #{citation.chunkIndex + 1}
            </span>
            {citation.similarity > 0 && (
              <span className="font-mono text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-semibold border border-indigo-500/20">
                Match: {(citation.similarity * 100).toFixed(1)}%
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-indigo-500/30 selection:text-indigo-200 shadow-inner">
            {citation.text}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>Retrieved from local browser IndexedDB storage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
