import React, { useState } from 'react';
import type { DeveloperWorkspaceData } from '../types';
import { buildStandaloneHtmlFile } from '../utils/standaloneHtmlBuilder';

interface StandaloneHtmlModalProps {
  isOpen: boolean;
  data: DeveloperWorkspaceData;
  onClose: () => void;
  onImportData: (newData: DeveloperWorkspaceData) => void;
  onResetSeedData: () => void;
}

export const StandaloneHtmlModal: React.FC<StandaloneHtmlModalProps> = ({
  isOpen,
  data,
  onClose,
  onImportData,
  onResetSeedData,
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const standaloneHtml = buildStandaloneHtmlFile(data);

  const handleDownloadHtml = () => {
    const blob = new Blob([standaloneHtml], {
      type: 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'developer-workspace.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = () => {
    navigator.clipboard?.writeText(standaloneHtml).catch(() => {});
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'developer-workspace-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || ''));
        if (parsed && Array.isArray(parsed.ideas) && Array.isArray(parsed.contacts)) {
          onImportData(parsed);
          setImportError('');
          onClose();
        } else {
          setImportError('ملف JSON غير مطابق لهيكلة بيانات مرصد المبرمج.');
        }
      } catch {
        setImportError('تعذّر قراءة ملف JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="standalone-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2
              id="standalone-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              تحميل ملف HTML المستقل (يعمل فوراً بدون استضافة أو إنترنت)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              صُمم هذا الملف خصيصاً لطلبك: ملف <code className="font-mono">.html</code> واحد يحتوي على كامل النظام وبياناتك الحالية، تفتحه بضغطة زر من سطح المكتب بسرعة فائقة دون الحاجة لأي سيرفر أو استضافة.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-md cursor-pointer whitespace-nowrap shrink-0"
          >
            إغلاق النافذة
          </button>
        </div>

        {/* Primary Action: Download Single HTML File */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="text-sm font-bold text-slate-900">
            1. الملف المستقل الكامل (Single-File HTML)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            يشمل هذا الملف جميع أفكارك ({data.ideas.length} أفكار)، وسجل تواصل المستخدمين ({data.contacts.length} أشخاص مع أرقامهم وحسابات X وتيك توك)، ومشاريع العملاء ({data.clientProjects.length})، ومنصاتك الخاصة ({data.platforms.length}) مدمجة داخل الملف نفسه مع حفظ محلي تلقائي.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              تنزيل ملف developer-workspace.html الآن
            </button>
            <button
              type="button"
              onClick={handleCopyHtml}
              className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {copiedHtml
                ? 'تم نسخ كود HTML بالكامل بنجاح'
                : 'نسخ كود HTML الكامل للحافظة'}
            </button>
          </div>
        </div>

        {/* Preview of generated HTML code */}
        <div className="space-y-1.5">
          <label
            htmlFor="standalone-code-preview"
            className="block text-xs font-semibold text-slate-700"
          >
            معاينة كود ملف الـ HTML المستقل الجاهز للحفظ:
          </label>
          <textarea
            id="standalone-code-preview"
            readOnly
            dir="ltr"
            rows={5}
            value={standaloneHtml}
            className="code-preview w-full p-3 text-xs bg-slate-900 text-slate-100 rounded-lg border border-slate-700"
          />
        </div>

        {/* Secondary Action: JSON Backup / Restore */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              تصدير نسخة احتياطية (JSON)
            </button>
            <label className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
              استيراد نسخة (JSON)
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              onResetSeedData();
              onClose();
            }}
            className="text-xs font-medium text-slate-500 hover:text-red-600 cursor-pointer"
          >
            استعادة البيانات النموذجية الافتراضية
          </button>
        </div>

        {importError && (
          <div className="text-xs text-red-600 font-medium">{importError}</div>
        )}
      </div>
    </div>
  );
};
