import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, action, tasks, availableHours } = await req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    let prompt = '';

    if (action === 'extract') {
      prompt = `أنت مساعد ذكي لإدارة المهام. حلل النص التالي واستخرج معلومات المهمة.

النص: "${text}"
التاريخ الحالي: ${today}
غداً: ${tomorrow}

أعد JSON فقط بهذا الشكل:
{
  "title": "عنوان المهمة",
  "description": null,
  "priority": "urgent-important | important-not-urgent | urgent-not-important | not-urgent-not-important",
  "category": "meetings | finance | planning | review | communication | admin | personal | other",
  "due_date": "YYYY-MM-DD أو null",
  "due_time": "HH:MM أو null",
  "estimated_duration": رقم بالدقائق أو null
}

قواعد الأولوية:
- urgent-important: اليوم أو غداً، مواعيد حرجة، اجتماعات مهمة
- important-not-urgent: مشاريع، تخطيط، نمو
- urgent-not-important: ردود سريعة، متابعات بسيطة
- not-urgent-not-important: أفكار، اختياريات`;
    } else if (action === 'insight') {
      prompt = `أنت مساعد إنتاجية. اكتب رسالة تحفيزية باللغة العربية (جملتان فقط) بناءً على ${tasks?.length || 0} مهام:
${tasks?.map((t: {title: string; priority: string}) => `- ${t.title} (${t.priority})`).join('\n')}`;
    } else if (action === 'plan') {
      prompt = `اقترح خطة يومية باللغة العربية (3-4 جمل):
المهام: ${tasks?.map((t: {title: string; priority: string; estimated_duration?: number}) => `- ${t.title} (${t.priority}, ${t.estimated_duration || 30} دقيقة)`).join('\n')}
الوقت المتاح: ${availableHours} ساعة`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: action === 'extract' ? 0.3 : 0.7,
        max_tokens: action === 'extract' ? 500 : 300,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    if (action === 'extract') {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ text: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
