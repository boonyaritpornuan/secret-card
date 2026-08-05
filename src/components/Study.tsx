import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, HelpCircle, Check, X, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { Card, SetProgress } from '../types';

interface StudyProps {
  setLabel: string;
  cards: Card[];
  savedProgress?: SetProgress;
  onBack: (lastIndex: number, cardResults: ('got' | 'miss' | null)[]) => void;
  onFinishSet: (rememberedCount: number, missedCount: number, missedIndexes: number[]) => void;
}

export default function Study({ setLabel, cards, savedProgress, onBack, onFinishSet }: StudyProps) {
  const [idx, setIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [cardResults, setCardResults] = useState<('got' | 'miss' | null)[]>(
    new Array(cards.length).fill(null)
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Countdown timer: 30 minutes in seconds
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Overlay state to ask whether to resume from last saved progress
  const [showResumeModal, setShowResumeModal] = useState<boolean>(() => {
    if (savedProgress && !savedProgress.completed && savedProgress.lastIndex !== undefined && savedProgress.cardResults !== undefined) {
      const answered = savedProgress.cardResults.filter(r => r !== null).length;
      return answered > 0 && answered < cards.length;
    }
    return false;
  });

  // Active card
  const currentCard = cards[idx] || { q: "ไม่มีข้อสอบ", a: "ไม่มีข้อสอบ" };

  // Sound effects generator using built-in Web Audio API
  const playBeep = (freq: number, type: 'sine' | 'triangle', duration: number) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);

      // Close AudioContext to prevent leak
      setTimeout(() => {
        audioCtx.close().catch(() => {});
      }, (duration * 1000) + 100);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  const handleTimeUp = () => {
    // Automatically submit results
    const got = cardResults.filter((r) => r === 'got').length;
    const miss = cardResults.filter((r) => r === 'miss' || r === null).length;
    const missedIndexes = cardResults
      .map((r, i) => (r === 'miss' || r === null ? i : -1))
      .filter((i) => i !== -1);
    
    alert("หมดเวลาแล้ว! กำลังสรุปคะแนนในการฝึกซ้อม");
    onFinishSet(got, miss, missedIndexes);
  };

  // Keep a Ref to handleTimeUp so the interval effect closure is never stale
  const handleTimeUpRef = useRef(handleTimeUp);
  useEffect(() => {
    handleTimeUpRef.current = handleTimeUp;
  }, [handleTimeUp]);

  // Timer loop
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle marking card as Got (remembered) or Miss (not remembered)
  const handleMark = (isCorrect: boolean) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Play subtle audio cue
    if (isCorrect) {
      playBeep(650, 'triangle', 0.15);
    } else {
      playBeep(280, 'sine', 0.18);
    }

    // Save result
    const nextResults = [...cardResults];
    nextResults[idx] = isCorrect ? 'got' : 'miss';
    setCardResults(nextResults);

    // Fade card flip back before advancing
    setIsFlipped(false);

    // Timeout to coordinate the transition
    setTimeout(() => {
      if (idx < cards.length - 1) {
        setIdx((prev) => prev + 1);
        setIsTransitioning(false);
      } else {
        // Complete the set!
        const finalGot = nextResults.filter((r) => r === 'got').length;
        const finalMiss = nextResults.filter((r) => r === 'miss' || r === null).length;
        const finalMissedIndexes = nextResults
          .map((r, i) => (r === 'miss' || r === null ? i : -1))
          .filter((i) => i !== -1);
        
        onFinishSet(finalGot, finalMiss, finalMissedIndexes);
      }
    }, 120);
  };

  // Keyboard navigation hotkeys for speedy computer users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
        playBeep(450, 'sine', 0.08);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        handleMark(false);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        handleMark(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [idx, cardResults, soundEnabled, isTransitioning]);

  // Format time (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate current sets completion
  const answeredCount = cardResults.filter((r) => r !== null).length;
  const progressPct = (answeredCount / cards.length) * 100;

  return (
    <div className="w-full flex flex-col px-4 pb-12 select-none animate-[fadeIn_200ms_ease] font-sans">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => onBack(idx, cardResults)}
          className="flex items-center gap-1 text-[13px] font-bold text-[#ff8c30]/90 bg-[#0c1f38] border border-[#8c3e08]/30 px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>หน้าหลัก</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                // simple tester sound
                setTimeout(() => {
                  try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    osc.frequency.value = 400;
                    osc.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.1);
                    setTimeout(() => {
                      ctx.close().catch(() => {});
                    }, 200);
                  } catch (e) {}
                }, 50);
              }
            }}
            className="p-2 rounded-lg bg-[#0c1f38] border border-[#8c3e08]/20 text-white/50 hover:text-[#ff8c30] cursor-pointer"
            title={soundEnabled ? "ปิดเสียง" : "เปิดเสียงเอฟเฟกต์"}
          >
            {soundEnabled ? <Volume2 className="h-4.5 w-4.5 text-[#ff8c30]" /> : <VolumeX className="h-4.5 w-4.5" />}
          </button>

          {/* Dedicated countdown widget */}
          <div className="flex items-center gap-1.5 bg-[#0c1f38] px-3.5 py-1.5 rounded-lg border border-[#8c3e08]/30 text-white/90">
            <Clock className="h-4 w-4 text-[#ff8c30] animate-[pulse_1s_infinite]" />
            <span className="font-mono text-[14px] font-bold text-white tracking-widest">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Title description of set */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-1.5">
          <span className="text-[14px] font-bold text-white/90 tracking-wide">{setLabel}</span>
          <span className="text-[11px] text-white/40 font-mono">
            ข้อ {answeredCount} / {cards.length} ({Math.round(progressPct)}%)
          </span>
        </div>
        <div className="h-2.5 w-full bg-[#0c1f38] rounded-full overflow-hidden border border-[#8c3e08]/15 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-[#e86010] to-[#4ade80] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 3D Flashcard Section */}
      <div className="w-full flex flex-col items-center justify-center my-4 relative">
        <div 
          onClick={() => {
            setIsFlipped(!isFlipped);
            playBeep(450, 'sine', 0.08);
          }}
          className="relative h-[340px] w-full max-w-[420px] cursor-pointer"
          style={{ perspective: '1000px' }}
        >
          {/* Card Rotator */}
          <div 
            className="relative w-full h-full transition-all duration-500 ease-in-out"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* FRONT FACE (Dark, premium orange trim) */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#0c1f38] to-[#061422] border-2 border-[#8c3e08]/40 rounded-2xl p-6 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Card Label */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold tracking-[2px] text-[#ff8c30] bg-[#f07020]/15 px-3 py-1 rounded-full border border-[#f07020]/25">
                  คำถามข้อที่ {idx + 1}
                </span>
                <HelpCircle className="h-4.5 w-4.5 text-white/20" />
              </div>

              {/* Scrollable Question Text area */}
              <div className="my-auto overflow-y-auto max-h-[190px] pr-1 scrollbar-thin text-center flex items-center justify-center">
                <p className="text-[17px] font-bold text-white line-height-[1.7] tracking-wide">
                  {currentCard.q}
                </p>
              </div>

              {/* Bottom Cue */}
              <div className="text-center animate-[pulse_2s_infinite]">
                <span className="text-[10px] font-bold text-[#ff8c30]/50 uppercase tracking-widest">
                  แตะการ์ดเพื่อดูเฉลย
                </span>
              </div>
            </div>

            {/* BACK FACE (Light/White, premium contrast) */}
            <div 
              className="absolute inset-0 bg-white border-2 border-[#8c3e08] rounded-2xl p-6 flex flex-col justify-between shadow-[0_12px_45px_rgba(0,0,0,0.7)]"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {/* Back Card Label */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold tracking-[2px] text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
                  เฉลย / คำอธิบาย
                </span>
                <HelpCircle className="h-4.5 w-4.5 text-zinc-300" />
              </div>

              {/* Scrollable answer text area */}
              <div className="my-auto overflow-y-auto max-h-[190px] pr-1 text-center scrollbar-thin flex items-center justify-center">
                <div 
                  className="text-[18px] font-bold text-zinc-900 leading-[1.8] tracking-normal inline-block"
                  dangerouslySetInnerHTML={{ __html: currentCard.a }}
                />
              </div>

              {/* Bottom Cue */}
              <div className="text-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  แตะการ์ดเพื่อกลับไปดูคำถาม
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons (Red / Green) */}
      <div className="w-full max-w-[420px] mx-auto flex items-center gap-4 mt-2 mb-6">
        <button
          onClick={() => handleMark(false)}
          className="flex-1 bg-[#e03e2d] hover:bg-[#c93020] text-white font-extrabold py-4 px-3 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(224,62,45,0.3)] hover:shadow-[0_6px_20px_rgba(224,62,45,0.45)] active:scale-95 transition-all text-[15px] cursor-pointer border-b-4 border-[#9a1a0f]"
        >
          <X className="h-4.5 w-4.5" />
          <span>ยังไม่แม่น</span>
        </button>

        <button
          onClick={() => handleMark(true)}
          className="flex-1 bg-[#16a34a] hover:bg-[#128a3d] text-white font-extrabold py-4 px-3 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.45)] active:scale-95 transition-all text-[15px] cursor-pointer border-b-4 border-[#0e7033]"
        >
          <Check className="h-4.5 w-4.5" />
          <span>จำได้แล้ว</span>
        </button>
      </div>

      {/* Dots navigation block */}
      <div className="w-full max-w-[420px] mx-auto mt-1 flex flex-wrap justify-center gap-1.5 p-3 rounded-xl bg-[#0c1f38]/40 border border-[#8c3e08]/10 shadow-inner">
        {cardResults.map((res, dotIdx) => {
          const isActive = dotIdx === idx;
          const bgClass =
            res === 'got'
              ? 'bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]'
              : res === 'miss'
                ? 'bg-[#f87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                : 'bg-zinc-800 border border-zinc-700/60';

          return (
            <button
              key={dotIdx}
              onClick={() => {
                if (isTransitioning) return;
                setIdx(dotIdx);
                setIsFlipped(false);
                playBeep(400, 'sine', 0.05);
              }}
              className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${bgClass} ${
                isActive ? 'w-6 bg-[#ff8c30] shadow-[0_0_12px_rgba(240,112,32,0.8)]' : 'w-2.5 hover:scale-125'
              }`}
              title={`ข้อที่ ${dotIdx + 1}`}
            />
          );
        })}
      </div>

      {/* PC Hotkey legend */}
      <div className="hidden md:flex items-center justify-center gap-6 mt-4 opacity-35 text-[11px] text-white/50 text-center font-medium">
        <span>[Spacebar] กลับการ์ด</span>
        <span>[← ลูกศรซ้าย] ยังไม่แม่น</span>
        <span>[→ ลูกศรขวา] จำได้แล้ว</span>
      </div>

      {/* Resume Progress Overlay Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-[fadeIn_150ms_ease]">
          <div className="w-full max-w-[360px] bg-gradient-to-b from-[#0d2244] to-[#040e1c] border-2 border-[#ff8c30]/40 rounded-2xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.8)] text-center flex flex-col gap-4 animate-[slideUp_200ms_ease]">
            <RotateCw className="h-10 w-10 text-[#ff8c30] mx-auto animate-[spin_3s_linear_infinite]" />
            <h4 className="text-[16px] font-extrabold text-white">พบประวัติการฝึกฝนเดิม</h4>
            <p className="text-[12px] text-white/70 leading-relaxed">
              คุณทำค้างไว้ที่ข้อที่ <strong className="text-[#ff8c30]">{(savedProgress?.lastIndex ?? 0) + 1}</strong> จากทั้งหมด {cards.length} ข้อ
              <br />
              (จำได้ {savedProgress?.rememberedCount ?? 0} ข้อ, ยังไม่แม่น {savedProgress?.missedCount ?? 0} ข้อ)
            </p>
            
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  if (savedProgress?.lastIndex !== undefined && savedProgress?.cardResults) {
                    setIdx(savedProgress.lastIndex);
                    setCardResults(savedProgress.cardResults);
                  }
                  setShowResumeModal(false);
                }}
                className="w-full bg-gradient-to-r from-[#e86010] to-[#ff8c30] text-white font-extrabold py-3 rounded-xl text-[13px] hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-[0_4px_12px_rgba(232,96,16,0.3)]"
              >
                เรียนต่อจากเดิม
              </button>
              
              <button
                onClick={() => {
                  setShowResumeModal(false);
                }}
                className="w-full bg-[#0c1f38] border border-white/10 text-white/80 font-bold py-3 rounded-xl text-[13px] active:scale-95 transition-all cursor-pointer"
              >
                เริ่มเรียนใหม่ทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
