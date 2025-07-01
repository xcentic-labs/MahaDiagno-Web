import express from 'express';
import {
  uploadBannerImage,
  getAllBanners,
  deleteBanner
} from '../Controller/BannerControler.js';
import uploadHomeBanner from '../Storage/BannerStorage.js'

const BannerRouter = express.Router();

BannerRouter.post('/upload', uploadHomeBanner.single('image'), uploadBannerImage);
BannerRouter.get('/get', getAllBanners);
BannerRouter.delete('/delete/:id', deleteBanner);

export default BannerRouter;
