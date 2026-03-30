// ─── Lesson Types ─────────────────────────────────────────────────────────────

export type LessonStatus = 'planned' | 'in_progress' | 'completed';
export type EngagementLevel = 'high' | 'medium' | 'low';
export type StarRating = 1 | 2 | 3 | 4 | 5;

export interface Activity {
  id: string;
  name: string;
  planned_duration: number; // minutes
  actual_duration?: number;
  notes: string;
  engagement_rating?: StarRating;
  students_understood: boolean;
  students_struggled: boolean;
  completed: boolean;
}

export interface EALSupport {
  strategies_used: string[];
  vocabulary_introduced: string[];
  student_understanding_level: 'low' | 'developing' | 'secure' | '';
  notes: string;
}

export interface SENSupport {
  accommodations_used: string[];
  behaviour_notes: string;
  engagement_notes: string;
  progress_notes: string;
}

export interface Differentiation {
  eal: EALSupport;
  sen: SENSupport;
  gifted_extension: string[];
}

export interface LessonTracking {
  start_time?: string;
  end_time?: string;
  overall_engagement: EngagementLevel;
  general_notes: string;
  activities_log: ActivityLog[];
}

export interface ActivityLog {
  activity_id: string;
  start_time?: string;
  end_time?: string;
  notes: string;
}

export interface FrameworkNotes {
  bfl: string;       // Behaviour for Learning
  sdt: string;       // Self-Determination Theory
  vygotsky: string;  // Zone of Proximal Development
}

export interface LessonReflection {
  what_worked_well: string;
  what_didnt_work: string;
  objectives_met: boolean | null;
  objectives_notes: string;
  next_steps: string;
  overall_rating: StarRating | null;
  framework_notes: FrameworkNotes;
}

export interface LessonAnalysis {
  effectiveness_score: number; // 0-100
  engagement_level: string;
  time_management_feedback: string;
  suggestions: string[];
  objectives_achievement: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  year_group: string;
  class_name: string;
  date: string;
  duration: number; // minutes
  status: LessonStatus;
  template_id?: string;
  created_at: string;
  updated_at: string;

  // Planning
  objectives: string[];
  success_criteria: string[];
  activities: Activity[];
  differentiation: Differentiation;
  resources: string[];

  // During lesson
  tracking: LessonTracking;

  // Reflection
  reflection: LessonReflection;

  // Analysis (computed)
  analysis?: LessonAnalysis;
}

// ─── Student Types ─────────────────────────────────────────────────────────────

export type EALLevel = 'new_to_english' | 'beginner' | 'developing' | 'secure' | 'fluent' | '';
export type NoteType = 'general' | 'progress' | 'concern' | 'achievement';

export interface VocabularyEntry {
  id: string;
  word: string;
  definition: string;
  date_introduced: string;
  mastered: boolean;
}

export interface StudentNote {
  id: string;
  date: string;
  lesson_id?: string;
  note: string;
  type: NoteType;
}

export interface Student {
  id: string;
  name: string;
  year_group: string;
  class_name: string;
  eal_level: EALLevel;
  sen_needs: string[];
  is_gifted: boolean;
  notes: StudentNote[];
  vocabulary: VocabularyEntry[];
  created_at: string;
  updated_at: string;
}

// ─── Template Types ────────────────────────────────────────────────────────────

export interface LessonTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  duration: number;
  objectives: string[];
  success_criteria: string[];
  activities: Omit<Activity, 'id'>[];
  differentiation: Partial<Differentiation>;
  resources: string[];
  is_builtin: boolean;
  created_at: string;
}

// ─── Report Types ──────────────────────────────────────────────────────────────

export type ReportType = 'lesson' | 'teacher_reflection' | 'student_support';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  generated_at: string;
  data: Record<string, unknown>;
}

// ─── App State ─────────────────────────────────────────────────────────────────

export interface AppState {
  lessons: Lesson[];
  students: Student[];
  templates: LessonTemplate[];
}

// ─── Dashboard Stats ───────────────────────────────────────────────────────────

export interface DashboardStats {
  totalLessons: number;
  completedLessons: number;
  avgEffectivenessScore: number;
  avgEngagement: string;
  lessonsThisWeek: number;
  studentsSupported: number;
  ealStudents: number;
  senStudents: number;
}
