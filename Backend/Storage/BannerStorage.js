import multer from "multer";
import path from "path";
import fs from "fs";

const bannerFolder = './public/banner';

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the folder exists
    if (!fs.existsSync(bannerFolder)) {
      fs.mkdirSync(bannerFolder, { recursive: true }); // recursive makes sure parent dirs are created
    }
    cb(null, bannerFolder);
  },
  filename: function (req, file, cb) {
    const name = file.originalname.split('.')[0];
    const ext = path.extname(file.originalname);
    cb(null, `${name}${Date.now()}${ext}`);
  }
});

const uploadHomeBanner = multer({ storage: Storage });

export default uploadHomeBanner;
