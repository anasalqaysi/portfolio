import type {
  IdeaItem,
  OutreachContact,
  ClientProject,
  DeveloperWorkspaceData,
  OutreachStage,
  IdeaStatus,
  ClientProjectStatus,
} from '../types';
import { INITIAL_WORKSPACE_DATA } from '../data/seedData';

/**
 * Coerces untrusted persisted data (localStorage / Firestore) into a valid workspace shape,
 * falling back to seed defaults for missing scalar fields and empty arrays for collections.
 */
export function normalizeWorkspaceData(raw: any): DeveloperWorkspaceData {
  return {
    developerName: typeof raw?.developerName === 'string' ? raw.developerName : INITIAL_WORKSPACE_DATA.developerName,
    developerTitle: typeof raw?.developerTitle === 'string' ? raw.developerTitle : INITIAL_WORKSPACE_DATA.developerTitle,
    currency: typeof raw?.currency === 'string' ? raw.currency : INITIAL_WORKSPACE_DATA.currency,
    ideas: Array.isArray(raw?.ideas) ? raw.ideas : [],
    contacts: Array.isArray(raw?.contacts) ? raw.contacts : [],
    clientProjects: Array.isArray(raw?.clientProjects) ? raw.clientProjects : [],
    platforms: Array.isArray(raw?.platforms) ? raw.platforms : [],
  };
}

/** Canonical form of a client access PIN; also used as the Firestore document ID. */
export function normalizePin(pin: string | null | undefined): string {
  return (pin || '').trim().toLowerCase();
}

export function findProjectByPin(
  projects: ClientProject[],
  pin: string
): ClientProject | undefined {
  const target = normalizePin(pin);
  if (!target) return undefined;
  return projects.find((p) => normalizePin(p.clientAccessPin) === target);
}

/** PINs that were published before but no longer belong to any project (deleted or rotated). */
export function getStalePins(
  previouslyPublished: Iterable<string>,
  current: ReadonlySet<string>
): string[] {
  return [...previouslyPublished].filter((pin) => !current.has(pin));
}

const PIN_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 chars: no 0/O/1/I ambiguity

/**
 * Generates a `CL-XXXXXXXX` PIN (40 bits of entropy) using a CSPRNG.
 * `existingPins` comparison is case-insensitive.
 */
export function generateSecurePin(existingPins: string[]): string {
  const taken = new Set(existingPins.map(normalizePin));
  const bytes = new Uint8Array(8);
  for (let attempt = 0; attempt < 100; attempt++) {
    crypto.getRandomValues(bytes);
    // 256 is a multiple of 32, so the modulo introduces no bias.
    const code = 'CL-' + Array.from(bytes, (b) => PIN_ALPHABET[b % PIN_ALPHABET.length]).join('');
    if (!taken.has(normalizePin(code))) return code;
  }
  throw new Error('Unable to generate a unique client PIN');
}

export interface IdeaValidationMetrics {
  totalContacted: number;
  repliedCount: number;
  interviewedCount: number;
  potentialClientCount: number;
  convertedCount: number;
  notInterestedCount: number;
  willingToPayCount: number;
  responseRatePercent: number;
  positiveSignalPercent: number;
  validationProgressPercent: number;
}

export function calculateIdeaMetrics(
  idea: IdeaItem,
  allContacts: OutreachContact[]
): IdeaValidationMetrics {
  const ideaContacts = allContacts.filter((c) => c.ideaId === idea.id);
  const totalContacted = ideaContacts.length;

  const repliedCount = ideaContacts.filter(
    (c) => c.stage !== 'contacted'
  ).length;
  const interviewedCount = ideaContacts.filter(
    (c) => c.stage === 'interviewed'
  ).length;
  const potentialClientCount = ideaContacts.filter(
    (c) => c.stage === 'potential_client'
  ).length;
  const convertedCount = ideaContacts.filter(
    (c) => c.stage === 'converted_user'
  ).length;
  const notInterestedCount = ideaContacts.filter(
    (c) => c.stage === 'not_interested'
  ).length;
  const willingToPayCount = ideaContacts.filter((c) => c.willingToPay).length;

  const responseRatePercent =
    totalContacted > 0 ? Math.round((repliedCount / totalContacted) * 100) : 0;

  const positiveSignals =
    interviewedCount + potentialClientCount + convertedCount;
  const positiveSignalPercent =
    totalContacted > 0
      ? Math.round((positiveSignals / totalContacted) * 100)
      : 0;

  const target = Math.max(1, idea.targetValidationCount || 10);
  const validationProgressPercent = Math.min(
    100,
    Math.round((totalContacted / target) * 100)
  );

  return {
    totalContacted,
    repliedCount,
    interviewedCount,
    potentialClientCount,
    convertedCount,
    notInterestedCount,
    willingToPayCount,
    responseRatePercent,
    positiveSignalPercent,
    validationProgressPercent,
  };
}

export interface WorkspaceSummaryMetrics {
  totalIdeas: number;
  activeExecutionIdeas: number;
  validatedIdeasCount: number;
  totalContacts: number;
  totalReplied: number;
  totalPotentialClients: number;
  overallResponseRate: number;
  totalClientContractValue: number;
  totalClientPaid: number;
  totalClientRemaining: number;
  activeClientProjectsCount: number;
  totalMonthlyPlatformRevenue: number;
  totalMonthlyPlatformCosts: number;
  netMonthlyPlatformProfit: number;
}

export function calculateWorkspaceSummary(
  data: DeveloperWorkspaceData
): WorkspaceSummaryMetrics {
  const totalIdeas = data.ideas.length;
  const activeExecutionIdeas = data.ideas.filter(
    (i) =>
      i.status === 'building_mvp' ||
      i.status === 'in_execution' ||
      i.status === 'launched'
  ).length;
  const validatedIdeasCount = data.ideas.filter(
    (i) => i.validatedBeforeStart
  ).length;

  const totalContacts = data.contacts.length;
  const totalReplied = data.contacts.filter(
    (c) => c.stage !== 'contacted'
  ).length;
  const totalPotentialClients = data.contacts.filter(
    (c) => c.stage === 'potential_client' || c.stage === 'converted_user'
  ).length;
  const overallResponseRate =
    totalContacts > 0 ? Math.round((totalReplied / totalContacts) * 100) : 0;

  const totalClientContractValue = data.clientProjects.reduce(
    (sum, p) => sum + (Number(p.totalBudget) || 0),
    0
  );
  const totalClientPaid = data.clientProjects.reduce(
    (sum, p) => sum + (Number(p.paidAmount) || 0),
    0
  );
  const totalClientRemaining = Math.max(
    0,
    totalClientContractValue - totalClientPaid
  );
  const activeClientProjectsCount = data.clientProjects.filter(
    (p) =>
      p.status === 'in_progress' ||
      p.status === 'client_review' ||
      p.status === 'contract_signed'
  ).length;

  const totalMonthlyPlatformRevenue = data.platforms.reduce(
    (sum, pl) => sum + (Number(pl.monthlyRevenue) || 0),
    0
  );
  const totalMonthlyPlatformCosts = data.platforms.reduce(
    (sum, pl) =>
      sum +
      (Number(pl.monthlyServerCost) || 0) +
      Math.round((Number(pl.annualDomainCost) || 0) / 12),
    0
  );
  const netMonthlyPlatformProfit =
    totalMonthlyPlatformRevenue - totalMonthlyPlatformCosts;

  return {
    totalIdeas,
    activeExecutionIdeas,
    validatedIdeasCount,
    totalContacts,
    totalReplied,
    totalPotentialClients,
    overallResponseRate,
    totalClientContractValue,
    totalClientPaid,
    totalClientRemaining,
    activeClientProjectsCount,
    totalMonthlyPlatformRevenue,
    totalMonthlyPlatformCosts,
    netMonthlyPlatformProfit,
  };
}

export function filterContacts(
  contacts: OutreachContact[],
  options: {
    searchQuery?: string;
    ideaId?: string;
    stage?: OutreachStage | 'all';
    channel?: string;
  }
): OutreachContact[] {
  const q = (options.searchQuery || '').trim().toLowerCase();
  return contacts.filter((c) => {
    if (options.ideaId && options.ideaId !== 'all' && c.ideaId !== options.ideaId) {
      return false;
    }
    if (options.stage && options.stage !== 'all' && c.stage !== options.stage) {
      return false;
    }
    if (options.channel && options.channel !== 'all') {
      if (options.channel === 'phone' && !c.channels.phone && !c.channels.whatsapp) {
        return false;
      }
      if (options.channel === 'x' && !c.channels.xHandle) {
        return false;
      }
      if (options.channel === 'tiktok' && !c.channels.tiktokHandle) {
        return false;
      }
      if (options.channel === 'linkedin' && !c.channels.linkedinUrl) {
        return false;
      }
      if (options.channel === 'telegram' && !c.channels.telegramHandle) {
        return false;
      }
    }
    if (!q) return true;
    const haystack = [
      c.name,
      c.roleOrPersona,
      c.feedbackSummary,
      c.channels.phone,
      c.channels.whatsapp,
      c.channels.xHandle,
      c.channels.tiktokHandle,
      c.channels.email,
      c.channels.telegramHandle,
      c.channels.otherChannel,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  idea_stage: 'صياغة الفكرة',
  validating: 'تحقق وتواصل مع السوق',
  building_mvp: 'بناء النسخة الأولية MVP',
  in_execution: 'قيد التنفيذ والتطوير',
  launched: 'تم الإطلاق',
  paused: 'مؤجل مؤقتاً',
};

export const OUTREACH_STAGE_LABELS: Record<OutreachStage, string> = {
  contacted: 'تم التواصل',
  replied: 'تم الرد',
  interviewed: 'تم النقاش وجمع الملاحظات',
  potential_client: 'عميل محتمل مهتم',
  converted_user: 'عميل فعلي / مشترك مبكر',
  not_interested: 'غير مهتم حالياً',
};

export const CLIENT_STATUS_LABELS: Record<ClientProjectStatus, string> = {
  proposal: 'عرض سعر ودراسة',
  contract_signed: 'تم التعاقد',
  in_progress: 'جاري البرمجة والتنفيذ',
  client_review: 'مراجعة العميل وتعديلات',
  completed: 'مكتمل وتم التسليم',
  maintenance: 'عقد صيانة وتشغيل',
};

export function formatSocialLink(
  type: 'whatsapp' | 'x' | 'tiktok' | 'telegram',
  value: string
): string {
  const clean = value.trim();
  if (!clean) return '#';
  if (type === 'whatsapp') {
    const digits = clean.replace(/[^0-9]/g, '');
    return `https://wa.me/${digits}`;
  }
  if (type === 'x') {
    const handle = clean.replace(/^@/, '');
    return `https://x.com/${handle}`;
  }
  if (type === 'tiktok') {
    const handle = clean.replace(/^@/, '');
    return `https://www.tiktok.com/@${handle}`;
  }
  if (type === 'telegram') {
    const handle = clean.replace(/^@/, '');
    return `https://t.me/${handle}`;
  }
  return '#';
}
