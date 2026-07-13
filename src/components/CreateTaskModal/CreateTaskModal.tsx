import Modal from "../common/Modal/Modal";
import TaskForm from "../common/TaskForm/TaskForm";
import type { TaskModel } from "../../models/task";

interface CreateTaskModalProps {
  scheduled?: {
    date: string;
    startMinutes: number;
    endMinutes: number;
  };
  tasks?: TaskModel[];
  onClose: () => void;
  onCreate: (data: {
    title: string;
    scheduled?: {
      date: string;
      startMinutes: number;
      endMinutes: number;
    };
  }) => void;
}

function CreateTaskModal({
  scheduled,
  onClose,
  tasks = [],
  onCreate,
}: CreateTaskModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} title="New Task">
      <TaskForm
        initialData={{
          title: "",
          scheduled,
        }}
        tasks={tasks}
        onSubmit={onCreate}
        onClose={onClose}
        submitLabel="Create"
        showTimeSection={!!scheduled}
      />
    </Modal>
  );
}

export default CreateTaskModal;
