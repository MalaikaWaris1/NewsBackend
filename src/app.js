import express from "express"
import cors from "cors"

const app=express()
//middleware
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit:"16kb"
}))
//import routes
import {router as ttsrouter} from "./routes/tts.routes.js"

//routes declration
app.use("/api/tts/speak",ttsrouter)
export {app}