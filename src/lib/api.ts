// ============================================================
// WasteOS — API Layer (Supabase-first, mock fallback)
// All functions call Supabase; falls back to mockData when
// VITE_SUPABASE_URL is not configured (local dev).
// Scan/Chat routes call the local FastAPI backend at :8000.
// ============================================================

import { supabase } from './supabase'
import type {
  PickupRequest, CollectionRecord, CarbonWallet, CarbonWalletMonthly,
  MarketplaceBrand, Voucher, MunicipalPickupQueue, MunicipalAlert,
  WasteTimeline, AiPrediction, EsgCorporateBuyer, EsgTransaction,
  LeaderboardRow, WasteType, PickupStatus, EsgBuyerStatus,
} from './database.types'

const API_BASE = 'http://localhost:8000'

const isMock =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('YOUR_PROJECT_ID')

function err(e: unknown): never {
  throw e instanceof Error ? e : new Error(String(e))
}

// ── Scan page ─────────────────────────────────────────────────

export interface DetectedObject {
  label: string
  confidence: number
  bbox: number[]
}

export interface AnalyzeSuccessResponse {
  status: 'success'
  analysis_source: 'yolo' | 'ml_fallback'
  final_category: string
  detected_objects: DetectedObject[]
  ml_support: {
    category: string
    confidence: number
  }
  insights: {
    detected_items: string[]
    disposal_method: string
    environmental_impact: string
    landfill_risk: string
    user_advice: string
  } | null
}

export interface AnalyzeRejectedResponse {
  status: 'rejected'
  message: string
  reason: string
}

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeRejectedResponse

export const analyzeWasteImage = async (imageFile: File): Promise<AnalyzeResponse> => {
  const formData = new FormData()
  formData.append('file', imageFile)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 400 && data.status === 'rejected') {
        return data as AnalyzeRejectedResponse
      }
      throw new Error(data.detail || data.message || `Server error: ${response.status}`)
    }

    return data as AnalyzeSuccessResponse
  } catch (e: any) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') throw new Error('Request timed out. Please try again.')
    throw e
  }
}

export const getChatResponse = async (
  message: string,
  imageB64: string,
  mimeType: string,
  result: AnalyzeSuccessResponse,
  history: { role: string; text: string }[],
): Promise<{ message: string }> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        image_b64: imageB64,
        mime_type: mimeType,
        classification: result.ml_support,
        insights: result.insights || {},
        history,
        final_category: result.final_category,
        analysis_source: result.analysis_source,
        detected_objects: result.detected_objects,
        ml_support: result.ml_support,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const data = await response.json()

    if (!response.ok) throw new Error(data.detail || 'Chat request failed')

    return { message: data.message }
  } catch (e: any) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') throw new Error('Chat request timed out.')
    throw e
  }
}

// ── Legacy stubs (kept for existing page imports) ─────────────

export const getCityWasteData = async (_city: string) => {
  if (isMock) {
    await new Promise(r => setTimeout(r, 800))
    const { municipalData } = await import('./mockData')
    return municipalData
  }
  return getWasteTimeline(_city)
}

export const getPredictions = async (_params: object) => {
  if (isMock) {
    await new Promise(r => setTimeout(r, 1500))
    const { predictData } = await import('./mockData')
    return predictData
  }
  return getAiPredictions()
}

// ── Profile ───────────────────────────────────────────────────

export async function getProfile(userId: string) {
  if (isMock) {
    const { rewardsData } = await import('./mockData')
    return { id: userId, full_name: rewardsData.user.name, portal: 'citizen', city: 'Indore' }
  }
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) err(error)
  return data
}

// ── Pickup Requests ───────────────────────────────────────────

export async function getMyPickups(citizenId: string): Promise<PickupRequest[]> {
  if (isMock) {
    const { pickupRequests } = await import('./mockData')
    return pickupRequests as unknown as PickupRequest[]
  }
  const { data, error } = await supabase
    .from('pickup_requests')
    .select('*')
    .eq('citizen_id', citizenId)
    .order('date', { ascending: false })
  if (error) err(error)
  return data ?? []
}

export async function createPickupRequest(payload: {
  citizenId: string
  wasteType: WasteType
  date: string
  timeWindow: string
  address?: string
  whatsappOpted?: boolean
  isSubscription?: boolean
  frequency?: string
}): Promise<PickupRequest> {
  if (isMock) {
    const { pickupRequests } = await import('./mockData')
    return pickupRequests[0] as unknown as PickupRequest
  }
  const { data: idRow } = await supabase.rpc('generate_pickup_id')
  const id = idRow as string
  const { data, error } = await supabase
    .from('pickup_requests')
    .insert({
      id,
      citizen_id: payload.citizenId,
      waste_type: payload.wasteType,
      date: payload.date,
      time_window: payload.timeWindow,
      address: payload.address,
      whatsapp_opted: payload.whatsappOpted ?? false,
      is_subscription: payload.isSubscription ?? false,
      frequency: payload.frequency as never,
    })
    .select()
    .single()
  if (error) err(error)
  return data!
}

export async function updatePickupStatus(
  id: string,
  status: PickupStatus,
  extra?: { truckId?: string; etaMinutes?: number },
) {
  if (isMock) return
  const { error } = await supabase
    .from('pickup_requests')
    .update({
      status,
      ...(extra?.truckId ? { truck_id: extra.truckId } : {}),
      ...(extra?.etaMinutes != null ? { eta_minutes: extra.etaMinutes } : {}),
    })
    .eq('id', id)
  if (error) err(error)
}

// ── Collection Records ────────────────────────────────────────

export async function getCollectionHistory(citizenId: string): Promise<CollectionRecord[]> {
  if (isMock) {
    const { collectionHistory } = await import('./mockData')
    return collectionHistory as unknown as CollectionRecord[]
  }
  const { data, error } = await supabase
    .from('collection_records')
    .select('*')
    .eq('citizen_id', citizenId)
    .order('date', { ascending: false })
  if (error) err(error)
  return data ?? []
}

export async function createCollectionRecord(record: {
  pickupId: string; citizenId: string; date: string
  wetKg: number; dryKg: number; hazardousKg: number
  segregationScore: number; creditsEarned: number; co2SavedKg: number
  scannedBy?: string
}): Promise<CollectionRecord> {
  if (isMock) {
    const { collectionHistory } = await import('./mockData')
    return collectionHistory[0] as unknown as CollectionRecord
  }
  const { data, error } = await supabase
    .from('collection_records')
    .insert({
      pickup_id: record.pickupId, citizen_id: record.citizenId, date: record.date,
      wet_kg: record.wetKg, dry_kg: record.dryKg, hazardous_kg: record.hazardousKg,
      segregation_score: record.segregationScore, credits_earned: record.creditsEarned,
      co2_saved_kg: record.co2SavedKg, scanned_by: record.scannedBy,
    })
    .select().single()
  if (error) err(error)
  return data!
}

// ── Carbon Wallet ─────────────────────────────────────────────

export async function getCarbonWallet(citizenId: string): Promise<CarbonWallet | null> {
  if (isMock) {
    const { carbonWalletData } = await import('./mockData')
    return {
      citizen_id: citizenId, total_credits: carbonWalletData.totalCredits,
      wallet_balance: carbonWalletData.walletBalance, trees_saved: carbonWalletData.treesSaved,
      energy_saved_kwh: 840, co2_saved_kg: 2400, updated_at: new Date().toISOString(),
    }
  }
  const { data, error } = await supabase
    .from('carbon_wallets').select('*').eq('citizen_id', citizenId).single()
  if (error) err(error)
  return data
}

export async function getCarbonMonthlyChart(citizenId: string): Promise<CarbonWalletMonthly[]> {
  if (isMock) {
    const { carbonWalletData } = await import('./mockData')
    return carbonWalletData.monthlyChart.map((m, i) => ({
      id: String(i), citizen_id: citizenId, month: m.month, year: 2026, credits: m.credits,
    }))
  }
  const { data, error } = await supabase
    .from('carbon_wallet_monthly').select('*').eq('citizen_id', citizenId).order('year').order('month')
  if (error) err(error)
  return data ?? []
}

// ── Marketplace ───────────────────────────────────────────────

export async function getMarketplaceBrands(): Promise<MarketplaceBrand[]> {
  if (isMock) {
    const { carbonMarketplaceData } = await import('./mockData')
    return carbonMarketplaceData.brands.map((b, i) => ({
      id: String(i), name: b.name, category: b.category,
      credits_required: b.creditsRequired, cash_value: b.cashValue,
      voucher_label: b.voucherLabel, logo_url: null, is_active: true,
      created_at: new Date().toISOString(),
    }))
  }
  const { data, error } = await supabase
    .from('marketplace_brands').select('*').eq('is_active', true).order('credits_required')
  if (error) err(error)
  return data ?? []
}

export async function redeemVoucher(citizenId: string, brandId: string, brand: MarketplaceBrand): Promise<Voucher> {
  if (isMock) {
    return {
      id: 'mock', citizen_id: citizenId, brand_id: brandId,
      code: 'ECO-MOCK-0000', label: brand.voucher_label,
      credits_spent: brand.credits_required, cash_value: brand.cash_value,
      expires_at: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      used_at: null, created_at: new Date().toISOString(),
    }
  }
  const wallet = await getCarbonWallet(citizenId)
  if (!wallet || wallet.total_credits < brand.credits_required) throw new Error('Insufficient carbon credits')
  await supabase.from('carbon_wallets')
    .update({ total_credits: wallet.total_credits - brand.credits_required })
    .eq('citizen_id', citizenId)
  const code = `ECO-${brand.name.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const { data, error } = await supabase.from('vouchers').insert({
    citizen_id: citizenId, brand_id: brandId, code, label: brand.voucher_label,
    credits_spent: brand.credits_required, cash_value: brand.cash_value,
    expires_at: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  }).select().single()
  if (error) err(error)
  return data!
}

export async function getMyVouchers(citizenId: string): Promise<Voucher[]> {
  if (isMock) {
    const { carbonMarketplaceData } = await import('./mockData')
    return carbonMarketplaceData.activeVouchers.map((v, i) => ({
      id: String(i), citizen_id: citizenId, brand_id: String(i),
      code: v.code, label: v.label, credits_spent: 0, cash_value: 0,
      expires_at: v.expiry, used_at: null, created_at: new Date().toISOString(),
    }))
  }
  const { data, error } = await supabase
    .from('vouchers').select('*').eq('citizen_id', citizenId).is('used_at', null).order('expires_at')
  if (error) err(error)
  return data ?? []
}

// ── Municipal Queue ───────────────────────────────────────────

export async function getMunicipalQueue(city = 'Indore'): Promise<(MunicipalPickupQueue & { pickup_requests: PickupRequest })[]> {
  if (isMock) {
    const { municipalPickupQueue } = await import('./mockData')
    return municipalPickupQueue.map(q => ({
      id: q.id, pickup_id: q.id, city,
      assigned_truck_id: q.assignedTruck || null,
      display_time: q.time, queued_at: new Date().toISOString(), resolved_at: null,
      pickup_requests: {
        id: q.id, citizen_id: q.citizenName, waste_type: q.wasteType as WasteType,
        status: 'Requested' as PickupStatus, date: new Date().toISOString().slice(0, 10),
        time_window: q.time, address: q.address, whatsapp_opted: false,
        is_subscription: false, frequency: null, collector_id: null,
        truck_id: q.assignedTruck || null, eta_minutes: null,
        requested_at: new Date().toISOString(), confirmed_at: null,
        collected_at: null, updated_at: new Date().toISOString(),
      },
    })) as never
  }
  const { data, error } = await supabase
    .from('municipal_pickup_queue')
    .select('*, pickup_requests(*)')
    .eq('city', city)
    .is('resolved_at', null)
    .order('queued_at', { ascending: false })
  if (error) err(error)
  return (data as never) ?? []
}

export async function assignTruckToQueue(queueId: string, truckId: string) {
  if (isMock) return
  const { error } = await supabase
    .from('municipal_pickup_queue').update({ assigned_truck_id: truckId }).eq('id', queueId)
  if (error) err(error)
}

// ── Municipal Alerts ──────────────────────────────────────────

export async function getMunicipalAlerts(city = 'Indore'): Promise<MunicipalAlert[]> {
  if (isMock) {
    const { municipalData } = await import('./mockData')
    return municipalData.alerts.map((a, i) => ({
      id: String(i), city, type: a.type as never, title: a.title,
      location: a.location, is_read: false, created_at: new Date().toISOString(),
    }))
  }
  const { data, error } = await supabase
    .from('municipal_alerts').select('*').eq('city', city)
    .order('created_at', { ascending: false }).limit(20)
  if (error) err(error)
  return data ?? []
}

// ── Waste Timeline ────────────────────────────────────────────

export async function getWasteTimeline(city = 'Indore'): Promise<WasteTimeline[]> {
  if (isMock) {
    const { wasteTimelineData } = await import('./mockData')
    return wasteTimelineData.map((d, i) => ({
      id: String(i), city, recorded_date: new Date().toISOString().slice(0, 10),
      day_label: d.day, recyclable_kg: d.recyclable, biodegradable_kg: d.biodegradable,
      hazardous_kg: d.hazardous, mixed_kg: d.mixed, predicted_kg: d.predicted,
    }))
  }
  const { data, error } = await supabase
    .from('waste_timeline').select('*').eq('city', city)
    .order('recorded_date', { ascending: false }).limit(7)
  if (error) err(error)
  return (data ?? []).reverse()
}

// ── AI Predictions ────────────────────────────────────────────

export async function getAiPredictions(city = 'Indore'): Promise<AiPrediction[]> {
  if (isMock) {
    const { predictData } = await import('./mockData')
    return predictData.predictions.map((p, i) => ({
      id: String(i), city, text: p.text, confidence: p.confidence,
      impact: p.impact as never, action: p.action, expires_at: null,
      created_at: new Date().toISOString(),
    }))
  }
  const { data, error } = await supabase
    .from('ai_predictions').select('*').eq('city', city).order('confidence', { ascending: false })
  if (error) err(error)
  return data ?? []
}

// ── ESG Market ────────────────────────────────────────────────

export async function getEsgBuyers(city = 'Indore'): Promise<EsgCorporateBuyer[]> {
  if (isMock) {
    const { esgMarketData } = await import('./mockData')
    return esgMarketData.corporateBuyers.map(b => ({
      id: String(b.id), company: b.company, city,
      credits_wanted: b.creditsWanted, price_per_credit: b.pricePerCredit,
      total_value: b.totalValue, status: b.status as EsgBuyerStatus,
      reviewed_by: null, reviewed_at: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }))
  }
  const { data, error } = await supabase
    .from('esg_corporate_buyers').select('*').eq('city', city)
    .order('created_at', { ascending: false })
  if (error) err(error)
  return data ?? []
}

export async function updateEsgBuyerStatus(buyerId: string, status: EsgBuyerStatus, reviewedBy?: string) {
  if (isMock) return
  const { error } = await supabase
    .from('esg_corporate_buyers')
    .update({ status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() })
    .eq('id', buyerId)
  if (error) err(error)
}

export async function getEsgTransactions(city = 'Indore'): Promise<(EsgTransaction & { esg_corporate_buyers: Pick<EsgCorporateBuyer, 'company'> })[]> {
  if (isMock) {
    const { esgMarketData } = await import('./mockData')
    return esgMarketData.recentTransactions.map((t, i) => ({
      id: String(i), buyer_id: String(i), city,
      credits_sold: t.credits, price_per_credit: t.value / t.credits, total_value: t.value,
      transacted_at: new Date().toISOString(), esg_corporate_buyers: { company: t.company },
    }))
  }
  const { data, error } = await supabase
    .from('esg_transactions').select('*, esg_corporate_buyers(company)')
    .eq('city', city).order('transacted_at', { ascending: false }).limit(10)
  if (error) err(error)
  return (data as never) ?? []
}

// ── Leaderboard ───────────────────────────────────────────────

export async function getLeaderboard(city = 'Indore'): Promise<LeaderboardRow[]> {
  if (isMock) {
    const { leaderboardData } = await import('./mockData')
    return leaderboardData.map(l => ({
      citizen_id: String(l.rank), full_name: l.name, society: l.society,
      city, total_credits: l.points, rank: l.rank,
    }))
  }
  const { data, error } = await supabase
    .from('leaderboard_view').select('*').eq('city', city).order('rank').limit(50)
  if (error) err(error)
  return data ?? []
}

// ── Reports ───────────────────────────────────────────────────

export const generateReport = async (type: string, period: string, userId?: string) => {
  if (isMock || !userId) {
    await new Promise(r => setTimeout(r, 2000))
    return { success: true, reportId: 'RPT-2026-0301', downloadUrl: '#' }
  }
  const { data, error } = await supabase.from('reports').insert({
    generated_by: userId, type, title: `${type} — ${period}`, period, status: 'Processing',
  }).select().single()
  if (error) err(error)
  return { success: true, reportId: data!.id, downloadUrl: data!.download_url }
}

export async function getMyReports(userId: string) {
  if (isMock) {
    const { recentReports } = await import('./mockData')
    return recentReports
  }
  const { data, error } = await supabase
    .from('reports').select('*').eq('generated_by', userId)
    .order('created_at', { ascending: false })
  if (error) err(error)
  return data ?? []
}

// ── Realtime subscriptions ────────────────────────────────────

export function subscribeMunicipalQueue(city: string, onUpdate: () => void) {
  return supabase
    .channel('municipal-queue')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'municipal_pickup_queue', filter: `city=eq.${city}` },
      onUpdate)
    .subscribe()
}

export function subscribePickupStatus(pickupId: string, onUpdate: (row: PickupRequest) => void) {
  return supabase
    .channel(`pickup-${pickupId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'pickup_requests', filter: `id=eq.${pickupId}` },
      payload => onUpdate(payload.new as PickupRequest))
    .subscribe()
}