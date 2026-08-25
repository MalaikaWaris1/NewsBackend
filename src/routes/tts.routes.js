import { Router } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import langdetect from "langdetect";
import { performance } from "perf_hooks";

const router = Router();

// --- VOICE MAPPING CONFIGURATION ---
const VOICE_MAPPING = {
  eng: {
    normal_ai: "en-US-AvaNeural",
    real_human: "en-US-EmmaNeural",
    news_anchor: "en-US-AndrewNeural",
  },
  urd: {
    normal_ai: "ur-PK-UzmaNeural",
    real_human: "ur-PK-AsadNeural",
    news_anchor: "ur-PK-UzmaNeural",
  },
  hin: {
    normal_ai: "hi-IN-SwaraNeural",
    real_human: "hi-IN-MadhurNeural",
    news_anchor: "hi-IN-AnanyaNeural",
  },
};

const LANG_XML_MAPPING = {
  eng: "en-US",
  urd: "ur-PK",
  hin: "hi-IN",
};

const VALID_VOICE_STYLES = ["normal_ai", "real_human", "news_anchor"];

// --- HELPER 1: LANGUAGE DETECTION ---
function detectLanguage(text) {
  try {
    const detected = langdetect.detect(text);
    const lang = detected && detected.length > 0 ? detected[0].lang : "en";

    if (lang === "ur") return "urd";
    if (lang === "hi") return "hin";
    return "eng";
  } catch (error) {
    return "eng";
  }
}

// --- HELPER 2: BUILD SSML PAYLOAD ---
function buildSsml(text, langCode, voiceStyle) {
  const voiceName = (VOICE_MAPPING[langCode] || VOICE_MAPPING.eng)[voiceStyle];
  const xmlLang = LANG_XML_MAPPING[langCode] || "en-US";

  let rate = "0.95";
  let pitch = "-2%";

  if (voiceStyle === "news_anchor") {
    if (["eng", "hin"].includes(langCode)) {
      return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${xmlLang}">
          <voice name="${voiceName}">
              <mstts:express-as style="newscast">
                  <prosody rate="${rate}" pitch="${pitch}">
                      <break time="400ms" />
                      ${text}
                      <break time="400ms" />
                  </prosody>
              </mstts:express-as>
          </voice>
      </speak>
      `;
    } else {
      rate = "0.90";
      pitch = "-4%";
    }
  }

  return `
  <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${xmlLang}">
      <voice name="${voiceName}">
          <prosody rate="${rate}" pitch="${pitch}">
              <break time="300ms" />
              ${text}
              <break time="300ms" />
          </prosody>
      </voice>
  </speak>
  `;
}

// --- HELPER 3: AZURE SPEECH GENERATOR ---
async function generateSpeechAzure(text, voiceStyle) {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    throw new Error("Azure credentials missing in system context.");
  }

  const detectedLang = detectLanguage(text);
  const ssmlPayload = buildSsml(text, detectedLang, voiceStyle);

  const outputFilename = `synthesized_${uuidv4().replace(/-/g, "")}.mp3`;
  const outputPath = path.resolve(outputFilename);

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;

  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssmlPayload,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve({ audioFilePath: outputPath, detectedLang });
        } else {
          const errorMsg = result.errorDetails || "Unknown synthesis error";
          reject(new Error(`Azure Synthesis Pipeline Error: ${errorMsg}`));
        }
      },
      (error) => {
        synthesizer.close();
        reject(new Error(`Azure Synthesis Pipeline Error: ${error}`));
      }
    );
  });
}

// --- EXPRESS ROUTE: POST /api/tts/speak ---
router.post("/ttsRouter", async (req, res) => {
  // ⏱️ 1. Start High-Precision Execution Timer
  const startTime = performance.now();

  try {
    const { text, voice_style = "normal_ai" } = req.body;

    // 📝 Validation Checks
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        detail: "Text payload parameter must contain valid characters; blank spaces are not allowed.",
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        detail: "Text parameter cannot exceed 5000 characters.",
      });
    }

    if (!VALID_VOICE_STYLES.includes(voice_style)) {
      return res.status(400).json({
        detail: `Invalid voice_style. Must be one of: ${VALID_VOICE_STYLES.join(", ")}`,
      });
    }

    const charCount = text.length;

    // Trigger Azure processing pipeline
    const { audioFilePath, detectedLang } = await generateSpeechAzure(text, voice_style);

    if (fs.existsSync(audioFilePath)) {
      // 🔄 3. Convert generated MP3 file directly into Base64 String
      const audioBuffer = fs.readFileSync(audioFilePath);
      const base64Audio = audioBuffer.toString("base64");

      // 🧹 4. File Cleanup (Server ko saf suthra rakhne ke liye)
      try {
        fs.unlinkSync(audioFilePath);
      } catch (err) {
        console.error("Temp file cleanup failed:", err);
      }

      // ⏱️ 5. Calculate Total Latency
      const endTime = performance.now();
      const executionSeconds = parseFloat(((endTime - startTime) / 1000).toFixed(3));

      // 💎 6. Compile and Return JSON Response matching FastAPI schema
      return res.json({
        status: "success",
        metadata: {
          detected_language: detectedLang.toUpperCase(),
          character_count: charCount,
          processing_time_seconds: executionSeconds,
          applied_voice_style: voice_style,
          audio_format: "audio/mpeg (MP3)",
        },
        audio_base64: base64Audio,
      });
    } else {
      return res.status(500).json({
        detail: "Audio file asset generation failed file verification traces.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      detail: error.message || "An unexpected error occurred",
    });
  }
});

export { router };