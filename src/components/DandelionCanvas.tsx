import React from 'react';
import { SeedItem } from '../types/dandelion';
import { Sparkles, Heart } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface DandelionCanvasProps {
  seeds: SeedItem[];
  onSelectSeed: (seed: SeedItem) => void;
  onOpenScanner: () => void;
  onOpenBlowing: () => void;
  isAllCollected: boolean;
}

export const DandelionCanvas: React.FC<DandelionCanvasProps> = ({
  seeds,
  onSelectSeed,
  onOpenScanner,
  onOpenBlowing,
  isAllCollected,
}) => {
  const collectedCount = seeds.filter((s) => s.collected).length;

  // Center coordinate of canvas
  const centerX = 250;
  const centerY = 210;
  const radius = 135;

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Visual Canvas Container */}
      <div className="relative w-full aspect-[4/3] max-h-[500px] flex items-center justify-center select-none overflow-visible">
        {/* Watercolor Background Accent Halo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full transition-all duration-1000 ${
              isAllCollected
                ? 'bg-gradient-to-r from-amber-200/50 via-yellow-100/60 to-emerald-200/50 blur-3xl scale-110'
                : 'bg-amber-100/30 blur-2xl'
            }`}
          />
        </div>

        {/* SVG Stage */}
        <svg
          viewBox="0 0 500 440"
          className="w-full h-full overflow-visible drop-shadow-sm"
        >
          <defs>
            {/* Stem Gradient */}
            <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7EBE56" />
              <stop offset="50%" stopColor="#96D468" />
              <stop offset="100%" stopColor="#5E993B" />
            </linearGradient>

            {/* Core Receptacle Gradient */}
            <radialGradient id="receptacleGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="60%" stopColor="#E5B224" />
              <stop offset="100%" stopColor="#9C730A" />
            </radialGradient>

            {/* Collected Seed Pappus Gradient */}
            <radialGradient id="seedPappus" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="70%" stopColor="#F7FAFC" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.4" />
            </radialGradient>

            {/* Golden glow filter */}
            <filter id="bloomGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Dandelion Leaves at bottom */}
          <g className="animate-breeze">
            {/* Left Leaf */}
            <path
              d="M 235 390 C 180 380, 130 350, 110 320 C 145 328, 175 320, 195 338 C 170 338, 150 310, 135 295 C 170 305, 205 325, 240 370 Z"
              fill="#83C95D"
              stroke="#5D9B38"
              strokeWidth="2.5"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {/* Right Leaf */}
            <path
              d="M 265 390 C 320 380, 370 350, 390 320 C 355 328, 325 320, 305 338 C 330 338, 350 310, 365 295 C 330 305, 295 325, 260 370 Z"
              fill="#8FD666"
              stroke="#5D9B38"
              strokeWidth="2.5"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </g>

          {/* Central Stem */}
          <path
            d={`M ${centerX} ${centerY + 20} Q ${centerX - 8} 310, ${centerX} 420`}
            fill="none"
            stroke="url(#stemGrad)"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Calyx & Receptacle (Flower base) */}
          <path
            d={`M ${centerX - 18} ${centerY + 8} Q ${centerX} ${centerY + 26} ${centerX + 18} ${centerY + 8} Z`}
            fill="#5E993B"
          />

          {/* Connective Spokes/Filaments to Seeds */}
          {seeds.map((seed, index) => {
            const angle = (index * 36 - 90) * (Math.PI / 180);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            return (
              <line
                key={`line-${seed.id}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={seed.collected ? '#C6A132' : '#CBD5E1'}
                strokeWidth={seed.collected ? '2.5' : '1.5'}
                strokeDasharray={seed.collected ? 'none' : '4 4'}
                opacity={seed.collected ? 0.85 : 0.6}
              />
            );
          })}

          {/* Center Receptacle Head */}
          <circle
            cx={centerX}
            cy={centerY}
            r="28"
            fill="url(#receptacleGrad)"
            stroke="#8C6507"
            strokeWidth="3"
            filter={isAllCollected ? 'url(#bloomGlow)' : undefined}
          />
          {/* Friendly happy face inside flower bud */}
          <g transform={`translate(${centerX - 16}, ${centerY - 12})`}>
            <circle cx="8" cy="10" r="2.5" fill="#583A00" />
            <circle cx="24" cy="10" r="2.5" fill="#583A00" />
            <path
              d="M 10 16 Q 16 23 22 16"
              fill="none"
              stroke="#583A00"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Pink cheeks */}
            <circle cx="4" cy="14" r="2.5" fill="#FF8A8A" opacity="0.6" />
            <circle cx="28" cy="14" r="2.5" fill="#FF8A8A" opacity="0.6" />
          </g>

          {/* Seeds placed radially */}
          {seeds.map((seed, index) => {
            const angleDeg = index * 36 - 90;
            const angleRad = angleDeg * (Math.PI / 180);
            const x = centerX + Math.cos(angleRad) * radius;
            const y = centerY + Math.sin(angleRad) * radius;

            if (seed.collected) {
              // Collected State: Fluffy White Watercolor Pappus with Bounce & Float
              return (
                <g
                  key={`seed-${seed.id}`}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group transition-transform duration-300 hover:scale-125"
                  onClick={() => {
                    sounds.playPop();
                    onSelectSeed(seed);
                  }}
                >
                  {/* Gentle float glow */}
                  <circle
                    r="32"
                    fill="#FFFBEB"
                    opacity="0.85"
                    className="group-hover:opacity-100 transition-opacity"
                  />

                  {/* Radiating fine umbrella filaments */}
                  {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map(
                    (fAngle, fIdx) => (
                      <line
                        key={fIdx}
                        x1="0"
                        y1="0"
                        x2={Math.cos((fAngle * Math.PI) / 180) * 26}
                        y2={Math.sin((fAngle * Math.PI) / 180) * 26}
                        stroke="#E2E8F0"
                        strokeWidth="1.2"
                      />
                    )
                  )}

                  {/* Fluffy tufts */}
                  <circle r="22" fill="url(#seedPappus)" />
                  <circle
                    r="12"
                    fill="#FFE885"
                    stroke="#D97706"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />

                  {/* Seed Badge Number */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#78350F"
                    className="font-storybook"
                  >
                    {seed.id}
                  </text>

                  {/* Small Heart or Sparkle */}
                  <circle
                    cx="14"
                    cy="-14"
                    r="7"
                    fill="#FF6B6B"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text
                    x="14"
                    y="-11"
                    textAnchor="middle"
                    fontSize="8"
                    fill="#FFFFFF"
                  >
                    ♥
                  </text>
                </g>
              );
            }

            // Uncollected State: Translucent dotted placeholder
            return (
              <g
                key={`seed-empty-${seed.id}`}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                onClick={onOpenScanner}
              >
                <circle
                  r="24"
                  fill="#F8FAFC"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                {/* Silhouette outline */}
                <circle r="14" fill="#E2E8F0" opacity="0.4" />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#94A3B8"
                  className="font-storybook"
                >
                  {seed.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Prompt when all collected */}
        {isAllCollected && (
          <div className="absolute top-4 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border-2 border-amber-300 animate-bounce flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span className="text-base sm:text-lg font-bold text-amber-900 font-storybook">
              10개의 홀씨를 모두 모았어요! 아래 버튼을 눌러보세요!
            </span>
          </div>
        )}
      </div>

      {/* Touch Guide for Young Children */}
      <div className="w-full max-w-md px-4 mt-1 mb-4 flex items-center justify-between text-xs text-stone-600 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-white inline-block shadow-sm" />
          모은 홀씨를 터치하면 친구 이야기 보기
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border border-dashed border-stone-400 inline-block" />
          빈 자리는 QR코드로 찾기
        </span>
      </div>

      {/* Main Bottom Call-to-Action Bar */}
      <div className="w-full max-w-md px-4">
        {isAllCollected ? (
          <button
            onClick={() => {
              sounds.playPop();
              onOpenBlowing();
            }}
            className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-[#FFD13B] via-[#FFE066] to-[#FFAE19] text-stone-900 font-extrabold text-xl sm:text-2xl shadow-xl hover:shadow-2xl active:scale-98 transition transform duration-200 border-4 border-white flex items-center justify-center gap-3 animate-pulse-warm font-storybook"
          >
            <span className="text-3xl animate-bounce">💨</span>
            <span>민들레씨 '후~' 불기!</span>
            <Sparkles className="w-6 h-6 text-amber-800" />
          </button>
        ) : (
          <button
            onClick={() => {
              sounds.playPop();
              onOpenScanner();
            }}
            className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-[#A8E063] via-[#7CE08A] to-[#56C567] text-white font-extrabold text-xl shadow-lg hover:shadow-xl active:scale-98 transition transform duration-200 border-4 border-white flex items-center justify-center gap-3 font-storybook"
          >
            <span className="text-2xl">📷</span>
            <span>보물찾기! 홀씨 QR 스캔하기</span>
            <span className="bg-white/30 text-stone-900 text-sm py-0.5 px-3 rounded-full font-bold">
              {collectedCount} / 10
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
