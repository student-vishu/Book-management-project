import { asyncHandler } from "../utils/asyncHandler.js";
import { Book } from "../models/book.model.js"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


const getBookCount = asyncHandler(async (req, res) => {

    const bookCount = await Book.countDocuments()

    if (bookCount === 0) {
        return res.status(404).json({ message: "No book found" })
    }

    return res.status(200)
        .json(new ApiResponse(200, { bookCount }))
})

const getUserCount = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments()

    if (userCount === 0) {
        return res.status(404).json({ message: "No user found" })
    }

    return res.status(200).json(new ApiResponse(200, { userCount }))
})

const getAllUsers = asyncHandler(async (req, res) => {
    //const users = await User.find().select("-password ")
    const users = await User.find({ role: { $ne: "admin" } }).select("-password -role");

    return res.status(200).json(new ApiResponse(200, users, "Users retrived successfully."))
})

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "user not found")
    }

    await user.deleteOne()

    return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully."))
})

const getAllBooks = asyncHandler(async (req, res) => {
    const books = await Book.find().select("-description").populate("category", "name")

    return res.status(200).json(new ApiResponse(200, books, "All books retrived successfully."))
})

const deleteBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params

    const book = await Book.findById(bookId)

    if (!book) {
        throw new ApiError(404, "Book not found.")
    }

    await book.deleteOne()

    return res.status(200).json(new ApiResponse(200, {}, "Book deleted successfully"))
})

const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await User.find({ role: { $ne: "user" } }).select("-password ")
    if (!admin) {
        throw new ApiError(404, "Admin not found")
    }
    return res.status(201).json(new ApiResponse(201, admin, "Admin details retrived successfully"))
})

const updateAdminProfile = asyncHandler(async (req, res) => {
    const { name, email, contactNo } = req.body
    const { userId } = req.params
    //console.log(userId);

    if (!userId) {
        throw new ApiError(404, "admin id not found")
    }

    const updateData = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (contactNo) updateData.contactNo = contactNo

    const updateProfile = await User.findByIdAndUpdate(
        userId,
        {
            $set: updateData
        },
        {
            new: true
        }
    )

    return res.status(200).json(new ApiResponse(200, updateProfile, "Admin profile updated"))
})
export {
    getBookCount,
    getUserCount,
    getAllUsers,
    deleteUser,
    getAllBooks,
    deleteBook,
    getAdminProfile,
    updateAdminProfile
}