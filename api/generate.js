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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Missing prompt' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY environment variable' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error', response.status, JSON.stringify(data));
      return res
        .status(response.status)
        .json({ error: data?.error?.message || 'Anthropic error', details: data?.error || null });
    }

    const text = data?.content?.[0]?.text || '';
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
