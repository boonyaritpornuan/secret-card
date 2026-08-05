import { BookOpen, Trophy, Award, ChevronRight, ArrowLeft } from 'lucide-react';

interface HubProps {
  // Active position
  positionName: string;
  onBackToList: () => void;
  // Question bank loading state
  loading?: boolean;
  // Flashcard stats
  completedFlashcardSets: number;
  totalFlashcardSets: number;
  totalRememberedCards: number;
  totalFlashcardCards: number;
  
  // Exam stats
  completedExams: number;
  totalExams: number;
  totalCorrectExamAnswers: number;
  totalExamQuestions: number;
  
  onSelectFlashcards: () => void;
  onSelectExams: () => void;
}

export default function Hub({
  positionName,
  onBackToList,
  loading,
  completedFlashcardSets,
  totalFlashcardSets,
  totalRememberedCards,
  totalFlashcardCards,
  completedExams,
  totalExams,
  totalCorrectExamAnswers,
  totalExamQuestions,
  onSelectFlashcards,
  onSelectExams,
}: HubProps) {
  const flashcardPct = totalFlashcardCards > 0 ? Math.round((totalRememberedCards / totalFlashcardCards) * 100) : 0;
  const examPct = totalExamQuestions > 0 ? Math.round((totalCorrectExamAnswers / totalExamQuestions) * 100) : 0;

  if (loading) {
    return (
      <div className="w-full flex flex-col px-4 pb-12 select-none font-sans">
        <div className="mb-6 flex flex-col items-center text-center">
          <button
            onClick={onBackToList}
            className="self-start mb-3 flex items-center gap-1.5 text-[12px] font-bold text-white/50 bg-[#0c1f38] border border-white/10 px-3.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>เลือกหัวข้ออื่น</span>
          </button>
          <h2 className="text-[18px] font-bold text-white/95">{positionName}</h2>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <div className="h-9 w-9 border-3 border-[#ff8c30] border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] text-white/40 font-bold tracking-wider">กำลังโหลดคลังข้อสอบ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col px-4 pb-12 select-none animate-[fadeIn_300ms_ease] font-sans">
      <div className="mb-6 flex flex-col items-center text-center">
        <button
          onClick={onBackToList}
          className="self-start mb-3 flex items-center gap-1.5 text-[12px] font-bold text-white/50 bg-[#0c1f38] border border-white/10 px-3.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>เลือกหัวข้ออื่น</span>
        </button>
        <h2 className="text-[18px] font-bold text-white/95">{positionName}</h2>
        <p className="text-[11px] text-white/40 tracking-wider">เลือกโหมดการเรียนรู้และติดตามความคืบหน้า</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Flashcard Mode Card Portal */}
        <div 
          onClick={onSelectFlashcards}
          className="w-full bg-[#0c1f38] border-2 border-[#8c3e08]/20 hover:border-[#ff8c30]/40 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(240,112,32,0.15)] transition-all active:scale-[0.98] cursor-pointer flex flex-col gap-3.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#ff8c30]/10 text-[#ff8c30] group-hover:bg-[#ff8c30]/20 transition-colors">
                <BookOpen className="h-5.5 w-5.5" />
              </div>
              <span className="text-[16px] font-extrabold text-white group-hover:text-[#ff8c30] transition-colors">โหมดทบทวนการ์ด (Flashcard)</span>
            </div>
            <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-[#ff8c30] group-hover:translate-x-1 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#061422] rounded-2xl p-3 border border-[#8c3e08]/10 text-center">
              <div className="text-[18px] font-extrabold text-[#ff8c30] font-mono leading-none mb-1">
                {completedFlashcardSets} <span className="text-[11px] text-white/30">/ {totalFlashcardSets}</span>
              </div>
              <div className="text-[9px] text-white/40 font-medium">ชุดที่ทบทวนจบ</div>
            </div>
            <div className="bg-[#061422] rounded-2xl p-3 border border-[#8c3e08]/10 text-center">
              <div className="text-[18px] font-extrabold text-[#4ade80] font-mono leading-none mb-1">
                {totalRememberedCards} <span className="text-[11px] text-white/30">/ {totalFlashcardCards}</span>
              </div>
              <div className="text-[9px] text-[#4ade80]/60 font-medium">จำได้แล้ว</div>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between mb-1.5 px-0.5">
              <span className="text-[10px] text-white/40 font-bold">ความคืบหน้าการจำข้อมูล</span>
              <span className="text-[11px] font-bold text-[#ff8c30] font-mono">{flashcardPct}%</span>
            </div>
            <div className="h-2 w-full bg-[#061422] rounded-full overflow-hidden border border-[#8c3e08]/10 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#e86010] to-[#ff8c30] rounded-full transition-all duration-300"
                style={{ width: `${flashcardPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Exam Mode Card Portal */}
        <div 
          onClick={onSelectExams}
          className="w-full bg-[#0c1f38] border-2 border-indigo-500/20 hover:border-indigo-500/40 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] transition-all active:scale-[0.98] cursor-pointer flex flex-col gap-3.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Award className="h-5.5 w-5.5" />
              </div>
              <span className="text-[16px] font-extrabold text-white group-hover:text-indigo-400 transition-colors">โหมดทำข้อสอบ (Exam Mode)</span>
            </div>
            <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#061422] rounded-2xl p-3 border border-indigo-500/10 text-center">
              <div className="text-[18px] font-extrabold text-indigo-400 font-mono leading-none mb-1">
                {completedExams} <span className="text-[11px] text-white/30">/ {totalExams}</span>
              </div>
              <div className="text-[9px] text-white/40 font-medium">ชุดข้อสอบที่ทำแล้ว</div>
            </div>
            <div className="bg-[#061422] rounded-2xl p-3 border border-indigo-500/10 text-center">
              <div className="text-[18px] font-extrabold text-[#4ade80] font-mono leading-none mb-1">
                {totalCorrectExamAnswers} <span className="text-[11px] text-white/30">/ {totalExamQuestions}</span>
              </div>
              <div className="text-[9px] text-[#4ade80]/60 font-medium">ตอบถูกทั้งหมด</div>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between mb-1.5 px-0.5">
              <span className="text-[10px] text-white/40 font-bold">ความแม่นยำรวมข้อสอบ</span>
              <span className="text-[11px] font-bold text-indigo-400 font-mono">{examPct}%</span>
            </div>
            <div className="h-2 w-full bg-[#061422] rounded-full overflow-hidden border border-indigo-500/10 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-300"
                style={{ width: `${examPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
