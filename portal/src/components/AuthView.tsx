import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, ADMIN_EMAIL } from '../firebase';
import { BRAND } from '../constants/brand';
import {
  Key,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface AuthViewProps {
  onClientPinLogin?: (pinOrCode: string) => Promise<boolean> | boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onClientPinLogin,
}) => {
  // Default mode is strictly 'client' for all visitors
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientPin, setClientPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [failedPinAttempts, setFailedPinAttempts] = useState(0);
  const [pinLockoutUntil, setPinLockoutUntil] = useState<number | null>(null);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setSuccessMsg('تم التحقق بنجاح. مرحباً بك.');
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      const code = err.code || '';
      let message = 'تعذر تسجيل الدخول. يرجى التحقق من البريد وكلمة المرور.';
      if (code === 'auth/operation-not-allowed') {
        message = 'خاصية تسجيل الدخول بكلمة المرور غير مفعّلة في Firebase! يرجى تفعيل Email/Password من تبويب Sign-in method.';
      } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من إضافة المستخدم في قائمة Users في Firebase Console.';
      } else if (code === 'auth/wrong-password') {
        message = 'كلمة المرور غير صحيحة.';
      } else if (code === 'auth/too-many-requests') {
        message = 'تم إيقاف المحاولات مؤقتاً لكثرة المحاولات غير الناجحة. يرجى الانتظار دقيقة.';
      } else if (code === 'auth/unauthorized-domain') {
        message = 'النطاق الحالي غير مصرح به في إعدادات Firebase Auth.';
      } else if (err.message) {
        message = `تعذر الدخول (${code}): ${err.message}`;
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('أدخل بريدك الإلكتروني في الحقل أعلاه أولاً لإرسال رابط استعادة كلمة المرور.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email} بنجاح.`);
    } catch (err: any) {
      console.error('Reset Password Error:', err);
      const code = err.code || '';
      let message = 'تعذر إرسال رابط الاستعادة.';
      if (code === 'auth/operation-not-allowed') {
        message = 'خاصية البريد الإلكتروني غير مفعّلة في Firebase. يرجى تفعيلها من تبويب Sign-in method.';
      } else if (code === 'auth/user-not-found') {
        message = 'هذا البريد غير مسجل في Firebase بعد. يرجى إضافته من تبويب Users.';
      } else if (err.message) {
        message = `${err.message} (${code})`;
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (pinLockoutUntil && Date.now() < pinLockoutUntil) {
      const waitSec = Math.ceil((pinLockoutUntil - Date.now()) / 1000);
      setErrorMsg(`تم تجاوز الحد الأقصى للمحاولات الخاطئة. يرجى الانتظار ${waitSec} ثانية قبل المحاولة مجدداً.`);
      return;
    }

    const clean = clientPin.trim();
    if (!clean) {
      setErrorMsg('يرجى إدخال رمز وصول المشروع (PIN).');
      return;
    }

    if (onClientPinLogin) {
      setIsSubmitting(true);
      try {
        const ok = await onClientPinLogin(clean);
        if (!ok) {
          const nextCount = failedPinAttempts + 1;
          setFailedPinAttempts(nextCount);
          if (nextCount >= 5) {
            setPinLockoutUntil(Date.now() + 60000);
            setErrorMsg('تم إدخال الرمز بشكل غير صحيح عدة مرات. يرجى الانتظار دقيقة واحدة.');
          } else {
            setErrorMsg('رمز المشروع غير صحيح أو غير مسجل. يرجى التحقق من الرمز والمحاولة مجدداً.');
          }
        } else {
          setFailedPinAttempts(0);
          setPinLockoutUntil(null);
        }
      } catch {
        setErrorMsg('تعذر التحقق من الرمز حالياً. يرجى المحاولة لاحقاً.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-zinc-800 selection:text-white" dir="rtl">
      
      {/* Top spacing */}
      <div className="hidden sm:block" />

      {/* Main Container */}
      <div className="w-full max-w-[420px] mx-auto my-auto py-8">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 p-2.5 mb-3 shadow-lg">
            <img
              src={BRAND.logoUrl}
              alt="Brand Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback icon if logo fails to render
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
            {activeTab === 'client' ? 'بوابة متابعة المشاريع' : 'لوحة إدارة المنظومة'}
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            {activeTab === 'client'
              ? 'أنس القيسي للحلول الرقمية · استعراض مراحل الإنجاز وتسليم المشاريع'
              : 'تسجيل دخول الإدارة لإدارة ومزامنة المشاريع وسير العمل'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121215] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-2xl relative">
          
          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* 1. Client View (Default) */}
          {activeTab === 'client' && (
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  رمز وصول المشروع (PIN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={clientPin}
                    onChange={(e) => setClientPin(e.target.value)}
                    placeholder="مثال: 7K9X2B4P"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-3.5 text-base font-mono text-center tracking-[0.25em] text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors uppercase"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed text-center">
                  أدخل الرمز السري المزود لك لمراجعة لوحة تقدم مشروعك ومراحله لحظياً.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3 shadow-md"
              >
                <span>{isSubmitting ? 'جاري التحقق...' : 'عرض لوحة المشروع'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* 2. Admin View (Discreet, toggled only when Anas clicks the secret link) */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ADMIN_EMAIL}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    استعادة كلمة المرور؟
                  </button>
                </div>
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isSubmitting ? 'جاري التحقق...' : 'دخول لوحة الإدارة'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('client');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>العودة لبوابة العملاء</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Subtle, Minimal Bottom Footer with discreet Admin Access */}
      <footer className="w-full max-w-sm mx-auto text-center pb-2">
        <div className="flex items-center justify-between text-[11px] text-zinc-600 px-2">
          <span>{BRAND.brandName} © {new Date().getFullYear()}</span>
          
          {/* Subtle Admin Trigger - Small, unnoticeable to clients */}
          {activeTab === 'client' && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              title="لوحة الإدارة"
              className="text-zinc-700 hover:text-zinc-400 p-1 rounded transition-colors flex items-center gap-1 opacity-60 hover:opacity-100"
            >
              <Lock className="w-3 h-3" />
              <span className="text-[10px]">إدارة</span>
            </button>
          )}
        </div>
      </footer>

    </div>
  );
};

