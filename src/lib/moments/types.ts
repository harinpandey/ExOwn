export type MomentCategory =
  | "NEW_LISTING"
  | "PRICE_DROP"
  | "SAVED_ITEM"
  | "REPEATED_VIEW"
  | "NEARBY_LISTING"
  | "TRENDING_CATEGORY"
  | "OFFER_RECEIVED"
  | "OFFER_ACCEPTED"
  | "COUNTER_OFFER"
  | "OFFER_EXPIRING"
  | "LISTING_EXPIRING"
  | "LISTING_GETTING_VIEWS"
  | "LISTING_NOT_GETTING_ENGAGEMENT"
  | "SELL_REMINDER"
  | "HOUSING_MATCH"
  | "NEW_HOUSING_LISTING"
  | "ROOMMATE_MATCH"
  | "NEW_ROOMMATE"
  | "EXCHANGE_OPPORTUNITY"
  | "SERVICE_DISCOVERY"
  | "EXAM_SEASON"
  | "CAMPUS_ACTIVITY"
  | "WEEKEND"
  | "DEAL_COMPLETED"
  | "REVIEW_REMINDER"
  | "WELCOME"
  | "RE_ENGAGEMENT"
  | "WISHLIST"
  | "SEARCH_MATCH"
  | "ANNOUNCEMENT"
  | "SAFETY_SECURITY"
  | "HELPFUL_ADVICE";

export type MomentPriority = "low" | "normal" | "high" | "urgent";

export interface MomentTemplate {
  id: string;
  category: MomentCategory;
  title: string;
  message: string;
  cta: string;
  ctaHref?: string;
  icon?: string;
  secondaryAction?: {
    label: string;
    href?: string;
    actionType?: "dismiss" | "navigate";
  };
  priority: MomentPriority;
  tone?: "witty" | "encouraging" | "curious" | "direct" | "celebratory";
}

export interface ActiveMoment {
  instanceId: string;
  templateId: string;
  category: MomentCategory;
  title: string;
  message: string;
  cta: string;
  ctaHref: string;
  icon: string;
  image?: string;
  priority: MomentPriority;
  secondaryAction?: {
    label: string;
    href?: string;
  };
  metadata?: Record<string, any>;
  timestamp: number;
  duration?: number; // duration in milliseconds (default 7000ms)
  isTransactional?: boolean; // if true, can bypass promotional frequency limits
  addToNotificationCenter?: boolean;
}

export interface MomentFrequencyState {
  lastShownAt: number;
  todayCount: number;
  lastDateStr: string; // "YYYY-MM-DD"
  recentTemplateIds: { templateId: string; timestamp: number }[];
  dismissStreak: number;
  cooldownUntil: number;
}

export interface MomentAnalyticsEvent {
  event: "impression" | "click" | "dismiss" | "conversion";
  templateId: string;
  category: MomentCategory;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AdminCustomMoment {
  id: string;
  title: string;
  message: string;
  category: MomentCategory;
  cta: string;
  ctaHref: string;
  icon: string;
  image?: string;
  priority: MomentPriority;
  targetAudience: "ALL" | "BUYERS" | "SELLERS" | "HOUSING" | "CAMPUS";
  targetCampus?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  impressions: number;
  clicks: number;
  dismisses: number;
}
