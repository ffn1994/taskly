import type { Task, AIExtractedTask } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { format } from 'date-fns';

const STORAGE_KEY = 'taskly_tasks';

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function getLocalTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

export async function getAllTasks(): Promise<Task[]> {
  if (isSupabaseConfigured()) {
    const userId = await getCurrentUserId();
    if (!userId) return getLocalTasks();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return getLocalTasks();
}

export async function getTodayTasks(): Promise<Task[]> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const all = await getAllTasks();
  return all.filter(t =>
    t.status !== 'completed' && (t.due_date === today || !t.due_date)
  );
}

export async function getCompletedTodayTasks(): Promise<Task[]> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const all = await getAllTasks();
  return all.filter(t =>
    t.status === 'completed' &&
    t.completed_at &&
    t.completed_at.startsWith(today)
  );
}

export async function createTask(extracted: AIExtractedTask): Promise<Task> {
  const userId = await getCurrentUserId();

  const task: Task = {
    id: generateId(),
    title: extracted.title,
    description: extracted.description,
    priority: extracted.priority,
    category: extracted.category,
    due_date: extracted.due_date,
    due_time: extracted.due_time,
    estimated_duration: extracted.estimated_duration,
    status: 'pending',
    created_at: now(),
    updated_at: now(),
  };

  if (isSupabaseConfigured() && userId) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const tasks = getLocalTasks();
  tasks.unshift(task);
  saveLocalTasks(tasks);
  return task;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const updated = { ...updates, updated_at: now() };

  if (isSupabaseConfigured()) {
    const userId = await getCurrentUserId();
    if (userId) {
      const { data, error } = await supabase
        .from('tasks')
        .update(updated)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  const tasks = getLocalTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Task not found');
  tasks[idx] = { ...tasks[idx], ...updated };
  saveLocalTasks(tasks);
  return tasks[idx];
}

export async function completeTask(id: string): Promise<Task> {
  return updateTask(id, {
    status: 'completed',
    completed_at: now(),
  });
}

export async function deleteTask(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const userId = await getCurrentUserId();
    if (userId) {
      const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return;
    }
  }
  const tasks = getLocalTasks().filter(t => t.id !== id);
  saveLocalTasks(tasks);
}

export async function getTaskById(id: string): Promise<Task | null> {
  if (isSupabaseConfigured()) {
    const userId = await getCurrentUserId();
    if (userId) {
      const { data } = await supabase.from('tasks').select('*').eq('id', id).eq('user_id', userId).single();
      return data;
    }
  }
  return getLocalTasks().find(t => t.id === id) || null;
}
