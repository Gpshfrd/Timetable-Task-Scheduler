import { useRef, useState } from "react";
import TaskLibrary from "../TaskLibrary/TaskLibrary";
import TimeTable from "../TimeTable/TimeTable";
import { useTasks } from "../../hooks/useTasks";
import "./Workspace.css";
import Calendar from "../Calendar/Calendar";

function Workspace() {
  const {
    tasks,
    createTask,
    toggleTask,
    deleteTask,
    updateTaskSchedule,
    updateTaskDetails,
    unscheduleTask,
  } = useTasks();
  const draggedTaskIdRef = useRef<string | null>(null);
  const [, forceUpdate] = useState({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleDragStart = (taskId: string) => {
    draggedTaskIdRef.current = taskId;
    forceUpdate({});
  };

  const handleDragEnd = () => {
    draggedTaskIdRef.current = null;
    forceUpdate({});
  };

  const handleLibraryDrop = (taskId: string) => {
    unscheduleTask(taskId);
    draggedTaskIdRef.current = null;
    forceUpdate({});
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="workspace">
      <TimeTable
        tasks={tasks}
        onCreateTask={createTask}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
        onUpdateTaskSchedule={updateTaskSchedule}
        onUpdateTaskDetails={updateTaskDetails}
        draggedTaskId={draggedTaskIdRef.current}
        onClearDraggedTask={() => {
          draggedTaskIdRef.current = null;
          forceUpdate({});
        }}
        onDragStart={handleDragStart}
        selectedDate={selectedDate}
      />
      {/* side pannel */}
      <div className="workspace__sidebar">
        <Calendar
          currentDate={selectedDate || new Date()}
          onDateSelect={handleDateSelect}
        />
        <TaskLibrary
          tasks={tasks}
          onCreateTask={createTask}
          draggedTaskId={draggedTaskIdRef.current}
          onUpdateTaskDetails={updateTaskDetails}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDrop={handleLibraryDrop}
          onDeleteTask={deleteTask}
        />
      </div>
    </div>
  );
}

export default Workspace;
