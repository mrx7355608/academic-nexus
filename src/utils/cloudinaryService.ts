import config from "../config/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});

export default function CloudinaryService() {
    const deleteResource = (publicId: string, fileExtension: string) => {
        cloudinary.api
            .delete_resources([publicId], {
                type: "upload",
                resource_type: fileExtension === "docx" ? "raw" : "image",
            })
            .then(console.log);
    };

    return { deleteResource };
}
