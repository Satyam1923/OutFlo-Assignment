import express from "express";
import { getPersonalizedMessage } from "../controllers/messageController";
const router = express.Router();

router.post('/',getPersonalizedMessage);

export default router;