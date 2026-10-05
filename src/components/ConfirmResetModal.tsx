import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmResetModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmResetModal({
  isOpen,
  title,
  description,
  confirmText = 'ยืนยันล้างสถิติ',
  cancelText = 'ยกเลิก',
  onConfirm,
  onCancel,
}: ConfirmResetModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-sm bg-[#0c1f38] border border-red-500/40 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.85)] flex flex-col gap-4 animate-[scaleUp_150ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white/95">{title}</h3>
              <p className="text-xs text-white/50 mt-0.5">{description}</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="text-white/40 hover:text-white/80 p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-[#061422] p-3 rounded-xl border border-white/5 text-[11px] text-white/70 leading-relaxed">
          ⚠️ การล้างสถิติจะรีเซ็ตข้อมูลความก้าวหน้าทั้งหมดของส่วนนี้ และไม่สามารถกู้คืนได้
        </div>

        <div className="flex items-center gap-2.5 mt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold border border-white/10 transition-all cursor-pointer text-center"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-[0_2px_12px_rgba(225,29,72,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
