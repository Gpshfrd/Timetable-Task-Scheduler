import { useEffect, useState } from "react";
import type { TaskModel } from "../models/task";

function generateUniqueId(): string {
    return crypto.randomUUID();
}

function getRandomColorId(): number {
    return Math.floor(Math.random() * 8) + 1;
}

const STORAGE_KEY = 'timetable-tasks';

export function useTasks() {
    const [tasks, setTasks] = useState<TaskModel[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Failed to parse saved tasks');
                return[]
            }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    function createTask(data: {
        title: string,
        scheduled?: {
            date: string,
            startMinutes: number,
            endMinutes: number,
        }
    }) {
        const newTask: TaskModel = {
            id: generateUniqueId(),
            title: data.title,
            completed: false,
            colorId: getRandomColorId(),
            scheduled: data.scheduled,
        };
        setTasks((prev) => [newTask, ...prev]);
    }

    function toggleTask(taskId: string) {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    }

    function deleteTask(taskId: string) {
        setTasks((prev) => 
            prev.filter(task => task.id !== taskId)
        );
    }

    function updateTaskSchedule(taskId: string, schedule: {
        date: string;
        startMinutes: number;
        endMinutes: number;
    } | undefined): boolean {
        if (schedule) {
            const conflicts = tasks.filter(task => {
                if (!task.scheduled) return false;
                if (task.id === taskId) return false;
                if (task.scheduled.date !== schedule.date) return false;
                
                return (
                    schedule.startMinutes < task.scheduled.endMinutes &&
                    task.scheduled.startMinutes < schedule.endMinutes
                );
            });

            if (conflicts.length > 0) {
                return false;
            }
        }

        setTasks((prev) => prev.map(task => 
            task.id === taskId
                ? { ...task, scheduled: schedule}
                : task
        ))
        return true;
    }

    function updateTaskDetails(taskId: string, title: string) {
        setTasks(prev => prev.map(task => 
            task.id === taskId
                ? { ...task, title }
                : task
        ));
    }

    function unscheduleTask(taskId: string) {
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                const duration = task.scheduled ? task.scheduled.endMinutes - task.scheduled.startMinutes : 60;
                return {
                    ...task,
                    scheduled: undefined,
                    _duration: duration
                }
            }
            return task;
        }))
    }

    return { tasks, createTask, toggleTask, deleteTask, updateTaskSchedule, updateTaskDetails, unscheduleTask };
}