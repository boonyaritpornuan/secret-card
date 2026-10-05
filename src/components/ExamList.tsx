import React, { useState, useMemo } from 'react';
import { ExamProgress, ExamQuestion } from '../types';
import { ArrowLeft, Trophy, Play, Search, Layers } from 'lucide-react';

export default function ExamList({
  exams,
  loaders,
  onSelectExam,
  onGoToHub,
  completedExams,
  totalExams,
  totalCorrectExamAnswers,
  totalExamQuestions,
  examProgressRecords,
}: {
  exams: { id: string; title: string; count: number }[];
  loaders: Record<string, () => Promise<any>>;
  onSelectExam: (examId: string, questions: ExamQuestion[]) => void;
  onGoToHub: () => void;
  completedExams: number;
  totalExams: number;
  totalCorrectExamAnswers: number;
  totalExamQuestions: number;
  examProgressRecords: ExamProgress[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleStart = async (examId: string) => {
    try {
      const loader = loaders[examId];
      if (loader) {
        const module: any = await loader();
        const questions = module.default as ExamQuestion[];
        onSelectExam(examId, questions);
      }
    } catch (e) {
      console.error("Error loading exam:", e);
    }
  };

  const overallExamPct = totalExamQuestions > 0 ? (totalCorrectExamAnswers / totalExamQuestions) * 100 : 0;

  // Check if exams have category prefixes like [ภาค ก], [ภาค ข 1], [ภาค ข 2]
  const hasCategories = useMemo(() => {
    return exams.some(e => e.title.startsWith('['));
  }, [exams]);

  const categories = useMemo(() => {
    if (!hasCategories) return [];
    return [
      { id: 'all', label: 'ทั้งหมด', count: exams.length },
      { id: 'k', label: 'ภาค ก', count: exams.filter(e => e.title.includes('[ภาค ก]')).length },
      { id: 'kb1', label: 'ภาค ข 1', count: exams.filter(e => e.title.includes('[ภาค ข 1]')).length },
      { id: 'kb2', label: 'ภาค ข 2', count: exams.filter(e => e.title.includes('[ภาค ข 2]')).length },
    ].filter(c => c.id === 'all' || c.count > 0);
  }, [exams, hasCategories]);

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      // Category filter
      if (hasCategories && selectedCategory !== 'all') {
        if (selectedCategory === 'k' && !exam.title.includes('[ภาค ก]')) return false;
        if (selectedCategory === 'kb1' && !exam.title.includes('[ภาค ข 1]')) return false;
        if (selectedCategory === 'kb2' && !exam.title.includes('[ภาค ข 2]')) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return exam.title.toLowerCase().includes(q);
      }
      return true;
    });
  }, [exams, hasCategories, selectedCategory, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 font-sans select-none animate-[fadeIn_300ms_ease]">
      {/* Back to Hub Button */}
      <div className="mb-4 flex justify-start">
        <button
          onClick={onGoToHub}
          className="flex items-center gap-1.5 text-[13px] font-bold text-[#ff8c30]/90 bg-[#0c1f38] border border-[#8c3e08]/30 px-3.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>กลับหน้าแรก</span>
        </button>
      </div>

      {/* Upper Statistics HUD Card for Exams */}
      <div className="w-full bg-[#0c1f38] border border-indigo-500/30 rounded-2xl p-4.5 mb-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#ff8c30]" />
            <span className="text-[14px] font-bold text-white/95">โหมดทำข้อสอบ (Exam Mode)</span>
          </div>
          <span className="text-[10px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            ALL SETS
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="bg-[#061422]/70 rounded-xl p-2.5 border border-indigo-500/15 text-center">
            <div className="text-[18px] font-extrabold text-[#ff8c30] font-mono leading-none mb-1">
              {completedExams} / {totalExams}
            </div>
            <div className="text-[9px] text-[#ff8c30]/60 font-medium">ชุดที่สอบแล้ว</div>
          </div>
          <div className="bg-[#061422]/70 rounded-xl p-2.5 border border-indigo-500/15 text-center">
            <div className="text-[18px] font-extrabold text-[#4ade80] font-mono leading-none mb-1">
              {totalCorrectExamAnswers}
            </div>
            <div className="text-[9px] text-[#4ade80]/60 font-medium">ตอบถูกทั้งหมด</div>
          </div>
          <div className="bg-[#061422]/70 rounded-xl p-2.5 border border-indigo-500/15 text-center">
            <div className="text-[18px] font-extrabold text-white/30 font-mono leading-none mb-1">
              {totalExamQuestions}
            </div>
            <div className="text-[9px] text-white/30 font-medium">ข้อสอบทั้งหมด</div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full mt-2">
          <div className="flex justify-between text-[10px] text-white/40 mb-1 font-semibold">
            <span>ภาพรวมความถูกต้องรวม</span>
            <span className="text-indigo-400 font-bold">
              {Math.round(overallExamPct)}%
            </span>
          </div>
          <div className="h-2 w-full bg-[#061422] rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-[#4ade80] rounded-full transition-all duration-300" 
              style={{ width: `${overallExamPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white/90">
              รายการชุดข้อสอบ ({filteredExams.length} / {exams.length} ชุด)
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชุดข้อสอบ..."
              className="w-full bg-[#0c1f38] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Category Tabs (if available) */}
        {hasCategories && categories.length > 1 && (
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#0c1f38]/80 border border-white/5 rounded-xl">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.25)]'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredExams.length === 0 ? (
          <div className="text-center py-12 bg-[#0c1f38]/40 border border-white/5 rounded-2xl text-white/40 text-sm">
            ไม่พบชุดข้อสอบที่ตรงกับการค้นหา
          </div>
        ) : (
          filteredExams.map((exam) => {
            const progress = examProgressRecords.find((r) => r.examId === exam.id);
            const scorePct = progress ? Math.round((progress.score / progress.totalQuestions) * 100) : null;
            
            return (
              <div
                key={exam.id}
                className="bg-[#0c1f38] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:bg-[#12243e] transition-all flex flex-col group"
              >
                <h3 className="text-base font-bold text-white/95 group-hover:text-indigo-400 transition-colors flex-1">{exam.title}</h3>
                
                {scorePct !== null && (
                  <div className="mt-2.5 self-start">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      คะแนนล่าสุด: {progress?.score} / {progress?.totalQuestions} ({scorePct}%)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4.5 pt-3 border-t border-white/5">
                  <span className="text-xs text-white/40 font-semibold">{exam.count} คำถาม</span>
                  <button
                    onClick={() => handleStart(exam.id)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-105 active:scale-95 text-white text-[12px] font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_8px_rgba(99,102,241,0.2)]"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>เริ่มทำข้อสอบ</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
