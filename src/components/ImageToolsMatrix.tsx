import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  Sparkles,
  Sliders,
  Maximize2,
  Download,
  Eye,
  Zap,
  Box,
  UserCheck,
  Layers,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Grid,
  Palette,
  Scan,
  Scissors
} from 'lucide-react';
import { TerminalLog } from '../types';
import { sound } from '../utils/audio';

interface ImageToolsMatrixProps {
  addLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
}

// Default Cyber-Brutalist sample image generator using canvas
const createSampleMatrixCanvas = (theme: string = 'LIME_NEON'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, 600, 400);

  // Cyber Grid
  ctx.strokeStyle = '#181824';
  ctx.lineWidth = 1;
  for (let x = 0; x < 600; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 400);
    ctx.stroke();
  }
  for (let y = 0; y < 400; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }

  // Neon Accent Circle & Matrix Symbol
  ctx.fillStyle = theme === 'HOT_CRIMSON' ? '#FF0055' : theme === 'CYBER_YELLOW' ? '#FFD700' : theme === 'ELECTRIC_CYAN' ? '#00F0FF' : '#00FF66';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 20;

  ctx.beginPath();
  ctx.arc(300, 200, 80, 0, Math.PI * 2);
  ctx.fill();

  // Face / Cyber Mask representation
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(270, 180, 12, 0, Math.PI * 2);
  ctx.arc(330, 180, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillRect(260, 220, 80, 8);

  // Text overlay
  ctx.shadowBlur = 0;
  ctx.font = '900 24px monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('MANDELA MATRIX OS v2.4', 140, 60);

  ctx.font = '12px monospace';
  ctx.fillStyle = '#888888';
  ctx.fillText('TARGET_NODE: CYBER_ENTITY_01 | COMPRESSION: LOSSLESS', 120, 360);

  return canvas.toDataURL('image/png');
};

export const ImageToolsMatrix: React.FC<ImageToolsMatrixProps> = ({ addLog }) => {
  // Main tool section tabs
  const [activeSubTab, setActiveSubTab] = useState<
    'GLITCH_REALITY' | 'COMPARE' | 'AI_ENHANCE' | 'DETECTION' | 'STYLE_TRANSFER' | 'BATCH'
  >('GLITCH_REALITY');

  // Image source states
  const [originalImage, setOriginalImage] = useState<string>(() => createSampleMatrixCanvas('LIME_NEON'));
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Glitch & Reality Controls
  const [rgbSplit, setRgbSplit] = useState(15);
  const [noiseIntensity, setNoiseIntensity] = useState(25);
  const [scanlineDensity, setScanlineDensity] = useState(40);
  const [colorFilter, setColorFilter] = useState<'NEON_LIME' | 'CRIMSON_WAR' | 'CYAN_PULSE' | 'INVERT' | 'MONO'>('NEON_LIME');
  const [glitchBlocks, setGlitchBlocks] = useState(12);

  // Comparison Slider Position (0 to 100%)
  const [sliderPos, setSliderPos] = useState(50);

  // AI Enhancement controls
  const [enhancementLevel, setEnhancementLevel] = useState<'BALANCED' | 'HIGH_CONTRAST' | 'ULTRA_SHARP' | 'NEON_HDR'>('NEON_HDR');
  const [denoise, setDenoise] = useState(true);

  // Object & Face Detection states
  const [showObjectBoxes, setShowObjectBoxes] = useState(true);
  const [showFaceLandmarks, setShowFaceLandmarks] = useState(true);
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  const [detectedFaces, setDetectedFaces] = useState<any[]>([]);

  // Style Transfer selection
  const [selectedStyle, setSelectedStyle] = useState<'MATRIX_RAIN' | 'CYBER_BRUTALIST' | 'CRIMSON_SYNTH' | 'THERMAL' | 'NOIR'>('CYBER_BRUTALIST');

  // Batch Processing State
  const [batchFiles, setBatchFiles] = useState<
    { name: string; size: string; status: 'PENDING' | 'PROCESSING' | 'COMPLETED'; progress: number }[]
  >([
    { name: 'matrix_core_schema.png', size: '1.2 MB', status: 'COMPLETED', progress: 100 },
    { name: 'app_icon_art.png', size: '850 KB', status: 'COMPLETED', progress: 100 },
    { name: 'apk_architecture_diagram.png', size: '2.4 MB', status: 'PENDING', progress: 0 }
  ]);
  const [exportScale, setExportScale] = useState<number>(2); // 1x, 2x, 4x

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Apply visual glitch & transformation effects on Canvas
  const applyImageTransformations = () => {
    if (!originalImage) return;

    setIsProcessing(true);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = originalImage;

    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Draw original
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // 1. Color Filters & Inversion
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        if (colorFilter === 'NEON_LIME') {
          data[i] = r * 0.2;
          data[i + 1] = Math.min(255, g * 1.5 + 40);
          data[i + 2] = b * 0.3;
        } else if (colorFilter === 'CRIMSON_WAR') {
          data[i] = Math.min(255, r * 1.8 + 50);
          data[i + 1] = g * 0.2;
          data[i + 2] = b * 0.3;
        } else if (colorFilter === 'CYAN_PULSE') {
          data[i] = r * 0.1;
          data[i + 1] = Math.min(255, g * 1.4 + 30);
          data[i + 2] = Math.min(255, b * 1.6 + 50);
        } else if (colorFilter === 'INVERT') {
          data[i] = 255 - r;
          data[i + 1] = 255 - g;
          data[i + 2] = 255 - b;
        } else if (colorFilter === 'MONO') {
          const avg = (r + g + b) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }

        // Noise addition
        if (noiseIntensity > 0 && Math.random() < noiseIntensity / 100) {
          const n = (Math.random() - 0.5) * 80;
          data[i] = Math.max(0, Math.min(255, data[i] + n));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // 2. RGB Split Shift
      if (rgbSplit > 0) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 0, 85, 0.4)';
        ctx.fillRect(-rgbSplit, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 255, 102, 0.4)';
        ctx.fillRect(rgbSplit, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }

      // 3. Glitch Block Slices
      if (glitchBlocks > 0) {
        for (let b = 0; b < glitchBlocks; b++) {
          const sliceY = Math.floor(Math.random() * (canvas.height - 20));
          const sliceH = Math.floor(Math.random() * 20) + 5;
          const shiftX = (Math.random() - 0.5) * 40;
          const sliceData = ctx.getImageData(0, sliceY, canvas.width, sliceH);
          ctx.putImageData(sliceData, shiftX, sliceY);
        }
      }

      // 4. Scanlines overlay
      if (scanlineDensity > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        for (let y = 0; y < canvas.height; y += 4) {
          ctx.fillRect(0, y, canvas.width, 1);
        }
      }

      const resultUrl = canvas.toDataURL('image/png');
      setProcessedImage(resultUrl);
      setIsProcessing(false);
    };
  };

  useEffect(() => {
    applyImageTransformations();
    runObjectAndFaceDetection();
  }, [originalImage, rgbSplit, noiseIntensity, scanlineDensity, colorFilter, glitchBlocks, enhancementLevel, selectedStyle]);

  // Object and Face Detection Simulation / AI Extraction
  const runObjectAndFaceDetection = () => {
    setDetectedObjects([
      { id: 'obj-1', label: 'MATRIX_CORE_CHIP', confidence: 99.2, bbox: [120, 80, 180, 160] },
      { id: 'obj-2', label: 'CYBER_TERMINAL_NODE', confidence: 96.8, bbox: [320, 140, 220, 180] },
      { id: 'obj-3', label: 'ENCRYPTED_DATASTORE', confidence: 94.5, bbox: [40, 280, 160, 90] }
    ]);

    setDetectedFaces([
      {
        id: 'face-1',
        confidence: 98.4,
        bbox: [240, 140, 120, 120],
        landmarks: { leftEye: [270, 180], rightEye: [330, 180], nose: [300, 200], mouth: [300, 230] },
        expression: 'ANALYTICAL_MATRIX'
      }
    ]);
  };

  // Handle custom image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playClick();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOriginalImage(event.target.result as string);
          addLog({
            level: 'SYSTEM',
            message: `CUSTOM IMAGE INGESTED (${file.name})`,
            details: `Size: ${(file.size / 1024).toFixed(1)} KB | Type: ${file.type}`
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // High Resolution Export Handler
  const handleExportHighRes = () => {
    sound.playClick();
    const sourceImg = processedImage || originalImage;
    if (!sourceImg) return;

    const img = new window.Image();
    img.src = sourceImg;
    img.onload = () => {
      const expCanvas = document.createElement('canvas');
      expCanvas.width = img.width * exportScale;
      expCanvas.height = img.height * exportScale;
      const ctx = expCanvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false; // Sharp brutalist pixel style
        ctx.drawImage(img, 0, 0, expCanvas.width, expCanvas.height);

        // Watermark embed
        ctx.fillStyle = '#00FF66';
        ctx.font = `${14 * exportScale}px monospace`;
        ctx.fillText(`MANDELA_MATRIX_OS_v2.4 [HI-RES ${exportScale}X]`, 20 * exportScale, expCanvas.height - (20 * exportScale));

        const dataUrl = expCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `matrix_processed_${Date.now()}_${exportScale}x.png`;
        link.href = dataUrl;
        link.click();

        sound.playMutationSuccess();
        addLog({
          level: 'SYSTEM',
          message: `HIGH-RES IMAGE EXPORTED (${expCanvas.width}x${expCanvas.height}px)`,
          details: `Scale: ${exportScale}x | Format: PNG Lossless`
        });
      }
    };
  };

  // Trigger Batch Processing
  const runBatchProcessing = async () => {
    sound.playClick();
    setBatchFiles(prev => prev.map(f => ({ ...f, status: 'PROCESSING', progress: 10 })));

    for (let i = 0; i < batchFiles.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setBatchFiles(prev =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'COMPLETED', progress: 100 } : f))
      );
    }

    sound.playMutationSuccess();
    addLog({
      level: 'SYSTEM',
      message: 'BATCH IMAGE PROCESSING COMPLETED',
      details: 'Processed 3 matrix image assets with target cyber-brutalist transforms.'
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Hidden canvas element for image manipulations */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Header */}
      <div className="bg-zinc-950 border-2 border-emerald-500 p-5 shadow-[0_0_20px_rgba(0,255,102,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-400">
              <Image className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wider uppercase">
                MATRIX IMAGE & REALITY VISION TOOLS
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                GLITCH EFFECTS &bull; REALITY SHIFT &bull; BEFORE/AFTER SLIDER &bull; AI ENHANCEMENT &bull; OBJECT & FACE DETECTION &bull; HIGH-RES EXPORT
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-bold uppercase cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              UPLOAD IMAGE
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            <button
              onClick={() => {
                sound.playClick();
                setOriginalImage(createSampleMatrixCanvas('LIME_NEON'));
              }}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              RESET SAMPLE
            </button>

            <button
              onClick={handleExportHighRes}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black border border-emerald-300 text-xs uppercase flex items-center gap-2 shadow-[0_0_12px_rgba(0,255,102,0.3)]"
            >
              <Download className="w-4 h-4" />
              EXPORT HI-RES ({exportScale}X)
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'GLITCH_REALITY', label: '1. Glitch & Reality Shifts', icon: Zap },
            { id: 'COMPARE', label: '2. Before / After Slider', icon: Maximize2 },
            { id: 'AI_ENHANCE', label: '3. AI Image Enhance', icon: Sparkles },
            { id: 'DETECTION', label: '4. Object & Face Vision', icon: Scan },
            { id: 'STYLE_TRANSFER', label: '5. Style Transfer', icon: Palette },
            { id: 'BATCH', label: '6. Batch Processor', icon: Grid }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveSubTab(tab.id as any);
                }}
                className={`px-3.5 py-2 text-xs font-bold uppercase border flex items-center gap-2 transition-all ${
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
      {/* 1. GLITCH & REALITY SHIFT TRANSFORMATIONS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'GLITCH_REALITY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              GLITCH & REALITY PARAMETERS
            </h3>

            {/* RGB Split Slider */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-400 uppercase">RGB Split Intensity</span>
                <span className="text-emerald-400">{rgbSplit}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={rgbSplit}
                onChange={e => setRgbSplit(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900"
              />
            </div>

            {/* Noise Intensity */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-400 uppercase">Digital Noise Grain</span>
                <span className="text-emerald-400">{noiseIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={noiseIntensity}
                onChange={e => setNoiseIntensity(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900"
              />
            </div>

            {/* Glitch Slices */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-400 uppercase">Matrix Block Displacements</span>
                <span className="text-emerald-400">{glitchBlocks} slices</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={glitchBlocks}
                onChange={e => setGlitchBlocks(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900"
              />
            </div>

            {/* Scanlines */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-400 uppercase">CRT Scanline Grid</span>
                <span className="text-emerald-400">{scanlineDensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={scanlineDensity}
                onChange={e => setScanlineDensity(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900"
              />
            </div>

            {/* Reality Shift Color Filter */}
            <div className="space-y-2 text-xs pt-2 border-t border-zinc-800">
              <label className="block text-zinc-400 font-bold uppercase">
                Reality Shift Palette
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'NEON_LIME', label: 'Lime Cyber' },
                  { id: 'CRIMSON_WAR', label: 'Hot Crimson' },
                  { id: 'CYAN_PULSE', label: 'Electric Cyan' },
                  { id: 'INVERT', label: 'Matrix Invert' },
                  { id: 'MONO', label: 'High Contrast' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      sound.playClick();
                      setColorFilter(f.id as any);
                    }}
                    className={`py-2 px-2 text-[11px] font-bold uppercase border text-center transition-all ${
                      colorFilter === f.id
                        ? 'bg-emerald-500 text-black border-emerald-300'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Visualizer Stage */}
          <div className="lg:col-span-2 bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                TRANSFORMED MATRIX CANVAS
              </h3>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950 border border-emerald-500 px-2 py-0.5">
                {colorFilter} | RGB: {rgbSplit}px
              </span>
            </div>

            {/* Image Preview Window */}
            <div className="relative border-2 border-zinc-800 bg-black flex items-center justify-center p-2 min-h-[350px] overflow-hidden">
              {processedImage ? (
                <img
                  src={processedImage}
                  alt="Transformed Matrix Asset"
                  className="max-h-[360px] w-auto object-contain shadow-2xl"
                />
              ) : (
                <div className="text-zinc-600 italic text-xs">Rendering transformed matrix image...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. BEFORE / AFTER COMPARISON SLIDER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'COMPARE' && (
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-zinc-800 pb-3 gap-2">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-emerald-400" />
              INTERACTIVE BEFORE / AFTER REALITY COMPARISON
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              SLIDER SPLIT: <span className="text-emerald-400 font-bold">{sliderPos}%</span>
            </span>
          </div>

          {/* Interactive Comparison Slider Container */}
          <div className="relative w-full h-[400px] bg-black border-2 border-zinc-800 overflow-hidden select-none">
            {/* Processed (After) Image - Full Width Background */}
            <img
              src={processedImage || originalImage}
              alt="After Transformation"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Original (Before) Image - Clipped Overlay */}
            <div
              className="absolute top-0 left-0 bottom-0 overflow-hidden border-r-2 border-emerald-400 shadow-[0_0_15px_#00FF66]"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={originalImage}
                alt="Before Transformation"
                className="absolute top-0 left-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
              {/* BEFORE Label */}
              <span className="absolute top-3 left-3 bg-black/80 text-emerald-400 border border-emerald-500 font-bold text-[10px] px-2 py-1 uppercase">
                BEFORE (BASELINE)
              </span>
            </div>

            {/* AFTER Label */}
            <span className="absolute top-3 right-3 bg-black/80 text-amber-400 border border-amber-500 font-bold text-[10px] px-2 py-1 uppercase">
              AFTER (MUTATED)
            </span>

            {/* Slider Range Control Bar */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={e => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
          </div>

          <p className="text-xs text-zinc-400 text-center italic">
            Drag cursor or touch slider horizontally across the view to compare original timeline baseline vs glitched matrix transformation.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. AI IMAGE ENHANCEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'AI_ENHANCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              AI MATRIX IMAGE ENHANCEMENT ENGINE
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-2">
                  Enhancement Profile
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'NEON_HDR', label: 'Neon Cyber HDR', desc: 'Maximizes contrast & luminous highlights' },
                    { id: 'HIGH_CONTRAST', label: 'Brutalist Contrast', desc: 'Sharp black & white separation' },
                    { id: 'ULTRA_SHARP', label: 'Edge Sharpening', desc: 'Enhances text & architecture vectors' },
                    { id: 'BALANCED', label: 'Balanced Matrix', desc: 'Subtle noise reduction & clarity' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        sound.playClick();
                        setEnhancementLevel(p.id as any);
                      }}
                      className={`p-3 text-left border font-mono transition-all ${
                        enhancementLevel === p.id
                          ? 'bg-emerald-500 text-black border-emerald-300 font-black'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
                      }`}
                    >
                      <p className="font-bold text-xs uppercase">{p.label}</p>
                      <p className="text-[10px] opacity-80 mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800">
                <span className="font-bold text-zinc-300 uppercase">AI Denoise & Artifact Cleaner</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setDenoise(!denoise);
                  }}
                  className={`px-3 py-1 font-bold text-xs border ${
                    denoise ? 'bg-emerald-950 text-emerald-400 border-emerald-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {denoise ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  applyImageTransformations();
                  sound.playMutationSuccess();
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider transition-all border border-emerald-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)]"
              >
                <Sparkles className="w-4 h-4" />
                EXECUTE AI ENHANCEMENT PASS
              </button>
            </div>
          </div>

          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span>ENHANCED OUTPUT PREVIEW</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">{enhancementLevel}</span>
            </h3>

            <div className="border-2 border-zinc-800 bg-black p-2 flex items-center justify-center min-h-[280px]">
              <img
                src={processedImage || originalImage}
                alt="Enhanced preview"
                className="max-h-[300px] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. OBJECT & FACE DETECTION */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'DETECTION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Scan className="w-4 h-4 text-emerald-400" />
              VISION DETECTION OVERLAYS
            </h3>

            <div className="space-y-3 text-xs">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowObjectBoxes(!showObjectBoxes);
                }}
                className={`w-full p-3 border font-bold uppercase flex items-center justify-between transition-all ${
                  showObjectBoxes ? 'bg-emerald-950 text-emerald-400 border-emerald-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Box className="w-4 h-4" /> OBJECT BOUNDING BOXES
                </span>
                <span>{showObjectBoxes ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setShowFaceLandmarks(!showFaceLandmarks);
                }}
                className={`w-full p-3 border font-bold uppercase flex items-center justify-between transition-all ${
                  showFaceLandmarks ? 'bg-cyan-950 text-cyan-400 border-cyan-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> FACIAL MESH & LANDMARKS
                </span>
                <span>{showFaceLandmarks ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-3 space-y-2 text-xs">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">DETECTED METADATA SUMMARY</p>
              <div className="space-y-1">
                {detectedObjects.map(o => (
                  <div key={o.id} className="flex justify-between text-[11px]">
                    <span className="text-white font-bold">{o.label}</span>
                    <span className="text-emerald-400 font-bold">{o.confidence}%</span>
                  </div>
                ))}
                {detectedFaces.map(f => (
                  <div key={f.id} className="flex justify-between text-[11px] pt-1 border-t border-zinc-800">
                    <span className="text-cyan-400 font-bold">FACE_ENTITY_01 ({f.expression})</span>
                    <span className="text-cyan-400 font-bold">{f.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vision Canvas Stage */}
          <div className="lg:col-span-2 bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span>LIVE AI VISION STAGE</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">3 OBJECTS &bull; 1 FACE</span>
            </h3>

            <div className="relative border-2 border-zinc-800 bg-black flex items-center justify-center p-2 min-h-[350px]">
              <img
                src={originalImage}
                alt="Original stage"
                className="max-h-[360px] w-auto object-contain"
              />

              {/* Object Bounding Boxes Overlay */}
              {showObjectBoxes && (
                <>
                  <div className="absolute border-2 border-emerald-400 bg-emerald-500/10 pointer-events-none" style={{ left: '20%', top: '20%', width: '30%', height: '40%' }}>
                    <span className="absolute -top-5 left-0 bg-emerald-500 text-black font-black text-[9px] px-1 py-0.5 uppercase">
                      MATRIX_CORE_CHIP [99.2%]
                    </span>
                  </div>
                  <div className="absolute border-2 border-amber-400 bg-amber-500/10 pointer-events-none" style={{ left: '55%', top: '35%', width: '35%', height: '45%' }}>
                    <span className="absolute -top-5 left-0 bg-amber-500 text-black font-black text-[9px] px-1 py-0.5 uppercase">
                      CYBER_TERMINAL_NODE [96.8%]
                    </span>
                  </div>
                </>
              )}

              {/* Face Landmark Mesh Overlay */}
              {showFaceLandmarks && (
                <div className="absolute border-2 border-cyan-400 bg-cyan-500/15 rounded-full pointer-events-none flex items-center justify-center" style={{ left: '40%', top: '35%', width: '20%', height: '30%' }}>
                  <span className="absolute -top-5 bg-cyan-400 text-black font-black text-[9px] px-1 py-0.5 uppercase">
                    FACE_LANDMARKS [98.4%]
                  </span>
                  {/* Cyber mesh keypoints */}
                  <div className="w-2 h-2 rounded-full bg-cyan-300 absolute top-4 left-6"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-300 absolute top-4 right-6"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 absolute top-8"></div>
                  <div className="w-6 h-1 bg-cyan-300 absolute bottom-4"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. STYLE TRANSFER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'STYLE_TRANSFER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'CYBER_BRUTALIST', label: 'Cyber Brutalism', color: 'border-emerald-500 text-emerald-400' },
              { id: 'MATRIX_RAIN', label: 'Matrix Digital Rain', color: 'border-green-500 text-green-400' },
              { id: 'CRIMSON_SYNTH', label: 'Crimson Synthwave', color: 'border-red-500 text-red-400' },
              { id: 'THERMAL', label: 'Thermal Infrared', color: 'border-amber-500 text-amber-400' },
              { id: 'NOIR', label: 'Noir High-Contrast', color: 'border-zinc-400 text-zinc-200' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedStyle(s.id as any);
                  if (s.id === 'CYBER_BRUTALIST') setColorFilter('NEON_LIME');
                  if (s.id === 'CRIMSON_SYNTH') setColorFilter('CRIMSON_WAR');
                  if (s.id === 'THERMAL') setColorFilter('CYAN_PULSE');
                  if (s.id === 'NOIR') setColorFilter('MONO');
                }}
                className={`p-3 border font-mono font-bold text-xs uppercase text-center transition-all ${
                  selectedStyle === s.id
                    ? 'bg-zinc-900 border-2 font-black shadow-[0_0_15px_rgba(255,255,255,0.1)] ' + s.color
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span>STYLE TRANSFER COMPOSITOR</span>
              <span className="text-xs text-emerald-400 font-bold">{selectedStyle}</span>
            </h3>

            <div className="border-2 border-zinc-800 bg-black p-2 flex items-center justify-center min-h-[300px]">
              <img
                src={processedImage || originalImage}
                alt="Style Transfer Output"
                className="max-h-[340px] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. BATCH PROCESSOR */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'BATCH' && (
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Grid className="w-4 h-4 text-emerald-400" />
              BATCH ASSET PROCESSING QUEUE
            </h3>

            <button
              onClick={runBatchProcessing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider transition-all border border-emerald-300 flex items-center gap-2 shadow-[0_0_12px_rgba(0,255,102,0.3)]"
            >
              <Zap className="w-4 h-4" />
              RUN BATCH TRANSFORMATIONS
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-800">
              <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-2.5 border-b border-zinc-800">Asset File Name</th>
                  <th className="p-2.5 border-b border-zinc-800">Size</th>
                  <th className="p-2.5 border-b border-zinc-800">Progress</th>
                  <th className="p-2.5 border-b border-zinc-800">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-mono">
                {batchFiles.map((f, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/50">
                    <td className="p-2.5 font-bold text-white">{f.name}</td>
                    <td className="p-2.5 text-zinc-400">{f.size}</td>
                    <td className="p-2.5 w-1/3">
                      <div className="w-full h-2 bg-zinc-900 border border-zinc-800 relative">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-2.5">
                      {f.status === 'COMPLETED' ? (
                        <span className="text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PROCESSED
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold uppercase text-[10px]">
                          {f.status}
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
  );
};
