import Groq from "groq-sdk";

// Helper function to lazy-initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is missing in .env file.");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * Extract SEO tags, keywords, and meta info from text
 * @param {string} text - News article text
 * @param {string} lang - 'ur' (Urdu) ya 'en' (English) - default 'en'
 */
export const extractSeoData = async (text, lang = "en") => {
  try {
    const groq = getGroqClient(); // Function call ke waqt initialize hoga

    const isUrdu = lang.toLowerCase() === "ur";
    const languageName = isUrdu ? "Urdu" : "English";

    const prompt = `You are an expert SEO specialist and news content strategist. Analyze the provided news article text and generate comprehensive SEO metadata in ${languageName}.

    Guidelines:
    1. All output fields MUST be entirely in ${languageName}.
    2. "metaTitle": Catchy SEO headline optimized for Google Search (50-60 chars).
    3. "metaDescription": Compelling meta description summarize main topic for Google snippet (140-160 chars).
    4. "primaryKeywords": Array of 3 to 5 core high-volume search keywords.
    5. "secondaryKeywords": Array of 4 to 6 supporting long-tail keywords.
    6. "tags": Array of 5 to 8 hashtags/topic tags suitable for website tagging and social sharing.
    
    CRITICAL: Return ONLY a valid JSON object without any Markdown formatting, code blocks (no \`\`\`json), or conversational filler.

    JSON Structure:
    {
      "metaTitle": "string",
      "metaDescription": "string",
      "primaryKeywords": ["string"],
      "secondaryKeywords": ["string"],
      "tags": ["string"]
    }

    Article Text:
    "${text}"`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an AI specialized in SEO optimization, keyword extraction, and news taxonomy for English and Urdu languages.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const rawContent = response.choices[0]?.message?.content?.trim() || "{}";
    
    // Clean Markdown code blocks if Groq wraps JSON in ```json ... ```
    const cleanJsonString = rawContent.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");

    const seoData = JSON.parse(cleanJsonString);
    return seoData;
  } catch (error) {
    console.error("Groq SEO Extraction Error:", error);
    throw new Error("Failed to extract SEO data: " + error.message);
  }
};