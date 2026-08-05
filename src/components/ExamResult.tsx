import React from 'react';
import { ExamQuestion } from '../types';
import { CheckCircle2, XCircle, ArrowLeft, RefreshCw, AlertTriangle, ChevronRight } from 'lucide-react';

export default function ExamResult({
  title,
  score,
  questions,
  answers,
  onBack,
  onRetry,
  onReviewMissed,
}: {
  title: string;
  score: number;
  questions: ExamQuestion[];
  answers: Record<number, string>;
  onBack: () => void;
  onRetry: () => void;
  onReviewMissed?: () => void;
}) {
  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Custom feedback strings based on performance
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 font-sans select-none animate-[fadeIn_300ms_ease]">
      {/* Header / Score Card styled like Finish.tsx */}
      <div className="w-full bg-[#0c1f38] border-2 border-[#8c3e08]/30 rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-center flex flex-col items-center mb-8">
        
        {/* Title */}
        <h2 className="text-[20px] font-extrabold text-white/95 mb-1">{title}</h2>
        <span className="text-[12px] text-white/40 font-mono tracking-wider bg-[#061422] px-4 py-1 rounded-full border border-white/5 mb-6">
          สรุปรายงานผลการสอบ
        </span>

        {/* SVG Circle Graph */}
        <div className="relative flex items-center justify-center mb-6">
          <svg className="w-[160px] h-[160px] transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-zinc-800 fill-none"
              strokeWidth={strokeWidth}
              style={{ stroke: '#1c2c3e' }}
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
              SCORE
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
              <span className="text-[11px] font-bold">ตอบถูก</span>
            </div>
            <div className="text-[24px] font-extrabold text-white font-mono leading-none">
              {score} <span className="text-[12px] text-white/30 font-medium">/ {total}</span>
            </div>
          </div>

          <div className="bg-[#061422] rounded-2xl p-4.5 border border-[#e03e2d]/20">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-[#f87171]">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[11px] font-bold">ตอบผิด/ไม่ตอบ</span>
            </div>
            <div className="text-[24px] font-extrabold text-white font-mono leading-none">
              {total - score} <span className="text-[12px] text-white/30 font-medium">/ {total}</span>
            </div>
          </div>
        </div>

        {/* Missed questions review button */}
        {total - score > 0 && onReviewMissed && (
          <button
            onClick={onReviewMissed}
            className="w-full mb-3.5 bg-gradient-to-r from-[#e03e2d] to-[#ff4b3a] hover:brightness-105 hover:shadow-[0_4px_16px_rgba(248,113,113,0.3)] text-white font-extrabold py-4 px-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <span>ทบทวนข้อที่พลาด ({total - score} ข้อ)</span>
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 bg-[#0c1f38] hover:bg-[#122e54] border border-[#ff8c30]/40 text-white font-bold py-3.5 px-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="h-4 w-4 text-[#ff8c30]" />
            <span className="text-[13px]">ทำข้อสอบใหม่อีกครั้ง</span>
          </button>

          <button
            onClick={onBack}
            className="flex-1 bg-white/10 hover:bg-white/15 text-white border border-white/5 font-bold py-3.5 px-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[13px]">กลับหน้ารวมข้อสอบ</span>
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-100 mb-4 px-2">เฉลยคําตอบ</h3>
        {questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.answer;
          const hasAnswered = !!userAnswer;

          return (
            <div key={q.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
              {q.passage && (
                <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 mb-4">
                  <span className="text-indigo-400 font-bold text-xs tracking-wide block mb-2">READING PASSAGE</span>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-[13px]">
                    {q.passage}
                  </p>
                </div>
              )}

              <div className="flex gap-4 mb-4">
                <div className="shrink-0 mt-1">
                  {isCorrect ? (
                    <CheckCircle2 className="text-emerald-500" size={24} />
                  ) : (
                    <XCircle className="text-red-500" size={24} />
                  )}
                </div>
                <div>
                  <h4 className="text-slate-200 leading-relaxed font-medium">
                    {i + 1}. {q.q}
                  </h4>
                </div>
              </div>

              <div className="ml-10 space-y-2">
                {Object.entries(q.choices || {}).map(([key, text]) => {
                  const isUserPick = userAnswer === key;
                  const isActualAnswer = q.answer === key;

                  let rowClass = "text-slate-400 border-transparent bg-slate-800/20";
                  if (isActualAnswer) {
                    rowClass = "text-emerald-100 border-emerald-500/30 bg-emerald-500/10";
                  } else if (isUserPick && !isCorrect) {
                    rowClass = "text-red-200 border-red-500/30 bg-red-500/10";
                  }

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border flex gap-3 ${rowClass}`}
                    >
                      <span className="font-bold shrink-0">{key}.</span>
                      <span className="leading-relaxed">{text}</span>
                      {isUserPick && !isCorrect && (
                        <span className="ml-auto text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-md shrink-0 self-start">
                          คําตอบของคุณ
                        </span>
                      )}
                      {isActualAnswer && (
                        <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-md shrink-0 self-start">
                          เฉลย
                        </span>
                      )}
                    </div>
                  );
                })}
                {!hasAnswered && (
                  <p className="text-red-400 text-sm mt-3 bg-red-500/10 p-2 rounded-lg inline-block">
                    คุณไม่ได้ตอบคําถามข้อนี้
                  </p>
                )}
                {q.explanation && (
                  <div className="mt-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
                    <span className="text-emerald-400 font-bold text-xs tracking-wide block mb-1.5">คำอธิบายเฉลย</span>
                    <p className="text-slate-300 leading-relaxed text-[13px] whitespace-pre-wrap">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
