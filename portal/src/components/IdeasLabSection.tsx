import React, { useState } from 'react';
import type {
  IdeaItem,
  IdeaStatus,
  OutreachContact,
  OutreachStage,
} from '../types';
import {
  IDEA_STATUS_LABELS,
  OUTREACH_STAGE_LABELS,
  calculateIdeaMetrics,
} from '../utils/workspaceLogic';
import {
  Lightbulb,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface IdeasLabSectionProps {
  ideas: IdeaItem[];
  contacts: OutreachContact[];
  currency: string;
  onAddIdea: (idea: IdeaItem) => void;
  onUpdateIdea: (idea: IdeaItem) => void;
  onDeleteIdea: (ideaId: string) => void;
  onGoToOutreachWithIdea?: (ideaId: string) => void;
  onUpdateContactStage: (contactId: string, stage: OutreachStage) => void;
}

export const IdeasLabSection: React.FC<IdeasLabSectionProps> = ({
  ideas,
  contacts,
  currency,
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  onGoToOutreachWithIdea,
  onUpdateContactStage,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all');
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [status, setStatus] = useState<IdeaStatus>('validation');
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionOutline, setSolutionOutline] = useState('');
  const [monetizationModel, setMonetizationModel] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [targetValidationCount, setTargetValidationCount] = useState<number>(10);
  const [rawRequirements, setRawRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Per-idea inline requirement adding
  const [newReqByIdea, setNewReqByIdea] = useState<Record<string, string>>({});

  const filteredIdeas =
    statusFilter === 'all'
      ? ideas
      : ideas.filter((i) => i.status === statusFilter);

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAudience.trim()) {
      setFormError('يرجى كتابة اسم الفكرة والفئة المستهدفة على الأقل.');
      return;
    }

    const reqs = rawRequirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const newIdea: IdeaItem = {
      id: `idea-${Date.now()}`,
      title: title.trim(),
      targetAudience: targetAudience.trim(),
      status,
      problemStatement:
        problemStatement.trim() || 'لم يتم توثيق بيان المشكلة بعد',
      solutionOutline: solutionOutline.trim() || 'لم يوثق الحل المقترح بعد',
      monetizationModel:
        monetizationModel.trim() || 'اشتراك شهري SaaS أو دفع بالاستخدام',
      estimatedCost: Number(estimatedCost) || 0,
      targetValidationCount: Number(targetValidationCount) || 10,
      validatedBeforeStart: false,
      requirements: reqs.length > 0 ? reqs : ['أبحاث المستخدمين الأولية'],
      createdAt: new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
    };

    onAddIdea(newIdea);

    // Reset Form
    setTitle('');
    setTargetAudience('');
    setStatus('validation');
    setProblemStatement('');
    setSolutionOutline('');
    setMonetizationModel('');
    setEstimatedCost(0);
    setTargetValidationCount(10);
    setRawRequirements('');
    setNotes('');
    setFormError('');
    setShowAddForm(false);
  };

  const handleAddRequirement = (idea: IdeaItem) => {
    const text = (newReqByIdea[idea.id] || '').trim();
    if (!text) return;
    onUpdateIdea({
      ...idea,
      requirements: [...idea.requirements, text],
    });
    setNewReqByIdea((prev) => ({ ...prev, [idea.id]: '' }));
  };

  const handleRemoveRequirement = (idea: IdeaItem, index: number) => {
    onUpdateIdea({
      ...idea,
      requirements: idea.requirements.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Header Card */}
      <div className="bg-[#171821] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>بنك الأفكار والتحقق من السوق</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              الأفكار والتحقق قبل البرمجة
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              وثّق كل فكرة، من تستهدف، متطلباتها التقنية والتشغيلية، ومدى تجاوب العملاء الفعليين قبل كتابة أول سطر كود.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'إغلاق النموذج' : '+ إضافة فكرة جديدة'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add New Idea Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateIdea}
          className="bg-[#171821] border border-white/[0.09] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                تسجيل فكرة مشروع جديدة وتحديد احتياجاتها
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {formError && (
            <div className="p-3 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label htmlFor="new-idea-title" className="block font-semibold text-zinc-300 mb-1.5">
                اسم الفكرة / المشروع *
              </label>
              <input
                id="new-idea-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: رداد الذكي للسلات المتروكة"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="new-idea-audience" className="block font-semibold text-zinc-300 mb-1.5">
                من تستهدف الفكرة؟ (الفئة المستهدفة) *
              </label>
              <input
                id="new-idea-audience"
                type="text"
                required
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="مثال: أصحاب المتاجر في سلة وزد"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="new-idea-status" className="block font-semibold text-zinc-300 mb-1.5">
                حالة الفكرة
              </label>
              <select
                id="new-idea-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-zinc-500"
              >
                {Object.entries(IDEA_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label htmlFor="new-idea-problem" className="block font-semibold text-zinc-300 mb-1.5">
                ما هي المشكلة التي تحلها بالضبط؟ (المشكلة الحقيقية)
              </label>
              <textarea
                id="new-idea-problem"
                rows={2}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="أصحاب المتاجر يفقدون مبيعات بسبب السلات المتروكة وصعوبة تتبعها يدوياً..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 leading-relaxed"
              />
            </div>

            <div>
              <label htmlFor="new-idea-solution" className="block font-semibold text-zinc-300 mb-1.5">
                كيف ستحلها تقنياً؟ (الحل المقترح)
              </label>
              <textarea
                id="new-idea-solution"
                rows={2}
                value={solutionOutline}
                onChange={(e) => setSolutionOutline(e.target.value)}
                placeholder="تطبيق سلة يقوم بإرسال رسائل واتساب ذكية ومجدولة تلقائياً..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label htmlFor="new-idea-monetization" className="block font-semibold text-zinc-300 mb-1.5">
                نموذج الربح (التسعير)
              </label>
              <input
                id="new-idea-monetization"
                type="text"
                value={monetizationModel}
                onChange={(e) => setMonetizationModel(e.target.value)}
                placeholder="اشتراك شهري 199 ر.س"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="new-idea-cost" className="block font-semibold text-zinc-300 mb-1.5">
                التكلفة التقديرية المبدئية ({currency})
              </label>
              <input
                id="new-idea-cost"
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value) || 0)}
                placeholder="500"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="new-idea-target-val" className="block font-semibold text-zinc-300 mb-1.5">
                الهدف: التواصل مع كم عميل للتحقق؟
              </label>
              <input
                id="new-idea-target-val"
                type="number"
                value={targetValidationCount}
                onChange={(e) => setTargetValidationCount(Number(e.target.value) || 10)}
                placeholder="10"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-idea-reqs" className="block font-semibold text-zinc-300 mb-1.5">
              المتطلبات التقنية والتشغيلية (كل متطلب في سطر مستقل)
            </label>
            <textarea
              id="new-idea-reqs"
              rows={2}
              value={rawRequirements}
              onChange={(e) => setRawRequirements(e.target.value)}
              placeholder="ربط مع واجهة WhatsApp Cloud API&#10;تطوير تطبيق سلة معتمد&#10;قاعدة بيانات Supabase أو PostgreSQL"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl cursor-pointer shadow-sm transition-all"
            >
              حفظ الفكرة
            </button>
          </div>
        </form>
      )}

      {/* Status Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-850 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          جميع الأفكار ({ideas.length})
        </button>
        {(Object.entries(IDEA_STATUS_LABELS) as [IdeaStatus, string][]).map(([key, label]) => {
          const count = ideas.filter((i) => i.status === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === key
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Ideas Cards List */}
      <div className="space-y-4">
        {filteredIdeas.map((idea) => {
          const metrics = calculateIdeaMetrics(idea, contacts);
          const ideaContacts = contacts.filter((c) => c.ideaId === idea.id);
          const isExpanded = expandedIdeaId === idea.id;

          return (
            <div
              key={idea.id}
              className="bg-[#171821] border border-white/[0.07] hover:border-white/[0.12] rounded-2xl p-6 shadow-sm transition-all space-y-4"
            >
              {/* Top Header Row of Idea */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                    <span className="font-mono">تاريخ الإضافة: {idea.createdAt}</span>
                    <span>•</span>
                    <span className="font-mono">
                      التكلفة: {idea.estimatedCost.toLocaleString()} {currency}
                    </span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        idea.validatedBeforeStart ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {idea.validatedBeforeStart
                        ? 'تم التحقق مع المستخدمين الفعليين قبل البدء'
                        : 'لم يتم التواصل الكافي مع المستخدمين بعد'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{idea.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
                    {idea.problemStatement}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <select
                    value={idea.status}
                    onChange={(e) =>
                      onUpdateIdea({
                        ...idea,
                        status: e.target.value as IdeaStatus,
                      })
                    }
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-zinc-500"
                  >
                    {Object.entries(IDEA_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      if (onGoToOutreachWithIdea) onGoToOutreachWithIdea(idea.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition shadow-sm"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>سجل تواصل الفكرة ({ideaContacts.length})</span>
                  </button>
                </div>
              </div>

              {/* Middle 3 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-2">
                {/* 1. Solution & Target */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-[11px] font-bold text-zinc-400 mb-1">الفئة المستهدفة</h4>
                    <p className="text-xs text-zinc-200">{idea.targetAudience}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-zinc-400 mb-1">الحل المقترح</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{idea.solutionOutline}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-zinc-400 mb-1">نموذج الربح</h4>
                    <p className="text-xs text-emerald-400 font-mono">{idea.monetizationModel}</p>
                  </div>
                </div>

                {/* 2. Requirements */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-400">
                    المتطلبات التقنية والتشغيلية:
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {idea.requirements.map((req, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-950/70 border border-zinc-850"
                      >
                        <span className="truncate">• {req}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(idea, idx)}
                          className="text-zinc-500 hover:text-rose-400 text-[10px] cursor-pointer"
                        >
                          حذف
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="أضف أداة أو متطلباً..."
                      value={newReqByIdea[idea.id] || ''}
                      onChange={(e) =>
                        setNewReqByIdea((prev) => ({
                          ...prev,
                          [idea.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRequirement(idea);
                        }
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddRequirement(idea)}
                      className="px-2.5 py-1 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer"
                    >
                      إضافة
                    </button>
                  </div>
                </div>

                {/* 3. Outreach Metrics Grid */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-400">
                    إحصائيات التواصل والتحقق:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                      <div className="text-[11px] text-zinc-400">تواصلت مع</div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        {metrics.totalContacted}{' '}
                        <span className="text-[10px] text-zinc-500 font-normal">
                          من {idea.targetValidationCount}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                      <div className="text-[11px] text-zinc-400">تم الرد والنقاش</div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        {metrics.repliedCount}{' '}
                        <span className="text-[10px] text-zinc-500 font-normal">
                          ({metrics.responseRatePercent}%)
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                      <div className="text-[11px] text-zinc-400">عميل محتمل / مشترك</div>
                      <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                        {metrics.potentialClientCount + metrics.convertedCount}
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                      <div className="text-[11px] text-zinc-400">مستعدون للدفع</div>
                      <div className="text-base font-bold text-blue-400 font-mono mt-0.5">
                        {metrics.willingToPayCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 text-xs">
                <span className="text-zinc-500">
                  {idea.notes ? `ملاحظات: ${idea.notes}` : 'لا توجد ملاحظات إضافية'}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedIdeaId(isExpanded ? null : idea.id)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer flex items-center gap-1"
                  >
                    <span>
                      {isExpanded
                        ? `إخفاء المتواصل معهم (${ideaContacts.length})`
                        : `عرض المتواصل معهم لهذه الفكرة (${ideaContacts.length})`}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف فكرة ${idea.title}؟`)) {
                        onDeleteIdea(idea.id);
                      }
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    حذف الفكرة
                  </button>
                </div>
              </div>

              {/* Expandable Contacts List for this Idea */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-zinc-800 space-y-3">
                  {ideaContacts.length === 0 ? (
                    <div className="p-4 text-center bg-zinc-950 rounded-xl border border-zinc-850 text-xs text-zinc-500">
                      لم تسجل أي شخص تم التواصل معه لهذه الفكرة بعد. اضغط على "سجل تواصل الفكرة" بالأعلى لتوثيق أول مقابلة.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800/80 border border-zinc-850 rounded-xl bg-zinc-950/60 overflow-hidden text-xs">
                      {ideaContacts.map((c) => (
                        <div key={c.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{c.name}</span>
                              <span className="text-[11px] text-zinc-400 font-mono">({c.roleOrPersona})</span>
                            </div>
                            <p className="text-[11px] text-zinc-300 mt-1 max-w-xl leading-relaxed">
                              {c.feedbackSummary}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <select
                              value={c.stage}
                              onChange={(e) =>
                                onUpdateContactStage(c.id, e.target.value as OutreachStage)
                              }
                              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-white"
                            >
                              {Object.entries(OUTREACH_STAGE_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                            {c.willingToPay && (
                              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/60">
                                {c.expectedPriceMonthly} {currency}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
