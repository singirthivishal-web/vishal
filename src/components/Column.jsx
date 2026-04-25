import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { cn } from '../lib/utils';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Column = ({ column, tasks }) => {
  const navigate = useNavigate();
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      className="flex flex-col w-80 shrink-0 mx-2"
    >
      {/* Column Header */}
      <div className="bg-surface rounded-t-xl px-4 py-3 border-b border-secondary/20 flex justify-between items-center shadow-sm">
        <h3 className="font-semibold text-textMain">{column.title}</h3>
        <div className="bg-background text-textMuted px-2 py-0.5 rounded-full text-xs font-medium">
          {tasks.length}
        </div>
      </div>

      {/* Column Body / Droppable Area */}
      <div 
        ref={setNodeRef}
        className={cn(
          "bg-surface/50 rounded-b-xl p-2 flex-1 min-h-[150px] transition-colors duration-200 border-x border-b border-secondary/10",
          isOver ? "bg-surface ring-2 ring-primary/50" : ""
        )}
      >
        <div className="space-y-3">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
        
        {/* Add Task Button for this specific column */}
        <button 
          onClick={() => navigate(`/dashboard/add?column=${column.id}`)}
          className="mt-3 w-full py-2.5 flex justify-center items-center gap-1 text-sm font-medium text-textMuted hover:bg-surface hover:text-textMain rounded-lg transition-colors duration-200 border border-dashed border-secondary/30"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>
    </div>
  );
};

export default Column;
