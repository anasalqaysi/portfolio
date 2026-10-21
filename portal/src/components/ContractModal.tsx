import React, { useState, useEffect } from 'react';
import type { ClientProject, ProjectContract, ProjectContractClause } from '../types';
import { BRAND } from '../constants/brand';
import {
  FileText,
  Printer,
  Edit3,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  X,
  Building2,
  Calendar,
  CreditCard,
  Award,
  Download,
  Scale,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

interface ContractModalProps {
  project: ClientProject;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveContract: (updatedContract: ProjectContract) => void;
  readOnly?: boolean;
}

export function getDefaultContract(project: ClientProject, currency: string): ProjectContract {
  const contractNumber = `CNT-${project.id.toUpperCase()}-${new Date().getFullYear()}`;
  const contractDate = project.startDate || new Date().toISOString().slice(0, 10);

  const milestonesDesc =
    project.milestones && project.milestones.length > 0
      ? project.milestones
          .map(
            (m, i) =>
              `الدفعة (${i + 1}): ${m.title} بمبلغ (${m.amount.toLocaleString()} ${currency})`
          )
          .join(' • ')
      : `دفعة أولى 50% عند التوقيع وبدء المشروع، ودفعة ثانية 50% عند تسليم واعتماد المخرجات النهائية.`;

  return {
    contractNumber,
    contractDate,
    firstPartyName: BRAND.name,
    firstPartyTitle: BRAND.title,
    firstPartyCert: `توثيق الأعمال: ${BRAND.sbcNumber} (المركز السعودي للأعمال)`,
    firstPartyPhone: BRAND.phone,
    firstPartyEmail: BRAND.email,

    secondPartyName: project.clientName || 'الطرف الثاني (العميل)',
    secondPartyOrgOrId: 'مؤسسة / فرد (سجل تجاري / هوية وطنية)',
    secondPartyPhone: project.clientPhone || '',
    secondPartyEmail: project.clientEmail || '',

    projectTitle: project.projectName || 'تطوير وبرمجة نظام رقمي',
    projectScope: `تصميم وتطوير وبرمجة ${
      project.projectType || 'النظام الرقمي'
    } وفق المعايير الهندسية والتقنية المعتمدة، بما يشمل هندسة الواجهات، وقواعد البيانات، ولوحة التحكم، وربط الخدمات البرمجية والـ APIs اللازمة للتسليم النهائي.`,
    totalAmount: project.totalBudget || 0,
    currency: currency || 'ر.س',
    paymentTerms: milestonesDesc,
    deliveryDuration: project.deadline
      ? `حتى موعد أقصاه ${project.deadline}`
      : 'حسب الجدول الزمني ومراحل التسليم المعتمدة',
    warrantyPeriod: '30 يوماً ضمان صيانة ودعم فني مجاني للأخطاء البرمجية بعد التسليم النهائي والإطلاق',

    clauses: [
      {
        id: 'c-1',
        title: 'البند الأول: موضوع العقد ونطاق الخدمات',
        content: `اتفق الطرفان على قيام الطرف الأول (المطور) بتنفيذ وبرمجة النظام الموضح أعلاه وفق المواصفات الفنية والمتطلبات المعتمدة بين الطرفين دون الإخلال بالمخرجات المتفق عليها.`,
      },
      {
        id: 'c-2',
        title: 'البند الثاني: الجدول الزمني ومراحل التسليم',
        content: `يلتزم الطرف الأول بتسليم مخرجات المشروع في الموعد المحدد، شريطة التزام الطرف الثاني بتقديم كافة المواد والمتطلبات والاعتمادات اللازمة في أوقاتها المحددة دون تأخير غير مبرر.`,
      },
      {
        id: 'c-3',
        title: 'البند الثالث: المقابل المالي وجدول الدفعات',
        content: `يلتزم الطرف الثاني بسداد القيمة المالية الإجمالية المتفق عليها وفق جدول الدفعات المحدد. وتعتبر كل مرحلة منتهية ومستحقة الدفع بعد مراجعتها واعتمادها، ولا يُلزم الطرف الأول ببدء المرحلة التالية إلا بعد سداد استحقاق المرحلة السابقة.`,
      },
      {
        id: 'c-4',
        title: 'البند الرابع: التعديلات وطلبات التغيير (Change Requests)',
        content: `يشمل هذا العقد فقط الميزات والوظائف المحددة في نطاق العمل. وأي متطلبات جديدة أو تعديلات جوهرية إضافية يطلبها الطرف الثاني لاحقاً تخضع لتقييم فني وزمني ومقابل مالي إضافي يتم الاتفاق عليه بملحق مستقل قبل البدء في تنفيذه.`,
      },
      {
        id: 'c-5',
        title: 'البند الخامس: الملكية الفكرية وحقوق الكود المصدري',
        content: `تؤول كامل حقوق الملكية الفكرية للنظام والشيفرة المصدرية (Source Code) والبيانات للطرف الثاني بشكل نهائي بمجرد سداد كامل المستحقات المالية المترتبة على هذا العقد.`,
      },
      {
        id: 'c-6',
        title: 'البند السادس: الضمان والدعم الفني',
        content: `يقدم الطرف الأول ضماناً ودعماً فنياً مجانياً لمدة 30 يوماً من تاريخ التسليم النهائي لمعالجة أي خلل أو خطأ برمجي (Bug) يظهر في نطاق العمل المتفق عليه دون أي تكلفة إضافية على العميل.`,
      },
      {
        id: 'c-7',
        title: 'البند السابع: السرية وحماية البيانات',
        content: `يتعهد الطرفان بالحفاظ على سرية المعلومات والبيانات التجارية والتقنية المتبادلة وعدم إفشائها لأي طرف ثالث طوال فترة سريان العقد وبعد انتهائه.`,
      },
      {
        id: 'c-8',
        title: 'البند الثامن: النظام الواجب التطبيق وحل النزاعات',
        content: `يخضع هذا العقد وتفسيره للأنظمة واللوائح المعمول بها في المملكة العربية السعودية، وأي نزاع ينشأ عنه يُحل ودياً بين الطرفين أو عبر الجهات القضائية المختصة بالمملكة.`,
      },
    ],
    specialTerms: '',
  };
}

export const ContractModal: React.FC<ContractModalProps> = ({
  project,
  currency,
  isOpen,
  onClose,
  onSaveContract,
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  // Internal state of contract
  const [contract, setContract] = useState<ProjectContract>(() => {
    return project.contract || getDefaultContract(project, currency);
  });

  const [savedNotice, setSavedNotice] = useState(false);

  // Sync if project contract changes externally
  useEffect(() => {
    if (project.contract) {
      setContract(project.contract);
    } else {
      setContract(getDefaultContract(project, currency));
    }
  }, [project, currency]);

  if (!isOpen) return null;

  // Prepare full printable HTML for iframe or standalone window
  const getCleanPrintHtml = (printableEl: HTMLElement) => {
    const fullLogoUrl = `${window.location.origin}${BRAND.logoUrl}`;
    const cloned = printableEl.cloneNode(true) as HTMLElement;

    // Fix logo paths to absolute URLs
    const imgs = cloned.querySelectorAll('img');
    imgs.forEach((img) => {
      if (img.getAttribute('src')?.includes('site-logo.svg')) {
        img.src = fullLogoUrl;
      }
    });

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('\n');

    const safeContractNumber = (contract.contractNumber || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${safeContractNumber} - عقد اتفاقية تقديم خدمات برمجية</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 12mm 14mm 12mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            background: #ffffff !important;
            color: #111827 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Tajawal', sans-serif !important;
            font-size: 13px !important;
            line-height: 1.65 !important;
            direction: rtl !important;
            overflow: visible !important;
            height: auto !important;
          }
          #printable-contract {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
            background: #ffffff !important;
          }
          .avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          table {
            border-collapse: collapse;
          }
        </style>
      </head>
      <body dir="rtl">
        <div style="width: 100%; max-width: 800px; margin: 0 auto; background: #fff;">
          ${cloned.outerHTML}
        </div>
      </body>
      </html>
    `;
  };

  // Bulletproof print using isolated iframe (never prints the background dashboard or scrollbars)
  const handlePrint = () => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
    }

    setTimeout(() => {
      const printElement = document.getElementById('printable-contract');
      if (!printElement) {
        window.print();
        return;
      }

      let printIframe = document.getElementById('contract-print-iframe') as HTMLIFrameElement;
      if (!printIframe) {
        printIframe = document.createElement('iframe');
        printIframe.id = 'contract-print-iframe';
        printIframe.style.position = 'fixed';
        printIframe.style.right = '0';
        printIframe.style.bottom = '0';
        printIframe.style.width = '0';
        printIframe.style.height = '0';
        printIframe.style.border = '0';
        printIframe.style.visibility = 'hidden';
        document.body.appendChild(printIframe);
      }

      const iframeDoc = printIframe.contentWindow?.document;
      if (!iframeDoc) {
        window.print();
        return;
      }

      const fullHtml = getCleanPrintHtml(printElement);
      iframeDoc.open();
      iframeDoc.write(fullHtml);
      iframeDoc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch {
          window.print();
        }
      }, 350);
    }, activeTab === 'preview' ? 10 : 200);
  };

  // Open standalone clean window for dedicated full page print / review
  const handleOpenPrintWindow = () => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
    }

    setTimeout(() => {
      const printElement = document.getElementById('printable-contract');
      if (!printElement) return;

      const newWindow = window.open('', '_blank');
      if (!newWindow) {
        handlePrint();
        return;
      }

      const fullHtml = getCleanPrintHtml(printElement);
      newWindow.document.write(fullHtml);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.focus();
        newWindow.print();
      }, 400);
    }, activeTab === 'preview' ? 10 : 200);
  };

  const handleResetToDefault = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط بنود العقد إلى النموذج الافتراضي؟ ستفقد التعديلات غير المحفوظة.')) {
      setContract(getDefaultContract(project, currency));
    }
  };

  const handleSave = () => {
    onSaveContract(contract);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Clause manipulation
  const handleAddClause = () => {
    const newClause: ProjectContractClause = {
      id: `c-${Date.now()}`,
      title: `البند ${contract.clauses.length + 1}: `,
      content: 'نص البند المتفق عليه بين الطرفين...',
    };
    setContract((prev) => ({
      ...prev,
      clauses: [...prev.clauses, newClause],
    }));
  };

  const handleUpdateClause = (id: string, field: 'title' | 'content', value: string) => {
    setContract((prev) => ({
      ...prev,
      clauses: prev.clauses.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const handleDeleteClause = (id: string) => {
    setContract((prev) => ({
      ...prev,
      clauses: prev.clauses.filter((c) => c.id !== id),
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      dir="rtl"
    >
      <div className="relative w-full max-w-5xl bg-[#14151e] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Modal Controls Header */}
        <div className="px-6 py-4 bg-[#1a1b26] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4 shrink-0 contract-modal-controls">
          <div className="flex items-center gap-3">
            <img
              src={BRAND.logoUrl}
              alt="Brand Logo"
              className="w-9 h-9 rounded-lg object-contain bg-zinc-900 border border-white/10 p-1"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  عقد واتفاقية تقديم خدمات برمجية
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {contract.contractNumber}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                مشروع: <strong className="text-zinc-200">{project.projectName}</strong> · العميل: {project.clientName}
              </p>
            </div>
          </div>

          {/* Action Tabs & Buttons */}
          <div className="flex items-center gap-2">
            {!readOnly && (
              <div className="flex items-center p-0.5 bg-zinc-900 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة رسمية (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'edit'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل بنود العقد ✏️</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition cursor-pointer shadow-sm"
              title="طباعة العقد أو تصديره وحفظه كملف PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>طباعة / حفظ كـ PDF 📄</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPrintWindow}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition cursor-pointer border border-white/10"
              title="فتح العقد في نافذة مستقلة للطباعة المباشرة"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>نافذة مستقلة</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Saved Toast Notice */}
        {savedNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-6 py-2 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم حفظ وتثبيت بيانات وبنود العقد بنجاح لهذا المشروع!</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400">SAVED</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0f1015]">
          {activeTab === 'edit' && !readOnly ? (
            /* =========================================================================
               TAB 1: EDIT CONTRACT FIELDS & CLAUSES
               ========================================================================= */
            <div className="space-y-6 max-w-4xl mx-auto text-zinc-200">
              <div className="p-4 rounded-xl bg-[#171821] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">تخصيص بنود وشروط العقد لهذا المشروع</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    جميع التعديلات هنا تُحفظ بشكل مستقل لمشروع ({project.projectName}) ويمكنك تغيير الأسعار، الدفعات، ونطاق العمل وأي بند قانوني.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 border border-white/10 rounded-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة ضبط للافتراضي</span>
                </button>
              </div>

              {/* General Metadata */}
              <div className="bg-[#171821] border border-white/[0.08] rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>معلومات العقد الأساسية</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">رقم مرجع العقد</label>
                    <input
                      type="text"
                      value={contract.contractNumber}
                      onChange={(e) => setContract({ ...contract, contractNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">تاريخ إبرام العقد</label>
                    <input
                      type="date"
                      value={contract.contractDate}
                      onChange={(e) => setContract({ ...contract, contractDate: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* First Party (Developer) */}
              <div className="bg-[#171821] border border-white/[0.08] rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span>بيانات الطرف الأول (المطور المنفذ)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">الاسم الكامل</label>
                    <input
                      type="text"
                      value={contract.firstPartyName}
                      onChange={(e) => setContract({ ...contract, firstPartyName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">المسمى المهني / الصفة</label>
                    <input
                      type="text"
                      value={contract.firstPartyTitle}
                      onChange={(e) => setContract({ ...contract, firstPartyTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">التوثيق التجاري أو المهني (اختياري)</label>
                    <input
                      type="text"
                      value={contract.firstPartyCert}
                      onChange={(e) => setContract({ ...contract, firstPartyCert: e.target.value })}
                      placeholder="مثال: توثيق الأعمال: 0000331044"
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">رقم الهاتف / الواتساب</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={contract.firstPartyPhone}
                      onChange={(e) => setContract({ ...contract, firstPartyPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Second Party (Client) */}
              <div className="bg-[#171821] border border-white/[0.08] rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>بيانات الطرف الثاني (العميل المستفيد)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">اسم العميل أو الجهة</label>
                    <input
                      type="text"
                      value={contract.secondPartyName}
                      onChange={(e) => setContract({ ...contract, secondPartyName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">السجل التجاري أو رقم الهوية</label>
                    <input
                      type="text"
                      value={contract.secondPartyOrgOrId}
                      onChange={(e) => setContract({ ...contract, secondPartyOrgOrId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">جوال العميل</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={contract.secondPartyPhone}
                      onChange={(e) => setContract({ ...contract, secondPartyPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">البريد الإلكتروني للعميل</label>
                    <input
                      type="email"
                      dir="ltr"
                      value={contract.secondPartyEmail}
                      onChange={(e) => setContract({ ...contract, secondPartyEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Scope & Financial Terms */}
              <div className="bg-[#171821] border border-white/[0.08] rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>نطاق العمل، الميزانية، والشروط المالية والزمنية</span>
                </h4>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">عنوان المشروع / النظام البرمجي</label>
                    <input
                      type="text"
                      value={contract.projectTitle}
                      onChange={(e) => setContract({ ...contract, projectTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">نطاق العمل ومواصفات المخرجات (Scope of Work)</label>
                    <textarea
                      rows={3}
                      value={contract.projectScope}
                      onChange={(e) => setContract({ ...contract, projectScope: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200 leading-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-medium">إجمالي المقابل المالي ({currency})</label>
                      <input
                        type="number"
                        value={contract.totalAmount}
                        onChange={(e) => setContract({ ...contract, totalAmount: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-medium">المدة الزمنية للتسليم</label>
                      <input
                        type="text"
                        value={contract.deliveryDuration}
                        onChange={(e) => setContract({ ...contract, deliveryDuration: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-medium">فترة الضمان والدعم الفني</label>
                      <input
                        type="text"
                        value={contract.warrantyPeriod}
                        onChange={(e) => setContract({ ...contract, warrantyPeriod: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">شروط وجدول الدفعات المالية (Payment Schedule)</label>
                    <textarea
                      rows={2}
                      value={contract.paymentTerms}
                      onChange={(e) => setContract({ ...contract, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1015] border border-white/10 rounded-lg text-zinc-200 leading-relaxed font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Legal Clauses */}
              <div className="bg-[#171821] border border-white/[0.08] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-400" />
                    <span>البنود والشروط القانونية ({contract.clauses.length} بند)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddClause}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بند جديد</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {contract.clauses.map((clause) => (
                    <div
                      key={clause.id}
                      className="p-3.5 rounded-lg bg-[#0f1015] border border-white/10 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={clause.title}
                          onChange={(e) => handleUpdateClause(clause.id, 'title', e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs font-bold bg-[#171821] border border-white/10 rounded text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteClause(clause.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded transition cursor-pointer"
                          title="حذف هذا البند"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={clause.content}
                        onChange={(e) => handleUpdateClause(clause.id, 'content', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#171821] border border-white/10 rounded text-zinc-300 leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions for Edit Tab */}
              <div className="flex items-center justify-end gap-3 pt-2 pb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  معاينة الشكل النهائي الرسمى
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-sm transition"
                >
                  حفظ العقد لهذا المشروع 💾
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               TAB 2: PRINTABLE OFFICIAL CONTRACT PREVIEW (Formal Prestigious A4 Format)
               ========================================================================= */
            <div
              id="printable-contract"
              className="bg-white text-zinc-900 p-8 sm:p-14 rounded-xl shadow-2xl space-y-7 text-sm leading-relaxed border border-zinc-300 select-text max-w-4xl mx-auto"
              dir="rtl"
            >
              {/* Official Header with Master Logo & Symmetrical Corporate Layout */}
              <div className="avoid-break flex items-center justify-between pb-6 border-b-2 border-zinc-900 gap-6">
                {/* Right: Master Brand Identity */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={BRAND.logoUrl}
                    alt="Logo"
                    className="w-14 h-14 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h2 className="text-base font-extrabold text-zinc-950 tracking-tight font-sans">
                      {BRAND.brandName}
                    </h2>
                    <p className="text-[11px] text-zinc-600 font-sans">
                      هندسة وتطوير الأنظمة البرمجية والحلول الرقمية
                    </p>
                    <span className="text-[11px] text-zinc-500 block font-medium" dir="ltr">
                      {BRAND.brandNameEn}
                    </span>
                  </div>
                </div>

                {/* Left: Formal Contract Metadata Box */}
                <div className="text-left text-xs space-y-1.5 shrink-0 border-r pr-5 border-zinc-200">
                  <div className="font-bold text-zinc-950">
                    رقم العقد: <span className="text-blue-900 font-semibold">{contract.contractNumber}</span>
                  </div>
                  <div className="text-zinc-600">
                    تاريخ التحرير: <span>{contract.contractDate}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    مكان الإبرام: <span className="text-zinc-800">المملكة العربية السعودية</span>
                  </div>
                </div>
              </div>

              {/* Title Banner */}
              <div className="avoid-break text-center py-2 border-b border-zinc-200">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                  عقد تقديم خدمات برمجية وتطوير أنظمة
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                  Software Development & System Services Agreement
                </p>
              </div>

              {/* Introduction & Parties */}
              <div className="avoid-break space-y-4">
                <p className="text-xs text-zinc-800 leading-relaxed text-justify">
                  بعون الله تعالى وتوفيقه، تم إبرام هذا العقد والاتفاق والتراضي في يوم{' '}
                  <strong className="text-zinc-950 font-mono">{contract.contractDate}</strong> بين كُلٍّ من:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Party (Developer) */}
                  <div className="p-4 rounded-lg border border-zinc-300 bg-zinc-50/70 space-y-2 text-xs">
                    <div className="font-bold text-zinc-950 text-sm border-b border-zinc-200 pb-1 flex items-center justify-between">
                      <span>الطرف الأول (المطور ومقدم الخدمات):</span>
                      <span className="text-[10px] font-mono text-zinc-500">FIRST PARTY</span>
                    </div>
                    <div>
                      <strong>الاسم:</strong> {contract.firstPartyName}
                    </div>
                    <div>
                      <strong>الصفة:</strong> {contract.firstPartyTitle}
                    </div>
                    {contract.firstPartyCert && (
                      <div className="text-[11px] text-zinc-700">
                        <strong>التوثيق التجاري:</strong> {contract.firstPartyCert}
                      </div>
                    )}
                    <div>
                      <strong>الهاتف الرسمي:</strong> <span dir="ltr" className="font-mono">{contract.firstPartyPhone}</span>
                    </div>
                    <div>
                      <strong>البريد الإلكتروني:</strong> <span className="font-mono">{contract.firstPartyEmail}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200">
                      ويُشار إليه في هذا العقد بـ <strong>(الطرف الأول)</strong> أو <strong>(المطور)</strong>.
                    </div>
                  </div>

                  {/* Second Party (Client) */}
                  <div className="p-4 rounded-lg border border-zinc-300 bg-zinc-50/70 space-y-2 text-xs">
                    <div className="font-bold text-zinc-950 text-sm border-b border-zinc-200 pb-1 flex items-center justify-between">
                      <span>الطرف الثاني (العميل المستفيد):</span>
                      <span className="text-[10px] font-mono text-zinc-500">SECOND PARTY</span>
                    </div>
                    <div>
                      <strong>الاسم / الجهة:</strong> {contract.secondPartyName}
                    </div>
                    <div>
                      <strong>السجل / الهوية:</strong> {contract.secondPartyOrgOrId}
                    </div>
                    <div>
                      <strong>الهاتف:</strong> <span dir="ltr" className="font-mono">{contract.secondPartyPhone || '—'}</span>
                    </div>
                    <div>
                      <strong>البريد الإلكتروني:</strong> <span className="font-mono">{contract.secondPartyEmail || '—'}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200">
                      ويُشار إليه في هذا العقد بـ <strong>(الطرف الثاني)</strong> أو <strong>(العميل)</strong>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Preamble */}
              <div className="avoid-break p-3.5 bg-zinc-50 rounded-lg border border-zinc-300 text-xs leading-relaxed text-zinc-800 text-justify">
                <strong>التمهيد القانوني:</strong> حيث أن الطرف الأول يمتلك الكفاءة الفنية والخبرة المتخصصة في هندسة وبرمجة الأنظمة وتطبيقات الويب، وحيث أبدى الطرف الثاني رغبته في إسناد مهمة تصميم وتطوير{' '}
                <strong className="text-zinc-950">({contract.projectTitle})</strong> إليه وفق المتطلبات المحددة، فقد تلاقت إرادة الطرفين بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد والالتزام ببنوده وأحكامه، ويُعتبر هذا التمهيد جزءاً لا يتجزأ من العقد ويُقرأ معه.
              </div>

              {/* Scope of Work */}
              <div className="avoid-break space-y-1.5 text-xs">
                <h3 className="font-bold text-zinc-950 text-sm">
                  ١. نطاق العمل والمخرجات المتفق عليها:
                </h3>
                <p className="text-zinc-800 leading-relaxed bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-300 text-justify">
                  {contract.projectScope}
                </p>
              </div>

              {/* Financial & Delivery Table */}
              <div className="avoid-break space-y-2 text-xs">
                <h3 className="font-bold text-zinc-950 text-sm">
                  ٢. المقابل المالي، مدة التنفيذ، والضمان:
                </h3>
                <div className="border border-zinc-300 rounded-lg overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-zinc-100 text-zinc-900 font-bold border-b border-zinc-300">
                      <tr>
                        <th className="py-2.5 px-3.5">إجمالي القيمة المالية</th>
                        <th className="py-2.5 px-3.5">الجدول الزمني للتسليم</th>
                        <th className="py-2.5 px-3.5">فترة الضمان والدعم الفني</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      <tr>
                        <td className="py-3 px-3.5 font-bold text-zinc-950 font-mono text-sm">
                          {contract.totalAmount.toLocaleString()} {contract.currency}
                        </td>
                        <td className="py-3 px-3.5 font-medium">{contract.deliveryDuration}</td>
                        <td className="py-3 px-3.5 text-zinc-800 font-medium">{contract.warrantyPeriod}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-lg text-xs">
                  <span className="font-bold text-zinc-950 block mb-1">جدول وآلية الدفعات المستحقة:</span>
                  <p className="text-zinc-700 leading-relaxed font-mono">{contract.paymentTerms}</p>
                </div>
              </div>

              {/* Contract Clauses */}
              <div className="space-y-3.5 text-xs">
                <h3 className="font-bold text-zinc-950 text-sm avoid-break">
                  ٣. الشروط والبنود العامة للاتفاقية:
                </h3>
                <div className="space-y-3">
                  {contract.clauses.map((clause, idx) => (
                    <div key={clause.id || idx} className="avoid-break space-y-1">
                      <div className="font-bold text-zinc-950">
                        {clause.title}
                      </div>
                      <p className="text-zinc-700 leading-relaxed text-justify pr-2 border-r-2 border-zinc-300">
                        {clause.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Dual Signature & Stamp Block */}
              <div className="avoid-break pt-8 border-t-2 border-zinc-800 space-y-4">
                <div className="text-xs font-bold text-zinc-900 text-center">
                  بناءً على ما تقدم، تم تحرير هذا العقد من نسختين أصليتين، بيد كل طرف نسخة للعمل بموجبها والالتزام بأحكامها.
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  {/* First Party Signature */}
                  <div className="signature-box p-4 border border-zinc-300 rounded-xl space-y-3 bg-zinc-50/50 relative">
                    <div className="font-bold text-zinc-950 text-xs border-b border-zinc-200 pb-1.5 flex items-center justify-between">
                      <span>توقيع واعتماد الطرف الأول (المطور):</span>
                      <span className="text-[10px] font-mono text-zinc-500">FIRST PARTY</span>
                    </div>
                    <div className="text-xs space-y-1 text-zinc-700">
                      <div>الاسم: <strong>{contract.firstPartyName}</strong></div>
                      <div>التوقيع: _______________________</div>
                      <div>التاريخ: {contract.contractDate}</div>
                    </div>
                    {/* Stamp Box */}
                    <div className="h-16 border border-dashed border-zinc-300 rounded flex items-center justify-center text-[10px] text-zinc-400 font-mono">
                      [ الختم الرسمي / Official Stamp ]
                    </div>
                  </div>

                  {/* Second Party Signature */}
                  <div className="signature-box p-4 border border-zinc-300 rounded-xl space-y-3 bg-zinc-50/50">
                    <div className="font-bold text-zinc-950 text-xs border-b border-zinc-200 pb-1.5 flex items-center justify-between">
                      <span>توقيع واعتماد الطرف الثاني (العميل):</span>
                      <span className="text-[10px] font-mono text-zinc-500">SECOND PARTY</span>
                    </div>
                    <div className="text-xs space-y-1 text-zinc-700">
                      <div>الاسم / المفوض: <strong>{contract.secondPartyName}</strong></div>
                      <div>التوقيع: _______________________</div>
                      <div>التاريخ: _____ / _____ / {new Date().getFullYear()} م</div>
                    </div>
                    {/* Stamp Box */}
                    <div className="h-16 border border-dashed border-zinc-300 rounded flex items-center justify-center text-[10px] text-zinc-400 font-mono">
                      [ ختم المنشأة / Client Stamp ]
                    </div>
                  </div>
                </div>
              </div>

              {/* Watermark / Legal Footer */}
              <div className="avoid-break pt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <div>{BRAND.brandName} · أنظمة وحلول رقمية</div>
                <div>مرجع العقد: {contract.contractNumber}</div>
                <div>صفحة رسمية معتمدة</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
