import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folderPath = "";

        switch (file.fieldname) {
            case "image":
                folderPath = "./public/medicineimage";
                break;
            default:
                return cb(new Error("Unknown field name for file upload"));
        }

        // Ensure the folder exists
        fs.mkdirSync(folderPath, { recursive: true });

        cb(null, folderPath);
    },

    filename: function (req, file, cb) {
        const baseName = file.originalname.split(".")[0];
        const ext = path.extname(file.originalname);
        cb(null, `${baseName}-${Date.now()}${ext}`);
    }
});


export const uploadMedicineImage = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
}).fields([
    { name: "image", maxCount: 1 },
]);