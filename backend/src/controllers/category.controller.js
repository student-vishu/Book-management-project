import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";

const getAllCategory = asyncHandler(async (req, res) => {
    const category = await Category.find().sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, category, "All category fetched successfully"))
})

const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const category = await Category.findById(id)

    if (!category) {
        throw new ApiError(404, "category not found")
    }

    const books = await Book.find({ category: id })

    return res
        .status(200)
        .json(new ApiResponse(200, { category, books }, "Category and Books fetched successfully"))
})

export {
    getAllCategory,
    getCategoryById
}