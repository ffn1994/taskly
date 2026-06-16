export type Priority = 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export type TaskCategory =
  | 'meetings'
  | 'finance'
  | 'planning'
  | 'review'
  | 'communication'
  | 'admin'
  | 'personal'
  | 'other';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export const RECURRENCE_CONFIG: Record<Recurrence, { label: string; emoji: string }> = {
  none:    { label: 'لا تكرار', emoji: '—' },
  daily:   { label: 'يومياً', emoji: '🔁' },
  weekly:  { label: 'أسبوعياً', emoji: '📅' },
  monthly: { label: 'شهرياً', emoji: '🗓️' },
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: TaskCategory;
  due_date?: string;
  due_time?: string;
  estimated_duration?: number;
  recurrence?: Recurrence;
  status: TaskStatus;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIExtractedTask {
  title: string;
  description?: string;
  priority: Priority;
  category: TaskCategory;
  due_date?: string;
  due_time?: string;
  estimated_duration?: number;
  recurrence?: Recurrence;
}

export interface DailyPlan {
  tasks: Task[];
  insight: string;
  focusTasks: Task[];
}

export interface DashboardStats {
  urgentImportant: number;
  importantNotUrgent: number;
  urgentNotImportant: number;
  notUrgentNotImportant: number;
  completedToday: number;
  totalToday: number;
  completionRate: number;
}

export const PRIORITY_CONFIG: Record<Priority, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
  description: string;
}> = {
  'urgent-important': {
    label: 'عاجل ومهم',
    color: '#E74C3C',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emoji: '🔴',
    description: 'يجب إنجازه اليوم أو غداً',
  },
  'important-not-urgent': {
    label: 'مهم وغير عاجل',
    color: '#E67E22',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    emoji: '🟠',
    description: 'مشاريع طويلة الأمد وتخطيط استراتيجي',
  },
  'urgent-not-important': {
    label: 'عاجل وغير مهم',
    color: '#F39C12',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    emoji: '🟡',
    description: 'ردود سريعة ومتابعات بسيطة',
  },
  'not-urgent-not-important': {
    label: 'غير عاجل وغير مهم',
    color: '#27AE60',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    emoji: '🟢',
    description: 'أفكار واختياريات يمكن تأجيلها',
  },
};

export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; emoji: string }> = {
  meetings: { label: 'اجتماعات', emoji: '🤝' },
  finance: { label: 'مالية', emoji: '💰' },
  planning: { label: 'تخطيط', emoji: '📋' },
  review: { label: 'مراجعة', emoji: '🔍' },
  communication: { label: 'تواصل', emoji: '📱' },
  admin: { label: 'إدارية', emoji: '📁' },
  personal: { label: 'شخصية', emoji: '👤' },
  other: { label: 'أخرى', emoji: '📌' },
};
