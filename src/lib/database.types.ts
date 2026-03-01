// ============================================================
// Supabase Database Types — auto-reflects schema.sql
// ============================================================

export type PortalType = 'citizen' | 'municipal'
export type PickupStatus = 'Requested' | 'Confirmed' | 'En Route' | 'Collecting' | 'Complete' | 'Cancelled'
export type WasteType = 'Wet' | 'Dry' | 'Mixed' | 'Hazardous'
export type TruckStatus = 'Active' | 'Idle' | 'Delayed' | 'Maintenance'
export type EsgBuyerStatus = 'Pending' | 'Approved' | 'Rejected'
export type ReportStatus = 'Generated' | 'Processing' | 'Scheduled' | 'Failed'
export type AlertType = 'overflow' | 'segregation' | 'delay' | 'milestone'
export type ImpactLevel = 'high' | 'medium' | 'low'
export type SubscriptionFrequency = 'Daily' | 'Weekly' | 'Monthly'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  portal: PortalType
  city: string
  society: string | null
  ward: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Zone {
  id: string
  name: string
  city: string
  ward: string | null
  is_active: boolean
  created_at: string
}

export interface Truck {
  id: string           // 'MP-201'
  zone_id: string | null
  status: TruckStatus
  collected_kg: number
  driver_name: string | null
  driver_phone: string | null
  last_active: string | null
  created_at: string
  updated_at: string
}

export interface PickupRequest {
  id: string           // 'PKP-2026-0301-001'
  citizen_id: string
  status: PickupStatus
  waste_type: WasteType
  date: string         // ISO date
  time_window: string
  address: string | null
  whatsapp_opted: boolean
  is_subscription: boolean
  frequency: SubscriptionFrequency | null
  collector_id: string | null
  truck_id: string | null
  eta_minutes: number | null
  requested_at: string
  confirmed_at: string | null
  collected_at: string | null
  updated_at: string
}

export interface CollectionRecord {
  id: string
  pickup_id: string
  citizen_id: string
  date: string
  wet_kg: number
  dry_kg: number
  hazardous_kg: number
  total_kg: number      // computed
  segregation_score: number
  credits_earned: number
  co2_saved_kg: number
  scanned_by: string | null
  created_at: string
}

export interface CarbonWallet {
  citizen_id: string
  total_credits: number
  wallet_balance: number
  trees_saved: number
  energy_saved_kwh: number
  co2_saved_kg: number
  updated_at: string
}

export interface CarbonWalletMonthly {
  id: string
  citizen_id: string
  month: string
  year: number
  credits: number
}

export interface MarketplaceBrand {
  id: string
  name: string
  category: string
  credits_required: number
  cash_value: number
  voucher_label: string
  logo_url: string | null
  is_active: boolean
  created_at: string
}

export interface Voucher {
  id: string
  citizen_id: string
  brand_id: string
  code: string
  label: string
  credits_spent: number
  cash_value: number
  expires_at: string
  used_at: string | null
  created_at: string
}

export interface MunicipalPickupQueue {
  id: string
  pickup_id: string
  city: string
  assigned_truck_id: string | null
  display_time: string | null
  queued_at: string
  resolved_at: string | null
}

export interface MunicipalAlert {
  id: string
  city: string
  type: AlertType
  title: string
  location: string | null
  is_read: boolean
  created_at: string
}

export interface WasteTimeline {
  id: string
  city: string
  recorded_date: string
  day_label: string
  recyclable_kg: number
  biodegradable_kg: number
  hazardous_kg: number
  mixed_kg: number
  predicted_kg: number | null
}

export interface ZoneForecast {
  id: string
  zone_id: string
  week_start: string
  mon_kg: number
  tue_kg: number
  wed_kg: number
  thu_kg: number
  fri_kg: number
  sat_kg: number
  sun_kg: number
}

export interface AiPrediction {
  id: string
  city: string
  text: string
  confidence: number
  impact: ImpactLevel
  action: string | null
  expires_at: string | null
  created_at: string
}

export interface EsgCorporateBuyer {
  id: string
  company: string
  city: string
  credits_wanted: number
  price_per_credit: number
  total_value: number   // computed
  status: EsgBuyerStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface EsgTransaction {
  id: string
  buyer_id: string
  city: string
  credits_sold: number
  price_per_credit: number
  total_value: number   // computed
  transacted_at: string
}

export interface Report {
  id: string
  generated_by: string
  type: string
  title: string
  period: string
  status: ReportStatus
  download_url: string | null
  created_at: string
}

export interface ScanSession {
  id: string
  citizen_id: string | null
  image_url: string | null
  segregation_score: number | null
  co2_landfill_kg: number | null
  co2_recycled_kg: number | null
  recommendation: string | null
  created_at: string
}

export interface ScanItem {
  id: string
  session_id: string
  name: string
  category: string
  confidence: number
  co2_impact: string | null
  disposal_instruction: string | null
  created_at: string
}

export interface LeaderboardRow {
  citizen_id: string
  full_name: string
  society: string | null
  city: string
  total_credits: number
  rank: number
}

// ---- Supabase DB type map (for typed client) ----
// Formatted for @supabase/supabase-js v2.45+ which requires Enums + CompositeTypes

type Rls = []  // shorthand for Relationships: []

export type Database = {
  public: {
    Tables: {
      profiles:               { Row: Profile;              Insert: Omit<Profile, 'created_at' | 'updated_at' | 'avatar_url' | 'phone' | 'society' | 'ward'> & { phone?: string | null; society?: string | null; ward?: string | null; avatar_url?: string | null }; Update: Partial<Profile>; Relationships: Rls }
      zones:                  { Row: Zone;                 Insert: Omit<Zone, 'id' | 'created_at'>;            Update: Partial<Zone>;              Relationships: Rls }
      trucks:                 { Row: Truck;                Insert: Omit<Truck, 'created_at' | 'updated_at'>;   Update: Partial<Truck>;             Relationships: Rls }
      pickup_requests:        { Row: PickupRequest;        Insert: Omit<PickupRequest, 'updated_at'>;          Update: Partial<PickupRequest>;     Relationships: Rls }
      collection_records:     { Row: CollectionRecord;     Insert: Omit<CollectionRecord, 'id' | 'total_kg' | 'created_at'>; Update: Partial<CollectionRecord>; Relationships: Rls }
      carbon_wallets:         { Row: CarbonWallet;         Insert: Omit<CarbonWallet, 'updated_at'>;           Update: Partial<CarbonWallet>;      Relationships: Rls }
      carbon_wallet_monthly:  { Row: CarbonWalletMonthly;  Insert: Omit<CarbonWalletMonthly, 'id'>;            Update: Partial<CarbonWalletMonthly>; Relationships: Rls }
      marketplace_brands:     { Row: MarketplaceBrand;     Insert: Omit<MarketplaceBrand, 'id' | 'created_at'>; Update: Partial<MarketplaceBrand>; Relationships: Rls }
      vouchers:               { Row: Voucher;              Insert: Omit<Voucher, 'id' | 'created_at'>;         Update: Partial<Voucher>;           Relationships: Rls }
      municipal_pickup_queue: { Row: MunicipalPickupQueue; Insert: Omit<MunicipalPickupQueue, 'id' | 'queued_at'>; Update: Partial<MunicipalPickupQueue>; Relationships: Rls }
      municipal_alerts:       { Row: MunicipalAlert;       Insert: Omit<MunicipalAlert, 'id' | 'created_at'>; Update: Partial<MunicipalAlert>;     Relationships: Rls }
      waste_timeline:         { Row: WasteTimeline;        Insert: Omit<WasteTimeline, 'id'>;                  Update: Partial<WasteTimeline>;     Relationships: Rls }
      zone_forecast:          { Row: ZoneForecast;         Insert: Omit<ZoneForecast, 'id'>;                   Update: Partial<ZoneForecast>;      Relationships: Rls }
      ai_predictions:         { Row: AiPrediction;         Insert: Omit<AiPrediction, 'id' | 'created_at'>;   Update: Partial<AiPrediction>;      Relationships: Rls }
      esg_corporate_buyers:   { Row: EsgCorporateBuyer;    Insert: Omit<EsgCorporateBuyer, 'id' | 'total_value' | 'created_at' | 'updated_at'>; Update: Partial<EsgCorporateBuyer>; Relationships: Rls }
      esg_transactions:       { Row: EsgTransaction;       Insert: Omit<EsgTransaction, 'id' | 'total_value'>; Update: Partial<EsgTransaction>;   Relationships: Rls }
      reports:                { Row: Report;               Insert: Omit<Report, 'id' | 'created_at'>;          Update: Partial<Report>;            Relationships: Rls }
      scan_sessions:          { Row: ScanSession;          Insert: Omit<ScanSession, 'id' | 'created_at'>;     Update: Partial<ScanSession>;       Relationships: Rls }
      scan_items:             { Row: ScanItem;             Insert: Omit<ScanItem, 'id' | 'created_at'>;        Update: Partial<ScanItem>;          Relationships: Rls }
      leaderboard_history:    { Row: { id: string; citizen_id: string; month: string; year: number; credits: number; rank: number | null }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: Rls }
    }
    Views: {
      leaderboard_view: { Row: LeaderboardRow; Relationships: Rls }
      esg_revenue_stats: { Row: { city: string; credits_sold: number; total_revenue: number; companies_paid: number }; Relationships: Rls }
    }
    Functions: {
      generate_pickup_id: { Args: Record<never, never>; Returns: string }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
