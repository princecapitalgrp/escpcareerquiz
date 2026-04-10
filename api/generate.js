function stripCodeFences(s) {
  if (typeof s !== 'string') return '';
  let out = s.trim();
  out = out.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return out.trim();
}

function safeJsonParse(s) {
  const cleaned = stripCodeFences(s);
  try {
    return { ok: true, value: JSON.parse(cleaned) };
  } catch {
    return { ok: false, value: null, cleaned };
  }
}

const RESULT_JSON_SCHEMA = {
  name: 'solis_career_protocol',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      internal_archetype: { type: 'string' },
      display_archetype: { type: 'string' },
      archetype_translation: { type: 'string' },
      trait_chips: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 4 },
      fit_summary: { type: 'string' },
      fit_roles: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
      career_protocol: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string' },
            body: { type: 'string' },
          },
          required: ['title', 'body'],
        },
      },
      linkedin_outreach: { type: 'string' },
      timing_note: { type: 'string' },
      anti_pattern: { type: 'string' },
      final_line: { type: 'string' },
    },
    required: [
      'internal_archetype',
      'display_archetype',
      'archetype_translation',
      'trait_chips',
      'fit_summary',
      'fit_roles',
      'career_protocol',
      'linkedin_outreach',
      'timing_note',
      'anti_pattern',
      'final_line',
    ],
  },
  strict: true,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Missing prompt' });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY environment variable' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. You must respond in ONLY valid JSON matching this schema: ' + JSON.stringify(RESULT_JSON_SCHEMA) },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1600,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI error:', JSON.stringify(data));
      return res
        .status(response.status)
        .json({ error: data?.error?.message || 'OpenAI error', details: data?.error || null });
    }

    const text = data.choices && data.choices.length > 0 ? data.choices[0].message.content : '';
    const parsed = safeJsonParse(text);

    return res.status(200).json({
      text,
      result: parsed.ok ? parsed.value : null,
      parse_error: parsed.ok ? null : 'Model did not return valid JSON',
      cleaned: parsed.ok ? null : parsed.cleaned,
    });
  } catch (err) {
    console.error('Handler error:', err?.message);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
