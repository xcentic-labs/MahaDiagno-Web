import multer from "multer";
import path from 'path';
import fs from 'fs';

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed!"), false);
    }
};

const reportsFolder = './public/reports';

const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the folder exists
        if (!fs.existsSync(reportsFolder)) {
            fs.mkdirSync(reportsFolder, { recursive: true });
        }
        cb(null, reportsFolder);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        
        // Safer fallback in case req.params.id is undefined
        const id = req.params?.id || `unknown_${Date.now()}`;
        const baseName = `MH2025D${id}`;
        
        cb(null, `${baseName}${ext}`);
    },
});

export const uploadReportFile = multer({
    storage: Storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter
});
