import { useEffect, useState } from "react";
import "./EditTaskModal.css";
import { minutesToTimeString, timeStringToMinutes } from "../../utils/time";
import type { TaskModel } from "../../models/task";

interface Props {
    task: TaskModel;
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
    onClose,
    onSave,
}: Props) {
    const [title, setTitle] = useState(task.title);
    const [start, setStart] = useState(task.scheduled?.startMinutes ?? 9 * 60);
    const [end, setEnd] = useState(task.scheduled?.endMinutes ?? 10 * 60);

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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
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
                                onChange={(e) => setStart(timeStringToMinutes(e.target.value))}
                            />
                        </div>
                        <div className="time-input-container">
                            <span>End</span>
                            <input 
                                type="time" 
                                value={minutesToTimeString(end)} 
                                onChange={(e) => setEnd(timeStringToMinutes(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button type="submit" onClick={handleSubmit}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default EditTaskModal;