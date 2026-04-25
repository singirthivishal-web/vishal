import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaskStore } from '../context/useTaskStore';
import { X, Calendar, Edit3, Trash2, Building2, DollarSign, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

const TaskView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tasks, columns, deleteTask } = useTaskStore();

  const task = tasks.find(t => t.id === id);
  if (!task) return null;

  const column = columns.find(c => c.id === task.columnId);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteTask(id);
      navigate('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="bg-surface border border-secondary/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">

        {/* Header Actions */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button
            onClick={() => navigate(`/dashboard/edit/${id}`)}
            className="p-2 text-textMuted hover:text-primary bg-background hover:bg-background/80 rounded-full transition-colors"
            title="Edit Application"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-textMuted hover:text-danger bg-background hover:bg-background/80 rounded-full transition-colors"
            title="Delete Application"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-6 bg-secondary/30 mx-1" />
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-textMuted hover:text-textMain bg-background hover:bg-background/80 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-8 pt-10 max-h-[85vh] overflow-y-auto">

          {/* Status badges */}
          <div className="flex items-center gap-3 mb-4">
            <span className={cn(
              'text-xs px-2.5 py-1 rounded-md font-medium border uppercase tracking-wider',
              task.priority === 'High'   ? 'bg-danger/20 text-danger border-danger/30' :
              task.priority === 'Medium' ? 'bg-warning/20 text-warning border-warning/30' :
                                           'bg-success/20 text-success border-success/30'
            )}>
              {task.priority || 'Low'} Priority
            </span>
            <span className="text-xs text-textMuted bg-background px-3 py-1 rounded-full border border-secondary/20">
              {column?.title || 'Unknown Status'}
            </span>
          </div>

          {/* Job title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-textMain leading-tight pr-24 mb-1">
            {task.title}
          </h1>

          {/* Company */}
          {task.company && (
            <div className="flex items-center gap-2 text-textMuted mt-2 mb-6">
              <Building2 className="w-4 h-4" />
              <span className="text-base font-medium text-textMain/70">{task.company}</span>
            </div>
          )}

          <div className="space-y-5 mt-4">

            {/* Salary & URL cards */}
            {(task.salary || task.url) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {task.salary && (
                  <div className="bg-background/50 border border-secondary/10 rounded-xl p-4 flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-success flex-shrink-0" />
                    <div>
                      <p className="text-xs text-textMuted uppercase tracking-wider">Salary Range</p>
                      <p className="text-textMain font-semibold mt-0.5">{task.salary}</p>
                    </div>
                  </div>
                )}
                {task.url && (
                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3 hover:bg-primary/20 transition-colors group"
                  >
                    <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-xs text-textMuted uppercase tracking-wider">Job Posting</p>
                      <p className="text-primary font-semibold mt-0.5">View Job Post →</p>
                    </div>
                  </a>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <h3 className="text-sm font-semibold text-textMuted mb-2 uppercase tracking-wider">Notes</h3>
              <div className="bg-background/50 border border-secondary/10 rounded-xl p-5 min-h-[100px]">
                {task.description ? (
                  <p className="text-textMain whitespace-pre-wrap leading-relaxed">{task.description}</p>
                ) : (
                  <p className="text-textMuted italic">No notes added yet...</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 text-sm text-textMuted pt-4 border-t border-secondary/10">
              <Calendar className="w-4 h-4" />
              <span>Application ID: {task.id.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskView;
