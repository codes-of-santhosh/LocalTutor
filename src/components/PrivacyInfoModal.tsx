import { X, ShieldCheck, Cpu, WifiOff, HardDrive } from 'lucide-react';

interface PrivacyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyInfoModal = ({ isOpen, onClose }: PrivacyInfoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 text-slate-200">
      <div className="bg-[#13161f] border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                100% On-Device Privacy Architecture
              </h3>
              <p className="text-xs text-slate-400">
                How LocalTutor guarantees zero data leaves your machine
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
        <div className="p-5 space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <WifiOff className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-[13px]">
                Air-Gapped Processing
              </h4>
              <p className="text-slate-400 mt-0.5">
                Your uploaded files, extracted text, and study conversations are never transmitted to any external API or cloud server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <Cpu className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-[13px]">
                Client-Side WebGPU & Transformers.js
              </h4>
              <p className="text-slate-400 mt-0.5">
                Embeddings are computed in your browser using WASM (384-dimensional vectors). LLM inference runs directly on your GPU through WebGPU.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <HardDrive className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-[13px]">
                Sandboxed IndexedDB Storage
              </h4>
              <p className="text-slate-400 mt-0.5">
                All chunks, quiz records, and chat transcripts live exclusively in your local browser sandbox (Dexie DB) and can be cleared instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
