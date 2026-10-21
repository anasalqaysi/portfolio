import React, { useState } from 'react';
import type { ClientProject } from '../types';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Calendar,
  LogOut,
  Shield,
  MessageCircle,
  FileCheck2,
  ChevronLeft,
  Activity,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { ContractModal } from './ContractModal';
import { BRAND } from '../constants/brand';

interface ClientPortalViewProps {
  project: ClientProject;
  onLogout: () => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  project,
  onLogout,
}) => {
  const [showContract, setShowContract] = useState(false);

  const milestonesList = Array.isArray(project.milestones) ? project.milestones : [];
  const totalMilestones = milestonesList.length;
  const doneMilestones = milestonesList.filter((m) => m.isDone).length;
  const progressPercent =
    totalMilestones > 0
      ? Math.round((doneMilestones / totalMilestones) * 100)
      : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return {
          label: 'قيد التنفيذ البرمجي',
          badgeClass: 'bg-zinc-800 text-zinc-200 border-zinc-700',
          dotClass: 'bg-blue-400',
        };
      case 'client_review':
        return {
          label: 'بانتظار مراجعة واعتماد العميل',
          badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
          dotClass: 'bg-amber-400',
        };
      case 'completed':
        return {
          label: 'تم الإنجاز والتسليم النهائي',
          badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
          dotClass: 'bg-emerald-400',
        };
      case 'maintenance':
        return {
          label: 'في مرحلة الصيانة والدعم',
          badgeClass: 'bg-purple-950/40 text-purple-300 border-purple-800/60',
          dotClass: 'bg-purple-400',
        };
      default:
        return {
          label: 'قيد التجهيز والتحضير',
          badgeClass: 'bg-zinc-850 text-zinc-300 border-zinc-750',
          dotClass: 'bg-zinc-400',
        };
    }
  };

  const statusInfo = getStatusBadge(project.status);

  // WhatsApp prefilled message
  const clientWhatsappMsg = encodeURIComponent(
    `السلام عليكم م. أنس، بخصوص مشروعنا (${project.projectName}) لدي استفسار:`
  );
  const whatsappUrl = `https://wa.me/966500000000?text=${clientWhatsappMsg}`;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased selection:bg-zinc-800 selection:text-white" dir="rtl">
      
      {/* Top Header Bar */}
      <header className="border-b border-white/[0.08] bg-[#0c0c0e]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={BRAND.logoUrl}
              alt="Logo"
              className="w-8 h-8 rounded-lg object-contain bg-zinc-900 border border-white/10 p-1"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="text-xs font-bold tracking-tight text-white flex items-center gap-2">
                <span>بوابة تسليم ومتابعة المشاريع</span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  · {project.id}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">إشراف وتطوير: م. أنس القيسي</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Executive Project Brief Card */}
        <div className="bg-[#171821] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-zinc-850">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-medium border mb-3.5 font-mono ${statusInfo.badgeClass}">
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass} animate-pulse`} />
                <span>{statusInfo.label}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.projectName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 mt-2">
                <span>
                  الجهة / العميل: <strong className="text-zinc-200">{project.clientName}</strong>
                </span>
                <span>·</span>
                <span>{project.projectType}</span>
              </div>
            </div>

            {/* Action buttons (Staging & Contract) */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowContract(true)}
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-200 hover:text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                title="عرض وتنزيل عقد واتفاقية المشروع الرسمية"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>عقد واتفاقية المشروع 📄</span>
              </button>

              {Boolean(project.stagingUrl && project.stagingUrl.trim() && project.stagingUrl.trim() !== 'none' && project.stagingUrl.trim() !== '#') && (
                <div className="flex flex-col items-center">
                  <a
                    href={project.stagingUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <span>فتح بيئة التجربة المباشرة (Staging)</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <span className="block text-[10px] text-zinc-500 text-center mt-1 font-mono">
                    سيرفر معاينة تفاعلي حي
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Overview Bar */}
          <div className="pt-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400 font-medium">مستوى تقدم وإنجاز متطلبات العقد:</span>
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-2.5 overflow-hidden p-0.5">
              <div
                className="bg-white h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 font-mono">
              <span>{doneMilestones} من {totalMilestones} مراحل منجزة ومعتمدة</span>
              <span>
                التسليم المستهدف: {project.deadline || 'حسب الاتفاق'}
              </span>
            </div>
          </div>
        </div>

        {/* Milestones & Deliverables Roadmap */}
        <div className="bg-[#171821] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-850">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                مراحل العمل ومخرجات التسليم (Milestones)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                تتبع حالة كل مرحلة تقنية تم إنجازها أو العمل عليها
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
              {doneMilestones}/{totalMilestones} معتمد
            </span>
          </div>

          <div className="divide-y divide-zinc-850">
            {milestonesList.map((ms, index) => (
              <div
                key={ms.id || index}
                className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">
                    {ms.isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono text-[10px] text-zinc-400">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm ${ms.isDone ? 'text-zinc-200' : 'text-zinc-300'}`}>
                      {ms.title}
                    </h3>
                    <span className="text-[11px] text-zinc-500 block mt-0.5 font-mono">
                      {ms.isDone ? 'تم الاختبار والاعتماد بنجاح' : 'قيد التطوير البرمجي والاختبار'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border ${
                      ms.isDone
                        ? 'bg-emerald-950/30 text-emerald-300 border-emerald-900/60'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {ms.isDone ? 'منجز ومكتمل' : 'قيد التنفيذ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Updates Section */}
        {project.notes && (
          <div className="bg-[#171821] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>ملاحظات وتحديثات المهندس أنس القيسي</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {project.notes}
            </div>
          </div>
        )}

        {/* Direct Client Channel Footer */}
        <div className="bg-[#171821] border border-white/[0.08] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white">
              هل لديك ملاحظة أو رغبة في استفسار مباشر؟
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              يمكنك مراسلتي على الواتساب مع رقم مشروعك للمتابعة السريعة.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>محادثة واتساب مباشرة</span>
          </a>
        </div>

      </main>

      {/* Security Seal */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-[11px] font-mono text-zinc-500">
        <div>بوابة تسليم آمنة ومشفرة · أنس القيسي للحلول الرقمية</div>
      </footer>

      {/* Official Contract & Agreement Modal (Read Only for Client) */}
      {showContract && (
        <ContractModal
          project={project}
          currency="ر.س"
          isOpen={showContract}
          onClose={() => setShowContract(false)}
          onSaveContract={() => {}}
          readOnly={true}
        />
      )}

    </div>
  );
};
