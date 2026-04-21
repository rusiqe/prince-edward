export type Campaign = {
  id: string
  school_id: string
  title: string
  description: string
  goal_amount: number
  raised_amount: number
  deadline: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
}

export type CampaignDonation = {
  id: string
  campaign_id: string
  donor_id: string
  amount: number
  stripe_payment_id: string
  anonymous: boolean
  message: string | null
  created_at: string
}

export type Ad = {
  id: string
  parent_id: string
  school_id: string
  business_name: string
  logo_url: string | null
  description: string
  reach: 'school' | 'city' | 'region'
  status: 'pending' | 'approved' | 'rejected'
  expires_at: string
  created_at: string
}

export type DeveloperDonation = {
  id: string
  user_id: string
  amount: number
  stripe_payment_id: string
  created_at: string
}
