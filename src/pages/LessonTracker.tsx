import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Play,
  Square,
  CheckSquare,
  AlertTriangle,
  ThumbsUp,
  Clock,
  Save,
  ArrowRight,
  Mic,
  PenLine,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Activity, Lesson, StarRating } from '../types';

// ─── Star Rating ───────────────────────────────────────────────────────────────
const StarRatingInput: React.FC<{
  value: StarRating | undefined;
  onChange: (v: StarRating) => void;
}> = ({ value, onChange }) => (
  <div className="flex gap-1">
    {([1, 2, 3, 4, 5] as StarRating[]).map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className={`text-xl transition-colors ${
          n <= (value ?? 0) ? 'text-yellow-400' : 'text-gray-200'
        } hover:text-yellow-400`}
      >
        ★
      </button>
    ))}
  </div>
);

// ─── Timer Hook ────────────────────────────────────────────────────────────────
const useTimer = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  return { elapsed, running, setRunning, reset };
};

const formatElapsed = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ─── Activity Tracker Card ─────────────────────────────────────────────────────
const ActivityTrackerCard: React.FC<{
  activity: Activity;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onChange: (a: Activity) => void;
}> = ({ activity, index, isActive, onActivate, onChange }) => {
  const timer = useTimer();
  const [noteInput, setNoteInput] = useState(activity.notes || '');

  const handleStartStop = () => {
    if (timer.running) {
      const mins = Math.round(timer.elapsed / 60);
      onChange({ ...activity, actual_duration: mins, completed: true });
      timer.setRunning(false);
    } else {
      timer.setRunning(true);
      onActivate();
    }
  };

  const overTime =
    timer.running && timer.elapsed > activity.planned_duration * 60;

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        isActive
          ? 'border-primary-400 bg-primary-50'
          : activity.completed
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Activity {index + 1}
            </span>
            {activity.completed && (
              <span className="badge badge-green text-xs">Done</span>
            )}
            {overTime && (
              <span className="badge badge-red text-xs flex items-center gap-1">
                <AlertTriangle size={10} />
                Over time
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mt-0.5">
            {activity.name || `Activity ${index + 1}`}
          </h3>
          <p className="text-xs text-gray-500">
            Planned: {activity.planned_duration} min
            {activity.actual_duration !== undefined && (
              <span
                className={
                  activity.actual_duration > activity.planned_duration
                    ? ' text-red-600 font-medium'
                    : ' text-green-600 font-medium'
                }
              >
                {' '}→ Actual: {activity.actual_duration} min
              </span>
            )}
          </p>
        </div>

        {/* Timer */}
        <div className="text-right">
          <p
            className={`text-2xl font-mono font-bold ${
              overTime ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {formatElapsed(timer.elapsed)}
          </p>
          <button
            type="button"
            onClick={handleStartStop}
            className={`mt-1 ${
              timer.running ? 'btn-danger' : 'btn-primary'
            } text-xs py-1 px-3`}
          >
            {timer.running ? (
              <>
                <Square size={12} />
                Stop
              </>
            ) : activity.completed ? (
              <>
                <Play size={12} />
                Restart
              </>
            ) : (
              <>
                <Play size={12} />
                Start
              </>
            )}
          </button>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-3 mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={activity.students_understood}
            onChange={(e) =>
              onChange({ ...activity, students_understood: e.target.checked })
            }
            className="w-4 h-4 rounded text-green-600"
          />
          <span className="text-sm flex items-center gap-1 text-gray-700">
            <ThumbsUp size={14} className="text-green-600" />
            Students understood
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={activity.students_struggled}
            onChange={(e) =>
              onChange({ ...activity, students_struggled: e.target.checked })
            }
            className="w-4 h-4 rounded text-red-600"
          />
          <span className="text-sm flex items-center gap-1 text-gray-700">
            <AlertTriangle size={14} className="text-red-500" />
            Students struggled
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={activity.completed}
            onChange={(e) =>
              onChange({ ...activity, completed: e.target.checked })
            }
            className="w-4 h-4 rounded text-primary-600"
          />
          <span className="text-sm flex items-center gap-1 text-gray-700">
            <CheckSquare size={14} className="text-primary-600" />
            Completed
          </span>
        </label>
      </div>

      {/* Engagement Rating */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-gray-600">Engagement:</span>
        <StarRatingInput
          value={activity.engagement_rating}
          onChange={(v) => onChange({ ...activity, engagement_rating: v })}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Activity Notes</label>
        <textarea
          rows={2}
          value={noteInput}
          onChange={(e) => {
            setNoteInput(e.target.value);
            onChange({ ...activity, notes: e.target.value });
          }}
          placeholder="Quick notes during this activity…"
          className="textarea text-xs"
        />
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const LessonTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateLesson } = useApp();

  const lesson = state.lessons.find((l) => l.id === id);
  const [localLesson, setLocalLesson] = useState<Lesson | null>(
    () => (lesson ? { ...lesson, status: 'in_progress' as const } : null)
  );
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [generalNotes, setGeneralNotes] = useState(
    () => lesson?.tracking.general_notes ?? ''
  );
  const [saved, setSaved] = useState(false);

  if (!lesson || !localLesson) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Lesson not found.</p>
        <Link to="/lessons" className="btn-primary mt-4 inline-flex">
          Back to Lessons
        </Link>
      </div>
    );
  }

  const updateActivity = (i: number, a: Activity) => {
    const acts = [...localLesson.activities];
    acts[i] = a;
    setLocalLesson({
      ...localLesson,
      activities: acts,
    });
  };

  const handleSave = () => {
    const updated: Lesson = {
      ...localLesson,
      status: 'in_progress',
      tracking: {
        ...localLesson.tracking,
        general_notes: generalNotes,
      },
    };
    updateLesson(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFinish = () => {
    const updated: Lesson = {
      ...localLesson,
      status: 'in_progress',
      tracking: {
        ...localLesson.tracking,
        general_notes: generalNotes,
        end_time: new Date().toISOString(),
      },
    };
    updateLesson(updated);
    navigate(`/lessons/${lesson.id}/reflect`);
  };

  const completedCount = localLesson.activities.filter((a) => a.completed).length;
  const totalPlanned = localLesson.activities.reduce(
    (s, a) => s + a.planned_duration,
    0
  );
  const totalActual = localLesson.activities.reduce(
    (s, a) => s + (a.actual_duration ?? 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-y-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-yellow">In Progress</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lesson.title || 'Untitled Lesson'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lesson.subject} · {lesson.year_group} · {lesson.duration} min
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSave} className="btn-secondary">
            <Save size={15} />
            {saved ? 'Saved!' : 'Save'}
          </button>
          <button onClick={handleFinish} className="btn-primary">
            Finish & Reflect
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Activity Progress</h3>
          <span className="text-sm text-gray-500">
            {completedCount} / {localLesson.activities.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{
              width:
                localLesson.activities.length > 0
                  ? `${(completedCount / localLesson.activities.length) * 100}%`
                  : '0%',
            }}
          />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock size={14} />
            <span>Planned: {totalPlanned} min</span>
          </div>
          {totalActual > 0 && (
            <div
              className={`flex items-center gap-1.5 ${
                totalActual > totalPlanned ? 'text-red-600' : 'text-green-600'
              }`}
            >
              <Clock size={14} />
              <span>Actual: {totalActual} min</span>
            </div>
          )}
        </div>
      </div>

      {/* Objectives Quick View */}
      {lesson.objectives.filter(Boolean).length > 0 && (
        <div className="card mb-6 bg-blue-50 border-blue-100">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
            Today's Objectives
          </p>
          <ul className="space-y-1">
            {lesson.objectives.filter(Boolean).map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-blue-900">
                <span className="text-blue-400 mt-0.5">•</span>
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Activities */}
      {localLesson.activities.length === 0 ? (
        <div className="card text-center py-8 text-gray-400 mb-6">
          <p className="text-sm">No activities planned for this lesson.</p>
          <Link
            to={`/lessons/${lesson.id}/plan`}
            className="btn-secondary mt-3 inline-flex"
          >
            Add Activities to Plan
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <h2 className="section-title">Activities</h2>
          {localLesson.activities.map((a, i) => (
            <ActivityTrackerCard
              key={a.id}
              activity={a}
              index={i}
              isActive={activeActivity === a.id}
              onActivate={() => setActiveActivity(a.id)}
              onChange={(updated) => updateActivity(i, updated)}
            />
          ))}
        </div>
      )}

      {/* Overall Engagement */}
      <div className="card mb-6">
        <h2 className="section-title">Overall Lesson Engagement</h2>
        <div className="flex gap-3">
          {(['high', 'medium', 'low'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                setLocalLesson({
                  ...localLesson,
                  tracking: {
                    ...localLesson.tracking,
                    overall_engagement: level,
                  },
                })
              }
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                localLesson.tracking.overall_engagement === level
                  ? level === 'high'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : level === 'medium'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {level === 'high' ? '🔥 High' : level === 'medium' ? '😐 Medium' : '😴 Low'}
            </button>
          ))}
        </div>
      </div>

      {/* General Notes */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <PenLine size={16} className="text-gray-500" />
          <h2 className="section-title mb-0">General Notes</h2>
        </div>
        <textarea
          rows={4}
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="Quick notes during the lesson — pace, behaviour, unexpected events…"
          className="textarea"
        />
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Mic size={11} />
          Notes auto-save when you click Save or Finish
        </p>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button onClick={handleSave} className="btn-secondary">
          <Save size={15} />
          {saved ? 'Saved!' : 'Save Progress'}
        </button>
        <button onClick={handleFinish} className="btn-primary">
          Finish & Reflect
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default LessonTracker;
