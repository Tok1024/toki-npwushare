export interface CourseFeedbackEntry {
  id: number
  liked: boolean
  difficulty: number | null
  comment?: string | null
  created: string
  updated: string
  user: {
    id: number
    name: string
    avatar?: string | null
  }
}

export interface CourseFeedbackResponse {
  stats: {
    heartCount: number
    difficultyAvg: number
    difficultyVotes: number
  }
  feedbacks: CourseFeedbackEntry[]
  mine?: CourseFeedbackEntry | null
}
