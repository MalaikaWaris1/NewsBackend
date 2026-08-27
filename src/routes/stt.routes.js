// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import { transcribeAudio } from '../services/sttService.js';
// import {asyncHandler} from '../utills/asyncHandler.js';

// // ESM mein __dirname set karne ka tareeqa
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const router = express.Router();

// // Multer settings: Files 'src/temp_audio' folder mein save hongi
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '../temp_audio'));
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// const upload = multer({ storage: storage });

// // API Endpoint: /api/stt/transcribe
// router.post('/transcribe', upload.single('audio'), asyncHandler(async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ success: false, message: "Audio file upload nahi hui!" });
//     }

//     const filePath = req.file.path;
//     const language = req.body.language || 'ur'; 

//     try {
//         // Groq service ko call karein
//         const textTranscript = await transcribeAudio(filePath, language);
        
//         // Disk space bachane ke liye audio file delete kar dein
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//         }

//         res.status(200).json({
//             success: true,
//             text: textTranscript
//         });

//     } catch (error) {
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//         }
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// export default router;
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { transcribeAudio } from '../services/sttService.js';
import { asyncHandler } from '../utills/asyncHandler.js';

const router = express.Router();

// Root directory se dynamic path set karein (Local & Render Dono ke liye)
const tempAudioDir = path.join(process.cwd(), 'src', 'temp_audio');

// Server start hote hi check karein ke folder hai ya nahi, na hone par auto-create karein
if (!fs.existsSync(tempAudioDir)) {
    fs.mkdirSync(tempAudioDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Upload karte waqt dobara verify karein
        if (!fs.existsSync(tempAudioDir)) {
            fs.mkdirSync(tempAudioDir, { recursive: true });
        }
        cb(null, tempAudioDir);
    },
    filename: (req, file, cb) => {
        // File name se spaces remove karein taake path break na ho
        const cleanFileName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${Date.now()}-${cleanFileName}`);
    }
});

const upload = multer({ storage: storage });

// API Endpoint: /api/stt/transcribe
router.post('/transcribe', upload.single('audio'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Audio file upload nahi hui!" });
    }

    const filePath = req.file.path;
    const language = req.body.language || 'ur'; 

    try {
        const textTranscript = await transcribeAudio(filePath, language);
        
        // Processing ke baad file clean karein
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.status(200).json({
            success: true,
            text: textTranscript
        });

    } catch (error) {
        // Error ki surat mein bhi file delete karein
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Transcription processing fail ho gayi." 
        });
    }
}));

export default router;