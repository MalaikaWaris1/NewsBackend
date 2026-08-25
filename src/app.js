import express from "express"
import cors from "cors"

const app = express()

// Allowed origins ki list banayein (Vite: 5173, React: 3000)
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean); // Clean undefined values

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Dev environment mein issue bypass karne ke liye
        }
    },
    credentials: true
}))

app.use(express.json({
    limit: "16kb"
}))

// Import routes
import { router as ttsrouter } from "./routes/tts.routes.js"
import sttRoutes from './routes/stt.routes.js';
import translationRoutes from './routes/translation.routes.js';
import summarizerRoutes from './routes/summarizer.routes.js';
import headlineRoutes from './routes/headline.routes.js';
import seoRoutes from './routes/seo.routes.js';
import contentMakerRoutes from "./routes/contentMaker.routes.js";
import authRoutes from "./routes/auth.routes.js";      // Auth Route Import
import historyRoutes from "./routes/history.routes.js"; // History Route Import

// Routes declaration
app.use("/api/tts", ttsrouter)
app.use('/api/stt', sttRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/summarizer', summarizerRoutes);
app.use('/api/headline', headlineRoutes);
app.use('/api/seo', seoRoutes);
app.use("/api/content-maker", contentMakerRoutes);
app.use("/api/auth", authRoutes);       // Auth Route Mount
app.use("/api/history", historyRoutes); // History Route Mount

export { app }