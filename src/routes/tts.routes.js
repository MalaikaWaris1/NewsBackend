import express from "express";
import { Router } from "express";
 import validateText from "../middleware/validator.js"// Hamara Day 2 ka guard
 import {generateSpeech} from "../services/ttsService.js"
import {franc} from "franc"// Language detector
import { asyncHandler } from "../utills/asyncHandler.js";

// Route: POST /api/tts/speak
// Notice karein: Humne yahan 'validateTTS' guard lagaya hai

const router = Router();
router.post("/ttsRouter", validateText,asyncHandler( async (req, res) => {
    try {
        const { text } = req.body;

        // 1. Language Detect Karein
        // franc text ko parh kar batayega ke yeh urdu ('urd'), english ('eng') ya hindi ('hin') hai
        let langCode = franc(text); 
        
        // Agar franc language pehchan na paye (bohot chota text ho), toh English default set kar dein
        if (langCode === 'und') {
            langCode = 'eng';
        }

        console.log(`Detected Language: ${langCode}`);

        // 2. TTS Service ko Call Karein (Yeh Cloudinary URL wapis karega)
        const audioUrl = await generateSpeech(text, langCode);
        
        // 3. Frontend ko Success Response Bhejein
        res.status(200).json({ 
            success: true, 
            audioUrl: audioUrl,
            detectedLang: langCode 
        });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}));

export{router};