import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaskStore } from '../context/useTaskStore';
import { X, Calendar, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

const TaskView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tasks, columns, deleteTask } = useTaskStore();

  const task = tasks.find(t => t.id === id);

  if (!task) return null; // Handle smoothly if invalid ID

  const column = columns.find(c => c.id === task.columnId);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
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
            className="p-2 text-textMuted hover:text-primary bg-background hover:bg-background/80 rounded-full transition-colors group relative"
            title="Edit Task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 text-textMuted hover:text-danger bg-background hover:bg-background/80 rounded-full transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-6 bg-secondary/30 mx-1"></div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-textMuted hover:text-textMain bg-background hover:bg-background/80 rounded-full transition-colors"
          >
             <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pt-10">
          <div className="flex items-center gap-3 mb-6">
            <span className={cn(
              "text-xs px-2.5 py-1 rounded-md font-medium border uppercase tracking-wider",
              task.priority === 'High' ? 'bg-danger/20 text-danger border-danger/30' :
              task.priority === 'Medium' ? 'bg-warning/20 text-warning border-warning/30' :
              'bg-success/20 text-success border-success/30'
            )}>
              {task.priority || 'Low'} Priority
            </span>
            <span className="text-xs text-textMuted bg-background px-3 py-1 rounded-full border border-secondary/20">
              {column?.title || 'Unknown Status'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-textMain mb-4 leading-tight">
            {task.title}
          </h1>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-textMuted mb-2 uppercase tracking-wider">Description</h3>
              <div className="bg-background/50 border border-secondary/10 rounded-xl p-5 min-h-[120px]">
                {task.description ? (
                  <p className="text-textMain whitespace-pre-wrap leading-relaxed">{task.description}</p>
                ) : (
                  <p className="text-textMuted italic">No description provided...</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-textMuted pt-4 border-t border-secondary/10">
               <Calendar className="w-4 h-4" />
               <span>Task ID: {task.id.substring(0,8)}...</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskView;
