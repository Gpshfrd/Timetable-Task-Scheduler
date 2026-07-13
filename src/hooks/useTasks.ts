import { useEffect, useState, useCallback } from "react";
import type { TaskModel } from "../models/task";

const STORAGE_KEY = "timetable-tasks";

function generateUniqueId(): string {
  return crypto.randomUUID();
}

function getRandomColorId(): number {
  return Math.floor(Math.random() * 8) + 1;
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskModel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const createTask = useCallback(
    (data: {
      title: string;
      scheduled?: {
        date: string;
        startMinutes: number;
        endMinutes: number;
      };
    }) => {
      const newTask: TaskModel = {
        id: generateUniqueId(),
        title: data.title,
        completed: false,
        colorId: getRandomColorId(),
        scheduled: data.scheduled,
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [],
  );

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const updateTaskSchedule = useCallback(
    (
      taskId: string,
      schedule:
        | {
            date: string;
            startMinutes: number;
            endMinutes: number;
          }
        | undefined,
    ): boolean => {
      if (schedule) {
        const conflicts = tasks.some((task) => {
          if (!task.scheduled || task.id === taskId) return false;
          if (task.scheduled.date !== schedule.date) return false;
          return (
            schedule.startMinutes < task.scheduled.endMinutes &&
            task.scheduled.startMinutes < schedule.endMinutes
          );
        });

        if (conflicts) return false;
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, scheduled: schedule } : task,
        ),
      );
      return true;
    },
    [tasks],
  );

  const updateTaskDetails = useCallback((taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, title } : task)),
    );
  }, []);

  const unscheduleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const duration = task.scheduled
            ? task.scheduled.endMinutes - task.scheduled.startMinutes
            : 60;
          return {
            ...task,
            scheduled: undefined,
            _duration: duration,
          };
        }
        return task;
      }),
    );
  }, []);

  const getTaskById = useCallback(
    (taskId: string) => tasks.find((task) => task.id === taskId),
    [tasks],
  );

  const getTasksByDate = useCallback(
    (date: string) => tasks.filter((task) => task.scheduled?.date === date),
    [tasks],
  );

  return {
    tasks,
    createTask,
    toggleTask,
    deleteTask,
    updateTaskSchedule,
    updateTaskDetails,
    unscheduleTask,
    getTaskById,
    getTasksByDate,
  };
}
