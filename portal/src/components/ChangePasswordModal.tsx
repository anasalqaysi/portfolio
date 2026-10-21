import React, { useState } from 'react';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import {
  Key,
  X,
  Lock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('كلمة المرور الجديدة يجب أن تكون 6 خانات أو أكثر.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setErrorMsg('لم يتم العثور على جلسة مستخدم نشطة.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If user typed current password, re-authenticate first to satisfy Firebase security requirement
      if (currentPassword) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

      // Update password
      await updatePassword(user, newPassword);
      setSuccessMsg('تم تغيير كلمة المرور بنجاح!');
      setTimeout(() => {
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMsg('');
      }, 1400);
    } catch (err: any) {
      console.error('Password change error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('كلمة المرور الحالية غير صحيحة.');
      } else if (err.code === 'auth/requires-recent-login') {
        setErrorMsg('لدواعي الأمان، يرجى كتابة كلمة المرور الحالية في الحقل أعلاه للمتابعة.');
      } else {
        setErrorMsg('تعذر التحديث: ' + (err.message || 'يرجى المحاولة لاحقاً.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetEmail = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, user.email);
      setSuccessMsg(`تم إرسال رابط تعيين كلمة المرور إلى ${user.email}. تفقّد بريدك.`);
    } catch {
      setErrorMsg('تعذر إرسال رابط التعيين. يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-md bg-[#13141a] border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">تغيير كلمة المرور</h3>
              <p className="text-[11px] text-zinc-400">تحديث كلمة سر حساب الإدارة المعتمد</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <div className="leading-relaxed">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              كلمة المرور الحالية (للتحقق الأمني)
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                dir="ltr"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمتك الحالية"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 خانات أو أكثر"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال الكلمة الجديدة"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setShowPasswords((prev) => !prev)}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? 'إخفاء الحروف' : 'إظهار الحروف'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={isSubmitting}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer disabled:opacity-50"
            >
              نسيت الحالية؟ أرسل رابط للبريد
            </button>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
