import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils';
import { GripVertical, MoreHorizontal, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-danger/20 text-danger border-danger/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-secondary/20 text-textMuted border-secondary/30';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "bg-background p-4 rounded-xl shadow-sm border border-secondary/20 cursor-grab relative group z-10",
        "hover:shadow-md hover:border-secondary/40 transition-all duration-200",
        isDragging && "opacity-50 ring-2 ring-primary cursor-grabbing scale-105 shadow-xl z-50"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div 
          className={cn(
            "text-xs px-2 py-1 rounded-md font-medium border",
            getPriorityColor(task.priority)
          )}
        >
          {task.priority || 'No Priority'}
        </div>
        
        {/* Drag handle */}
        <div {...listeners} className="text-secondary hover:text-textMain pt-1 focus:outline-none p-1 rounded hover:bg-surface/50">
           <GripVertical className="w-4 h-4" />
        </div>
      </div>
      
      <h4 className="font-semibold text-textMain mb-1 line-clamp-2">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-textMuted line-clamp-2 mb-3">{task.description}</p>
      )}
      
      {/* Action overlay */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3 right-3 flex gap-2">
         <button 
           onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/task/${task.id}`); }}
           className="bg-surface p-1.5 rounded-md text-textMain hover:bg-primary hover:text-white transition-colors shadow-sm"
           title="View Details"
         >
           <Eye className="w-3.5 h-3.5" />
         </button>
      </div>
    </div>
  );
};

export default TaskCard;
