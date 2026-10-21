import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateIdeaMetrics,
  calculateWorkspaceSummary,
  filterContacts,
  formatSocialLink,
  normalizeWorkspaceData,
  normalizePin,
  findProjectByPin,
  getStalePins,
  generateSecurePin,
} from './workspaceLogic';
import type { IdeaItem, OutreachContact, DeveloperWorkspaceData } from '../types';

const sampleIdea: IdeaItem = {
  id: 'idea-1',
  title: 'منصة أتمتة فواتير المتاجر',
  problemStatement: 'صعوبة مطابقة الفواتير الضريبية',
  targetAudience: 'أصحاب المتاجر في سلة وزد',
  requirements: ['Next.js', 'PostgreSQL', 'ZATCA API'],
  status: 'validating',
  validatedBeforeStart: true,
  targetValidationCount: 10,
  monetizationModel: 'اشتراك شهري 99 ريال',
  estimatedCost: 1500,
  notes: '',
  createdAt: '2026-10-01',
};

const sampleContacts: OutreachContact[] = [
  {
    id: 'c1',
    ideaId: 'idea-1',
    name: 'فهد العتيبي',
    roleOrPersona: 'صاحب متجر عطور',
    stage: 'potential_client',
    primaryChannel: 'whatsapp',
    channels: {
      phone: '+966501112233',
      whatsapp: '+966501112233',
      xHandle: '@fahad_perfumes',
      tiktokHandle: '@fahad.oud',
      linkedinUrl: '',
      email: 'fahad@example.com',
      telegramHandle: '',
      otherChannel: '',
    },
    feedbackSummary: 'يحتاج ربط مباشر مع سلة ومستعد للدفع فوراً',
    willingToPay: true,
    expectedPriceMonthly: 120,
    lastContactDate: '2026-10-15',
    nextFollowUpDate: '2026-10-22',
  },
  {
    id: 'c2',
    ideaId: 'idea-1',
    name: 'سارة المنصور',
    roleOrPersona: 'مديرة عمليات متجر أزياء',
    stage: 'contacted',
    primaryChannel: 'x',
    channels: {
      phone: '',
      whatsapp: '',
      xHandle: '@sara_fashion',
      tiktokHandle: '@sara_style',
      linkedinUrl: '',
      email: '',
      telegramHandle: '',
      otherChannel: '',
    },
    feedbackSummary: 'تم إرسال رسالة خاصة في إكس بانتظار الرد',
    willingToPay: false,
    expectedPriceMonthly: 0,
    lastContactDate: '2026-10-18',
    nextFollowUpDate: '2026-10-25',
  },
];

test('calculateIdeaMetrics computes outreach and validation percentages accurately', () => {
  const metrics = calculateIdeaMetrics(sampleIdea, sampleContacts);
  assert.equal(metrics.totalContacted, 2);
  assert.equal(metrics.repliedCount, 1);
  assert.equal(metrics.potentialClientCount, 1);
  assert.equal(metrics.willingToPayCount, 1);
  assert.equal(metrics.responseRatePercent, 50);
  assert.equal(metrics.validationProgressPercent, 20);
});

test('filterContacts filters by handle, channel, and stage', () => {
  const byTiktok = filterContacts(sampleContacts, {
    searchQuery: '@fahad.oud',
  });
  assert.equal(byTiktok.length, 1);
  assert.equal(byTiktok[0].id, 'c1');

  const byStage = filterContacts(sampleContacts, {
    stage: 'contacted',
  });
  assert.equal(byStage.length, 1);
  assert.equal(byStage[0].id, 'c2');
});

test('calculateWorkspaceSummary aggregates financials and leads properly', () => {
  const workspace: DeveloperWorkspaceData = {
    developerName: 'أنس',
    developerTitle: 'مهندس برمجيات ومؤسس مشاريع تقنية',
    currency: 'ر.س',
    ideas: [sampleIdea],
    contacts: sampleContacts,
    clientProjects: [
      {
        id: 'cp-1',
        projectName: 'تطبيق حجز عيادات',
        clientName: 'مجمع النور الطبي',
        clientPhone: '+966554443322',
        clientXHandle: '@alnoor_clinic',
        clientEmail: 'info@alnoor.sa',
        projectType: 'تطبيق جوال ولوحة تحكم',
        status: 'in_progress',
        totalBudget: 25000,
        paidAmount: 15000,
        startDate: '2026-09-01',
        deadline: '2026-11-15',
        repoUrl: 'https://github.com/dev/alnoor-clinic',
        stagingUrl: 'https://staging.alnoor.sa',
        milestones: [],
        notes: '',
      },
    ],
    platforms: [
      {
        id: 'pl-1',
        name: 'رادار المتاجر',
        tagline: 'تحليل أسعار المنافسين تلقائياً',
        domain: 'store-radar.sa',
        status: 'live',
        techStack: ['React', 'Node.js'],
        repoUrl: '',
        hostingProvider: 'Render',
        databaseProvider: 'Supabase',
        monthlyServerCost: 150,
        annualDomainCost: 120,
        domainExpiryDate: '2027-05-01',
        activeUsersCount: 42,
        monthlyRevenue: 3200,
        backlogTasks: [],
      },
    ],
  };

  const summary = calculateWorkspaceSummary(workspace);
  assert.equal(summary.totalIdeas, 1);
  assert.equal(summary.validatedIdeasCount, 1);
  assert.equal(summary.totalClientContractValue, 25000);
  assert.equal(summary.totalClientPaid, 15000);
  assert.equal(summary.totalClientRemaining, 10000);
  assert.equal(summary.totalMonthlyPlatformRevenue, 3200);
  assert.equal(summary.totalMonthlyPlatformCosts, 160);
  assert.equal(summary.netMonthlyPlatformProfit, 3040);
});

test('formatSocialLink creates valid direct URLs for WhatsApp, X, and TikTok', () => {
  assert.equal(
    formatSocialLink('whatsapp', '+966 50 111 2233'),
    'https://wa.me/966501112233'
  );
  assert.equal(formatSocialLink('x', '@fahad_dev'), 'https://x.com/fahad_dev');
  assert.equal(
    formatSocialLink('tiktok', '@fahad.tiktok'),
    'https://www.tiktok.com/@fahad.tiktok'
  );
});

test('normalizeWorkspaceData falls back gracefully on corrupt or partial input', () => {
  const emptyNormalized = normalizeWorkspaceData(null);
  assert.equal(typeof emptyNormalized.developerName, 'string');
  assert.ok(Array.isArray(emptyNormalized.ideas));
  assert.ok(Array.isArray(emptyNormalized.contacts));
  assert.ok(Array.isArray(emptyNormalized.clientProjects));
  assert.ok(Array.isArray(emptyNormalized.platforms));

  const partial = normalizeWorkspaceData({ developerName: 'أنس مخصص', ideas: 'not-an-array' });
  assert.equal(partial.developerName, 'أنس مخصص');
  assert.deepEqual(partial.ideas, []);
});

test('normalizePin and findProjectByPin handle whitespace and case sensitivity', () => {
  assert.equal(normalizePin('  CL-9XyZ123  '), 'cl-9xyz123');
  assert.equal(normalizePin(null), '');

  const projects = [
    { id: 'p1', clientAccessPin: 'CL-ALPHA12', projectName: 'مشروع 1' } as any,
    { id: 'p2', clientAccessPin: 'CL-BETA34', projectName: 'مشروع 2' } as any,
  ];

  assert.equal(findProjectByPin(projects, 'cl-alpha12')?.id, 'p1');
  assert.equal(findProjectByPin(projects, '  CL-BETA34  ')?.id, 'p2');
  assert.equal(findProjectByPin(projects, 'non-existent'), undefined);
});

test('getStalePins detects pins no longer present in current set', () => {
  const previous = new Set(['cl-1', 'cl-2', 'cl-3']);
  const current = new Set(['cl-2', 'cl-4']);
  const stale = getStalePins(previous, current);
  assert.deepEqual(stale.sort(), ['cl-1', 'cl-3']);
});

test('generateSecurePin produces valid non-colliding formatted PINs', () => {
  const pin = generateSecurePin(['CL-EXISTS']);
  assert.match(pin, /^CL-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
  assert.notEqual(pin, 'CL-EXISTS');
});

