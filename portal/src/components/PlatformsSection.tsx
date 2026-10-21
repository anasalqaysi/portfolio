import React, { useState } from 'react';
import type {
  PersonalPlatform,
  PlatformStatus,
  PlatformTask,
} from '../types';

interface PlatformsSectionProps {
  platforms: PersonalPlatform[];
  currency: string;
  onAddPlatform: (platform: PersonalPlatform) => void;
  onUpdatePlatform: (platform: PersonalPlatform) => void;
  onDeletePlatform: (platformId: string) => void;
}

const PLATFORM_STATUS_LABELS: Record<PlatformStatus, string> = {
  development: 'قيد التطوير الداخلي',
  beta: 'نسخة تجريبية (Beta)',
  live: 'يعمل ومُطلق للعموم (Live)',
  maintenance: 'وضع الصيانة',
};

export const PlatformsSection: React.FC<PlatformsSectionProps> = ({
  platforms,
  currency,
  onAddPlatform,
  onUpdatePlatform,
  onDeletePlatform,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [domain, setDomain] = useState('');
  const [hostingProvider, setHostingProvider] = useState('Vercel + Supabase');
  const [monthlyServerCost, setMonthlyServerCost] = useState<number>(95);
  const [annualDomainCost, setAnnualDomainCost] = useState<number>(120);
  const [domainExpiryDate, setDomainExpiryDate] = useState('2027-06-01');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  const [techStackInput, setTechStackInput] = useState('Next.js, TypeScript, PostgreSQL');

  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  const handleCreatePlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newPl: PersonalPlatform = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim() || 'منصة رقمية خاصة',
      domain: domain.trim() || 'my-saas.dev',
      status: 'live',
      techStack: techStackInput
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean),
      repoUrl: '',
      hostingProvider: hostingProvider.trim(),
      databaseProvider: 'PostgreSQL',
      monthlyServerCost: Number(monthlyServerCost) || 0,
      annualDomainCost: Number(annualDomainCost) || 0,
      domainExpiryDate,
      activeUsersCount: Number(activeUsersCount) || 0,
      monthlyRevenue: Number(monthlyRevenue) || 0,
      backlogTasks: [],
    };
    onAddPlatform(newPl);
    setName('');
    setTagline('');
    setDomain('');
    setShowAddForm(false);
  };

  const handleToggleTask = (platform: PersonalPlatform, taskId: string) => {
    onUpdatePlatform({
      ...platform,
      backlogTasks: platform.backlogTasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      ),
    });
  };

  const handleAddTask = (platform: PersonalPlatform) => {
    const title = (newTaskInputs[platform.id] || '').trim();
    if (!title) return;
    const newTask: PlatformTask = {
      id: `bt-${Date.now()}`,
      title,
      category: 'feature',
      priority: 'high',
      done: false,
    };
    onUpdatePlatform({
      ...platform,
      backlogTasks: [...platform.backlogTasks, newTask],
    });
    setNewTaskInputs((prev) => ({ ...prev, [platform.id]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            المنصات والمنتجات التي تبنيها (Personal SaaS & Platforms)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            متابعة الدومينات وتواريخ تجديدها، تكاليف السيرفرات وقواعد البيانات، عدد المشتركين، ومهام التطوير القادمة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {showAddForm ? 'إغلاق النموذج' : '+ إضافة منصة أو منتج رقمي'}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleCreatePlatform}
          className="bg-white border border-slate-300 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            تسجيل منصة أو أداة جديدة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="pl-name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                اسم المنصة *
              </label>
              <input
                id="pl-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: رادار المتاجر"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="pl-domain"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                النطاق (Domain)
              </label>
              <input
                id="pl-domain"
                type="text"
                dir="ltr"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="storeradar.sa"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="pl-hosting"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                الاستضافة وقاعدة البيانات
              </label>
              <input
                id="pl-hosting"
                type="text"
                value={hostingProvider}
                onChange={(e) => setHostingProvider(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="pl-server-cost"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                تكلفة السيرفر الشهري ({currency})
              </label>
              <input
                id="pl-server-cost"
                type="number"
                value={monthlyServerCost}
                onChange={(e) =>
                  setMonthlyServerCost(Number(e.target.value) || 0)
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="pl-rev"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                الإيراد الشهري الحالي ({currency})
              </label>
              <input
                id="pl-rev"
                type="number"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="pl-users"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                عدد المستخدمين النشطين
              </label>
              <input
                id="pl-users"
                type="number"
                value={activeUsersCount}
                onChange={(e) =>
                  setActiveUsersCount(Number(e.target.value) || 0)
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
            >
              حفظ المنصة
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map((pl) => (
          <div
            key={pl.id}
            className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs text-slate-500">
                    <span>{PLATFORM_STATUS_LABELS[pl.status]}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      تجديد الدومين: {pl.domainExpiryDate}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {pl.name}{' '}
                    <code
                      className="text-xs font-mono text-blue-600 font-normal"
                      dir="ltr"
                    >
                      ({pl.domain})
                    </code>
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">{pl.tagline}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onDeletePlatform(pl.id)}
                  aria-label={`حذف المنصة ${pl.name}`}
                  className="text-xs text-red-600 hover:text-red-800 shrink-0 cursor-pointer"
                >
                  حذف
                </button>
              </div>

              {/* Tech Stack & Infra Info */}
              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <span className="font-semibold text-slate-800">
                    البنية التقنية:
                  </span>{' '}
                  {pl.techStack.join(' · ')}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">
                    الاستضافة:
                  </span>{' '}
                  {pl.hostingProvider} ·{' '}
                  <span className="font-semibold text-slate-800">
                    قاعدة البيانات:
                  </span>{' '}
                  {pl.databaseProvider}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs tabular-nums">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="text-slate-500">الإيراد الشهري</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">
                    {pl.monthlyRevenue.toLocaleString()} {currency}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="text-slate-500">تكلفة السيرفر/شهر</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {pl.monthlyServerCost.toLocaleString()} {currency}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="text-slate-500">المشتركون النشطون</div>
                  <div className="text-base font-bold text-blue-700 mt-0.5">
                    {pl.activeUsersCount}
                  </div>
                </div>
              </div>

              {/* Backlog Tasks */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-800">
                  خارطة الطريق والمهام التقنية القادمة (Backlog):
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {pl.backlogTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`task-${t.id}`}
                          checked={t.done}
                          onChange={() => handleToggleTask(pl, t.id)}
                          className="rounded border-slate-300"
                        />
                        <label
                          htmlFor={`task-${t.id}`}
                          className={`cursor-pointer ${
                            t.done
                              ? 'line-through text-slate-400'
                              : 'text-slate-800 font-medium'
                          }`}
                        >
                          {t.title}
                        </label>
                      </div>
                      <span className="text-slate-400 shrink-0">
                        {t.priority === 'high' ? 'أولوية عالية' : 'عادية'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    aria-label={`مهمة جديدة لمنصة ${pl.name}`}
                    placeholder="أضف ميزة أو إصلاح خطأ برمجي..."
                    value={newTaskInputs[pl.id] || ''}
                    onChange={(e) =>
                      setNewTaskInputs((prev) => ({
                        ...prev,
                        [pl.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTask(pl);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTask(pl)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md cursor-pointer"
                  >
                    + إضافة مهمة
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
