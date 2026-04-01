import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Library,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  createDefaultLesson,
  generateId,
  SUBJECTS,
  YEAR_GROUPS,
  EAL_STRATEGIES,
  SEN_ACCOMMODATIONS,
} from '../utils/helpers';
import type { Lesson, Activity } from '../types';

// ─── Section Wrapper ───────────────────────────────────────────────────────────
const Section: React.FC<{
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="form-section">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full text-left"
      >
        <h2 className="section-title mb-0">{title}</h2>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
};

// ─── Tag Input ─────────────────────────────────────────────────────────────────
const TagInput: React.FC<{
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}> = ({ label, tags, onChange, suggestions = [], placeholder = 'Type and press Enter…' }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const add = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div className="relative">
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg min-h-[42px] bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 badge badge-blue text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="hover:text-blue-900"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(input);
            } else if (e.key === 'Backspace' && !input && tags.length > 0) {
              onChange(tags.slice(0, -1));
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-24 text-sm outline-none bg-transparent"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && input && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => add(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── List Input ────────────────────────────────────────────────────────────────
const ListInput: React.FC<{
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}> = ({ label, items, onChange, placeholder = 'Add item…' }) => {
  const updateItem = (i: number, val: string) => {
    const updated = [...items];
    updated[i] = val;
    onChange(updated);
  };
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const addItem = () => onChange([...items, '']);

  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`${placeholder} ${i + 1}`}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
      >
        <Plus size={14} />
        Add item
      </button>
    </div>
  );
};

// ─── Activity Card ─────────────────────────────────────────────────────────────
const ActivityCard: React.FC<{
  activity: Activity;
  index: number;
  onChange: (a: Activity) => void;
  onDelete: () => void;
}> = ({ activity, index, onChange, onDelete }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Activity {index + 1}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="label">Activity Name</label>
          <input
            type="text"
            value={activity.name}
            onChange={(e) => onChange({ ...activity, name: e.target.value })}
            placeholder="e.g. Group Discussion"
            className="input"
          />
        </div>
        <div>
          <label className="label">Planned Duration (mins)</label>
          <input
            type="number"
            min={1}
            max={120}
            value={activity.planned_duration}
            onChange={(e) =>
              onChange({ ...activity, planned_duration: Number(e.target.value) })
            }
            className="input"
          />
        </div>
        <div>
          <label className="label">Notes / Instructions</label>
          <input
            type="text"
            value={activity.notes}
            onChange={(e) => onChange({ ...activity, notes: e.target.value })}
            placeholder="Brief notes for this activity"
            className="input"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const LessonPlanner: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { state, addLesson, updateLesson } = useApp();

  const isEdit = id && id !== 'new';
  const existing = isEdit ? state.lessons.find((l) => l.id === id) : null;

  const [lesson, setLesson] = useState<Omit<Lesson, 'id' | 'created_at' | 'updated_at'>>(
    () => {
      if (existing) return { ...existing };
      return createDefaultLesson();
    }
  );

  const [showTemplates, setShowTemplates] = useState(false);
  const [saved, setSaved] = useState(false);

  const applyTemplate = (templateId: string) => {
    const tpl = state.templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setLesson((prev) => ({
      ...prev,
      title: prev.title || tpl.name,
      subject: prev.subject || tpl.subject,
      duration: tpl.duration,
      objectives: tpl.objectives.filter(Boolean),
      success_criteria: tpl.success_criteria.filter(Boolean),
      activities: tpl.activities.map((a) => ({
        ...a,
        id: generateId(),
        engagement_rating: undefined,
        actual_duration: undefined,
      })),
      resources: tpl.resources,
      differentiation: {
        ...prev.differentiation,
        eal: tpl.differentiation.eal ?? prev.differentiation.eal,
        sen: tpl.differentiation.sen ?? prev.differentiation.sen,
        gifted_extension:
          tpl.differentiation.gifted_extension ?? prev.differentiation.gifted_extension,
      },
    }));
    setShowTemplates(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && existing) {
      updateLesson({ ...existing, ...lesson });
    } else {
      const created = addLesson(lesson);
      navigate(`/lessons/${created.id}`);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setField = <K extends keyof typeof lesson>(
    key: K,
    value: (typeof lesson)[K]
  ) => setLesson((p) => ({ ...p, [key]: value }));

  const updateActivity = (i: number, a: Activity) => {
    const acts = [...lesson.activities];
    acts[i] = a;
    setField('activities', acts);
  };

  const addActivity = () =>
    setField('activities', [
      ...lesson.activities,
      {
        id: generateId(),
        name: '',
        planned_duration: 10,
        notes: '',
        students_understood: false,
        students_struggled: false,
        completed: false,
      },
    ]);

  const removeActivity = (i: number) =>
    setField('activities', lesson.activities.filter((_, idx) => idx !== i));

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Lesson Plan' : 'New Lesson Plan'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Plan your lesson structure, objectives, and differentiation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="btn-secondary"
          >
            <Library size={16} />
            Templates
          </button>
          <button
            form="lesson-form"
            type="submit"
            className="btn-primary"
          >
            <Save size={16} />
            {saved ? 'Saved!' : 'Save Plan'}
          </button>
        </div>
      </div>

      <form id="lesson-form" onSubmit={handleSave}>
        {/* Basics */}
        <Section title="Lesson Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Lesson Title *</label>
              <input
                type="text"
                required
                value={lesson.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g. Introduction to Fractions"
                className="input"
              />
            </div>
            <div>
              <label className="label">Subject</label>
              <select
                value={lesson.subject}
                onChange={(e) => setField('subject', e.target.value)}
                className="input"
              >
                <option value="">Select subject…</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Year Group</label>
              <select
                value={lesson.year_group}
                onChange={(e) => setField('year_group', e.target.value)}
                className="input"
              >
                <option value="">Select year group…</option>
                {YEAR_GROUPS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Class / Group</label>
              <input
                type="text"
                value={lesson.class_name}
                onChange={(e) => setField('class_name', e.target.value)}
                placeholder="e.g. 8B, Set 2"
                className="input"
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={lesson.date}
                onChange={(e) => setField('date', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                max={480}
                value={lesson.duration}
                onChange={(e) => setField('duration', Number(e.target.value))}
                className="input"
              />
            </div>
          </div>
        </Section>

        {/* Objectives & Criteria */}
        <Section title="Learning Objectives & Success Criteria">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ListInput
              label="Learning Objectives"
              items={lesson.objectives}
              onChange={(items) => setField('objectives', items)}
              placeholder="Objective"
            />
            <ListInput
              label="Success Criteria"
              items={lesson.success_criteria}
              onChange={(items) => setField('success_criteria', items)}
              placeholder="Success criterion"
            />
          </div>
        </Section>

        {/* Activities */}
        <Section title="Activities Breakdown">
          <div className="space-y-3 mb-4">
            {lesson.activities.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No activities added yet. Click below to add one.
              </p>
            ) : (
              lesson.activities.map((a, i) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  index={i}
                  onChange={(updated) => updateActivity(i, updated)}
                  onDelete={() => removeActivity(i)}
                />
              ))
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={addActivity}
              className="btn-secondary"
            >
              <Plus size={15} />
              Add Activity
            </button>
            {lesson.activities.length > 0 && (
              <p className="text-sm text-gray-500">
                Total planned:{' '}
                <span className="font-medium">
                  {lesson.activities.reduce((s, a) => s + a.planned_duration, 0)} min
                </span>
                {' '}/ {lesson.duration} min
              </p>
            )}
          </div>
        </Section>

        {/* EAL Support */}
        <Section title="EAL Support (English as an Additional Language)" defaultOpen={false}>
          <div className="space-y-4">
            <TagInput
              label="EAL Strategies Used"
              tags={lesson.differentiation.eal.strategies_used}
              onChange={(tags) =>
                setField('differentiation', {
                  ...lesson.differentiation,
                  eal: { ...lesson.differentiation.eal, strategies_used: tags },
                })
              }
              suggestions={EAL_STRATEGIES}
              placeholder="Add EAL strategy…"
            />
            <TagInput
              label="Key Vocabulary Introduced"
              tags={lesson.differentiation.eal.vocabulary_introduced}
              onChange={(tags) =>
                setField('differentiation', {
                  ...lesson.differentiation,
                  eal: { ...lesson.differentiation.eal, vocabulary_introduced: tags },
                })
              }
              placeholder="Add vocabulary word…"
            />
            <div>
              <label className="label">Student Understanding Level (EAL)</label>
              <select
                value={lesson.differentiation.eal.student_understanding_level}
                onChange={(e) =>
                  setField('differentiation', {
                    ...lesson.differentiation,
                    eal: {
                      ...lesson.differentiation.eal,
                      student_understanding_level: e.target.value as
                        | ''
                        | 'low'
                        | 'developing'
                        | 'secure',
                    },
                  })
                }
                className="input"
              >
                <option value="">Not assessed</option>
                <option value="low">Low — needs significant language support</option>
                <option value="developing">Developing — making progress</option>
                <option value="secure">Secure — accessing curriculum well</option>
              </select>
            </div>
            <div>
              <label className="label">EAL Notes</label>
              <textarea
                rows={3}
                value={lesson.differentiation.eal.notes}
                onChange={(e) =>
                  setField('differentiation', {
                    ...lesson.differentiation,
                    eal: { ...lesson.differentiation.eal, notes: e.target.value },
                  })
                }
                placeholder="Any additional EAL support notes…"
                className="textarea"
              />
            </div>
          </div>
        </Section>

        {/* SEN Support */}
        <Section title="SEN Support (Special Educational Needs)" defaultOpen={false}>
          <div className="space-y-4">
            <TagInput
              label="Accommodations Used"
              tags={lesson.differentiation.sen.accommodations_used}
              onChange={(tags) =>
                setField('differentiation', {
                  ...lesson.differentiation,
                  sen: { ...lesson.differentiation.sen, accommodations_used: tags },
                })
              }
              suggestions={SEN_ACCOMMODATIONS}
              placeholder="Add accommodation…"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Behaviour Notes</label>
                <textarea
                  rows={3}
                  value={lesson.differentiation.sen.behaviour_notes}
                  onChange={(e) =>
                    setField('differentiation', {
                      ...lesson.differentiation,
                      sen: {
                        ...lesson.differentiation.sen,
                        behaviour_notes: e.target.value,
                      },
                    })
                  }
                  placeholder="Behaviour observations…"
                  className="textarea"
                />
              </div>
              <div>
                <label className="label">Engagement Notes</label>
                <textarea
                  rows={3}
                  value={lesson.differentiation.sen.engagement_notes}
                  onChange={(e) =>
                    setField('differentiation', {
                      ...lesson.differentiation,
                      sen: {
                        ...lesson.differentiation.sen,
                        engagement_notes: e.target.value,
                      },
                    })
                  }
                  placeholder="Engagement observations…"
                  className="textarea"
                />
              </div>
            </div>
            <div>
              <label className="label">Progress Notes</label>
              <textarea
                rows={3}
                value={lesson.differentiation.sen.progress_notes}
                onChange={(e) =>
                  setField('differentiation', {
                    ...lesson.differentiation,
                    sen: {
                      ...lesson.differentiation.sen,
                      progress_notes: e.target.value,
                    },
                  })
                }
                placeholder="Student progress notes…"
                className="textarea"
              />
            </div>
          </div>
        </Section>

        {/* Gifted & Talented */}
        <Section title="Gifted & Talented Extension" defaultOpen={false}>
          <ListInput
            label="Extension Activities"
            items={lesson.differentiation.gifted_extension}
            onChange={(items) =>
              setField('differentiation', {
                ...lesson.differentiation,
                gifted_extension: items,
              })
            }
            placeholder="Extension activity"
          />
        </Section>

        {/* Resources */}
        <Section title="Resources & Materials" defaultOpen={false}>
          <ListInput
            label="Resources needed"
            items={lesson.resources}
            onChange={(items) => setField('resources', items)}
            placeholder="Resource"
          />
        </Section>

        {/* Save button at bottom */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            <Save size={16} />
            {saved ? 'Saved!' : isEdit ? 'Update Plan' : 'Save Plan'}
          </button>
        </div>
      </form>

      {/* Template Picker Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Choose Template</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {state.templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl.id)}
                  className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{tpl.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{tpl.description}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 ml-2">
                      <span className="badge badge-gray text-xs">{tpl.subject}</span>
                      <span className="badge badge-blue text-xs">{tpl.duration} min</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanner;
