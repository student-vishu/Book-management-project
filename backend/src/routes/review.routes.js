import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { createReview, getReviews } from "../controllers/review.controller.js"


const router = Router()

router.route('/createReview').post(verifyJWT, createReview)

router.route('/:bookId').get(getReviews)

export default router