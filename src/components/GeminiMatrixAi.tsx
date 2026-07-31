import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Zap,
  Radio,
  Sliders,
  Eye,
  GitCompare,
  Terminal,
  ShieldCheck,
  Cpu,
  Bookmark,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  Layers,
  WifiOff,
  Activity
} from 'lucide-react';
import { TerminalLog } from '../types';
import { sound } from '../utils/audio';
import { FreeAiMatrixPanel } from './FreeAiMatrixPanel';

interface GeminiMatrixAiProps {
  addLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
}

export const GeminiMatrixAi: React.FC<GeminiMatrixAiProps> = ({ addLog }) => {
  // Navigation active sub-tab
  const [coreMode, setCoreMode] = useState<
    'MANDELA_DETECT' | 'REALITY_COMPARE' | 'AI_ASSISTANT' | 'SWARM_COLLAB' | 'MEMORY_BANK' | 'FREE_LLM_HUB'
  >('MANDELA_DETECT');

  // Model & Offline State
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [forceOffline, setForceOffline] = useState<boolean>(false);

  // 1. Mandela Effect State
  const [mandelaQuery, setMandelaQuery] = useState('Berenstain Bears vs Berenstein memory anomaly');
  const [mandelaResult, setMandelaResult] = useState<any>(null);
  const [isDetectingMandela, setIsDetectingMandela] = useState(false);

  // 2. Reality Comparison State
  const [baselineInput, setBaselineInput] = useState(
    JSON.stringify(
      {
        theme: 'LIME_NEON',
        securityLevel: 'STANDARD',
        targetPackage: 'com.matrixcore.mandela.app',
        datastoreEncryption: 'OPTIONAL'
      },
      null,
      2
    )
  );
  const [mutatedInput, setMutatedInput] = useState(
    JSON.stringify(
      {
        theme: 'HOT_CRIMSON',
        securityLevel: 'CYBER_BRUTALIST_STRICT',
        targetPackage: 'com.matrixcore.mandela.app',
        datastoreEncryption: 'MANDATORY_ENCRYPTED'
      },
      null,
      2
    )
  );
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparingReality, setIsComparingReality] = useState(false);

  // 3. AI Assistant State
  const [prompt, setPrompt] = useState('');
  const [taskCategory, setTaskCategory] = useState<'AUDIT' | 'SECURITY' | 'PROGUARD' | 'MUTATION'>('AUDIT');
  const [codeContext, setCodeContext] = useState('');
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [reasoningSteps, setReasoningSteps] = useState<string[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 4. Swarm Collaboration State
  const [swarmTask, setSwarmTask] = useState('AUDIT_AND_APPROVE_MUTATION_MUT-409');
  const [swarmResult, setSwarmResult] = useState<any>(null);
  const [isSwarmCollaborating, setIsSwarmCollaborating] = useState(false);

  // 5. Memory Bank State
  const [memories, setMemories] = useState<any[]>([]);
  const [newMemTitle, setNewMemTitle] = useState('');
  const [newMemContent, setNewMemContent] = useState('');
  const [newMemCategory, setNewMemCategory] = useState('MANDELA_EFFECT');
  const [memorySearch, setMemorySearch] = useState('');
  const [isSavingMemory, setIsSavingMemory] = useState(false);

  useEffect(() => {
    fetchMemories();
    runMandelaDetection();
    runSwarmCollaboration();
  }, []);

  // API Call: Memory Bank Fetch
  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/ai/memory');
      const data = await res.json();
      if (data.memories) {
        setMemories(data.memories);
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    }
  };

  // 1. Mandela Effect Detection
  const runMandelaDetection = async (overrideQuery?: string) => {
    const targetQ = overrideQuery || mandelaQuery;
    if (!targetQ.trim()) return;

    sound.playClick();
    setIsDetectingMandela(true);

    try {
      const res = await fetch('/api/mandela/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQ })
      });
      const data = await res.json();
      setMandelaResult(data);
      sound.playMutationSuccess();

      addLog({
        level: 'MANDELA',
        message: `MANDELA ANOMALY SCAN COMPLETE (${data.anomalyType})`,
        details: `Divergence Probability: ${data.divergenceProbability}% | Anchor: ${data.timelineAnchor}`
      });
    } catch (err) {
      console.error(err);
      sound.playRejectionAlert();
    } finally {
      setIsDetectingMandela(false);
    }
  };

  // 2. Reality Comparison Engine
  const runRealityComparison = async () => {
    sound.playClick();
    setIsComparingReality(true);

    try {
      let parsedBase = {};
      let parsedMut = {};
      try {
        parsedBase = JSON.parse(baselineInput);
        parsedMut = JSON.parse(mutatedInput);
      } catch (e) {
        alert('Invalid JSON in baseline or mutated state input.');
        setIsComparingReality(false);
        return;
      }

      const res = await fetch('/api/mandela/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baselineState: parsedBase,
          mutatedState: parsedMut,
          timelineLabel: 'BASELINE_ALPHA_VS_MUTATED_OMEGA'
        })
      });

      const data = await res.json();
      setComparisonResult(data);
      sound.playMutationSuccess();

      addLog({
        level: 'MATRIXCORE',
        message: `REALITY COMPARISON EXECUTED (${data.shiftedPropertiesCount} SHIFTS)`,
        details: `Timeline Divergence: ${data.divergencePercent}%`
      });
    } catch (err) {
      console.error(err);
      sound.playRejectionAlert();
    } finally {
      setIsComparingReality(false);
    }
  };

  // 3. AI Assistant & Reasoning
  const handleAiAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    sound.playClick();
    setIsAiLoading(true);
    setAiOutput(null);

    addLog({
      level: 'SYSTEM',
      message: `AI ANALYSIS INITIATED (${selectedModel} | ${taskCategory})`,
      details: prompt
    });

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: taskCategory,
          codeContext,
          model: selectedModel,
          forceOffline
        })
      });

      const data = await res.json();
      setAiOutput(data.response || 'No analysis output returned.');
      setReasoningSteps(data.reasoningChain || []);
      setLatencyMs(data.latencyMs || 45);
      sound.playMutationSuccess();
    } catch (err) {
      console.error(err);
      setAiOutput('Error communicating with Matrix AI backend.');
      sound.playRejectionAlert();
    } finally {
      setIsAiLoading(false);
    }
  };

  // 4. Swarm Collaboration
  const runSwarmCollaboration = async () => {
    sound.playClick();
    setIsSwarmCollaborating(true);

    try {
      const res = await fetch('/api/ai/swarm-collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: swarmTask })
      });
      const data = await res.json();
      setSwarmResult(data);
      sound.playMutationSuccess();

      addLog({
        level: 'EVALUATEOR',
        message: `SWARM AI COLLABORATION COMPLETED (${data.consensusRatio})`,
        details: `Global Consensus Score: ${data.globalConsensusScore}/100`
      });
    } catch (err) {
      console.error(err);
      sound.playRejectionAlert();
    } finally {
      setIsSwarmCollaborating(false);
    }
  };

  // 5. Memory Bank Add & Delete
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTitle.trim() || !newMemContent.trim()) return;

    sound.playClick();
    setIsSavingMemory(true);

    try {
      const res = await fetch('/api/ai/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMemTitle,
          content: newMemContent,
          category: newMemCategory,
          tags: [newMemCategory.toLowerCase(), 'matrix_ai']
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewMemTitle('');
        setNewMemContent('');
        await fetchMemories();
        sound.playMutationSuccess();
        addLog({
          level: 'SYSTEM',
          message: `NEW MEMORY NODE COMMITTED (${data.memory.id})`,
          details: data.memory.title
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingMemory(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    sound.playClick();
    try {
      const res = await fetch(`/api/ai/memory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchMemories();
        addLog({
          level: 'SYSTEM',
          message: `MEMORY NODE REMOVED (${id})`
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMemories = memories.filter(
    m =>
      m.title.toLowerCase().includes(memorySearch.toLowerCase()) ||
      m.content.toLowerCase().includes(memorySearch.toLowerCase()) ||
      m.category.toLowerCase().includes(memorySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Core AI Header */}
      <div className="bg-zinc-950 border-2 border-emerald-500 p-5 shadow-[0_0_20px_rgba(0,255,102,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-400">
              <Brain className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wider uppercase">
                CORE AI SUITE & MANDELA DETECTOR
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                QUANTUM DETECTION &bull; REALITY COMPARISON &bull; MULTI-MODEL REASONING &bull; SWARM
                COLLABORATION &bull; MEMORY BANK
              </p>
            </div>
          </div>

          {/* Model Selector & Offline Mode Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedModel}
                onChange={e => {
                  sound.playClick();
                  setSelectedModel(e.target.value);
                }}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="claude-3.5-sonnet">Claude 3.5 Sonnet (Local Matrix)</option>
                <option value="deepseek-r1">DeepSeek-R1 Reasoning (Local Matrix)</option>
                <option value="swarm-coroutines">Swarm Coroutines Engine</option>
              </select>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setForceOffline(!forceOffline);
              }}
              className={`px-3 py-1.5 border font-bold text-xs flex items-center gap-2 uppercase transition-all ${
                forceOffline
                  ? 'bg-amber-950 text-amber-400 border-amber-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              {forceOffline ? 'OFFLINE MODE ACTIVE' : 'FORCE OFFLINE'}
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs for Core AI */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'MANDELA_DETECT', label: '1. Mandela Detector', icon: Eye },
            { id: 'REALITY_COMPARE', label: '2. Reality Compare', icon: GitCompare },
            { id: 'AI_ASSISTANT', label: '3. AI Reasoning & Copilot', icon: Terminal },
            { id: 'SWARM_COLLAB', label: '4. Swarm Collaboration', icon: Activity },
            { id: 'MEMORY_BANK', label: '5. Memory Bank', icon: Bookmark },
            { id: 'FREE_LLM_HUB', label: '6. Free LLMs & Offline AI', icon: Brain }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = coreMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setCoreMode(tab.id as any);
                }}
                className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-black border-emerald-300 font-black shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: MANDELA EFFECT DETECTOR */}
      {/* ------------------------------------------------------------- */}
      {coreMode === 'MANDELA_DETECT' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              SCAN MEMORY FOR MANDELA EFFECT SHIFT
            </h3>

            <div className="space-y-3 text-xs">
              <label className="block text-zinc-400 font-bold uppercase">
                Memory / Query Text Vector
              </label>
              <textarea
                value={mandelaQuery}
                onChange={e => setMandelaQuery(e.target.value)}
                rows={3}
                placeholder="Enter memory fragment or code invariant to scan for reality divergence..."
                className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-white focus:border-emerald-400 focus:outline-none font-mono"
              />

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-zinc-500 font-bold text-[11px] self-center">Presets:</span>
                {[
                  'Berenstain vs Berenstein',
                  'Monopoly Pennybags Monocle',
                  'Android 15 Encrypted DataStore',
                  'ProGuard R8 keep rules'
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMandelaQuery(p);
                      runMandelaDetection(p);
                    }}
                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => runMandelaDetection()}
                disabled={isDetectingMandela}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider transition-all border border-emerald-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isDetectingMandela ? 'animate-spin' : ''}`} />
                {isDetectingMandela ? 'SCANNING MEMORY MATRIX...' : 'RUN MANDELA ANOMALY DETECTOR'}
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                MANDELA ANOMALY DIAGNOSTIC
              </span>
              {mandelaResult && (
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-black uppercase border ${
                    mandelaResult.divergenceProbability > 50
                      ? 'bg-amber-950 text-amber-400 border-amber-500'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-500'
                  }`}
                >
                  {mandelaResult.anomalyType}
                </span>
              )}
            </h3>

            {mandelaResult ? (
              <div className="space-y-4 text-xs">
                {/* Meter Gauge */}
                <div className="bg-zinc-900 border border-zinc-800 p-3 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-zinc-400 uppercase">Temporal Divergence Probability</span>
                    <span className="text-amber-400 font-black">
                      {mandelaResult.divergenceProbability}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-zinc-950 border border-zinc-800 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-500"
                      style={{ width: `${mandelaResult.divergenceProbability}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center font-mono">
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">TIMELINE ANCHOR</p>
                    <p className="text-xs font-bold text-white mt-1">
                      {mandelaResult.timelineAnchor}
                    </p>
                  </div>
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">SCAN CONFIDENCE</p>
                    <p className="text-xs font-bold text-emerald-400 mt-1">
                      {mandelaResult.confidence}%
                    </p>
                  </div>
                </div>

                {/* Reasoning Steps */}
                <div className="bg-black border border-zinc-800 p-3 space-y-2">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">
                    AI REASONING & DETECTIVE LOG
                  </p>
                  <div className="space-y-1">
                    {mandelaResult.reasoningSteps?.map((step: string, idx: number) => (
                      <p key={idx} className="text-[11px] text-zinc-300 font-mono">
                        &bull; {step}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-zinc-600 italic text-xs">
                Run detection above to inspect memory divergence and reality shifts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: REALITY COMPARISON ENGINE */}
      {/* ------------------------------------------------------------- */}
      {coreMode === 'REALITY_COMPARE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-3">
              <h3 className="text-sm font-bold text-zinc-300 uppercase border-b border-zinc-800 pb-2">
                TIMELINE ALPHA (BASELINE REALITY STATE)
              </h3>
              <textarea
                value={baselineInput}
                onChange={e => setBaselineInput(e.target.value)}
                rows={7}
                className="w-full bg-black border border-zinc-800 p-3 text-xs text-emerald-400 font-mono focus:outline-none"
              />
            </div>

            <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase border-b border-zinc-800 pb-2">
                TIMELINE OMEGA (MUTATED REALITY STATE)
              </h3>
              <textarea
                value={mutatedInput}
                onChange={e => setMutatedInput(e.target.value)}
                rows={7}
                className="w-full bg-black border border-zinc-800 p-3 text-xs text-amber-300 font-mono focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={runRealityComparison}
            disabled={isComparingReality}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider transition-all border border-emerald-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50"
          >
            <GitCompare className="w-4 h-4" />
            {isComparingReality ? 'COMPARING TIMELINE STATES...' : 'EXECUTE REALITY COMPARISON'}
          </button>

          {comparisonResult && (
            <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  SIDE-BY-SIDE TIMELINE DIFF TABLE
                </h3>
                <span className="text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-500/50 px-2.5 py-1">
                  DIVERGENCE: {comparisonResult.divergencePercent}%
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-zinc-800">
                  <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-2.5 border-b border-zinc-800">Property Key</th>
                      <th className="p-2.5 border-b border-zinc-800">Timeline Alpha (Baseline)</th>
                      <th className="p-2.5 border-b border-zinc-800">Timeline Omega (Mutated)</th>
                      <th className="p-2.5 border-b border-zinc-800">Shift Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 font-mono">
                    {comparisonResult.diffs?.map((diff: any, idx: number) => (
                      <tr
                        key={idx}
                        className={diff.isShifted ? 'bg-amber-950/20' : 'hover:bg-zinc-900/50'}
                      >
                        <td className="p-2.5 font-bold text-white">{diff.property}</td>
                        <td className="p-2.5 text-zinc-400">{diff.baselineValue}</td>
                        <td className="p-2.5 text-amber-300 font-bold">{diff.mutatedValue}</td>
                        <td className="p-2.5">
                          {diff.isShifted ? (
                            <span className="text-amber-400 font-bold uppercase text-[10px] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> REALITY SHIFTED
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> IDENTICAL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: AI ASSISTANT & REASONING */}
      {/* ------------------------------------------------------------- */}
      {coreMode === 'AI_ASSISTANT' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                SUBMIT ANALYSIS PROMPT
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950 border border-emerald-500 px-2 py-0.5">
                {selectedModel}
              </span>
            </h3>

            <form onSubmit={handleAiAnalysis} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Task Category
                </label>
                <select
                  value={taskCategory}
                  onChange={e => setTaskCategory(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="AUDIT">APK & Kotlin Code Audit</option>
                  <option value="SECURITY">Security Guild Compliance Check</option>
                  <option value="PROGUARD">R8 & ProGuard Rule Optimization</option>
                  <option value="MUTATION">Devator Mutation Drafting</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Prompt Query
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="Ask the model to audit code, check DataStore rules, or evaluate ProGuard shrinking..."
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Code / Config Snippet (Optional)
                </label>
                <textarea
                  value={codeContext}
                  onChange={e => setCodeContext(e.target.value)}
                  rows={3}
                  placeholder="Paste Kotlin code or proguard-rules.pro snippet..."
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-white focus:border-emerald-400 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isAiLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider transition-all border border-emerald-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isAiLoading ? 'GENERATING REASONING ANALYSIS...' : 'RUN AI ANALYSIS'}
              </button>
            </form>
          </div>

          {/* AI Output Window */}
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  MODEL OUTPUT & REASONING CHAIN
                </span>
                {latencyMs && (
                  <span className="text-[10px] text-zinc-400 font-mono">
                    LATENCY: {latencyMs} ms
                  </span>
                )}
              </h3>

              {reasoningSteps.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 p-3 mb-3 text-[11px] font-mono space-y-1">
                  <p className="text-emerald-400 font-bold uppercase text-[10px]">
                    CHAIN-OF-THOUGHT STEP BREAKDOWN:
                  </p>
                  {reasoningSteps.map((step, idx) => (
                    <p key={idx} className="text-zinc-300">
                      &bull; {step}
                    </p>
                  ))}
                </div>
              )}

              <div className="bg-black border border-zinc-800 p-3.5 h-64 overflow-y-auto text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
                {isAiLoading ? (
                  <div className="flex items-center justify-center h-full gap-2 text-zinc-400">
                    <Cpu className="w-6 h-6 animate-spin text-emerald-400" />
                    <span>Executing reasoning vectors...</span>
                  </div>
                ) : aiOutput ? (
                  aiOutput
                ) : (
                  <span className="text-zinc-600 italic">
                    Submit a query to trigger model generation & step-by-step chain of thought.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: SWARM AI COLLABORATION */}
      {/* ------------------------------------------------------------- */}
      {coreMode === 'SWARM_COLLAB' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  SWARM MULTI-AGENT COLLABORATION ARENA
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Arbiter &bull; Security Guild &bull; Performance Auditor &bull; UX Auditor &bull; Shift Worker
                </p>
              </div>

              <button
                onClick={runSwarmCollaboration}
                disabled={isSwarmCollaborating}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider transition-all border border-emerald-300 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSwarmCollaborating ? 'animate-spin' : ''}`} />
                {isSwarmCollaborating ? 'RUNNING SWARM DEBATE...' : 'TRIGGER SWARM DEBATE'}
              </button>
            </div>

            {swarmResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-zinc-900 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">CONSENSUS STATUS</p>
                    <p className="text-xs font-black text-emerald-400 mt-1">
                      {swarmResult.consensusReached ? 'PASSED & APPROVED' : 'REJECTED'}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">VOTE RATIO</p>
                    <p className="text-xs font-black text-white mt-1">{swarmResult.consensusRatio}</p>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">GLOBAL CONSENSUS SCORE</p>
                    <p className="text-xs font-black text-cyan-400 mt-1">
                      {swarmResult.globalConsensusScore} / 100
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase">
                    INDIVIDUAL SWARM AGENT PROPOSALS & DEBATE REASONING:
                  </p>
                  {swarmResult.agentDebates?.map((a: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{a.agent}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-500 px-1.5 py-0.2">
                            {a.role}
                          </span>
                        </div>
                        <p className="text-zinc-300 mt-1">{a.proposal}</p>
                        <p className="text-[11px] text-zinc-400 italic mt-0.5">
                          Reasoning: {a.reasoning}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-emerald-400 font-black text-xs uppercase block">
                          {a.vote}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          CONFIDENCE: {a.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: MEMORY & LEARNING SYSTEM */}
      {/* ------------------------------------------------------------- */}
      {coreMode === 'MEMORY_BANK' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New Memory */}
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              COMMIT NEW MEMORY / LEARNING NODE
            </h3>

            <form onSubmit={handleAddMemory} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Memory Title
                </label>
                <input
                  type="text"
                  value={newMemTitle}
                  onChange={e => setNewMemTitle(e.target.value)}
                  placeholder="e.g. Android 15 DataStore mandatory rule"
                  className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Category
                </label>
                <select
                  value={newMemCategory}
                  onChange={e => setNewMemCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="MANDELA_EFFECT">Mandela Effect Anomaly</option>
                  <option value="SECURITY_LEARNING">Security Guild Rule</option>
                  <option value="OPTIMIZATION_LEARNING">Optimization / ProGuard</option>
                  <option value="SYSTEM_PREFERENCE">System Preference</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Memory Content / Knowledge Statement
                </label>
                <textarea
                  value={newMemContent}
                  onChange={e => setNewMemContent(e.target.value)}
                  rows={4}
                  placeholder="Describe learned pattern or fact to store in server memory..."
                  className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white focus:border-emerald-400 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingMemory}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider transition-all border border-emerald-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50"
              >
                <Bookmark className="w-4 h-4" />
                {isSavingMemory ? 'SAVING MEMORY NODE...' : 'COMMIT TO MEMORY BANK'}
              </button>
            </form>
          </div>

          {/* Stored Memories List */}
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-400" />
                STORED MEMORIES ({memories.length})
              </h3>

              <input
                type="text"
                value={memorySearch}
                onChange={e => setMemorySearch(e.target.value)}
                placeholder="Search memories..."
                className="bg-zinc-900 border border-zinc-700 px-2.5 py-1 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {filteredMemories.length > 0 ? (
                filteredMemories.map(m => (
                  <div key={m.id} className="p-3 bg-zinc-900 border border-zinc-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{m.title}</span>
                      <button
                        onClick={() => handleDeleteMemory(m.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-zinc-300">{m.content}</p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/60 mt-1">
                      <span className="text-emerald-400 font-bold uppercase">{m.category}</span>
                      <span>{m.learnedAt}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-600 italic">
                  No memory nodes matched your search.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 6: FREE LLMS & OFFLINE AI MATRIX */}
      {/* ------------------------------------------------------------- */}
      {coreMode === 'FREE_LLM_HUB' && (
        <FreeAiMatrixPanel addLog={addLog} />
      )}
    </div>
  );
};
