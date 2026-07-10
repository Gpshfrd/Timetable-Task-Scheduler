import { useEffect, useRef, useState } from "react";
import "./CreateTaskModal.css";
import { formatTime, minutesToTimeString, roundToStep, timeStringToMinutes } from "../../utils/time";
import type { TaskModel } from "../../models/task";
import { useTaskConflicts } from "../../hooks/useTasksConflicts";

interface Props {
    scheduled?: {
        date: string;
        startMinutes: number;
        endMinutes: number;
    }
    tasks?: TaskModel[];
    onClose: () => void;
    onCreate: (data: {
        title: string,
        scheduled?: {
            date: string,
            startMinutes: number,
            endMinutes: number,
        }
    }) => void;
}

function CreateTaskModal({
    scheduled,
    onClose,
    onCreate,
    tasks = []
}: Props) {
    const [title, setTitle] = useState("");

    const [start, setStart] = useState(() => {
        if (scheduled) {
            return roundToStep(scheduled.startMinutes);
        }
        return roundToStep(9 * 60);
    });
    
    const [end, setEnd] = useState(() => {
        if (scheduled) {
            return roundToStep(scheduled.endMinutes);
        }
        return roundToStep(10 * 60);
    });

    const [hasUserInteractedWithTime, setHasUserInteractedWithTime] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);

    const { hasConflicts, conflictingTasks, availableSlot } = useTaskConflicts({
        tasks,
        date: scheduled?.date || "",
        startMinutes: start,
        endMinutes: end,
        excludeTaskId: undefined,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        if (conflictingTasks.length > 0) {
            alert('This time slot conflicts with existing tasks. Please choose a different time.');
            return;
        }

        const taskData: {
            title: string,
            scheduled?: {
                date: string;
                startMinutes: number;
                endMinutes: number;
            };
        } = {
            title: title.trim(),
        }

        if (scheduled) {
            taskData.scheduled = {
                date: scheduled.date,
                startMinutes: start,
                endMinutes: end
            }
        }

        onCreate(taskData);
        onClose();
    }

    const handleStartChange = (value: string) => {
        setHasUserInteractedWithTime(true);
        setStart(timeStringToMinutes(value));
    }

    const handleEndChange = (value: string) => {
        setHasUserInteractedWithTime(true);
        setEnd(timeStringToMinutes(value));
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [onClose]);

    useEffect(() => {
        const titleInput = document.querySelector('.modal__input');
        if (titleInput instanceof HTMLInputElement) {
            titleInput.focus();
        }
    }, [])

    const showTimeStatus = scheduled && hasUserInteractedWithTime;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <form className="modal__inputs-container" onSubmit={handleSubmit}>
                    <h2>New task</h2>
                    <div className="modal__inputs-container">
                        <div className="modal__input-container">
                            <span className="modal__input-title">Title</span>
                            <input className="modal__input" value={title} onChange={(e) => setTitle(e.target.value)} required/>
                        </div>

                        {scheduled && (
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
                        )}
                        
                        {scheduled && (
                            <div className="modal__time-status">
                                {showTimeStatus ? (
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
                        <button type="submit" onClick={handleSubmit} disabled={hasConflicts} className={hasConflicts ? 'modal-actions__disabled' : ''}>Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTaskModal;