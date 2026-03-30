import React, { useState } from 'react';
import {
  Plus,
  Search,
  Users,
  X,
  Save,
  Trash2,
  Edit,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Student, EALLevel, NoteType, VocabularyEntry, StudentNote } from '../types';
import {
  generateId,
  createDefaultStudent,
  YEAR_GROUPS,
  ealLevelLabel,
  formatDate,
} from '../utils/helpers';

const SEN_OPTIONS = [
  'ADHD', 'Autism Spectrum Condition (ASC)', 'Dyslexia', 'Dyscalculia',
  'Speech & Language', 'Hearing Impairment', 'Visual Impairment',
  'Social, Emotional & Mental Health (SEMH)', 'Physical Disability',
  'Medical Needs', 'Down Syndrome', 'Moderate Learning Difficulty (MLD)',
];

const NOTE_TYPES: { value: NoteType; label: string; color: string }[] = [
  { value: 'general', label: 'General', color: 'badge-gray' },
  { value: 'progress', label: 'Progress', color: 'badge-blue' },
  { value: 'achievement', label: 'Achievement', color: 'badge-green' },
  { value: 'concern', label: 'Concern', color: 'badge-red' },
];

// ─── Student Form Modal ────────────────────────────────────────────────────────
const StudentFormModal: React.FC<{
  student?: Student | null;
  onSave: (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}> = ({ student, onSave, onClose }) => {
  const [data, setData] = useState(
    student
      ? { ...student }
      : createDefaultStudent()
  );
  const [senInput, setSenInput] = useState('');
  const [showSenSuggestions, setShowSenSuggestions] = useState(false);

  const addSen = (need: string) => {
    if (need.trim() && !data.sen_needs.includes(need.trim())) {
      setData((p) => ({ ...p, sen_needs: [...p.sen_needs, need.trim()] }));
    }
    setSenInput('');
    setShowSenSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {student ? 'Edit Student' : 'Add Student'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              required
              type="text"
              value={data.name}
              onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Student name"
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Year Group</label>
              <select
                value={data.year_group}
                onChange={(e) => setData((p) => ({ ...p, year_group: e.target.value }))}
                className="input"
              >
                <option value="">Select…</option>
                {YEAR_GROUPS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Class / Group</label>
              <input
                type="text"
                value={data.class_name}
                onChange={(e) => setData((p) => ({ ...p, class_name: e.target.value }))}
                placeholder="e.g. 8B"
                className="input"
              />
            </div>
          </div>

          {/* EAL */}
          <div>
            <label className="label">EAL Level</label>
            <select
              value={data.eal_level}
              onChange={(e) => setData((p) => ({ ...p, eal_level: e.target.value as EALLevel }))}
              className="input"
            >
              {Object.entries(ealLevelLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* SEN */}
          <div>
            <label className="label">SEN Needs</label>
            <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg min-h-[42px] bg-white">
              {data.sen_needs.map((need) => (
                <span key={need} className="flex items-center gap-1 badge badge-purple text-xs">
                  {need}
                  <button
                    type="button"
                    onClick={() =>
                      setData((p) => ({ ...p, sen_needs: p.sen_needs.filter((n) => n !== need) }))
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <div className="relative flex-1 min-w-32">
                <input
                  type="text"
                  value={senInput}
                  onChange={(e) => {
                    setSenInput(e.target.value);
                    setShowSenSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addSen(senInput); }
                  }}
                  onFocus={() => setShowSenSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSenSuggestions(false), 150)}
                  placeholder={data.sen_needs.length === 0 ? 'Add SEN need…' : ''}
                  className="text-sm outline-none bg-transparent w-full"
                />
                {showSenSuggestions && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {SEN_OPTIONS.filter(
                      (s) =>
                        (!senInput || s.toLowerCase().includes(senInput.toLowerCase())) &&
                        !data.sen_needs.includes(s)
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={() => addSen(s)}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gifted */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.is_gifted}
              onChange={(e) => setData((p) => ({ ...p, is_gifted: e.target.checked }))}
              className="w-4 h-4 rounded text-primary-600"
            />
            <span className="text-sm text-gray-700">Gifted & Talented</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              <Save size={15} />
              {student ? 'Update' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Student Detail Panel ──────────────────────────────────────────────────────
const StudentDetailPanel: React.FC<{
  student: Student;
  onUpdate: (s: Student) => void;
  onClose: () => void;
}> = ({ student, onUpdate, onClose }) => {
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('general');
  const [vocabWord, setVocabWord] = useState('');
  const [vocabDef, setVocabDef] = useState('');
  const [showVocabForm, setShowVocabForm] = useState(false);
  const { state } = useApp();
  const [expanded, setExpanded] = useState({ notes: true, vocab: false });

  const addNote = () => {
    if (!noteText.trim()) return;
    const note: StudentNote = {
      id: generateId(),
      date: new Date().toISOString(),
      note: noteText.trim(),
      type: noteType,
    };
    onUpdate({ ...student, notes: [note, ...student.notes] });
    setNoteText('');
  };

  const deleteNote = (id: string) =>
    onUpdate({ ...student, notes: student.notes.filter((n) => n.id !== id) });

  const addVocab = () => {
    if (!vocabWord.trim()) return;
    const entry: VocabularyEntry = {
      id: generateId(),
      word: vocabWord.trim(),
      definition: vocabDef.trim(),
      date_introduced: new Date().toISOString(),
      mastered: false,
    };
    onUpdate({ ...student, vocabulary: [...student.vocabulary, entry] });
    setVocabWord('');
    setVocabDef('');
    setShowVocabForm(false);
  };

  const toggleVocabMastered = (id: string) =>
    onUpdate({
      ...student,
      vocabulary: student.vocabulary.map((v) =>
        v.id === id ? { ...v, mastered: !v.mastered } : v
      ),
    });

  const deleteVocab = (id: string) =>
    onUpdate({ ...student, vocabulary: student.vocabulary.filter((v) => v.id !== id) });

  // Find lessons involving this student's class
  const classLessons = state.lessons.filter(
    (l) =>
      l.class_name === student.class_name || l.year_group === student.year_group
  ).slice(-5);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="badge badge-gray">{student.year_group}</span>
              {student.class_name && (
                <span className="badge badge-gray">{student.class_name}</span>
              )}
              {Boolean(student.eal_level) && (
                <span className="badge badge-blue">
                  EAL: {ealLevelLabel[student.eal_level]}
                </span>
              )}
              {student.sen_needs.map((n) => (
                <span key={n} className="badge badge-purple">{n}</span>
              ))}
              {student.is_gifted && (
                <span className="badge badge-yellow">⭐ Gifted</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Notes */}
          <div>
            <button
              onClick={() => setExpanded((p) => ({ ...p, notes: !p.notes }))}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h4 className="font-semibold text-gray-900 text-sm">
                Student Notes ({student.notes.length})
              </h4>
              {expanded.notes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded.notes && (
              <>
                <div className="flex gap-2 mb-3">
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as NoteType)}
                    className="input w-auto"
                  >
                    {NOTE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Add note…"
                    className="input flex-1"
                  />
                  <button onClick={addNote} className="btn-primary py-2">
                    <Plus size={15} />
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {student.notes.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No notes yet.</p>
                  ) : (
                    student.notes.map((note) => {
                      const nt = NOTE_TYPES.find((t) => t.value === note.type);
                      return (
                        <div key={note.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`badge ${nt?.color} text-xs`}>
                                {nt?.label}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(note.date)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{note.note}</p>
                          </div>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-gray-300 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* Vocabulary (EAL) */}
          {Boolean(student.eal_level) && (
            <div>
              <button
                onClick={() => setExpanded((p) => ({ ...p, vocab: !p.vocab }))}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h4 className="font-semibold text-gray-900 text-sm">
                  🌍 EAL Vocabulary Tracker ({student.vocabulary.length})
                </h4>
                {expanded.vocab ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expanded.vocab && (
                <>
                  {!showVocabForm ? (
                    <button
                      onClick={() => setShowVocabForm(true)}
                      className="btn-secondary text-xs mb-3"
                    >
                      <Plus size={13} />
                      Add Vocabulary
                    </button>
                  ) : (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <input
                        type="text"
                        value={vocabWord}
                        onChange={(e) => setVocabWord(e.target.value)}
                        placeholder="Word"
                        className="input w-32"
                      />
                      <input
                        type="text"
                        value={vocabDef}
                        onChange={(e) => setVocabDef(e.target.value)}
                        placeholder="Definition (optional)"
                        className="input flex-1 min-w-32"
                      />
                      <button onClick={addVocab} className="btn-primary text-xs">
                        Add
                      </button>
                      <button
                        onClick={() => setShowVocabForm(false)}
                        className="btn-secondary text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {student.vocabulary.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No vocabulary tracked yet.</p>
                    ) : (
                      student.vocabulary.map((v) => (
                        <div
                          key={v.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border ${
                            v.mastered
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <button
                            onClick={() => toggleVocabMastered(v.id)}
                            title={v.mastered ? 'Mark as not mastered' : 'Mark as mastered'}
                            className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
                              v.mastered
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium ${v.mastered ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {v.word}
                            </span>
                            {v.definition && (
                              <span className="text-xs text-gray-500 ml-2">— {v.definition}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatDate(v.date_introduced)}
                          </span>
                          <button
                            onClick={() => deleteVocab(v.id)}
                            className="text-gray-300 hover:text-red-500"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Recent Lessons */}
          {classLessons.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">
                <BookOpen size={14} className="inline mr-1" />
                Recent Class Lessons
              </h4>
              <div className="space-y-1.5">
                {classLessons.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 text-sm">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        l.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-gray-700">{l.title || 'Untitled'}</span>
                    <span className="text-gray-400 text-xs ml-auto">
                      {formatDate(l.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const StudentProfiles: React.FC = () => {
  const { state, addStudent, updateStudent, deleteStudent } = useApp();
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = state.students.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class_name.toLowerCase().includes(search.toLowerCase());
    const matchYear = !filterYear || s.year_group === filterYear;
    const matchType =
      !filterType ||
      (filterType === 'eal' && Boolean(s.eal_level)) ||
      (filterType === 'sen' && s.sen_needs.length > 0) ||
      (filterType === 'gifted' && s.is_gifted);
    return matchSearch && matchYear && matchType;
  });

  const handleSaveStudent = (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (editStudent) {
      updateStudent({ ...editStudent, ...data });
    } else {
      addStudent(data);
    }
    setShowForm(false);
    setEditStudent(null);
  };

  const handleEdit = (s: Student) => {
    setEditStudent(s);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profiles</h1>
          <p className="text-sm text-gray-500 mt-1">
            {state.students.length} student{state.students.length !== 1 ? 's' : ''} —{' '}
            {state.students.filter((s) => Boolean(s.eal_level)).length} EAL ·{' '}
            {state.students.filter((s) => s.sen_needs.length > 0).length} SEN
          </p>
        </div>
        <button onClick={() => { setEditStudent(null); setShowForm(true); }} className="btn-primary">
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Year Groups</option>
            {YEAR_GROUPS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Students</option>
            <option value="eal">EAL Only</option>
            <option value="sen">SEN Only</option>
            <option value="gifted">Gifted & Talented</option>
          </select>
        </div>
      </div>

      {/* Student Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No students found</p>
          <p className="text-gray-400 text-sm mt-1">
            {state.students.length === 0
              ? 'Add student profiles to track EAL vocabulary, SEN progress, and more.'
              : 'Try adjusting your filters.'}
          </p>
          {state.students.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mt-4 inline-flex"
            >
              <Plus size={14} />
              Add First Student
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setViewStudent(student)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-xs text-gray-500">
                    {student.year_group} {student.class_name && `· ${student.class_name}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(student); }}
                    className="text-gray-400 hover:text-primary-600 p-1"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(student.id); }}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Boolean(student.eal_level) && (
                  <span className="badge badge-blue text-xs">
                    EAL: {ealLevelLabel[student.eal_level]}
                  </span>
                )}
                {student.sen_needs.slice(0, 2).map((n) => (
                  <span key={n} className="badge badge-purple text-xs">{n}</span>
                ))}
                {student.sen_needs.length > 2 && (
                  <span className="badge badge-gray text-xs">+{student.sen_needs.length - 2}</span>
                )}
                {student.is_gifted && (
                  <span className="badge badge-yellow text-xs">⭐ Gifted</span>
                )}
              </div>
              {(student.notes.length > 0 || student.vocabulary.length > 0) && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex gap-3 text-xs text-gray-400">
                  {student.notes.length > 0 && (
                    <span>{student.notes.length} note{student.notes.length !== 1 ? 's' : ''}</span>
                  )}
                  {student.vocabulary.length > 0 && (
                    <span>{student.vocabulary.length} vocab</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <StudentFormModal
          student={editStudent}
          onSave={handleSaveStudent}
          onClose={() => { setShowForm(false); setEditStudent(null); }}
        />
      )}

      {viewStudent && (
        <StudentDetailPanel
          student={viewStudent}
          onUpdate={(s) => { updateStudent(s); setViewStudent(s); }}
          onClose={() => setViewStudent(null)}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Student?</h3>
            <p className="text-sm text-gray-600 mb-4">
              All notes and vocabulary data for this student will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button
                onClick={() => { deleteStudent(confirmDelete); setConfirmDelete(null); }}
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

export default StudentProfiles;
