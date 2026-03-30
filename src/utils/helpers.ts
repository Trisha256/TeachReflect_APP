import type { Lesson, LessonAnalysis, Student, EALLevel } from '../types';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';

// ─── ID Generation ─────────────────────────────────────────────────────────────
export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// ─── Lesson Analysis ───────────────────────────────────────────────────────────
export const analyseLessons = (lesson: Lesson): LessonAnalysis => {
  const suggestions: string[] = [];
  let score = 50; // Base score

  // Check objectives
  if (lesson.objectives.length > 0) score += 5;
  if (lesson.success_criteria.length > 0) score += 5;

  // Reflection quality
  const { reflection } = lesson;
  if (reflection.what_worked_well.trim().length > 20) score += 10;
  if (reflection.what_didnt_work.trim().length > 10) score += 5;
  if (reflection.next_steps.trim().length > 10) score += 5;
  if (reflection.objectives_met === true) score += 10;
  else if (reflection.objectives_met === false) score -= 5;

  // Activity tracking
  const completedActivities = lesson.activities.filter((a) => a.completed);
  const completionRate =
    lesson.activities.length > 0
      ? completedActivities.length / lesson.activities.length
      : 0;
  score += Math.round(completionRate * 15);

  // Engagement from activities
  const ratedActivities = lesson.activities.filter(
    (a) => a.engagement_rating !== undefined
  );
  const avgEngagementRating =
    ratedActivities.length > 0
      ? ratedActivities.reduce((sum, a) => sum + (a.engagement_rating ?? 0), 0) /
        ratedActivities.length
      : 0;
  if (avgEngagementRating >= 4) score += 10;
  else if (avgEngagementRating >= 3) score += 5;

  // Time management
  const activitiesWithTime = lesson.activities.filter(
    (a) => a.actual_duration !== undefined
  );
  let timeManagementFeedback = 'No time data recorded yet.';
  if (activitiesWithTime.length > 0) {
    const totalPlanned = activitiesWithTime.reduce(
      (s, a) => s + a.planned_duration,
      0
    );
    const totalActual = activitiesWithTime.reduce(
      (s, a) => s + (a.actual_duration ?? 0),
      0
    );
    const diff = totalActual - totalPlanned;
    if (Math.abs(diff) <= 5) {
      timeManagementFeedback = 'Excellent time management — lesson ran on schedule.';
      score += 5;
    } else if (diff > 5 && diff <= 15) {
      timeManagementFeedback = `Lesson ran ${diff} minutes over plan. Consider adjusting activity timings.`;
    } else if (diff > 15) {
      timeManagementFeedback = `Lesson ran ${diff} minutes over plan. Significant adjustment needed.`;
      suggestions.push(
        `Activities exceeded planned time by ${diff} minutes. Review activity complexity.`
      );
    } else if (diff < -5) {
      timeManagementFeedback = `Lesson finished ${Math.abs(diff)} minutes early. Consider extending key activities.`;
    }
  }

  // EAL support suggestions
  if (
    lesson.differentiation.eal.strategies_used.length === 0 &&
    lesson.differentiation.eal.notes.trim().length === 0
  ) {
    suggestions.push('Consider documenting EAL support strategies used in this lesson.');
  }

  // SEN support suggestions
  if (
    lesson.differentiation.sen.accommodations_used.length === 0 &&
    lesson.differentiation.sen.progress_notes.trim().length === 0
  ) {
    suggestions.push('Consider documenting SEN accommodations used in this lesson.');
  }

  // Overall engagement
  const engagementMap: Record<string, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  const engagementLevel =
    engagementMap[lesson.tracking.overall_engagement] || 'Not recorded';

  if (lesson.tracking.overall_engagement === 'low') {
    suggestions.push(
      'Engagement was low. Consider adding more interactive activities or varying teaching approaches.'
    );
  }

  // Activities with struggle
  const struggledActivities = lesson.activities.filter(
    (a) => a.students_struggled
  );
  if (struggledActivities.length > 0) {
    suggestions.push(
      `Students struggled with: ${struggledActivities.map((a) => a.name).join(', ')}. Plan additional support.`
    );
  }

  // Overall rating bonus
  if (reflection.overall_rating) {
    score = Math.round(score * (0.8 + reflection.overall_rating * 0.05));
  }

  // Objectives achievement
  const objectivesAchievement =
    reflection.objectives_met === true
      ? 'All learning objectives were met.'
      : reflection.objectives_met === false
      ? 'Learning objectives were not fully met. Review in next lesson.'
      : 'Objectives achievement not recorded.';

  if (suggestions.length === 0) {
    suggestions.push('Great lesson plan structure! Keep up the reflective practice.');
  }

  return {
    effectiveness_score: Math.min(100, Math.max(0, score)),
    engagement_level: engagementLevel,
    time_management_feedback: timeManagementFeedback,
    suggestions,
    objectives_achievement: objectivesAchievement,
  };
};

// ─── Score Color ───────────────────────────────────────────────────────────────
export const getScoreColor = (score: number): string => {
  if (score >= 75) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 75) return 'bg-green-50 border-green-200';
  if (score >= 50) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
};

// ─── EAL Level Label ──────────────────────────────────────────────────────────
export const ealLevelLabel: Record<EALLevel, string> = {
  '': 'Not applicable',
  new_to_english: 'New to English',
  beginner: 'Beginner',
  developing: 'Developing',
  secure: 'Secure',
  fluent: 'Fluent',
};

// ─── Date Helpers ──────────────────────────────────────────────────────────────
export const formatDate = (date: string): string => {
  try {
    return format(parseISO(date), 'dd MMM yyyy');
  } catch {
    return date;
  }
};

export const formatDateTime = (date: string): string => {
  try {
    return format(parseISO(date), 'dd MMM yyyy HH:mm');
  } catch {
    return date;
  }
};

export const isThisWeek = (dateStr: string): boolean => {
  try {
    const date = parseISO(dateStr);
    const now = new Date();
    return date >= startOfWeek(now) && date <= endOfWeek(now);
  } catch {
    return false;
  }
};

// ─── Default Factories ─────────────────────────────────────────────────────────
export const createDefaultLesson = (): Omit<Lesson, 'id' | 'created_at' | 'updated_at'> => ({
  title: '',
  subject: '',
  year_group: '',
  class_name: '',
  date: new Date().toISOString().split('T')[0],
  duration: 60,
  status: 'planned',
  objectives: [''],
  success_criteria: [''],
  activities: [],
  resources: [],
  differentiation: {
    eal: {
      strategies_used: [],
      vocabulary_introduced: [],
      student_understanding_level: '',
      notes: '',
    },
    sen: {
      accommodations_used: [],
      behaviour_notes: '',
      engagement_notes: '',
      progress_notes: '',
    },
    gifted_extension: [],
  },
  tracking: {
    overall_engagement: 'medium',
    general_notes: '',
    activities_log: [],
  },
  reflection: {
    what_worked_well: '',
    what_didnt_work: '',
    objectives_met: null,
    objectives_notes: '',
    next_steps: '',
    overall_rating: null,
    framework_notes: {
      bfl: '',
      sdt: '',
      vygotsky: '',
    },
  },
});

export const createDefaultStudent = (): Omit<Student, 'id' | 'created_at' | 'updated_at'> => ({
  name: '',
  year_group: '',
  class_name: '',
  eal_level: '',
  sen_needs: [],
  is_gifted: false,
  notes: [],
  vocabulary: [],
});

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
export const computeDashboardStats = (lessons: Lesson[], students: Student[]) => {
  const completed = lessons.filter((l) => l.status === 'completed');
  const analysed = completed
    .map((l) => analyseLessons(l))
    .filter((a) => a.effectiveness_score > 0);

  const avgScore =
    analysed.length > 0
      ? Math.round(
          analysed.reduce((s, a) => s + a.effectiveness_score, 0) / analysed.length
        )
      : 0;

  const engagementCounts = { high: 0, medium: 0, low: 0 };
  lessons.forEach((l) => {
    engagementCounts[l.tracking.overall_engagement]++;
  });
  const dominantEngagement = (
    Object.entries(engagementCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'medium'
  );

  const lessonsThisWeek = lessons.filter((l) => isThisWeek(l.date)).length;

  return {
    totalLessons: lessons.length,
    completedLessons: completed.length,
    avgEffectivenessScore: avgScore,
    avgEngagement:
      dominantEngagement.charAt(0).toUpperCase() + dominantEngagement.slice(1),
    lessonsThisWeek,
    studentsSupported: students.length,
    ealStudents: students.filter((s) => Boolean(s.eal_level)).length,
    senStudents: students.filter((s) => s.sen_needs.length > 0).length,
  };
};

// ─── Subjects & Year Groups ────────────────────────────────────────────────────
export const SUBJECTS = [
  'English', 'Mathematics', 'Science', 'History', 'Geography', 'Art & Design',
  'Design & Technology', 'Computing', 'Music', 'Physical Education', 'PSHE',
  'Religious Education', 'Modern Foreign Languages', 'Drama', 'Other',
];

export const YEAR_GROUPS = [
  'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6',
  'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13',
];

export const EAL_STRATEGIES = [
  'Visual aids & images', 'Key vocabulary pre-teaching', 'Bilingual glossary',
  'Sentence starters', 'Peer support (EAL buddy)', 'Simplified instructions',
  'First language support', 'Graphic organisers', 'Modelling & demonstration',
  'Home language resources',
];

export const SEN_ACCOMMODATIONS = [
  'Differentiated worksheets', 'Enlarged text', 'Extra time',
  'Scribe/reader support', 'Fidget tools', 'Reduced workload',
  'Visual timetable', 'Sensory breaks', 'Preferential seating',
  'Assistive technology', 'Chunked instructions', 'Check-in/check-out',
];
