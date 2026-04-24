import { cloudinary } from "../config/envConfig.js";
import fs from "fs"

const uploadOnCloudinary=async(localFilePath,publicId)=>{
        if(!localFilePath)
            return null;
        try {
            const response=await cloudinary.uploader.upload(localFilePath,{
                resource_type: "video",
                public_id:publicId,
                folder:"news_audios"
            });
            // console.log(response);
            console.log("File Uploaded on cloudinary:",response.secure_url);
            fs.unlinkSync(localFilePath)
            return response;
        } catch (error) {
            console.error("Cloudinary Error:", error);
             fs.unlinkSync(localFilePath);
             return null;
        }
}
export {uploadOnCloudinary};