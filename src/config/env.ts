// Environment configuration
export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb+srv://prosmart:prosmart@cluster0.jokss9k.mongodb.net/?appName=Cluster0",
    db: process.env.MONGODB_DB || "prosmart_db"
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "dstmt1w5p",
    apiKey: process.env.CLOUDINARY_API_KEY || "747859347794899",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "O04mjGTySv_xuuXHWQ6hR6uuHcM"
  }
};
