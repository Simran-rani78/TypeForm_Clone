import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Mail, AlignLeft, CheckSquare, List, Hash, Star, Phone, MapPin, Upload, CreditCard, Calendar, Smile, ToggleLeft, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  id: string;
  question: any;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
  index: number;
}

const getQuestionIcon = (type: string, active: boolean) => {
  const iconProps = { className: cn("w-4 h-4", active ? "text-pink-600" : "text-zinc-500") };
  switch (type) {
    case 'email': return <Mail {...iconProps} />;
    case 'phone': return <Phone {...iconProps} />;
    case 'address': return <MapPin {...iconProps} />;
    case 'multiple_choice': return <CheckSquare {...iconProps} />;
    case 'dropdown': return <List {...iconProps} />;
    case 'yes_no': return <ToggleLeft {...iconProps} />;
    case 'short_text': 
    case 'long_text': return <AlignLeft {...iconProps} />;
    case 'number': return <Hash {...iconProps} />;
    case 'rating': return <Star {...iconProps} />;
    case 'file_upload': return <Upload {...iconProps} />;
    case 'payment': return <CreditCard {...iconProps} />;
    case 'date': return <Calendar {...iconProps} />;
    case 'nps': return <Smile {...iconProps} />;
    default: return <AlignLeft {...iconProps} />;
  }
};

export function SortableItem({ id, question, isActive, onClick, onDelete, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between p-1.5 cursor-pointer transition-colors rounded-md",
        isActive ? "bg-pink-100" : "hover:bg-zinc-200/50 bg-white",
        isDragging && "opacity-50 shadow-lg z-50 ring-2 ring-zinc-900"
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
            isActive ? "text-pink-600" : "text-zinc-400 hover:text-zinc-900"
          )}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        
        <div className="flex items-center gap-2">
          {getQuestionIcon(question.type, isActive)}
          <span className={cn(
            "text-sm font-medium",
            isActive ? "text-pink-600" : "text-zinc-700"
          )}>
            {index + 1}
          </span>
        </div>
      </div>
    </div>
  );
}
