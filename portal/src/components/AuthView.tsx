import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, ADMIN_EMAIL } from '../firebase';
import {
  Shield,
  Key,
  ArrowLeft,
  Mail,
  Lock,
  CheckCircle,
  AlertTriangle,
  Layers,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface AuthViewProps {
  onClientPinLogin?: (pinOrCode: string) => boolean;
  onAdminBypass?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onClientPinLogin,
  onAdminBypass,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'client'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientPin, setClientPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMsg('تم إنشاء حساب المدير بنجاح وجاري فتح لوحة التحكم...');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMsg('تم التحقق بنجاح. مرحباً بك م. أنس.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'حدث خطأ: ' + (err.message || 'يرجى التحقق من البيانات.');
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        message = 'يرجى تفعيل (Email/Password) من صفحة Firebase Console -> Authentication -> Sign-in method.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم إنشاء الحساب بعد.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'كلمة المرور غير مطابقة.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'هذا البريد مسجل بالفعل كمدير. يرجى تسجيل الدخول.';
      } else if (err.code === 'auth/weak-password') {
        message = 'كلمة المرور يجب ألا تقل عن 6 خانات.';
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('أدخل بريدك الإلكتروني في الحقل أعلاه أولاً لإرسال رابط الاستعادة.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email} بنجاح.`);
    } catch (err: any) {
      setErrorMsg('تعذر إرسال رابط الاستعادة. تأكد من صحة البريد المدخل.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!clientPin.trim()) {
      setErrorMsg('يرجى إدخال رمز المشروع أو كود المتابعة.');
      return;
    }

    if (onClientPinLogin) {
      const ok = onClientPinLogin(clientPin.trim());
      if (!ok) {
        setErrorMsg('الرمز غير مسجل في النظام. تأكد من الرمز المستلم من م. أنس القيسي.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1015] text-[#f0f1f5] flex items-center justify-center p-4 sm:p-6 font-sans" dir="rtl">
      <div className="w-full max-w-[440px]">
        
        {/* Brand Monogram & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>نظام مرصد المبرمج وبوابة العملاء</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
            مرصد المشاريع والعملاء
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            منظومة إدارة وتنفيذ الأنظمة البرمجية ومتابعة مراحل التسليم
          </p>
        </div>

        {/* Main Card with Soft Borders */}
        <div className="bg-[#171821] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl relative">
          
          {/* Segmented Control Switch */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-850 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>لوحة التحكم (أنس)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('client');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'client'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>بوابة العميل</span>
            </button>
          </div>

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

          {/* Tab 1: Admin Form */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  البريد الإلكتروني المعتمد
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={ADMIN_EMAIL}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono transition-colors"
                  />
                </div>
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
                    استعادة الرمز؟
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
                <span>
                  {isSubmitting
                    ? 'جاري التحقق...'
                    : isRegisterMode
                    ? 'تسجيل حساب المدير الجديد'
                    : 'دخول لوحة التحكم'}
                </span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {isRegisterMode
                    ? 'لديك حساب؟ تسجيل الدخول'
                    : 'إنشاء حساب جديد للمدير لأول مرة'}
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Client PIN Form */}
          {activeTab === 'client' && (
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  كود المشروع أو رقم المتابعة (PIN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={clientPin}
                    onChange={(e) => setClientPin(e.target.value)}
                    placeholder="مثال: cp-1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm font-mono text-center tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors uppercase"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                  * تم تزويدك بهذا الرمز عبر وثيقة البدء أو رسالة المتابعة في الواتساب لمراجعة تقدم مشروعك لحظياً.
                </p>
              </div>

              {/* Sample test pills */}
              <div className="pt-1">
                <span className="text-[10px] text-zinc-500 block mb-1.5">رموز جاهزة للمعاينة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['cp-1 (دار العقار)', 'cp-2 (ركن القهوة)', 'cp-3 (مكتب طلال)'].map((sample, idx) => {
                    const code = `cp-${idx + 1}`;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setClientPin(code)}
                        className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 font-mono transition-colors cursor-pointer"
                      >
                        {sample}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>فتح تقرير المشروع والتحديثات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Bottom Developer Bypass Access */}
          {onAdminBypass && (
            <div className="mt-6 pt-4 border-t border-zinc-800/60 text-center">
              <button
                type="button"
                onClick={onAdminBypass}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <Terminal className="w-3 h-3 text-emerald-500" />
                <span>دخول فوري للمعاينة كمدير (Bypass Auth)</span>
              </button>
            </div>
          )}
        </div>

        {/* Quiet Minimal Footer */}
        <div className="mt-6 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-2">
          <span>اتصال مشفر ومحمي</span>
          <span>·</span>
          <span>Google Firebase Engine</span>
        </div>

      </div>
    </div>
  );
};
