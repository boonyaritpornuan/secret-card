import { useState, useEffect } from 'react';
import { Award, BookOpen, CheckCircle, Flame, Play, RefreshCw, Trophy, Zap, Smartphone, Code, X, ArrowLeft, Check } from 'lucide-react';
import { Part, SetProgress } from '../types';
import ConfirmResetModal from './ConfirmResetModal';

interface HomeProps {
  parts: Part[];
  selectedPartId: number;
  onSelectPart: (partId: number) => void;
  onSelectSet: (partId: number, setId: string, setLabel: string) => void;
  progressRecords: SetProgress[];
  onResetAllProgress: () => void;
  onOpenExamMode: () => void;
  onGoToHub: () => void;
}

export default function Home({
  parts,
  selectedPartId,
  onSelectPart,
  onSelectSet,
  progressRecords,
  onResetAllProgress,
  onOpenExamMode,
  onGoToHub,
}: HomeProps) {
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);
  const [showApkGuide, setShowApkGuide] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      setShowInstallGuide(true);
    }
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(''), 2500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Find current active part
  const activePart = parts.find((p) => p.id === selectedPartId) || parts[0];

  // Helper to find progress for a given set
  const getProgress = (setId: string) => {
    return progressRecords.find((p) => p.setId === setId);
  };

  // Calculate cumulative stats for active part
  const partSets = activePart.sets;
  const completedSets = partSets.filter((s) => getProgress(s.id)?.completed).length;
  
  const totalRemembered = partSets.reduce((sum, s) => {
    const prog = getProgress(s.id);
    return sum + (prog?.rememberedCount || 0);
  }, 0);

  const totalCardsInPart = partSets.reduce((sum, s) => sum + s.cards.length, 0);
  const hasProgress = progressRecords.length > 0 || completedSets > 0 || totalRemembered > 0;

  const handleConfirmReset = () => {
    setShowResetModal(false);
    onResetAllProgress();
    setToastMessage('ล้างสถิติเรียบร้อยแล้ว');
  };

  return (
    <div className="w-full flex flex-col px-4 pb-12 select-none animate-[fadeIn_300ms_ease]">
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

      {/* Upper Statistics HUD Card */}
      <div className="w-full bg-[#0c1f38] border border-[#8c3e08]/40 rounded-2xl p-4.5 mb-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#ff8c30]" />
            <span className="text-[14px] font-bold text-white/95">{activePart.title}</span>
          </div>
          <span className="text-[10px] bg-[#f07020]/15 border border-[#f07020]/30 text-[#ff8c30] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            UNLOCKED ALL
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="bg-[#061422]/70 rounded-xl p-2.5 border border-[#8c3e08]/15 text-center">
            <div className="text-[18px] font-extrabold text-[#ff8c30]">{completedSets} / {partSets.length}</div>
            <div className="text-[9px] text-[#ff8c30]/60 font-medium">ชุดที่ฝึกจบ</div>
          </div>
          <div className="bg-[#061422]/70 rounded-xl p-2.5 border border-[#8c3e08]/15 text-center">
            <div className="text-[18px] font-extrabold text-[#4ade80]">{totalRemembered}</div>
            <div className="text-[9px] text-[#4ade80]/60 font-medium">จำได้แล้ว</div>
          </div>
          <div className="bg-[#061422]/70 rounded-xl p-2.5 border border-[#8c3e08]/15 text-center">
            <div className="text-[18px] font-extrabold text-[#ff8c30]/50">{totalCardsInPart} ข้อ</div>
            <div className="text-[9px] text-white/30 font-medium">ข้อสอบทั้งหมด</div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full mt-2">
          <div className="flex justify-between text-[10px] text-white/40 mb-1 font-semibold">
            <span>ภาพรวมการจำข้อมูล</span>
            <span className="text-[#ff8c30]">
              {totalCardsInPart > 0 ? Math.round((totalRemembered / totalCardsInPart) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 w-full bg-[#061422] rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-[#e86010] to-[#ff8c30] rounded-full transition-all duration-300" 
              style={{ width: `${totalCardsInPart > 0 ? (totalRemembered / totalCardsInPart) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Part Tabs Selector Subheader */}
      <div className="flex items-center justify-between gap-1 mb-5 bg-[#0c1f38]/60 p-1 rounded-xl border border-white/5">
        {parts.map((p) => {
          const isActive = p.id === selectedPartId;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPart(p.id)}
              className={`flex-1 text-center py-2.5 px-1 rounded-lg text-[11px] font-extrabold tracking-[0.5px] cursor-pointer transition-all ${
                isActive
                  ? 'bg-gradient-to-b from-[#e86010] to-[#ff8c30] text-white font-extrabold shadow-[2px_2px_12px_rgba(240,112,32,0.25)]'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {p.title.replace("ความรู้", "")}
            </button>
          );
        })}
      </div>

      {/* Title Header with Category Name */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-[#ff8c30] tracking-[0.5px] uppercase">
          รายการชุดข้อสอบ ({partSets.length} ชุด)
        </h3>
        
        {hasProgress && (
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-white/50 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer px-3 py-1.5 rounded-lg active:scale-95"
            title="ล้างสถิติทั้งหมด"
          >
            <RefreshCw className="h-3 w-3" />
            <span>ล้างสถิติ</span>
          </button>
        )}
      </div>

      {/* Grid List of Sets */}
      <div className="grid grid-cols-1 gap-3.5">
        {partSets.map((s, idx) => {
          const sProg = getProgress(s.id);
          const isDone = sProg?.completed;
          const remembered = sProg?.rememberedCount || 0;
          const total = s.cards.length;

          // Check if there are real test questions or placeholder cards
          const isPlaceholder = s.cards[0]?.q.includes("รอข้อสอบ");

          return (
            <div
              key={s.id}
              onClick={() => onSelectSet(selectedPartId, s.id, s.label)}
              className={`group flex items-center justify-between bg-[#0c1f38] hover:bg-[#11294a] border ${
                isDone 
                  ? 'border-[#4ade80]/40 shadow-[0_0_15px_rgba(74,222,128,0.05)]' 
                  : isPlaceholder 
                    ? 'border-white/5 opacity-80' 
                    : 'border-[#8c3e08]/30 shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
              } rounded-2xl p-4.5 cursor-pointer select-none transition-all md:hover:-translate-y-0.5`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[15px] font-extrabold ${isDone ? 'text-[#4ade80]' : 'text-white'}`}>
                    {s.label}
                  </span>
                  {isPlaceholder && (
                    <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/50 font-medium">รออัปเดต</span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-white/40">
                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{total} คำถาม</span>
                  {remembered > 0 && (
                    <span className="text-white/20">|</span>
                  )}
                  {remembered > 0 && (
                    <span className="text-[#4ade80] font-semibold">จำได้ {remembered}</span>
                  )}
                </div>
              </div>

              {/* Status / Play Indicator */}
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#061422] group-hover:bg-[#ff8c30]/10 border border-[#8c3e08]/20 transition-all">
                {isDone ? (
                  <CheckCircle className="h-5 w-5 text-[#4ade80]" />
                ) : (
                  <Play className="h-4.5 w-4.5 text-[#ff8c30] group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile App & APK installation Widget */}
      <div className="mt-8 bg-gradient-to-r from-[#0d2244] to-[#122e54] border border-[#ff8c30]/20 rounded-2xl p-4.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-3">
          <div className="bg-[#ff8c30]/15 p-2 rounded-xl text-[#ff8c30]">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-[14px] font-extrabold text-white">ติดตั้งเป็นแอปมือถือ / ทำไฟล์ APK</h4>
            <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
              เพิ่มไอคอนของแอปไว้ที่หน้าจอมือถือของคุณเพื่อใช้งานได้ออฟไลน์และเต็มจอ (Fullscreen) เหมือนดาวน์โหลดจาก App Store หรือดูสูตรบิลด์ไฟล์ APK ติดเครื่องไว้ที่นี่!
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 mt-4">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-to-r from-[#e86010] to-[#ff8c30] text-white font-extrabold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_rgba(232,96,16,0.3)]"
          >
            <Smartphone className="h-4 w-4" />
            <span>ติดตั้งบน iOS/Android</span>
          </button>
          
          <button
            onClick={() => setShowApkGuide(true)}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Code className="h-4 w-4 text-[#ff8c30]" />
            <span>วิธีเขียนบิลด์ไฟล์ APK</span>
          </button>
        </div>
      </div>

      {/* 1. Modal: iOS/Android Installation Guide */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/85 backdrop-blur-sm animate-[fadeIn_200ms_ease]">
          <div className="w-full max-w-[480px] bg-[#0c1f38] border-t border-[#ff8c30]/30 rounded-t-3xl p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto scrollbar-thin select-none animate-[slideUp_250ms_ease-out]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#ff8c30]" />
                <span className="text-[16px] font-extrabold text-white">ติดตั้งแอพบนมือถือ (PWA)</span>
              </div>
              <button 
                onClick={() => setShowInstallGuide(false)}
                className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[12px] text-white/75 leading-relaxed mb-4">
              คุณสามารถติดตั้งแอพนี้ไว้บนหน้าจอมือถือส่วนตัวของคุณได้ทันที โดยไม่ต้องดาวน์โหลดผ่าน Google Play Store มีหน้าตาและการสัมผัสเหมือนแอปทั่วไป 100%:
            </p>

            <div className="space-y-4">
              <div className="bg-[#061422] rounded-xl p-4 border border-white/5">
                <div className="text-[12px] font-extrabold text-[#ff8c30] mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#ff8c30]/10 flex items-center justify-center text-[10px]">1</span>
                  <span>สำหรับ Android (Chrome)</span>
                </div>
                <ul className="text-[11.5px] text-white/60 space-y-2 list-disc pl-5 leading-relaxed">
                  <li>แตะปุ่มเมนู <strong className="text-white">ไอคอน 3 จุด (⋮)</strong> ที่มุมขวาบนของเบราว์เซอร์ Chrome</li>
                  <li>
                    เลือกคำสั่ง <strong className="text-[#ff8c30]">"เพิ่มลงในหน้าจอหลัก" (Add to Home screen)</strong> หรือ <strong className="text-[#ff8c30]">"ติดตั้งแอป" (Install app)</strong>
                    <div className="text-[10px] text-white/40 mt-1 bg-white/5 p-2 rounded-lg">
                      💡 <strong>ข้อสังเกต:</strong> หากเข้าผ่าน Wi-Fi ในบ้าน (http://) เบราว์เซอร์จะไม่แสดงคำว่า "ติดตั้งแอป" แต่จะแสดงคำว่า <strong>"เพิ่มลงในหน้าจอหลัก"</strong> แทน ซึ่งใช้งานได้เต็มจอเหมือนกันครับ
                    </div>
                  </li>
                  <li>ไอคอนแอปจะไปปรากฏบนหน้าจอมือถือของคุณทันที แตะเปิดใช้งานแบบ Fullscreen ได้เลย</li>
                </ul>
              </div>

              <div className="bg-[#061422] rounded-xl p-4 border border-white/5">
                <div className="text-[12px] font-extrabold text-[#ffb060] mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#ffb060]/10 flex items-center justify-center text-[10px]">2</span>
                  <span>สำหรับ iOS / iPhone (Safari)</span>
                </div>
                <ul className="text-[11.5px] text-white/60 space-y-1.5 list-disc pl-5 leading-relaxed">
                  <li>เปิดเบราว์เซอร์ Safari เข้าหน้าลิงก์นี้</li>
                  <li>กดปุ่ม <strong className="text-white">แชร์ (Share)</strong> ไอคอนรูปสี่เหลี่ยมลูกศรชี้ขึ้นที่แถบข้างล่าง</li>
                  <li>เลื่อนหน้าจอลงด้านล่างสุด แล้วกดเลือกปุ่ม <strong className="text-white">"เพิ่มไปยังหน้าจอหลัก" (Add to Home Screen)</strong></li>
                  <li>กดคำว่า <strong className="text-white">"เพิ่ม" (Add)</strong> ที่มุมขวาบน จะมีสัญลักษณ์แอปโผล่ขึ้นมาทันที!</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full mt-6 bg-[#0c1f38] hover:bg-[#122e54] border border-[#ff8c30]/40 text-white font-bold py-3.5 px-4 rounded-xl text-[13px] flex items-center justify-center cursor-pointer active:scale-95"
            >
              รับทราบ ลุยต่อเลย!
            </button>
          </div>
        </div>
      )}

      {/* 2. Modal: Full APK Compiler Guide */}
      {showApkGuide && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/85 backdrop-blur-sm animate-[fadeIn_200ms_ease]">
          <div className="w-full max-w-[480px] bg-[#0c1f38] border-t border-[#ff8c30]/30 rounded-t-3xl p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto scrollbar-thin select-none animate-[slideUp_250ms_ease-out]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-[#ff8c30]" />
                <span className="text-[16px] font-extrabold text-white">สูตรบิลด์ไฟล์ Native APK</span>
              </div>
              <button 
                onClick={() => setShowApkGuide(false)}
                className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[12px] text-white/75 leading-relaxed mb-4">
              หากต้องการแปลงโปรเจกต์เว็บนี้ให้เป็นไฟล์ <strong className="text-white">.apk</strong> แท้ๆ เพื่อใช้แจกจ่ายไฟล์ด้วยตัวเองหรือนำขึ้น Google Play Store ให้ทำตามขั้นตอนง่ายๆ เหล่านี้บนคอมพิวเตอร์ของคุณ:
            </p>

            <div className="space-y-4">
              <div className="bg-[#061422] rounded-xl p-4 border border-white/5">
                <div className="text-[12.5px] font-bold text-[#ff8c30] mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-[#ff8c30]/10 flex items-center justify-center rounded text-[8px]">A</span>
                  <span>ดาวน์โหลดโค้ดโปรเจกต์</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                  กดปุ่มด้านขวาบนหน้าจอเว็บของ AI Studio ไอคอนฟันเฟือง (Settings) แล้วทำรายการดาวน์โหลดแบบ <strong className="text-white">Download Code (ZIP)</strong> มาเก็บไว้ที่เครื่องของคุณ
                </p>
              </div>

              <div className="bg-[#061422] rounded-xl p-4 border border-white/5">
                <div className="text-[12.5px] font-bold text-[#ff8c30] mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-[#ff8c30]/10 flex items-center justify-center rounded text-[8px]">B</span>
                  <span>เรียกคำสั่งแปลง APK ใน Terminal</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed mb-2">
                  เปิดโฟลเดอร์ของซอร์สโค้ดในโปรแกรม Terminal หรือ Command Prompt จากนั้นป้อนคำสั่งสั้นๆ ด้านล่างนี้:
                </p>
                <div className="bg-[#040e1c] rounded-lg p-2.5 font-mono text-[9px] text-[#4ade80] border border-white/5 overflow-x-auto whitespace-pre leading-normal">
                  # 1. ติดตั้งไลบรารีและบิลด์ Assets<br />
                  npm install<br />
                  npm run build<br /><br />
                  # 2. เริ่มต้นโปรเจกต์ Capacitor เพื่อแปลงแอปมือถือ<br />
                  npm install @capacitor/core @capacitor/cli<br />
                  npx cap init "Secret Card" "com.secretcard.paph" --web-dir=dist<br /><br />
                  # 3. เพิ่มโมดูลระบบแอนดรอยด์ลงโปรเจกต์<br />
                  npm install @capacitor/android<br />
                  npx cap add android<br />
                  npx cap sync
                </div>
              </div>

              <div className="bg-[#061422] rounded-xl p-4 border border-white/5">
                <div className="text-[12.5px] font-bold text-[#ff8c30] mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-[#ff8c30]/10 flex items-center justify-center rounded text-[8px]">C</span>
                  <span>สั่งบิลด์ไฟล์ APK ใน Android Studio</span>
                </div>
                <ul className="text-[11px] text-white/60 space-y-1.5 list-disc pl-5 leading-relaxed">
                  <li>เมื่อบิลด์เสร็จ ให้ป้อนคำสั่ง <code className="text-[#ff8c30] font-mono text-[10px]">npx cap open android</code> ระบบจะเปิด Android Studio ให้คุณอัตโนมัติ</li>
                  <li>รอระบบประมวลผลสักครู่ จากนั้นมองหาแถบเมนูด้านบน แล้วกด <strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong></li>
                  <li>ระบบจะส่งมอบไฟล์ <strong className="text-[#4ade80] font-bold">app-debug.apk</strong> มอบให้คุณนำไปแจกจ่ายและติดตั้งได้ทันทีที่ต้องการ!</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowApkGuide(false)}
              className="w-full mt-6 bg-[#0c1f38] hover:bg-[#122e54] border border-[#ff8c30]/40 text-white font-bold py-3.5 px-4 rounded-xl text-[13px] flex items-center justify-center cursor-pointer active:scale-95"
            >
              เข้าใจแล้ว ปิดหน้าต่างนี้
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmResetModal
        isOpen={showResetModal}
        title="ยืนยันการล้างสถิติ"
        description="คุณต้องการล้างสถิติการฝึกจำ Flashcard ทั้งหมดของตำแหน่งนี้ใช่หรือไม่?"
        confirmText="ยืนยันล้างสถิติ"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-[#0c1f38] border border-green-500/50 shadow-[0_4px_20px_rgba(0,0,0,0.7)] px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-green-400 animate-[fadeIn_150ms_ease-out]">
          <Check className="h-4 w-4 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
