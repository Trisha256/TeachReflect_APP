import React, { useEffect, lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { generateId, createDefaultLesson } from './utils/helpers';
import Loader from './components/Loader';

// 🔥 Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LessonsList = lazy(() => import('./pages/LessonsList'));
const LessonPlanner = lazy(() => import('./pages/LessonPlanner'));
const LessonDetail = lazy(() => import('./pages/LessonDetail'));
const LessonTracker = lazy(() => import('./pages/LessonTracker'));
const LessonReflection = lazy(() => import('./pages/LessonReflection'));
const StudentProfiles = lazy(() => import('./pages/StudentProfiles'));
const Reports = lazy(() => import('./pages/Reports'));
const Templates = lazy(() => import('./pages/Templates'));
const QuickReflect = lazy(() => import('./pages/QuickReflect'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Wrapper for new lesson with optional template
const NewLessonWrapper: React.FC = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const { state, addLesson } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!templateId) return;

    const tpl = state.templates.find((t) => t.id === templateId);
    if (!tpl) return;

    const base = createDefaultLesson();

    const lesson = addLesson({
      ...base,
      title: tpl.name,
      subject: tpl.subject,
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
      template_id: tpl.id,
      differentiation: {
        eal: tpl.differentiation.eal ?? base.differentiation.eal,
        sen: tpl.differentiation.sen ?? base.differentiation.sen,
        gifted_extension:
          tpl.differentiation.gifted_extension ??
          base.differentiation.gifted_extension,
      },
    });

    navigate(`/lessons/${lesson.id}/plan`, { replace: true });
  }, [templateId, state.templates, addLesson, navigate]);

  if (templateId) return null;

  return <LessonPlanner />;
};

// Protected routes — redirects to /login when unauthenticated
const AppRoutes: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return <Loader />;

  if (!currentUser) {
    return (
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <AppProvider userId={currentUser.id}>
      <Layout>
        {/* 🔥 Suspense wraps all lazy-loaded routes */}
        <Suspense fallback={<div>Loading page...</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lessons" element={<LessonsList />} />
            <Route path="/lessons/new" element={<NewLessonWrapper />} />
            <Route path="/lessons/:id" element={<LessonDetail />} />
            <Route path="/lessons/:id/plan" element={<LessonPlanner />} />
            <Route path="/lessons/:id/track" element={<LessonTracker />} />
            <Route path="/lessons/:id/reflect" element={<LessonReflection />} />
            <Route path="/students" element={<StudentProfiles />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/quick-reflect" element={<QuickReflect />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </AppProvider>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
