import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout            from './components/layout/Layout';
import Dashboard         from './pages/Dashboard';
import AtsSimulation     from './pages/AtsSimulation';
import AiRecruiter       from './pages/AiRecruiter';
import SkillGapOptimizer from './pages/SkillGapOptimizer';
import JobProbability    from './pages/JobProbability';
import Settings          from './pages/Settings';
import TaskForm          from './pages/TaskForm';
import TaskView          from './pages/TaskView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
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
      </Routes>
    </BrowserRouter>
  );
}
