import { NextRequest, NextResponse } from 'next/server';

// Known Indian DISCOM names for fuzzy matching
const KNOWN_DISCOMS = [
  'BSES Yamuna',
  'BSES Rajdhani',
  'TATA Power Delhi',
  'MSEDCL',
  'UPPCL',
  'JVVNL',
  'PSPCL',
  'CESC Kolkata',
  'BESCOM Bangalore',
  'TNEB Chennai',
  'DHBVN', 'UHBVN',
  'APEPDCL', 'APCPDCL',
  'WBSEDCL',
  'MGVCL', 'PGVCL', 'DGVCL', 'UGVCL',
  'Torrent Power',
  'Adani Electricity Mumbai',
  'BRPL', 'BYPL',
  'SBPDCL', 'NBPDCL',
  'CSPDCL',
  'TSGENCO', 'TSSPDCL', 'TSNPDCL',
  'KSEB',
  'HESCOM', 'GESCOM', 'MESCOM', 'CESC Mysuru',
];

function matchDiscom(raw: string | null): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();

  const exact = KNOWN_DISCOMS.find(d => d.toLowerCase() === lower);
  if (exact) return exact;

  const partial = KNOWN_DISCOMS.find(
    d => lower.includes(d.toLowerCase()) || d.toLowerCase().includes(lower)
  );
  if (partial) return partial;

  if (lower.includes('bses') && lower.includes('yamuna')) return 'BSES Yamuna';
  if (lower.includes('bses') && lower.includes('rajdhani')) return 'BSES Rajdhani';
  if (lower.includes('brpl')) return 'BSES Rajdhani';
  if (lower.includes('bypl')) return 'BSES Yamuna';
  if (lower.includes('tata') && lower.includes('power')) return 'TATA Power Delhi';
  if (lower.includes('tpddl')) return 'TATA Power Delhi';
  if (lower.includes('msedcl') || lower.includes('mahadiscom')) return 'MSEDCL';
  if (lower.includes('uppcl') || (lower.includes('uttar pradesh') && lower.includes('power'))) return 'UPPCL';
  if (lower.includes('jvvnl') || lower.includes('jaipur vidyut')) return 'JVVNL';
  if (lower.includes('pspcl') || lower.includes('punjab')) return 'PSPCL';
  if (lower.includes('cesc') && lower.includes('kolkata')) return 'CESC Kolkata';
  if (lower.includes('bescom') || (lower.includes('bangalore') && lower.includes('electricity'))) return 'BESCOM Bangalore';
  if (lower.includes('tangedco') || lower.includes('tneb') || lower.includes('tamil')) return 'TNEB Chennai';
  if (lower.includes('adani')) return 'Adani Electricity Mumbai';
  if (lower.includes('torrent')) return 'Torrent Power';
  if (lower.includes('dhbvn') || lower.includes('dakshin haryana')) return 'DHBVN';
  if (lower.includes('uhbvn') || lower.includes('uttar haryana')) return 'UHBVN';
  if (lower.includes('kseb') || lower.includes('kerala')) return 'KSEB';

  return raw.trim();
}

function parseAIResponse(text: string): { discom: string | null; customerId: string | null } {
  try {
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*\n/, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    const discomMatch = text.match(/"discom"\s*:\s*"([^"]*)"/i);
    const idMatch = text.match(/"customerId"\s*:\s*"([^"]*)"/i);
    return {
      discom: discomMatch ? discomMatch[1] : null,
      customerId: idMatch ? idMatch[1] : null,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const fileName = file.name?.toLowerCase() || '';

    // Determine MIME type
    let mimeType = file.type || 'image/jpeg';
    if (fileName.endsWith('.png')) mimeType = 'image/png';
    else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (fileName.endsWith('.webp')) mimeType = 'image/webp';

    // Reject unsupported file types
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a JPG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    console.log('[extractBill] Analyzing image with Groq Vision...');

    const prompt = `You are an expert at reading Indian electricity bills. Extract these two pieces of information:

1. DISCOM Provider Name (the electricity distribution company)
2. Customer ID / Consumer Number / CA Number (unique account identifier, usually 6-15 digits)

Return ONLY a raw JSON object:
{"discom": "provider name", "customerId": "the number"}
If you cannot find one, set its value to null. No markdown, no extra text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[extractBill] Groq Vision error:', response.status, errorBody);
      return NextResponse.json(
        { error: `Failed to analyze image (${response.status}). Please try again.` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const textPayload = data.choices?.[0]?.message?.content || '';
    console.log('[extractBill] Raw AI output:', textPayload);

    let extracted = parseAIResponse(textPayload);
    extracted.discom = matchDiscom(extracted.discom);

    console.log('[extractBill] Final extracted:', extracted);
    return NextResponse.json(extracted);

  } catch (error) {
    console.error('[extractBill] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process the bill. Please try again or enter details manually.' },
      { status: 500 }
    );
  }
}
