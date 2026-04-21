export type School = {
  id: string
  name: string
  slug: string
  crest_url: string | null
  primary_colour: string
  secondary_colour: string
  city: string
  region: string
  created_at: string
}

export type SchoolInsert = Omit<School, 'id' | 'created_at'>
