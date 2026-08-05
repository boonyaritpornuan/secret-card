import { motion } from 'motion/react';
import { BookOpen, ChevronRight, GraduationCap, MonitorSmartphone, Shield } from 'lucide-react';
import { PositionId } from '../types';

interface PositionListProps {
  onStart: (positionId: PositionId) => void;
}

interface PositionCardInfo {
  id: PositionId;
  title: string;
  year: string;
  org: string;
  desc: string;
  theme: string;
  border: string;
  orgColor: string;
  icon: 'book' | 'computer';
}

// Add new exam tracks here (e.g. { id: 'new', icon: 'book', ... }) and register the
// position config in src/App.tsx with its own curriculum + exams.
const POSITIONS: PositionCardInfo[] = [
  {
    id: 'paph',
    title: 'นักวิเคราะห์นโยบายและแผน',
    year: '2569',
    org: 'ปภ.',
    desc: 'เนื้อหากฎหมาย นโยบาย และแผนงานที่กรมป้องกันและบรรเทาสาธารณภัยกำกับดูแล',
    theme: 'from-[#ff8c30]/15 to-[#e86010]/5 text-[#ff8c30] border-[#f07020]/40',
    border: 'hover:border-[#ff8c30]/60',
    orgColor: 'text-[#ff8c30]',
    icon: 'book',
  },
  {
    id: 'sphu',
    title: 'นักวิชาการคอมพิวเตอร์ปฏิบัติการ',
    year: '',
    org: 'สพฐ.',
    desc: 'คอมพิวเตอร์ กฎหมายเทคโนโลยี สารสนเทศ และความมั่นคงปลอดภัยระบบ',
    theme: 'from-indigo-500/15 to-indigo-400/5 text-indigo-400 border-indigo-500/40',
    border: 'hover:border-indigo-400/60',
    orgColor: 'text-indigo-400',
    icon: 'computer',
  },
];

export default function PositionList({ onStart }: PositionListProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-radial from-[#0d2244] via-[#051326] to-[#040e1c] px-6 text-center select-none font-sans overflow-y-auto">
      {/* Top ambient orange light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-radial from-[rgba(240,112,32,0.15)] to-transparent pointer-events-none rounded-full blur-3xl" />

      <div className="relative w-full max-w-[420px] flex flex-col items-center my-auto py-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative mb-6 flex items-center justify-center"
        >
          <div className="relative z-10 flex h-[110px] w-[110px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#122c54] to-[#0a1833] border-2 border-[#f07020]/40 shadow-[0_0_40px_rgba(240,112,32,0.3)]">
            <div className="relative">
              <Shield className="h-12 w-12 text-[#ff8c30]" />
              <GraduationCap className="absolute top-[12px] left-[12px] h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-3xl font-extrabold tracking-[4px] bg-gradient-to-b from-[#ffb060] via-[#f07020] to-[#ff8c30] bg-clip-text text-transparent">
            SECRET CARD
          </h1>
          <div className="mt-2 mb-2 h-[1px] w-[180px] bg-gradient-to-r from-transparent via-[#f07020]/60 to-transparent" />
          <p className="text-[12px] font-bold text-[#ff8c30]/80 tracking-[1px] uppercase">
            เลือกหัวข้อที่ต้องการติว
          </p>
          <span className="mt-2 text-[10px] text-white/30 font-mono tracking-[0.5px]">
            PERSONAL TUTOR · OFFLINE STUDY ENGINE
          </span>
        </motion.div>

        {/* Position / Topic Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="w-full flex flex-col gap-4 mt-8"
        >
          {POSITIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => onStart(p.id)}
              className={`group w-full text-left bg-[#0c1f38] border-2 border-[#8c3e08]/25 rounded-2xl p-4.5 transition-all active:scale-[0.98] cursor-pointer hover:shadow-[0_8px_28px_rgba(0,0,0,0.5)] ${p.border}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${p.theme}`}>
                    {p.icon === 'book' ? (
                      <BookOpen className="h-6 w-6" />
                    ) : (
                      <MonitorSmartphone className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-extrabold text-white group-hover:text-[#ff8c30] transition-colors">
                      {p.title}
                      {p.year && <span className="text-[#ff8c30]"> {p.year}</span>}
                    </span>
                    <span className={`text-[11px] font-bold ${p.orgColor}`}>
                      {p.org}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[11.5px] text-white/55 leading-relaxed mt-3">{p.desc}</p>
            </button>
          ))}
        </motion.div>
      </div>

      <span className="absolute bottom-6 text-[10px] text-white/20 font-mono">
        PREVALENT OFFLINE STUDY ENGINE v2.0
      </span>
    </div>
  );
}