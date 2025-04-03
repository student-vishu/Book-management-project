import { Router } from "express"
import { createBook, deleteBook, getAllBooks, getBookById, updateBook } from "../controllers/book.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router()

router.route('/addBook').post(verifyJWT, upload.single("coverImage"), createBook)

router.route('/getAllBooks').get(verifyJWT, getAllBooks)
// router.route('/getAllBooks').get(getAllBooks)

router.route('/:id').get(getBookById)

router.route('/:id').put(verifyJWT, upload.single("coverImage"), updateBook)

router.route('/:id').delete(verifyJWT, deleteBook)

export default router