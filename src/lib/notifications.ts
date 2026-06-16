import type { Task } from '../types';
import { format } from 'date-fns';

const scheduledIds = new Set<string>();

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function scheduleTaskNotifications(tasks: Task[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');

  tasks.forEach(task => {
    if (!task.due_time || !task.due_date || task.due_date !== today) return;
    if (scheduledIds.has(task.id)) return;

    const [h, m] = task.due_time.split(':').map(Number);

    // Notify 15 minutes before
    const notifyAt = new Date();
    notifyAt.setHours(h, m - 15, 0, 0);
    const delay = notifyAt.getTime() - now.getTime();

    if (delay > 0 && delay < 8 * 60 * 60 * 1000) {
      scheduledIds.add(task.id);
      setTimeout(() => {
        new Notification(`🔔 تذكير: ${task.title}`, {
          body: `تبدأ بعد 15 دقيقة — ${task.due_time}`,
          icon: '/favicon.svg',
          tag: `remind-${task.id}`,
        });
      }, delay);
    }

    // Notify at exact time
    const atTime = new Date();
    atTime.setHours(h, m, 0, 0);
    const delayAt = atTime.getTime() - now.getTime();

    if (delayAt > 0 && delayAt < 8 * 60 * 60 * 1000) {
      setTimeout(() => {
        new Notification(`⏰ حان وقت: ${task.title}`, {
          body: `المهمة الآن (${task.due_time})`,
          icon: '/favicon.svg',
          tag: `now-${task.id}`,
        });
      }, delayAt);
    }
  });
}
