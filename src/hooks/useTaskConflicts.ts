import { useMemo } from "react";
import type { TaskModel } from "../models/task";

interface UseTaskConflictsProps {
  tasks: TaskModel[];
  date: string;
  startMinutes: number;
  endMinutes: number;
  excludeTaskId?: string;
}

interface UseTaskConflictsReturn {
  hasConflicts: boolean;
  conflictingTasks: TaskModel[];
  availableSlot: { startMinutes: number; endMinutes: number } | null;
  findAvailableSlot: () => {
    startMinutes: number;
    endMinutes: number;
  } | null;
}

export function useTaskConflicts({
  tasks,
  date,
  startMinutes,
  endMinutes,
  excludeTaskId,
}: UseTaskConflictsProps): UseTaskConflictsReturn {
  const DAY_START = 0;
  const DAY_END = 24 * 60;

  const isOverlapping = (
    slot1: { startMinutes: number; endMinutes: number },
    slot2: { startMinutes: number; endMinutes: number },
  ): boolean => {
    return (
      slot1.startMinutes < slot2.endMinutes &&
      slot2.startMinutes < slot1.endMinutes
    );
  };

  const conflictingTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.scheduled) return false;
      if (task.id === excludeTaskId) return false;
      if (task.scheduled.date !== date) return false;
      return isOverlapping(
        { startMinutes, endMinutes },
        {
          startMinutes: task.scheduled.startMinutes,
          endMinutes: task.scheduled.endMinutes,
        },
      );
    });
  }, [tasks, date, startMinutes, endMinutes, excludeTaskId]);

  const hasConflicts = conflictingTasks.length > 0;

  const findAvailableSlot = (): {
    startMinutes: number;
    endMinutes: number;
  } | null => {
    const duration = endMinutes - startMinutes;

    const busySlots = tasks
      .filter((task) => {
        if (!task.scheduled) return false;
        if (task.id === excludeTaskId) return false;
        if (task.scheduled.date !== date) return false;
        return true;
      })
      .map((task) => ({
        startMinutes: task.scheduled!.startMinutes,
        endMinutes: task.scheduled!.endMinutes,
      }))
      .sort((a, b) => a.startMinutes - b.startMinutes);

    const preferredEnd = startMinutes + duration;
    const hasConflict = busySlots.some((slot) =>
      isOverlapping({ startMinutes, endMinutes: preferredEnd }, slot),
    );

    if (!hasConflict && preferredEnd <= DAY_END) {
      return { startMinutes, endMinutes: preferredEnd };
    }

    const currentTime = startMinutes;

    const hasConflictAtStart = busySlots.some(
      (slot) =>
        currentTime >= slot.startMinutes && currentTime < slot.endMinutes,
    );

    if (!hasConflictAtStart) {
      const endTime = currentTime + duration;
      const hasConflict = busySlots.some((slot) =>
        isOverlapping({ startMinutes: currentTime, endMinutes: endTime }, slot),
      );

      if (!hasConflict && endTime <= DAY_END) {
        return { startMinutes: currentTime, endMinutes: endTime };
      }
    }

    for (const slot of busySlots) {
      const candidateStart = slot.endMinutes;
      const candidateEnd = candidateStart + duration;

      const hasConflict = busySlots.some((s) =>
        isOverlapping(
          { startMinutes: candidateStart, endMinutes: candidateEnd },
          s,
        ),
      );

      if (!hasConflict && candidateEnd <= DAY_END) {
        return {
          startMinutes: candidateStart,
          endMinutes: candidateEnd,
        };
      }
    }

    let currentTimeBefore = DAY_START;
    for (const slot of busySlots) {
      if (slot.startMinutes - currentTimeBefore >= duration) {
        return {
          startMinutes: currentTimeBefore,
          endMinutes: currentTimeBefore + duration,
        };
      }
      currentTimeBefore = Math.max(currentTimeBefore, slot.endMinutes);
    }

    if (DAY_END - currentTime >= duration) {
      return {
        startMinutes: currentTime,
        endMinutes: currentTime + duration,
      };
    }

    return null;
  };

  const availableSlot = findAvailableSlot();

  return {
    hasConflicts,
    conflictingTasks,
    availableSlot,
    findAvailableSlot,
  };
}
