import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialColumns = [
  { id: 'applied', title: 'Applied' },
  { id: 'interviewing', title: 'Interviewing' },
  { id: 'offer', title: 'Offer' },
  { id: 'rejected', title: 'Rejected' }
];

const mockTasks = [
  { id: 'j1', title: 'Senior Frontend Engineer', company: 'TechCorp', salary: '$120k - $150k', url: 'https://techcorp.com/careers', priority: 'High', columnId: 'applied' },
  { id: 'j2', title: 'React Developer', company: 'StartupX', salary: '$110k', url: 'https://startupx.io/jobs', priority: 'Medium', columnId: 'interviewing' },
  { id: 'j3', title: 'UI/UX Engineer', company: 'DesignStudio', salary: '$130k', url: '', priority: 'Low', columnId: 'rejected' },
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
