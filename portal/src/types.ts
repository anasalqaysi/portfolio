export type IdeaStatus =
  | 'idea_stage'
  | 'validating'
  | 'building_mvp'
  | 'in_execution'
  | 'launched'
  | 'paused';

export type OutreachStage =
  | 'contacted'
  | 'replied'
  | 'interviewed'
  | 'potential_client'
  | 'converted_user'
  | 'not_interested';

export type ChannelType =
  | 'whatsapp'
  | 'phone'
  | 'x'
  | 'tiktok'
  | 'linkedin'
  | 'email'
  | 'telegram';

export interface ContactChannels {
  phone: string;
  whatsapp: string;
  xHandle: string;
  tiktokHandle: string;
  linkedinUrl: string;
  email: string;
  telegramHandle: string;
  otherChannel: string;
}

export interface OutreachContact {
  id: string;
  ideaId: string;
  name: string;
  roleOrPersona: string;
  stage: OutreachStage;
  primaryChannel: ChannelType;
  channels: ContactChannels;
  feedbackSummary: string;
  willingToPay: boolean;
  expectedPriceMonthly: number;
  lastContactDate: string;
  nextFollowUpDate: string;
}

export interface IdeaItem {
  id: string;
  title: string;
  problemStatement: string;
  solutionOutline?: string;
  targetAudience: string;
  requirements: string[];
  status: IdeaStatus;
  validatedBeforeStart: boolean;
  targetValidationCount: number;
  monetizationModel: string;
  estimatedCost: number;
  notes: string;
  createdAt: string;
}

export type ClientProjectStatus =
  | 'proposal'
  | 'contract_signed'
  | 'in_progress'
  | 'client_review'
  | 'completed'
  | 'maintenance';

export interface ProjectMilestone {
  id: string;
  title: string;
  amount: number;
  isPaid: boolean;
  isDone: boolean;
}

export interface ProjectContractClause {
  id: string;
  title: string;
  content: string;
}

export interface ProjectContract {
  contractNumber: string;
  contractDate: string;
  // First Party
  firstPartyName: string;
  firstPartyTitle: string;
  firstPartyCert: string;
  firstPartyPhone: string;
  firstPartyEmail: string;

  // Second Party
  secondPartyName: string;
  secondPartyOrgOrId: string;
  secondPartyPhone: string;
  secondPartyEmail: string;

  // Project Info
  projectTitle: string;
  projectScope: string;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  deliveryDuration: string;
  warrantyPeriod: string;

  // Clauses
  clauses: ProjectContractClause[];
  specialTerms?: string;

  // Signature
  isSignedByClient?: boolean;
  signedAt?: string;
}

export interface ClientProject {
  id: string;
  projectName: string;
  clientName: string;
  clientPhone: string;
  clientXHandle: string;
  clientEmail: string;
  projectType: string;
  status: ClientProjectStatus;
  totalBudget: number;
  paidAmount: number;
  startDate: string;
  deadline: string;
  repoUrl: string;
  stagingUrl: string;
  milestones: ProjectMilestone[];
  notes: string;
  contract?: ProjectContract;
  clientAccessPin?: string;
  publishToPortfolio?: boolean;
  portfolioSummary?: string;
  portfolioTags?: string[];
  portfolioThumbnail?: string;
  portfolioCategory?: 'portfolio' | 'business' | 'menu' | 'landing' | 'saas';
}

export type PlatformStatus = 'development' | 'beta' | 'live' | 'maintenance';

export interface PlatformTask {
  id: string;
  title: string;
  category: 'feature' | 'bug' | 'infra' | 'marketing';
  priority: 'high' | 'medium' | 'low';
  done: boolean;
}

export interface PersonalPlatform {
  id: string;
  name: string;
  tagline: string;
  domain: string;
  status: PlatformStatus;
  techStack: string[];
  repoUrl: string;
  hostingProvider: string;
  databaseProvider: string;
  monthlyServerCost: number;
  annualDomainCost: number;
  domainExpiryDate: string;
  activeUsersCount: number;
  monthlyRevenue: number;
  backlogTasks: PlatformTask[];
  publishToPortfolio?: boolean;
}

export interface DeveloperWorkspaceData {
  developerName: string;
  developerTitle: string;
  currency: string;
  ideas: IdeaItem[];
  contacts: OutreachContact[];
  clientProjects: ClientProject[];
  platforms: PersonalPlatform[];
}
