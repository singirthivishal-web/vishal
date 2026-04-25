import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils';
import { GripVertical, Eye, Building2, DollarSign, ExternalLink } from 'lucide-react';
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
      
      <h4 className="font-semibold text-textMain mb-2 line-clamp-2 pr-6">{task.title}</h4>

      {/* Company & Salary */}
      <div className="space-y-1 mb-3">
        {task.company && (
          <div className="flex items-center gap-1.5 text-xs text-textMuted">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate font-medium text-textMain/80">{task.company}</span>
          </div>
        )}
        {task.salary && (
          <div className="flex items-center gap-1.5 text-xs text-textMuted">
            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{task.salary}</span>
          </div>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 border-t border-secondary/10">
        {task.url ? (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Job Post
          </a>
        ) : (
          <span />
        )}

        {/* View Details */}
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/task/${task.id}`); }}
          className="flex items-center gap-1 text-xs text-textMuted hover:text-primary transition-colors"
          title="View Details"
        >
          <Eye className="w-3 h-3" />
          Details
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
