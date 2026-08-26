import Groq from "groq-sdk";

// Helper function to lazy-initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is missing in .env file.");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * Urdu to English & English to Urdu Professional Translation Service
 * @param {string} text - Translate karne wala text
 * @param {string} targetLang - 'ur' (Urdu) ya 'en' (English)
 */
export const translateText = async (text, targetLang) => {
  try {
    const groq = getGroqClient(); // Function call ke waqt initialize hoga

    const isUrduTarget = targetLang.toLowerCase() === "ur";
    const targetLanguageName = isUrduTarget ? "Urdu" : "English";

    const systemPrompt = `You are a Chief Linguist and Senior Newsroom Translator specializing in English and Urdu. Your sole purpose is to provide grammatically flawless, contextually accurate, and highly professional translations into standard journalistic Urdu (صحافتی اردو).

### CRITICAL TRANSLATION RULES & RESTRICTIONS:
1. **NO HINDI/DEVANAGARI CHARACTERS (FATAL ERROR):** You are STRICTLY FORBIDDEN from outputting ANY Hindi or Devanagari characters (e.g., ंट, क, etc.). You must use 100% pure standard Urdu Unicode letters. For example, never write "کنتینٹ", write "مواد" or "کنٹینٹ".
2. **Professional Journalistic Vocabulary:** DO NOT lazily transliterate English words if a standard Urdu journalistic term exists. 
   - "Artificial Intelligence" = "مصنوعی ذہانت" (NOT آرٹیفیشل انٹیلی جنس)
   - "Editorial Integrity" = "ادارتی ساکھ" (NOT ایڈیٹوریل انٹیگریٹی)
   - "Content" = "مواد" (NOT کنٹینٹ)
3. **Smart Handling of Tech/Global Terms:** For modern technical words with no sensible Urdu equivalent (e.g., Machine Learning, Real-time, Algorithm, Digital Infrastructure), naturally transliterate them using standard Urdu script. DO NOT create awkward literal translations (e.g., use "ریئل ٹائم" instead of "حقیقی وقت").
4. **Grammar & Voice Mastery:** Use flawless subject-verb-gender agreement and correctly identify active/passive voice. 
   - Use accurate plurals as subjects (e.g., "میڈیا تنظیمیں" not "میڈیا تنظیموں").
   - Match the exact tense (e.g., "are adopting" = "اپنا رہی ہیں", not "اپنا لیا ہے").
5. **Idiomatic Context (No Literal Translation):** Translate the true meaning of the sentence, not just word-for-word. Adapt English phrasing appropriately for news (e.g., translate "warning of" as "خبردار کر رہے ہیں", and "bypass" as "چکمہ دینا" or "عبور کرنا").

### STRICT OUTPUT CONSTRAINTS:
- Output ONLY the final translated Urdu text.
- Do NOT wrap in quotes.
- Do NOT include any explanations, introductory text, markdown formatting, or conversational filler.`;

    const userPrompt = `Translate the following text into ${targetLanguageName}:\n\n${text}`;

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
      temperature: 0.1, 
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Groq Translation Error:", error);
    throw new Error("Failed to process translation: " + error.message);
  }
};