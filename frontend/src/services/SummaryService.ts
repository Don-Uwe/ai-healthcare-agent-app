// ─────────────────────────────────────────────────────────────
// SummaryService.ts
// Calls Google Gemini API (FREE) to auto-generate article summaries
// Free tier: 1500 requests/day, no credit card needed
// ─────────────────────────────────────────────────────────────

// ── 1. Paste your free API key here ──────────────────────────
// Get free key at: https://aistudio.google.com/app/apikey
// Replace placeholder with your actual key
const GEMINI_API_KEY = 'AIza-YOUR-KEY-HERE';

// ── 2. Gemini endpoint (flash = fastest free model) ──────────
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── 3. Type for the summary data ─────────────────────────────
export interface ArticleSummary {
  simplifiedExplanation: string;
  keyFindings: string[];
  beginnerTakeaways: string[];
  whyItMatters: string;
}

// ── 4. Main function ─────────────────────────────────────────
export async function generateArticleSummary(
  articleContent: string
): Promise<ArticleSummary | null> {

  // Safety check — don't call API if key is missing
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIza-YOUR-KEY-HERE') {
    console.warn('[SummaryService] No Gemini API key set. Skipping.');
    return null;
  }

  // Don't send more than 3000 chars to stay within token limits
  const trimmedContent = articleContent.slice(0, 3000);

  // Prompt that forces Gemini to return clean JSON
  const prompt = `You are a health educator helping everyday users understand complex medical content.

Read the following health article and respond ONLY with a valid JSON object.
No explanation, no markdown, no backticks — raw JSON only.

Required JSON format:
{
  "simplifiedExplanation": "2-3 sentence plain English summary a 12-year-old could understand",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "beginnerTakeaways": ["practical tip 1", "practical tip 2", "practical tip 3"],
  "whyItMatters": "1-2 sentence explanation of real-world importance"
}

Article:
${trimmedContent}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,       // low = more consistent JSON output
          maxOutputTokens: 600,
        },
      }),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SummaryService] Gemini API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();

    // Extract text from Gemini's response structure
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!rawText) {
      console.error('[SummaryService] Empty response from Gemini');
      return null;
    }

    // Strip any accidental markdown fences Gemini might add
    const cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Parse and return
    const parsed: ArticleSummary = JSON.parse(cleaned);
    return parsed;

  } catch (err) {
    console.error('[SummaryService] Failed to generate summary:', err);
    return null;
  }
}
