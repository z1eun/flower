import React from 'react';

interface PetalViewfinderProps {
  isScanning: boolean;
  onSimulateScan?: () => void;
}

export const PetalViewfinder: React.FC<PetalViewfinderProps> = ({ isScanning }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Darkened mask with soft transparent flower aperture */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
        {/* Soft Floral Petal Guide SVG Frame */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,209,59,0.7)] animate-pulse-warm"
        >
          <defs>
            <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="50%" stopColor="#FFD13B" />
              <stop offset="100%" stopColor="#A8E063" />
            </linearGradient>
            <linearGradient id="petalGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF9DB" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFE066" stopOpacity="0.2" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 8 Soft organic flower petals arranged radially */}
          <g transform="translate(200, 200)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <path
                key={i}
                d="M -36 -95 C -60 -150, 60 -150, 36 -95 C 24 -60, -24 -60, -36 -95 Z"
                transform={`rotate(${angle})`}
                fill="url(#petalGlow)"
                stroke="url(#petalGrad)"
                strokeWidth="4.5"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            ))}

            {/* Inner soft round border for QR focus */}
            <circle
              r="95"
              fill="none"
              stroke="#FFD13B"
              strokeWidth="4"
              strokeDasharray="8 8"
              className={isScanning ? "animate-spin" : ""}
              style={{ animationDuration: '24s' }}
            />

            {/* Corner friendly guidance dots */}
            {[0, 90, 180, 270].map((angle, i) => (
              <circle
                key={i}
                cx={Math.cos((angle * Math.PI) / 180) * 95}
                cy={Math.sin((angle * Math.PI) / 180) * 95}
                r="6"
                fill="#7CE08A"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            ))}
          </g>
        </svg>

        {/* Center Target Box with soft rounded corners */}
        <div className="absolute w-44 h-44 sm:w-52 sm:h-52 border-2 border-dashed border-amber-300/80 rounded-3xl flex items-center justify-center">
          <div className="w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-xl absolute -top-1 -left-1" />
          <div className="w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-xl absolute -top-1 -right-1" />
          <div className="w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl-xl absolute -bottom-1 -left-1" />
          <div className="w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br-xl absolute -bottom-1 -right-1" />

          {/* Scanning line animation */}
          {isScanning && (
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#F59E0B] absolute animate-bounce" />
          )}
        </div>
      </div>
    </div>
  );
};
