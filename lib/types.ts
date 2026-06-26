export interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
}

export interface DatePlan {
  id: string
  user_id: string
  title: string
  description: string
  mood: string
  date: string
  time?: string
  location?: string
  created_at: string
}

export type Mood = 'romantic' | 'relaxed' | 'adventurous' | 'fun' | 'cozy'

export interface Photo {
  id: string
  user_id: string
  date_id?: string
  image_url: string
  caption: string
  created_at: string
}

export interface BudgetItem {
  id: string
  user_id: string
  date_id?: string
  amount: number
  note: string
  category: string
  created_at: string
}

export interface Challenge {
  id: string
  user_id: string
  title: string
  description: string
  status: 'pending' | 'completed'
  frequency: 'daily' | 'weekly' | 'once'
  created_at: string
}

export interface SecretNote {
  id: string
  user_id: string
  content: string
  unlock_time: string
  is_unlocked?: boolean
  created_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  date: string
  type: 'anniversary' | 'birthday' | 'date' | 'other'
  reminder: boolean
  color?: string
}

export interface ProgressMetric {
  id: string
  user_id: string
  metric: string
  value: number
  icon?: string
  updated_at?: string
}

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export interface Restaurant {
  id: string
  name: string
  category: string
  address: string
  rating: number
  image_url?: string
  maps_url: string
  price_range: string
}

export interface GiftIdea {
  id: string
  title: string
  description: string
  price_range: string
  occasion: string
  emoji: string
}

export type QuizQuestion = {
  id: number
  question: string
  options: string[]
  correctIndex?: number
}
