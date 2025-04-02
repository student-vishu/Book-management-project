import { Wishlist } from "../models/wishlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const addToWishlist = asyncHandler(async (req, res) => {
    const { bookId , userId } = req.body

    if (!bookId) {
        throw new ApiError(400, "Book ID is required")
    }

    // Check if book is already in the cart
    const existingWishlisttItem = await Wishlist.findOne({ book: bookId,user:userId })

    if (existingWishlisttItem) {
        return res.status(200).json(new ApiResponse(200, "Your book is already added in Wishlist"))
    }

    //add new item in cart,
    const wishlistItem = await Wishlist.create({ book: bookId ,user:userId})

    res.status(201).json(new ApiResponse(201, wishlistItem, "Book added to Wishlist successfully"))
})

const getWishlistItem = asyncHandler(async (req, res) => {
    //const wishlistItems = await Wishlist.find().populate("book", "bookName price author coverImage rating user")
    const wishlistItems = await Wishlist.find()
    .populate({
        path: "book",
        model: "Book", // Ensure the correct model name
    });

    if (wishlistItems.length === 0) {
        res.status(200).json(new ApiResponse(404, wishlistItems, "wishlist is Empty"))
    }

    res.status(200).json(new ApiResponse(200, wishlistItems, "wishlistItems retrieved successfully"))
})

const removeWishlistItem = asyncHandler(async (req, res) => {
    const { wishlistId } = req.params

    const wishlistItem = await Wishlist.findByIdAndDelete(wishlistId)

    if (!wishlistItem) {
        throw new ApiError(404, "wishlist item not found")
    }

    res.status(200).json(new ApiResponse(200, null, "wishlist item delete successfully"))
})
export { addToWishlist, getWishlistItem, removeWishlistItem }

