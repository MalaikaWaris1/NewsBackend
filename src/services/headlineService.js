import Groq from "groq-sdk";

// Helper function to lazy-initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is missing in .env file.");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * Generate highly professional news headlines from article text
 * @param {string} text - Article content
 * @param {string} lang - 'ur' (Urdu) ya 'en' (English) - default 'en'
 */
export const generateHeadlines = async (text, lang = "en") => {
  try {
    const groq = getGroqClient(); // Function call ke waqt initialize hoga

    const isUrdu = lang.toLowerCase() === "ur";
    const languageName = isUrdu ? "Urdu" : "English";
    const systemPrompt = `You are a Senior News Editor and an automated API endpoint for a digital news platform. Your ONLY job is to analyze text and output a raw JSON array of 5 highly engaging headlines in ${languageName}.

### CRITICAL RULES:
1. **Language & Script Strictness:** If outputting in Urdu:
   - Use 100% pure standard journalistic Urdu. NO Hindi/Devanagari characters (e.g., نٹ, क) are permitted.
   - Use correct Urdu spellings for loanwords (e.g., use "فشنگ" for Phishing, NEVER "پھشنگ").
   - Use "مصنوعی ذہانت" for AI.

2. **Headline Structure & Grammar:**
   - Headlines must be grammatically complete and flawless with proper auxiliary verbs (e.g., "استعمال کر رہے ہیں").
   - Use active voice and ensure correct plural agreements (e.g., "معلومات محفوظ ہیں").
   - **Punctuation:** Do NOT put full stops (.) at the end of headlines. However, if a headline is phrased as a question, it MUST end with a question mark (؟).

3. **Strict Factual Accuracy (Zero Hallucination):**
   - You MUST NOT misattribute actions. Pay close attention to subject-object roles (e.g., if cybercriminals use a technology, do NOT state that experts are using it).
   - Accurately reflect the article without sensationalizing false facts.

4. **JSON Output ONLY (FATAL ERROR IF VIOLATED):**
   - You must output ONLY a valid JSON array of exactly 5 strings: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"].
   - DO NOT include conversational text, pleasantries, or explanations.
   - DO NOT wrap the output in markdown code blocks (e.g., no \`\`\`json). Just the raw brackets [].
5. **Length:** 
    - Each headline must be between 5 to 12 words long (avoid extremely short 2-word phrases);`;
    
    const userPrompt = `Generate 5 distinct headline styles for the following text in ${languageName}:

[Required Styles]
1. Breaking News (Urgent & Direct)
2. SEO-Optimized (Keyword-rich and clear)
3. Engaging/Click-worthy (Curiosity-driven but factual)
4. Professional/Standard (Broadsheet style)
5. Short & Punchy (Under 6 words)

[Article Text]
"${text}"

Return ONLY the raw JSON array.`;

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.4, // 0.4 is ideal for balancing creativity (for headlines) and strict format compliance
    });

    // Extracting response and safely parsing
    let rawContent = response.choices[0]?.message?.content?.trim() || "[]";
    
    // Fallback cleanup just in case the model ignores the "no markdown" rule
    rawContent = rawContent.replace(/^```(json)?\s*/i, "").replace(/\s*```$/i, "");
    
    return JSON.parse(rawContent);
  } catch (error) {
    console.error("Groq Headline Generation Error:", error);
    throw new Error("Failed to generate headlines: " + error.message);
  }
};