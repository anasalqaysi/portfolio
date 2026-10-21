import React, { useState } from 'react';
import type {
  ClientProject,
  ClientProjectStatus,
  ProjectMilestone,
} from '../types';
import { CLIENT_STATUS_LABELS } from '../utils/workspaceLogic';
import { ContractModal } from './ContractModal';
import {
  FileText,
  Link as LinkIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface ClientProjectsSectionProps {
  projects: ClientProject[];
  currency: string;
  onAddProject: (project: ClientProject) => void;
  onUpdateProject: (project: ClientProject) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ClientProjectsSection: React.FC<ClientProjectsSectionProps> = ({
  projects,
  currency,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientXHandle, setClientXHandle] = useState('');
  const [projectType, setProjectType] = useState('تطبيق ويب ولوحة تحكم');
  const [status, setStatus] = useState<ClientProjectStatus>('in_progress');
  const [totalBudget, setTotalBudget] = useState<number>(15000);
  const [paidAmount, setPaidAmount] = useState<number>(7500);
  const [deadline, setDeadline] = useState('2026-11-30');
  const [repoUrl, setRepoUrl] = useState('');
  const [stagingUrl, setStagingUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Active contract project for modal
  const [activeContractProject, setActiveContractProject] = useState<ClientProject | null>(null);

  // New milestone inline input per project
  const [milestoneInputs, setMilestoneInputs] = useState<
    Record<string, { title: string; amount: string }>
  >({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyClientLink = (project: ClientProject) => {
    const pin = project.clientAccessPin || project.id;
    const link = `${window.location.origin}/?pin=${encodeURIComponent(pin)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !clientName.trim()) {
      setFormError('يرجى إدخال اسم المشروع واسم العميل.');
      return;
    }
    const total = Number(totalBudget) || 0;
    const paid = Number(paidAmount) || 0;

    const newProj: ClientProject = {
      id: `cp-${Date.now()}`,
      projectName: projectName.trim(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientXHandle: clientXHandle.trim(),
      clientEmail: '',
      projectType: projectType.trim(),
      status,
      totalBudget: total,
      paidAmount: paid,
      startDate: new Date().toISOString().slice(0, 10),
      deadline,
      repoUrl: repoUrl.trim(),
      stagingUrl: stagingUrl.trim(),
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          title: 'الدفعة المقدمة وتحليل المتطلبات',
          amount: paid,
          isPaid: paid > 0,
          isDone: true,
        },
        ...(total > paid
          ? [
              {
                id: `ms-${Date.now()}-2`,
                title: 'دفعة التسليم النهائي والإطلاق',
                amount: total - paid,
                isPaid: false,
                isDone: false,
              },
            ]
          : []),
      ],
      notes: notes.trim(),
    };

    onAddProject(newProj);
    setProjectName('');
    setClientName('');
    setClientPhone('');
    setClientXHandle('');
    setNotes('');
    setFormError('');
    setShowAddForm(false);
  };

  const handleToggleMilestonePaid = (
    project: ClientProject,
    milestoneId: string
  ) => {
    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId ? { ...m, isPaid: !m.isPaid } : m
    );
    const recalculatedPaid = updatedMilestones
      .filter((m) => m.isPaid)
      .reduce((sum, m) => sum + m.amount, 0);

    const updated = {
      ...project,
      milestones: updatedMilestones,
      paidAmount: recalculatedPaid,
    };

    onUpdateProject(updated);
    if (activeContractProject?.id === project.id) {
      setActiveContractProject(updated);
    }
  };

  const handleToggleMilestoneDone = (
    project: ClientProject,
    milestoneId: string
  ) => {
    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId ? { ...m, isDone: !m.isDone } : m
    );
    const updated = {
      ...project,
      milestones: updatedMilestones,
    };
    onUpdateProject(updated);
    if (activeContractProject?.id === project.id) {
      setActiveContractProject(updated);
    }
  };

  const handleAddMilestone = (project: ClientProject) => {
    const input = milestoneInputs[project.id];
    if (!input || !input.title.trim()) return;
    const amount = Number(input.amount) || 0;
    const newMs: ProjectMilestone = {
      id: `ms-${Date.now()}`,
      title: input.title.trim(),
      amount,
      isPaid: false,
      isDone: false,
    };
    const updatedMilestones = [...project.milestones, newMs];
    const updated = {
      ...project,
      milestones: updatedMilestones,
    };
    onUpdateProject(updated);
    if (activeContractProject?.id === project.id) {
      setActiveContractProject(updated);
    }
    setMilestoneInputs((prev) => ({
      ...prev,
      [project.id]: { title: '', amount: '' },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#171821] border border-white/[0.08] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            إدارة مشاريع العملاء والعقود والمالية
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            صياغة وتعديل العقود الرسمية المعتمدة لكل مشروع، تتبّع الدفعات والمراحل (Milestones)، وتوفير بوابة دخول مخصصة للعميل.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'إغلاق النموذج' : 'إضافة مشروع عميل جديد'}</span>
        </button>
      </div>

      {/* Add Project Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateProject}
          className="bg-[#171821] border border-white/[0.08] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-white border-b border-white/[0.06] pb-3">
            تسجيل مشروع عميل جديد وتجهيز عقده المالي
          </h2>

          {formError && (
            <div
              role="alert"
              className="p-3 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="cp-name"
                className="block text-xs font-semibold text-zinc-300 mb-1"
              >
                اسم المشروع *
              </label>
              <input
                id="cp-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="مثال: منصة حجوزات عيادات طبية"
                className="w-full px-3 py-2 text-xs bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="cp-client"
                className="block text-xs font-semibold text-zinc-300 mb-1"
              >
                اسم العميل / الجهة *
              </label>
              <input
                id="cp-client"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="مثال: شركة الرؤية الذكية"
                className="w-full px-3 py-2 text-xs bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="cp-status"
                className="block text-xs font-semibold text-zinc-300 mb-1"
              >
                حالة المشروع الحالية
              </label>
              <select
                id="cp-status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ClientProjectStatus)
                }
                className="w-full px-3 py-2 text-xs bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                {Object.entries(CLIENT_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="cp-total"
                className="block text-xs font-semibold text-zinc-300 mb-1"
              >
                إجمالي قيمة العقد ({currency})
              </label>
              <input
                id="cp-total"
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 tabular-nums focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="cp-paid"
                className="block text-xs font-semibold text-zinc-300 mb-1"
              >
                المبلغ المدفوع حتى الآن ({currency})
              </label>
              <input
                id="cp-paid"
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 tabular-nums focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="cp-deadline"
                className="block text-xs font-semibold text-zinc-300 mb-1"
              >
                موعد التسليم النهائي
              </label>
              <input
                id="cp-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 tabular-nums focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="cp-phone"
                className="block text-xs font-semibold text-zinc-300 mb-1"
              >
                جوال / واتساب العميل
              </label>
              <input
                id="cp-phone"
                type="text"
                dir="ltr"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+9665..."
                className="w-full px-3 py-2 text-xs font-mono bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="cp-x"
                className="block text-xs font-semibold text-zinc-300 mb-1"
              >
                حساب العميل في X
              </label>
              <input
                id="cp-x"
                type="text"
                dir="ltr"
                value={clientXHandle}
                onChange={(e) => setClientXHandle(e.target.value)}
                placeholder="@client_handle"
                className="w-full px-3 py-2 text-xs font-mono bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="cp-type"
                className="block text-xs font-semibold text-zinc-300 mb-1"
              >
                نوع المشروع التقني
              </label>
              <input
                id="cp-type"
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl cursor-pointer transition-colors shadow-sm"
            >
              حفظ مشروع العميل
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-5">
        {projects.length === 0 ? (
          <div className="bg-[#171821] border border-white/[0.08] rounded-2xl p-12 text-center text-zinc-400">
            <p className="text-sm">لا توجد مشاريع عملاء مسجلة حالياً.</p>
          </div>
        ) : (
          projects.map((p) => {
            const remaining = Math.max(0, p.totalBudget - p.paidAmount);
            const paidPercent =
              p.totalBudget > 0
                ? Math.min(100, Math.round((p.paidAmount / p.totalBudget) * 100))
                : 0;

            const hasCustomContract = Boolean(p.contract);

            return (
              <div
                key={p.id}
                className="bg-[#171821] border border-white/[0.08] rounded-2xl p-6 space-y-5 shadow-lg"
              >
                {/* Project Header & Quick Actions */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-zinc-300">
                        {p.projectType}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-mono text-[11px]">بدأ: {p.startDate}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-mono text-[11px] text-zinc-300">
                        موعد التسليم: {p.deadline}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                      <span>{p.projectName}</span>
                      {hasCustomContract && (
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          عقد مخصص محفوظ
                        </span>
                      )}
                    </h2>

                    <div className="text-xs text-zinc-400 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>
                        العميل: <strong className="text-zinc-200">{p.clientName}</strong>
                      </span>
                      {p.clientPhone && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <span>جوال:</span>
                            <span className="dir-ltr font-mono text-zinc-200">
                              {p.clientPhone}
                            </span>
                          </span>
                        </>
                      )}
                      {p.clientXHandle && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <span>X:</span>
                            <span className="dir-ltr font-mono text-zinc-200">
                              {p.clientXHandle}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* PRIMARY ACTION: CONTRACT BUTTON */}
                    <button
                      type="button"
                      onClick={() => setActiveContractProject(p)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer transition-all shadow-sm"
                      title="عرض وتعديل بنود العقد الرسمي المعتمد وطباعته أو تصديره PDF"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>📄 عقد واتفاقية المشروع</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyClientLink(p)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl cursor-pointer transition-colors"
                      title="انسخ رابطاً مباشراً للعميل للدخول إلى بوابته"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>{copiedId === p.id ? 'تم نسخ الرابط! ✅' : 'رابط العميل 🔗'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProject({
                          ...p,
                          publishToPortfolio: !p.publishToPortfolio,
                        })
                      }
                      className={`px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors border ${
                        p.publishToPortfolio
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white border-white/[0.08]'
                      }`}
                      title="تفعيل أو إلغاء عرض هذا المشروع في البورتفوليو العام"
                    >
                      {p.publishToPortfolio ? 'معروض بالبورتفوليو 🌟' : 'إضافة للبورتفوليو +'}
                    </button>

                    <select
                      aria-label={`حالة مشروع ${p.projectName}`}
                      value={p.status}
                      onChange={(e) =>
                        onUpdateProject({
                          ...p,
                          status: e.target.value as ClientProjectStatus,
                        })
                      }
                      className="text-xs font-semibold border border-white/10 rounded-xl px-3 py-2 bg-[#0f1015] text-zinc-200 cursor-pointer"
                    >
                      {Object.entries(CLIENT_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onDeleteProject(p.id)}
                      aria-label={`حذف مشروع ${p.projectName}`}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="حذف المشروع"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#0f1015] border border-white/[0.06] rounded-xl tabular-nums">
                    <div className="text-[11px] text-zinc-500 font-medium">إجمالي قيمة العقد</div>
                    <div className="text-base sm:text-lg font-bold text-white mt-1">
                      {p.totalBudget.toLocaleString()} {currency}
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#0f1015] border border-white/[0.06] rounded-xl tabular-nums">
                    <div className="text-[11px] text-zinc-500 font-medium">
                      المحصّل الفعلي ({paidPercent}%)
                    </div>
                    <div className="text-base sm:text-lg font-bold text-emerald-400 mt-1">
                      {p.paidAmount.toLocaleString()} {currency}
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#0f1015] border border-white/[0.06] rounded-xl tabular-nums">
                    <div className="text-[11px] text-zinc-500 font-medium">المبلغ المتبقي</div>
                    <div
                      className={`text-base sm:text-lg font-bold mt-1 ${
                        remaining > 0 ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    >
                      {remaining.toLocaleString()} {currency}
                    </div>
                  </div>
                </div>

                {/* Milestones Section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-300">
                      مراحل الإنجاز والدفعات المجدولة (Milestones):
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {p.milestones.filter((m) => m.isDone).length} من {p.milestones.length} مراحل منجزة
                    </span>
                  </div>

                  <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl bg-[#0f1015] overflow-hidden">
                    {p.milestones.map((ms) => (
                      <div
                        key={ms.id}
                        className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`ms-done-${ms.id}`}
                            checked={ms.isDone}
                            onChange={() => handleToggleMilestoneDone(p, ms.id)}
                            className="w-4 h-4 rounded border-white/20 bg-zinc-900 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <label
                            htmlFor={`ms-done-${ms.id}`}
                            className={`font-medium cursor-pointer ${
                              ms.isDone
                                ? 'line-through text-zinc-500'
                                : 'text-zinc-200'
                            }`}
                          >
                            {ms.title}
                          </label>
                        </div>
                        <div className="flex items-center gap-3 tabular-nums shrink-0 self-end sm:self-center">
                          <span className="font-semibold text-zinc-200 font-mono">
                            {ms.amount.toLocaleString()} {currency}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleMilestonePaid(p, ms.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border transition-colors ${
                              ms.isPaid
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                            }`}
                          >
                            {ms.isPaid ? 'تم التحصيل ✅' : 'بانتظار الدفع (اضغط للتحصيل)'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Milestone Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <input
                      type="text"
                      aria-label={`عنوان دفعة جديدة لمشروع ${p.projectName}`}
                      placeholder="أضف دفعة أو مرحلة جديدة..."
                      value={milestoneInputs[p.id]?.title || ''}
                      onChange={(e) =>
                        setMilestoneInputs((prev) => ({
                          ...prev,
                          [p.id]: {
                            title: e.target.value,
                            amount: prev[p.id]?.amount || '',
                          },
                        }))
                      }
                      className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      aria-label={`مبلغ الدفعة الجديدة لمشروع ${p.projectName}`}
                      placeholder={`المبلغ (${currency})`}
                      value={milestoneInputs[p.id]?.amount || ''}
                      onChange={(e) =>
                        setMilestoneInputs((prev) => ({
                          ...prev,
                          [p.id]: {
                            title: prev[p.id]?.title || '',
                            amount: e.target.value,
                          },
                        }))
                      }
                      className="w-32 px-3 py-1.5 text-xs bg-[#0f1015] border border-white/10 rounded-xl text-zinc-200 tabular-nums focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddMilestone(p)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] rounded-xl cursor-pointer transition-colors"
                    >
                      + إضافة مرحلة
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Contract Modal for active project */}
      {activeContractProject && (
        <ContractModal
          project={activeContractProject}
          currency={currency}
          isOpen={Boolean(activeContractProject)}
          onClose={() => setActiveContractProject(null)}
          onSaveContract={(updatedContract) => {
            const updated = {
              ...activeContractProject,
              contract: updatedContract,
            };
            onUpdateProject(updated);
            setActiveContractProject(updated);
          }}
        />
      )}
    </div>
  );
};
