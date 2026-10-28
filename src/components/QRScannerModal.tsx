import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, RefreshCw, X, Zap, ZapOff, CheckCircle2, Sparkles } from 'lucide-react';
import { PetalViewfinder } from './PetalViewfinder';
import { parseSeedQR } from '../utils/qrHelper';
import { SeedItem } from '../types/dandelion';
import { sounds } from '../utils/soundEffects';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeedScanned: (seedId: number) => void;
  seeds: SeedItem[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSeedScanned,
  seeds,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [torchAvailable, setTorchAvailable] = useState<boolean>(false);
  const [lastScannedResult, setLastScannedResult] = useState<{ id: number; name: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setErrorMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasCameraPermission(true);

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as { torch?: boolean };
      if (capabilities && capabilities.torch) {
        setTorchAvailable(true);
      } else {
        setTorchAvailable(false);
      }
    } catch (err: unknown) {
      console.warn('Camera error:', err);
      setHasCameraPermission(false);
      setErrorMessage(
        '카메라를 켤 수 없어요. 브라우저 카메라 권한을 확인해주세요!'
      );
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
  }, []);

  const handleSuccessfulScan = useCallback(
    (seedId: number) => {
      const seedObj = seeds.find((s) => s.id === seedId);
      if (!seedObj) return;

      setIsProcessing(true);
      sounds.playChime(1.0 + (seedId * 0.05));
      if (navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }

      setLastScannedResult({
        id: seedId,
        name: seedObj.name,
      });

      onSeedScanned(seedId);

      // Brief celebration pause before auto closing or allowing next
      setTimeout(() => {
        setIsProcessing(false);
        setLastScannedResult(null);
        onClose();
      }, 1600);
    },
    [seeds, onSeedScanned, onClose]
  );

  // Frame scanning loop
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isProcessing) {
      animFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          const detectedSeedId = parseSeedQR(code.data);
          if (detectedSeedId) {
            handleSuccessfulScan(detectedSeedId);
            return;
          }
        }
      }
    }

    animFrameId.current = requestAnimationFrame(scanFrame);
  }, [handleSuccessfulScan, isProcessing]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      animFrameId.current = requestAnimationFrame(scanFrame);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera, scanFrame]);

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.error('Torch error:', err);
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FFFDF5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFE066] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#FFF4B8] via-[#FFF9DB] to-[#E2F7D8] border-b-2 border-[#FDE68A]">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🌻</span>
            <div>
              <h2 className="text-xl font-bold text-stone-800 font-storybook">
                홀씨 QR 찾기
              </h2>
              <p className="text-xs text-stone-600">
                실물 홀씨에 붙은 QR코드를 꽃잎 안에 비춰주세요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 text-stone-700 hover:bg-white flex items-center justify-center shadow-sm transition active:scale-95"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Viewfinder / Video Area */}
        <div className="relative flex-1 min-h-[340px] sm:min-h-[380px] bg-stone-900 flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Floral Petal Viewfinder (as requested by user with flower petal design) */}
          <PetalViewfinder isScanning={!isProcessing && hasCameraPermission === true} />

          {/* Flash & Flip Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {torchAvailable && (
              <button
                onClick={toggleTorch}
                className="w-11 h-11 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center shadow hover:bg-black/70 active:scale-95 transition"
                title="손전등"
              >
                {torchOn ? <Zap className="w-5 h-5 text-amber-300 fill-amber-300" /> : <ZapOff className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={toggleFacingMode}
              className="w-11 h-11 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center shadow hover:bg-black/70 active:scale-95 transition"
              title="카메라 전환"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Child-friendly Guide Banner */}
          <div className="absolute bottom-4 inset-x-4 z-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl py-2 px-4 shadow-lg border border-amber-200 text-center mx-auto max-w-xs">
              <p className="text-sm font-semibold text-amber-900 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                노란 꽃잎 안에 쏙 맞추면 등록돼요!
              </p>
            </div>
          </div>

          {/* Success Overlay Animation */}
          {lastScannedResult && (
            <div className="absolute inset-0 bg-amber-400/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-white text-amber-500 flex items-center justify-center shadow-xl mb-4 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <span className="text-4xl mb-1">🎉</span>
              <h3 className="text-2xl font-bold text-stone-900 font-storybook">
                {lastScannedResult.id}번 홀씨 발견!
              </h3>
              <p className="text-lg text-amber-950 font-semibold mt-1">
                「{lastScannedResult.name}」을(를) 모았어요!
              </p>
            </div>
          )}

          {/* Camera Permission Warning / Fallback */}
          {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-stone-900/95 z-20 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                카메라 연결 안내
              </h4>
              <p className="text-sm text-stone-300 max-w-xs mb-4">
                {errorMessage || '카메라를 사용할 수 없는 환경이거나 권한이 필요합니다.'}
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-[#FFD13B] hover:bg-[#FFE066] text-stone-900 rounded-xl font-bold text-sm shadow transition"
              >
                다시 시도하기
              </button>
            </div>
          )}
        </div>

        {/* Quick Simulator Bar for classroom / sandbox testing */}
        <div className="p-4 bg-[#FFF9DB]/80 border-t border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <span>👉</span> 교사용 빠른 홀씨 등록 (모의 스캔):
            </span>
            <span className="text-xs text-stone-500">
              번호를 누르면 바로 찾은 상태가 돼요!
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {seeds.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSuccessfulScan(s.id)}
                disabled={isProcessing}
                className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border ${
                  s.collected
                    ? 'bg-amber-100/70 border-amber-300 text-amber-800'
                    : 'bg-white hover:bg-amber-50 active:scale-95 border-stone-200 text-stone-800 shadow-sm'
                }`}
              >
                <span className="text-sm">{s.collected ? '🌻' : s.icon}</span>
                <span>{s.id}번</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
