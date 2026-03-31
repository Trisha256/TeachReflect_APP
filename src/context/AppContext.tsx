import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import type { Lesson, Student, LessonTemplate, AppState } from '../types';
import { BUILTIN_TEMPLATES } from '../utils/templates';
import { generateId } from '../utils/helpers';

// ─── Actions ───────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ADD_LESSON'; lesson: Lesson }
  | { type: 'UPDATE_LESSON'; lesson: Lesson }
  | { type: 'DELETE_LESSON'; id: string }
  | { type: 'ADD_STUDENT'; student: Student }
  | { type: 'UPDATE_STUDENT'; student: Student }
  | { type: 'DELETE_STUDENT'; id: string }
  | { type: 'ADD_TEMPLATE'; template: LessonTemplate }
  | { type: 'DELETE_TEMPLATE'; id: string }
  | { type: 'LOAD_STATE'; state: AppState };

// ─── Reducer ───────────────────────────────────────────────────────────────────
const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_LESSON':
      return { ...state, lessons: [...state.lessons, action.lesson] };
    case 'UPDATE_LESSON':
      return {
        ...state,
        lessons: state.lessons.map((l) =>
          l.id === action.lesson.id ? action.lesson : l
        ),
      };
    case 'DELETE_LESSON':
      return {
        ...state,
        lessons: state.lessons.filter((l) => l.id !== action.id),
      };
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.student] };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === action.student.id ? action.student : s
        ),
      };
    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter((s) => s.id !== action.id),
      };
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.template] };
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter((t) => t.id !== action.id),
      };
    case 'LOAD_STATE':
      return action.state;
    default:
      return state;
  }
};

// ─── Initial State ─────────────────────────────────────────────────────────────
const initialState: AppState = {
  lessons: [],
  students: [],
  templates: BUILTIN_TEMPLATES,
};

const STORAGE_KEY = 'teachreflect_data';

const loadFromStorage = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Merge built-in templates with stored custom templates
    const customTemplates = (parsed.templates ?? []).filter((t) => !t.is_builtin);
    return {
      lessons: parsed.lessons ?? [],
      students: parsed.students ?? [],
      templates: [...BUILTIN_TEMPLATES, ...customTemplates],
    };
  } catch {
    return initialState;
  }
};

// ─── Context ───────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  addLesson: (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => Lesson;
  updateLesson: (lesson: Lesson) => void;
  deleteLesson: (id: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addTemplate: (template: Omit<LessonTemplate, 'id' | 'created_at'>) => LessonTemplate;
  deleteTemplate: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState, loadFromStorage);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      // Only save custom templates
      const customTemplates = state.templates.filter((t) => !t.is_builtin);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lessons: state.lessons,
          students: state.students,
          templates: customTemplates,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  const addLesson = useCallback(
    (data: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Lesson => {
      const now = new Date().toISOString();
      const lesson: Lesson = {
        ...data,
        id: generateId(),
        created_at: now,
        updated_at: now,
      };
      dispatch({ type: 'ADD_LESSON', lesson });
      return lesson;
    },
    []
  );

  const updateLesson = useCallback((lesson: Lesson) => {
    dispatch({
      type: 'UPDATE_LESSON',
      lesson: { ...lesson, updated_at: new Date().toISOString() },
    });
  }, []);

  const deleteLesson = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LESSON', id });
  }, []);

  const addStudent = useCallback(
    (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Student => {
      const now = new Date().toISOString();
      const student: Student = {
        ...data,
        id: generateId(),
        created_at: now,
        updated_at: now,
      };
      dispatch({ type: 'ADD_STUDENT', student });
      return student;
    },
    []
  );

  const updateStudent = useCallback((student: Student) => {
    dispatch({
      type: 'UPDATE_STUDENT',
      student: { ...student, updated_at: new Date().toISOString() },
    });
  }, []);

  const deleteStudent = useCallback((id: string) => {
    dispatch({ type: 'DELETE_STUDENT', id });
  }, []);

  const addTemplate = useCallback(
    (data: Omit<LessonTemplate, 'id' | 'created_at'>): LessonTemplate => {
      const template: LessonTemplate = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_TEMPLATE', template });
      return template;
    },
    []
  );

  const deleteTemplate = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', id });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        addLesson,
        updateLesson,
        deleteLesson,
        addStudent,
        updateStudent,
        deleteStudent,
        addTemplate,
        deleteTemplate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
