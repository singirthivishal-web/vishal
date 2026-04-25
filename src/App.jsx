import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout            from './components/layout/Layout';
import Login             from './pages/Login';
import Dashboard         from './pages/Dashboard';
import AtsSimulation     from './pages/AtsSimulation';
import AiRecruiter       from './pages/AiRecruiter';
import SkillGapOptimizer from './pages/SkillGapOptimizer';
import JobProbability    from './pages/JobProbability';
import Settings          from './pages/Settings';
import TaskForm          from './pages/TaskForm';
import TaskView          from './pages/TaskView';

// Redirect to /login if not authenticated
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Redirect to / if already logged in
function PublicRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index                        element={<Dashboard />} />
            <Route path="ats"                   element={<AtsSimulation />} />
            <Route path="probability"           element={<JobProbability />} />
            <Route path="recruiter"             element={<AiRecruiter />} />
            <Route path="skills"               element={<SkillGapOptimizer />} />
            <Route path="settings"             element={<Settings />} />

            {/* Task management modal-style routes */}
            <Route path="dashboard/task/:id"   element={<TaskView />} />
            <Route path="dashboard/add"        element={<TaskForm />} />
            <Route path="dashboard/edit/:id"   element={<TaskForm />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
