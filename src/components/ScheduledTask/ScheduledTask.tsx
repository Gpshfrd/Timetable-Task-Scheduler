import { minutesToPx } from '../../constants/time';
import type { TaskModel } from '../../models/task';
import { formatTime } from '../../utils/time';
import removeIcon from '../../assets/remove.svg'
import './ScheduledTask.css';

interface ScheduledTaskProps {
    task: TaskModel;
    dayIndex: number;
    onToggleComplete: () => void;
    onDelete: () => void;
    onEdit: (task: TaskModel) => void;
    onDragStart?: (taskId: string, taskTitle: string, duration: number) => void;
    onDragEnd?: () => void; 
}

function ScheduledTask({ 
    task, 
    dayIndex,
    onToggleComplete, 
    onDelete,
    onEdit,
    onDragStart,
    onDragEnd
}: ScheduledTaskProps) {
    if (!task.scheduled) return null;

    const { startMinutes, endMinutes } = task.scheduled;

    const top = minutesToPx(startMinutes);
    const height = minutesToPx(endMinutes - startMinutes);

    const handleTaskClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleComplete();
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(task);
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Do you want to delete task: ${task.title}?`)) {
            onDelete();
        }
    }

    const handleDragStart = (e: React.DragEvent) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);

        const duration = task.scheduled!.endMinutes - task.scheduled!.startMinutes;

        try {
            e.dataTransfer.setData('text/plain', task.id);
        } catch (error) {
            console.error('Could not set dataTransfer');
        }

        if (onDragStart) {
            setTimeout(() => {
                onDragStart(task.id, task.title, duration);
            }, 0)
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.stopPropagation();
        if (onDragEnd) {
            onDragEnd();
        }
    };

    return (
        <div 
            className={`scheduled-task ${task.completed ? 'scheduled-task--completed' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleTaskClick}
            onContextMenu={handleContextMenu}
            title={task.title}
            style={{
                position: 'absolute',
                top: `${top}px`,
                height: `${height - 1}px`,
                left: `calc(100% / 5 * ${dayIndex})`,
                width: `calc(100% / 5 - 16px)`,
                borderColor: `rgba(var(--task-color-${task.colorId}), ${task.completed ? 0.5 : 1})`
            }}
            >
            <div className="scheduled-task__content">
                <small
                    className="scheduled-task__title" 
                    style={{
                        color: `rgba(var(--task-color-${task.colorId}), ${task.completed ? 0.5 : 1})`
                    }}
                >{task.title}</small>
                <small>{formatTime(startMinutes)} - {formatTime(endMinutes)}</small>
            </div>
            <button 
                className="scheduled-task__delete"
                onClick={handleDeleteClick}
            >
                <img src={removeIcon} />
            </button>
        </div>
    )
}

export default ScheduledTask;