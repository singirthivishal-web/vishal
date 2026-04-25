import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialColumns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

const mockTasks = [
  { id: 't1', title: 'Research competitors', description: 'Analyze top 3 competitors in the market.', priority: 'High', columnId: 'todo' },
  { id: 't2', title: 'Setup project repo', description: 'Initialize React, Vite, and Tailwind.', priority: 'Medium', columnId: 'in-progress' },
  { id: 't3', title: 'Write design specs', description: 'Finalize Figma designs for the dashboard.', priority: 'Low', columnId: 'done' },
];

export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: mockTasks,
      columns: initialColumns,
      searchTerm: '',
      
      setSearchTerm: (term) => set({ searchTerm: term }),

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: Date.now().toString() }]
      })),

      editTask: (id, updatedTask) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === id ? { ...task, ...updatedTask } : task
        ),
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id)
      })),

      moveTask: (taskId, newColumnId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, columnId: newColumnId } : task
        ),
      })),
    }),
    {
      name: 'trello-storage', // name of the item in the storage (must be unique)
    }
  )
);
