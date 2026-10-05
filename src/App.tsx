/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import PositionList from './components/PositionList';
import Home from './components/Home';
import Study from './components/Study';
import Finish from './components/Finish';
import ExamList from './components/ExamList';
import ExamSession from './components/ExamSession';
import ExamResult from './components/ExamResult';
import Hub from './components/Hub';
import { Card, Part, SetProgress, ExamProgress, Position, PositionId } from './types';
import { examsIndex, examLoaders } from './exams_index';
import { examsSphuIndex, examsSphuLoaders } from './exams_sphu_index';
import sphuPartsMeta from '../data/sphu/new_parts_meta.json';

export default function App() {
  const [currentView, setCurrentView] = useState<'positionList' | 'hub' | 'home' | 'study' | 'finish' | 'examList' | 'examSession' | 'examResult'>('positionList');
  const [activePositionId, setActivePositionId] = useState<PositionId>('paph');
  const [activePartId, setActivePartId] = useState<number>(1);
  const [activeSetId, setActiveSetId] = useState<string>('');
  const [activeSetLabel, setActiveSetLabel] = useState<string>('');

  // Per-position question bank, lazy-loaded only after a position is selected
  const [positionData, setPositionData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const loadedDataRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (currentView === 'positionList') return;
    if (loadedDataRef.current[activePositionId]) {
      setPositionData(loadedDataRef.current[activePositionId]);
      return;
    }
    let cancelled = false;
    setDataLoading(true);
    const loader =
      activePositionId === 'paph'
        ? import('./questions.json')
        : import('../data/sphu/cards.json');
    loader
      .then((m: any) => {
        if (cancelled) return;
        loadedDataRef.current[activePositionId] = m.default || m;
        setPositionData(loadedDataRef.current[activePositionId]);
      })
      .catch((e) => {
        console.error('Failed to load position data:', e);
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activePositionId, currentView]);
  
  // Flashcards state
  const [studyCards, setStudyCards] = useState<Card[]>([]);
  const [rememberedCount, setRememberedCount] = useState<number>(0);
  const [missedCount, setMissedCount] = useState<number>(0);
  const [missedIndexes, setMissedIndexes] = useState<number[]>([]);
  
  // Track whether we are in "Review Missed Only" study mode
  const [isReviewSession, setIsReviewSession] = useState<boolean>(false);
  // Full deck cache for potential "all" retry
  const [originalSetCards, setOriginalSetCards] = useState<Card[]>([]);

  // Exam state
  const [activeExamId, setActiveExamId] = useState<string>('');
  const [activeExamTitle, setActiveExamTitle] = useState<string>('');
  const [activeExamQuestions, setActiveExamQuestions] = useState<any[]>([]);
  const [activeExamScore, setActiveExamScore] = useState<number>(0);
  const [activeExamAnswers, setActiveExamAnswers] = useState<Record<number, string>>({});
  const [originalExamQuestions, setOriginalExamQuestions] = useState<any[]>([]);
  const [isExamReview, setIsExamReview] = useState<boolean>(false);
  const [examProgressRecords, setExamProgressRecords] = useState<ExamProgress[]>([]);

  // Local storage progress history
  const [progressRecords, setProgressRecords] = useState<SetProgress[]>([]);

  // Load progress history from localStorage (scoped per position)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(activePosition.progressKey);
      setProgressRecords(saved ? JSON.parse(saved) : []);
      const savedExams = localStorage.getItem(activePosition.examProgressKey);
      setExamProgressRecords(savedExams ? JSON.parse(savedExams) : []);
    } catch (e) {
      console.warn("Could not read localStorage records:", e);
    }
  }, [activePositionId]);

  // Sync progress records to localStorage
  const saveProgressToLocalStorage = (records: SetProgress[]) => {
    try {
      localStorage.setItem(activePosition.progressKey, JSON.stringify(records));
      setProgressRecords(records);
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  };

  // Curriculum structure derived from the loaded question bank
  const data = (positionData || {}) as any;
  const part1Sets = [
    { id: 'p1-s1', label: 'ชุดที่ 1', cards: data.rawCards1 ? data.rawCards1.slice(0, 50) : [] },
    { id: 'p1-s2', label: 'ชุดที่ 2', cards: data.rawCards1 ? data.rawCards1.slice(50, 100) : [] },
    { id: 'p1-s3', label: 'ชุดที่ 3', cards: data.rawCards2 ? data.rawCards2.slice(0, 50) : [] },
    { id: 'p1-s4', label: 'ชุดที่ 4', cards: data.rawCards2 ? data.rawCards2.slice(50, 100) : [] },
    { id: 'p1-s5', label: 'ชุดที่ 5', cards: data.rawCards3 ? data.rawCards3.slice(0, 50) : [] },
    { id: 'p1-s6', label: 'ชุดที่ 6', cards: data.rawCards3 ? data.rawCards3.slice(50, 100) : [] },
    { id: 'p1-s7', label: 'ชุดที่ 7', cards: data.rawCards4 ? data.rawCards4.slice(0, 50) : [] },
    { id: 'p1-s8', label: 'ชุดที่ 8', cards: data.rawCards4 ? data.rawCards4.slice(50, 90) : [] },
    { id: 'p1-s9', label: 'ชุดที่ 9', cards: data.rawCards5 ? data.rawCards5.slice(0, 50) : [] },
    { id: 'p1-s10', label: 'ชุดที่ 10', cards: data.rawCards5 ? data.rawCards5.slice(50, 100) : [] },
    { id: 'p1-s11', label: 'ชุดที่ 11', cards: data.rawCards6 ? data.rawCards6.slice(0, 50) : [] },
    { id: 'p1-s12', label: 'ชุดที่ 12', cards: data.rawCards6 ? data.rawCards6.slice(50, 100) : [] },
    { id: 'p1-s13', label: 'ชุดที่ 13', cards: data.rawCards7 ? data.rawCards7.slice(0, 50) : [] },
    { id: 'p1-s14', label: 'ชุดที่ 14', cards: data.rawCards7 ? data.rawCards7.slice(50, 103) : [] },
    { id: 'p1-s15', label: 'ชุดที่ 15', cards: data.rawCards8 ? data.rawCards8.slice(0, 50) : [] },
    { id: 'p1-s16', label: 'ชุดที่ 16', cards: data.rawCards8 ? data.rawCards8.slice(50, 90) : [] },
    { id: 'p1-s17', label: 'ชุดที่ 17', cards: data.rawCards9 ? data.rawCards9.slice(0, 50) : [] },
    { id: 'p1-s18', label: 'ชุดที่ 18', cards: data.rawCards9 ? data.rawCards9.slice(50, 93) : [] },
    { id: 'p1-s19', label: 'ชุดที่ 19', cards: data.rawCards10 ? data.rawCards10.slice(0, 50) : [] },
    { id: 'p1-s20', label: 'ชุดที่ 20', cards: data.rawCards10 ? data.rawCards10.slice(50, 100) : [] }
  ];

  const part2Sets = [
    { id: 'p2-s1', label: 'ชุดที่ 1', cards: data.rawCards_p2a ? data.rawCards_p2a.slice(0, 50) : [] },
    { id: 'p2-s2', label: 'ชุดที่ 2', cards: data.rawCards_p2a ? data.rawCards_p2a.slice(50, 100) : [] },
    { id: 'p2-s3', label: 'ชุดที่ 3', cards: data.rawCards_p2b ? data.rawCards_p2b.slice(0, 50) : [] },
    { id: 'p2-s4', label: 'ชุดที่ 4', cards: data.rawCards_p2b ? data.rawCards_p2b.slice(50, 100) : [] },
    { id: 'p2-s5', label: 'ชุดที่ 5', cards: data.rawCards_p2c ? data.rawCards_p2c.slice(0, 50) : [] },
    { id: 'p2-s6', label: 'ชุดที่ 6', cards: data.rawCards_p2c ? data.rawCards_p2c.slice(50, 100) : [] },
    { id: 'p2-s7', label: 'ชุดที่ 7', cards: data.rawCards_p2d ? data.rawCards_p2d.slice(0, 50) : [] },
    { id: 'p2-s8', label: 'ชุดที่ 8', cards: data.rawCards_p2d ? data.rawCards_p2d.slice(50, 100) : [] },
    { id: 'p2-s9', label: 'ชุดที่ 9', cards: data.rawCards_p2e ? data.rawCards_p2e.slice(0, 50) : [] },
    { id: 'p2-s10', label: 'ชุดที่ 10', cards: data.rawCards_p2e ? data.rawCards_p2e.slice(50, 100) : [] },
    { id: 'p2-s11', label: 'ชุดที่ 11', cards: data.rawCards_p2f ? data.rawCards_p2f.slice(0, 50) : [] },
    { id: 'p2-s12', label: 'ชุดที่ 12', cards: data.rawCards_p2f ? data.rawCards_p2f.slice(50, 100) : [] },
    { id: 'p2-s13', label: 'ชุดที่ 13', cards: data.rawCards_p2g ? data.rawCards_p2g.slice(0, 50) : [] },
    { id: 'p2-s14', label: 'ชุดที่ 14', cards: data.rawCards_p2g ? data.rawCards_p2g.slice(50, 100) : [] },
    { id: 'p2-s15', label: 'ชุดที่ 15', cards: data.rawCards_p2h ? data.rawCards_p2h.slice(0, 50) : [] },
    { id: 'p2-s16', label: 'ชุดที่ 16', cards: data.rawCards_p2h ? data.rawCards_p2h.slice(50, 100) : [] },
    { id: 'p2-s17', label: 'ชุดที่ 17', cards: data.rawCards_p2i ? data.rawCards_p2i.slice(0, 50) : [] },
    { id: 'p2-s18', label: 'ชุดที่ 18', cards: data.rawCards_p2i ? data.rawCards_p2i.slice(50, 100) : [] },
    { id: 'p2-s19', label: 'ชุดที่ 19', cards: data.rawCards_p2j ? data.rawCards_p2j.slice(0, 50) : [] },
    { id: 'p2-s20', label: 'ชุดที่ 20', cards: data.rawCards_p2j ? data.rawCards_p2j.slice(50, 100) : [] }
  ];

  const part3Sets = [
    { id: 'p3-s1', label: 'ชุดที่ 1', cards: data.rawCards_p3a ? data.rawCards_p3a.slice(0, 50) : [] },
    { id: 'p3-s2', label: 'ชุดที่ 2', cards: data.rawCards_p3a ? data.rawCards_p3a.slice(50, 100) : [] },
    { id: 'p3-s3', label: 'ชุดที่ 3', cards: data.rawCards_p3b ? data.rawCards_p3b.slice(0, 50) : [] },
    { id: 'p3-s4', label: 'ชุดที่ 4', cards: data.rawCards_p3b ? data.rawCards_p3b.slice(50, 100) : [] },
    { id: 'p3-s5', label: 'ชุดที่ 5', cards: data.rawCards_p3c ? data.rawCards_p3c.slice(0, 50) : [] },
    { id: 'p3-s6', label: 'ชุดที่ 6', cards: data.rawCards_p3c ? data.rawCards_p3c.slice(50, 100) : [] },
    { id: 'p3-s7', label: 'ชุดที่ 7', cards: data.rawCards_p3d ? data.rawCards_p3d.slice(0, 50) : [] },
    { id: 'p3-s8', label: 'ชุดที่ 8', cards: data.rawCards_p3d ? data.rawCards_p3d.slice(50, 100) : [] },
    { id: 'p3-s9', label: 'ชุดที่ 9', cards: data.rawCards_p3e ? data.rawCards_p3e.slice(0, 50) : [] },
    { id: 'p3-s10', label: 'ชุดที่ 10', cards: data.rawCards_p3e ? data.rawCards_p3e.slice(50, 100) : [] }
  ];

  const curriculumParts: Part[] = [
    {
      id: 1,
      title: 'ความรู้เฉพาะตำแหน่ง',
      subtitle: 'นักวิเคราะห์นโยบายและแผน 2569 (1,000 ข้อ)',
      description: 'เนื้อหากฎหมาย พระราชบัญญัติ แผนงาน และนโยบายที่ ปภ. กำกับดูแล',
      sets: part1Sets,
    },
    {
      id: 2,
      title: 'PRO MAX (ความรู้ทั่วไป)',
      subtitle: 'คลังเฉลยเจาะประเด็นรอบตัว',
      description: 'แนวข้อสอบความรู้ทั่วไปและสถานการณ์ประยุกต์',
      sets: part2Sets,
    },
    {
      id: 3,
      title: 'PRO MAX 2 (แนวสอบเก่า)',
      subtitle: 'ชุดสืบค้นข้อสอบเก่า ปภ.',
      description: 'โจทย์เก่าและแนวข้อสอบสำหรับเจาะหัวข้อทบทวนบ่อย',
      sets: part3Sets,
    },
  ];

  const sphuPart1Sets = sphuPartsMeta[0]?.sets.map((s: any) => ({
    id: s.id,
    label: s.label,
    cards: data[s.cardKey] || []
  })) || [];

  const sphuPart2Sets = sphuPartsMeta[1]?.sets.map((s: any) => ({
    id: s.id,
    label: s.label,
    cards: data[s.cardKey] || []
  })) || [];

  const sphuPart3Sets = sphuPartsMeta[2]?.sets.map((s: any) => ({
    id: s.id,
    label: s.label,
    cards: data[s.cardKey] || []
  })) || [];

  const sphuParts: Part[] = [
    {
      id: 1,
      title: 'ภาค ก (18 ชุด)',
      subtitle: 'ความรู้ความสามารถทั่วไป 18 หมวด',
      description: 'คณิตศาสตร์ อนุกรม ภาษาไทย ภาษาอังกฤษ และการใช้เหตุผล',
      sets: sphuPart1Sets,
    },
    {
      id: 2,
      title: 'ภาค ข 1 (22 ชุด)',
      subtitle: 'ระเบียบ นโยบาย และกฎหมาย สพฐ. 22 หมวด',
      description: 'พรบ. การศึกษา, พรบ. ข้าราชการครู, ระเบียบสารบรรณ, นโยบายรัฐบาล และแผนแม่บท',
      sets: sphuPart2Sets,
    },
    {
      id: 3,
      title: 'ภาค ข 2 (17 ชุด)',
      subtitle: 'ความรู้เฉพาะตำแหน่ง นักวิชาการคอมพิวเตอร์ สพฐ. (รวมชุดเดิมและชุดใหม่ 17 หมวด)',
      description: 'ระบบสารสนเทศ, เครือข่าย, ฐานข้อมูล, ความปลอดภัย, การเขียนโปรแกรม, บำรุงรักษา และ พรบ. คอมพิวเตอร์',
      sets: sphuPart3Sets,
    },
  ];

  const toExamItem = (e: { id: string; title: string; count: number }) => ({
    id: e.id,
    title: e.title,
    count: e.count,
  });

  const positions: Record<PositionId, Position> = {
    paph: {
      id: 'paph',
      name: 'นักวิเคราะห์นโยบายและแผน',
      subtitle: 'นักวิเคราะห์นโยบายและแผน 2569 ปภ.',
      tagline: 'กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)',
      badge: 'PERSONAL TUTOR',
      parts: curriculumParts,
      exams: examsIndex.map(toExamItem),
      examLoaders: examLoaders,
      progressKey: 'sc_progress_records',
      examProgressKey: 'sc_exam_progress_records',
    },
    sphu: {
      id: 'sphu',
      name: 'นักวิชาการคอมพิวเตอร์ปฏิบัติการ',
      subtitle: 'นักวิชาการคอมพิวเตอร์ปฏิบัติการ สพฐ.',
      tagline: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
      badge: 'PERSONAL TUTOR',
      parts: sphuParts,
      exams: examsSphuIndex.map(toExamItem),
      examLoaders: examsSphuLoaders,
      progressKey: 'sc_progress_records_sphu',
      examProgressKey: 'sc_exam_progress_records_sphu',
    },
  };

  const activePosition = positions[activePositionId];

  // Select a set of cards and enter study mode
  const handleSelectSet = (partId: number, setId: string, setLabel: string) => {
    // Locate cards within the sets array
    const part = activePosition.parts.find((p) => p.id === partId);
    if (!part) return;
    const currentSetObj = part.sets.find((s) => s.id === setId);
    if (!currentSetObj) return;

    setActivePartId(partId); // Update activePartId to match selected part
    setActiveSetId(setId);
    setActiveSetLabel(`${part.title} / ${setLabel}`);
    setStudyCards(currentSetObj.cards);
    setOriginalSetCards(currentSetObj.cards);
    setIsReviewSession(false);
    
    // Switch view
    setCurrentView('study');
  };

  // Complete study and save progress stats
  const handleFinishSet = (finalRemembered: number, finalMissed: number, finalMissedIndexes: number[]) => {
    setRememberedCount(finalRemembered);
    setMissedCount(finalMissed);

    // Map subset indexes back to originalSetCards indexes if in review session
    let mappedMissedIndexes = finalMissedIndexes;
    if (isReviewSession && studyCards.length !== originalSetCards.length) {
      mappedMissedIndexes = finalMissedIndexes.map(subsetIdx => {
        const missedCard = studyCards[subsetIdx];
        if (!missedCard) return -1;
        return originalSetCards.findIndex(c => c.q === missedCard.q && c.a === missedCard.a);
      }).filter(idx => idx !== -1);
    }
    setMissedIndexes(mappedMissedIndexes);

    // Save progress records ONLY if it was a standard complete deck session
    if (!isReviewSession) {
      const updatedRecords = [...progressRecords];
      const existingIdx = updatedRecords.findIndex((r) => r.setId === activeSetId);

      const record: SetProgress = {
        setId: activeSetId,
        partId: activePartId,
        label: activeSetLabel,
        completed: true,
        rememberedCount: finalRemembered,
        missedCount: finalMissed,
        totalCount: studyCards.length,
        unlocked: true,
        lastUpdated: new Date().toISOString(),
        lastIndex: undefined,
        cardResults: undefined,
      };

      if (existingIdx !== -1) {
        updatedRecords[existingIdx] = record;
      } else {
        updatedRecords.push(record);
      }

      saveProgressToLocalStorage(updatedRecords);
    }

    setCurrentView('finish');
  };

  // Exit study mode, saving partial progress
  const handleExitStudy = (lastIndex: number, cardResults: ('got' | 'miss' | null)[]) => {
    if (!isReviewSession) {
      const finalRemembered = cardResults.filter((r) => r === 'got').length;
      const finalMissed = cardResults.filter((r) => r === 'miss').length;
      
      const updatedRecords = [...progressRecords];
      const existingIdx = updatedRecords.findIndex((r) => r.setId === activeSetId);

      const record: SetProgress = {
        setId: activeSetId,
        partId: activePartId,
        label: activeSetLabel,
        completed: false, // Marks that the set is not fully completed yet
        rememberedCount: finalRemembered,
        missedCount: finalMissed,
        totalCount: originalSetCards.length,
        unlocked: true,
        lastUpdated: new Date().toISOString(),
        lastIndex: lastIndex,
        cardResults: cardResults,
      };

      if (existingIdx !== -1) {
        updatedRecords[existingIdx] = record;
      } else {
        updatedRecords.push(record);
      }

      saveProgressToLocalStorage(updatedRecords);
    }
    
    setCurrentView('home');
  };

  // Start "Review Missed Cards Only" (Focus Study Session)
  const handleReviewMissed = () => {
    if (missedIndexes.length === 0) return;
    
    // Filter missed cards from original database
    const subsetCards = originalSetCards.filter((_, idx) => missedIndexes.includes(idx));
    
    setStudyCards(subsetCards);
    setIsReviewSession(true);
    setCurrentView('study');
  };

  // Retry the entire set (all cards)
  const handleRetryAll = () => {
    setStudyCards(originalSetCards);
    setIsReviewSession(false);
    setCurrentView('study');
  };

  // Delete all scores and history progress (both flashcards and exams)
  const handleResetAllProgress = () => {
    setProgressRecords([]);
    setExamProgressRecords([]);
    try {
      localStorage.removeItem(activePosition.progressKey);
      localStorage.removeItem(activePosition.examProgressKey);
      if (activePositionId === 'paph') {
        localStorage.removeItem('sc_progress_records');
        localStorage.removeItem('sc_exam_progress_records');
      } else {
        localStorage.removeItem('sc_progress_records_sphu');
        localStorage.removeItem('sc_exam_progress_records_sphu');
      }
    } catch (e) {
      console.warn("Could not clear progress from localStorage:", e);
    }
  };

  // Reset flashcards progress only
  const handleResetFlashcardProgress = () => {
    setProgressRecords([]);
    try {
      localStorage.removeItem(activePosition.progressKey);
      if (activePositionId === 'paph') {
        localStorage.removeItem('sc_progress_records');
      } else {
        localStorage.removeItem('sc_progress_records_sphu');
      }
    } catch (e) {
      console.warn("Could not clear flashcard progress from localStorage:", e);
    }
  };

  // Reset exam scores only
  const handleResetExamProgress = () => {
    setExamProgressRecords([]);
    try {
      localStorage.removeItem(activePosition.examProgressKey);
      if (activePositionId === 'paph') {
        localStorage.removeItem('sc_exam_progress_records');
      } else {
        localStorage.removeItem('sc_exam_progress_records_sphu');
      }
    } catch (e) {
      console.warn("Could not clear exam progress from localStorage:", e);
    }
  };

  // Flashcard calculations
  const totalFlashcardSets = activePosition.parts.reduce((sum, p) => sum + p.sets.length, 0);
  const totalFlashcardCards = activePosition.parts.reduce((sum, p) => {
    return sum + p.sets.reduce((sSum, s) => sSum + s.cards.length, 0);
  }, 0);
  const completedFlashcardSets = progressRecords.filter(r => r.completed).length;
  const totalRememberedCards = progressRecords.reduce((sum, r) => sum + (r.rememberedCount || 0), 0);

  // Exam calculations
  const totalExams = activePosition.exams.length;
  const totalExamQuestions = activePosition.exams.reduce((sum, e) => sum + e.count, 0);
  const completedExams = examProgressRecords.length;
  const totalCorrectExamAnswers = examProgressRecords.reduce((sum, r) => sum + (r.score || 0), 0);

  return (
    <div className="min-h-screen w-full bg-[#061422] text-white font-sans flex flex-col items-center">
      {/* Outer frame styling for desktop, responsive fullscreen on mobile */}
      <div className="w-full max-w-[480px] bg-gradient-to-b from-[#0d2244]/40 to-[#040e1c] min-h-screen flex flex-col border-x border-[#8c3e08]/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Persistent App Header (if not on the position list screen) */}
        {currentView !== 'positionList' && (
          <header className="sticky top-0 z-50 bg-[#061422] border-b border-[#8c3e08]/30 px-5 py-4 flex flex-col gap-1.5 shadow-[0_4px_24px_rgba(6,20,34,0.6)]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[17px] font-extrabold tracking-[3px] bg-gradient-to-b from-[#ffb060] to-[#f07020] bg-clip-text text-transparent select-none">
                  SECRET CARD
                </h1>
                <p className="text-[10px] text-white/40 font-bold select-none uppercase tracking-[0.5px]">
                  {activePosition.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-[#f07020]/15 border border-[#f07020]/35 px-2.5 py-0.5 rounded-full select-none">
                <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse" />
                <span className="text-[9px] font-extrabold text-[#ff8c30] tracking-[0.5px]">{activePosition.badge}</span>
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Route View container */}
        <div className="flex-1 flex flex-col justify-start pt-4">
          {currentView === 'positionList' && (
            <PositionList
              onStart={(pos: PositionId) => {
                setActivePositionId(pos);
                setActivePartId(1);
                setCurrentView('hub');
              }}
            />
          )}

          {currentView === 'hub' && (
            <Hub
              loading={dataLoading}
              positionName={activePosition.name}
              onBackToList={() => setCurrentView('positionList')}
              completedFlashcardSets={completedFlashcardSets}
              totalFlashcardSets={totalFlashcardSets}
              totalRememberedCards={totalRememberedCards}
              totalFlashcardCards={totalFlashcardCards}
              completedExams={completedExams}
              totalExams={totalExams}
              totalCorrectExamAnswers={totalCorrectExamAnswers}
              totalExamQuestions={totalExamQuestions}
              onSelectFlashcards={() => setCurrentView('home')}
              onSelectExams={() => setCurrentView('examList')}
              onResetAll={handleResetAllProgress}
            />
          )}

          {currentView === 'home' && (
            <Home
              parts={activePosition.parts}
              selectedPartId={activePartId}
              onSelectPart={setActivePartId}
              onSelectSet={handleSelectSet}
              progressRecords={progressRecords}
              onResetAllProgress={handleResetFlashcardProgress}
              onOpenExamMode={() => setCurrentView('examList')}
              onGoToHub={() => setCurrentView('hub')}
            />
          )}

          {currentView === 'study' && (
            <Study
              setLabel={isReviewSession ? `ทบทวนข้อที่พลาด · ${activeSetLabel}` : activeSetLabel}
              cards={studyCards}
              savedProgress={progressRecords.find((r) => r.setId === activeSetId)}
              onBack={handleExitStudy}
              onFinishSet={handleFinishSet}
            />
          )}

          {currentView === 'finish' && (
            <Finish
              setLabel={activeSetLabel}
              rememberedCount={rememberedCount}
              missedCount={missedCount}
              totalCount={studyCards.length}
              missedIndexes={missedIndexes}
              onReviewMissed={handleReviewMissed}
              onRetryAll={handleRetryAll}
              onGoHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'examList' && (
            <ExamList
              exams={activePosition.exams}
              loaders={activePosition.examLoaders}
              onSelectExam={(examId, questions) => {
                setActiveExamId(examId);
                setActiveExamTitle(examId.split('/').pop()?.replace('.json', '') || 'Exam');
                setActiveExamQuestions(questions);
                setOriginalExamQuestions(questions);
                setIsExamReview(false);
                setCurrentView('examSession');
              }}
              onGoToHub={() => setCurrentView('hub')}
              completedExams={completedExams}
              totalExams={totalExams}
              totalCorrectExamAnswers={totalCorrectExamAnswers}
              totalExamQuestions={totalExamQuestions}
              examProgressRecords={examProgressRecords}
              onResetExamProgress={handleResetExamProgress}
            />
          )}

          {currentView === 'examSession' && (
            <ExamSession
              title={isExamReview ? `ทบทวนข้อที่พลาด · ${activeExamTitle}` : activeExamTitle}
              questions={activeExamQuestions}
              onExit={() => setCurrentView('examList')}
              onFinish={(score, answers) => {
                setActiveExamScore(score);
                setActiveExamAnswers(answers);
                
                // Save exam progress to localStorage ONLY if it is not a review session
                if (!isExamReview) {
                  const updatedExams = [...examProgressRecords];
                  const existingIdx = updatedExams.findIndex(r => r.examId === activeExamId);
                  
                  const record: ExamProgress = {
                    examId: activeExamId,
                    title: activeExamTitle,
                    score: score,
                    totalQuestions: activeExamQuestions.length,
                    completed: true,
                    lastUpdated: new Date().toISOString()
                  };
                  
                  if (existingIdx !== -1) {
                    updatedExams[existingIdx] = record;
                  } else {
                    updatedExams.push(record);
                  }
                  
                  localStorage.setItem(activePosition.examProgressKey, JSON.stringify(updatedExams));
                  setExamProgressRecords(updatedExams);
                }
                
                setCurrentView('examResult');
              }}
            />
          )}

          {currentView === 'examResult' && (
            <ExamResult
              title={activeExamTitle}
              score={activeExamScore}
              questions={activeExamQuestions}
              answers={activeExamAnswers}
              onBack={() => setCurrentView('examList')}
              onRetry={() => {
                setActiveExamQuestions(originalExamQuestions);
                setIsExamReview(false);
                setCurrentView('examSession');
              }}
              onReviewMissed={() => {
                const missed = originalExamQuestions.filter(q => activeExamAnswers[q.id] !== q.answer);
                setActiveExamQuestions(missed);
                setIsExamReview(true);
                setCurrentView('examSession');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
