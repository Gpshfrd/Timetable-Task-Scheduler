export interface TaskModel {
  id: string;
  title: string;
  completed: boolean;
  colorId: number;

  scheduled?: {
    dayIndex: number;
    startMinutes: number;
    endMinutes: number;
  }
}

export function isShceduled(task: TaskModel): task is TaskModel & {scheduled: NonNullable<TaskModel['scheduled']>} {
  return task.scheduled !== undefined;
}