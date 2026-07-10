import { useEffect, useState } from "react";
import "./EditTaskModal.css";
import { formatTime, minutesToTimeString, timeStringToMinutes } from "../../utils/time";
import type { TaskModel } from "../../models/task";
import { useTaskConflicts } from "../../hooks/useTasksConflicts";

interface Props {
    task: TaskModel;
    tasks: TaskModel[];
    onClose: () => void;
    onSave: (taskId: string, data: {
        title: string,
        scheduled?: {
            date: string;
            startMinutes: number;
            endMinutes: number;
        }
    }) => void;
}

function EditTaskModal({
    task,
    tasks,
    onClose,
    onSave,
}: Props) {
    if (!task.scheduled) return null;

    const [title, setTitle] = useState(task.title);
    const [start, setStart] = useState(task.scheduled?.startMinutes ?? 9 * 60);
    const [end, setEnd] = useState(task.scheduled?.endMinutes ?? 10 * 60);

    const [hasUserInteractedWithTime, setHasUserInteractedWithTime] = useState(false);

    const date = task.scheduled.date;

    const { hasConflicts, conflictingTasks, availableSlot } = useTaskConflicts({
        tasks,
        date,
        startMinutes: start,
        endMinutes: end,
        excludeTaskId: task.id,
    });

    const isTitleEmpty = title.trim().length === 0;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim) return;

        if (hasConflicts) return;

        if (task.scheduled) {
            onSave(task.id, {
                title: title.trim(),
                scheduled: {
                    date: task.scheduled.date,
                    startMinutes: start,
                    endMinutes: end
                }
            });
        } else {
            onSave(task.id,  {
                title: title.trim()
            })
        }
        onClose();
    };

    const handleStartChange = (value: string) => {
        setHasUserInteractedWithTime(true);
        setStart(timeStringToMinutes(value));
    };

    const handleEndChange = (value: string) => {
        setHasUserInteractedWithTime(true);
        setEnd(timeStringToMinutes(value));
    };

    const showTimeStatus = hasUserInteractedWithTime;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>Edit task</h2>
                <div className="modal__inputs-container">
                    <div className="modal__input-container">
                        <span className="modal__input-title">Title</span>
                        <input 
                            className="modal__input" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="time-inputs">
                        <div className="time-input-container">
                            <span>Start</span>
                            <input 
                                className="time-input" 
                                type="time" 
                                value={minutesToTimeString(start)} 
                                onChange={(e) => handleStartChange(e.target.value)}
                            />
                        </div>
                        <div className="time-input-container">
                            <span>End</span>
                            <input 
                                type="time" 
                                value={minutesToTimeString(end)} 
                                onChange={(e) => handleEndChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {showTimeStatus && (
                        <div className="modal__time-status">
                            {hasConflicts ? (
                                <div className="modal__time-status--conflict">
                                    This time conflicts with {conflictingTasks.length} task(s)
                                    {availableSlot && (
                                        <span className="modal__suggestion">
                                            Suggested: {formatTime(availableSlot.startMinutes)} - {formatTime(availableSlot.endMinutes)}
                                        </span>
                                    )}
                                    {!availableSlot && (
                                        <span className="modal__suggestion">
                                            No available time on this day
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="modal__time-status--free">
                                    Time is available
                                </div>
                            )}
                        </div>
                    )}  
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={isTitleEmpty || hasConflicts} className={(isTitleEmpty || hasConflicts) ? 'modal-actions__disabled' : ''}>Save</button>
                </div>
            </form>
        </div>
    );
}

export default EditTaskModal;