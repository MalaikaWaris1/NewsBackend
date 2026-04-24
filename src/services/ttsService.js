import sdk from "microsoft-cognitiveservices-speech-sdk";
import path from "path";
import crypto from "crypto";
import { azure, cloudinary } from "../config/envConfig.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";

const generateSpeech = async (text, langCode) => {

    // 1. Generate unique hash (for caching)
    const hash = crypto.createHash("md5").update(text).digest("hex");
    const publicId = hash;
     console.log("Checking:", publicId);
    // 2. Check Cloudinary cache
    try {
        const existingFile = await cloudinary.api.resource(`news_audios/${publicId}`, {
           
            resource_type: "video"

        })
        console.log("CACHE HIT - Already exists");
        return existingFile.secure_url;
    } catch (error) {
        console.log("CACHE MISS - Generating new audio");
    }

    // 3. Temp file path
    const tempFilePath = path.join(azure.tempAudioPath, `${hash}.mp3`);

    // 4. SSML setup
    const voice = azure.voiceMapping[langCode] || azure.voiceMapping['default'];

//     const ssml = `
// <speak version="1.0"
//     xmlns="http://www.w3.org/2001/10/synthesis"
//     xmlns:mstts="https://www.w3.org/2001/mstts"
//     xml:lang="en-US">
    
//     <voice name="${voice}">
//         <mstts:express-as style="newscast">
//             <prosody rate="0.95">
//                 ${text}
//             </prosody>
//         </mstts:express-as>
//     </voice>

// </speak>`;
// console.log("Speech Key:", azure.speechKey);
// console.log("Region:", azure.region);
    // 5. Azure config
   const ssml = `
<speak version="1.0"
    xmlns="http://www.w3.org/2001/10/synthesis"
    xmlns:mstts="https://www.w3.org/2001/mstts"
    xml:lang="en-US">
    
    <voice name="${voice}">
        <mstts:express-as style="newscast">
            <prosody rate="0.95" pitch="-2%">
                <break time="500ms" />
                ${text}
                <break time="500ms" />
            </prosody>
        </mstts:express-as>
    </voice>

</speak>`;
    const speechConfig = sdk.SpeechConfig.fromSubscription(
        azure.speechKey,
        azure.region
    );

    speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(tempFilePath);

    const synthesizer = new sdk.SpeechSynthesizer(
        speechConfig,
        audioConfig
    );

    // 6. Convert SSML → Speech
    return new Promise((resolve, reject) => {

        synthesizer.speakSsmlAsync(
            ssml,

            async (result) => {
                synthesizer.close();

                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {

                    const uploadResult = await uploadOnCloudinary(
                        tempFilePath,
                        publicId
                    );

                    if (uploadResult) {
                        resolve(uploadResult.secure_url);
                        console.log("Uploaded ID:", uploadResult.public_id);
                    } else {
                        reject(new Error("Cloudinary upload failed"));
                    }

                } else {
                    reject(
                        new Error("Azure TTS Failed: " + result.errorDetails)
                    );
                }
                
            },

            (err) => {
                synthesizer.close();
                reject(err);
            }
        );
    });
};

export { generateSpeech };