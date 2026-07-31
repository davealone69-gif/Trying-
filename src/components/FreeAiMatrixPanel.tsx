import React, { useState, useEffect } from 'react';
import {
  Brain,
  Cpu,
  Sparkles,
  Zap,
  Wifi,
  WifiOff,
  Send,
  CheckCircle2,
  Bookmark,
  Layers,
  Terminal,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  Radio,
  Sliders,
  Database
} from 'lucide-react';
import { FREE_LLM_MODELS, FreeLlmModelInfo, queryFreeLlmApi, FreeLlmResponse } from '../lib/freeLlmEngine';
import { sound } from '../utils/audio';

interface FreeAiMatrixPanelProps {
  addLog: (log: { level: string; message: string; details?: string }) => void;
}

export const FreeAiMatrixPanel: React.FC<FreeAiMatrixPanelProps> = ({ addLog }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-2.5-flash');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [codeContext, setCodeContext] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<FreeLlmResponse | null>(null);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  // Response cache history in LocalStorage
  const [cacheHistory, setCacheHistory] = useState<FreeLlmResponse[]>(() => {
    try {
      const saved = localStorage.getItem('matrixcore_free_llm_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const selectedModelInfo = FREE_LLM_MODELS.find(m => m.id === selectedModelId) || FREE_LLM_MODELS[0];

  const handleRunAiQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userPrompt.trim()) return;

    sound.playClick();
    setIsQuerying(true);

    try {
      const result = await queryFreeLlmApi({
        prompt: userPrompt,
        modelId: selectedModelId,
        codeContext,
        isOfflineMode
      });

      setAiResult(result);
      sound.playMutationSuccess();

      addLog({
        level: 'SYSTEM',
        message: `FREE LLM QUERY COMPLETED (${result.modelUsed})`,
        details: `Latency: ${result.latencyMs}ms | Tokens: ${result.tokenCount} | Mode: ${result.isOffline ? 'OFFLINE' : 'ONLINE'}`
      });

      // Cache result locally
      setCacheHistory(prev => {
        const updated = [result, ...prev.slice(0, 9)];
        try {
          localStorage.setItem('matrixcore_free_llm_cache', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed saving LLM cache:', err);
        }
        return updated;
      });
    } catch (err) {
      console.error('Free LLM query error:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    sound.playClick();
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-zinc-100">
      {/* Header & Control Bar */}
      <div className="bg-zinc-950 border-2 border-emerald-500 p-5 shadow-[0_0_20px_rgba(0,255,102,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-400">
              <Brain className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wider uppercase">
                  FREE LLM & AI MATRIX ENGINE
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400 uppercase">
                  10 FREE MODELS
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                GEMINI 2.5 &bull; DEEPSEEK R1 &bull; LLAMA 3.3 &bull; MISTRAL &bull; QWEN &bull; GEMMA 2 &bull; LOCAL OFFLINE PHI-3
              </p>
            </div>
          </div>

          {/* Model Selection & Offline Switch */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setIsOfflineMode(!isOfflineMode);
              }}
              className={`px-3 py-1.5 border text-xs font-bold uppercase flex items-center gap-2 transition-all ${
                isOfflineMode
                  ? 'bg-amber-950 text-amber-400 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
            >
              {isOfflineMode ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
              {isOfflineMode ? 'OFFLINE MODE: ACTIVE' : 'ONLINE MODE: SYNCED'}
            </button>
          </div>
        </div>

        {/* Categorized Free LLM Model Selector */}
        <div className="space-y-3 mt-4">
          {[
            { cat: 'cloud', label: '☁ Cloud Models', items: FREE_LLM_MODELS.filter(m => m.category === 'cloud') },
            { cat: 'community', label: '🌐 Community/API Models', items: FREE_LLM_MODELS.filter(m => m.category === 'community') },
            { cat: 'local', label: '📱 Local Models', items: FREE_LLM_MODELS.filter(m => m.category === 'local') }
          ].map((group) => (
            <div key={group.cat} className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                <span>{group.label}</span>
                <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.2 rounded">
                  {group.items.length}
                </span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {group.items.map(model => {
                  const isSelected = selectedModelId === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedModelId(model.id);
                      }}
                      className={`p-2.5 border text-left rounded-lg transition-all ${
                        isSelected
                          ? 'bg-emerald-950/80 border-emerald-500 shadow-[0_0_12px_rgba(0,255,102,0.2)]'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-black uppercase text-emerald-400 bg-black px-1 py-0.5 border border-emerald-900 rounded">
                          {model.badge}
                        </span>
                        {model.isOfflineCapable && (
                          <span className="text-[9px] text-amber-400 font-bold uppercase">
                            OFFLINE
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase mt-1.5 truncate">{model.name}</h4>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">{model.provider}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Controls */}
        <div className="lg:col-span-2 bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              QUERY INGESTION ({selectedModelInfo.name})
            </h3>
            <span className="text-xs text-amber-400 font-bold uppercase">{selectedModelInfo.contextWindow}</span>
          </div>

          <form onSubmit={handleRunAiQuery} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block text-zinc-300 font-bold uppercase">Prompt / Task Description</label>
              <textarea
                rows={4}
                required
                value={userPrompt}
                onChange={e => setUserPrompt(e.target.value)}
                placeholder="e.g. Audit Mandela effect timeline anomalies and verify Encrypted DataStore rules for Android 15..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 font-bold uppercase">Optional Code or Config Context</label>
              <textarea
                rows={3}
                value={codeContext}
                onChange={e => setCodeContext(e.target.value)}
                placeholder="Paste Kotlin snippet, ProGuard rules, or JSON configuration context..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white p-2.5 font-mono text-[11px] focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-zinc-500 font-bold uppercase self-center text-[10px]">Quick Prompts:</span>
              {[
                'Audit Mandela Effect Divergence',
                'Verify Encrypted DataStore Rules',
                'Check ProGuard & R8 Release Invariants',
                'Analyze Room SQLite Schema'
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setUserPrompt(p)}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-800 uppercase"
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isQuerying}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider border border-emerald-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.25)]"
            >
              {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isQuerying ? 'EXECUTING FREE LLM REASONING...' : `EXECUTE QUERY WITH ${selectedModelInfo.name.toUpperCase()}`}
            </button>
          </form>

          {/* AI Output Rendering Box */}
          {aiResult && (
            <div className="p-4 bg-zinc-900 border-2 border-emerald-500/80 space-y-3 font-mono text-xs mt-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-400 uppercase">{aiResult.modelUsed}</span>
                  {aiResult.isOffline && (
                    <span className="px-1.5 py-0.5 text-[9px] bg-amber-950 border border-amber-800 text-amber-400 font-bold uppercase">
                      OFFLINE ENGINE
                    </span>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(aiResult.response)}
                  className="px-2 py-1 bg-zinc-800 text-emerald-400 border border-zinc-700 font-bold flex items-center gap-1 uppercase text-[10px]"
                >
                  {copiedResponse ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedResponse ? 'COPIED' : 'COPY OUTPUT'}
                </button>
              </div>

              {/* Chain of thought reasoning steps */}
              {aiResult.reasoningSteps && aiResult.reasoningSteps.length > 0 && (
                <div className="p-2.5 bg-black border border-zinc-800 space-y-1 text-[11px]">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">CHAIN-OF-THOUGHT REASONING</p>
                  {aiResult.reasoningSteps.map((step, sIdx) => (
                    <div key={sIdx} className="text-zinc-400 flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">&gt;</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              <pre className="p-3 bg-black border border-zinc-800 text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {aiResult.response}
              </pre>

              <div className="flex justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                <span>Latency: {aiResult.latencyMs}ms</span>
                <span>Tokens Generated: ~{aiResult.tokenCount}</span>
                <span>Provider: {aiResult.provider}</span>
              </div>
            </div>
          )}
        </div>

        {/* Model Spec & Offline Cache Inspector */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            MODEL SPECIFICATIONS & CACHE
          </h3>

          <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 uppercase font-bold">Selected Model:</span>
              <span className="text-emerald-400 font-black">{selectedModelInfo.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 uppercase font-bold">Provider:</span>
              <span className="text-white font-bold">{selectedModelInfo.provider}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 uppercase font-bold">Free Tier:</span>
              <span className="text-emerald-400 font-bold">100% UNLIMITED / FREE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 uppercase font-bold">Offline Engine:</span>
              <span className="text-amber-400 font-bold">EMBEDDED MATRIX CORE</span>
            </div>
            <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">{selectedModelInfo.description}</p>
          </div>

          {/* Local Response Cache Inspector */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              OFFLINE LOCAL RESPONSE CACHE ({cacheHistory.length})
            </h4>

            {cacheHistory.length === 0 ? (
              <p className="text-zinc-500 italic text-[11px]">No cached responses stored in offline DataStore yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {cacheHistory.map((item, idx) => (
                  <div key={idx} className="p-2 bg-zinc-900 border border-zinc-800 text-[11px] space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-emerald-400">{item.modelUsed}</span>
                      <span className="text-zinc-500 text-[9px]">{item.latencyMs}ms</span>
                    </div>
                    <p className="text-zinc-300 line-clamp-2 italic">"{item.response.slice(0, 120)}..."</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
