export default {
    port: process.env.PORT as unknown,
    dbUrl: process.env.DB_URL as string,
    sessionSecret: process.env.SESSIONS_SECRET as string,
    serverUrl: process.env.SERVER_URL as string,

    // Google auth secrets
    googleClientId: process.env.GOOGLE_CLIENT_ID as string,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,

    // Cloudinary credentials
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUDNAME as string,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string,
};
