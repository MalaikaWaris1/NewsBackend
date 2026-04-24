import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary"

//cloudinary Setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const azure= {
        speechKey: process.env.AZURE_SPEECH_KEY,
        region: process.env.AZURE_SPEECH_REGION,
        tempAudioPath:  './src/temp_audio',
        voiceMapping:{
            'eng': 'en-US-JennyNeural',
            'urd': 'ur-PK-AsadNeural',
            'hin': 'hi-IN-MadhurNeural',
            'default': 'en-US-JennyNeural'
        }
    };
export {
    cloudinary,
    azure
}