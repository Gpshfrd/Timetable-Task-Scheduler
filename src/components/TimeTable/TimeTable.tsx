import { useState, useEffect, useRef } from "react";
import "./TimeTable.css";
import { formatTime, getNowLineMinutes, roundToStep } from "../../utils/time";
import { getWeekDays, isSameDay, isToday } from "../../utils/date";
import { getDateKey, type TaskModel } from "../../models/task";
import CreateTaskModal from "../CreateTaskModal/CreateTaskModal";
import ScheduledTask from "../ScheduledTask/ScheduledTask";
import {
  clampMinutes,
  minutesToPx,
  PX_PER_HOUR,
  PX_PER_MINUTE,
  pxToMinutes,
} from "../../constants/time";
import EditTaskModal from "../EditTaskModal/EditTaskModal";
import { useTasks } from "../../hooks/useTasks";

interface TimeTableProps {
  tasks: TaskModel[];
  onCreateTask: (data: any) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskSchedule: (
    taskId: string,
    schedule: { date: string; startMinutes: number; endMinutes: number },
  ) => boolean;
  onUpdateTaskDetails: (taskId: string, title: string) => void;
  draggedTask: { id: string; title: string; duration?: number } | null;
  onClearDraggedTask: () => void;
  onDragStart?: (taskId: string, taskTitle: string, duration: number) => void;
  selectedDate: Date | null;
}

function TimeTable({
  tasks,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTaskSchedule,
  onUpdateTaskDetails,
  draggedTask,
  onClearDraggedTask,
  onDragStart,
  selectedDate,
}: TimeTableProps) {
  const [nowMinutes, setNowMinutes] = useState(() => getNowLineMinutes());
  const timetableRef = useRef<HTMLDivElement>(null);
  const nowLineRef = useRef<HTMLDivElement>(null);
  const timetableBodyRef = useRef<HTMLDivElement>(null);
  const [bodyWidth, setBodyWidth] = useState(0);
  const [editingTask, setEditingTask] = useState<TaskModel | null>(null);
  const [weekDays, setWeekDays] = useState<Date[]>(() => {
    const center = selectedDate || new Date();
    return getWeekDays(center);
  });
  const { getTaskById } = useTasks();

  const intervalRef = useRef<number | null>(null);

  const [modalData, setModalData] = useState<null | {
    dayIndex: number;
    date: string;
    startMinutes: number;
  }>(null);

  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  const dayWidth = bodyWidth / 5;

  const weekDateKeys = weekDays.map((day) => getDateKey(day));

  const scheduledTasks = tasks.filter((task) => {
    if (!task.scheduled) return false;
    if (task.id === draggedTask?.id) return false;
    return weekDateKeys.includes(task.scheduled.date);
  });

  const scheduled = modalData
    ? {
        date: modalData.date,
        startMinutes: modalData.startMinutes,
        endMinutes: modalData.startMinutes + 60,
      }
    : undefined;

  const nowLineTop = minutesToPx(nowMinutes);
  const bodyMinHeight = PX_PER_HOUR * 24;

  useEffect(() => {
    const updateWidth = () => {
      if (timetableBodyRef.current) {
        setBodyWidth(timetableBodyRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    function update() {
      setNowMinutes(getNowLineMinutes());
    }

    update();

    const now = new Date();
    const delay =
      (60 - now.getSeconds()) * 1000 + (1000 - now.getMilliseconds());

    const timeout = setTimeout(() => {
      update();
      intervalRef.current = setInterval(update, 60_000);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Auto scroll to current time on mount
  useEffect(() => {
    const container = timetableRef.current;
    const nowLine = nowLineRef.current;

    if (!container || !nowLine) return;

    const containerHeight = container.clientHeight;
    const lineOffset = nowLine.offsetTop;

    container.scrollTo({
      top: lineOffset - containerHeight / 2,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const newWeekDays = getWeekDays(selectedDate);
    setWeekDays(newWeekDays);
  }, [selectedDate]);

  const handleDragStart = (taskId: string, taskTitle: string) => {
    const task = getTaskById(taskId);
    const duration = task?.scheduled
      ? task.scheduled.endMinutes - task.scheduled.startMinutes
      : PX_PER_HOUR;

    if (onDragStart) {
      onDragStart(taskId, taskTitle, duration);
    }
  };

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest(".task")) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const y = e.clientY - rect.top;
    const minutes = pxToMinutes(y);

    const x = e.clientX - rect.left;
    const dayWidth = rect.width / 5;
    const dayIndex = Math.floor(x / dayWidth);

    const selectedDate = weekDays[dayIndex];
    const dateKey = getDateKey(selectedDate);

    setModalData({
      dayIndex,
      date: dateKey,
      startMinutes: roundToStep(clampMinutes(minutes)),
    });
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dayWidth = rect.width / 5;
    const dayIndex = Math.floor(x / dayWidth);
    setDragOverDay(Math.min(Math.max(dayIndex, 0), 4));
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedTask) {
      return;
    }

    const originalTask = getTaskById(draggedTask.id);
    const originalSchedule = originalTask?.scheduled;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutes = pxToMinutes(y);

    const x = e.clientX - rect.left;
    const dayWidth = rect.width / 5;
    const dayIndex = Math.floor(x / dayWidth);

    const selectedDate = weekDays[dayIndex];
    const dateKey = getDateKey(selectedDate);

    const clampedMinutes = clampMinutes(minutes);
    const startMinutes = roundToStep(clampedMinutes);

    const duration = draggedTask.duration || PX_PER_HOUR;
    const endMinutes = startMinutes + duration;

    const success = onUpdateTaskSchedule(draggedTask.id, {
      date: dateKey,
      startMinutes,
      endMinutes,
    });

    if (!success) {
      if (originalSchedule) {
        onUpdateTaskSchedule(draggedTask.id, originalSchedule);
      }
    }

    onClearDraggedTask();
    setDragOverDay(null);
  };

  const handleEditTask = (task: TaskModel) => {
    setEditingTask(task);
  };

  const handleSaveTask = (
    taskId: string,
    data: {
      title: string;
      scheduled?: {
        date: string;
        startMinutes: number;
        endMinutes: number;
      };
    },
  ) => {
    if (data.scheduled) {
      onUpdateTaskSchedule(taskId, data.scheduled);
    }
    onUpdateTaskDetails(taskId, data.title);
    setEditingTask(null);
  };

  return (
    <>
      <div className="timetable" ref={timetableRef}>
        <div className="timetable__days-container">
          <div></div>
          <div className="timetable__days">
            {weekDays.map((day, index) => {
              const isTodayDay = isToday(day);
              const weekday = day.toLocaleDateString("en-US", {
                weekday: "long",
              });
              const dayNumber = day.getDate();
              const isSelectedDay =
                selectedDate && isSameDay(selectedDate, day);

              return (
                <div
                  key={day.toDateString()}
                  className="timetable__day-wrapper"
                  style={{
                    backgroundColor:
                      dragOverDay === index
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                  }}
                >
                  <div className="timetable__day">
                    <span className="timetable__day-name">{weekday}</span>
                    <span
                      className={
                        isSelectedDay
                          ? "timetable__day-number--focused"
                          : isTodayDay
                            ? "timetable__day-number--today"
                            : "timetable__day-number"
                      }
                    >
                      {dayNumber}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className="timetable__time-container"
          style={
            {
              "--px-per-minute": `${PX_PER_MINUTE}px`,
              "--px-per-hour": `${PX_PER_HOUR}px`,
            } as React.CSSProperties
          }
        >
          <div className="timetable__time">
            {Array.from({ length: 24 }).map((_, index) => (
              <p key={index}>
                {index === 0
                  ? "0 AM"
                  : index < 12
                    ? `${index} AM`
                    : index === 12
                      ? "12 PM"
                      : `${index - 12} PM`}
              </p>
            ))}
          </div>
          <div className="timetable__container">
            <div className="timetable__lines"></div>
            <div
              className="timetable__body"
              ref={timetableBodyRef}
              onClick={handleTimelineClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={
                {
                  "--day-width": `${dayWidth}px`,
                  position: "relative",
                  minHeight: `${bodyMinHeight}px`,
                } as React.CSSProperties
              }
            >
              {scheduledTasks.map((task) => {
                const taskDate = new Date(task.scheduled!.date);
                const dayIndex = weekDays.findIndex((day) => {
                  return isSameDay(taskDate, day);
                });

                if (dayIndex === -1) return null;

                return (
                  <ScheduledTask
                    key={task.id}
                    task={task}
                    dayIndex={dayIndex}
                    onToggleComplete={() => onToggleTask(task.id)}
                    onDelete={() => onDeleteTask(task.id)}
                    onEdit={handleEditTask}
                    onDragStart={handleDragStart}
                    onDragEnd={onClearDraggedTask}
                  />
                );
              })}

              {dragOverDay !== null && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `${(dragOverDay / 5) * 100}%`,
                    width: "20%",
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderLeft: "none",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />
              )}
              <div
                className="now-line"
                style={{ top: `${nowLineTop}px` }}
                ref={nowLineRef}
                data-time={formatTime(nowMinutes)}
              />
            </div>
          </div>
          {modalData && (
            <CreateTaskModal
              scheduled={scheduled}
              onClose={() => setModalData(null)}
              onCreate={onCreateTask}
              tasks={tasks}
            ></CreateTaskModal>
          )}

          {editingTask && editingTask.scheduled && (
            <EditTaskModal
              task={editingTask as any}
              tasks={tasks}
              onClose={() => setEditingTask(null)}
              onSave={handleSaveTask}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default TimeTable;
