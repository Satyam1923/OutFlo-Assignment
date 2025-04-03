import express from "express";
import { getAllCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign, toggleCampaignStatus } from "../controllers/campaginController";

const router = express.Router();

router.get("/", getAllCampaigns);
router.get("/:id",getCampaignById);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
router.patch("/:id",toggleCampaignStatus);

export default router;