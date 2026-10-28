import React, { useState, useEffect } from 'react';
import { SeedItem } from '../types/dandelion';
import { generateQRCodeDataUrl } from '../utils/qrHelper';
import { Printer, RotateCcw, Sparkles, CheckSquare, Users, BookOpen, AlertCircle, Scissors } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface TeacherSheetProps {
  seeds: SeedItem[];
  groupName: string;
  setGroupName: (name: string) => void;
  onReset: () => void;
  onCompleteAll: () => void;
  onToggleSeed: (id: number) => void;
}

export const TeacherSheet: React.FC<TeacherSheetProps> = ({
  seeds,
  groupName,
  setGroupName,
  onReset,
  onCompleteAll,
  onToggleSeed,
}) => {
  const [qrImages, setQrImages] = useState<Record<number, string>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  // Preset group names commonly used in Korean preschools/kindergartens
  const presetGroups = ['1모둠 (햇살)', '2모둠 (풀잎)', '3모둠 (꽃잎)', '4모둠 (새싹)', '5모둠 (하늘)'];

  // Generate QR codes for all 10 seeds on mount
  useEffect(() => {
    let isMounted = true;
    async function loadQRs() {
      setIsGenerating(true);
      const results: Record<number, string> = {};
      for (const s of seeds) {
        const dataUrl = await generateQRCodeDataUrl(s.code);
        results[s.id] = dataUrl;
      }
      if (isMounted) {
        setQrImages(results);
        setIsGenerating(false);
      }
    }
    loadQRs();
    return () => {
      isMounted = false;
    };
  }, [seeds]);

  const handlePrint = () => {
    window.print();
  };

  const collectedCount = seeds.filter((s) => s.collected).length;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in text-stone-800">
      {/* Non-print Teacher Control Bar */}
      <div className="print:hidden bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-md border-2 border-amber-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👩‍🏫</span>
              <h2 className="text-2xl font-bold font-storybook text-stone-900">
                선생님 수업 관리 및 QR 도안 인쇄
              </h2>
            </div>
            <p className="text-stone-600 text-sm">
              그림책 『친구의 전설』 연계 실물 홀씨 보물찾기 수업을 준비하고 모둠 순환을 관리합니다.
            </p>
          </div>

          {/* Quick Print Button */}
          <button
            onClick={handlePrint}
            className="py-3 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition font-storybook text-base"
          >
            <Printer className="w-5 h-5 text-stone-900" />
            <span>A4 홀씨 도안 일괄 인쇄하기</span>
          </button>
        </div>

        {/* Group Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Group Name & Selection */}
          <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-amber-200">
            <label className="block text-sm font-bold text-stone-800 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-600" />
              현재 진행 중인 모둠 (그룹)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="예: 햇살반 1모둠"
                className="flex-1 px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-semibold text-stone-800"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presetGroups.map((p) => (
                <button
                  key={p}
                  onClick={() => setGroupName(p)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                    groupName === p
                      ? 'bg-amber-400 text-stone-900 border-amber-500 font-bold'
                      : 'bg-white hover:bg-amber-50 text-stone-700 border-stone-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Activity State & Reset Controls */}
          <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-amber-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  현재 모둠 수집 진행률
                </span>
                <span className="text-sm font-extrabold text-amber-700 font-storybook">
                  {collectedCount} / 10개 발견
                </span>
              </div>
              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${(collectedCount / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다음 모둠을 위해 초기화</span>
              </button>
              <button
                onClick={onCompleteAll}
                className="py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
                title="10개 모두 모은 상태로 바로 만들기"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>10개 즉시 완성 (시연용)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Manual Check Grid for Teacher */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-700">
              선생님 수동 체크 (클릭하여 발견/미발견 상태 전환):
            </span>
            <span className="text-xs text-stone-500">
              스캔이 어려운 유아를 위해 교사가 즉시 체크해줄 수 있어요
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {seeds.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  sounds.playPop();
                  onToggleSeed(s.id);
                }}
                className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                  s.collected
                    ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span>{s.icon}</span>
                  <span className="truncate">{s.id}번 {s.theme}</span>
                </div>
                <span className={`text-xs ${s.collected ? 'text-emerald-600 font-extrabold' : 'text-stone-300'}`}>
                  {s.collected ? '✓' : '○'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Classroom Guide Banner (Non-print) */}
      <div className="print:hidden bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 rounded-2xl p-4 border border-emerald-200 flex items-start gap-3">
        <BookOpen className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-stone-700">
          <h4 className="font-bold text-emerald-900 mb-1">
            💡 교실 실물 보물찾기 진행 팁
          </h4>
          <p className="leading-relaxed">
            1. 아래의 <strong>10개 홀씨 도안을 A4용지나 라벨지에 인쇄</strong>하여 가위로 자릅니다.<br />
            2. 폼폼이, 백업, 깃털 등으로 만든 <strong>실물 민들레 홀씨 소품</strong>에 번호별 QR 도안을 부착합니다.<br />
            3. 교실 곳곳에 숨겨두고 유아들이 보물찾기처럼 찾아와 태블릿으로 스캔하게 지도합니다.
          </p>
        </div>
      </div>

      {/* PRINTABLE A4 CARDS SHEET */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-dashed border-stone-300 print:border-none print:shadow-none print:p-0">
        <div className="text-center mb-6 border-b pb-4">
          <h3 className="text-xl sm:text-2xl font-bold font-storybook text-stone-900">
            🌻 [교실 활동용] 우정의 민들레 홀씨 QR 도안 (총 10종)
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            점선을 따라 가위로 오려 실물 민들레 홀씨 소품에 붙여주세요.
          </p>
        </div>

        {isGenerating ? (
          <div className="py-12 text-center text-stone-500 text-sm">
            도안용 고해상도 QR코드를 생성하고 있습니다...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
            {seeds.map((seed) => (
              <div
                key={seed.id}
                className="relative p-4 rounded-2xl border-2 border-dashed border-amber-300 bg-[#FFFDF7] print:border-stone-400 flex flex-col justify-between page-break-inside-avoid shadow-xs"
              >
                {/* Scissors indicator */}
                <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                  <Scissors className="w-3 h-3" />
                  <span>오리는 선</span>
                </div>

                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">{seed.icon}</span>
                      <span className="text-sm sm:text-base font-extrabold text-stone-900 font-storybook">
                        제 {seed.id}호 {seed.name}
                      </span>
                    </div>
                    <span className="text-[11px] inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold mt-1">
                      우정 키워드: {seed.theme}
                    </span>
                  </div>

                  {/* QR Code Container */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-1 rounded-xl border border-stone-200 shadow-xs flex items-center justify-center shrink-0">
                    {qrImages[seed.id] ? (
                      <img
                        src={qrImages[seed.id]}
                        alt={`Seed ${seed.id} QR`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-[10px] text-stone-400">QR 생성 중</div>
                    )}
                  </div>
                </div>

                {/* Friendship Mission Message from Legend of Friends */}
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 text-xs text-stone-800 mb-2">
                  <span className="font-bold text-amber-900 block mb-0.5">
                    『친구의 전설』 우정 미션:
                  </span>
                  <p className="leading-snug">{seed.message}</p>
                </div>

                {/* Finder Name Blank */}
                <div className="pt-1.5 border-t border-dashed border-stone-200 flex items-center justify-between text-[11px] text-stone-600 font-medium">
                  <span>발견한 친구: __________________</span>
                  <span className="font-mono text-[10px] text-stone-400">
                    {seed.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-amber-300 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 font-storybook">
              홀씨 수집 현황을 초기화할까요?
            </h3>
            <p className="text-xs text-stone-600 mb-5 leading-relaxed">
              새로운 모둠이 수업을 시작할 수 있도록 현재 모은 <strong>{collectedCount}개의 홀씨</strong>가 모두 처음 상태(0개)로 돌아갑니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onReset();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-xs"
              >
                네, 초기화하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
