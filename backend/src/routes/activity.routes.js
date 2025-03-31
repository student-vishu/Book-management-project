import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getRecentActivity } from "../controllers/activity.controller.js";


const router = Router()

router.route('/getRecentActivity').get(verifyJWT, getRecentActivity)

export default router