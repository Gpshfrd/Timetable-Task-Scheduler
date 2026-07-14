import { useState } from "react";
import "./TaskLibrary.css";
import CreateTaskModal from "../CreateTaskModal/CreateTaskModal";
import type { TaskModel } from "../../models/task";
import addIcon from "../../assets/add.svg";
import deleteIcon from "../../assets/delete.svg";

interface TaskLibraryProps {
  tasks: TaskModel[];
  onCreateTask: (data: any) => void;
  onUpdateTaskDetails: (taskId: string, title: string) => void;
  draggedTaskId: string | null;
  onDragStart: (taskId: string, taskTitle: string, duration: number) => void;
  onDragEnd: () => void;
  onDrop: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

function TaskLibrary({
  tasks,
  onCreateTask,
  onUpdateTaskDetails,
  draggedTaskId,
  onDragStart,
  onDragEnd,
  onDrop,
  onDeleteTask,
}: TaskLibraryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDeleteDragOver, setIsDeleteDragOver] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const unscheduledTasks = tasks.filter(
    (task) => !task.scheduled && task.id !== draggedTaskId,
  );

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateTask = (data: {
    title: string;
    scheduled?: {
      date: string;
      startMinutes: number;
      endMinutes: number;
    };
  }) => {
    onCreateTask(data);
    handleCloseModal();
  };

  const handleDoubleClick = (task: TaskModel) => {
    setEditingTaskId(task.id);
    setEditValue(task.title);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editValue.trim()) {
      onUpdateTaskDetails(taskId, editValue.trim());
    }
    setEditingTaskId(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit(taskId);
    } else if (e.key === "Escape") {
      setEditingTaskId(null);
      setEditValue("");
    }
  };

  const handleDragStart = (
    e: React.DragEvent,
    taskId: string,
    taskTitle: string,
  ) => {
    e.dataTransfer.effectAllowed = "move";

    try {
      e.dataTransfer.setData("text/plain", taskId);
    } catch (error) {
      console.error(`Could not set dataTransfer`);
    }

    const duration = 60;

    setTimeout(() => {
      onDragStart(taskId, taskTitle, duration);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsDeleteDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDeleteDragOver(false);

    if (draggedTaskId) {
      onDrop(draggedTaskId);
    }
  };

  const handleDeleteDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDeleteDragOver(true);
  };

  const handleDeleteDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDeleteDragOver(false);
  };

  const handleDeleteDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDragOver(false);
    setIsDragOver(false);

    if (draggedTaskId && confirm("Delete this task?")) {
      onDeleteTask(draggedTaskId);
      onDragEnd();
    }
  };

  return (
    <>
      <div
        className={`task-library ${isDragOver ? "task-library__drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <button
          type="button"
          onClick={handleOpenModal}
          className={`add-button ${isDeleteDragOver ? "add-button__drag-over" : ""}`}
          onDragOver={handleDeleteDragOver}
          onDragLeave={handleDeleteDragLeave}
          onDrop={handleDeleteDrop}
        >
          {draggedTaskId ? <img src={deleteIcon} /> : <img src={addIcon} />}
        </button>
        <div className="task-library__list">
          {unscheduledTasks.map((task) => (
            <div
              key={task.id}
              className="task-library__item"
              draggable
              onDragStart={(e) => handleDragStart(e, task.id, task.title)}
              onDragEnd={onDragEnd}
              onDoubleClick={() => handleDoubleClick(task)}
              style={
                {
                  "--task-color": `rgb(var(--task-color-${task.colorId}))`,
                } as React.CSSProperties
              }
            >
              {editingTaskId === task.id ? (
                <input
                  className="task-library__edit-input"
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleSaveEdit(task.id)}
                  onKeyDown={(e) => handleKeyDown(e, task.id)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <small>{task.title}</small>
              )}
            </div>
          ))}

          {unscheduledTasks.length === 0 && (
            <div className="task-library__empty">
              No tasks yet. Click "+" to create one!
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <CreateTaskModal
          onClose={handleCloseModal}
          onCreate={handleCreateTask}
        ></CreateTaskModal>
      )}
    </>
  );
}

export default TaskLibrary;
