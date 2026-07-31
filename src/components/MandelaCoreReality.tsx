import React, { useEffect, useRef } from 'react';
import { Radio, Zap, Palette, Tv, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { RealitySettings, TerminalLog } from '../types';
import { sound } from '../utils/audio';

interface MandelaCoreRealityProps {
  reality: RealitySettings;
  setReality: React.Dispatch<React.SetStateAction<RealitySettings>>;
  addLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
  triggerGlitchBurst: () => void;
}

export const MandelaCoreReality: React.FC<MandelaCoreRealityProps> = ({
  reality,
  setReality,
  addLog,
  triggerGlitchBurst,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Matrix Rain canvas animation
  useEffect(() => {
    if (!reality.matrixRain) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 240;

    const chars = '01MATRIXCOREMANDELADEVATOR010101';
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    let animId: number;

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 12, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = reality.theme === 'HOT_CRIMSON' ? '#FF0055' : reality.theme === 'CYBER_YELLOW' ? '#FFD700' : reality.theme === 'ELECTRIC_CYAN' ? '#00F0FF' : '#00FF66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [reality.matrixRain, reality.theme]);

  const handleGlitchChange = (val: number) => {
    setReality(prev => ({ ...prev, glitchIntensity: val }));
  };

  const selectTheme = (theme: RealitySettings['theme']) => {
    sound.playClick();
    setReality(prev => ({ ...prev, theme }));
    addLog({
      level: 'MANDELA',
      message: `MANDELA REALITY THEME SHIFTED: ${theme}`,
      details: 'Updated neon CSS variables & viewport canvas pass.'
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* MandelaCore Header */}
      <div className="bg-zinc-950 border-2 border-[#00F0FF] p-5 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950 border border-cyan-500 text-cyan-400">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wider uppercase">
                MANDELACORE REALITY ENGINE
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                TRANSITIONS &bull; GLITCH EFFECTS &bull; REALITY SHIFTS &bull; RENDER PASSES
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playGlitch();
              triggerGlitchBurst();
            }}
            id="btn-mandela-burst"
            className="px-4 py-2.5 bg-[#FF0055] hover:bg-red-600 text-white font-black uppercase text-xs tracking-wider border border-red-300 flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,85,0.4)]"
          >
            <Zap className="w-4 h-4 animate-bounce" /> TRIGGER GLITCH SHIFT
          </button>
        </div>

        {/* Matrix Rain Live Canvas */}
        <div className="mt-4 bg-black border border-zinc-800 relative overflow-hidden h-48">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-[10px] text-cyan-400 border border-cyan-500/50 uppercase font-bold">
            MANDELA MATRIX SHADER CANPASS: ACTIVE
          </div>
        </div>
      </div>

      {/* Settings Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Glitch Intensity & Display Effects */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            GLITCH & DISPLAY PARAMETERS
          </h3>

          <div className="space-y-4 text-xs">
            {/* Intensity */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-zinc-300 uppercase">Glitch Shift Intensity</span>
                <span className="text-cyan-400">{reality.glitchIntensity} %</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={reality.glitchIntensity}
                onChange={e => handleGlitchChange(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* CRT Scanlines Toggle */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">CRT Scanlines Overlay</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setReality(r => ({ ...r, scanlines: !r.scanlines }));
                }}
                className={`px-3 py-1 font-bold uppercase text-[10px] border ${
                  reality.scanlines
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-500'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}
              >
                {reality.scanlines ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Matrix Rain Background Toggle */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">Matrix Rain Animation</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setReality(r => ({ ...r, matrixRain: !r.matrixRain }));
                }}
                className={`px-3 py-1 font-bold uppercase text-[10px] border ${
                  reality.matrixRain
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-500'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}
              >
                {reality.matrixRain ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Theme Palettes */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Palette className="w-4 h-4 text-cyan-400" />
            CYBER-BRUTALIST COLOR SCHEMES
          </h3>

          <div className="space-y-3 text-xs">
            <button
              onClick={() => selectTheme('LIME_NEON')}
              className={`w-full p-3 border flex items-center justify-between transition-all ${
                reality.theme === 'LIME_NEON'
                  ? 'bg-black border-[#00FF66] text-[#00FF66]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <span className="w-3 h-3 bg-[#00FF66] inline-block border border-black"></span>
                <span>Lime Cyber Neon (#00FF66)</span>
              </div>
              {reality.theme === 'LIME_NEON' && <span className="font-black">ACTIVE</span>}
            </button>

            <button
              onClick={() => selectTheme('HOT_CRIMSON')}
              className={`w-full p-3 border flex items-center justify-between transition-all ${
                reality.theme === 'HOT_CRIMSON'
                  ? 'bg-black border-[#FF0055] text-[#FF0055]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <span className="w-3 h-3 bg-[#FF0055] inline-block border border-black"></span>
                <span>Hot Crimson Brutalist (#FF0055)</span>
              </div>
              {reality.theme === 'HOT_CRIMSON' && <span className="font-black">ACTIVE</span>}
            </button>

            <button
              onClick={() => selectTheme('CYBER_YELLOW')}
              className={`w-full p-3 border flex items-center justify-between transition-all ${
                reality.theme === 'CYBER_YELLOW'
                  ? 'bg-black border-[#FFD700] text-[#FFD700]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <span className="w-3 h-3 bg-[#FFD700] inline-block border border-black"></span>
                <span>Cyber Industrial Yellow (#FFD700)</span>
              </div>
              {reality.theme === 'CYBER_YELLOW' && <span className="font-black">ACTIVE</span>}
            </button>

            <button
              onClick={() => selectTheme('ELECTRIC_CYAN')}
              className={`w-full p-3 border flex items-center justify-between transition-all ${
                reality.theme === 'ELECTRIC_CYAN'
                  ? 'bg-black border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <span className="w-3 h-3 bg-[#00F0FF] inline-block border border-black"></span>
                <span>Electric Cyan Shift (#00F0FF)</span>
              </div>
              {reality.theme === 'ELECTRIC_CYAN' && <span className="font-black">ACTIVE</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
