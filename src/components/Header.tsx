import React, { useState } from 'react';
import { Cpu, Zap, Volume2, VolumeX, ShieldCheck, FileCode, Radio, Flame, Eye, Image, BookOpen, Menu, X, Smartphone } from 'lucide-react';
import { RealitySettings, ApkBuildInfo } from '../types';
import { sound } from '../utils/audio';

interface HeaderProps {
  reality: RealitySettings;
  setReality: React.Dispatch<React.SetStateAction<RealitySettings>>;
  apkInfo: ApkBuildInfo;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  triggerGlitchBurst: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  reality,
  setReality,
  apkInfo,
  activeTab,
  setActiveTab,
  triggerGlitchBurst,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const next = !reality.soundEnabled;
    sound.enabled = next;
    setReality(prev => ({ ...prev, soundEnabled: next }));
    if (next) sound.playClick();
  };

  const navItems = [
    { id: 'apk', label: 'APK AUDITOR', icon: ShieldCheck, badge: 'R8/ProGuard' },
    { id: 'matrix', label: 'MATRIX CORE', icon: Cpu, badge: 'Kernel' },
    { id: 'devator', label: 'DEVATOR MUTATION', icon: Zap, badge: 'Draft' },
    { id: 'evaluateor', label: 'EVALUATEOR', icon: Flame, badge: 'Score Engine' },
    { id: 'mandela', label: 'MANDELA REALITY', icon: Radio, badge: 'Glitch' },
    { id: 'knowledge', label: 'KNOWLEDGE BANK', icon: BookOpen, badge: 'Mandela DB' },
    { id: 'images', label: 'IMAGE MATRIX', icon: Image, badge: 'Vision Tools' },
    { id: 'modules', label: 'MODULE ARCHITECTURE', icon: FileCode, badge: '8 Paths' },
    { id: 'gemini', label: 'AI ASSISTANT', icon: Eye, badge: 'Gemini 2.5' },
  ];

  // Mobile bottom quick bar subset
  const primaryMobileNav = navItems.slice(0, 5);

  const getThemeClass = () => {
    switch (reality.theme) {
      case 'HOT_CRIMSON':
        return 'border-[#FF0055] text-[#FF0055] shadow-[0_0_15px_rgba(255,0,85,0.25)]';
      case 'CYBER_YELLOW':
        return 'border-[#FFD700] text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.25)]';
      case 'ELECTRIC_CYAN':
        return 'border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)]';
      case 'LIME_NEON':
      default:
        return 'border-[#00FF66] text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.25)]';
    }
  };

  return (
    <header className="border-b-2 border-zinc-800 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Ticker Status Bar */}
      <div className="bg-black text-[11px] font-mono px-3 py-1.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            MATRIX_CORE OS v2.4.0
          </span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="text-zinc-300 font-semibold truncate max-w-xs sm:max-w-md">
            TARGET: <span className="text-amber-400 font-bold">{apkInfo.path}</span>
          </span>
          <span className="text-zinc-600 hidden md:inline">|</span>
          <span className="text-zinc-400 hidden md:inline">
            AAB: <span className="text-emerald-400 font-bold">SIGNED</span> | R8: <span className="text-emerald-400 font-bold">ACTIVE</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            id="btn-toggle-sound"
            className="min-h-[36px] px-2.5 py-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white bg-zinc-900 transition-colors flex items-center gap-1.5 text-[10px] uppercase font-bold rounded-lg"
            title="Toggle cyber sound effects"
          >
            {reality.soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> SOUND: ON
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" /> SOUND: OFF
              </>
            )}
          </button>

          {/* Glitch burst trigger button */}
          <button
            onClick={() => {
              sound.playGlitch();
              triggerGlitchBurst();
            }}
            id="btn-glitch-burst"
            className="min-h-[36px] px-3 py-1 bg-[#FF0055] hover:bg-red-600 text-white border border-red-400 font-bold uppercase text-[10px] tracking-wider transition-transform active:scale-95 flex items-center gap-1.5 rounded-lg shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 animate-bounce" /> REALITY SHIFT
          </button>

          {/* Mobile Menu Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-h-[36px] min-w-[36px] p-1.5 bg-zinc-900 border border-zinc-700 text-white rounded-lg flex items-center justify-center"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Banner Logo & Navigation */}
      <div className="px-4 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Logo Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 bg-black border-2 ${getThemeClass()} flex items-center justify-center font-black text-xl rounded-xl`}>
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black font-mono tracking-wider text-white uppercase flex items-center gap-2">
                  MANDELA <span className={reality.theme === 'HOT_CRIMSON' ? 'text-[#FF0055]' : reality.theme === 'CYBER_YELLOW' ? 'text-[#FFD700]' : reality.theme === 'ELECTRIC_CYAN' ? 'text-[#00F0FF]' : 'text-[#00FF66]'}>MATRIX OS</span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 uppercase font-bold rounded-full">
                  MATERIAL 3
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5 hidden sm:block">
                DEVATOR MUTATION ENGINE &bull; EVALUATEOR SCORING GUILD &bull; MANDELA REALITY SHIFTS
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Rail Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id);
                }}
                className={`min-h-[44px] px-3.5 py-2 border text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap rounded-xl ${
                  isActive
                    ? `bg-black ${getThemeClass()} border-2 shadow-md`
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse text-emerald-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer (Expanded view when toggled) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-bold text-zinc-400 uppercase px-1 mb-2">ALL MATRIX MODULES</p>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`min-h-[48px] p-2.5 border text-left text-xs font-bold uppercase flex items-center gap-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <div className="truncate">
                    <span className="block truncate">{item.label}</span>
                    <span className="text-[9px] text-zinc-500 block truncate">{item.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Bottom Fixed Bar (Material 3 Touch Friendly Navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-lg border-t-2 border-zinc-800 px-2 py-1 flex items-center justify-around shadow-2xl">
        {primaryMobileNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(item.id);
              }}
              className={`min-h-[48px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 bg-emerald-950/80 font-black border border-emerald-800/80'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-400' : ''}`} />
              <span className="text-[9px] font-bold uppercase tracking-tighter mt-0.5 truncate max-w-[64px]">
                {item.id}
              </span>
            </button>
          );
        })}
        {/* More Tab */}
        <button
          onClick={() => {
            sound.playClick();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className={`min-h-[48px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            mobileMenuOpen ? 'text-amber-400 bg-amber-950/80' : 'text-zinc-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter mt-0.5">MORE</span>
        </button>
      </div>
    </header>
  );
};
