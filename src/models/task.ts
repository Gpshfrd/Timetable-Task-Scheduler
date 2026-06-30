export interface TaskModel {
  id: string;
  title: string;
  completed: boolean;
  colorId: number;

  scheduled?: {
    date: string; // 'yyyy-mm-dd'
    startMinutes: number;
    endMinutes: number;
  }
}

export function isScheduled(task: TaskModel): task is TaskModel & {scheduled: NonNullable<TaskModel['scheduled']>} {
  return task.scheduled !== undefined;
}

export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}