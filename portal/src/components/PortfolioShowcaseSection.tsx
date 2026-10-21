import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Globe,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Layers,
  Star,
  Eye,
  UploadCloud,
  Image as ImageIcon,
  Images,
  Tag,
  Loader2,
  X,
  MoveRight,
  MoveLeft,
  Sparkles,
} from 'lucide-react';

export interface PortfolioCategory {
  id: string;
  label: string;
  defaultBadge: string;
}

export interface PortfolioProjectItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  techStack: string[];
  demoUrl: string;
  imageUrl?: string;
  images?: string[];
  badge: string;
  showOnHome: boolean;
  order: number;
}

export const DEFAULT_PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  { id: 'clients', label: 'مشاريع عملاء', defaultBadge: 'مشروع عميل معتمد' },
  { id: 'websites', label: 'مواقع إلكترونية', defaultBadge: 'موقع معتمد' },
  { id: 'apps', label: 'تطبيقات', defaultBadge: 'تطبيق تكاملي' },
  { id: 'platforms', label: 'منصات', defaultBadge: 'منصة حية 🚀' },
];

export const DEFAULT_PORTFOLIO_PROJECTS: PortfolioProjectItem[] = [
  {
    id: 'proj-sijilli',
    title: 'منصة سجلي للخدمات الإلكترونية',
    category: 'platforms',
    categoryLabel: 'منصات',
    badge: 'مشروع مميز',
    description:
      'منصة متكاملة لتقديم وتسهيل الخدمات الإلكترونية (مثل الضمان المطور)، مزودة بلوحة تحكم إدارية شاملة لإدارة الطلبات، تخصيص الأسعار، ومتابعة حالة العملاء بشكل فوري.',
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
    demoUrl: 'https://www.sajalni.app',
    imageUrl: 'assets/projects/sijilli/main.png',
    images: [
      'assets/projects/sijilli/main.png',
      'assets/projects/sijilli/screenshot-01.png',
      'assets/projects/sijilli/screenshot-02.png',
      'assets/projects/sijilli/screenshot-03.png',
      'assets/projects/sijilli/screenshot-04.png',
      'assets/projects/sijilli/screenshot-05.png',
    ],
    showOnHome: true,
    order: 1,
  },
];

export const PortfolioShowcaseSection: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioProjectItem[]>(DEFAULT_PORTFOLIO_PROJECTS);
  const [categories, setCategories] = useState<PortfolioCategory[]>(DEFAULT_PORTFOLIO_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Category Management Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatBadge, setNewCatBadge] = useState('');

  // Form modal state (for Add / Edit Project)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('clients');
  const [formDesc, setFormDesc] = useState('');
  const [formTechInput, setFormTechInput] = useState('React, TypeScript, Tailwind CSS');
  const [formDemoUrl, setFormDemoUrl] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formBadge, setFormBadge] = useState('مشروع عميل معتمد');
  const [formShowOnHome, setFormShowOnHome] = useState(true);
  const [formOrder, setFormOrder] = useState<number>(1);

  // Multi-image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Helper to read and upload image file
  const uploadImageFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject(new Error('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP, SVG)'));
      }

      if (file.size > 25 * 1024 * 1024) {
        return reject(new Error('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 25 ميجابايت'));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('فشلت قراءة ملف الصورة'));
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const res = await fetch('/api/upload-project-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              dataUrl,
            }),
          });
          const json = await res.json();
          if (json.ok && json.relativeUrl) {
            resolve(json.relativeUrl);
          } else {
            resolve(dataUrl);
          }
        } catch {
          // If offline / endpoint unavailable, store dataUrl directly
          resolve(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload multiple files
  const handleMultipleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsUploadingImage(true);
    setUploadProgressText(`جاري رفع ${fileArray.length} صور...`);

    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < fileArray.length; i++) {
        setUploadProgressText(`جاري رفع الصورة (${i + 1} من ${fileArray.length})...`);
        const url = await uploadImageFile(fileArray[i]);
        uploadedUrls.push(url);
      }
      setFormImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء رفع بعض الصور');
    } finally {
      setIsUploadingImage(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleMultipleFiles(e.target.files);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleMultipleFiles(e.dataTransfer.files);
    }
  };

  // Set an image as primary cover (moves to index 0)
  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    setFormImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  // Remove an image from formImages
  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add manual URL to formImages
  const handleAddManualUrl = () => {
    const trimmed = manualUrlInput.trim();
    if (!trimmed) return;
    setFormImages((prev) => [...prev, trimmed]);
    setManualUrlInput('');
  };

  // 1. Load initial projects and categories
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // 1.1 Load Categories
      let loadedCats: PortfolioCategory[] | null = null;
      try {
        const catRes = await fetch('/categories.json');
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData) && catData.length > 0) {
            loadedCats = catData;
            setCategories(catData);
          }
        }
      } catch {
        // Fallback to Firestore / default
      }

      if (!loadedCats) {
        try {
          const snapCat = await getDoc(doc(db, 'portfolio_public', 'categories'));
          if (snapCat.exists() && Array.isArray(snapCat.data().items)) {
            setCategories(snapCat.data().items);
          }
        } catch {
          // Use default
        }
      }

      // 1.2 Load Projects
      let loadedProjects: PortfolioProjectItem[] | null = null;
      try {
        const snap = await getDoc(doc(db, 'portfolio_public', 'showcase'));
        if (snap.exists() && Array.isArray(snap.data().items) && snap.data().items.length > 0) {
          loadedProjects = snap.data().items;
          setProjects(snap.data().items);
          setIsLoading(false);
          return;
        }
      } catch {
        // Fall back to local
      }

      try {
        const res = await fetch('/projects.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProjects(data);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fall back to default
      }

      setProjects(DEFAULT_PORTFOLIO_PROJECTS);
      setIsLoading(false);
    }

    loadData();
  }, []);

  // Helper to find category info
  const getCategoryInfo = (catId: string) => {
    return (
      categories.find((c) => c.id === catId) || {
        id: catId,
        label: catId,
        defaultBadge: 'مشروع معتمد',
      }
    );
  };

  // Add Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newCatLabel.trim();
    if (!label) return;

    let id = newCatId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!id) {
      id = `cat-${Date.now().toString(36)}`;
    }

    if (categories.some((c) => c.id === id)) {
      alert('يوجد تصنيف آخر يحمل نفس المعرف (ID)، يرجى اختيار معرف مختلف.');
      return;
    }

    const badge = newCatBadge.trim() || `${label} معتمد`;
    const newCategory: PortfolioCategory = { id, label, defaultBadge: badge };
    const updated = [...categories, newCategory];
    setCategories(updated);

    // Reset inputs
    setNewCatLabel('');
    setNewCatId('');
    setNewCatBadge('');
  };

  // Delete Category Handler
  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      alert('لا يمكن حذف هذا التصنيف؛ يجب أن يتوفر تصنيف واحد على الأقل.');
      return;
    }

    const countUsing = projects.filter((p) => p.category === catId).length;
    let confirmMsg = 'هل أنت متأكد من حذف هذا التصنيف؟';
    if (countUsing > 0) {
      confirmMsg = `تنبيه: يوجد ${countUsing} مشاريع مرتبطة بهذا التصنيف! عند حذفه سيتم نقل تلك المشاريع تلقائياً لأول تصنيف متاح. هل ترغب في المتابعة؟`;
    }

    if (!window.confirm(confirmMsg)) return;

    const remaining = categories.filter((c) => c.id !== catId);
    const fallbackCategory = remaining[0];

    // Reassign affected projects
    if (countUsing > 0) {
      setProjects((prev) =>
        prev.map((p) =>
          p.category === catId
            ? {
                ...p,
                category: fallbackCategory.id,
                categoryLabel: fallbackCategory.label,
              }
            : p
        )
      );
    }

    setCategories(remaining);

    // If currently selected category in form is deleted, fallback
    if (formCategory === catId) {
      setFormCategory(fallbackCategory.id);
      setFormBadge(fallbackCategory.defaultBadge);
    }
  };

  // Open modal for new project
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    const firstCat = categories[0] || { id: 'clients', label: 'مشاريع عملاء', defaultBadge: 'مشروع عميل معتمد' };
    setFormCategory(firstCat.id);
    setFormDesc('');
    setFormTechInput('React, TypeScript, Tailwind CSS');
    setFormDemoUrl('');
    setFormImages([]);
    setManualUrlInput('');
    setFormBadge(firstCat.defaultBadge);
    setFormShowOnHome(projects.filter((p) => p.showOnHome).length < 4);
    setFormOrder(projects.length + 1);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (item: PortfolioProjectItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormDesc(item.description);
    setFormTechInput(item.techStack.join(', '));
    setFormDemoUrl(item.demoUrl);

    // Resolve images array
    const imgs = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.imageUrl ? [item.imageUrl] : []);
    setFormImages(imgs);
    setManualUrlInput('');

    setFormBadge(item.badge);
    setFormShowOnHome(item.showOnHome);
    setFormOrder(item.order);
    setIsModalOpen(true);
  };

  // Save Add/Edit Project
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const catInfo = getCategoryInfo(formCategory);

    const parsedTech = formTechInput
      .split(/[،,]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const primaryImage = formImages[0] || '';

    if (editingId) {
      // Edit existing
      setProjects((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formTitle.trim(),
                category: formCategory,
                categoryLabel: catInfo.label,
                description: formDesc.trim(),
                techStack: parsedTech.length > 0 ? parsedTech : ['Full-Stack'],
                demoUrl: formDemoUrl.trim(),
                imageUrl: primaryImage,
                images: formImages,
                badge: formBadge.trim() || catInfo.defaultBadge,
                showOnHome: formShowOnHome,
                order: Number(formOrder) || item.order,
              }
            : item
        )
      );
    } else {
      // Create new
      const newItem: PortfolioProjectItem = {
        id: `p-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        categoryLabel: catInfo.label,
        description: formDesc.trim(),
        techStack: parsedTech.length > 0 ? parsedTech : ['Full-Stack'],
        demoUrl: formDemoUrl.trim(),
        imageUrl: primaryImage,
        images: formImages,
        badge: formBadge.trim() || catInfo.defaultBadge,
        showOnHome: formShowOnHome,
        order: Number(formOrder) || projects.length + 1,
      };
      setProjects((prev) => [...prev, newItem]);
    }

    setIsModalOpen(false);
  };

  // Delete project
  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع من البورتفوليو؟')) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Reorder
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const copy = [...projects];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Update order numbers immutably
    const updated = copy.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setProjects(updated);
  };

  // Save to Firebase and local projects.json + categories.json
  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    // Sort by order before syncing
    const sorted = [...projects].sort((a, b) => a.order - b.order);

    try {
      // 1. Save to Cloud Firestore
      await setDoc(doc(db, 'portfolio_public', 'showcase'), {
        items: sorted,
        categories: categories,
        totalCount: sorted.length,
        lastSyncedAt: new Date().toISOString(),
        author: 'Anas Developer',
      });

      // Save categories separately as well
      await setDoc(doc(db, 'portfolio_public', 'categories'), {
        items: categories,
        totalCount: categories.length,
        lastSyncedAt: new Date().toISOString(),
      });

      // 2. Attempt local filesystem sync in dev mode only
      let localSaved = false;
      if (import.meta.env.DEV) {
        try {
          const resProj = await fetch('/api/save-portfolio-json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sorted, null, 2),
          });
          const resCats = await fetch('/api/save-portfolio-categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categories, null, 2),
          });
          localSaved = resProj.ok && resCats.ok;
        } catch {
          localSaved = false;
        }
      }

      setSyncStatus({
        ok: true,
        msg: localSaved
          ? `تم حفظ وتحديث ${sorted.length} مشروعاً و ${categories.length} تصنيفات سحابياً ومحلياً بنجاح! 🚀`
          : `تم نشر وتحديث ${sorted.length} مشروعاً و ${categories.length} تصنيفات سحابياً بنجاح! 🚀`,
      });
    } catch (err: any) {
      console.warn('Sync error:', err);
      // Still attempt local save if cloud failed
      try {
        const resProjLocal = await fetch('/api/save-portfolio-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sorted, null, 2),
        });
        const resCatsLocal = await fetch('/api/save-portfolio-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categories, null, 2),
        });
        if (resProjLocal.ok && resCatsLocal.ok) {
          setSyncStatus({
            ok: true,
            msg: `تم حفظ البيانات محلياً بنجاح (${sorted.length} مشاريع، ${categories.length} تصنيفات). لم تكتمل المزامنة السحابية: ${err.message}`,
          });
        } else {
          setSyncStatus({
            ok: false,
            msg: `فشلت المزامنة السحابية والمحلية: ${err.message}`,
          });
        }
      } catch (localErr: any) {
        setSyncStatus({
          ok: false,
          msg: 'حدث خطأ أثناء المزامنة: ' + (localErr?.message || err.message),
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const homeCount = projects.filter((p) => p.showOnHome).length;

  return (
    <div className="space-y-8 font-sans" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-[#171821] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              إدارة معرض أعمال البورتفوليو والتصنيفات
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              تحكم كامل في مشاريعك وتصنيفاتك: أضف تصنيفات جديدة أو احذفها، وارفع صور متعددة لكل مشروع لتظهر كسلايدر تفاعلي، وحدد المشاريع التي تتصدر الواجهة الرئيسية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Manage Categories Button */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 py-2.5 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>إدارة التصنيفات ({categories.length})</span>
            </button>

            {/* Add Project Button */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة مشروع جديد</span>
            </button>

            {/* Save & Sync Button */}
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'جاري الحفظ...' : 'حفظ وتحديث البورتفوليو 🚀'}</span>
            </button>
          </div>
        </div>

        {/* Sync notification */}
        {syncStatus && (
          <div
            className={`mt-6 p-4 rounded-xl border text-xs flex items-center gap-3 ${
              syncStatus.ok
                ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
                : 'bg-red-950/40 border-red-900/60 text-red-300'
            }`}
          >
            {syncStatus.ok ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span className="font-medium">{syncStatus.msg}</span>
          </div>
        )}
      </div>

      {/* Categories Bar Preview */}
      <div className="bg-[#171821] border border-white/[0.08] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 ml-2">
            <Tag className="w-3.5 h-3.5 text-zinc-500" />
            التصنيفات المتاحة:
          </span>
          {categories.map((c) => {
            const count = projects.filter((p) => p.category === c.id).length;
            return (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium"
              >
                <span>{c.label}</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded-md">
                  {count}
                </span>
              </span>
            );
          })}
        </div>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition flex items-center gap-1"
        >
          <span>تعديل وإضافة التصنيفات</span>
          <MoveRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Projects List Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-white">قائمة مشاريع البورتفوليو</h3>
          <span className="text-xs font-mono text-zinc-400">
            ({projects.length} مشروعاً · {homeCount} في الواجهة الرئيسية)
          </span>
        </div>
      </div>

      {/* Projects Grid / Table */}
      <div className="space-y-3">
        {projects
          .sort((a, b) => a.order - b.order)
          .map((item, index) => {
            const imagesList = Array.isArray(item.images) && item.images.length > 0
              ? item.images
              : (item.imageUrl ? [item.imageUrl] : []);
            const primaryThumb = imagesList[0] || item.imageUrl || '';

            return (
              <div
                key={item.id}
                className="bg-[#171821] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side: Project Info */}
                <div className="flex items-start gap-3.5">
                  {primaryThumb ? (
                    <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 mt-0.5 relative group">
                      <img
                        src={
                          primaryThumb.startsWith('http') || primaryThumb.startsWith('data:')
                            ? primaryThumb
                            : `/${primaryThumb}`
                        }
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = primaryThumb;
                        }}
                      />
                      <span className="absolute bottom-0 right-0 px-1 py-0.5 bg-black/80 text-[9px] font-mono text-zinc-300 rounded-tl">
                        #{index + 1}
                      </span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-400 shrink-0 mt-0.5">
                      #{index + 1}
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-medium">
                        {item.categoryLabel || item.category}
                      </span>
                      {imagesList.length > 1 ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/60 text-[11px] text-purple-300 font-medium flex items-center gap-1">
                          <Images className="w-3 h-3 text-purple-400" />
                          <span>{imagesList.length} صور (سلايدر)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-zinc-400" />
                          <span>صورة واحدة</span>
                        </span>
                      )}
                      {item.showOnHome ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/60 text-[11px] text-blue-300 font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 text-blue-400 fill-current" />
                          <span>في الواجهة الرئيسية (الـ 4 الأوائل)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-[11px] text-zinc-400 font-medium">
                          في صفحة "عرض الكل"
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 max-w-2xl line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {item.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-400 font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                      {item.demoUrl && (
                        <a
                          href={item.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 mr-2"
                        >
                          <span>معاينة الرابط</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Action Controls */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {/* Move Up / Down */}
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="تقديم الترتيب"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === projects.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="تأخير الترتيب"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white cursor-pointer"
                    title="تعديل المشروع والصور"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 hover:border-red-900 text-xs text-zinc-400 hover:text-red-300 cursor-pointer"
                    title="حذف المشروع"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#171821] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">إدارة تصنيفات البورتفوليو</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              تتحكم هذه التصنيفات في أزرار الفلترة العلوية في صفحة البورتفوليو. أضف أي تصنيف جديد تحتاجه (مثل: متاجر إلكترونية، أنظمة ذكاء اصطناعي، لوحات تحكم) أو احذف التصنيفات غير المرغوبة.
            </p>

            {/* Existing Categories List */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">التصنيفات الحالية:</label>
              <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-xl bg-zinc-950/60 overflow-hidden">
                {categories.map((cat) => {
                  const usageCount = projects.filter((p) => p.category === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{cat.label}</span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                            {cat.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                          <span>البادج: {cat.defaultBadge}</span>
                          <span>•</span>
                          <span>{usageCount} مشاريع مرتبطة</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={categories.length <= 1}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-900 text-zinc-400 hover:text-rose-300 disabled:opacity-30 cursor-pointer transition"
                        title="حذف هذا التصنيف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <span className="block text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                إضافة تصنيف جديد
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    اسم التصنيف (Label)
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatLabel}
                    onChange={(e) => {
                      setNewCatLabel(e.target.value);
                      if (!newCatId) {
                        setNewCatId(
                          e.target.value
                            .trim()
                            .toLowerCase()
                            .replace(/[^a-z0-9_-]/g, '-')
                        );
                      }
                    }}
                    placeholder="مثال: لوحات تحكم"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    معرف التصنيف (ID بالإنجليزية)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    placeholder="مثال: dashboards"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  البادج التلقائي للمشاريع المندرجة تحته
                </label>
                <input
                  type="text"
                  value={newCatBadge}
                  onChange={(e) => setNewCatBadge(e.target.value)}
                  placeholder="مثال: لوحة تحكم ذكية ✨"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة التصنيف الآن</span>
              </button>
            </form>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
              <span className="text-[11px] text-zinc-400">
                تذكر الضغط على "حفظ وتحديث البورتفوليو" لاعتماد التغييرات في الموقع.
              </span>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-1.5 bg-white text-zinc-950 rounded-lg font-bold text-xs cursor-pointer hover:bg-zinc-200 transition"
              >
                تم الإغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#171821] border border-white/[0.1] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'تعديل مشروع في البورتفوليو' : 'إضافة مشروع جديد للبورتفوليو'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5">
                  اسم المشروع
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: منصة سجلي للخدمات الإلكترونية"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-zinc-300">التصنيف</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer underline underline-offset-2"
                    >
                      + إدارة التصنيفات
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const catId = e.target.value;
                      setFormCategory(catId);
                      const info = getCategoryInfo(catId);
                      setFormBadge(info.defaultBadge);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-zinc-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1.5">
                    الشعار أو البادج (Badge)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="مثال: مشروع مميز"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5">
                  الوصف التسويقي (يظهر في بطاقة البورتفوليو)
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="اشرح فكرة المشروع والقيمة المضافة التي يقدمها للعميل..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5">
                  التقنيات المستخدمة (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={formTechInput}
                  onChange={(e) => setFormTechInput(e.target.value)}
                  placeholder="Next.js, React, TypeScript, Tailwind CSS, Supabase"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5">
                  رابط المعاينة الحية (Live Demo URL)
                </label>
                <input
                  type="url"
                  dir="ltr"
                  value={formDemoUrl}
                  onChange={(e) => setFormDemoUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              {/* Multi-Image Upload Section */}
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Images className="w-4 h-4 text-emerald-400" />
                    <label className="font-semibold text-zinc-200 text-xs">
                      صور المشروع (معرض صور / سلايدر تفاعلي)
                    </label>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      ({formImages.length} صور)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 transition underline underline-offset-2"
                  >
                    {showManualUrl ? 'إخفاء الرابط اليدوي' : 'إضافة رابط خارجي يدوياً'}
                  </button>
                </div>

                {/* Dropzone & Multi-file picker button */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-950/25'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60'
                  }`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center justify-center py-2 text-zinc-400 gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-300">
                        {uploadProgressText || 'جاري قراءة ورفع الصور...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                        <UploadCloud className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="font-semibold text-xs text-white">
                        اضغط لتحديد عدة صور معاً من جهازك، أو اسحب الصور هنا دفعة واحدة
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        يدعم رفع عدة صور (PNG, JPG, WebP) - الأولى ستكون الغلاف والبقية سلايدر
                      </span>
                    </div>
                  )}
                </div>

                {/* Hidden File Input supporting multiple files */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Manual URL input */}
                {showManualUrl && (
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2">
                    <label className="block text-[11px] text-zinc-400">
                      إدخال مسار أو رابط صورة خارجي:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        dir="ltr"
                        value={manualUrlInput}
                        onChange={(e) => setManualUrlInput(e.target.value)}
                        placeholder="assets/projects/... أو https://..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualUrl}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer transition shrink-0"
                      >
                        + إضافة للصور
                      </button>
                    </div>
                  </div>
                )}

                {/* Uploaded Images Gallery Grid */}
                {formImages.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>
                        معاينة الصور ({formImages.length}) · الصورة الموسومة بـ (الغلاف) تظهر أولاً
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormImages([])}
                        className="text-rose-400 hover:text-rose-300 transition"
                      >
                        حذف كافة الصور
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {formImages.map((img, idx) => {
                        const isCover = idx === 0;
                        return (
                          <div
                            key={idx}
                            className={`group relative rounded-xl overflow-hidden border bg-zinc-900 transition-all ${
                              isCover
                                ? 'border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                : 'border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            {/* Image preview */}
                            <div className="h-24 w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                              <img
                                src={
                                  img.startsWith('http') || img.startsWith('data:')
                                    ? img
                                    : `/${img}`
                                }
                                alt={`صورة ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = img;
                                }}
                              />
                            </div>

                            {/* Cover Badge */}
                            {isCover && (
                              <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-bold flex items-center gap-1 shadow-md">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>الغلاف الرئيسي</span>
                              </div>
                            )}

                            {/* Controls Overlay */}
                            <div className="p-1.5 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center justify-between gap-1">
                              {!isCover ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetAsCover(idx)}
                                  className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer font-medium"
                                  title="تعيين هذه الصورة كغلاف رئيسي"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>تعيين كغلاف</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-zinc-400 font-mono">#1 (رئيسية)</span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer transition rounded"
                                title="إزالة هذه الصورة"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Show on Homepage Toggle */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">
                    عرض في الواجهة الرئيسية (ضمن الـ 4 مشاريع الأولى)
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    إذا أوقفته سيظهر المشروع عند نقر الزائر على زر "عرض كافة المشاريع والمنصات"
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formShowOnHome}
                  onChange={(e) => setFormShowOnHome(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl cursor-pointer shadow-sm transition-all"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة المشروع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
