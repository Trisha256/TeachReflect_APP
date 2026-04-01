import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  computeDashboardStats,
  analyseLessons,
  formatDate,
  isThisWeek,
  getScoreColor,
} from '../utils/helpers';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}> = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="flex-1">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const stats = computeDashboardStats(state.lessons, state.students);

  // Recent lessons (last 5)
  const recentLessons = [...state.lessons]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Chart data: effectiveness scores for recent completed lessons
  const chartData = state.lessons
    .filter((l) => l.status === 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map((l) => {
      const analysis = analyseLessons(l);
      return {
        name: l.title.length > 12 ? l.title.slice(0, 12) + '…' : l.title,
        score: analysis.effectiveness_score,
        subject: l.subject,
      };
    });

  // Lessons needing reflection this week
  const needReflection = state.lessons.filter(
    (l) =>
      isThisWeek(l.date) &&
      l.status === 'planned' &&
      l.date <= new Date().toISOString().split('T')[0]
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-y-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's an overview of your teaching practice.
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

      {/* Smart Reminders */}
      {needReflection.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                🔔 You have {needReflection.length} lesson
                {needReflection.length > 1 ? 's' : ''} this week that still need
                {needReflection.length === 1 ? 's' : ''} reflection
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {needReflection.map((l) => (
                  <Link
                    key={l.id}
                    to={`/lessons/${l.id}/reflect`}
                    className="text-xs bg-white border border-amber-300 text-amber-800 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors"
                  >
                    {l.title || 'Untitled'} — {formatDate(l.date)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Lessons"
          value={stats.totalLessons}
          icon={BookOpen}
          color="bg-primary-600"
          sub={`${stats.lessonsThisWeek} this week`}
        />
        <StatCard
          label="Completed"
          value={stats.completedLessons}
          icon={CheckCircle}
          color="bg-green-600"
          sub={`${stats.totalLessons - stats.completedLessons} planned`}
        />
        <StatCard
          label="Avg Effectiveness"
          value={stats.avgEffectivenessScore > 0 ? `${stats.avgEffectivenessScore}%` : '—'}
          icon={TrendingUp}
          color="bg-purple-600"
          sub="From completed lessons"
        />
        <StatCard
          label="Students Tracked"
          value={stats.studentsSupported}
          icon={Users}
          color="bg-orange-600"
          sub={`${stats.ealStudents} EAL · ${stats.senStudents} SEN`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Effectiveness Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Lesson Effectiveness</h2>
            <Link
              to="/lessons"
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={28}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Effectiveness']}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.score >= 75
                          ? '#22c55e'
                          : entry.score >= 50
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Complete lessons to see effectiveness scores</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="section-title">Support Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">EAL Students</span>
                <span className="badge badge-blue">{stats.ealStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SEN Students</span>
                <span className="badge badge-purple">{stats.senStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Engagement</span>
                <span
                  className={`badge ${
                    stats.avgEngagement === 'High'
                      ? 'badge-green'
                      : stats.avgEngagement === 'Medium'
                      ? 'badge-yellow'
                      : 'badge-red'
                  }`}
                >
                  {stats.avgEngagement}
                </span>
              </div>
            </div>
            <Link to="/students" className="mt-4 btn-secondary w-full justify-center">
              <Users size={14} />
              Manage Students
            </Link>
          </div>

          <div className="card">
            <h2 className="section-title">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/lessons/new" className="btn-primary w-full justify-center">
                <Plus size={14} />
                Plan New Lesson
              </Link>
              <Link to="/quick-reflect" className="btn-secondary w-full justify-center">
                <Zap size={14} />
                Quick Reflection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Lessons */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Lessons</h2>
          <Link
            to="/lessons"
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recentLessons.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No lessons yet. Create your first lesson plan!</p>
            <Link to="/lessons/new" className="btn-primary mt-4 inline-flex">
              <Plus size={14} />
              Create Lesson
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentLessons.map((lesson) => {
              const analysis =
                lesson.status === 'completed' ? analyseLessons(lesson) : null;
              return (
              <div
                  key={lesson.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {lesson.title || 'Untitled Lesson'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lesson.subject} · {lesson.year_group} · {formatDate(lesson.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {analysis && (
                      <span
                        className={`text-sm font-semibold ${getScoreColor(
                          analysis.effectiveness_score
                        )}`}
                      >
                        {analysis.effectiveness_score}%
                      </span>
                    )}
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
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        View
                      </Link>
                      {lesson.status !== 'completed' && (
                        <>
                          <span className="text-gray-300">·</span>
                          <Link
                            to={`/lessons/${lesson.id}/reflect`}
                            className="text-xs text-gray-500 hover:underline"
                          >
                            Reflect
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Teaching Frameworks Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Behaviour for Learning (BfL)',
            desc: 'Track how classroom relationships and student self-regulation affect learning.',
            color: 'bg-blue-50 border-blue-100',
          },
          {
            title: 'Self-Determination Theory (SDT)',
            desc: 'Monitor autonomy, competence, and relatedness to support intrinsic motivation.',
            color: 'bg-purple-50 border-purple-100',
          },
          {
            title: "Vygotsky's ZPD",
            desc: 'Plan for scaffolded learning and note where students need stretch and support.',
            color: 'bg-green-50 border-green-100',
          },
        ].map(({ title, desc, color }) => (
          <div key={title} className={`p-4 rounded-xl border ${color}`}>
            <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
            <p className="text-xs text-gray-600">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
