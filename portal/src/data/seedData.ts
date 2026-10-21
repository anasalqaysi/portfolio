import type { DeveloperWorkspaceData } from '../types';

export const INITIAL_WORKSPACE_DATA: DeveloperWorkspaceData = {
  developerName: 'أنس القيسي',
  developerTitle: 'مطور برمجيات مستقل ومؤسس منتجات رقمية (Indie Hacker & Full-Stack Dev)',
  currency: 'ر.س',
  ideas: [],
  contacts: [],
  clientProjects: [],
  platforms: [
    {
      id: 'pl-sajalni',
      name: 'منصة سجلي للخدمات الإلكترونية',
      tagline:
        'منصة متكاملة لتقديم وتسهيل الخدمات الإلكترونية (مثل الضمان المطور)، مزودة بلوحة تحكم إدارية شاملة لإدارة الطلبات، تخصيص الأسعار، ومتابعة حالة العملاء بشكل فوري.',
      domain: 'www.sajalni.app',
      status: 'live',
      techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
      repoUrl: 'https://www.sajalni.app',
      hostingProvider: 'Vercel',
      databaseProvider: 'Firebase Firestore',
      monthlyServerCost: 0,
      annualDomainCost: 65,
      domainExpiryDate: '2027-01-01',
      activeUsersCount: 1,
      monthlyRevenue: 0,
      backlogTasks: [
        {
          id: 'bt-s1',
          title: 'متابعة وإدارة مسارات طلبات الضمان المطور وبوابة العملاء',
          category: 'feature',
          priority: 'high',
          done: false,
        },
      ],
      publishToPortfolio: true,
    },
  ],
};
