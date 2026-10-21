import React, { useState } from 'react';
import type {
  IdeaItem,
  IdeaStatus,
  OutreachContact,
  OutreachStage,
  ChannelType,
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
  UserPlus,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Phone,
  Edit3,
  Check,
  X,
} from 'lucide-react';

const CHANNEL_OPTIONS: { id: ChannelType; label: string }[] = [
  { id: 'whatsapp', label: 'واتساب' },
  { id: 'phone', label: 'اتصال هاتفي' },
  { id: 'linkedin', label: 'لينكد إن' },
  { id: 'x', label: 'إكس (تويتر)' },
  { id: 'tiktok', label: 'تيك توك' },
  { id: 'email', label: 'بريد إلكتروني' },
  { id: 'telegram', label: 'تيليجرام' },
];

interface IdeasLabSectionProps {
  ideas: IdeaItem[];
  contacts: OutreachContact[];
  currency: string;
  onAddIdea: (idea: IdeaItem) => void;
  onUpdateIdea: (idea: IdeaItem) => void;
  onDeleteIdea: (ideaId: string) => void;
  onAddContact?: (contact: OutreachContact) => void;
  onDeleteContact?: (contactId: string) => void;
  onUpdateContact?: (contact: OutreachContact) => void;
  onAddContactForIdea?: (ideaId: string) => void;
  onUpdateContactStage: (contactId: string, stage: OutreachStage) => void;
}

export const IdeasLabSection: React.FC<IdeasLabSectionProps> = ({
  ideas,
  contacts,
  currency,
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  onAddContact,
  onDeleteContact,
  onUpdateContact,
  onAddContactForIdea,
  onUpdateContactStage,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all');

  // Inline Contact adding state per idea
  const [addingContactForIdeaId, setAddingContactForIdeaId] = useState<string | null>(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactChannel, setNewContactChannel] = useState<ChannelType>('whatsapp');
  const [newContactStage, setNewContactStage] = useState<OutreachStage>('replied');
  const [newContactFeedback, setNewContactFeedback] = useState('');
  const [newContactWillingToPay, setNewContactWillingToPay] = useState(false);
  const [newContactPrice, setNewContactPrice] = useState<number>(0);

  const handleSaveContactInline = (ideaId: string) => {
    if (!newContactName.trim()) return;
    if (onAddContact) {
      const newContact: OutreachContact = {
        id: `contact-${Date.now()}`,
        ideaId,
        name: newContactName.trim(),
        roleOrPersona: newContactRole.trim() || 'مهتم محتمل',
        stage: newContactStage,
        primaryChannel: newContactChannel,
        channels: {
          phone: '',
          whatsapp: '',
          xHandle: '',
          tiktokHandle: '',
          linkedinUrl: '',
          email: '',
          telegramHandle: '',
          otherChannel: '',
        },
        feedbackSummary: newContactFeedback.trim(),
        willingToPay: newContactWillingToPay,
        expectedPriceMonthly: Number(newContactPrice) || 0,
        lastContactDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(new Date()),
        nextFollowUpDate: '',
      };
      onAddContact(newContact);
    }
    setAddingContactForIdeaId(null);
    setNewContactName('');
    setNewContactRole('');
    setNewContactFeedback('');
    setNewContactWillingToPay(false);
    setNewContactPrice(0);
    setNewContactStage('replied');
    setNewContactChannel('whatsapp');
  };

  // Editing contact feedback/conversation
  const [editingFeedbackContactId, setEditingFeedbackContactId] = useState<string | null>(null);
  const [editingFeedbackText, setEditingFeedbackText] = useState('');

  const handleStartEditFeedback = (contact: OutreachContact) => {
    setEditingFeedbackContactId(contact.id);
    setEditingFeedbackText(contact.feedbackSummary || '');
  };

  const handleSaveEditFeedback = (contact: OutreachContact) => {
    if (onUpdateContact) {
      onUpdateContact({
        ...contact,
        feedbackSummary: editingFeedbackText.trim(),
      });
    }
    setEditingFeedbackContactId(null);
    setEditingFeedbackText('');
  };

  // Form State
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [status, setStatus] = useState<IdeaStatus>('validating');
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
      createdAt: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(new Date()),
      notes: notes.trim(),
    };

    onAddIdea(newIdea);

    // Reset Form
    setTitle('');
    setTargetAudience('');
    setStatus('validating');
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

          return (
            <div
              key={idea.id}
              className="bg-[#151620] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-6 sm:p-7 shadow-sm transition-all space-y-6"
            >
              {/* Top Header Row of Idea */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-zinc-400">تاريخ الإضافة: {idea.createdAt}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-300 font-medium">
                      التكلفة: {idea.estimatedCost.toLocaleString()} {currency}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        idea.validatedBeforeStart
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          idea.validatedBeforeStart ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span>
                        {idea.validatedBeforeStart
                          ? 'تم التحقق مع المستخدمين الفعليين'
                          : 'لم يكتمل التحقق مع المستخدمين'}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight">{idea.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-4xl">
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
                    className="bg-[#1b1c28] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    {Object.entries(IDEA_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setAddingContactForIdeaId(
                        addingContactForIdeaId === idea.id ? null : idea.id
                      )
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ إضافة متواصل جديد</span>
                  </button>
                </div>
              </div>

              {/* Upper 2 Columns: Idea Overview + Requirements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Solution & Target */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                      <span>نظرة على الفكرة والحل</span>
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <div className="text-[11px] text-zinc-400 font-medium mb-0.5">الفئة المستهدفة:</div>
                        <p className="text-xs text-zinc-200 leading-relaxed">{idea.targetAudience}</p>
                      </div>

                      <div>
                        <div className="text-[11px] text-zinc-400 font-medium mb-0.5">الحل المقترح:</div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {idea.solutionOutline || 'لم يتم توثيق الحل المقترح بعد'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.05]">
                    <div className="text-[11px] text-zinc-400 font-medium mb-1">نموذج الربح:</div>
                    <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20">
                      {idea.monetizationModel}
                    </div>
                  </div>
                </div>

                {/* 2. Requirements */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                      <span>المتطلبات التقنية والتشغيلية</span>
                      <span className="text-[11px] text-zinc-500 font-normal">
                        ({idea.requirements.length})
                      </span>
                    </h4>

                    <ul className="space-y-1.5 my-2 max-h-[160px] overflow-y-auto">
                      {idea.requirements.map((req, idx) => (
                        <li
                          key={idx}
                          className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-xs text-zinc-300 transition-colors"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 group-hover:bg-blue-400 shrink-0" />
                            <span className="truncate">{req}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(idea, idx)}
                            className="text-zinc-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                            title="حذف المتطلب"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-white/[0.05] flex items-center gap-2">
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
                      className="flex-1 bg-[#101118] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddRequirement(idea)}
                      className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg cursor-pointer transition"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Integrated Section: Contacts & Validation Directly in the Card */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 sm:p-5 space-y-4">
                {/* Section Header with Stats Bar & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">
                      سجل المتواصل معهم والتحقق الميداني
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-500/20">
                      {ideaContacts.length} أشخاص
                    </span>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-[#101118] border border-white/[0.05] text-zinc-300">
                      تواصلت مع: <strong className="text-white font-bold">{metrics.totalContacted}</strong> من {idea.targetValidationCount}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#101118] border border-white/[0.05] text-zinc-300">
                      الردود: <strong className="text-white font-bold">{metrics.repliedCount}</strong> ({metrics.responseRatePercent}%)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#101118] border border-white/[0.05] text-emerald-300">
                      مهتمون: <strong className="font-bold">{metrics.potentialClientCount + metrics.convertedCount}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#101118] border border-white/[0.05] text-sky-300">
                      مستعدون للدفع: <strong className="font-bold">{metrics.willingToPayCount}</strong>
                    </span>
                  </div>
                </div>

                {/* Inline Add Contact Form (Toggled directly here) */}
                {addingContactForIdeaId === idea.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveContactInline(idea.id);
                    }}
                    className="p-4 bg-[#101118] border border-blue-500/30 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/[0.06] pb-2">
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <UserPlus className="w-4 h-4" />
                        <span>توثيق مقابلة أو تواصل جديد لهذه الفكرة</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddingContactForIdeaId(null)}
                        className="text-zinc-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                          اسم الشخص أو العميل *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: عبدالله التميمي"
                          value={newContactName}
                          onChange={(e) => setNewContactName(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                          الصفة / النشاط
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: صاحب متجر عطور على سلة"
                          value={newContactRole}
                          onChange={(e) => setNewContactRole(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                          وسيلة التواصل
                        </label>
                        <select
                          value={newContactChannel}
                          onChange={(e) => setNewContactChannel(e.target.value as ChannelType)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 cursor-pointer"
                        >
                          {CHANNEL_OPTIONS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                          مرحلة التواصل
                        </label>
                        <select
                          value={newContactStage}
                          onChange={(e) => setNewContactStage(e.target.value as OutreachStage)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 cursor-pointer"
                        >
                          {Object.entries(OUTREACH_STAGE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newContactWillingToPay}
                            onChange={(e) => setNewContactWillingToPay(e.target.checked)}
                            className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-0"
                          />
                          <span>مستعد للدفع والاشتراك؟</span>
                        </label>
                      </div>

                      {newContactWillingToPay && (
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                            السعر المقترح شهرياً ({currency})
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="مثال: 149"
                            value={newContactPrice || ''}
                            onChange={(e) => setNewContactPrice(Number(e.target.value) || 0)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        ملخص المقابلة والملاحظات المستفادة
                      </label>
                      <textarea
                        rows={2}
                        placeholder="ماذا قال؟ ما هي أكبر مشكلة تواجهه؟ هل أظهر حماساً للمنتج؟"
                        value={newContactFeedback}
                        onChange={(e) => setNewContactFeedback(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAddingContactForIdeaId(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm cursor-pointer transition"
                      >
                        حفظ المقابلة في هذه الفكرة
                      </button>
                    </div>
                  </form>
                )}

                {/* Contacts List Directly Visible Inside Card */}
                {ideaContacts.length === 0 ? (
                  <div className="p-5 text-center bg-white/[0.01] rounded-xl border border-dashed border-white/10 text-xs text-zinc-400 space-y-2">
                    <p>لم توثق أي تواصل أو مقابلة لهذه الفكرة حتى الآن.</p>
                    <button
                      type="button"
                      onClick={() => setAddingContactForIdeaId(idea.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-medium cursor-pointer transition shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ توثيق أول تواصل / مقابلة الآن</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.05] border border-white/[0.05] rounded-xl bg-white/[0.01] overflow-hidden text-xs">
                    {ideaContacts.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-sm">{c.name}</span>
                            <span className="text-[11px] text-zinc-400">({c.roleOrPersona})</span>
                            <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 text-[10px]">
                              {CHANNEL_OPTIONS.find((ch) => ch.id === c.primaryChannel)?.label || c.primaryChannel}
                            </span>
                          </div>

                          {editingFeedbackContactId === c.id ? (
                            <div className="mt-2 space-y-2 max-w-2xl">
                              <label className="block text-[11px] font-semibold text-blue-400">
                                تعديل ملخص الحوار والملاحظات مع {c.name}:
                              </label>
                              <textarea
                                rows={3}
                                value={editingFeedbackText}
                                onChange={(e) => setEditingFeedbackText(e.target.value)}
                                placeholder="اكتب ما دار في الحوار مع العميل والملاحظات المستفادة..."
                                className="w-full bg-[#101118] border border-blue-500/50 rounded-lg p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-400"
                                autoFocus
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditFeedback(c)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>حفظ التعديل</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFeedbackContactId(null)}
                                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 pt-0.5 group/dialogue">
                              <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                                {c.feedbackSummary}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleStartEditFeedback(c)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-blue-400 text-[11px] transition-colors cursor-pointer shrink-0"
                                title="تعديل الحوار والملاحظات"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>تعديل الحوار</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                          {c.willingToPay && (
                            <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 font-medium">
                              مستعد للدفع: {c.expectedPriceMonthly} {currency}/شهرياً
                            </span>
                          )}

                          <select
                            value={c.stage}
                            onChange={(e) =>
                              onUpdateContactStage(c.id, e.target.value as OutreachStage)
                            }
                            className="bg-[#12131c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-zinc-200 cursor-pointer"
                          >
                            {Object.entries(OUTREACH_STAGE_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>

                          {onDeleteContact && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف ${c.name} من سجل الفكرة؟`)) {
                                  onDeleteContact(c.id);
                                }
                              }}
                              className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                              title="حذف هذا المتواصل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] text-xs">
                <div className="text-zinc-400 flex items-center gap-2 max-w-2xl">
                  <span className="text-zinc-500 font-medium shrink-0">ملاحظات:</span>
                  <span className="truncate">{idea.notes || 'لا توجد ملاحظات إضافية مسجلة.'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`هل أنت متأكد من حذف فكرة "${idea.title}"؟`)) {
                      onDeleteIdea(idea.id);
                    }
                  }}
                  className="px-2 py-1 text-xs text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  حذف الفكرة
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
