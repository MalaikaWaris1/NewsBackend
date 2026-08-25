import Groq from 'groq-sdk';
import fs from 'fs';

// Helper function to lazy-initialize Groq client after dotenv loads
const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY environment variable is missing in .env file.");
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * Audio file ko text mein convert karne ka function
 * @param {string} filePath - Audio file ka local path
 * @param {string} language - 'ur' ya 'en'
 */
export const transcribeAudio = async (filePath, language = 'ur') => {
    try {
        const groq = getGroqClient(); // Function call ke waqt initialize hoga

        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-large-v3",
            language: language,
            response_format: "json",
            temperature: 0.0
        });

        return transcription.text;
    } catch (error) {
        throw new Error(`Groq STT Error: ${error.message}`);
    }
};