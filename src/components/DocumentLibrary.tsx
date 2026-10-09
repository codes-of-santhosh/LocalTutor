import { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  BookOpen,
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Loader2,
  FolderOpen
} from 'lucide-react';
import type { DocumentItem, DocumentChunk } from '../types';

interface DocumentLibraryProps {
  documents: DocumentItem[];
  chunks: DocumentChunk[];
  onUploadFile: (file: File) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
  onClearAll: () => Promise<void>;
  isIngesting: boolean;
  ingestionStatus: string;
  onSelectChunkForPreview: (chunk: DocumentChunk) => void;
}

export const DocumentLibrary = ({
  documents,
  chunks,
  onUploadFile,
  onDeleteDocument,
  onClearAll,
  isIngesting,
  ingestionStatus,
  onSelectChunkForPreview
}: DocumentLibraryProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#13161f] border-r border-slate-800/80 p-4 overflow-y-auto text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-sm text-white">Study Materials</h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
          {documents.length} source{documents.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Upload Box (Strictly user-uploaded files, sample button removed) */}
      <div className="mt-4 space-y-2.5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Drag & Drop Card */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-slate-750 bg-slate-900/60 hover:border-indigo-500 hover:bg-slate-900'
          }`}
        >
          <div className="mx-auto w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2.5 shadow-sm">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-white">
            Upload your PDF, DOCX or Notes
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Drag & drop files or click to browse
          </p>
        </div>
      </div>

      {/* Ingestion Status Banner */}
      {isIngesting && (
        <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3 animate-pulse shadow-sm">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-indigo-200">Processing Document</p>
            <p className="text-[11px] text-indigo-300/80">{ingestionStatus}</p>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="mt-5 flex-1 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 px-1 font-bold">
          <span>Active Notebooks</span>
          {documents.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-slate-400 hover:text-rose-400 transition-colors font-semibold"
              title="Remove all sources"
            >
              Clear All
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 my-2">
            <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-semibold">Your shelf is empty</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Upload your textbook chapter, syllabus, or lecture slides to generate tailored quizzes and start learning.
            </p>
          </div>
        ) : (
          documents.map(doc => {
            const isExpanded = expandedDocId === doc.id;
            const docChunks = chunks.filter(c => c.docId === doc.id);

            return (
              <div
                key={doc.id}
                className="border border-slate-800 rounded-2xl bg-slate-900/80 hover:border-slate-700 transition-colors overflow-hidden"
              >
                <div className="p-3 flex items-start justify-between gap-2">
                  <div
                    className="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                  >
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-100 truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                        <span className="uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {doc.type}
                        </span>
                        <span>•</span>
                        <span>{doc.chunkCount} chunks</span>
                        {doc.pageCount && (
                          <>
                            <span>•</span>
                            <span>{doc.pageCount} pages</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                      title="Inspect chunks"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chunks Accordion */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/60 p-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      <span>Document Chunks ({docChunks.length})</span>
                    </div>
                    {docChunks.map((chunk, idx) => (
                      <div
                        key={chunk.id}
                        onClick={() => onSelectChunkForPreview(chunk)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 text-[11px] text-slate-300 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-indigo-400">
                            Excerpt #{idx + 1}
                            {chunk.pageNumber ? ` (p.${chunk.pageNumber})` : ''}
                          </span>
                          <span>~{chunk.tokenEstimate} tokens</span>
                        </div>
                        <p className="line-clamp-2 text-slate-300">
                          {chunk.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* RAG pipeline info footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Vector Store</span>
        </span>
        <span className="font-mono text-[10px] text-slate-500">all-MiniLM-L6-v2</span>
      </div>
    </div>
  );
};
