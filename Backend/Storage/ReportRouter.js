import multer from "multer";
import path from 'path'

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed!"), false);
    }
};

const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/reports');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        
        const baseName = `MH2025D${req.params.id}` || `${Date.now()}_report_unknown`;
        cb(null, `${baseName}${ext}`);
    },
})

export const uploadReportFile = multer({
    storage: Storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter
});