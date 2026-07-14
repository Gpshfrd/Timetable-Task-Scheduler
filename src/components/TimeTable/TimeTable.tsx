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
  draggedTaskId: string | null;
  onClearDraggedTask: () => void;
  onDragStart?: (taskId: string, offsetY: number) => void;
  selectedDate: Date | null;
}

function TimeTable({
  tasks,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTaskSchedule,
  onUpdateTaskDetails,
  draggedTaskId,
  onClearDraggedTask,
  onDragStart,
  selectedDate,
}: TimeTableProps) {
  const [nowMinutes, setNowMinutes] = useState(() => getNowLineMinutes());
  const timetableRef = useRef<HTMLDivElement>(null);
  const nowLineRef = useRef<HTMLDivElement>(null);
  const timetableBodyRef = useRef<HTMLDivElement>(null);
  const [bodyWidth, setBodyWidth] = useState(0);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [weekDays, setWeekDays] = useState<Date[]>(() => {
    const center = selectedDate || new Date();
    return getWeekDays(center);
  });
  const [dragOffset, setDragOffset] = useState<number>(0);

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
    if (task.id === draggedTaskId) return false;
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

  const editingTask = editingTaskId
    ? tasks.find((t) => t.id === editingTaskId)
    : null;

  const [dropPreview, setDropPreview] = useState<{
    dayIndex: number;
    startMinutes: number;
    duration: number;
  } | null>(null);

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

  const handleDragStart = (taskId: string, offsetY: number) => {
    if (onDragStart) {
      onDragStart(taskId, offsetY);
    }
    if (offsetY !== undefined) {
        setDragOffset(offsetY);
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
    const y = e.clientY - rect.top - dragOffset;
    const dayWidth = rect.width / 5;
    const dayIndex = Math.floor(x / dayWidth);
    setDragOverDay(Math.min(Math.max(dayIndex, 0), 4));

    const minutes = pxToMinutes(y);
    const clampedMinutes = clampMinutes(minutes);
    const startMinutes = roundToStep(clampedMinutes);

    let duration = 60;
    if (draggedTaskId) {
      const task = tasks.find((t) => t.id === draggedTaskId);
      if (task?.scheduled) {
        duration = task.scheduled.endMinutes - task.scheduled.startMinutes;
      }
    }

    setDropPreview({
      dayIndex: Math.min(Math.max(dayIndex, 0), 4),
      startMinutes,
      duration,
    });
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
    setDropPreview(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedTaskId || !dropPreview) {
      setDropPreview(null);
      return;
    }

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task) return;
    const schedule = task.scheduled;

    const { dayIndex, startMinutes, duration } = dropPreview;
    const selectedDate = weekDays[dayIndex];
    const dateKey = getDateKey(selectedDate);
    const endMinutes = startMinutes + duration;

    const success = onUpdateTaskSchedule(draggedTaskId, {
      date: dateKey,
      startMinutes,
      endMinutes,
    });

    if (!success) {
      if (schedule) {
        onUpdateTaskSchedule(draggedTaskId, schedule);
      }
    }

    onClearDraggedTask();
    setDragOverDay(null);
    setDropPreview(null);
  };

  const handleEditTask = (task: TaskModel) => {
    setEditingTaskId(task.id);
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
    setEditingTaskId(null);
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
              <div
                className="now-line"
                style={{ top: `${nowLineTop}px` }}
                ref={nowLineRef}
                data-time={formatTime(nowMinutes)}
              />

              {dropPreview && (
                <div
                  className="drop-preview"
                  style={{
                    position: "absolute",
                    top: `${minutesToPx(dropPreview.startMinutes)}px`,
                    left: `${(dropPreview.dayIndex / 5) * 100}%`,
                    width: `calc(20% - 16px)`,
                    height: `${minutesToPx(dropPreview.duration) - 1}px`,
                    
                  }}
                />
              )}
            </div>
          </div>
          {modalData && (
            <CreateTaskModal
              scheduled={scheduled}
              onClose={() => setModalData(null)}
              onCreate={onCreateTask}
              tasks={tasks}
            />
          )}

          {editingTask && editingTask.scheduled && (
            <EditTaskModal
              key={editingTask.id}
              task={editingTask}
              tasks={tasks}
              onClose={() => setEditingTaskId(null)}
              onSave={handleSaveTask}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default TimeTable;
