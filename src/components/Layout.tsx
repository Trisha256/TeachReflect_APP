import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Library,
  Zap,
  Menu,
  X,
  GraduationCap,
  Bell,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isThisWeek } from '../utils/helpers';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/lessons', icon: BookOpen, label: 'Lessons' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/templates', icon: Library, label: 'Templates' },
  { to: '/quick-reflect', icon: Zap, label: 'Quick Reflect' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { state } = useApp();

  // Count lessons without reflection this week
  const pendingReflections = state.lessons.filter(
    (l) =>
      isThisWeek(l.date) &&
      l.status !== 'completed' &&
      l.status !== 'in_progress' &&
      l.date <= new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">TeachReflect</p>
            <p className="text-xs text-gray-500 mt-0.5">Lesson & Reflection</p>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Pending reminders */}
        {pendingReflections > 0 && (
          <div className="mx-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Bell size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                {pendingReflections} lesson{pendingReflections > 1 ? 's' : ''} this
                week still need{pendingReflections === 1 ? 's' : ''} reflection.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">TeachReflect v1.0</p>
          <p className="text-xs text-gray-400">EAL & SEN Supported</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-900">TeachReflect</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
