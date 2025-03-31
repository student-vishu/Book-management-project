import { Router } from "express"
import { getAllCategory, getCategoryById } from "../controllers/category.controller.js"

const router = Router()

router.route('/getAllCategory').get(getAllCategory)

router.route('/:id').get(getCategoryById)

export default router