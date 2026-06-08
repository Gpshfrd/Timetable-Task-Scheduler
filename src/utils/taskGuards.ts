import type { TaskModel } from "../models/task";

export function isScheduled(
  task: TaskModel,
): task is TaskModel & {
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
} {
  if (!task.scheduled) {
    return false
  }
  return (
    task.scheduled.dayIndex !== undefined &&
    task.scheduled.startMinutes !== undefined &&
    task.scheduled.endMinutes !== undefined
  );
}