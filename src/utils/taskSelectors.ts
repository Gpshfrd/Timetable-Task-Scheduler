import type { TaskModel } from "../models/task";

export function isTaskCompleted(task: TaskModel): boolean {
    return task.completed;
}
