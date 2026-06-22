import { useRef, useState } from "react";
import TaskLibrary from "../TaskLibrary/TaskLibrary";
import TimeTable from "../TimeTable/TimeTable";
import { useTasks } from "../../hooks/useTasks";
import './Workspace.css';

function Workspace() {
    const { tasks, createTask, toggleTask, deleteTask, updateTaskSchedule, updateTaskDetails } = useTasks();
    const draggedTaskRef = useRef<{ id: string, title: string, duration?: number } | null>(null);
    const [, forceUpdate] = useState({});

    const handleDragStart = (taskId: string, taskTitle: string, duration?: number) => {
        draggedTaskRef.current = { id: taskId, title: taskTitle, duration };
        forceUpdate({})
    }

    const handleDragEnd = () => {
        draggedTaskRef.current = null;
        forceUpdate({});
    };

    const handleLibraryDrop = (taskId: string) => {
        updateTaskSchedule(taskId, undefined as any)
        draggedTaskRef.current = null;
        forceUpdate({})
    }

    return (
        <div className="workspace">
            <TimeTable 
                tasks={tasks}
                onCreateTask={createTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onUpdateTaskSchedule={updateTaskSchedule}
                onUpdateTaskDetails={updateTaskDetails}
                draggedTask={draggedTaskRef.current}
                onClearDraggedTask={() => {
                draggedTaskRef.current = null;
                forceUpdate({});
                }}
                onDragStart={handleDragStart}
            />
            {/* side pannel */}
            <TaskLibrary 
                tasks={tasks} 
                onCreateTask={createTask} 
                draggedTask={draggedTaskRef.current} 
                onUpdateTaskDetails={updateTaskDetails}
                onDragEnd={handleDragEnd} 
                onDragStart={handleDragStart} 
                onDrop={handleLibraryDrop} 
                onDeleteTask={deleteTask} />
        </div>
    )
}

export default Workspace;