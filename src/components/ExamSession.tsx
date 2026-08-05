import React, { useState, useEffect } from 'react';
import { ExamQuestion } from '../types';
import { X, ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ExamSession({
  title,
  questions,
  onFinish,
  onExit,
}: {
  title: string;
  questions: ExamQuestion[];
  onFinish: (score: number, answers: Record<number, string>) => void;
  onExit: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQ = questions[currentIndex];

  const handleSelect = (choiceKey: string) => {
    if (answers[currentQ.id]) return; // Already answered
    
    const newAnswers = { ...answers, [currentQ.id]: choiceKey };
    setAnswers(newAnswers);

    // If all questions are answered, auto-submit
    const nextAnsweredCount = Object.keys(newAnswers).length;
    if (nextAnsweredCount === questions.length) {
      let score = 0;
      questions.forEach((q) => {
        const ans = q.id === currentQ.id ? choiceKey : answers[q.id];
        if (ans === q.answer) {
          score++;
        }
      });
      setTimeout(() => {
        onFinish(score, newAnswers);
      }, 1000);
    } else {
      // Otherwise, auto-advance to next question if we are not at the very end of the array
      const isLastIndex = currentIndex === questions.length - 1;
      if (!isLastIndex) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 1000);
      }
    }
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        score++;
      }
    });
    onFinish(score, answers);
  };

  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  
  const correctCount = questions.filter(q => answers[q.id] === q.answer).length;
  const correctTotalPct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur border-b border-slate-700/50 p-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-[13px] font-bold text-[#ff8c30]/90 bg-[#0c1f38] border border-[#8c3e08]/30 px-3.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ย้อนกลับ</span>
        </button>

        <div className="flex items-center gap-1.5 bg-[#0c1f38] px-3.5 py-1.5 rounded-lg border border-[#8c3e08]/30 text-white/90 text-xs font-mono font-bold">
          ข้อ {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress HUD Panel */}
      <div className="bg-slate-800/40 border-b border-slate-700/30 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-[14px] font-bold text-white/95 tracking-wide line-clamp-1">{title}</span>
            <span className="text-[11px] text-white/40 font-mono shrink-0">
              ทำแล้ว {answeredCount}/{questions.length} ({Math.round(progressPct)}%) | ถูก {correctCount} ข้อ ({correctTotalPct}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#0c1f38] rounded-full overflow-hidden border border-[#8c3e08]/15 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#e86010] to-[#4ade80] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Passage (if any) */}
          {currentQ.passage && (
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-indigo-500/20">
                <span className="text-indigo-400 font-bold text-sm tracking-wide">READING PASSAGE</span>
              </div>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-[15px]">
                {currentQ.passage}
              </p>
            </div>
          )}

          {/* Question */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg text-slate-100 leading-relaxed">
              <span className="text-slate-400 mr-2">{currentIndex + 1}.</span>
              {currentQ.q}
            </h3>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            {Object.entries(currentQ.choices || {}).map(([key, text]) => {
              const userAnswer = answers[currentQ.id];
              const isAnswered = !!userAnswer;
              const isCorrectAnswer = currentQ.answer === key;
              const isUserChoice = userAnswer === key;
              
              let rowClass = 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600';
              let badgeClass = 'border-slate-600 text-slate-400';
              
              if (isAnswered) {
                if (isCorrectAnswer) {
                  rowClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100';
                  badgeClass = 'bg-emerald-500 border-emerald-500 text-white';
                } else if (isUserChoice && !isCorrectAnswer) {
                  rowClass = 'bg-red-500/20 border-red-500/50 text-red-100';
                  badgeClass = 'bg-red-500 border-red-500 text-white';
                } else {
                  rowClass = 'bg-slate-800/20 border-slate-700/30 text-slate-500 cursor-default opacity-60';
                }
              }

              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${rowClass}`}
                >
                  <div className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center text-xs mt-0.5 ${badgeClass}`}>
                    {key}
                  </div>
                  <span className="leading-relaxed flex-1">{text}</span>
                  {isAnswered && isCorrectAnswer && (
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                  )}
                  {isAnswered && isUserChoice && !isCorrectAnswer && (
                    <X className="text-red-400 shrink-0 mt-0.5" size={20} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation (after answering) */}
          {!!answers[currentQ.id] && currentQ.explanation && (
            <div className="mt-5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-400 font-bold text-sm tracking-wide">คำอธิบายเฉลย</span>
              </div>
              <p className="text-slate-200 leading-relaxed text-[14px] whitespace-pre-wrap">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Dots navigation block */}
          <div className="mt-8 flex flex-wrap justify-center gap-1.5 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-inner">
            {questions.map((q, dotIdx) => {
              const isActive = dotIdx === currentIndex;
              const userAnswer = answers[q.id];
              const isAnswered = userAnswer !== undefined;
              const isCorrect = userAnswer === q.answer;

              const bgClass = !isAnswered
                ? 'bg-slate-700/40 border border-slate-600/30'
                : isCorrect
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${bgClass} ${
                    isActive ? 'w-6 bg-[#ff8c30] shadow-[0_0_12px_rgba(240,112,32,0.8)] border-[#ff8c30]' : 'w-2.5 hover:scale-125'
                  }`}
                  title={`ข้อที่ ${dotIdx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-slate-800 border-t border-slate-700 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-slate-700"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">ข้อก่อนหน้า</span>
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            ดูผลลัพธ์
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-slate-700"
          >
            <span className="hidden sm:inline">ข้อถัดไป</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
