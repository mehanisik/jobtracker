export interface Job {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: string;
  location?: string | null;
  remote?: boolean | null;
  salary_range?: string | null;
  description?: string | null;
  url?: string | null;
  source?: string | null;
  source_url?: string | null;
  technologies?: string[] | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_id?: string | null;
  status: string;
  applied_at: string;
  company_name: string;
  position_title: string;
  date_applied: string;
  response_date?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Interview {
  id: string;
  user_id: string;
  application_id: string;
  interviewer?: string | null;
  interview_date: string;
  interview_type: string;
  status: string;
  notes?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Document {
  id: string;
  user_id: string;
  application_id?: string | null;
  name: string;
  type: string;
  url: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Task {
  id: string;
  user_id: string;
  application_id?: string | null;
  title: string;
  task_name?: string; // Adding alias for consistency
  description?: string | null;
  status: string;
  priority: string;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Question {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface QuestionCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface QuestionProgress {
  id: string;
  user_id: string;
  question_id: string;
  status: 'solved' | 'attempted' | 'not started' | null;
  times_solved?: number | null;
  last_solved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyPlanQuestion {
  id: string;
  plan_id: string;
  question_id: string;
  order: number;
}

export interface StudySession {
  id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  ended_at?: string | null;
  created_at: string;
}
