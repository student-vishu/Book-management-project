import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { addToWishlist, getWishlistItem, removeWishlistItem } from "../controllers/wishlist.controller.js"

const router = Router()

router.route('/addToWishlist').post(verifyJWT, addToWishlist)

router.route('/getWishlistItem').get(verifyJWT, getWishlistItem)

router.route('/:wishlistId').delete(removeWishlistItem)
export default router

