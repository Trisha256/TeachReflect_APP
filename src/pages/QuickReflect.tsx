import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Save, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBJECTS, YEAR_GROUPS } from '../utils/helpers';
import type { StarRating } from '../types';

const QuickReflect: React.FC = () => {
  const { addLesson } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    subject: '',
    year_group: '',
    class_name: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    what_worked_well: '',
    what_didnt_work: '',
    next_steps: '',
    objectives_met: null as boolean | null,
    overall_rating: null as StarRating | null,
    engagement: 'medium' as 'high' | 'medium' | 'low',
  });

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleSubmit = () => {
    const lesson = addLesson({
      title: form.title || 'Quick Reflection',
      subject: form.subject,
      year_group: form.year_group,
      class_name: form.class_name,
      date: form.date,
      duration: form.duration,
      status: 'completed',
      objectives: [],
      success_criteria: [],
      activities: [],
      resources: [],
      differentiation: {
        eal: { strategies_used: [], vocabulary_introduced: [], student_understanding_level: '', notes: '' },
        sen: { accommodations_used: [], behaviour_notes: '', engagement_notes: '', progress_notes: '' },
        gifted_extension: [],
      },
      tracking: {
        overall_engagement: form.engagement,
        general_notes: '',
        activities_log: [],
      },
      reflection: {
        what_worked_well: form.what_worked_well,
        what_didnt_work: form.what_didnt_work,
        objectives_met: form.objectives_met,
        objectives_notes: '',
        next_steps: form.next_steps,
        overall_rating: form.overall_rating,
        framework_notes: { bfl: '', sdt: '', vygotsky: '' },
      },
    });
    navigate(`/lessons/${lesson.id}`);
  };

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quick Reflect</h1>
          <p className="text-sm text-gray-500">1-minute post-lesson reflection</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${
              i < step ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1 — Lesson Basics */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Which lesson was this?</h2>
          <div>
            <label className="label">Lesson Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Forces & Motion"
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <select value={form.subject} onChange={(e) => set('subject', e.target.value)} className="input">
                <option value="">Select…</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year Group</label>
              <select value={form.year_group} onChange={(e) => set('year_group', e.target.value)} className="input">
                <option value="">Select…</option>
                {YEAR_GROUPS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Duration (min)</label>
              <input
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => set('duration', Number(e.target.value))}
                className="input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — How Did It Go? */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">How did it go?</h2>

          {/* Engagement */}
          <div>
            <label className="label">Overall Engagement</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => set('engagement', level)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.engagement === level
                      ? level === 'high'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : level === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {level === 'high' ? '🔥 High' : level === 'medium' ? '😐 Medium' : '😴 Low'}
                </button>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div>
            <label className="label">Were objectives met?</label>
            <div className="flex gap-2">
              {[
                { val: true, label: '✅ Yes', cls: form.objectives_met === true ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500' },
                { val: false, label: '❌ Not fully', cls: form.objectives_met === false ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500' },
                { val: null, label: '➖ Partial', cls: form.objectives_met === null ? 'border-gray-500 bg-gray-50 text-gray-700' : 'border-gray-200 text-gray-500' },
              ].map(({ val, label, cls }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => set('objectives_met', val as boolean | null)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${cls}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="label">Rate this lesson</label>
            <div className="flex gap-3">
              {([1, 2, 3, 4, 5] as StarRating[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('overall_rating', n)}
                  className={`text-4xl transition-colors ${
                    n <= (form.overall_rating ?? 0) ? 'text-yellow-400' : 'text-gray-200'
                  } hover:text-yellow-400`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Reflection Notes */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick notes</h2>
          <div>
            <label className="label text-green-700">✅ What worked well? (optional)</label>
            <textarea
              rows={3}
              value={form.what_worked_well}
              onChange={(e) => set('what_worked_well', e.target.value)}
              placeholder="Activities, student responses that went well…"
              className="textarea"
            />
          </div>
          <div>
            <label className="label text-red-700">❌ What didn't work? (optional)</label>
            <textarea
              rows={3}
              value={form.what_didnt_work}
              onChange={(e) => set('what_didnt_work', e.target.value)}
              placeholder="What to improve next time…"
              className="textarea"
            />
          </div>
          <div>
            <label className="label text-blue-700">➡️ Next steps (optional)</label>
            <textarea
              rows={2}
              value={form.next_steps}
              onChange={(e) => set('next_steps', e.target.value)}
              placeholder="What do students need next?"
              className="textarea"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex-1 justify-center">
            Back
          </button>
        )}
        {step < totalSteps ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="btn-primary flex-1 justify-center"
          >
            Next
            <ArrowRight size={15} />
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            <Save size={15} />
            Save Reflection
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Step {step} of {totalSteps} · Takes about 1 minute
      </p>
    </div>
  );
};

export default QuickReflect;
