import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LessonsList from './pages/LessonsList';
import LessonPlanner from './pages/LessonPlanner';
import LessonDetail from './pages/LessonDetail';
import LessonTracker from './pages/LessonTracker';
import LessonReflection from './pages/LessonReflection';
import StudentProfiles from './pages/StudentProfiles';
import Reports from './pages/Reports';
import Templates from './pages/Templates';
import QuickReflect from './pages/QuickReflect';
import { generateId, createDefaultLesson } from './utils/helpers';

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
          tpl.differentiation.gifted_extension ?? base.differentiation.gifted_extension,
      },
    });
    navigate(`/lessons/${lesson.id}/plan`, { replace: true });
  }, [templateId]);

  if (templateId) return null;
  return <LessonPlanner />;
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppProvider>
      <Layout>
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
        </Routes>
      </Layout>
    </AppProvider>
  </BrowserRouter>
);

export default App;
