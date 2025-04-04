import express from "express";
import { getPersonalizedMessage, scrapeAndSaveProfile } from "../controllers/messageController";
const router = express.Router();

router.post('/',getPersonalizedMessage);
router.post('/scrape-and-generate',scrapeAndSaveProfile)
export default router;