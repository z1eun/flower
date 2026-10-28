import React, { useState } from 'react';
import { SeedItem } from '../types/dandelion';
import { X, Volume2, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface SeedDetailModalProps {
  seed: SeedItem | null;
  onClose: () => void;
  onUpdateFinder: (id: number, finderName: string) => void;
}

export const SeedDetailModal: React.FC<SeedDetailModalProps> = ({
  seed,
  onClose,
  onUpdateFinder,
}) => {
  const [finderInput, setFinderInput] = useState(seed?.collectedBy || '');
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!seed) return null;

  // Read message aloud using Web Speech API for pre-literate kindergarten children
  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const textToRead = `${seed.id}번 ${seed.name}. ${seed.message}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // Slightly slower and gentle for young children
    utterance.pitch = 1.1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveFinder = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    onUpdateFinder(seed.id, finderInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in text-stone-800">
      <div className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFE066] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#FFF4B8] to-[#FFF9DB] border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{seed.icon}</span>
            <h3 className="text-xl font-bold font-storybook text-stone-900">
              제 {seed.id}호 {seed.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-stone-700 hover:bg-stone-100 flex items-center justify-center shadow-xs transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Seed Visual */}
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-b from-amber-100 to-amber-200/50 border-4 border-white shadow-lg flex items-center justify-center mb-4">
            <span className="text-5xl animate-bounce">{seed.collected ? '🌻' : seed.icon}</span>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-stone-900 font-extrabold flex items-center justify-center text-xs shadow">
              #{seed.id}
            </div>
          </div>

          {/* Theme Tag */}
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold mb-3">
            우정의 가치: {seed.theme}
          </span>

          {/* Friendship Mission Message */}
          <div className="w-full bg-amber-50/80 rounded-2xl p-4 border border-amber-200 mb-4 shadow-inner">
            <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug font-storybook">
              "{seed.message}"
            </p>
          </div>

          {/* Read Aloud Button for Children */}
          <button
            onClick={handleReadAloud}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition mb-5 ${
              isSpeaking
                ? 'bg-amber-400 text-stone-900 animate-pulse'
                : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200'
            }`}
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>{isSpeaking ? '목소리로 읽어주는 중...' : '동화 목소리로 듣기'}</span>
          </button>

          {/* Finder Child Record Form */}
          <form onSubmit={handleSaveFinder} className="w-full pt-3 border-t border-stone-200 text-left">
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              이 홀씨를 찾은 친구:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={finderInput}
                onChange={(e) => setFinderInput(e.target.value)}
                placeholder="예: 민준이, 서아"
                className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="py-2 px-3 bg-amber-300 hover:bg-amber-400 text-stone-900 text-xs font-bold rounded-xl shadow-xs transition"
              >
                저장
              </button>
            </div>
            {seed.collectedBy && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{seed.collectedBy} 친구가 찾았어요!</span>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
