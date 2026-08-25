import Groq from "groq-sdk";

// Helper function to lazy-initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is missing in .env file.");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * Summarize text in Urdu or English
 * @param {string} text - Text to summarize
 * @param {string} lang - 'ur' (Urdu) ya 'en' (English) - default 'en'
 */
export const summarizeText = async (text, lang = "en") => {
  try {
    const groq = getGroqClient(); // Function call ke waqt initialize hoga

    const isUrdu = lang.toLowerCase() === "ur";
    const languageName = isUrdu ? "Urdu" : "English";

    const prompt = `You are an expert text summarizer. Summarize the following text accurately in ${languageName}.
    
Key Guidelines:
1. Capture the main ideas, critical details, and overall context without losing key meaning.
2. The final summary MUST be written entirely in ${languageName}.
3. Keep it concise, fluent, and well-structured.
4. Return ONLY the summary text directly without any introductory conversational text (like "Here is the summary:") or quotation marks.

Text to summarize:
"${text}"`;

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are an AI specialized in text summarization for English and Urdu languages.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Accurate summary ke liye lower temperature
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Groq Summarizer Error:", error);
    throw new Error("Failed to summarize text: " + error.message);
  }
};