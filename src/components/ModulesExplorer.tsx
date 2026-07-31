import React, { useState } from 'react';
import { Folder, FileCode, Lock, Unlock, Eye, Copy, Check } from 'lucide-react';
import { SystemModuleFile } from '../types';
import { sound } from '../utils/audio';

interface ModulesExplorerProps {
  files: SystemModuleFile[];
}

export const ModulesExplorer: React.FC<ModulesExplorerProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<SystemModuleFile>(files[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="bg-zinc-950 border-2 border-emerald-500/80 p-5 shadow-[0_0_20px_rgba(0,255,102,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-wider uppercase flex items-center gap-2">
              <Folder className="w-6 h-6 text-emerald-400" />
              SYSTEM MODULE ARCHITECTURE
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              8 CORE MODULE PATHS &bull; SINGLE PUBLIC ENTRYPOINTS &bull; IMMUTABLE CORE INTERFACES
            </p>
          </div>

          <div className="text-xs bg-zinc-900 border border-zinc-800 p-2.5">
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">CORE RULE</span>
            <span className="text-emerald-400 font-bold">NO CROSS-MODULE IMPORTS EXCEPT THROUGH INTERFACES</span>
          </div>
        </div>

        {/* Module Paths Chips */}
        <div className="flex flex-wrap gap-2 mt-4 text-xs font-bold">
          {['/matrixcore', '/mandelacore', '/devator', '/evaluateor', '/ui', '/data', '/domain', '/system'].map(m => (
            <span
              key={m}
              className={`px-2.5 py-1 border ${
                selectedFile.module === m
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500 font-black'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Main File Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Files List */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase border-b border-zinc-800 pb-2">
            MODULE FILES INDEX
          </h3>

          <div className="space-y-2 text-xs">
            {files.map(f => (
              <button
                key={f.path}
                onClick={() => {
                  sound.playClick();
                  setSelectedFile(f);
                }}
                className={`w-full p-3 border text-left transition-all ${
                  selectedFile.path === f.path
                    ? 'bg-zinc-900 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{f.name}</span>
                  {f.readOnly ? (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3" /> IMMUTABLE
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <Unlock className="w-3 h-3" /> MUTABLE
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 truncate">{f.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Code Inspector */}
        <div className="lg:col-span-2 bg-zinc-950 border-2 border-zinc-800 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">{selectedFile.path}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED!' : 'COPY CODE'}
            </button>
          </div>

          <div className="bg-black border border-zinc-800 p-4 font-mono text-xs overflow-x-auto text-emerald-400/90 leading-relaxed whitespace-pre">
            {selectedFile.content}
          </div>
        </div>
      </div>
    </div>
  );
};
