import {
  Cpu,
  ShieldCheck,
  HardDrive,
  Zap,
  Info,
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import { AVAILABLE_MODELS, type WebGPUDiagnostics } from '../services/webllm';
import type { ModelOption } from '../types';

interface NavbarProps {
  webgpuDiag: WebGPUDiagnostics | null;
  selectedModel: ModelOption;
  onSelectModel: (model: ModelOption) => void;
  isModelLoaded: boolean;
  isLoadingModel: boolean;
  loadingProgress: number;
  loadingText: string;
  onLoadModel: () => void;
  useSimulation: boolean;
  onToggleSimulation: (val: boolean) => void;
  totalChunks: number;
  onOpenPrivacyInfo: () => void;
}

export const Navbar = ({
  webgpuDiag,
  selectedModel,
  onSelectModel,
  isModelLoaded,
  isLoadingModel,
  loadingProgress,
  loadingText,
  onLoadModel,
  useSimulation,
  onToggleSimulation,
  totalChunks,
  onOpenPrivacyInfo
}: NavbarProps) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0d0f15]/90 backdrop-blur-md sticky top-0 z-40 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                LocalTutor
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                100% On-Device
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Private AI Tutor, Document Search & Study Desk
            </p>
          </div>
        </div>

        {/* Engine Controls & Diagnostic */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Privacy Badge */}
          <button
            onClick={onOpenPrivacyInfo}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-medium"
            title="All AI runs completely inside your browser GPU. Zero telemetry or server calls."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Air-Gapped Privacy</span>
            <Info className="w-3 h-3 text-emerald-400/70" />
          </button>

          {/* WebGPU Status Pill */}
          <div
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border ${
              webgpuDiag?.supported
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
            title={webgpuDiag?.error || webgpuDiag?.adapterName || 'WebGPU Status'}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-medium">
              {webgpuDiag?.supported ? 'WebGPU Active' : 'WebGPU Inactive'}
            </span>
          </div>

          {/* Mode Switch: Local GPU vs Instant Simulation */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onToggleSimulation(false)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                !useSimulation
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Run with real WebLLM weights directly in your browser GPU"
            >
              WebLLM (GPU)
            </button>
            <button
              onClick={() => onToggleSimulation(true)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                useSimulation
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Instant mode: answers questions using local vector embeddings without waiting for 500MB+ model weights"
            >
              <Zap className="w-3 h-3" />
              Instant
            </button>
          </div>

          {/* Model Selector (when WebLLM is active) */}
          {!useSimulation && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  aria-label="Select WebLLM Model"
                  value={selectedModel.id}
                  onChange={(e) => {
                    const found = AVAILABLE_MODELS.find(m => m.id === e.target.value);
                    if (found) onSelectModel(found);
                  }}
                  disabled={isLoadingModel}
                  className="appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-3 pr-8 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium cursor-pointer"
                >
                  {AVAILABLE_MODELS.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                      {m.name} ({m.size})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>

              {!isModelLoaded && (
                <button
                  onClick={onLoadModel}
                  disabled={isLoadingModel}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {isLoadingModel ? 'Loading...' : 'Load Model'}
                </button>
              )}

              {isModelLoaded && (
                <span className="text-xs px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ready
                </span>
              )}
            </div>
          )}

          {/* Stored Chunks Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">{totalChunks} Chunks in DB</span>
          </div>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {isLoadingModel && (
        <div className="w-full bg-slate-900 h-1.5 overflow-hidden border-t border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ width: `${Math.max(5, loadingProgress)}%` }}
          />
          <div className="max-w-7xl mx-auto px-4 py-1 text-[11px] text-indigo-300 flex justify-between bg-indigo-950/40 font-medium">
            <span>{loadingText || 'Fetching WebLLM model weights into browser cache...'}</span>
            <span>{loadingProgress}%</span>
          </div>
        </div>
      )}
    </header>
  );
};
