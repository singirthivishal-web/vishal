import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTaskStore } from '../context/useTaskStore';
import { X } from 'lucide-react';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const defaultColumn = searchParams.get('column') || 'todo';

  const { tasks, columns, addTask, editTask } = useTaskStore();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    salary: '',
    url: '',
    description: '',
    priority: 'Low',
    columnId: defaultColumn
  });

  useEffect(() => {
    if (isEditing) {
      const taskToEdit = tasks.find(t => t.id === id);
      if (taskToEdit) {
        setFormData({
          title: taskToEdit.title,
          company: taskToEdit.company || '',
          salary: taskToEdit.salary || '',
          url: taskToEdit.url || '',
          description: taskToEdit.description || '',
          priority: taskToEdit.priority || 'Low',
          columnId: taskToEdit.columnId
        });
      }
    }
  }, [id, isEditing, tasks]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      editTask(id, formData);
    } else {
      addTask(formData);
    }
    navigate('/dashboard');
  };

  const closeModal = () => navigate('/dashboard');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-secondary/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-textMain">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={closeModal} className="text-textMuted hover:text-textMain transition-colors">
             <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Job Role / Title</label>
              <input 
                autoFocus
                required
                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-secondary" 
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Company Name</label>
              <input 
                required
                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-secondary" 
                placeholder="e.g. TechCorp Inc."
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Salary Range</label>
              <input 
                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-secondary" 
                placeholder="e.g. $120k - $150k"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Job Post URL</label>
              <input 
                type="url"
                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-secondary" 
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Description (Optional)</label>
            <textarea 
              rows={4}
              className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none placeholder-secondary" 
              placeholder="Add details about this task..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Priority</label>
              <select 
                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Status Column</label>
              <select 
                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                value={formData.columnId}
                onChange={(e) => setFormData({ ...formData, columnId: e.target.value })}
              >
                {columns.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={closeModal}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-textMuted hover:bg-secondary/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
