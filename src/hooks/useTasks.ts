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
            dayIndex: number,
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
        dayIndex: number;
        startMinutes: number;
        endMinutes: number;
    }) {
        setTasks((prev) => prev.map(task => 
            task.id === taskId
                ? { ...task, scheduled: schedule}
                : task
        ))
    }

    function updateTaskDetails(taskId: string, title: string) {
        setTasks(prev => prev.map(task => 
            task.id === taskId
                ? { ...task, title }
                : task
        ));
    }
    return { tasks, createTask, toggleTask, deleteTask, updateTaskSchedule, updateTaskDetails };
}