import { motion } from 'motion/react';
import { Award, CheckCircle2, ChevronRight, Home, RefreshCw, AlertTriangle } from 'lucide-react';

interface FinishProps {
  setLabel: string;
  rememberedCount: number;
  missedCount: number;
  totalCount: number;
  missedIndexes: number[];
  onReviewMissed: () => void;
  onRetryAll: () => void;
  onGoHome: () => void;
}

export default function Finish({
  setLabel,
  rememberedCount,
  missedCount,
  totalCount,
  missedIndexes,
  onReviewMissed,
  onRetryAll,
  onGoHome,
}: FinishProps) {
  // Calculations
  const percentage = totalCount > 0 ? Math.round((rememberedCount / totalCount) * 100) : 0;
  
  // Custom feedback strings based on speed / performance
  let feedbackText = "พยายามอีกนิดนะ ติวสม่ำเสมอเพื่อความแม่นยำ!";
  let ratingText = "กำลังพัฒนา";
  let colorTheme = "text-[#e86010]";

  if (percentage >= 90) {
    feedbackText = "เก่งมาก! ความจำดีเยี่ยม พร้อมสอบแน่นอน!";
    ratingText = "ยอดเยี่ยมที่สุด!";
    colorTheme = "text-[#4ade80]";
  } else if (percentage >= 70) {
    feedbackText = "ดีมาก! ทบทวนข้อที่พลาดอีกเล็กน้อยก็จะสมบูรณ์แบบ!";
    ratingText = "เก่งมาก!";
    colorTheme = "text-[#ffb060]";
  } else if (percentage >= 50) {
    feedbackText = "ผ่านครึ่งทางแล้ว! ทบทวนจุดบกพร่องเพิ่มอีกนิด!";
    ratingText = "ปานกลาง";
    colorTheme = "text-[#ff8c30]";
  }

  // Circular SVG ring configurations
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full flex flex-col px-5 pb-12 select-none animate-[fadeIn_300ms_ease] font-sans">
      <div className="w-full bg-[#0c1f38] border-2 border-[#8c3e08]/30 rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-center flex flex-col items-center">
        
        {/* Title */}
        <h2 className="text-[20px] font-extrabold text-white/95 mb-1">{setLabel}</h2>
        <span className="text-[12px] text-white/40 font-mono tracking-wider bg-[#061422] px-4 py-1 rounded-full border border-white/5 mb-6">
          สรุปรายงานผลการทบทวน
        </span>

        {/* SVG Circle Graph */}
        <div className="relative flex items-center justify-center mb-6">
          <svg className="w-[160px] h-[160px] transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-zinc-850 fill-none"
              strokeWidth={strokeWidth}
            />
            {/* Dynamic foreground progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-[#ff8c30] fill-none transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Centered content block */}
          <div className="absolute flex flex-col items-center">
            <span className="text-[36px] font-extrabold text-white font-mono tracking-tighter leading-none">
              {percentage}%
            </span>
            <span className="text-[10px] text-white/40 uppercase font-mono tracking-[1px] mt-1">
              MEMORIZED
            </span>
          </div>
        </div>

        {/* Rating text and custom review messages */}
        <div className="mb-8 px-2">
          <h3 className={`text-[20px] font-extrabold mb-1.5 ${colorTheme}`}>
            {ratingText}
          </h3>
          <p className="text-[13px] text-white/70 leading-[1.6]">
            {feedbackText}
          </p>
        </div>

        {/* Double Column scoreboard indicators */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-[#061422] rounded-2xl p-4.5 border border-[#16a34a]/20">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-[#4ade80]">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[11px] font-bold">จำได้แล้ว</span>
            </div>
            <div className="text-[24px] font-extrabold text-white font-mono leading-none">
              {rememberedCount} <span className="text-[12px] text-white/30 font-medium">/ {totalCount}</span>
            </div>
          </div>

          <div className="bg-[#061422] rounded-2xl p-4.5 border border-[#e03e2d]/20">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-[#f87171]">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[11px] font-bold">ยังไม่แม่น</span>
            </div>
            <div className="text-[24px] font-extrabold text-white font-mono leading-none">
              {missedCount} <span className="text-[12px] text-white/30 font-medium">/ {totalCount}</span>
            </div>
          </div>
        </div>

        {/* Big Action Column buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* If there are missed items, promote Missed Focus review! */}
          {missedCount > 0 && (
            <button
              onClick={onReviewMissed}
              className="w-full bg-gradient-to-r from-[#e03e2d] to-[#ff4b3a] hover:brightness-105 hover:shadow-[0_4px_16px_rgba(248,113,113,0.3)] text-white font-extrabold py-4 px-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              <span>ทบทวนข้อที่พลาด ({missedCount} ข้อ)</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={onRetryAll}
              className="flex-1 bg-[#0c1f38] hover:bg-[#122e54] border border-[#ff8c30]/40 text-white font-bold py-3.5 px-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-[#ff8c30]" />
              <span className="text-[13px]">ฝึกซ้ำอีกรอบ</span>
            </button>

            <button
              onClick={onGoHome}
              className="flex-1 bg-white/10 hover:bg-white/15 text-white border border-white/5 font-bold py-3.5 px-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span className="text-[13px]">กลับหน้าแรก</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
