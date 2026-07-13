import { useEffect, useState } from "react";
import type { TaskModel } from "../../../models/task";
import "./TaskForm.css";
import {
  formatTime,
  minutesToTimeString,
  roundToStep,
  timeStringToMinutes,
} from "../../../utils/time";
import { useTaskConflicts } from "../../../hooks/useTaskConflicts";
import { MIN_DURATION } from "../../../constants/time";

interface TaskFormData {
  title: string;
  scheduled?: {
    date: string;
    startMinutes: number;
    endMinutes: number;
  };
}

interface TaskFormProps {
  initialData: {
    title: string;
    scheduled?: {
      date: string;
      startMinutes: number;
      endMinutes: number;
    };
  };
  tasks: TaskModel[];
  onSubmit: (data: TaskFormData) => void;
  onClose: () => void;
  submitLabel?: string;
  showTimeSection?: boolean;
  excludeTaskId?: string;
}

function TaskForm({
  initialData,
  tasks,
  onSubmit,
  onClose,
  submitLabel = "Create",
  showTimeSection = true,
  excludeTaskId,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData.title);
  const [start, setStart] = useState(() => {
    if (initialData.scheduled) {
      return roundToStep(initialData.scheduled.startMinutes);
    }
    return roundToStep(9 * 60);
  });
  const [end, setEnd] = useState(() => {
    if (initialData.scheduled) {
      return roundToStep(initialData.scheduled.endMinutes);
    }
    return roundToStep(10 * 60);
  });
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const { hasConflicts, conflictingTasks, availableSlot } = useTaskConflicts({
    tasks,
    date: initialData.scheduled?.date || "",
    startMinutes: start,
    endMinutes: end,
    excludeTaskId,
  });

  const isTitleEmpty = title.trim().length === 0;
  const isTimeInvalid = end <= start;
  const isDurationTooShort = end - start < MIN_DURATION;

  const isCreateTaskModal = submitLabel === "Create" ? true : false;

  const showTimeStatus =
    showTimeSection &&
    initialData.scheduled &&
    (isCreateTaskModal ? true : hasUserInteracted);

  useEffect(() => {
    const input = document.querySelector(
      ".task-form__input",
    ) as HTMLInputElement;
    if (input) input.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTitleEmpty || (showTimeSection && hasConflicts)) return;

    const data: TaskFormData = { title: title.trim() };
    if (initialData.scheduled) {
      data.scheduled = {
        date: initialData.scheduled.date,
        startMinutes: start,
        endMinutes: end,
      };
    }
    onSubmit(data);
    onClose();
  };

  const handleStartChange = (value: string) => {
    setHasUserInteracted(true);
    setStart(timeStringToMinutes(value));
  };

  const handleEndChange = (value: string) => {
    setHasUserInteracted(true);
    setEnd(timeStringToMinutes(value));
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__fields">
        <div className="task-form__field">
          <label className="task-form__label">Title</label>
          <input
            className="task-form__input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            required
          />
        </div>

        {showTimeSection && initialData.scheduled && (
          <>
            <div className="task-form__time-inputs">
              <div className="task-form__time-input">
                <label>Start</label>
                <input
                  type="time"
                  value={minutesToTimeString(start)}
                  onChange={(e) => handleStartChange(e.target.value)}
                />
              </div>
              <div className="task-form__time-input">
                <label>End</label>
                <input
                  type="time"
                  value={minutesToTimeString(end)}
                  onChange={(e) => handleEndChange(e.target.value)}
                />
              </div>
            </div>

            {showTimeStatus && (
              <div className="task-form__status">
                {isTimeInvalid ? (
                  <div className="task-form__status--conflict">
                    End time must be after start time
                  </div>
                ) : isDurationTooShort ? (
                  <div className="task-form__status--conflict">
                    Task must be at least {MIN_DURATION} minutes long
                  </div>
                ) : hasConflicts ? (
                  <div className="task-form__status--conflict">
                    Conflicts with {conflictingTasks.length} task(s)
                    {availableSlot && (
                      <span className="task-form__suggestion">
                        Suggested: {formatTime(availableSlot.startMinutes)} -{" "}
                        {formatTime(availableSlot.endMinutes)}
                      </span>
                    )}
                    {!availableSlot && (
                      <span className="task-form__suggestion">
                        No available time on this day
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="task-form__status--free">
                    Time is available
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="task-form__actions">
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            isTitleEmpty || isTimeInvalid || (showTimeSection && hasConflicts)
          }
          className={
            isTitleEmpty || isTimeInvalid || (showTimeSection && hasConflicts)
              ? "task-form__disabled"
              : ""
          }
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
