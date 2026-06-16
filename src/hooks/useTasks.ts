import { useState, useEffect, useCallback } from 'react';
import type { Task, DashboardStats } from '../types';
import { getAllTasks, getTodayTasks, getCompletedTodayTasks, completeTask, deleteTask } from '../lib/storage';

export function useTasks() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [completedToday, setCompletedToday] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [all, today, completed] = await Promise.all([
        getAllTasks(),
        getTodayTasks(),
        getCompletedTodayTasks(),
      ]);
      setAllTasks(all);
      setTodayTasks(today);
      setCompletedToday(completed);
      setError(null);
    } catch (e) {
      setError('حدث خطأ في تحميل المهام');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleComplete = useCallback(async (id: string) => {
    await completeTask(id);
    await refresh();
  }, [refresh]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteTask(id);
    await refresh();
  }, [refresh]);

  const stats: DashboardStats = {
    urgentImportant: todayTasks.filter(t => t.priority === 'urgent-important').length,
    importantNotUrgent: todayTasks.filter(t => t.priority === 'important-not-urgent').length,
    urgentNotImportant: todayTasks.filter(t => t.priority === 'urgent-not-important').length,
    notUrgentNotImportant: todayTasks.filter(t => t.priority === 'not-urgent-not-important').length,
    completedToday: completedToday.length,
    totalToday: todayTasks.length + completedToday.length,
    completionRate: completedToday.length > 0
      ? Math.round((completedToday.length / (todayTasks.length + completedToday.length)) * 100)
      : 0,
  };

  return {
    allTasks,
    todayTasks,
    completedToday,
    stats,
    loading,
    error,
    refresh,
    handleComplete,
    handleDelete,
  };
}
