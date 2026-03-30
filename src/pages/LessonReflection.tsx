import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Save, CheckCircle, XCircle, Minus, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Lesson, StarRating } from '../types';
import { analyseLessons, getScoreBgColor, getScoreColor } from '../utils/helpers';

// ─── Star Rating ───────────────────────────────────────────────────────────────
const StarRatingInput: React.FC<{
  value: StarRating | null;
  onChange: (v: StarRating) => void;
  label?: string;
}> = ({ value, onChange, label }) => (
  <div>
    {label && <label className="label">{label}</label>}
    <div className="flex gap-2">
      {([1, 2, 3, 4, 5] as StarRating[]).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-3xl transition-colors ${
            n <= (value ?? 0) ? 'text-yellow-400' : 'text-gray-200'
          } hover:text-yellow-400`}
        >
          ★
        </button>
      ))}
    </div>
    {value && (
      <p className="text-xs text-gray-500 mt-1">
        {value === 1
          ? 'Poor — significant issues'
          : value === 2
          ? 'Below expectations'
          : value === 3
          ? 'Satisfactory'
          : value === 4
          ? 'Good — went well overall'
          : 'Excellent — highly effective lesson'}
      </p>
    )}
  </div>
);

// ─── Objectives Met Buttons ────────────────────────────────────────────────────
const ObjectivesMet: React.FC<{
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}> = ({ value, onChange }) => (
  <div className="flex gap-3">
    <button
      type="button"
      onClick={() => onChange(true)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
        value === true
          ? 'border-green-500 bg-green-50 text-green-700'
          : 'border-gray-200 text-gray-500 hover:border-gray-300'
      }`}
    >
      <CheckCircle size={16} />
      Yes, met
    </button>
    <button
      type="button"
      onClick={() => onChange(false)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
        value === false
          ? 'border-red-500 bg-red-50 text-red-700'
          : 'border-gray-200 text-gray-500 hover:border-gray-300'
      }`}
    >
      <XCircle size={16} />
      Not fully
    </button>
    <button
      type="button"
      onClick={() => onChange(null)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
        value === null
          ? 'border-gray-500 bg-gray-50 text-gray-700'
          : 'border-gray-200 text-gray-500 hover:border-gray-300'
      }`}
    >
      <Minus size={16} />
      Partial
    </button>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const LessonReflection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, updateLesson } = useApp();

  const lesson = state.lessons.find((l) => l.id === id);
  const [reflection, setReflection] = useState(
    lesson?.reflection ?? {
      what_worked_well: '',
      what_didnt_work: '',
      objectives_met: null as boolean | null,
      objectives_notes: '',
      next_steps: '',
      overall_rating: null as StarRating | null,
      framework_notes: { bfl: '', sdt: '', vygotsky: '' },
    }
  );
  const [saved, setSaved] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (lesson) setReflection(lesson.reflection);
  }, [lesson]);

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

  const setField = <K extends keyof typeof reflection>(
    key: K,
    value: (typeof reflection)[K]
  ) => setReflection((p) => ({ ...p, [key]: value }));

  const handleSave = (markComplete = false) => {
    const updated: Lesson = {
      ...lesson,
      reflection,
      status: markComplete ? 'completed' : lesson.status,
    };
    updateLesson(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (markComplete) {
      setShowAnalysis(true);
    }
  };

  // Compute preview analysis using current reflection
  const previewLesson: Lesson = { ...lesson, reflection };
  const analysis = analyseLessons(previewLesson);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post-Lesson Reflection</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lesson.title || 'Untitled Lesson'} · {lesson.subject} · {lesson.year_group}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave(false)} className="btn-secondary">
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Draft'}
          </button>
          <button onClick={() => handleSave(true)} className="btn-primary">
            <CheckCircle size={15} />
            Complete Lesson
          </button>
        </div>
      </div>

      {/* Analysis Preview */}
      {showAnalysis && (
        <div
          className={`mb-6 p-5 rounded-xl border-2 ${getScoreBgColor(
            analysis.effectiveness_score
          )}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Lesson Effectiveness Score</p>
              <p
                className={`text-4xl font-bold mt-1 ${getScoreColor(
                  analysis.effectiveness_score
                )}`}
              >
                {analysis.effectiveness_score}%
              </p>
            </div>
            <Link
              to={`/lessons/${lesson.id}`}
              className="btn-primary"
            >
              View Full Analysis
              <ArrowRight size={15} />
            </Link>
          </div>
          <p className="text-sm text-gray-700 mb-2">{analysis.time_management_feedback}</p>
          {analysis.suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">💡 Suggestions:</p>
              <ul className="space-y-1">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Objectives Met */}
      <div className="form-section">
        <h2 className="section-title">Were Learning Objectives Met?</h2>
        <ObjectivesMet
          value={reflection.objectives_met}
          onChange={(v) => setField('objectives_met', v)}
        />
        {lesson.objectives.filter(Boolean).length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-1">Planned objectives:</p>
            <ul className="space-y-1">
              {lesson.objectives.filter(Boolean).map((o, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-3">
          <label className="label">Notes on objective achievement</label>
          <textarea
            rows={3}
            value={reflection.objectives_notes}
            onChange={(e) => setField('objectives_notes', e.target.value)}
            placeholder="Which objectives were met? Which weren't and why?"
            className="textarea"
          />
        </div>
      </div>

      {/* What Worked / Didn't */}
      <div className="form-section">
        <h2 className="section-title">Lesson Review</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label text-green-700">✅ What worked well?</label>
            <textarea
              rows={5}
              value={reflection.what_worked_well}
              onChange={(e) => setField('what_worked_well', e.target.value)}
              placeholder="Activities, strategies, student responses that went well…"
              className="textarea border-green-200 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="label text-red-700">❌ What didn't work?</label>
            <textarea
              rows={5}
              value={reflection.what_didnt_work}
              onChange={(e) => setField('what_didnt_work', e.target.value)}
              placeholder="Challenges, things to avoid next time…"
              className="textarea border-red-200 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="form-section">
        <h2 className="section-title">Next Steps</h2>
        <textarea
          rows={4}
          value={reflection.next_steps}
          onChange={(e) => setField('next_steps', e.target.value)}
          placeholder="What will you do differently next time? What do students need next?"
          className="textarea"
        />
      </div>

      {/* Overall Rating */}
      <div className="form-section">
        <h2 className="section-title">Overall Lesson Rating</h2>
        <StarRatingInput
          value={reflection.overall_rating}
          onChange={(v) => setField('overall_rating', v)}
        />
      </div>

      {/* Teaching Frameworks */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-gray-600" />
          <h2 className="section-title mb-0">Teaching Framework Reflections</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Optional: reflect through the lens of evidence-based teaching frameworks.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <label className="label text-blue-800">
              🎓 Behaviour for Learning (BfL)
            </label>
            <p className="text-xs text-blue-600 mb-2">
              How did classroom relationships and self-regulation affect learning?
            </p>
            <textarea
              rows={3}
              value={reflection.framework_notes.bfl}
              onChange={(e) =>
                setField('framework_notes', {
                  ...reflection.framework_notes,
                  bfl: e.target.value,
                })
              }
              placeholder="BfL reflections…"
              className="textarea"
            />
          </div>
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
            <label className="label text-purple-800">
              🧠 Self-Determination Theory (SDT)
            </label>
            <p className="text-xs text-purple-600 mb-2">
              Did students feel autonomous, competent, and connected?
            </p>
            <textarea
              rows={3}
              value={reflection.framework_notes.sdt}
              onChange={(e) =>
                setField('framework_notes', {
                  ...reflection.framework_notes,
                  sdt: e.target.value,
                })
              }
              placeholder="SDT reflections…"
              className="textarea"
            />
          </div>
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
            <label className="label text-green-800">
              📚 Vygotsky's Zone of Proximal Development
            </label>
            <p className="text-xs text-green-600 mb-2">
              Was scaffolding effective? Were students challenged in their ZPD?
            </p>
            <textarea
              rows={3}
              value={reflection.framework_notes.vygotsky}
              onChange={(e) =>
                setField('framework_notes', {
                  ...reflection.framework_notes,
                  vygotsky: e.target.value,
                })
              }
              placeholder="ZPD reflections…"
              className="textarea"
            />
          </div>
        </div>
      </div>

      {/* Live Analysis Preview */}
      <div className="form-section bg-gray-50 border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-amber-500" />
          <h2 className="section-title mb-0">Live Analysis Preview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-xl border">
            <p
              className={`text-3xl font-bold ${getScoreColor(
                analysis.effectiveness_score
              )}`}
            >
              {analysis.effectiveness_score}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Effectiveness Score</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl border">
            <p className="text-xl font-bold text-gray-900">
              {analysis.engagement_level}
            </p>
            <p className="text-xs text-gray-500 mt-1">Engagement Level</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl border">
            <p className="text-sm font-medium text-gray-700">
              {analysis.objectives_achievement}
            </p>
            <p className="text-xs text-gray-500 mt-1">Objectives Status</p>
          </div>
        </div>
        {analysis.suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-600">💡 Improvement Suggestions:</p>
            {analysis.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-3 justify-end mt-6">
        <button onClick={() => handleSave(false)} className="btn-secondary">
          <Save size={15} />
          Save Draft
        </button>
        <button onClick={() => handleSave(true)} className="btn-primary">
          <CheckCircle size={15} />
          Complete & Analyse Lesson
        </button>
      </div>
    </div>
  );
};

export default LessonReflection;
