import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Library,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  Copy,
  X,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { LessonTemplate } from '../types';
import { SUBJECTS } from '../utils/helpers';

const Templates: React.FC = () => {
  const { state, addTemplate, deleteTemplate } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [newTpl, setNewTpl] = useState({
    name: '',
    description: '',
    subject: 'General',
    duration: 60,
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addTemplate({
      ...newTpl,
      objectives: [''],
      success_criteria: [''],
      activities: [],
      differentiation: {
        eal: { strategies_used: [], vocabulary_introduced: [], student_understanding_level: '', notes: '' },
        sen: { accommodations_used: [], behaviour_notes: '', engagement_notes: '', progress_notes: '' },
        gifted_extension: [],
      },
      resources: [],
      is_builtin: false,
    });
    setShowForm(false);
    setNewTpl({ name: '', description: '', subject: 'General', duration: 60 });
  };

  const builtIn = state.templates.filter((t) => t.is_builtin);
  const custom = state.templates.filter((t) => !t.is_builtin);

  const TemplateCard: React.FC<{ tpl: LessonTemplate }> = ({ tpl }) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {tpl.is_builtin && (
              <span className="badge badge-blue text-xs">Built-in</span>
            )}
            {!tpl.is_builtin && (
              <span className="badge badge-green text-xs">Custom</span>
            )}
            <span className="badge badge-gray text-xs">{tpl.subject}</span>
          </div>
          <h3 className="font-semibold text-gray-900">{tpl.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{tpl.description}</p>
        </div>
        {!tpl.is_builtin && (
          <button
            onClick={() => setConfirmDelete(tpl.id)}
            className="text-gray-400 hover:text-red-600 transition-colors ml-2"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {tpl.duration} min
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={12} />
          {tpl.objectives.filter(Boolean).length} objectives
        </span>
        <span className="flex items-center gap-1">
          <Copy size={12} />
          {tpl.activities.length} activities
        </span>
      </div>

      {/* Preview objectives */}
      {tpl.objectives.filter(Boolean).length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Sample Objectives:</p>
          <ul className="space-y-0.5">
            {tpl.objectives.filter(Boolean).slice(0, 2).map((o, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-primary-400 flex-shrink-0">•</span>
                {o}
              </li>
            ))}
            {tpl.objectives.filter(Boolean).length > 2 && (
              <li className="text-xs text-gray-400">
                +{tpl.objectives.filter(Boolean).length - 2} more…
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Activities preview */}
      {tpl.activities.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Activities:</p>
          <div className="flex flex-wrap gap-1.5">
            {tpl.activities.slice(0, 4).map((a, i) => (
              <span key={i} className="badge badge-gray text-xs">
                {a.name.length > 20 ? a.name.slice(0, 20) + '…' : a.name}
                {' '}({a.planned_duration}m)
              </span>
            ))}
            {tpl.activities.length > 4 && (
              <span className="badge badge-gray text-xs">
                +{tpl.activities.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      <Link
        to={`/lessons/new?template=${tpl.id}`}
        className="btn-primary w-full justify-center text-sm"
      >
        <Plus size={14} />
        Use This Template
      </Link>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-y-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lesson Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Start from a pre-built structure or create your own reusable template.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} />
          Create Template
        </button>
      </div>

      {/* Built-in Templates */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Library size={16} />
          Built-in Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builtIn.map((tpl) => (
            <TemplateCard key={tpl.id} tpl={tpl} />
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Your Custom Templates
        </h2>
        {custom.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <Library size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No custom templates yet</p>
            <p className="text-xs mt-1">Create a template to reuse your lesson structures.</p>
            <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 inline-flex">
              <Plus size={14} />
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {custom.map((tpl) => (
              <TemplateCard key={tpl.id} tpl={tpl} />
            ))}
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Template</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Template Name *</label>
                <input
                  required
                  type="text"
                  value={newTpl.name}
                  onChange={(e) => setNewTpl((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Science Investigation"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  rows={2}
                  value={newTpl.description}
                  onChange={(e) => setNewTpl((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of this template…"
                  className="textarea"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Subject</label>
                  <select
                    value={newTpl.subject}
                    onChange={(e) => setNewTpl((p) => ({ ...p, subject: e.target.value }))}
                    className="input"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="label">Default Duration (min)</label>
                  <input
                    type="number"
                    min={1}
                    max={480}
                    value={newTpl.duration}
                    onChange={(e) =>
                      setNewTpl((p) => ({ ...p, duration: Number(e.target.value) }))
                    }
                    className="input"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                💡 After creating, use this template when planning a lesson to automatically populate the structure. You can then edit the details.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  <Save size={14} />
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Template?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This template will be permanently deleted. Existing lessons using it won't be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button
                onClick={() => { deleteTemplate(confirmDelete); setConfirmDelete(null); }}
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

export default Templates;
