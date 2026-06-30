import { useEffect, useRef, useState } from "react";
import "./CreateTaskModal.css";
import { minutesToTimeString, roundToStep, timeStringToMinutes } from "../../utils/time";

interface Props {
    scheduled?: {
        date: string;
        startMinutes: number;
        endMinutes: number;
    }
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


    const modalRef = useRef<HTMLDivElement>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        const taskData: {
            title: string,
            scheduled?: {
                date: string;
                startMinutes: number;
                endMinutes: number;
            };
        } = {
            title
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <form className="modal__inputs-container" onSubmit={handleSubmit}>
                    <h2>New task</h2>
                    <div className="modal__inputs-container">
                        <div className="modal__input-container">
                            <span className="modal__input-title">Title</span>
                            <input className="modal__input" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        {scheduled && (
                            <div className="time-inputs">
                                <div className="time-input-container">
                                    <span>Start</span>
                                    <input className="time-input" type="time" value={scheduled ? minutesToTimeString(start) : '09:00'} onChange={(e) => setStart(timeStringToMinutes(e.target.value))}/>
                                </div>
                                <div className="time-input-container">
                                    <span>End</span>
                                    <input type="time" value={scheduled ? minutesToTimeString(end) : '10:00'} onChange={(e) => setEnd(timeStringToMinutes(e.target.value))}/>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" onClick={handleSubmit}>Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTaskModal;