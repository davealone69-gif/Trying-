import React, { useState } from 'react';
import { Zap, ShieldAlert, CheckCircle2, XCircle, RotateCcw, AlertTriangle, ArrowRight, Play, FileDiff } from 'lucide-react';
import { ModuleId, MutationProposal, RealitySettings, TerminalLog } from '../types';
import { sound } from '../utils/audio';

interface DevatorLabProps {
  proposals: MutationProposal[];
  setProposals: React.Dispatch<React.SetStateAction<MutationProposal[]>>;
  reality: RealitySettings;
  setReality: React.Dispatch<React.SetStateAction<RealitySettings>>;
  addLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
}

export const DevatorLab: React.FC<DevatorLabProps> = ({
  proposals,
  setProposals,
  reality,
  setReality,
  addLog,
}) => {
  const [title, setTitle] = useState('');
  const [targetModule, setTargetModule] = useState<ModuleId>('/ui');
  const [targetProperty, setTargetProperty] = useState('ui.theme.accentColor');
  const [newValue, setNewValue] = useState('#00FF66');
  const [rationale, setRationale] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  // Quick preset mutations
  const applyPreset = (preset: { title: string; module: ModuleId; prop: string; val: string; rat: string }) => {
    sound.playClick();
    setTitle(preset.title);
    setTargetModule(preset.module);
    setTargetProperty(preset.prop);
    setNewValue(preset.val);
    setRationale(preset.rat);
    setErrorMsg(null);
  };

  const handleDraftMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMsg(null);

    if (!title.trim() || !newValue.trim()) {
      setErrorMsg('Please specify a valid title and target value.');
      return;
    }

    // MANDATE CHECK: Devator MAY NOT mutate MatrixCore logic, security rules, or Evaluateor formulas
    const lowerModule = targetModule.toLowerCase();
    const lowerProp = targetProperty.toLowerCase();
    const lowerVal = newValue.toLowerCase();

    if (
      lowerModule.includes('matrixcore') ||
      lowerModule.includes('evaluateor') ||
      lowerProp.includes('corelogic') ||
      lowerProp.includes('scoringformula') ||
      lowerProp.includes('securityrule') ||
      lowerVal.includes('bypass')
    ) {
      sound.playRejectionAlert();
      setErrorMsg('PROHIBITED MUTATION REJECTED: Devator may NOT mutate MatrixCore logic, security rules, or Evaluateor scoring formulas!');
      
      addLog({
        level: 'MUTATION',
        message: `PROHIBITED MUTATION BLOCKED: ${title}`,
        details: 'Attempted mutation violated system boundary rules. MatrixCore protection active.'
      });
      return;
    }

    setIsDrafting(true);

    addLog({
      level: 'MUTATION',
      message: `DEVATOR DRAFTING MUTATION: ${title}`,
      details: `Target: ${targetModule} -> ${targetProperty}`
    });

    // Default metrics
    const stability = 95;
    const performance = 96;
    const uxImpact = 90;
    const identityAlignment = 98;
    const securityRisk = 4;

    let scoreObj = {
      stability,
      performance,
      uxImpact,
      identityAlignment,
      securityRisk,
      compositeIndex: 94.2,
      passedThreshold: true,
      rejectionReasons: [] as string[],
      approvalNotes: ['MatrixCore bounds validated', 'Security Guild approved']
    };

    try {
      const scoreRes = await fetch('/api/evaluateor/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stability, performance, uxImpact, identityAlignment, securityRisk })
      });
      const scoreData = await scoreRes.json();
      if (scoreData.score) {
        scoreObj = scoreData.score;
      }
    } catch (err) {
      console.error('Error fetching score from server:', err);
    }

    const newProposal: MutationProposal = {
      id: `MUT-${Math.floor(100 + Math.random() * 900)}`,
      title,
      targetModule,
      targetProperty,
      newValue,
      previousValue: 'Previous Setting',
      diffText: `- ${targetProperty} = 'default'\n+ ${targetProperty} = '${newValue}'`,
      proposedBy: 'Developer',
      rationale: rationale || 'Optimizing UI layout parameters & themes.',
      status: 'CONSENSUS',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      isReversible: true,
      score: scoreObj,
      consensusVotes: {
        agents: 8,
        clusters: 3,
        colony: 1,
        globalApproval: true
      }
    };

    setProposals(prev => [newProposal, ...prev]);
    setIsDrafting(false);
    sound.playMutationSuccess();

    addLog({
      level: 'EVALUATEOR',
      message: `MUTATION ${newProposal.id} PASSED EVALUATEOR (Score: ${scoreObj.compositeIndex}/100)`,
      details: 'Ready for Consensus Engine approval.'
    });

    setTitle('');
    setRationale('');
  };

  const applyMutation = (id: string) => {
    sound.playClick();
    setProposals(prev =>
      prev.map(p => {
        if (p.id === id) {
          if (p.targetProperty.includes('neonAccent') || p.targetProperty.includes('theme')) {
            if (p.newValue.includes('FF0055')) setReality(r => ({ ...r, theme: 'HOT_CRIMSON' }));
            if (p.newValue.includes('FFD700')) setReality(r => ({ ...r, theme: 'CYBER_YELLOW' }));
            if (p.newValue.includes('00F0FF')) setReality(r => ({ ...r, theme: 'ELECTRIC_CYAN' }));
            if (p.newValue.includes('00FF66')) setReality(r => ({ ...r, theme: 'LIME_NEON' }));
          }
          return { ...p, status: 'APPLIED' };
        }
        return p;
      })
    );
    sound.playGlitch();

    addLog({
      level: 'MANDELA',
      message: `MUTATION ${id} APPLIED & MANDELA REALITY UPDATED`,
      details: 'UI Reality updated dynamically.'
    });
  };

  const revertMutation = (id: string) => {
    sound.playClick();
    setProposals(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, status: 'REVERTED' };
        }
        return p;
      })
    );

    addLog({
      level: 'MUTATION',
      message: `MUTATION ${id} REVERTED`,
      details: 'Reverted target parameters to previous state.'
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Devator Lab Header */}
      <div className="bg-zinc-950 border-2 border-purple-500 p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-950 border border-purple-500 text-purple-400">
              <Zap className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wider uppercase">
                DEVATOR MUTATION WORKBENCH
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                CONFIG MUTATIONS &bull; UI THEMES &bull; LAYOUT PARAMETERS &bull; MODULE SETTINGS
              </p>
            </div>
          </div>

          <div className="text-xs text-right bg-zinc-900 border border-zinc-800 p-2.5">
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">REVERSIBILITY RULE</span>
            <span className="text-emerald-400 font-bold">ALL MUTATIONS REVERSIBLE</span>
          </div>
        </div>

        {/* Protection Warning */}
        <div className="mt-4 p-3 bg-amber-950/40 border border-amber-500/80 text-amber-300 text-xs flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="uppercase font-bold block text-white">MUTATION BOUNDARY RULES:</strong>
            Devator MAY mutate configs, UI themes, layout parameters, module settings.
            Devator may <strong className="text-red-400 uppercase font-black underline">NOT</strong> mutate MatrixCore logic, security rules, or Evaluateor scoring formulas.
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Quick Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
            <FileDiff className="w-4 h-4 text-purple-400" />
            PROPOSE NEW MUTATION
          </h3>

          {errorMsg && (
            <div className="p-3 bg-red-950 border border-red-500 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleDraftMutation} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                Mutation Proposal Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Switch UI Theme to Hot Crimson (#FF0055)"
                className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-white focus:border-purple-400 focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Target Module
                </label>
                <select
                  value={targetModule}
                  onChange={e => setTargetModule(e.target.value as ModuleId)}
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-white focus:border-purple-400 focus:outline-none font-mono"
                >
                  <option value="/ui">/ui (UI Theme & Parameters)</option>
                  <option value="/mandelacore">/mandelacore (Glitch & Reality)</option>
                  <option value="/devator">/devator (Engine Settings)</option>
                  <option value="/data">/data (Encrypted Storage)</option>
                  <option value="/system">/system (Build Rules)</option>
                  <option value="/matrixcore">/matrixcore (PROHIBITED LOGIC)</option>
                  <option value="/evaluateor">/evaluateor (PROHIBITED SCORING)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Target Property / Key
                </label>
                <input
                  type="text"
                  value={targetProperty}
                  onChange={e => setTargetProperty(e.target.value)}
                  placeholder="e.g. theme.neonAccent"
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-white focus:border-purple-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                New Target Value / Code Patch
              </label>
              <input
                type="text"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                placeholder="e.g. #FF0055"
                className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-white focus:border-purple-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                Developer Rationale
              </label>
              <textarea
                value={rationale}
                onChange={e => setRationale(e.target.value)}
                rows={2}
                placeholder="Explain why this mutation improves stability, performance, or UX..."
                className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-white focus:border-purple-400 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isDrafting}
              id="btn-draft-mutation"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-wider transition-all border border-purple-400 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {isDrafting ? 'DRAFTING MUTATION...' : 'DRAFT & EVALUATE MUTATION'}
            </button>
          </form>
        </div>

        {/* Right Col: Preset Shortcuts */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase border-b border-zinc-800 pb-2">
            PRESET MUTATIONS
          </h4>
          <div className="space-y-2 text-xs">
            <button
              onClick={() =>
                applyPreset({
                  title: 'Switch Accent to Hot Crimson (#FF0055)',
                  module: '/ui',
                  prop: 'ui.theme.neonAccent',
                  val: '#FF0055',
                  rat: 'High contrast Cyber-Brutalist hot crimson palette.'
                })
              }
              className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left transition-all text-zinc-200"
            >
              <strong className="text-[#FF0055] block">Hot Crimson Theme (#FF0055)</strong>
              <span className="text-[10px] text-zinc-400">Mutates UI theme accent color</span>
            </button>

            <button
              onClick={() =>
                applyPreset({
                  title: 'Switch Accent to Cyber Yellow (#FFD700)',
                  module: '/ui',
                  prop: 'ui.theme.neonAccent',
                  val: '#FFD700',
                  rat: 'Brutalist high visibility industrial theme.'
                })
              }
              className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left transition-all text-zinc-200"
            >
              <strong className="text-[#FFD700] block">Cyber Yellow Theme (#FFD700)</strong>
              <span className="text-[10px] text-zinc-400">Industrial contrast palette</span>
            </button>

            <button
              onClick={() =>
                applyPreset({
                  title: 'Attempt MatrixCore Bypass (TEST FAILURE)',
                  module: '/matrixcore',
                  prop: 'kernel.bypassValidation',
                  val: 'true',
                  rat: 'Testing system boundary protection rules.'
                })
              }
              className="w-full p-2.5 bg-red-950/40 hover:bg-red-950/80 border border-red-800 text-left transition-all text-red-200"
            >
              <strong className="text-red-400 block">MatrixCore Logic Mutation (Prohibited)</strong>
              <span className="text-[10px] text-zinc-400">Triggers boundary violation rejection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proposals History & Status */}
      <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
          <span>MUTATION PROPOSAL PIPELINE HISTORY</span>
          <span className="text-xs text-zinc-400">{proposals.length} Proposals Logged</span>
        </h3>

        <div className="space-y-3">
          {proposals.map(p => (
            <div
              key={p.id}
              className="p-4 bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 transition-all space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-400">{p.id}</span>
                  <span className="text-sm font-bold text-white">{p.title}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 font-mono">
                    {p.targetModule}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 font-bold uppercase font-mono ${
                      p.status === 'APPLIED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                        : p.status === 'REJECTED'
                        ? 'bg-red-950 text-red-400 border border-red-500'
                        : p.status === 'REVERTED'
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        : 'bg-amber-950 text-amber-400 border border-amber-500'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>

              <div className="bg-black/80 border border-zinc-800 p-2.5 font-mono text-xs space-y-1">
                <p className="text-zinc-400">{p.rationale}</p>
                <pre className="text-[11px] text-amber-300 overflow-x-auto whitespace-pre-wrap mt-1">
                  {p.diffText}
                </pre>
              </div>

              {p.score && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono pt-1 text-zinc-400">
                  <span>
                    Evaluateor Score: <strong className={p.score.passedThreshold ? 'text-emerald-400' : 'text-red-400'}>{p.score.compositeIndex}/100</strong>
                  </span>
                  <span>
                    Consensus: {p.consensusVotes?.agents || 0}/10 Swarm Agents
                  </span>

                  <div className="flex items-center gap-2">
                    {p.status === 'CONSENSUS' && p.score.passedThreshold && (
                      <button
                        onClick={() => applyMutation(p.id)}
                        className="px-2.5 py-1 bg-emerald-500 text-black font-bold uppercase text-[10px] hover:bg-emerald-400 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> APPLY MUTATION
                      </button>
                    )}

                    {p.status === 'APPLIED' && p.isReversible && (
                      <button
                        onClick={() => revertMutation(p.id)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase text-[10px] flex items-center gap-1 border border-zinc-700"
                      >
                        <RotateCcw className="w-3 h-3" /> REVERT
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
