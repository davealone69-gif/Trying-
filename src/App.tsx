import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ApkAuditor } from './components/ApkAuditor';
import { MatrixCoreConsole } from './components/MatrixCoreConsole';
import { DevatorLab } from './components/DevatorLab';
import { EvaluateorMatrix } from './components/EvaluateorMatrix';
import { MandelaCoreReality } from './components/MandelaCoreReality';
import { ModulesExplorer } from './components/ModulesExplorer';
import { GeminiMatrixAi } from './components/GeminiMatrixAi';
import { ImageToolsMatrix } from './components/ImageToolsMatrix';
import { MandelaKnowledgeMatrix } from './components/MandelaKnowledgeMatrix';
import {
  initialApkInfo,
  initialSwarmAgents,
  initialProposals,
  initialSystemFiles,
  initialLogs,
  defaultRealitySettings
} from './data/initialData';
import { RealitySettings, ApkBuildInfo, SwarmAgent, MutationProposal, TerminalLog } from './types';

export default function App() {
  const [reality, setReality] = useState<RealitySettings>(defaultRealitySettings);
  const [apkInfo, setApkInfo] = useState<ApkBuildInfo>(initialApkInfo);
  const [agents, setAgents] = useState<SwarmAgent[]>(initialSwarmAgents);
  const [proposals, setProposals] = useState<MutationProposal[]>(initialProposals);
  const [logs, setLogs] = useState<TerminalLog[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<string>('apk');
  const [isGlitching, setIsGlitching] = useState(false);

  const addLog = (log: Omit<TerminalLog, 'id' | 'timestamp'>) => {
    const newEntry: TerminalLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toTimeString().split(' ')[0]
    };
    setLogs(prev => [newEntry, ...prev]);
  };

  const triggerGlitchBurst = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 300);
  };

  const getThemeClass = () => {
    switch (reality.theme) {
      case 'HOT_CRIMSON':
        return 'selection:bg-[#FF0055] selection:text-white';
      case 'CYBER_YELLOW':
        return 'selection:bg-[#FFD700] selection:text-black';
      case 'ELECTRIC_CYAN':
        return 'selection:bg-[#00F0FF] selection:text-black';
      case 'LIME_NEON':
      default:
        return 'selection:bg-[#00FF66] selection:text-black';
    }
  };

  return (
    <div className={`min-h-screen bg-[#0A0A0C] text-zinc-100 font-mono relative overflow-x-hidden ${getThemeClass()} ${isGlitching ? 'animate-glitch' : ''}`}>
      {/* Optional CRT Scanlines Layer */}
      {reality.scanlines && (
        <div className="pointer-events-none fixed inset-0 z-50 crt-scanlines opacity-40"></div>
      )}

      {/* Main Navigation Header */}
      <Header
        reality={reality}
        setReality={setReality}
        apkInfo={apkInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        triggerGlitchBurst={triggerGlitchBurst}
      />

      {/* Viewport Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {activeTab === 'apk' && (
          <ApkAuditor
            apkInfo={apkInfo}
            setApkInfo={setApkInfo}
            addLog={addLog}
          />
        )}

        {activeTab === 'matrix' && (
          <MatrixCoreConsole
            agents={agents}
            setAgents={setAgents}
            logs={logs}
            addLog={addLog}
          />
        )}

        {activeTab === 'devator' && (
          <DevatorLab
            proposals={proposals}
            setProposals={setProposals}
            reality={reality}
            setReality={setReality}
            addLog={addLog}
          />
        )}

        {activeTab === 'evaluateor' && (
          <EvaluateorMatrix addLog={addLog} />
        )}

        {activeTab === 'mandela' && (
          <MandelaCoreReality
            reality={reality}
            setReality={setReality}
            addLog={addLog}
            triggerGlitchBurst={triggerGlitchBurst}
          />
        )}

        {activeTab === 'knowledge' && (
          <MandelaKnowledgeMatrix addLog={addLog} />
        )}

        {activeTab === 'images' && (
          <ImageToolsMatrix addLog={addLog} />
        )}

        {activeTab === 'modules' && (
          <ModulesExplorer files={initialSystemFiles} />
        )}

        {activeTab === 'gemini' && (
          <GeminiMatrixAi addLog={addLog} />
        )}
      </main>

      {/* Cyber-Brutalist Footer */}
      <footer className="border-t-2 border-zinc-800 bg-black py-4 px-6 text-center text-xs text-zinc-500 font-mono mt-12 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>MANDELA MATRIX OS &bull; ALL SYSTEMS OPERATIONAL</span>
        </div>
        <div>
          TARGET: <span className="text-amber-400 font-bold">{apkInfo.path}</span>
        </div>
      </footer>
    </div>
  );
}
