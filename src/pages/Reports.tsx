import React, { useState } from 'react';
import {
  Download,
  BarChart2,
  Users,
  BookOpen,
  TrendingUp,
  Printer,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { analyseLessons, formatDate, getScoreColor } from '../utils/helpers';

const Reports: React.FC = () => {
  const { state } = useApp();
  const [activeReport, setActiveReport] = useState<
    'overview' | 'lessons' | 'students' | 'eal_sen'
  >('overview');

  const completedLessons = state.lessons.filter((l) => l.status === 'completed');

  // Build lesson data with scores
  const lessonData = completedLessons
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => {
      const analysis = analyseLessons(l);
      return {
        ...l,
        analysis,
      };
    });

  // Effectiveness trend
  const trendData = lessonData.map((l) => ({
    date: formatDate(l.date),
    score: l.analysis.effectiveness_score,
    title: l.title,
  }));

  // Subject averages
  const subjectMap: Record<string, number[]> = {};
  lessonData.forEach((l) => {
    if (!subjectMap[l.subject]) subjectMap[l.subject] = [];
    subjectMap[l.subject].push(l.analysis.effectiveness_score);
  });
  const subjectData = Object.entries(subjectMap).map(([subject, scores]) => ({
    subject: subject.length > 10 ? subject.slice(0, 10) + '…' : subject,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  // Engagement distribution
  const engagementCounts = { High: 0, Medium: 0, Low: 0 };
  state.lessons.forEach((l) => {
    const key =
      l.tracking.overall_engagement === 'high'
        ? 'High'
        : l.tracking.overall_engagement === 'medium'
        ? 'Medium'
        : 'Low';
    engagementCounts[key]++;
  });
  const engagementData = Object.entries(engagementCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const ENGAGEMENT_COLORS = { High: '#22c55e', Medium: '#f59e0b', Low: '#ef4444' };

  // SEN / EAL stats
  const ealCount = state.students.filter((s) => Boolean(s.eal_level)).length;
  const senCount = state.students.filter((s) => s.sen_needs.length > 0).length;
  const giftedCount = state.students.filter((s) => s.is_gifted).length;

  // Lessons with EAL/SEN support
  const lessonsWithEAL = state.lessons.filter(
    (l) => l.differentiation.eal.strategies_used.length > 0
  ).length;
  const lessonsWithSEN = state.lessons.filter(
    (l) => l.differentiation.sen.accommodations_used.length > 0
  ).length;

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    if (lessonData.length === 0) return;
    const headers = [
      'Title', 'Subject', 'Year Group', 'Date', 'Duration',
      'Status', 'Effectiveness Score', 'Engagement',
      'Objectives Met', 'Rating',
    ];
    const rows = lessonData.map((l) => [
      `"${l.title}"`,
      `"${l.subject}"`,
      `"${l.year_group}"`,
      l.date,
      l.duration,
      l.status,
      l.analysis.effectiveness_score,
      l.tracking.overall_engagement,
      l.reflection.objectives_met === true
        ? 'Yes'
        : l.reflection.objectives_met === false
        ? 'No'
        : 'Partial',
      l.reflection.overall_rating ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachreflect-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'lessons', label: 'Lesson Analysis', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'eal_sen', label: 'EAL & SEN', icon: TrendingUp },
  ] as const;

  return (
    <div className="p-6 max-w-6xl mx-auto print:p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 print:mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Insights across {state.lessons.length} lessons and {state.students.length} students
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={handlePrint} className="btn-secondary">
            <Printer size={15} />
            Print
          </button>
          <button onClick={handleExportCSV} className="btn-primary">
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 print:hidden">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveReport(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeReport === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeReport === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Lessons',
                value: state.lessons.length,
                sub: `${completedLessons.length} completed`,
                color: 'bg-blue-50 text-blue-700',
              },
              {
                label: 'Avg Effectiveness',
                value:
                  lessonData.length > 0
                    ? `${Math.round(
                        lessonData.reduce((s, l) => s + l.analysis.effectiveness_score, 0) /
                          lessonData.length
                      )}%`
                    : '—',
                sub: 'Completed lessons only',
                color: 'bg-green-50 text-green-700',
              },
              {
                label: 'Students Tracked',
                value: state.students.length,
                sub: `${ealCount} EAL · ${senCount} SEN`,
                color: 'bg-purple-50 text-purple-700',
              },
              {
                label: 'Lessons with Support',
                value: Math.max(lessonsWithEAL, lessonsWithSEN),
                sub: `${lessonsWithEAL} EAL · ${lessonsWithSEN} SEN`,
                color: 'bg-orange-50 text-orange-700',
              },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className={`p-4 rounded-xl ${color}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm font-medium mt-0.5">{label}</p>
                <p className="text-xs opacity-70 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Trend Chart */}
          <div className="card">
            <h2 className="section-title">Effectiveness Score Over Time</h2>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={30} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Score']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Complete lessons to see effectiveness trend
              </div>
            )}
          </div>

          {/* Subject & Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="section-title">Effectiveness by Subject</h2>
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={subjectData} barSize={24}>
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={30} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                      {subjectData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.avg >= 75 ? '#22c55e' : entry.avg >= 50 ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  No data yet
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="section-title">Engagement Distribution</h2>
              {state.lessons.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {engagementData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            ENGAGEMENT_COLORS[
                              entry.name as keyof typeof ENGAGEMENT_COLORS
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  No data yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Lesson Analysis ── */}
      {activeReport === 'lessons' && (
        <div className="card">
          <h2 className="section-title">Lesson Performance Report</h2>
          {lessonData.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No completed lessons yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Lesson</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Subject</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Score</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Engagement</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Objectives</th>
                    <th className="text-left py-2 font-medium text-gray-600">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {lessonData.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 pr-4">
                        <p className="font-medium text-gray-900 truncate max-w-[150px]">
                          {l.title || 'Untitled'}
                        </p>
                        <p className="text-xs text-gray-400">{l.year_group}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700">{l.subject || '—'}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{formatDate(l.date)}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`font-bold ${getScoreColor(l.analysis.effectiveness_score)}`}>
                          {l.analysis.effectiveness_score}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`badge ${
                            l.tracking.overall_engagement === 'high'
                              ? 'badge-green'
                              : l.tracking.overall_engagement === 'medium'
                              ? 'badge-yellow'
                              : 'badge-red'
                          }`}
                        >
                          {l.tracking.overall_engagement}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        {l.reflection.objectives_met === true ? (
                          <span className="badge badge-green">Met ✓</span>
                        ) : l.reflection.objectives_met === false ? (
                          <span className="badge badge-red">Not met</span>
                        ) : (
                          <span className="badge badge-yellow">Partial</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className="text-yellow-400">
                          {'★'.repeat(l.reflection.overall_rating ?? 0)}
                          <span className="text-gray-200">
                            {'★'.repeat(5 - (l.reflection.overall_rating ?? 0))}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Students ── */}
      {activeReport === 'students' && (
        <div className="card">
          <h2 className="section-title">Student Support Report</h2>
          {state.students.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No students added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Student</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Year / Class</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">EAL Level</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">SEN Needs</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Notes</th>
                    <th className="text-left py-2 font-medium text-gray-600">Vocab</th>
                  </tr>
                </thead>
                <tbody>
                  {state.students.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 pr-4">
                        <p className="font-medium text-gray-900">{s.name}</p>
                        {s.is_gifted && (
                          <span className="badge badge-yellow text-xs">⭐ Gifted</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700">
                        {s.year_group} {s.class_name && `· ${s.class_name}`}
                      </td>
                      <td className="py-2.5 pr-4">
                        {s.eal_level ? (
                          <span className="badge badge-blue">{s.eal_level}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        {s.sen_needs.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.sen_needs.slice(0, 2).map((n) => (
                              <span key={n} className="badge badge-purple text-xs">{n}</span>
                            ))}
                            {s.sen_needs.length > 2 && (
                              <span className="badge badge-gray text-xs">
                                +{s.sen_needs.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700">{s.notes.length}</td>
                      <td className="py-2.5 text-gray-700">
                        {s.vocabulary.length > 0 ? (
                          <span>
                            {s.vocabulary.filter((v) => v.mastered).length}/
                            {s.vocabulary.length} mastered
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── EAL & SEN ── */}
      {activeReport === 'eal_sen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'EAL Students', value: ealCount, color: 'bg-blue-50 text-blue-700' },
              { label: 'SEN Students', value: senCount, color: 'bg-purple-50 text-purple-700' },
              { label: 'Gifted Students', value: giftedCount, color: 'bg-yellow-50 text-yellow-700' },
              {
                label: 'Lessons with EAL',
                value: lessonsWithEAL,
                color: 'bg-teal-50 text-teal-700',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-4 rounded-xl ${color}`}>
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Most Used EAL Strategies */}
          <div className="card">
            <h2 className="section-title">Most Used EAL Strategies</h2>
            {(() => {
              const stratCounts: Record<string, number> = {};
              state.lessons.forEach((l) => {
                l.differentiation.eal.strategies_used.forEach((s) => {
                  stratCounts[s] = (stratCounts[s] ?? 0) + 1;
                });
              });
              const data = Object.entries(stratCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([name, count]) => ({ name: name.length > 25 ? name.slice(0, 25) + '…' : name, count }));
              return data.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data} layout="vertical" barSize={16}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm italic">No EAL strategies recorded yet.</p>
              );
            })()}
          </div>

          {/* Most Used SEN Accommodations */}
          <div className="card">
            <h2 className="section-title">Most Used SEN Accommodations</h2>
            {(() => {
              const accCounts: Record<string, number> = {};
              state.lessons.forEach((l) => {
                l.differentiation.sen.accommodations_used.forEach((a) => {
                  accCounts[a] = (accCounts[a] ?? 0) + 1;
                });
              });
              const data = Object.entries(accCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([name, count]) => ({ name: name.length > 25 ? name.slice(0, 25) + '…' : name, count }));
              return data.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data} layout="vertical" barSize={16}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm italic">No SEN accommodations recorded yet.</p>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
