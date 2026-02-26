export type SavedTemplate = {
  id: number
  template_slug: string
  template_data: Record<string, unknown>
  title: string
  description?: string
  category?: string
  created_at: string
  updated_at: string
}

export type CompetitorAlert = {
  id: number
  competitor_id: number
  alert_type: string
  severity: string
  title: string
  created_at: string | Date
}

export type CompetitiveOpportunity = {
  id: string
  competitor_id: number | string
  title: string
  opportunity_type: string
  impact: string
  created_at: string | Date
}


