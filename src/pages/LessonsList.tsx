import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Trash2,
  Eye,
  Edit,
  Zap,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, analyseLessons, getScoreColor } from '../utils/helpers';
import { SUBJECTS, YEAR_GROUPS } from '../utils/helpers';

const LessonsList: React.FC = () => {
  const { state, deleteLesson } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = state.lessons
    .filter((l) => {
      const matchSearch =
        !search ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.subject.toLowerCase().includes(search.toLowerCase()) ||
        l.year_group.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || l.status === filterStatus;
      const matchSubject = !filterSubject || l.subject === filterSubject;
      const matchYear = !filterYear || l.year_group === filterYear;
      return matchSearch && matchStatus && matchSubject && matchYear;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = (id: string) => {
    deleteLesson(id);
    setConfirmDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-y-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
          <p className="text-sm text-gray-500 mt-1">
            {state.lessons.length} lesson{state.lessons.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/quick-reflect" className="btn-secondary">
            <Zap size={16} />
            Quick Reflect
          </Link>
          <Link to="/lessons/new" className="btn-primary">
            <Plus size={16} />
            New Lesson
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-0">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search lessons…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="input w-full sm:w-auto"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="input w-full sm:w-auto"
          >
            <option value="">All Year Groups</option>
            {YEAR_GROUPS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No lessons found</p>
          <p className="text-gray-400 text-sm mt-1">
            {state.lessons.length === 0
              ? 'Create your first lesson plan to get started.'
              : 'Try adjusting your search filters.'}
          </p>
          {state.lessons.length === 0 && (
            <Link to="/lessons/new" className="btn-primary mt-4 inline-flex">
              <Plus size={14} />
              Create Lesson
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lesson) => {
            const analysis =
              lesson.status === 'completed' ? analyseLessons(lesson) : null;
            return (
              <div
                key={lesson.id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      lesson.status === 'completed'
                        ? 'bg-green-500'
                        : lesson.status === 'in_progress'
                        ? 'bg-yellow-500'
                        : 'bg-gray-300'
                    }`}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {lesson.title || 'Untitled Lesson'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-sm text-gray-600">
                            {lesson.subject}
                          </span>
                          {lesson.year_group && (
                            <span className="text-sm text-gray-400">
                              {lesson.year_group}
                            </span>
                          )}
                          {lesson.class_name && (
                            <span className="text-sm text-gray-400">
                              {lesson.class_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={12} />
                            {formatDate(lesson.date)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            {lesson.duration} min
                          </span>
                        </div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span
                            className={`badge ${
                              lesson.status === 'completed'
                                ? 'badge-green'
                                : lesson.status === 'in_progress'
                                ? 'badge-yellow'
                                : 'badge-gray'
                            }`}
                          >
                            {lesson.status === 'in_progress'
                              ? 'In Progress'
                              : lesson.status === 'completed'
                              ? 'Completed'
                              : 'Planned'}
                          </span>
                          {lesson.differentiation.eal.strategies_used.length > 0 && (
                            <span className="badge badge-blue">EAL</span>
                          )}
                          {lesson.differentiation.sen.accommodations_used.length > 0 && (
                            <span className="badge badge-purple">SEN</span>
                          )}
                          {lesson.activities.length > 0 && (
                            <span className="badge badge-gray">
                              {lesson.activities.length} activities
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      {analysis && (
                        <div className="text-right flex-shrink-0">
                          <p
                            className={`text-2xl font-bold ${getScoreColor(
                              analysis.effectiveness_score
                            )}`}
                          >
                            {analysis.effectiveness_score}%
                          </p>
                          <p className="text-xs text-gray-400">effectiveness</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className="btn-secondary text-xs py-1.5"
                      >
                        <Eye size={13} />
                        View
                      </Link>
                      <Link
                        to={`/lessons/${lesson.id}/plan`}
                        className="btn-secondary text-xs py-1.5"
                      >
                        <Edit size={13} />
                        Edit Plan
                      </Link>
                      <Link
                        to={`/lessons/${lesson.id}/track`}
                        className="btn-secondary text-xs py-1.5"
                      >
                        <Play size={13} />
                        Track
                      </Link>
                      <Link
                        to={`/lessons/${lesson.id}/reflect`}
                        className="btn-secondary text-xs py-1.5"
                      >
                        <Zap size={13} />
                        Reflect
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(lesson.id)}
                        className="ml-auto text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete lesson"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Lesson?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. All lesson data including tracking and
              reflections will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="btn-danger flex-1 justify-center"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsList;
