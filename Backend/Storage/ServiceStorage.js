import multer from "multer";
import path from 'path';
import fs from 'fs';

const bannerFolder = './public/servicebanner';

const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check and create folder if it doesn't exist
        if (!fs.existsSync(bannerFolder)) {
            fs.mkdirSync(bannerFolder, { recursive: true });
        }
        cb(null, bannerFolder);
    },
    filename: function (req, file, cb) {
        const name = file.originalname.split('.')[0];
        const ext = path.extname(file.originalname);
        cb(null, `${name}${Date.now()}${ext}`);
    }
});

export const uploadBanner = multer({ storage: Storage });
