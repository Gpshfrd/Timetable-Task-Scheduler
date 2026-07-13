import Modal from "../common/Modal/Modal";
import TaskForm from "../common/TaskForm/TaskForm";
import type { TaskModel } from "../../models/task";

interface EditTaskModalProps {
  task: TaskModel;
  tasks: TaskModel[];
  onClose: () => void;
  onSave: (
    taskId: string,
    data: {
      title: string;
      scheduled?: {
        date: string;
        startMinutes: number;
        endMinutes: number;
      };
    },
  ) => void;
}

function EditTaskModal({ task, tasks, onClose, onSave }: EditTaskModalProps) {
  if (!task.scheduled) return null;

  const handleSubmit = (data: { title: string; scheduled?: any }) => {
    onSave(task.id, data);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Task">
      <TaskForm
        initialData={{
          title: task.title,
          scheduled: task.scheduled,
        }}
        tasks={tasks}
        onSubmit={handleSubmit}
        onClose={onClose}
        submitLabel="Save"
        showTimeSection={true}
        excludeTaskId={task.id}
      />
    </Modal>
  );
}

export default EditTaskModal;
