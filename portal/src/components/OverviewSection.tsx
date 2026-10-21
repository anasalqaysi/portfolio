import React from 'react';
import type {
  DeveloperWorkspaceData,
  OutreachStage,
} from '../types';
import {
  calculateWorkspaceSummary,
  calculateIdeaMetrics,
  IDEA_STATUS_LABELS,
  OUTREACH_STAGE_LABELS,
  CLIENT_STATUS_LABELS,
} from '../utils/workspaceLogic';

interface OverviewSectionProps {
  data: DeveloperWorkspaceData;
  onNavigate: (tab: 'overview' | 'ideas' | 'contacts' | 'clients' | 'platforms') => void;
  onQuickStageChange: (contactId: string, stage: OutreachStage) => void;
  onOpenStandaloneModal?: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  data,
  onNavigate,
  onQuickStageChange,
}) => {
  const summary = calculateWorkspaceSummary(data);

  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            مساحة عمل المبرمج وإدارة الأفكار والعملاء
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            نظام مركزي يجمع أفكارك البرمجية، التحقق المسبق مع العملاء الفعليين، أرقام وحسابات التواصل (واتساب، X، تيك توك)، عقود ودفعات العملاء، ومشاريع البورتفوليو. جميع التعديلات تُحفظ وتتزامن تلقائياً وبشكل فوري عبر Firebase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('ideas')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            + فكرة جديدة
          </button>
          <button
            type="button"
            onClick={() => onNavigate('contacts')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            + تسجيل تواصل مستخدم
          </button>
        </div>
      </div>

      {/* 4 Core KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            بنك الأفكار والتحقق الميداني
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">
            {summary.totalIdeas}
          </div>
          <div className="mt-2 text-xs text-slate-600">
            <span>{summary.validatedIdeasCount} تم التحقق منها</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{summary.activeExecutionIdeas} قيد التنفيذ</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            المستخدمون الذين تم التواصل معهم
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">
            {summary.totalContacts}
          </div>
          <div className="mt-2 text-xs text-slate-600 tabular-nums">
            <span>نسبة الرد {summary.overallResponseRate}%</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span className="font-semibold text-emerald-700">
              {summary.totalPotentialClients} عميل محتمل/فعلي
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            إجمالي عقود مشاريع العملاء
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">
            {summary.totalClientContractValue.toLocaleString()}{' '}
            <span className="text-base font-normal text-slate-500">
              {data.currency}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 tabular-nums">
            <span>المحصّل: {summary.totalClientPaid.toLocaleString()}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span className="font-semibold text-amber-700">
              المتبقي: {summary.totalClientRemaining.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            صافي عوائد المنصات الشهرية (SaaS)
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">
            {summary.netMonthlyPlatformProfit.toLocaleString()}{' '}
            <span className="text-base font-normal text-slate-500">
              {data.currency}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 tabular-nums">
            <span>الإيراد: {summary.totalMonthlyPlatformRevenue.toLocaleString()}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>تكاليف السيرفرات: {summary.totalMonthlyPlatformCosts.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Two-Column Split: Idea Validation Matrix + Recent User Outreach */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Right Column (7 cols): Ideas Status & Validation Readiness */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  حالة الأفكار والتحقق مع المستخدمين قبل التنفيذ
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  مقارنة وضع كل فكرة وعدد الأشخاص الذين تواصلت معهم ومؤشرات الاهتمام الفعلي
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('ideas')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                إدارة كافة الأفكار ←
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {data.ideas.map((idea) => {
                const metrics = calculateIdeaMetrics(idea, data.contacts);
                return (
                  <div key={idea.id} className="py-4 first:pt-2 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        {idea.title}
                      </h3>
                      <div className="text-xs text-slate-600 shrink-0">
                        <span className="font-semibold text-slate-800">
                          {IDEA_STATUS_LABELS[idea.status]}
                        </span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span
                          className={
                            idea.validatedBeforeStart
                              ? 'text-emerald-700 font-medium'
                              : 'text-amber-700 font-medium'
                          }
                        >
                          {idea.validatedBeforeStart
                            ? 'تم التواصل قبل التنفيذ'
                            : 'لم يتم التحقق الميداني بعد'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-medium text-slate-700">المستهدفون:</span>{' '}
                      {idea.targetAudience}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 tabular-nums">
                      <span>
                        إجمالي المتواصل معهم:{' '}
                        <strong className="text-slate-900">
                          {metrics.totalContacted}
                        </strong>{' '}
                        / {idea.targetValidationCount}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        ردوا عليك:{' '}
                        <strong className="text-slate-900">
                          {metrics.repliedCount}
                        </strong>{' '}
                        ({metrics.responseRatePercent}%)
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        عملاء محتملون/فعليون:{' '}
                        <strong className="text-emerald-700">
                          {metrics.potentialClientCount + metrics.convertedCount}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        مستعدون للدفع:{' '}
                        <strong className="text-blue-700">
                          {metrics.willingToPayCount}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              نصيحة هندسية: لا تبدأ برمجة أي فكرة قبل التحدث مع 10 مستخدمين فعليين على الأقل.
            </span>
            <button
              type="button"
              onClick={() => onNavigate('ideas')}
              className="font-semibold text-slate-900 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              تحديث متطلبات الأفكار
            </button>
          </div>
        </div>

        {/* Left Column (5 cols): Active User Outreach & Follow-ups */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  أحدث المتابعات مع المستخدمين والعملاء
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحديث سريع للمرحلة الحالية وقنوات التواصل لكل شخص
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('contacts')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                عرض السجل الكامل ←
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {data.contacts.slice(0, 4).map((contact) => {
                const idea = data.ideas.find((i) => i.id === contact.ideaId);
                return (
                  <div key={contact.id} className="py-3.5 first:pt-2 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {contact.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {contact.roleOrPersona}
                          {idea ? ` · ${idea.title.split('—')[0].trim()}` : ''}
                        </div>
                      </div>
                      <select
                        aria-label={`تغيير المرحلة مع ${contact.name}`}
                        value={contact.stage}
                        onChange={(e) =>
                          onQuickStageChange(
                            contact.id,
                            e.target.value as OutreachStage
                          )
                        }
                        className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {Object.entries(OUTREACH_STAGE_LABELS).map(
                          ([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      {contact.channels.phone && (
                        <span>
                          جوال/واتساب:{' '}
                          <code className="font-mono text-slate-900" dir="ltr">
                            {contact.channels.phone}
                          </code>
                        </span>
                      )}
                      {contact.channels.xHandle && (
                        <span>
                          X:{' '}
                          <code className="font-mono text-slate-900" dir="ltr">
                            {contact.channels.xHandle}
                          </code>
                        </span>
                      )}
                      {contact.channels.tiktokHandle && (
                        <span>
                          TikTok:{' '}
                          <code className="font-mono text-slate-900" dir="ltr">
                            {contact.channels.tiktokHandle}
                          </code>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>قنوات مدعومة: واتساب · X · تيك توك · تيليجرام · لينكدإن</span>
            <button
              type="button"
              onClick={() => onNavigate('contacts')}
              className="font-semibold text-slate-900 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              + إضافة شخص جديد
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Client Projects & Personal Platforms Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                مشاريع العملاء والدفعات المستحقة
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة العقود الجارية والمبالغ المتبقية للتحصيل
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('clients')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              تفاصيل العقود ←
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {data.clientProjects.map((cp) => {
              const remaining = Math.max(0, cp.totalBudget - cp.paidAmount);
              return (
                <div
                  key={cp.id}
                  className="py-3.5 first:pt-2 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {cp.projectName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span>{cp.clientName}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{CLIENT_STATUS_LABELS[cp.status]}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="tabular-nums">تسليم: {cp.deadline}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs tabular-nums shrink-0">
                    <div className="font-semibold text-slate-900">
                      {cp.paidAmount.toLocaleString()} /{' '}
                      {cp.totalBudget.toLocaleString()} {data.currency}
                    </div>
                    <div
                      className={
                        remaining > 0
                          ? 'text-amber-700 font-medium'
                          : 'text-emerald-700 font-medium'
                      }
                    >
                      {remaining > 0
                        ? `متبقي: ${remaining.toLocaleString()} ${data.currency}`
                        : 'مدفوع بالكامل'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                المنصات والمنتجات الخاصة (SaaS & Products)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مراقبة الدومينات، الاستضافة، المشتركين، ومهام التطوير
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('platforms')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              إدارة المنصات ←
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {data.platforms.map((pl) => {
              const openTasks = pl.backlogTasks.filter((t) => !t.done).length;
              return (
                <div
                  key={pl.id}
                  className="py-3.5 first:pt-2 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {pl.name}{' '}
                      <code
                        className="text-xs font-mono text-blue-600 font-normal"
                        dir="ltr"
                      >
                        ({pl.domain})
                      </code>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span>{pl.hostingProvider}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {pl.activeUsersCount} مستخدم نشط
                      </span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {openTasks} مهام تطوير قادمة
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs tabular-nums shrink-0">
                    <div className="font-semibold text-emerald-700">
                      +{pl.monthlyRevenue.toLocaleString()} {data.currency} / شهر
                    </div>
                    <div className="text-slate-500">
                      سيرفرات: {pl.monthlyServerCost} {data.currency}/شهر
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
