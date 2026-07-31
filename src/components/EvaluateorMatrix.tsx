import React, { useState, useEffect } from 'react';
import { Flame, ShieldCheck, ShieldAlert, Sliders, CheckCircle2, XCircle, ArrowRight, Zap, Award } from 'lucide-react';
import { EvaluateorScore, TerminalLog } from '../types';
import { sound } from '../utils/audio';

interface EvaluateorMatrixProps {
  addLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
}

export const EvaluateorMatrix: React.FC<EvaluateorMatrixProps> = ({ addLog }) => {
  const [stability, setStability] = useState(95);
  const [performance, setPerformance] = useState(94);
  const [uxImpact, setUxImpact] = useState(92);
  const [identityAlignment, setIdentityAlignment] = useState(98);
  const [securityRisk, setSecurityRisk] = useState(4);
  const [threshold] = useState(85);
  const [serverScore, setServerScore] = useState<EvaluateorScore | null>(null);

  // Consensus pipeline simulation state
  const [consensusStep, setConsensusStep] = useState<'IDLE' | 'AGENTS' | 'CLUSTER' | 'COLONY' | 'GLOBAL' | 'APPROVED' | 'REJECTED'>('IDLE');

  const fetchServerScore = async () => {
    try {
      const res = await fetch('/api/evaluateor/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stability,
          performance,
          uxImpact,
          identityAlignment,
          securityRisk
        })
      });
      const data = await res.json();
      if (data.score) {
        setServerScore(data.score);
      }
    } catch (err) {
      console.error('Failed to fetch evaluateor score from backend:', err);
    }
  };

  useEffect(() => {
    fetchServerScore();
  }, [stability, performance, uxImpact, identityAlignment, securityRisk]);

  const calculateCompositeScore = (): EvaluateorScore => {
    if (serverScore) return serverScore;
    // Fallback formula
    const base = (stability * 0.35) + (performance * 0.25) + (uxImpact * 0.15) + (identityAlignment * 0.25);
    const compositeIndex = Math.max(0, Math.min(100, Number((base - (securityRisk * 0.4)).toFixed(1))));
    const passedThreshold = compositeIndex >= threshold && securityRisk <= 25;

    return {
      stability,
      performance,
      uxImpact,
      identityAlignment,
      securityRisk,
      compositeIndex,
      passedThreshold,
      rejectionReasons: securityRisk > 25 ? ['Security risk exceeded limit'] : [],
      approvalNotes: passedThreshold ? ['Threshold met'] : []
    };
  };

  const currentScore = calculateCompositeScore();

  const runConsensusPipeline = async () => {
    sound.playClick();
    setConsensusStep('AGENTS');
    addLog({
      level: 'EVALUATEOR',
      message: 'CONSENSUS PIPELINE STAGE 1: AGENT LEVEL VOTING INITIATED',
      details: '10 Coroutine Swarm Agents casting votes based on Evaluateor metrics.'
    });

    await new Promise(r => setTimeout(r, 700));
    if (!currentScore.passedThreshold) {
      setConsensusStep('REJECTED');
      sound.playRejectionAlert();
      addLog({
        level: 'EVALUATEOR',
        message: 'CONSENSUS PIPELINE REJECTED: Score below threshold.',
        details: currentScore.rejectionReasons.join(' | ')
      });
      return;
    }

    setConsensusStep('CLUSTER');
    sound.playClick();
    addLog({
      level: 'EVALUATEOR',
      message: 'CONSENSUS PIPELINE STAGE 2: CLUSTER APPROVAL',
      details: 'Cluster leaders verifying security rules & R8 optimization.'
    });

    await new Promise(r => setTimeout(r, 800));
    setConsensusStep('COLONY');
    sound.playClick();
    addLog({
      level: 'EVALUATEOR',
      message: 'CONSENSUS PIPELINE STAGE 3: COLONY CONSENSUS',
      details: 'Colony consensus engine verifying reversible mutation bounds.'
    });

    await new Promise(r => setTimeout(r, 800));
    setConsensusStep('GLOBAL');
    addLog({
      level: 'EVALUATEOR',
      message: 'CONSENSUS PIPELINE STAGE 4: GLOBAL APPROVAL',
      details: 'Global Arbiter final sign-off.'
    });

    await new Promise(r => setTimeout(r, 600));
    setConsensusStep('APPROVED');
    sound.playMutationSuccess();
    addLog({
      level: 'EVALUATEOR',
      message: 'MUTATION APPROVED BY GLOBAL CONSENSUS ENGINE',
      details: 'Ready for MandelaCore reality update.'
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Evaluateor Header */}
      <div className="bg-zinc-950 border-2 border-amber-500 p-5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-950 border border-amber-500 text-amber-400">
              <Flame className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wider uppercase">
                EVALUATEOR SCORING ENGINE
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                STABILITY &bull; PERFORMANCE &bull; UX IMPACT &bull; IDENTITY ALIGNMENT &bull; SECURITY RISK
              </p>
            </div>
          </div>

          <div className="text-right bg-zinc-900 border border-zinc-800 p-3">
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Passing Threshold</span>
            <span className="text-2xl font-black text-amber-400">{threshold}.0 / 100</span>
          </div>
        </div>

        {/* Dynamic Composite Score Result */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-black border border-zinc-800 p-4">
          <div className="md:col-span-1 flex flex-col justify-center items-center p-3 border border-zinc-800 bg-zinc-900/60">
            <span className="text-zinc-400 text-xs font-bold uppercase mb-1">Composite Quality Index</span>
            <span
              className={`text-4xl font-black ${
                currentScore.passedThreshold ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {currentScore.compositeIndex}
            </span>
            <span className="text-[10px] text-zinc-500 mt-1">
              Formula: 0.35*S + 0.25*P + 0.15*UX + 0.25*ID - 0.4*Sec
            </span>
          </div>

          <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-white">Status:</span>
              {currentScore.passedThreshold ? (
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500 text-xs font-black flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> APPROVED FOR CONSENSUS
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-red-950 text-red-400 border border-red-500 text-xs font-black flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> REJECTED BY EVALUATEOR
                </span>
              )}
            </div>

            {currentScore.rejectionReasons.length > 0 && (
              <div className="text-xs text-red-400 font-bold space-y-1">
                {currentScore.rejectionReasons.map((r, i) => (
                  <p key={i}>&bull; {r}</p>
                ))}
              </div>
            )}

            {currentScore.approvalNotes.length > 0 && (
              <div className="text-xs text-emerald-400 space-y-0.5">
                {currentScore.approvalNotes.map((n, i) => (
                  <p key={i}>&bull; {n}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Scoring Vector Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            SCORING VECTORS (EVALUATEOR MATRIX)
          </h3>

          <div className="space-y-4 text-xs">
            {/* Stability */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-300 uppercase">1. Stability (35% weight)</span>
                <span className="text-emerald-400">{stability} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={stability}
                onChange={e => setStability(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            {/* Performance */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-300 uppercase">2. Performance (25% weight)</span>
                <span className="text-emerald-400">{performance} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={performance}
                onChange={e => setPerformance(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            {/* UX Impact */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-300 uppercase">3. UX Impact (15% weight)</span>
                <span className="text-emerald-400">{uxImpact} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={uxImpact}
                onChange={e => setUxImpact(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            {/* Identity Alignment */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-300 uppercase">4. Cyber-Brutalist Identity (25% weight)</span>
                <span className="text-emerald-400">{identityAlignment} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={identityAlignment}
                onChange={e => setIdentityAlignment(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            {/* Security Risk */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-300 uppercase">5. Security Risk (-40% penalty)</span>
                <span className={securityRisk > 25 ? 'text-red-400 font-black' : 'text-emerald-400'}>
                  {securityRisk} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={securityRisk}
                onChange={e => setSecurityRisk(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          </div>
        </div>

        {/* Consensus Engine Stepper */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase flex items-center justify-between border-b border-zinc-800 pb-3">
            <span>CONSENSUS ENGINE PIPELINE</span>
            <span className="text-xs text-amber-400 font-bold">4-STAGE APPROVAL</span>
          </h3>

          <p className="text-xs text-zinc-400">
            Consensus Engine Rule: <strong className="text-amber-300">agent &rarr; cluster &rarr; colony &rarr; global approval</strong> before any mutation is applied.
          </p>

          <div className="space-y-2 text-xs">
            <div
              className={`p-3 border flex items-center justify-between ${
                consensusStep === 'AGENTS' || consensusStep === 'CLUSTER' || consensusStep === 'COLONY' || consensusStep === 'GLOBAL' || consensusStep === 'APPROVED'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <span>1. Swarm Agent Votes (10 Coroutines)</span>
              <span className="font-bold">10/10 VOTED</span>
            </div>

            <div
              className={`p-3 border flex items-center justify-between ${
                consensusStep === 'CLUSTER' || consensusStep === 'COLONY' || consensusStep === 'GLOBAL' || consensusStep === 'APPROVED'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <span>2. Cluster Validation (3 Leader Nodes)</span>
              <span className="font-bold">3/3 APPROVED</span>
            </div>

            <div
              className={`p-3 border flex items-center justify-between ${
                consensusStep === 'COLONY' || consensusStep === 'GLOBAL' || consensusStep === 'APPROVED'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <span>3. Colony Consensus Engine</span>
              <span className="font-bold">VERIFIED</span>
            </div>

            <div
              className={`p-3 border flex items-center justify-between ${
                consensusStep === 'GLOBAL' || consensusStep === 'APPROVED'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <span>4. Global Arbiter Approval</span>
              <span className="font-bold">FINAL SIGN-OFF</span>
            </div>
          </div>

          <button
            onClick={runConsensusPipeline}
            id="btn-run-consensus"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider transition-all border border-amber-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Zap className="w-4 h-4 fill-current" />
            EXECUTE CONSENSUS ENGINE VOTE
          </button>
        </div>
      </div>
    </div>
  );
};
