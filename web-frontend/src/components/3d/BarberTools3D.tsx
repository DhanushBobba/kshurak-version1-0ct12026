import React, { useRef, useEffect, useState } from 'react';
import { 
  RotateCw, 
  ZoomIn, 
  Maximize2, 
  Box, 
  Scissors, 
  Zap, 
  Sparkles, 
  Layers, 
  Target, 
  Gem,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  highlightName: string;
  sub: string;
  material: string;
  desc: string;
  iconType: 'shears' | 'trimmer' | 'razor' | 'comb';
  stat: string;
  image: string;
  accentColor: string;
  specsLine: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'shears',
    name: 'Damascus',
    highlightName: 'Steel Shears',
    sub: 'Hand-Forged 6.5"',
    material: 'VG-10 Japanese Cobalt Alloy',
    desc: 'Ultra-refined micro-serration designed for microscopic precision sectioning and seamless blending.',
    iconType: 'shears',
    stat: '62 HRC Hardness',
    image: '/assets/tools/damascus-shears.jpg',
    accentColor: '#D4AF37',
    specsLine: 'Hand-Forged 6.5"  •  Precision Convex  •  VG-10 Japanese Cobalt Alloy',
  },
  {
    id: 'clipper',
    name: 'Gold Foil',
    highlightName: 'Cyber-Trimmer',
    sub: '7,500 RPM Magnetic Micro-Motor',
    material: '24K Titanium-Infused Foil',
    desc: 'Zero-gap calibrated head engineered for skin-fade laser tapers with hypoallergenic comfort.',
    iconType: 'trimmer',
    stat: '0.05mm Zero-Gap',
    image: '/assets/tools/gold-trimmer.jpg',
    accentColor: '#F59E0B',
    specsLine: '7,500 RPM Micro-Motor  •  24K Titanium Foil  •  Zero-Gap Laser Calibrated',
  },
  {
    id: 'razor',
    name: 'Artisan Carbon',
    highlightName: 'Straight Razor',
    sub: 'Monolithic Single-Blade Shavette',
    material: 'Toray 3K Carbon Fibre & Gold Brass',
    desc: 'Ergonomic counterbalance delivering razor-sharp precision lines across the temples and neckline.',
    iconType: 'razor',
    stat: '15° Edge Angle',
    image: '/assets/tools/carbon-razor.jpg',
    accentColor: '#38BDF8',
    specsLine: 'Toray 3K Carbon Fibre  •  15° Edge Angle  •  Solid Brass Counterbalance',
  },
  {
    id: 'comb',
    name: 'Antistatic Carbon',
    highlightName: 'Barber Comb',
    sub: 'Anti-Friction Heat Resistant (230°C)',
    material: 'High-Density Matte Carbon Composite',
    desc: 'Laser-measured pitch teeth providing uniform tension during scissor-over-comb executions.',
    iconType: 'comb',
    stat: 'Anti-Static 0Ω',
    image: '/assets/tools/carbon-comb.jpg',
    accentColor: '#C084FC',
    specsLine: 'Heat Resistant 230°C  •  Laser-Measured Pitch  •  Anti-Static 0Ω Matrix',
  },
];

export const BarberTools3D: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolItem>(TOOLS[0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isHoloActive, setIsHoloActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [calibrationY, setCalibrationY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Particle spark system
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 500,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2,
        life: Math.random() * 120,
        maxLife: 100 + Math.random() * 60,
        size: Math.random() * 2.2 + 0.6,
      });
    }

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.02;

      // Smooth mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const autoX = isAutoRotate ? Math.sin(time * 0.8) * 0.25 : 0;
      const effectiveX = mouseRef.current.x + autoX;
      const effectiveY = mouseRef.current.y;

      const cx = w / 2 + effectiveX * 20;
      const cy = h / 2 + effectiveY * 16;

      // Dynamic scale indicator value
      setCalibrationY(Math.round(-effectiveY * 60));

      // Holographic concentric light rings when Explore/Holo is active
      if (isHoloActive) {
        ctx.save();
        ctx.translate(cx, cy + 30);
        ctx.rotate(time * 0.3);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, 140, 0, Math.PI * 2);
        ctx.stroke();

        ctx.rotate(-time * 0.5);
        ctx.strokeStyle = 'rgba(242, 201, 76, 0.5)';
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 105, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw floating golden embers
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        if (p.life > p.maxLife || p.y < 0) {
          p.x = cx + (Math.random() - 0.5) * 320;
          p.y = cy + 130 + Math.random() * 40;
          p.life = 0;
        }

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.75;
        ctx.fillStyle = `rgba(255, 230, 140, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [activeTool, isAutoRotate, isHoloActive]);

  const renderToolIcon = (iconType: ToolItem['iconType'], isSelected: boolean) => {
    switch (iconType) {
      case 'shears':
        return (
          <div className={`p-2.5 rounded-xl transition-all ${
            isSelected 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(212,175,55,0.4)]' 
              : 'bg-[#181D2A] text-amber-400/80 border border-white/5'
          }`}>
            <Scissors className="w-5 h-5 -rotate-45" />
          </div>
        );
      case 'trimmer':
        return (
          <div className={`p-2.5 rounded-xl transition-all ${
            isSelected 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(212,175,55,0.4)]' 
              : 'bg-[#181D2A] text-amber-400/80 border border-white/5'
          }`}>
            <Zap className="w-5 h-5" />
          </div>
        );
      case 'razor':
        return (
          <div className={`p-2.5 rounded-xl transition-all ${
            isSelected 
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.4)]' 
              : 'bg-[#181D2A] text-sky-400/80 border border-white/5'
          }`}>
            <div className="w-5 h-5 flex items-center justify-center font-bold text-base">🪒</div>
          </div>
        );
      case 'comb':
        return (
          <div className={`p-2.5 rounded-xl transition-all ${
            isSelected 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(192,132,252,0.4)]' 
              : 'bg-[#181D2A] text-purple-400/80 border border-white/5'
          }`}>
            <div className="w-5 h-5 flex items-center justify-center font-bold text-base">💈</div>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-[28px] sm:rounded-[34px] border border-[#D4AF37]/35 bg-[#06080E]/95 backdrop-blur-2xl p-5 sm:p-8 lg:p-10 shadow-[0_0_50px_rgba(212,175,55,0.12),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden"
    >
      {/* Subtle Corner Glow Accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gold-500/10 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-gold-500/10 blur-[90px]" />

      <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-10">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: 3D VIEWPORT STAGE                               */}
        {/* ============================================================ */}
        <div className="relative w-full lg:w-[49%] min-h-[380px] sm:min-h-[440px] rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#0e121a] via-[#080a0f] to-[#030407] overflow-hidden flex flex-col justify-between p-4 sm:p-5 select-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
          
          {/* Background 3D Render Image with smooth zoom & interactive tilt */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
            style={{ 
              backgroundImage: `url('${activeTool.image}')`,
              transform: `scale(${isZoomed ? 1.22 : 1.05}) translate(${mouseRef.current.x * 6}px, ${mouseRef.current.y * 6}px)`,
            }}
          />

          {/* Vignette Overlay & Soft Radial Shadow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(3,4,7,0.7)_100%)]" />

          {/* Live Particle & Calibration Rings Canvas Overlay */}
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 w-full h-full z-10" />

          {/* TOP BAR: Spec Badge */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="inline-flex items-center rounded-full border border-[#D4AF37]/50 bg-[#06080E]/80 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] text-[#F3CF65] font-semibold tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              SPEC: {activeTool.stat}
            </div>
          </div>

          {/* LEFT CALIBRATION VERTICAL SCALE */}
          <div className="relative z-20 pointer-events-none absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col justify-between h-48 py-1 font-mono text-[9px] sm:text-[10px] text-slate-400 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1px] bg-slate-500" />
              <span>100</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-[1px] bg-slate-600" />
              <span>50</span>
            </div>
            {/* Zero point with active glowing gold dot */}
            <div className="relative flex items-center gap-1.5 text-[#F3CF65] font-bold">
              <span className="absolute -left-1.5 w-2 h-2 rounded-full bg-[#F3CF65] shadow-[0_0_10px_#F3CF65]" />
              <span className="w-3.5 h-[1.5px] bg-[#F3CF65]" />
              <span>{calibrationY}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-[1px] bg-slate-600" />
              <span>-50</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1px] bg-slate-500" />
              <span>-100</span>
            </div>
          </div>

          {/* RIGHT ACTION CONTROLS (ROTATE, ZOOM, EXPLORE) */}
          <div className="relative z-20 absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              title="Toggle Auto-Rotation"
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                isAutoRotate 
                  ? 'bg-amber-500/20 text-[#F3CF65] border border-[#D4AF37]/50 shadow-[0_0_14px_rgba(212,175,55,0.35)]' 
                  : 'bg-[#080B11]/70 text-slate-400 hover:text-white border border-white/10 hover:border-amber-400/40'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span className="font-mono text-[8px] tracking-wider uppercase font-semibold">Rotate</span>
            </button>

            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              title="Toggle Zoom Inspection"
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                isZoomed 
                  ? 'bg-amber-500/20 text-[#F3CF65] border border-[#D4AF37]/50 shadow-[0_0_14px_rgba(212,175,55,0.35)]' 
                  : 'bg-[#080B11]/70 text-slate-400 hover:text-white border border-white/10 hover:border-amber-400/40'
              }`}
            >
              <ZoomIn className="w-4 h-4" />
              <span className="font-mono text-[8px] tracking-wider uppercase font-semibold">Zoom</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHoloActive(!isHoloActive)}
              title="Toggle Holographic Inspection"
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                isHoloActive 
                  ? 'bg-amber-500/20 text-[#F3CF65] border border-[#D4AF37]/50 shadow-[0_0_14px_rgba(212,175,55,0.35)]' 
                  : 'bg-[#080B11]/70 text-slate-400 hover:text-white border border-white/10 hover:border-amber-400/40'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span className="font-mono text-[8px] tracking-wider uppercase font-semibold">Explore</span>
            </button>
          </div>

          {/* BOTTOM TELEMETRY ROW */}
          <div className="relative z-20 flex items-center justify-between pt-4">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#06080E]/80 px-2.5 py-1 font-mono text-[10px] font-bold text-[#F3CF65] backdrop-blur-md">
              <Box className="w-3.5 h-3.5 text-[#F3CF65]" />
              <span>3D VIEW</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[9px] sm:text-[10px] text-slate-400 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F3CF65] animate-pulse shadow-[0_0_6px_#F3CF65]" />
              <span>3D PARALLAX ENGINE ACTIVE</span>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: INSTRUMENT SPECIFICATIONS & 2x2 SELECTOR GRID  */}
        {/* ============================================================ */}
        <div className="w-full lg:w-[51%] flex flex-col justify-between py-1">
          
          {/* Active Instrument Header & Bio */}
          <div>
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
              Master Artisan Instruments
            </span>
            
            <h3 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1 mb-2">
              {activeTool.name} <span className="text-[#F3CF65] font-cinzel">{activeTool.highlightName}</span>
            </h3>

            <p className="font-mono text-xs sm:text-[12.5px] text-[#F3CF65]/90 font-medium tracking-wide mb-2.5">
              {activeTool.specsLine}
            </p>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl">
              {activeTool.desc}
            </p>
          </div>

          {/* 2x2 Interactive Instrument Matrix Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
            {TOOLS.map((tool) => {
              const isSelected = activeTool.id === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTool(tool)}
                  className={`group relative flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-[#E5C34D] bg-gradient-to-r from-[#D4AF37]/15 to-[#090D15] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                      : 'border-white/10 bg-[#080B12]/80 hover:border-[#D4AF37]/45 hover:bg-[#0E1320]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {renderToolIcon(tool.iconType, isSelected)}
                    <div className="min-w-0">
                      <div className={`font-sans text-xs sm:text-sm font-bold truncate leading-snug ${
                        isSelected ? 'text-white' : 'text-slate-200 group-hover:text-gold-200'
                      }`}>
                        {tool.name} {tool.highlightName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5 font-medium">
                        {tool.stat}
                      </div>
                    </div>
                  </div>

                  {/* Right Circle Arrow Button */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                    isSelected
                      ? 'bg-amber-500/30 border border-[#E5C34D] text-[#F3CF65] shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                      : 'border border-white/15 text-slate-500 group-hover:border-amber-400/50 group-hover:text-amber-300'
                  }`}>
                    →
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom 3 Value Pillars */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gold-500/20">
            
            {/* Pillar 1: Micron Precision */}
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[#F3CF65]">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#F3CF65] truncate">
                  Micron Precision
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 truncate">
                  Salon Grade Accuracy
                </div>
              </div>
            </div>

            {/* Pillar 2: Artisan Crafted */}
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[#F3CF65]">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#F3CF65] truncate">
                  Artisan Crafted
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 truncate">
                  Hand-Forged Quality
                </div>
              </div>
            </div>

            {/* Pillar 3: Built To Last */}
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[#F3CF65]">
                <Gem className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#F3CF65] truncate">
                  Built to Last
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 truncate">
                  Lifetime Performance
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default BarberTools3D;
