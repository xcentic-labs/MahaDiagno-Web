import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteImage = (imagePath) => {
  const fullPath = path.join(__dirname, "..", imagePath);
  fs.unlink(fullPath, (err) => {
    if (err) {
      console.error("Error deleting image:", err);
    } else {
      console.log("Image deleted successfully:", fullPath);
    }
  });
};

export default deleteImage;
