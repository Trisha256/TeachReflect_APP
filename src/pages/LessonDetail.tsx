import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Edit,
  Play,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  BookOpen,
  Users,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyseLessons, formatDate, getScoreColor, getScoreBgColor } from '../utils/helpers';

const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, deleteLesson } = useApp();

  const lesson = state.lessons.find((l) => l.id === id);

  if (!lesson) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Lesson not found.</p>
        <Link to="/lessons" className="btn-primary mt-4 inline-flex">
          Back to Lessons
        </Link>
      </div>
    );
  }

  const analysis = lesson.status === 'completed' ? analyseLessons(lesson) : null;

  const handleDelete = () => {
    if (confirm('Delete this lesson? This cannot be undone.')) {
      deleteLesson(lesson.id);
      navigate('/lessons');
    }
  };

  const completedActivities = lesson.activities.filter((a) => a.completed).length;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        to="/lessons"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={15} />
        All Lessons
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`badge ${
                lesson.status === 'completed'
                  ? 'badge-green'
                  : lesson.status === 'in_progress'
                  ? 'badge-yellow'
                  : 'badge-gray'
              }`}
            >
              {lesson.status === 'completed'
                ? 'Completed'
                : lesson.status === 'in_progress'
                ? 'In Progress'
                : 'Planned'}
            </span>
            {lesson.differentiation.eal.strategies_used.length > 0 && (
              <span className="badge badge-blue">EAL</span>
            )}
            {lesson.differentiation.sen.accommodations_used.length > 0 && (
              <span className="badge badge-purple">SEN</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lesson.title || 'Untitled Lesson'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              {lesson.subject || 'No subject'}
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} />
              {lesson.year_group} {lesson.class_name && `· ${lesson.class_name}`}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(lesson.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {lesson.duration} min
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <Link to={`/lessons/${lesson.id}/plan`} className="btn-secondary">
            <Edit size={15} />
            Edit Plan
          </Link>
          <Link to={`/lessons/${lesson.id}/track`} className="btn-secondary">
            <Play size={15} />
            Track
          </Link>
          <Link to={`/lessons/${lesson.id}/reflect`} className="btn-primary">
            <MessageSquare size={15} />
            Reflect
          </Link>
          <button onClick={handleDelete} className="btn-danger">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Analysis Panel */}
      {analysis && (
        <div
          className={`mb-6 p-5 rounded-xl border-2 ${getScoreBgColor(
            analysis.effectiveness_score
          )}`}
        >
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            🎯 Lesson Analysis
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  analysis.effectiveness_score
                )}`}
              >
                {analysis.effectiveness_score}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Effectiveness</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {analysis.engagement_level}
              </p>
              <p className="text-xs text-gray-500 mt-1">Engagement</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {analysis.time_management_feedback}
              </p>
              <p className="text-xs text-gray-500 mt-1">Time Management</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {analysis.objectives_achievement}
              </p>
              <p className="text-xs text-gray-500 mt-1">Objectives</p>
            </div>
          </div>

          {analysis.suggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                <Lightbulb size={13} />
                AI-Like Suggestions:
              </p>
              <ul className="space-y-1.5">
                {analysis.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 flex items-start gap-2"
                  >
                    <span className="text-primary-500 mt-0.5">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objectives & Criteria */}
          <div className="card">
            <h2 className="section-title">Learning Objectives</h2>
            {lesson.objectives.filter(Boolean).length > 0 ? (
              <ul className="space-y-1.5">
                {lesson.objectives.filter(Boolean).map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-primary-500 mt-0.5 flex-shrink-0">•</span>
                    {o}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">No objectives set.</p>
            )}
            {lesson.success_criteria.filter(Boolean).length > 0 && (
              <>
                <h3 className="font-medium text-sm text-gray-700 mt-4 mb-2">
                  Success Criteria
                </h3>
                <ul className="space-y-1.5">
                  {lesson.success_criteria.filter(Boolean).map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle
                        size={14}
                        className="text-green-500 mt-0.5 flex-shrink-0"
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Activities */}
          {lesson.activities.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title mb-0">Activities</h2>
                <span className="text-sm text-gray-500">
                  {completedActivities}/{lesson.activities.length} completed
                </span>
              </div>
              <div className="space-y-3">
                {lesson.activities.map((a, i) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border ${
                      a.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {i + 1}. {a.name || 'Unnamed Activity'}
                        </p>
                        {a.notes && (
                          <p className="text-xs text-gray-500 mt-0.5">{a.notes}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">
                            Planned: {a.planned_duration} min
                          </span>
                          {a.actual_duration !== undefined && (
                            <span
                              className={`text-xs ${
                                a.actual_duration > a.planned_duration
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}
                            >
                              Actual: {a.actual_duration} min
                            </span>
                          )}
                          {a.engagement_rating && (
                            <span className="text-xs text-yellow-600">
                              {'★'.repeat(a.engagement_rating)}
                              {'☆'.repeat(5 - a.engagement_rating)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {a.students_understood && (
                          <span className="badge badge-green text-xs">Understood ✓</span>
                        )}
                        {a.students_struggled && (
                          <span className="badge badge-red text-xs">Struggled ⚠</span>
                        )}
                        {a.completed && (
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflection */}
          {lesson.status === 'completed' && (
            <div className="card">
              <h2 className="section-title">Post-Lesson Reflection</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Objectives Met
                  </p>
                  <div className="flex items-center gap-2">
                    {lesson.reflection.objectives_met === true ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : lesson.reflection.objectives_met === false ? (
                      <XCircle size={16} className="text-red-500" />
                    ) : (
                      <span className="badge badge-yellow">Partial</span>
                    )}
                    <span className="text-sm text-gray-700">
                      {lesson.reflection.objectives_met === true
                        ? 'Yes, all objectives were met'
                        : lesson.reflection.objectives_met === false
                        ? 'Objectives were not fully met'
                        : 'Partially met'}
                    </span>
                  </div>
                  {lesson.reflection.objectives_notes && (
                    <p className="text-sm text-gray-600 mt-1 ml-6">
                      {lesson.reflection.objectives_notes}
                    </p>
                  )}
                </div>
                {lesson.reflection.what_worked_well && (
                  <div>
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                      ✅ What Worked Well
                    </p>
                    <p className="text-sm text-gray-700">
                      {lesson.reflection.what_worked_well}
                    </p>
                  </div>
                )}
                {lesson.reflection.what_didnt_work && (
                  <div>
                    <p className="text-xs font-medium text-red-700 uppercase tracking-wide mb-1">
                      ❌ What Didn't Work
                    </p>
                    <p className="text-sm text-gray-700">
                      {lesson.reflection.what_didnt_work}
                    </p>
                  </div>
                )}
                {lesson.reflection.next_steps && (
                  <div>
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                      ➡️ Next Steps
                    </p>
                    <p className="text-sm text-gray-700">
                      {lesson.reflection.next_steps}
                    </p>
                  </div>
                )}
                {lesson.reflection.overall_rating && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Overall Rating
                    </p>
                    <p className="text-xl text-yellow-400">
                      {'★'.repeat(lesson.reflection.overall_rating)}
                      <span className="text-gray-200">
                        {'★'.repeat(5 - lesson.reflection.overall_rating)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tracking Notes */}
          {lesson.tracking.general_notes && (
            <div className="card">
              <h2 className="section-title">During-Lesson Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {lesson.tracking.general_notes}
              </p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* EAL */}
          {(lesson.differentiation.eal.strategies_used.length > 0 ||
            lesson.differentiation.eal.notes) && (
            <div className="card">
              <h3 className="font-semibold text-blue-800 text-sm mb-3 flex items-center gap-2">
                🌍 EAL Support
              </h3>
              {lesson.differentiation.eal.strategies_used.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Strategies used:</p>
                  <div className="flex flex-wrap gap-1">
                    {lesson.differentiation.eal.strategies_used.map((s) => (
                      <span key={s} className="badge badge-blue text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {lesson.differentiation.eal.vocabulary_introduced.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Vocabulary:</p>
                  <div className="flex flex-wrap gap-1">
                    {lesson.differentiation.eal.vocabulary_introduced.map((v) => (
                      <span key={v} className="badge badge-gray text-xs">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {lesson.differentiation.eal.student_understanding_level && (
                <p className="text-xs text-gray-600">
                  Understanding level: {lesson.differentiation.eal.student_understanding_level}
                </p>
              )}
              {lesson.differentiation.eal.notes && (
                <p className="text-xs text-gray-600 mt-1">{lesson.differentiation.eal.notes}</p>
              )}
            </div>
          )}

          {/* SEN */}
          {(lesson.differentiation.sen.accommodations_used.length > 0 ||
            lesson.differentiation.sen.progress_notes) && (
            <div className="card">
              <h3 className="font-semibold text-purple-800 text-sm mb-3">
                ♿ SEN Support
              </h3>
              {lesson.differentiation.sen.accommodations_used.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Accommodations:</p>
                  <div className="flex flex-wrap gap-1">
                    {lesson.differentiation.sen.accommodations_used.map((a) => (
                      <span key={a} className="badge badge-purple text-xs">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {lesson.differentiation.sen.progress_notes && (
                <p className="text-xs text-gray-600 mt-1">
                  {lesson.differentiation.sen.progress_notes}
                </p>
              )}
            </div>
          )}

          {/* Gifted */}
          {lesson.differentiation.gifted_extension.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-yellow-700 text-sm mb-3">
                ⭐ Gifted Extension
              </h3>
              <ul className="space-y-1">
                {lesson.differentiation.gifted_extension.filter(Boolean).map(
                  (e, i) => (
                    <li key={i} className="text-xs text-gray-700">
                      • {e}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Resources */}
          {lesson.resources.filter(Boolean).length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">
                📦 Resources
              </h3>
              <ul className="space-y-1">
                {lesson.resources.filter(Boolean).map((r, i) => (
                  <li key={i} className="text-xs text-gray-600">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Framework Notes */}
          {(lesson.reflection.framework_notes.bfl ||
            lesson.reflection.framework_notes.sdt ||
            lesson.reflection.framework_notes.vygotsky) && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">
                📖 Framework Notes
              </h3>
              {lesson.reflection.framework_notes.bfl && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-blue-700">BfL:</p>
                  <p className="text-xs text-gray-600">
                    {lesson.reflection.framework_notes.bfl}
                  </p>
                </div>
              )}
              {lesson.reflection.framework_notes.sdt && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-purple-700">SDT:</p>
                  <p className="text-xs text-gray-600">
                    {lesson.reflection.framework_notes.sdt}
                  </p>
                </div>
              )}
              {lesson.reflection.framework_notes.vygotsky && (
                <div>
                  <p className="text-xs font-medium text-green-700">ZPD:</p>
                  <p className="text-xs text-gray-600">
                    {lesson.reflection.framework_notes.vygotsky}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
