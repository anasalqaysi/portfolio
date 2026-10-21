import React, { useState, useEffect } from 'react';
import type {
  IdeaItem,
  OutreachContact,
  OutreachStage,
  ChannelType,
} from '../types';
import {
  filterContacts,
  OUTREACH_STAGE_LABELS,
  formatSocialLink,
} from '../utils/workspaceLogic';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Globe,
  LayoutGrid,
  List,
  Calendar,
  X,
  Phone,
  Sparkles,
} from 'lucide-react';

interface OutreachCrmSectionProps {
  ideas: IdeaItem[];
  contacts: OutreachContact[];
  currency: string;
  preselectedIdeaId?: string | null;
  onClearPreselectedIdea?: () => void;
  onAddContact: (contact: OutreachContact) => void;
  onUpdateContact: (contact: OutreachContact) => void;
  onDeleteContact: (contactId: string) => void;
}

// Stage configuration with soft modern colors
const STAGE_CONFIG: Record<
  OutreachStage,
  { label: string; dotColor: string; badgeBg: string }
> = {
  contacted: {
    label: 'تم التواصل',
    dotColor: 'bg-zinc-400',
    badgeBg: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/50',
  },
  replied: {
    label: 'تم الرد',
    dotColor: 'bg-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  },
  interviewed: {
    label: 'تم النقاش والملاحظات',
    dotColor: 'bg-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
  potential_client: {
    label: 'عميل محتمل مهتم',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  converted_user: {
    label: 'عميل فعلي / مشترك',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  not_interested: {
    label: 'غير مهتم حالياً',
    dotColor: 'bg-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  },
};

export const OutreachCrmSection: React.FC<OutreachCrmSectionProps> = ({
  ideas,
  contacts,
  currency,
  preselectedIdeaId,
  onClearPreselectedIdea,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
}) => {
  const [showAddForm, setShowAddForm] = useState(Boolean(preselectedIdeaId));
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdeaFilter, setSelectedIdeaFilter] = useState<string>('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState<
    OutreachStage | 'all'
  >('all');
  const [selectedChannelFilter, setSelectedChannelFilter] =
    useState<string>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<OutreachContact | null>(null);

  // New Contact Form State
  const [ideaId, setIdeaId] = useState<string>(
    preselectedIdeaId || ideas[0]?.id || ''
  );
  const [name, setName] = useState('');
  const [roleOrPersona, setRoleOrPersona] = useState('');
  const [stage, setStage] = useState<OutreachStage>('contacted');
  const [primaryChannel, setPrimaryChannel] = useState<ChannelType>('whatsapp');
  const [phone, setPhone] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [email, setEmail] = useState('');
  const [otherChannel, setOtherChannel] = useState('');
  const [feedbackSummary, setFeedbackSummary] = useState('');
  const [willingToPay, setWillingToPay] = useState(true);
  const [expectedPriceMonthly, setExpectedPriceMonthly] = useState<number>(100);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
  );
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (preselectedIdeaId) {
      setIdeaId(preselectedIdeaId);
      setShowAddForm(true);
    }
  }, [preselectedIdeaId]);

  const filtered = filterContacts(contacts, {
    searchQuery,
    ideaId: selectedIdeaFilter,
    stage: selectedStageFilter,
    channel: selectedChannelFilter,
  });

  const handleCopy = (val: string, label: string) => {
    if (!val) return;
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopiedText(`${label}: ${val}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('يرجى إدخال اسم الشخص الذي تواصلت معه.');
      return;
    }
    const newContact: OutreachContact = {
      id: `cnt-${Date.now()}`,
      ideaId: ideaId || ideas[0]?.id || '',
      name: name.trim(),
      roleOrPersona: roleOrPersona.trim() || 'مستخدم مستهدف',
      stage,
      primaryChannel,
      channels: {
        phone: phone.trim(),
        whatsapp: phone.trim(),
        xHandle: xHandle.trim(),
        tiktokHandle: tiktokHandle.trim(),
        linkedinUrl: '',
        email: email.trim(),
        telegramHandle: telegramHandle.trim(),
        otherChannel: otherChannel.trim(),
      },
      feedbackSummary:
        feedbackSummary.trim() || 'تم التواصل المبدئي وبانتظار التفاصيل',
      willingToPay,
      expectedPriceMonthly: Number(expectedPriceMonthly) || 0,
      lastContactDate: new Date().toISOString().slice(0, 10),
      nextFollowUpDate,
    };
    onAddContact(newContact);
    setName('');
    setRoleOrPersona('');
    setPhone('');
    setXHandle('');
    setTiktokHandle('');
    setTelegramHandle('');
    setEmail('');
    setOtherChannel('');
    setFeedbackSummary('');
    setFormError('');
    setShowAddForm(false);
    if (onClearPreselectedIdea) onClearPreselectedIdea();
  };

  const willingCount = contacts.filter((c) => c.willingToPay).length;
  const payingCount = contacts.filter((c) => c.stage === 'converted_user').length;

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-[#171821] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2.5">
              <Users className="w-3.5 h-3.5" />
              <span>إدارة وتواصل العملاء المحتملين</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              سجل تواصل وتحقق العملاء (CRM)
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              تتبّع مقابلات واقتراحات العملاء وقنوات تواصلهم بسهولة في مساحة قراءة واسعة ومريحة للعين.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#101118] border border-white/[0.08] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>جدول منظم</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>بطاقات عصرية</span>
              </button>
            </div>

            {/* Add Contact Button */}
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'إغلاق النموذج' : '+ تسجيل شخص جديد'}</span>
            </button>
          </div>
        </div>

        {/* Quick Insights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/[0.06]">
          <div className="p-3 bg-[#111219] rounded-xl border border-white/[0.05]">
            <span className="text-xs text-zinc-400 block mb-0.5">إجمالي المسجلين</span>
            <span className="text-lg font-bold text-white font-mono">{contacts.length} شخص</span>
          </div>
          <div className="p-3 bg-[#111219] rounded-xl border border-white/[0.05]">
            <span className="text-xs text-zinc-400 block mb-0.5">مستعدون للدفع</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{willingCount} مهتم</span>
          </div>
          <div className="p-3 bg-[#111219] rounded-xl border border-white/[0.05]">
            <span className="text-xs text-zinc-400 block mb-0.5">مشتركون فعلياً</span>
            <span className="text-lg font-bold text-blue-400 font-mono">{payingCount} مشترك</span>
          </div>
          <div className="p-3 bg-[#111219] rounded-xl border border-white/[0.05]">
            <span className="text-xs text-zinc-400 block mb-0.5">نسبة الإيجابية</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {contacts.length > 0 ? Math.round((willingCount / contacts.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Add Contact Form (Soft Charcoal Theme) */}
      {showAddForm && (
        <form
          onSubmit={handleCreateContact}
          className="bg-[#171821] border border-white/[0.09] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-bold text-white">
                إضافة سجل تواصل جديد مع مستخدم أو عميل محتمل
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
            <div className="p-3 text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label htmlFor="cnt-name" className="block font-semibold text-zinc-300 mb-1.5">
                اسم الشخص / العميل *
              </label>
              <input
                id="cnt-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: عبد الرحمن السبيعي"
                className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="cnt-role" className="block font-semibold text-zinc-300 mb-1.5">
                صفته أو مجاله
              </label>
              <input
                id="cnt-role"
                type="text"
                value={roleOrPersona}
                onChange={(e) => setRoleOrPersona(e.target.value)}
                placeholder="مثال: مؤسس متجر عطور على سلة"
                className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="cnt-idea" className="block font-semibold text-zinc-300 mb-1.5">
                الفكرة المرتبطة
              </label>
              <select
                id="cnt-idea"
                value={ideaId}
                onChange={(e) => setIdeaId(e.target.value)}
                className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 transition"
              >
                {ideas.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cnt-stage" className="block font-semibold text-zinc-300 mb-1.5">
                المرحلة التي وصلتها معه
              </label>
              <select
                id="cnt-stage"
                value={stage}
                onChange={(e) => setStage(e.target.value as OutreachStage)}
                className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 transition"
              >
                {Object.entries(OUTREACH_STAGE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Social Channels in Form */}
          <div className="p-3.5 bg-[#101118] rounded-xl border border-white/[0.07] space-y-2.5">
            <span className="block text-xs font-semibold text-zinc-300">
              قنوات التواصل المسجلة:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">رقم الجوال / واتساب</label>
                <input
                  type="text"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 50 123 4567"
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">حساب منصة X</label>
                <input
                  type="text"
                  dir="ltr"
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">يوزر تيك توك (TikTok)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={tiktokHandle}
                  onChange={(e) => setTiktokHandle(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">البريد أو رابط المتجر</label>
                <input
                  type="text"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@store.sa"
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono text-left"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                مستعد للدفع شهرياً؟
              </label>
              <select
                value={willingToPay ? 'yes' : 'no'}
                onChange={(e) => setWillingToPay(e.target.value === 'yes')}
                className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="yes">نعم — مستعد للدفع والاشتراك 💰</option>
                <option value="no">لا / لم يتحدد بعد</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                السعر المتوقع شهرياً ({currency})
              </label>
              <input
                type="number"
                value={expectedPriceMonthly}
                onChange={(e) => setExpectedPriceMonthly(Number(e.target.value) || 0)}
                placeholder="200"
                className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                تاريخ المتابعة القادم
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cnt-feedback" className="block font-semibold text-zinc-300 mb-1.5">
              خلاصة النقاش ورأيه الفعلي في الفكرة
            </label>
            <textarea
              id="cnt-feedback"
              rows={3}
              value={feedbackSummary}
              onChange={(e) => setFeedbackSummary(e.target.value)}
              placeholder="اكتب ماذا قال لك عند عرض الفكرة عليه بالتفصيل..."
              className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl cursor-pointer shadow-sm transition"
            >
              حفظ سجل التواصل
            </button>
          </div>
        </form>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-[#171821] border border-white/[0.07] rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، رقم الجوال، حساب @X، أو كلمات النقاش..."
            className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 pr-9 pl-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedIdeaFilter}
            onChange={(e) => setSelectedIdeaFilter(e.target.value)}
            className="bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="all">جميع الأفكار ({contacts.length})</option>
            {ideas.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>

          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value as OutreachStage | 'all')}
            className="bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="all">جميع المراحل</option>
            {Object.entries(OUTREACH_STAGE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={selectedChannelFilter}
            onChange={(e) => setSelectedChannelFilter(e.target.value)}
            className="bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="all">كل وسائل التواصل</option>
            <option value="phone">يتوفر رقم جوال / واتساب</option>
            <option value="x">يتوفر حساب X</option>
            <option value="tiktok">يتوفر يوزر تيك توك</option>
            <option value="telegram">يتوفر تيليجرام</option>
          </select>
        </div>
      </div>

      {copiedText && (
        <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 w-fit shadow-md">
          <Check className="w-3.5 h-3.5" />
          <span>تم النسخ بنجاح: {copiedText}</span>
        </div>
      )}

      {/* Main Content: Natural Table or Cards */}
      {filtered.length === 0 ? (
        <div className="bg-[#171821] border border-white/[0.07] rounded-2xl p-12 text-center space-y-2">
          <Users className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <h4 className="text-base font-bold text-white">لا توجد سجلات تواصل مطابقة</h4>
          <p className="text-xs text-zinc-400">
            جرّب تغيير خيارات البحث والتصفية أو أضف شخصاً جديداً تواصلت معه.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* NATURAL CLEAN MODERN TABLE */
        <div className="bg-[#171821] border border-white/[0.07] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#111219] border-b border-white/[0.06] text-zinc-400 font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-[22%] min-w-[190px]">العميل والصفة</th>
                  <th className="py-3.5 px-4 w-[18%] min-w-[170px]">الفكرة والمرحلة</th>
                  <th className="py-3.5 px-4 w-[22%] min-w-[190px]">قنوات التواصل</th>
                  <th className="py-3.5 px-4 w-[32%] min-w-[320px]">ملخص النقاش والتحقق</th>
                  <th className="py-3.5 px-3 w-[6%] text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filtered.map((c) => {
                  const idea = ideas.find((i) => i.id === c.ideaId);
                  const phoneNum = c.channels.phone || c.channels.whatsapp;
                  const stageInfo = STAGE_CONFIG[c.stage] || STAGE_CONFIG.contacted;

                  // Initials for avatar
                  const initials = c.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('');

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#1f202b]/60 transition-colors align-top"
                    >
                      {/* 1. Client Info with Clean Avatar */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/[0.08] flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5 shadow-xs">
                            {initials || 'ع'}
                          </div>
                          <div>
                            <div
                              onClick={() => setEditingContact(c)}
                              className="font-bold text-white text-sm hover:text-blue-400 transition cursor-pointer"
                            >
                              {c.name}
                            </div>
                            <div className="text-zinc-400 text-xs mt-0.5 leading-snug">
                              {c.roleOrPersona}
                            </div>
                            <div className="text-zinc-500 text-[11px] mt-1.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              <span dir="ltr" className="font-mono">{c.lastContactDate}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Idea & Stage Dropdown */}
                      <td className="py-4 px-4 space-y-2">
                        <div className="font-medium text-zinc-300 text-xs line-clamp-1" title={idea?.title}>
                          {idea ? idea.title.split('—')[0].trim() : 'عام'}
                        </div>

                        {/* Stage Selector with soft dot */}
                        <div className="relative">
                          <select
                            value={c.stage}
                            onChange={(e) =>
                              onUpdateContact({
                                ...c,
                                stage: e.target.value as OutreachStage,
                              })
                            }
                            className={`w-full appearance-none rounded-lg pr-6 pl-2.5 py-1 text-xs font-medium border focus:outline-none transition cursor-pointer ${stageInfo.badgeBg}`}
                          >
                            {Object.entries(OUTREACH_STAGE_LABELS).map(([k, v]) => (
                              <option key={k} value={k} className="bg-[#171821] text-white">
                                {v}
                              </option>
                            ))}
                          </select>
                          <span
                            className={`w-2 h-2 rounded-full absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${stageInfo.dotColor}`}
                          />
                        </div>

                        {c.nextFollowUpDate && (
                          <div className="text-[11px] text-amber-300/90 font-mono">
                            متابعة: <span dir="ltr">{c.nextFollowUpDate}</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Consolidated Social Channels (Natural strip, zero clutter) */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {/* WhatsApp / Phone */}
                          {phoneNum && (
                            <div className="flex items-center gap-2">
                              <a
                                href={formatSocialLink('whatsapp', phoneNum)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium transition"
                                title="محادثة واتساب مباشرة"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span dir="ltr" className="dir-ltr font-mono font-bold tracking-wider">
                                  {phoneNum}
                                </span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopy(phoneNum, 'رقم الجوال')}
                                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/[0.05] transition cursor-pointer"
                                title="نسخ الرقم"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Social handles list (X, TikTok, Telegram) */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            {/* X Account */}
                            {c.channels.xHandle && (
                              <a
                                href={formatSocialLink('x', c.channels.xHandle)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#101118] hover:bg-[#1a1b26] border border-white/[0.07] text-zinc-300 hover:text-white transition"
                                title="فتح ملف X"
                              >
                                <span className="font-bold text-[11px]">𝕏</span>
                                <span dir="ltr" className="dir-ltr font-mono">
                                  {c.channels.xHandle.startsWith('@') ? c.channels.xHandle : `@${c.channels.xHandle}`}
                                </span>
                              </a>
                            )}

                            {/* TikTok */}
                            {c.channels.tiktokHandle && (
                              <a
                                href={formatSocialLink('tiktok', c.channels.tiktokHandle)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#101118] hover:bg-[#1a1b26] border border-white/[0.07] text-zinc-300 hover:text-white transition"
                                title="فتح تيك توك"
                              >
                                <span className="text-[11px] text-pink-400">🎵</span>
                                <span dir="ltr" className="dir-ltr font-mono">
                                  {c.channels.tiktokHandle.startsWith('@') ? c.channels.tiktokHandle : `@${c.channels.tiktokHandle}`}
                                </span>
                              </a>
                            )}

                            {/* Telegram */}
                            {c.channels.telegramHandle && (
                              <a
                                href={formatSocialLink('telegram', c.channels.telegramHandle)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-300 transition"
                              >
                                <span className="text-[10px]">✈</span>
                                <span dir="ltr" className="dir-ltr font-mono">
                                  {c.channels.telegramHandle}
                                </span>
                              </a>
                            )}

                            {/* Email */}
                            {c.channels.email && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#101118] border border-white/[0.07] text-zinc-400"
                                title={c.channels.email}
                              >
                                <Mail className="w-3 h-3 text-zinc-400" />
                                <span dir="ltr" className="dir-ltr font-mono text-[11px] max-w-[120px] truncate">
                                  {c.channels.email}
                                </span>
                              </span>
                            )}

                            {/* Other channel (like store domain) */}
                            {c.channels.otherChannel && (
                              <span className="text-[11px] text-zinc-400 bg-[#101118] px-2 py-0.5 rounded border border-white/[0.06]">
                                {c.channels.otherChannel}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Discussion & Feedback (Natural continuous quote block) */}
                      <td className="py-4 px-4">
                        <div className="space-y-2">
                          <p className="text-[13px] text-zinc-200 leading-relaxed font-normal">
                            "{c.feedbackSummary}"
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            {c.willingToPay ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>مستعد للاشتراك: {c.expectedPriceMonthly} {currency} شهرياً</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-500">
                                لم يبدِ استعداداً للدفع بعد
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 5. Actions */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingContact(c)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer transition"
                            title="تعديل السجل"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف تواصل ${c.name}؟`)) {
                                onDeleteContact(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* MODERN CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => {
            const idea = ideas.find((i) => i.id === c.ideaId);
            const phoneNum = c.channels.phone || c.channels.whatsapp;
            const stageInfo = STAGE_CONFIG[c.stage] || STAGE_CONFIG.contacted;
            const initials = c.name
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .slice(0, 2)
              .join('');

            return (
              <div
                key={c.id}
                className="bg-[#171821] border border-white/[0.07] hover:border-white/[0.12] rounded-2xl p-5 shadow-sm transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-850 border border-white/[0.08] flex items-center justify-center font-bold text-sm text-white shrink-0">
                        {initials || 'ع'}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{c.name}</h4>
                        <p className="text-xs text-zinc-400">{c.roleOrPersona}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingContact(c)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف ${c.name}؟`)) {
                            onDeleteContact(c.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Idea badge and Stage */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-xs font-medium text-zinc-300 bg-[#101118] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                      {idea ? idea.title.split('—')[0].trim() : 'عام'}
                    </span>

                    <div className="relative">
                      <select
                        value={c.stage}
                        onChange={(e) =>
                          onUpdateContact({
                            ...c,
                            stage: e.target.value as OutreachStage,
                          })
                        }
                        className={`appearance-none rounded-lg pr-6 pl-2.5 py-1 text-xs font-medium border focus:outline-none transition cursor-pointer ${stageInfo.badgeBg}`}
                      >
                        {Object.entries(OUTREACH_STAGE_LABELS).map(([k, v]) => (
                          <option key={k} value={k} className="bg-[#171821] text-white">
                            {v}
                          </option>
                        ))}
                      </select>
                      <span
                        className={`w-2 h-2 rounded-full absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${stageInfo.dotColor}`}
                      />
                    </div>
                  </div>

                  {/* Social Channel Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {phoneNum && (
                      <a
                        href={formatSocialLink('whatsapp', phoneNum)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span dir="ltr" className="dir-ltr font-mono font-bold tracking-wide">
                          {phoneNum}
                        </span>
                      </a>
                    )}

                    {c.channels.xHandle && (
                      <a
                        href={formatSocialLink('x', c.channels.xHandle)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#101118] hover:bg-[#1a1b26] border border-white/[0.07] text-zinc-300 hover:text-white text-xs transition"
                      >
                        <span className="font-bold">𝕏</span>
                        <span dir="ltr" className="dir-ltr font-mono">
                          {c.channels.xHandle.startsWith('@') ? c.channels.xHandle : `@${c.channels.xHandle}`}
                        </span>
                      </a>
                    )}

                    {c.channels.tiktokHandle && (
                      <a
                        href={formatSocialLink('tiktok', c.channels.tiktokHandle)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#101118] hover:bg-[#1a1b26] border border-white/[0.07] text-zinc-300 hover:text-white text-xs transition"
                      >
                        <span>🎵</span>
                        <span dir="ltr" className="dir-ltr font-mono">
                          {c.channels.tiktokHandle.startsWith('@') ? c.channels.tiktokHandle : `@${c.channels.tiktokHandle}`}
                        </span>
                      </a>
                    )}
                  </div>

                  {/* Discussion Feedback Box */}
                  <div className="p-3.5 rounded-xl bg-[#101118] border border-white/[0.06] text-xs leading-relaxed text-zinc-200">
                    <span className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      ملخص النقاش والتحقق:
                    </span>
                    <p className="leading-relaxed">"{c.feedbackSummary}"</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                  <div>
                    {c.willingToPay ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        <span>مستعد للاشتراك: {c.expectedPriceMonthly} {currency}/شهرياً 💰</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500">لم يحدد الاستعداد للدفع</span>
                    )}
                  </div>

                  <span className="text-zinc-500 font-mono text-[11px]">
                    <span dir="ltr">{c.lastContactDate}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#171821] border border-white/[0.1] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4 my-8" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">
                تعديل بيانات التواصل مع: {editingContact.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingContact(null)}
                className="text-zinc-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateContact(editingContact);
                setEditingContact(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={editingContact.name}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, name: e.target.value })
                    }
                    className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">الصفة أو المسمى</label>
                  <input
                    type="text"
                    value={editingContact.roleOrPersona}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        roleOrPersona: e.target.value,
                      })
                    }
                    className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">المرحلة الحالية</label>
                  <select
                    value={editingContact.stage}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        stage: e.target.value as OutreachStage,
                      })
                    }
                    className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(OUTREACH_STAGE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">الفكرة المرتبطة</label>
                  <select
                    value={editingContact.ideaId}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, ideaId: e.target.value })
                    }
                    className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {ideas.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">الجوال / الواتساب</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={
                      editingContact.channels.phone ||
                      editingContact.channels.whatsapp
                    }
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        channels: {
                          ...editingContact.channels,
                          phone: e.target.value,
                          whatsapp: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 text-left"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">حساب منصة X</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingContact.channels.xHandle}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        channels: {
                          ...editingContact.channels,
                          xHandle: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 text-left"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">يوزر تيك توك</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingContact.channels.tiktokHandle}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        channels: {
                          ...editingContact.channels,
                          tiktokHandle: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 text-left"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={editingContact.channels.email}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        channels: {
                          ...editingContact.channels,
                          email: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">ملخص النقاش والملاحظات</label>
                <textarea
                  rows={3}
                  value={editingContact.feedbackSummary}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      feedbackSummary: e.target.value,
                    })
                  }
                  className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="edit-willing"
                    checked={editingContact.willingToPay}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        willingToPay: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-zinc-700 cursor-pointer accent-blue-600"
                  />
                  <label htmlFor="edit-willing" className="font-semibold text-zinc-300 cursor-pointer">
                    مستعد للدفع شهرياً؟
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    السعر المتوقع شهرياً ({currency})
                  </label>
                  <input
                    type="number"
                    value={editingContact.expectedPriceMonthly}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        expectedPriceMonthly: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#101118] border border-white/[0.08] rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl cursor-pointer shadow-sm transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
