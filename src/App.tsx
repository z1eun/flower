import { useState, useEffect } from 'react';
import { INITIAL_SEEDS, SeedItem } from './types/dandelion';
import { DandelionCanvas } from './components/DandelionCanvas';
import { QRScannerModal } from './components/QRScannerModal';
import { BlowingModal } from './components/BlowingModal';
import { TeacherSheet } from './components/TeacherSheet';
import { SeedDetailModal } from './components/SeedDetailModal';
import { sounds } from './utils/soundEffects';
import { Camera, Settings, Volume2, VolumeX, Sparkles, BookHeart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<'main' | 'teacher'>('main');
  const [seeds, setSeeds] = useState<SeedItem[]>(() => {
    try {
      const saved = localStorage.getItem('dandelion_seeds_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load seeds from storage', e);
    }
    return INITIAL_SEEDS;
  });

  const [groupName, setGroupName] = useState<string>(() => {
    return localStorage.getItem('dandelion_group_v1') || '1모둠 (햇살)';
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBlowingOpen, setIsBlowingOpen] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<SeedItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dandelion_seeds_v1', JSON.stringify(seeds));
    } catch (e) {
      console.warn('Failed to save seeds to storage', e);
    }
  }, [seeds]);

  useEffect(() => {
    try {
      localStorage.setItem('dandelion_group_v1', groupName);
    } catch (e) {
      console.warn('Failed to save group name', e);
    }
  }, [groupName]);

  const collectedCount = seeds.filter((s) => s.collected).length;
  const isAllCollected = collectedCount === 10;

  // Handle scanned seed
  const handleSeedScanned = (seedId: number) => {
    setSeeds((prev) => {
      const next = prev.map((s) => (s.id === seedId ? { ...s, collected: true } : s));
      const newlyCount = next.filter((s) => s.collected).length;

      // When the 10th seed is discovered!
      if (newlyCount === 10 && collectedCount < 10) {
        setTimeout(() => {
          sounds.playFanfare();
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#FFD13B', '#FFE066', '#A8E063', '#7CE08A'],
            });
          } catch (err) {
            console.error('Confetti trigger error:', err);
          }
        }, 800);
      }

      return next;
    });
  };

  // Toggle single seed for teacher override
  const handleToggleSeed = (id: number) => {
    setSeeds((prev) =>
      prev.map((s) => (s.id === id ? { ...s, collected: !s.collected } : s))
    );
  };

  // Complete all 10 for classroom demo
  const handleCompleteAll = () => {
    setSeeds((prev) => prev.map((s) => ({ ...s, collected: true })));
    sounds.playFanfare();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  // Reset all seeds for new student rotation
  const handleReset = () => {
    setSeeds(INITIAL_SEEDS);
    sounds.playPop();
  };

  // Update finder name on a seed
  const handleUpdateFinder = (id: number, finderName: string) => {
    setSeeds((prev) =>
      prev.map((s) => (s.id === id ? { ...s, collectedBy: finderName } : s))
    );
    setSelectedSeed((prev) => (prev && prev.id === id ? { ...prev, collectedBy: finderName } : prev));
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-200 selection:text-stone-900">
      {/* TOP NAVIGATION BAR: Follows Frontend Design Constitution Top Bar Contract */}
      <header className="print:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl animate-float">🌼</span>
          <span className="text-xl sm:text-2xl font-bold font-storybook text-stone-900 tracking-tight whitespace-nowrap">
            함께 피우는 우정의 민들레꽃
          </span>
        </div>

        {/* Zone 2: Navigation Links / Mode Tabs */}
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-bold text-stone-600">
          <button
            onClick={() => setActiveTab('main')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap shrink-0 ${
              activeTab === 'main'
                ? 'bg-amber-100 text-stone-900 font-extrabold shadow-xs'
                : 'hover:text-stone-900 text-stone-600'
            }`}
          >
            민들레 정원
          </button>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-3 py-1.5 rounded-xl hover:bg-emerald-50 text-emerald-800 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 font-bold"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>홀씨 스캔</span>
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'teacher'
                ? 'bg-amber-400 text-stone-900 font-extrabold shadow-xs'
                : 'hover:text-stone-900 text-stone-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>교사용 도안·관리</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Sound Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
          </button>

          {isAllCollected ? (
            <button
              onClick={() => setIsBlowingOpen(true)}
              className="px-4 py-2 text-xs sm:text-sm font-extrabold text-stone-900 bg-[#FFD13B] hover:bg-[#FFE066] rounded-xl shadow transition whitespace-nowrap shrink-0 flex items-center gap-1.5 animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>'후~' 불기!</span>
            </button>
          ) : (
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2 text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>QR 스캔</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {activeTab === 'main' ? (
          <div className="flex flex-col items-center">
            {/* Upper Storybook Header & Counter */}
            <div className="text-center mb-4 sm:mb-6 max-w-xl">
              {/* Group / Class Indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/90 rounded-full border border-amber-300 text-xs font-bold text-amber-900 mb-2">
                <BookHeart className="w-3.5 h-3.5 text-amber-700" />
                <span>{groupName}의 협동 활동</span>
              </div>

              {/* Counter Display */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-storybook tracking-tight">
                🌻 {collectedCount} / 10개 모았어요!
              </h1>
              <p className="text-stone-600 text-sm sm:text-base font-medium mt-1">
                {isAllCollected
                  ? '모든 홀씨가 모였어요! 친구들과 함께 힘껏 "후~" 불어보세요!'
                  : '교실 곳곳에 숨겨진 민들레 홀씨를 찾아 QR코드를 비춰주세요.'}
              </p>

              {/* 10 Miniature Seed Milestone Tracker Dots */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
                {seeds.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (s.collected) {
                        sounds.playPop();
                        setSelectedSeed(s);
                      } else {
                        setIsScannerOpen(true);
                      }
                    }}
                    title={`${s.id}번: ${s.name}`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition transform active:scale-90 ${
                      s.collected
                        ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-stone-900 shadow-sm border-2 border-white'
                        : 'bg-stone-200/80 text-stone-500 border border-stone-300'
                    }`}
                  >
                    {s.collected ? s.id : s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Central Dandelion Canvas Component */}
            <DandelionCanvas
              seeds={seeds}
              onSelectSeed={(seed) => setSelectedSeed(seed)}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenBlowing={() => setIsBlowingOpen(true)}
              isAllCollected={isAllCollected}
            />
          </div>
        ) : (
          <TeacherSheet
            seeds={seeds}
            groupName={groupName}
            setGroupName={setGroupName}
            onReset={handleReset}
            onCompleteAll={handleCompleteAll}
            onToggleSeed={handleToggleSeed}
          />
        )}
      </main>

      {/* QUIET FOOTER (Anti-Slop compliant: no telemetry tickers or pseudo-engines) */}
      <footer className="print:hidden border-t border-amber-200/60 py-4 px-6 text-center text-xs text-stone-500">
        <p className="font-medium">
          그림책 『친구의 전설』 독후 연계 유아 상호작용 프로그램 · 함께 피우는 우정의 민들레꽃
        </p>
      </footer>

      {/* MODALS */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSeedScanned={handleSeedScanned}
        seeds={seeds}
      />

      <BlowingModal
        isOpen={isBlowingOpen}
        onClose={() => setIsBlowingOpen(false)}
        seeds={seeds}
        groupName={groupName}
      />

      <SeedDetailModal
        seed={selectedSeed}
        onClose={() => setSelectedSeed(null)}
        onUpdateFinder={handleUpdateFinder}
      />
    </div>
  );
}
