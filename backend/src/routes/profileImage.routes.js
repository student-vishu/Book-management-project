import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middlewares.js"
import { getProfileImage, uploadProfileImage } from "../controllers/profileImage.controller.js"

const router = Router()

router.route('/uploadProfileImage/:userId').post(verifyJWT, upload.single("profileImage"), uploadProfileImage)

router.route('/getProfileImage/:userId').get(verifyJWT, getProfileImage)

export default router   