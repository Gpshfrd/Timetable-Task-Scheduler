import './App.css'
import Header from './components/Header/Header'
import TimeTable from './components/TimeTable/TimeTable'
import { useRef, useState } from 'react'
import TaskLibrary from './components/TaskLibrary/TaskLibrary'
import { useTasks } from './hooks/useTasks'

function App() {
  const { tasks, createTask, toggleTask, deleteTask, updateTaskSchedule } = useTasks();
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
    <>
      <Header />
      <TimeTable 
        tasks={tasks}
        onCreateTask={createTask}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
        onUpdateTaskSchedule={updateTaskSchedule}
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
        onDragEnd={handleDragEnd} 
        onDragStart={handleDragStart} 
        onDrop={handleLibraryDrop} 
        onDeleteTask={deleteTask} />
    </>
  )
}

export default App