import OpenAI from 'openai';
import type { AIExtractedTask, Priority, TaskCategory } from '../types';
import { format, addDays } from 'date-fns';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export const isAIConfigured = () => {
  return apiKey !== '' && apiKey !== 'your_openai_api_key_here';
};

const todayStr = () => format(new Date(), 'yyyy-MM-dd');
const tomorrowStr = () => format(addDays(new Date(), 1), 'yyyy-MM-dd');

export async function extractTaskFromNaturalLanguage(text: string): Promise<AIExtractedTask> {
  if (!isAIConfigured()) {
    return fallbackExtract(text);
  }

  const today = todayStr();
  const tomorrow = tomorrowStr();

  const prompt = `أنت مساعد ذكي لإدارة المهام. حلل النص التالي واستخرج معلومات المهمة.

النص: "${text}"

التاريخ الحالي: ${today}
غداً: ${tomorrow}

أعد JSON فقط (بدون أي نص إضافي) بهذا الشكل:
{
  "title": "عنوان المهمة باللغة العربية",
  "description": "وصف إضافي إن وجد أو null",
  "priority": "urgent-important | important-not-urgent | urgent-not-important | not-urgent-not-important",
  "category": "meetings | finance | planning | review | communication | admin | personal | other",
  "due_date": "YYYY-MM-DD أو null",
  "due_time": "HH:MM أو null",
  "estimated_duration": رقم بالدقائق أو null
}

قواعد تحديد الأولوية (مصفوفة أيزنهاور):
- urgent-important: مهام تحتاج إنجاز اليوم أو غداً، اجتماعات مهمة، مواعيد نهائية حرجة
- important-not-urgent: مشاريع، تخطيط، مراجعات استراتيجية، نمو مهني
- urgent-not-important: ردود سريعة، متابعات بسيطة، طلبات روتينية
- not-urgent-not-important: أفكار، مهام اختيارية، أنشطة ذات قيمة منخفضة

قواعد التصنيف:
- meetings: اجتماعات، لقاءات، موريدون، عملاء
- finance: محاسبة، فواتير، مدفوعات، ميزانية
- planning: تخطيط، استراتيجية، مشاريع
- review: مراجعة، تدقيق، عقود، تقارير
- communication: مكالمات، رسائل، تواصل
- admin: إدارية، أوراق، مستندات
- personal: شخصية
- other: أخرى`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      title: parsed.title || text,
      description: parsed.description || undefined,
      priority: (parsed.priority as Priority) || 'not-urgent-not-important',
      category: (parsed.category as TaskCategory) || 'other',
      due_date: parsed.due_date || undefined,
      due_time: parsed.due_time || undefined,
      estimated_duration: parsed.estimated_duration || undefined,
    };
  } catch (e) {
    console.error('AI extraction failed:', e);
    return fallbackExtract(text);
  }
}

export async function generateDailyInsight(tasks: { title: string; priority: string; due_date?: string }[]): Promise<string> {
  if (!isAIConfigured() || tasks.length === 0) {
    return generateFallbackInsight(tasks.length);
  }

  const prompt = `أنت مساعد إنتاجية ذكي. بناءً على المهام التالية، اكتب رسالة تحفيزية وذكية باللغة العربية (جملتان فقط) تخبر المستخدم بما يجب التركيز عليه:

المهام:
${tasks.map(t => `- ${t.title} (${t.priority})`).join('\n')}

اكتب رسالة مباشرة وعملية ومحفزة، ذكر أعداداً محددة.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });
    return response.choices[0]?.message?.content?.trim() || generateFallbackInsight(tasks.length);
  } catch {
    return generateFallbackInsight(tasks.length);
  }
}

export async function generateDailyPlan(
  tasks: { title: string; priority: string; due_date?: string; estimated_duration?: number }[],
  availableHours: number
): Promise<string> {
  if (!isAIConfigured()) {
    return `بناءً على ${tasks.length} مهمة لديك و${availableHours} ساعة متاحة، يُنصح بالبدء بالمهام العاجلة والمهمة أولاً.`;
  }

  const prompt = `أنت مساعد تخطيط يومي ذكي. اقترح خطة يومية باللغة العربية بناءً على:

المهام المتاحة:
${tasks.map(t => `- ${t.title} (أولوية: ${t.priority}، مدة مقدرة: ${t.estimated_duration || 30} دقيقة)`).join('\n')}

الوقت المتاح: ${availableHours} ساعة (${availableHours * 60} دقيقة)

اكتب خطة موجزة (3-4 جمل) تحدد فيها ترتيب المهام وتعطي نصيحة عملية.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 300,
    });
    return response.choices[0]?.message?.content?.trim() || '';
  } catch {
    return `بناءً على ${tasks.length} مهمة و${availableHours} ساعة متاحة، ابدأ بالمهام العاجلة والمهمة لتحقيق أقصى إنتاجية.`;
  }
}

function fallbackExtract(text: string): AIExtractedTask {
  const lowerText = text.toLowerCase();
  const today = todayStr();
  const tomorrow = tomorrowStr();

  let priority: Priority = 'not-urgent-not-important';
  let category: TaskCategory = 'other';
  let due_date: string | undefined;
  let due_time: string | undefined;

  if (lowerText.includes('اليوم') || lowerText.includes('الآن') || lowerText.includes('عاجل')) {
    due_date = today;
    priority = 'urgent-important';
  } else if (lowerText.includes('غداً') || lowerText.includes('غدا') || lowerText.includes('بكرة')) {
    due_date = tomorrow;
    priority = 'urgent-important';
  }

  if (lowerText.includes('اجتماع') || lowerText.includes('لقاء') || lowerText.includes('موريد') || lowerText.includes('عميل')) {
    category = 'meetings';
    priority = 'urgent-important';
  } else if (lowerText.includes('محاسب') || lowerText.includes('فاتورة') || lowerText.includes('مالي') || lowerText.includes('دفع')) {
    category = 'finance';
  } else if (lowerText.includes('مراجعة') || lowerText.includes('عقد') || lowerText.includes('تقرير')) {
    category = 'review';
  } else if (lowerText.includes('مكالمة') || lowerText.includes('اتصال') || lowerText.includes('رسالة')) {
    category = 'communication';
  } else if (lowerText.includes('تخطيط') || lowerText.includes('مشروع') || lowerText.includes('استراتيج')) {
    category = 'planning';
  }

  const timeMatch = text.match(/(\d{1,2})\s*(صباحاً|مساءً|ص|م|AM|PM|am|pm)?/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const period = timeMatch[2]?.toLowerCase();
    if (period && (period.includes('م') || period.includes('مساء') || period.toLowerCase().includes('pm'))) {
      if (hour < 12) hour += 12;
    }
    due_time = `${hour.toString().padStart(2, '0')}:00`;
  }

  const importantWords = ['مهم', 'هام', 'ضروري', 'أساسي', 'حرج'];
  if (importantWords.some(w => lowerText.includes(w))) {
    priority = 'urgent-important';
  }

  return {
    title: text.length > 60 ? text.substring(0, 60) + '...' : text,
    priority,
    category,
    due_date,
    due_time,
    estimated_duration: 30,
  };
}

function generateFallbackInsight(count: number): string {
  if (count === 0) return 'لا توجد مهام نشطة حالياً. أضف مهامك وابدأ يومك بشكل منتج!';
  if (count <= 3) return `لديك ${count} مهام فقط. يوم خفيف - ركز على إنجازها بجودة عالية.`;
  if (count <= 7) return `لديك ${count} مهام نشطة. ركز على المهام العاجلة والمهمة أولاً لتحقيق 80% من قيمة يومك.`;
  return `لديك ${count} مهمة! ابدأ بأهم 3 مهام عاجلة وستكون قد أنجزت الجزء الأكبر من عملك.`;
}
