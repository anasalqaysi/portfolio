import React, { useState, useEffect, useRef } from 'react';
import type {
  DeveloperWorkspaceData,
  IdeaItem,
  OutreachContact,
  OutreachStage,
  ClientProject,
  PersonalPlatform,
} from './types';
import { INITIAL_WORKSPACE_DATA } from './data/seedData';
import {
  normalizeWorkspaceData,
  normalizePin,
  findProjectByPin,
  getStalePins,
} from './utils/workspaceLogic';
import { OverviewSection } from './components/OverviewSection';
import { IdeasLabSection } from './components/IdeasLabSection';
import { OutreachCrmSection } from './components/OutreachCrmSection';
import { ClientProjectsSection } from './components/ClientProjectsSection';
import { PlatformsSection } from './components/PlatformsSection';
import { PortfolioShowcaseSection } from './components/PortfolioShowcaseSection';
import { AuthView } from './components/AuthView';
import { ClientPortalView } from './components/ClientPortalView';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import {
  auth,
  db,
  ADMIN_EMAIL,
  isUserAdmin,
} from './firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import {
  LogOut,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Globe,
  Layers,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { BRAND } from './constants/brand';

const STORAGE_KEY = 'DEVELOPER_COMMAND_CENTER_STATE_V1';

type ActiveTab =
  | 'overview'
  | 'ideas'
  | 'contacts'
  | 'clients'
  | 'platforms'
  | 'portfolio';

export default function App() {
  const [data, setData] = useState<DeveloperWorkspaceData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return normalizeWorkspaceData(parsed);
        }
      }
    } catch {
      // Fallback
    }
    return normalizeWorkspaceData(INITIAL_WORKSPACE_DATA);
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [preselectedIdeaForContact, setPreselectedIdeaForContact] = useState<
    string | null
  >(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [clientLoggedInProject, setClientLoggedInProject] = useState<ClientProject | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const isRemoteLoadedRef = useRef(false);
  const syncedPinsRef = useRef<Set<string>>(new Set());

  // Helper: resolves a project by PIN either from local state or isolated cloud doc
  const resolveProjectByPin = async (rawPin: string): Promise<ClientProject | null> => {
    const clean = normalizePin(rawPin);
    if (!clean) return null;

    // 1. Check local state first
    const local = findProjectByPin(data.clientProjects, clean);
    if (local) return local;

    // 2. Query only the isolated client document
    try {
      const pinDocRef = doc(db, 'client_portal_access', clean);
      const pinSnap = await getDoc(pinDocRef);
      if (pinSnap.exists()) {
        const projectData = pinSnap.data() as ClientProject;
        if (projectData && projectData.projectName) {
          return projectData;
        }
      }
    } catch (err) {
      console.warn('Could not query client_portal_access for PIN:', err);
    }

    return null;
  };

  // 1. Check URL parameters for client link: ?pin=CL-XXXXXX
  useEffect(() => {
    let isMounted = true;
    const checkUrlPin = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const pin = params.get('pin') || params.get('code');
        if (!pin) return;

        const matched = await resolveProjectByPin(pin);
        if (matched && isMounted) {
          setClientLoggedInProject(matched);
        }
      } catch {
        // Ignore
      }
    };

    checkUrlPin();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Listen to Firebase Auth state
  useEffect(() => {
    // Failsafe timer: prevent any indefinite loading hang
    const failsafeTimer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 1200);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(failsafeTimer);
      setCurrentUser(user);
      setIsAuthLoading(false);

      if (user && isUserAdmin(user)) {
        // Reset guard before fetching remote data
        isRemoteLoadedRef.current = false;

        // Logged in as Admin (Anas)
        // Fetch latest synced data from Cloud Firestore
        try {
          const docRef = doc(db, 'developer_workspace', 'main');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const remoteData = normalizeWorkspaceData(docSnap.data());
            setData(remoteData);
          } else {
            // First time: write initial seed data to Firestore
            await setDoc(docRef, data);
          }
          isRemoteLoadedRef.current = true;
        } catch (err) {
          console.warn('Could not sync with Firestore initially (offline or rules):', err);
          // Keep isRemoteLoadedRef.current = false so unverified local state does not overwrite cloud
        }
      } else {
        // When logged out or not admin, remote data is not loaded for admin
        isRemoteLoadedRef.current = false;

        if (user && user.email) {
          // A client logged in with their email address
          const matched = data.clientProjects.find(
            (p) => p.clientEmail && p.clientEmail.toLowerCase() === user.email?.toLowerCase()
          );
          if (matched) {
            setClientLoggedInProject(matched);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Save to localStorage & Cloud Firestore whenever data changes (guarded by isRemoteLoadedRef)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota
    }

    // Only sync changes to Cloud Firestore after initial remote state has been verified
    if (currentUser && isUserAdmin(currentUser) && isRemoteLoadedRef.current) {
      const timeoutId = setTimeout(async () => {
        try {
          await setDoc(doc(db, 'developer_workspace', 'main'), data);

          // Publish isolated client portal documents and prune deleted/rotated PINs
          const batch = writeBatch(db);
          const currentPins = new Set<string>();

          for (const cp of data.clientProjects) {
            const pinKey = normalizePin(cp.clientAccessPin);
            if (pinKey) {
              currentPins.add(pinKey);
              batch.set(doc(db, 'client_portal_access', pinKey), cp);
            }
          }

          // Delete orphaned PIN documents from previous publications
          const stalePins = getStalePins(syncedPinsRef.current, currentPins);
          for (const stalePin of stalePins) {
            batch.delete(doc(db, 'client_portal_access', stalePin));
          }

          await batch.commit();
          syncedPinsRef.current = currentPins;
        } catch (err) {
          console.warn('Cloud sync error:', err);
        }
      }, 1500); // 1.5s debounce

      return () => clearTimeout(timeoutId);
    }
  }, [data, currentUser]);

  // Client Pin Login Handler
  const handleClientPinLogin = async (pinOrCode: string): Promise<boolean> => {
    const matched = await resolveProjectByPin(pinOrCode);
    if (matched) {
      setClientLoggedInProject(matched);
      return true;
    }
    return false;
  };

  // Sign out handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore
    }
    setClientLoggedInProject(null);
    setCurrentUser(null);
  };

  // Handlers for Ideas
  const handleAddIdea = (idea: IdeaItem) => {
    setData((prev) => ({
      ...prev,
      ideas: [idea, ...prev.ideas],
    }));
  };

  const handleUpdateIdea = (updated: IdeaItem) => {
    setData((prev) => ({
      ...prev,
      ideas: prev.ideas.map((i) => (i.id === updated.id ? updated : i)),
    }));
  };

  const handleDeleteIdea = (ideaId: string) => {
    setData((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((i) => i.id !== ideaId),
    }));
  };

  // Handlers for Contacts
  const handleAddContact = (contact: OutreachContact) => {
    setData((prev) => ({
      ...prev,
      contacts: [contact, ...prev.contacts],
    }));
  };

  const handleUpdateContact = (updated: OutreachContact) => {
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) => (c.id === updated.id ? updated : c)),
    }));
  };

  const handleQuickStageChange = (contactId: string, stage: OutreachStage) => {
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) =>
        c.id === contactId ? { ...c, stage } : c
      ),
    }));
  };

  const handleDeleteContact = (contactId: string) => {
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== contactId),
    }));
  };

  const handleJumpToAddContactForIdea = (ideaId: string) => {
    setPreselectedIdeaForContact(ideaId);
    setActiveTab('contacts');
  };

  // Handlers for Client Projects
  const handleAddClientProject = (project: ClientProject) => {
    setData((prev) => ({
      ...prev,
      clientProjects: [project, ...prev.clientProjects],
    }));
  };

  const handleUpdateClientProject = (updated: ClientProject) => {
    setData((prev) => ({
      ...prev,
      clientProjects: prev.clientProjects.map((p) =>
        p.id === updated.id ? updated : p
      ),
    }));
  };

  const handleDeleteClientProject = (projectId: string) => {
    setData((prev) => ({
      ...prev,
      clientProjects: prev.clientProjects.filter((p) => p.id !== projectId),
    }));
  };

  // Handlers for Personal Platforms
  const handleAddPlatform = (platform: PersonalPlatform) => {
    setData((prev) => ({
      ...prev,
      platforms: [platform, ...prev.platforms],
    }));
  };

  const handleUpdatePlatform = (updated: PersonalPlatform) => {
    setData((prev) => ({
      ...prev,
      platforms: prev.platforms.map((pl) =>
        pl.id === updated.id ? updated : pl
      ),
    }));
  };

  const handleDeletePlatform = (platformId: string) => {
    setData((prev) => ({
      ...prev,
      platforms: prev.platforms.filter((pl) => pl.id !== platformId),
    }));
  };

  // 1. If Client is viewing their portal
  if (clientLoggedInProject) {
    return (
      <ClientPortalView
        project={clientLoggedInProject}
        onLogout={() => setClientLoggedInProject(null)}
      />
    );
  }

  // 2. If Auth is loading
  if (isAuthLoading) {
    return (
      <div
        className="min-h-screen bg-[#0f1015] text-[#f0f1f5] flex items-center justify-center p-4 font-sans"
        dir="rtl"
      >
        <div className="w-full max-w-[380px] bg-[#171821] border border-white/[0.08] rounded-2xl p-7 shadow-2xl text-center space-y-4 relative overflow-hidden">
          <div className="py-2 flex flex-col items-center justify-center gap-3">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
              <div className="w-9 h-9 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white tracking-wide">
                جاري تهيئة المنظومة البرمجية
              </h3>
              <p className="text-xs text-zinc-400">
                فحص الصلاحيات ومزامنة قاعدة البيانات...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. If User is not logged in as Admin, show Auth screen
  if (!currentUser || !isUserAdmin(currentUser)) {
    return (
      <AuthView
        onClientPinLogin={handleClientPinLogin}
      />
    );
  }

  // 4. Admin (Anas) Dashboard
  const navItems: { id: ActiveTab; label: string; badge?: string }[] = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'ideas', label: 'الأفكار والتحقق' },
    { id: 'contacts', label: 'تواصل المستخدمين' },
    { id: 'clients', label: 'مشاريع العملاء' },
    { id: 'platforms', label: 'المنصات الخاصة' },
    { id: 'portfolio', label: 'نشر البورتفوليو 🌟', badge: 'جديد' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1015] text-[#f0f1f5] font-sans antialiased selection:bg-blue-600/30 selection:text-white" dir="rtl">
      {/* Top Bar Header */}
      <header className="bg-[#14151e]/90 border-b border-white/[0.08] px-6 py-3 flex items-center justify-between gap-6 backdrop-blur-md sticky top-0 z-40">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src={BRAND.logoUrl}
            alt="Logo"
            className="w-8 h-8 rounded-lg object-contain bg-zinc-900 border border-white/10 p-1"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <a
              href="#overview"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('overview');
              }}
              className="text-base font-bold text-white tracking-tight hover:text-zinc-200 transition-colors"
            >
              مرصد المبرمج
            </a>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden lg:flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-xl"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === item.id
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 text-[10px] font-medium">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Admin profile & actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex flex-col text-left text-xs">
            <span className="text-zinc-200 font-semibold text-[11px]">{data.developerName}</span>
            <span className="text-[11px] text-zinc-400" dir="ltr">
              {currentUser.email}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowChangePasswordModal(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="تغيير كلمة المرور"
          >
            <Key className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">كلمة المرور</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav
        aria-label="التنقل للجوال"
        className="lg:hidden bg-[#0c0c0e] border-b border-white/[0.08] px-4 py-2 flex flex-wrap items-center gap-1.5 sticky top-[57px] z-30"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer transition-all ${
              activeTab === item.id
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 bg-zinc-950 border border-zinc-850'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewSection
            data={data}
            onNavigate={setActiveTab}
            onQuickStageChange={handleQuickStageChange}
          />
        )}

        {activeTab === 'ideas' && (
          <IdeasLabSection
            ideas={data.ideas}
            contacts={data.contacts}
            currency={data.currency}
            onAddIdea={handleAddIdea}
            onUpdateIdea={handleUpdateIdea}
            onDeleteIdea={handleDeleteIdea}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            onUpdateContact={handleUpdateContact}
            onUpdateContactStage={handleQuickStageChange}
          />
        )}

        {activeTab === 'contacts' && (
          <OutreachCrmSection
            ideas={data.ideas}
            contacts={data.contacts}
            currency={data.currency}
            preselectedIdeaId={preselectedIdeaForContact}
            onClearPreselectedIdea={() => setPreselectedIdeaForContact(null)}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
          />
        )}

        {activeTab === 'clients' && (
          <ClientProjectsSection
            projects={data.clientProjects}
            currency={data.currency}
            onAddProject={handleAddClientProject}
            onUpdateProject={handleUpdateClientProject}
            onDeleteProject={handleDeleteClientProject}
          />
        )}

        {activeTab === 'platforms' && (
          <PlatformsSection
            platforms={data.platforms}
            currency={data.currency}
            onAddPlatform={handleAddPlatform}
            onUpdatePlatform={handleUpdatePlatform}
            onDeletePlatform={handleDeletePlatform}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioShowcaseSection />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#09090b] border-t border-white/[0.08] py-5 px-6 mt-12 text-xs text-zinc-500">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>نظام مرصد المبرمج وبوابة العملاء — متزامن سحابياً مع Firebase ومعرض الأعمال</span>
          </div>
        </div>
      </footer>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}
