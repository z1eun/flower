import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { SeedItem } from '../types/dandelion';
import { sounds } from '../utils/soundEffects';
import { X, Mic, Wind, Sparkles, RotateCcw, Heart } from 'lucide-react';

interface BlowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  seeds: SeedItem[];
  groupName: string;
}

export const BlowingModal: React.FC<BlowingModalProps> = ({
  isOpen,
  onClose,
  seeds,
  groupName,
}) => {
  const [stage, setStage] = useState<'ready' | 'blowing' | 'dispersing' | 'bloomed'>('ready');
  const [blowProgress, setBlowProgress] = useState<number>(0);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micSupported, setMicSupported] = useState<boolean>(true);

  const audioStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micAnimRef = useRef<number | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or stop microphone
  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicActive(true);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buffer);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;

        // If blowing or loud sound detected (threshold ~40)
        if (avg > 38) {
          setStage('blowing');
          setBlowProgress((prev) => {
            const next = prev + 3.5;
            if (next >= 100) {
              return 100;
            }
            return next;
          });
        }

        micAnimRef.current = requestAnimationFrame(checkVolume);
      };

      micAnimRef.current = requestAnimationFrame(checkVolume);
    } catch (err) {
      console.warn('Microphone not available or permission denied:', err);
      setMicSupported(false);
      setMicActive(false);
    }
  }, []);

  const stopMic = useCallback(() => {
    if (micAnimRef.current) {
      cancelAnimationFrame(micAnimRef.current);
      micAnimRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    setMicActive(false);
  }, []);

  // Trigger bloom ceremony
  const triggerBlooming = useCallback(() => {
    setStage('dispersing');
    sounds.playWindBreeze(2.5);

    // After seeds disperse, open the flower
    setTimeout(() => {
      setStage('bloomed');
      sounds.playBloom();

      // Launch cheerful confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD13B', '#FFE066', '#A8E063', '#7CE08A', '#FFAE19'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD13B', '#FFE066', '#FFFFFF'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#7CE08A', '#A8E063', '#FFFFFF'],
          });
        }, 400);
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }, 2000);
  }, []);

  // Watch blow progress
  useEffect(() => {
    if (blowProgress >= 100 && stage === 'blowing') {
      stopMic();
      triggerBlooming();
    }
  }, [blowProgress, stage, stopMic, triggerBlooming]);

  // Handle opening and cleanup
  useEffect(() => {
    if (isOpen) {
      setStage('ready');
      setBlowProgress(0);
      startMic();
    } else {
      stopMic();
    }
    return () => {
      stopMic();
      if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    };
  }, [isOpen, startMic, stopMic]);

  // Long press button handler for manual blowing
  const startManualBlow = () => {
    setStage('blowing');
    sounds.playWindBreeze(1.5);
    if (pressTimerRef.current) clearInterval(pressTimerRef.current);

    pressTimerRef.current = setInterval(() => {
      setBlowProgress((prev) => {
        if (prev >= 100) {
          if (pressTimerRef.current) clearInterval(pressTimerRef.current);
          return 100;
        }
        return prev + 4;
      });
    }, 60);
  };

  const stopManualBlow = () => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (stage === 'blowing' && blowProgress < 100) {
      // Keep progress or slowly decay
      setStage('ready');
    }
  };

  const handleRestart = () => {
    setStage('ready');
    setBlowProgress(0);
    startMic();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFFDF5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFE066] flex flex-col max-h-[95vh] text-stone-800">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#FFF4B8] via-[#FFF9DB] to-[#E2F7D8] border-b-2 border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin" style={{ animationDuration: '8s' }}>🌻</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-storybook text-stone-800">
                우정의 민들레꽃 피우기
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                {groupName ? `[${groupName}] ` : ''}10개의 홀씨가 모여 꽃을 피워요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 text-stone-700 hover:bg-white flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dynamic Interactive Stage */}
        <div className="relative flex-1 min-h-[380px] p-6 flex flex-col items-center justify-center overflow-hidden">
          {/* STAGE 1 & 2: READY or BLOWING */}
          {(stage === 'ready' || stage === 'blowing') && (
            <div className="w-full flex flex-col items-center text-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4 flex items-center justify-center">
                {/* Wind swirl animations */}
                {stage === 'blowing' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-spin" style={{ animationDuration: '3s' }}>
                    <div className="w-full h-full border-4 border-dashed border-cyan-400/60 rounded-full scale-125" />
                  </div>
                )}

                {/* Big Fluffy Dandelion Ball */}
                <div className={`relative transition-transform duration-300 ${stage === 'blowing' ? 'scale-110 animate-bounce' : 'animate-float'}`}>
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-white via-amber-50 to-stone-100 shadow-xl border-4 border-amber-200 flex items-center justify-center relative overflow-hidden">
                    {/* Seed dots inside */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-xl font-bold text-amber-950 shadow-inner">
                        😊
                      </div>
                    </div>
                    {/* Radially floating seed stems */}
                    {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
                      <div
                        key={deg}
                        className="absolute w-full h-2 flex justify-between px-2"
                        style={{ transform: `rotate(${deg}deg)` }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-stone-200" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-stone-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-storybook mb-2">
                "하나, 둘, 셋! 후~~~~~!"
              </h3>
              <p className="text-stone-700 text-sm sm:text-base max-w-md font-medium mb-4">
                마이크에 대고 입김을 불거나, 아래의 노란 버튼을 꾹~ 누르며 친구들과 함께 "후~" 하고 바람을 불어보세요!
              </p>

              {/* Progress Wind Bar */}
              <div className="w-full max-w-sm mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-cyan-600" />
                    우리의 바람 에너지:
                  </span>
                  <span className="text-amber-800">{Math.round(blowProgress)}%</span>
                </div>
                <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden p-0.5 border border-stone-300">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400 transition-all duration-150 shadow-inner"
                    style={{ width: `${blowProgress}%` }}
                  />
                </div>
              </div>

              {/* Interaction Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
                <button
                  onMouseDown={startManualBlow}
                  onMouseUp={stopManualBlow}
                  onTouchStart={startManualBlow}
                  onTouchEnd={stopManualBlow}
                  className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FFD13B] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFD13B] text-stone-900 font-extrabold text-lg shadow-lg active:scale-95 transition border-2 border-amber-300 flex items-center justify-center gap-2 select-none"
                >
                  <Wind className="w-6 h-6 text-stone-800" />
                  <span>꾹 누르며 "후~" 불기!</span>
                </button>

                {micSupported && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                    <Mic className={`w-4 h-4 ${micActive ? 'text-emerald-600 animate-pulse' : 'text-stone-400'}`} />
                    <span>마이크 자동 감지 중</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STAGE 3: DISPERSING SEEDS */}
          {stage === 'dispersing' && (
            <div className="w-full h-full flex flex-col items-center justify-center text-center py-12">
              <div className="relative w-72 h-64 overflow-hidden flex items-center justify-center">
                <span className="text-4xl animate-spin">💨</span>
                {/* 10 Animated Flying Seeds */}
                {seeds.map((s, i) => (
                  <div
                    key={s.id}
                    className="absolute text-2xl transition-all duration-1000 ease-out"
                    style={{
                      transform: `translate(${(i - 4.5) * 45}px, -${140 + (i % 3) * 30}px) scale(${0.7 + (i % 3) * 0.2})`,
                      opacity: 0.9,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl">✨</span>
                      <span className="text-xs bg-white/90 px-1.5 py-0.5 rounded-full border border-amber-200 font-bold">
                        {s.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="text-2xl font-bold font-storybook text-stone-800 animate-pulse">
                홀씨들이 하늘 높이 날아가고 있어요...!
              </h3>
            </div>
          )}

          {/* STAGE 4: BLOOMED CELEBRATION */}
          {stage === 'bloomed' && (
            <div className="w-full flex flex-col items-center text-center animate-fade-in py-2">
              {/* Giant Yellow Dandelion Flower Blossom */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 mb-4 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(255,209,59,0.8)] animate-pulse-warm">
                  <defs>
                    <radialGradient id="flowerCenter" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFF275" />
                      <stop offset="60%" stopColor="#FFD13B" />
                      <stop offset="100%" stopColor="#FFAE19" />
                    </radialGradient>
                  </defs>
                  {/* Layered Golden Floral Petals */}
                  {[...Array(24)].map((_, i) => (
                    <ellipse
                      key={i}
                      cx="100"
                      cy="40"
                      rx="8"
                      ry="36"
                      fill="#FFD13B"
                      stroke="#F59E0B"
                      strokeWidth="1.2"
                      transform={`rotate(${i * 15} 100 100)`}
                    />
                  ))}
                  {[...Array(16)].map((_, i) => (
                    <ellipse
                      key={`inner-${i}`}
                      cx="100"
                      cy="55"
                      rx="7"
                      ry="28"
                      fill="#FFE066"
                      stroke="#F59E0B"
                      strokeWidth="1"
                      transform={`rotate(${i * 22.5 + 7} 100 100)`}
                    />
                  ))}
                  {/* Sunny Center with Happy Face */}
                  <circle cx="100" cy="100" r="34" fill="url(#flowerCenter)" stroke="#D97706" strokeWidth="2" />
                  <circle cx="88" cy="94" r="3.5" fill="#451A03" />
                  <circle cx="112" cy="94" r="3.5" fill="#451A03" />
                  <circle cx="82" cy="104" r="3.5" fill="#FF7B7B" opacity="0.6" />
                  <circle cx="118" cy="104" r="3.5" fill="#FF7B7B" opacity="0.6" />
                  <path d="M 90 106 Q 100 118 110 106" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                  ✨
                </div>
              </div>

              {/* Friendship Message Banner from Legend of Friends */}
              <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-emerald-100 rounded-3xl p-5 border-2 border-amber-300 shadow-md max-w-lg mb-4">
                <span className="text-3xl mb-1 block">🌻💛🌻</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-storybook mb-1">
                  「친구야 고마워! 우리의 우정이 활짝 피어났어요!」
                </h3>
                <p className="text-stone-700 text-sm sm:text-base font-medium mt-1">
                  서로 돕고 양보하며 모은 10개의 홀씨가 세상에서 가장 눈부신 노란 민들레꽃이 되었어요.
                </p>
              </div>

              {/* 10 Friendship Virtues Recap */}
              <div className="flex flex-wrap justify-center gap-1.5 max-w-lg mb-6">
                {seeds.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 text-xs py-1 px-2.5 rounded-full bg-white border border-amber-200 text-stone-800 shadow-xs font-bold"
                  >
                    <span>{s.icon}</span>
                    <span>{s.theme}</span>
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRestart}
                  className="py-3 px-5 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-200 text-stone-700 font-bold text-sm shadow-sm flex items-center gap-2 active:scale-95 transition"
                >
                  <RotateCcw className="w-4 h-4 text-stone-600" />
                  <span>다시 불어보기</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-bold text-sm shadow-md flex items-center gap-2 active:scale-95 transition font-storybook"
                >
                  <Heart className="w-4 h-4 fill-amber-900 text-amber-900" />
                  <span>친구들과 축하하기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
