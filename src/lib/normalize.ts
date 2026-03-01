/**
 * Normalisation helpers – the Supabase types use snake_case while the
 * original mockData uses camelCase.  These tiny mappers let every page
 * work with a single, camelCase shape regardless of data source.
 */

/* ── Wallet ────────────────────────────────────────────────── */
export interface WalletView {
  totalCredits: number
  walletBalance: number
  treesSaved: number
  energySaved: string
  co2Saved: string
  thisMonth: number
  lastMonth: number
  streak: number
  monthlyCredits: number
  monthlyChart: { month: string; credits: number }[]
}

export function normalizeWallet(raw: any, fallback: any): WalletView {
  if (!raw) return fallback as WalletView
  // API returns snake_case CarbonWallet; mockData returns camelCase
  return {
    totalCredits: raw.total_credits ?? raw.totalCredits ?? 0,
    walletBalance: raw.wallet_balance ?? raw.walletBalance ?? 0,
    treesSaved: raw.trees_saved ?? raw.treesSaved ?? 0,
    energySaved: raw.energy_saved_kwh ? `${raw.energy_saved_kwh} kWh` : raw.energySaved ?? '840 kWh',
    co2Saved: raw.co2_saved_kg ? `${raw.co2_saved_kg} kg` : raw.co2Saved ?? '14.8 kg',
    thisMonth: raw.this_month ?? raw.thisMonth ?? 0,
    lastMonth: raw.last_month ?? raw.lastMonth ?? 0,
    streak: raw.streak ?? 12,
    monthlyCredits: raw.monthly_credits ?? raw.monthlyCredits ?? 282,
    monthlyChart: raw.monthlyChart ?? raw.monthly_chart ?? [],
  }
}

/* ── Pickup ─────────────────────────────────────────────────── */
export interface PickupView {
  id: string
  wasteType: string
  date: string
  timeWindow: string
  status: string
  collector?: string
  truckId?: string
  eta?: string
  phone?: string
  address?: string
}

export function normalizePickup(raw: any): PickupView {
  return {
    id: raw.id,
    wasteType: raw.waste_type ?? raw.wasteType ?? 'mixed',
    date: raw.date,
    timeWindow: raw.time_window ?? raw.timeWindow ?? '',
    status: raw.status ?? 'Requested',
    collector: raw.collector,
    truckId: raw.truck_id ?? raw.truckId,
    eta: raw.eta,
    phone: raw.phone,
    address: raw.address,
  }
}
export const normalizePickups = (arr: any[]): PickupView[] => arr.map(normalizePickup)

/* ── Collection ────────────────────────────────────────────── */
export interface CollectionView {
  id: string
  date: string
  wetKg: number
  dryKg: number
  hazardousKg: number
  totalKg: number
  segregationScore: number
  creditsEarned: number
}

export function normalizeCollection(raw: any): CollectionView {
  return {
    id: raw.id,
    date: raw.date,
    wetKg: raw.wet_kg ?? raw.wetKg ?? 0,
    dryKg: raw.dry_kg ?? raw.dryKg ?? 0,
    hazardousKg: raw.hazardous_kg ?? raw.hazardousKg ?? 0,
    totalKg: raw.total_kg ?? raw.totalKg ?? 0,
    segregationScore: raw.segregation_score ?? raw.segregationScore ?? 0,
    creditsEarned: raw.credits_earned ?? raw.creditsEarned ?? 0,
  }
}
export const normalizeCollections = (arr: any[]): CollectionView[] => arr.map(normalizeCollection)

/* ── Leaderboard ───────────────────────────────────────────── */
export interface LeaderboardView {
  rank: number
  name: string
  society: string
  city: string
  points: number
  badge: string
  trend: number[]
  isUser: boolean
}

export function normalizeLeaderboardRow(raw: any): LeaderboardView {
  return {
    rank: raw.rank ?? 0,
    name: raw.full_name ?? raw.name ?? '',
    society: raw.society ?? '',
    city: raw.city ?? '',
    points: raw.total_credits ?? raw.total_points ?? raw.points ?? 0,
    badge: raw.badge ?? '',
    trend: raw.trend ?? [0],
    isUser: raw.is_user ?? raw.isUser ?? false,
  }
}
export const normalizeLeaderboard = (arr: any[]): LeaderboardView[] => arr.map(normalizeLeaderboardRow)

/* ── Waste Timeline ────────────────────────────────────────── */
export interface TimelineView {
  day: string
  recyclable: number
  biodegradable: number
  hazardous: number
  mixed: number
  predicted?: number
}
export function normalizeTimelineRow(raw: any): TimelineView {
  return {
    day: raw.day ?? raw.day_label ?? '',
    recyclable: raw.recyclable ?? raw.recyclable_kg ?? 0,
    biodegradable: raw.biodegradable ?? raw.biodegradable_kg ?? 0,
    hazardous: raw.hazardous ?? raw.hazardous_kg ?? 0,
    mixed: raw.mixed ?? raw.mixed_kg ?? 0,
    predicted: raw.predicted ?? raw.predicted_kg,
  }
}
export const normalizeTimeline = (arr: any[]): TimelineView[] => arr.map(normalizeTimelineRow)

/* ── Zone Forecast ─────────────────────────────────────────── */
export interface ForecastView {
  zone: string
  mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number
  [key: string]: string | number
}
export function normalizeForecastRow(raw: any): ForecastView {
  return {
    zone: raw.zone ?? raw.zones?.name ?? '',
    mon: raw.mon ?? raw.mon_kg ?? 0,
    tue: raw.tue ?? raw.tue_kg ?? 0,
    wed: raw.wed ?? raw.wed_kg ?? 0,
    thu: raw.thu ?? raw.thu_kg ?? 0,
    fri: raw.fri ?? raw.fri_kg ?? 0,
    sat: raw.sat ?? raw.sat_kg ?? 0,
    sun: raw.sun ?? raw.sun_kg ?? 0,
  }
}
export const normalizeForecast = (arr: any[]): ForecastView[] => arr.map(normalizeForecastRow)

/* ── AI Predictions ────────────────────────────────────────── */
export interface PredictionView {
  text: string
  confidence: number
  impact: string
  action: string
}
export interface PredictDataView {
  predictions: PredictionView[]
  heatmapCalendar: { day: number; value: number }[]
}
/** raw may be an array (from API) or the full wrapper object (from mock) */
export function normalizePredictData(raw: any, fallback: any): PredictDataView {
  if (!raw) return fallback as PredictDataView
  if (Array.isArray(raw)) {
    return {
      predictions: raw.map(p => ({
        text: p.text ?? '',
        confidence: p.confidence ?? 0,
        impact: p.impact ?? 'low',
        action: p.action ?? '',
      })),
      heatmapCalendar: fallback?.heatmapCalendar ?? [],
    }
  }
  return raw as PredictDataView
}

/* ── Municipal Pickup Queue ────────────────────────────────── */
export interface QueueView {
  id: string
  citizenName: string
  wasteType: string
  address: string
  minutesAgo: number
  assignedTruck?: string
}

export function normalizeQueueItem(raw: any): QueueView {
  const pr = raw.pickup_requests
  return {
    id: raw.id ?? raw.request_id,
    citizenName:
      raw.citizenName ??
      pr?.profiles?.full_name ??
      raw.citizen_name ??
      pr?.citizen_name ??
      'Citizen',
    wasteType: raw.wasteType ?? pr?.waste_type ?? raw.waste_type ?? 'Mixed',
    address: raw.address ?? pr?.address ?? '',
    minutesAgo:
      raw.minutesAgo ??
      raw.minutes_ago ??
      Math.floor((Date.now() - new Date(raw.queued_at ?? raw.created_at ?? Date.now()).getTime()) / 60000),
    assignedTruck: raw.assignedTruck ?? raw.assigned_truck_id ?? raw.assigned_truck ?? raw.truck_id,
  }
}
export const normalizeQueue = (arr: any[]): QueueView[] => arr.map(normalizeQueueItem)

/* ── ESG Buyer ─────────────────────────────────────────────── */
export interface EsgBuyerView {
  id: number
  company: string
  creditsWanted: number
  pricePerCredit: number
  totalValue: number
  status: string
}

export function normalizeEsgBuyer(raw: any): EsgBuyerView {
  return {
    id: raw.id,
    company: raw.company ?? '',
    creditsWanted: raw.credits_wanted ?? raw.creditsWanted ?? 0,
    pricePerCredit: raw.price_per_credit ?? raw.pricePerCredit ?? 0,
    totalValue: raw.total_value ?? raw.totalValue ?? 0,
    status: raw.status ?? 'Pending',
  }
}
export const normalizeEsgBuyers = (arr: any[]): EsgBuyerView[] => arr.map(normalizeEsgBuyer)

/* ── ESG Transaction ────────────────────────────────────────── */
export interface EsgTxView {
  company: string
  credits: number
  value: number
  date: string
}
export function normalizeEsgTx(raw: any): EsgTxView {
  return {
    company: raw.company ?? raw.esg_corporate_buyers?.company ?? '',
    credits: raw.credits ?? raw.credits_sold ?? 0,
    value: raw.value ?? raw.total_value ?? 0,
    date: raw.date ?? raw.transacted_at ?? '',
  }
}
export const normalizeEsgTxs = (arr: any[]): EsgTxView[] => arr.map(normalizeEsgTx)
