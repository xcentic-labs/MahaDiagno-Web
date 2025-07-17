import prisma from '../Utils/prismaclint.js';
import { deletePromotionalBanner } from '../Utils/deletebanner.js';
import logError from "../Utils/log.js";
// Upload Banner
export const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const newBanner = await prisma.homeBanner.create({
      data: {
        imageName: req.file.filename,
      },
    });

    res.status(201).json({
      success: true,
      message: "Banner uploaded successfully",
      data: newBanner,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get All Banners
export const getAllBanners = async (req, res) => {
  try {
    const banners = await prisma.homeBanner.findMany();
    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: "Failed to fetch banners" });
  }
};

// Delete Banner by ID
export const deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const banner = await prisma.homeBanner.findUnique({ where: { id: parseInt(id) } });

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    deletePromotionalBanner(banner.imageName)

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: "Failed to delete banner" });
  }
};
