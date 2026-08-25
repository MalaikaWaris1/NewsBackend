import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./config/db.js"; // Agar ye file src ke andar hai to path "./src/config/db.js" rakhein, agar src mein hi hai to "./config/db.js"

// Load .env variables
dotenv.config();

const PORT = process.env.PORT || 5000;

;(async () => {
    try {
        // 1. Pehle MongoDB connect hoga
        await connectDB();

        // 2. DB connect hone ke baad Server start hoga (yahan process.env.PORT ki jagah PORT variable use karein)
        app.listen(PORT, () => {
            console.log(`App is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server start error:", error);
        process.exit(1);
    }
})();