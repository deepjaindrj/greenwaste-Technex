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
  LeaderboardRow, WasteType, PickupStatus, EsgBuyerStatus, SubscriptionFrequency,
} from './database.types'

const API_BASE = 'http://localhost:8000'

const isMock =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('YOUR_PROJECT_ID')

function err(e: unknown): never {
  if (e && typeof e === 'object' && 'message' in e) {
    const sb = e as { message: string; code?: string; details?: string; hint?: string }
    throw new Error(`[Supabase] ${sb.message}${sb.details ? ' | ' + sb.details : ''}${sb.hint ? ' | hint: ' + sb.hint : ''} (code: ${sb.code})`)
  }
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
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
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

  // Generate a collision-proof ID client-side.
  // The DB's generate_pickup_id() RPC reads MAX(id) without a lock so
  // concurrent calls return the same value → 409. Using Date.now() (ms)
  // as the suffix guarantees uniqueness even under rapid submission.
  const makeId = () => {
    const d = new Date()
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
    return `PKP-${ds}-${String(Date.now()).slice(-6)}`
  }

  // Attempt insert, retry once with a fresh ID on 409 conflict.
  const tryInsert = async (id: string) => supabase
    .from('pickup_requests')
    .insert({
      id,
      citizen_id: payload.citizenId,
      waste_type: payload.wasteType,
      date: payload.date,
      time_window: payload.timeWindow,
      address: payload.address ?? null,
      whatsapp_opted: payload.whatsappOpted ?? false,
      is_subscription: payload.isSubscription ?? false,
      frequency: (payload.frequency ?? null) as SubscriptionFrequency | null,
      status: 'Requested' as PickupStatus,
      requested_at: new Date().toISOString(),
    })
    .select()
    .single()

  let id = makeId()
  let { data, error } = await tryInsert(id)

  if (error && (error as any).code === '23505') {
    // duplicate key — wait 2 ms and retry with a fresh ID
    await new Promise(r => setTimeout(r, 2))
    id = makeId()
    ;({ data, error } = await tryInsert(id))
  }

  if (error) err(error)

  // Safety net: ensure the pickup lands in the municipal queue.
  // The DB trigger (enqueue_pickup) should do this, but if RLS blocks it
  // or the trigger is missing, insert manually.
  try {
    const { data: existsInQueue } = await supabase
      .from('municipal_pickup_queue')
      .select('id')
      .eq('pickup_id', id)
      .maybeSingle()
    if (!existsInQueue) {
      await supabase.from('municipal_pickup_queue').insert({
        pickup_id: id,
        city: 'Indore',
        display_time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      })
    }
  } catch { /* best-effort */ }

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
    .from('carbon_wallets').select('*').eq('citizen_id', citizenId).maybeSingle()
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

export async function getMunicipalQueue(city = 'Indore') {
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
        profiles: { full_name: q.citizenName },
      },
    })) as any[]
  }
  const { data, error } = await supabase
    .from('municipal_pickup_queue')
    .select('*, pickup_requests(*, profiles!pickup_requests_citizen_id_fkey(full_name))')
    .eq('city', city)
    .is('resolved_at', null)
    .order('queued_at', { ascending: false })
  if (error) err(error)
  return (data as any[]) ?? []
}

export async function assignTruckToQueue(queueId: string, truckId: string) {
  if (isMock) return
  // Update the queue row
  const { data: qRow } = await supabase
    .from('municipal_pickup_queue').select('pickup_id').eq('id', queueId).maybeSingle()
  const { error } = await supabase
    .from('municipal_pickup_queue').update({ assigned_truck_id: truckId }).eq('id', queueId)
  if (error) err(error)
  // Also update the pickup_request itself (assign truck + change status to Confirmed)
  if (qRow?.pickup_id) {
    await supabase.from('pickup_requests').update({
      truck_id: truckId,
      status: 'Confirmed' as PickupStatus,
      confirmed_at: new Date().toISOString(),
    }).eq('id', qRow.pickup_id)
  }
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

// ── Profile Update ────────────────────────────────────────────

export async function updateProfile(userId: string, updates: {
  full_name?: string; phone?: string; city?: string; society?: string; ward?: string; avatar_url?: string
}) {
  if (isMock) return
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) err(error)
}

// ── Zones ─────────────────────────────────────────────────────

export async function getZones(city = 'Indore') {
  if (isMock) {
    const { municipalData } = await import('./mockData')
    return municipalData.forecast.map((z, i) => ({
      id: String(i), name: z.zone, city, ward: null, is_active: true, created_at: new Date().toISOString(),
    }))
  }
  const { data, error } = await supabase
    .from('zones').select('*').eq('city', city).eq('is_active', true).order('name')
  if (error) err(error)
  return data ?? []
}

// ── Trucks ────────────────────────────────────────────────────

export async function getTrucks() {
  if (isMock) {
    const { municipalData } = await import('./mockData')
    return municipalData.trucks.map(t => ({
      id: t.id, zone_id: null, status: t.status as 'Active' | 'Idle' | 'Delayed' | 'Maintenance',
      collected_kg: parseFloat(t.collected.replace('t', '')) * 1000,
      driver_name: null, driver_phone: null, last_active: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }))
  }
  const { data, error } = await supabase.from('trucks').select('*').order('id')
  if (error) err(error)
  return data ?? []
}

// ── Zone Forecast ─────────────────────────────────────────────

export async function getZoneForecast(city = 'Indore') {
  if (isMock) {
    const { municipalData } = await import('./mockData')
    return municipalData.forecast.map((z, i) => ({
      id: String(i), zone_id: String(i), week_start: new Date().toISOString().slice(0, 10),
      mon_kg: z.mon, tue_kg: z.tue, wed_kg: z.wed, thu_kg: z.thu,
      fri_kg: z.fri, sat_kg: z.sat, sun_kg: z.sun,
      zones: { name: z.zone },
    }))
  }
  const { data, error } = await supabase
    .from('zone_forecast')
    .select('*, zones(name)')
    .order('week_start', { ascending: false })
    .limit(20)
  if (error) err(error)
  // Filter by city via zones join
  return (data ?? []).filter((r: any) => r.zones)
}

// ── All Pickup Requests (municipal) ───────────────────────────

export async function getAllPickups(city = 'Indore') {
  if (isMock) {
    const { municipalPickupQueue } = await import('./mockData')
    return municipalPickupQueue as any[]
  }
  const { data, error } = await supabase
    .from('pickup_requests')
    .select('*, profiles!pickup_requests_citizen_id_fkey(full_name, city, society)')
    .order('requested_at', { ascending: false })
    .limit(50)
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


// ── Truck Driver ──────────────────────────────────────────────

/** Get all pickups assigned to a specific truck that are not yet complete */
export async function getAssignedPickups(truckId: string): Promise<(PickupRequest & { profiles?: { full_name: string } })[]> {
  if (isMock) {
    const { municipalPickupQueue } = await import('./mockData')
    return municipalPickupQueue
      .filter(q => q.assignedTruck === truckId)
      .map(q => ({
        id: q.id, citizen_id: 'mock', status: 'Confirmed' as PickupStatus,
        waste_type: q.wasteType as WasteType, date: new Date().toISOString().slice(0, 10),
        time_window: '8:00 – 10:00 AM', address: q.address, whatsapp_opted: false,
        is_subscription: false, frequency: null, collector_id: null,
        truck_id: truckId, eta_minutes: null,
        requested_at: new Date().toISOString(), confirmed_at: new Date().toISOString(),
        collected_at: null, updated_at: new Date().toISOString(),
        profiles: { full_name: q.citizenName },
      }))
  }
  const { data, error } = await supabase
    .from('pickup_requests')
    .select('*, profiles!pickup_requests_citizen_id_fkey(full_name)')
    .eq('truck_id', truckId)
    .in('status', ['Confirmed', 'En Route', 'Collecting'])
    .order('confirmed_at', { ascending: true })
  if (error) err(error)
  return (data as any[]) ?? []
}

/** Truck driver starts route — mark pickup as "En Route" */
export async function startRoute(pickupId: string) {
  if (isMock) return
  const { error } = await supabase
    .from('pickup_requests')
    .update({ status: 'En Route' as PickupStatus })
    .eq('id', pickupId)
  if (error) err(error)
}

/** Truck driver arrives and starts collecting */
export async function startCollecting(pickupId: string) {
  if (isMock) return
  const { error } = await supabase
    .from('pickup_requests')
    .update({ status: 'Collecting' as PickupStatus })
    .eq('id', pickupId)
  if (error) err(error)
}

/** Simulated AI waste analysis from photo
 *  In production, this would call a YOLO model backend.
 *  For now, generates realistic waste breakdown based on waste type. */
export async function analyzeWastePhoto(_imageFile: File, wasteType: WasteType): Promise<{
  wetKg: number; dryKg: number; hazardousKg: number; totalKg: number
  segregationScore: number; creditsEarned: number; co2SavedKg: number
  items: { name: string; category: string; weight: number }[]
}> {
  // Simulate processing delay
  await new Promise(r => setTimeout(r, 2000))

  const base = 3 + Math.random() * 7 // 3–10 kg total
  let wetKg: number, dryKg: number, hazardousKg: number

  switch (wasteType) {
    case 'Wet':
      wetKg = +(base * 0.75).toFixed(1)
      dryKg = +(base * 0.2).toFixed(1)
      hazardousKg = +(base * 0.05).toFixed(1)
      break
    case 'Dry':
      wetKg = +(base * 0.1).toFixed(1)
      dryKg = +(base * 0.85).toFixed(1)
      hazardousKg = +(base * 0.05).toFixed(1)
      break
    case 'Hazardous':
      wetKg = +(base * 0.1).toFixed(1)
      dryKg = +(base * 0.15).toFixed(1)
      hazardousKg = +(base * 0.75).toFixed(1)
      break
    default: // Mixed
      wetKg = +(base * 0.4).toFixed(1)
      dryKg = +(base * 0.45).toFixed(1)
      hazardousKg = +(base * 0.15).toFixed(1)
  }

  const totalKg = +(wetKg + dryKg + hazardousKg).toFixed(1)
  const segregationScore = Math.floor(60 + Math.random() * 35) // 60–95
  const creditsEarned = Math.floor(totalKg * segregationScore / 10)
  const co2SavedKg = +(totalKg * 0.8).toFixed(1) // ~0.8 kg CO₂ per kg recycled

  const itemPool: Record<string, { name: string; category: string }[]> = {
    Wet: [
      { name: 'Food scraps', category: 'Organic' },
      { name: 'Vegetable peels', category: 'Organic' },
      { name: 'Tea leaves', category: 'Organic' },
      { name: 'Fruit rinds', category: 'Organic' },
    ],
    Dry: [
      { name: 'PET bottles', category: 'Recyclable' },
      { name: 'Cardboard', category: 'Recyclable' },
      { name: 'Newspaper', category: 'Recyclable' },
      { name: 'Plastic bags', category: 'Recyclable' },
    ],
    Hazardous: [
      { name: 'Battery cells', category: 'E-waste' },
      { name: 'Paint cans', category: 'Hazardous' },
      { name: 'Medicine strips', category: 'Biomedical' },
    ],
    Mixed: [
      { name: 'Food scraps', category: 'Organic' },
      { name: 'PET bottles', category: 'Recyclable' },
      { name: 'Cardboard', category: 'Recyclable' },
      { name: 'Plastic bags', category: 'Recyclable' },
      { name: 'Cloth rags', category: 'Non-recyclable' },
    ],
  }

  const pool = itemPool[wasteType] || itemPool.Mixed
  const items = pool.map(p => ({
    ...p,
    weight: +(totalKg / pool.length * (0.6 + Math.random() * 0.8)).toFixed(1),
  }))

  return { wetKg, dryKg, hazardousKg, totalKg, segregationScore, creditsEarned, co2SavedKg, items }
}

/** Complete a pickup: record collection → carbon credits auto-added via DB trigger */
export async function completePickup(pickupId: string, citizenId: string, analysis: {
  wetKg: number; dryKg: number; hazardousKg: number
  segregationScore: number; creditsEarned: number; co2SavedKg: number
}, scannedBy?: string): Promise<CollectionRecord | null> {
  if (isMock) {
    return { id: 'mock-col', pickup_id: pickupId, citizen_id: citizenId,
      date: new Date().toISOString().slice(0, 10),
      wet_kg: analysis.wetKg, dry_kg: analysis.dryKg, hazardous_kg: analysis.hazardousKg,
      total_kg: analysis.wetKg + analysis.dryKg + analysis.hazardousKg,
      segregation_score: analysis.segregationScore, credits_earned: analysis.creditsEarned,
      co2_saved_kg: analysis.co2SavedKg, scanned_by: scannedBy ?? null,
      created_at: new Date().toISOString() }
  }

  // 1. Insert collection record (triggers wallet update automatically)
  // Note: scanned_by must be a profile UUID – skip if caller passes a truck-code string
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const validScannedBy = scannedBy && UUID_RE.test(scannedBy) ? scannedBy : undefined
  const { data, error } = await supabase.from('collection_records').insert({
    pickup_id: pickupId,
    citizen_id: citizenId,
    date: new Date().toISOString().slice(0, 10),
    wet_kg: analysis.wetKg,
    dry_kg: analysis.dryKg,
    hazardous_kg: analysis.hazardousKg,
    segregation_score: analysis.segregationScore,
    credits_earned: analysis.creditsEarned,
    co2_saved_kg: analysis.co2SavedKg,
    ...(validScannedBy ? { scanned_by: validScannedBy } : {}),
  }).select().single()
  if (error) err(error)

  // 2. Mark pickup as Complete
  await supabase.from('pickup_requests').update({
    status: 'Complete' as PickupStatus,
    collected_at: new Date().toISOString(),
  }).eq('id', pickupId)

  // 3. Resolve the queue entry
  await supabase.from('municipal_pickup_queue').update({
    resolved_at: new Date().toISOString(),
  }).eq('pickup_id', pickupId)

  return data
}
