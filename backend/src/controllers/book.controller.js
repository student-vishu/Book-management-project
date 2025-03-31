import { Book } from "../models/book.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Category } from "../models/category.model.js";


const createBook = asyncHandler(async (req, res) => {

    console.log("receive data", req.body);
    console.log("Received file:", req.file);

    //get all book details from frontend
    const { bookName, author, publishedYear, genre, description, price, category } = req.body

    //console.log(req.user);


    if (
        [bookName, author, publishedYear, genre, description, price, category].some((field) => (field?.trim() === ""))
    ) {
        throw new ApiError(400, "All fields are required")
    }

    if (!category || category.trim() === "") {
        throw new ApiError(400, "Category name is required");
    }

    //check for category exists
    let categoryExist = await Category.findOne({ name: category })

    if (!categoryExist) {
        categoryExist = await Category.create({ name: category })
    }

    //check for book already exist
    const existingBook = await Book.findOne({ bookName })

    if (existingBook) {
        throw new ApiError(409, "Book already exists")
    }

    //check for book cover image

    if (!req.file) {
        throw new ApiError(400, "Book Cover image is required")
    }

    const coverImageLocalPath = req.file.path//uploaded on file path

    // //upload on cloudinary
    const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath)
    //console.log("Cloudinary Upload Response:", coverImage);
    if (!coverImageUrl) {
        throw new ApiError(500, "Error uploading cover image");
    }

    //create book object, entry in db
    const newBook = await Book.create({
        bookName,
        author,
        publishedYear,
        genre,
        description,
        price,
        category: categoryExist._id,
        coverImage: coverImageUrl?.url || "",
        user: req.user._id,
        rating: 1
    })
    //console.log(newBook);


    return res.status(201)
        .json(new ApiResponse(201, newBook, "Book added successfully"))
})

const getAllBooks = asyncHandler(async (req, res) => {
    const books = await Book.find().populate("user", "name email")//The populate() method in Mongoose is used to automatically replace a field in a document with the actual data from a related document.Then, instead of returning just the user ObjectId, MongoDB will return the full user details with only the specified fields.

    //console.log("books", books)

    res.status(200)
        .json(
            new ApiResponse(
                200,
                books,
                "Books fetched successfully"
            )
        )

})

// const getBookById = asyncHandler(async (req, res) => {

//     const { id } = req.params
//     const book = await Book.findById(id).populate("user", "name email")

//     if (!book) {
//         throw new ApiError(404, "Book not found")
//     }

//     res.status(200)
//         .json(new ApiResponse(200, book, "Book detail fetched successfuly"))
// })
const getBookById = asyncHandler(async (req, res) => {

    const { _id } = req.query
    //console.log(_id)
    const book = await Book.findById(_id).populate("user", "name email")

    if (!book) {
        throw new ApiError(404, "Book not found")
    }

    res.status(200)
        .json(new ApiResponse(200, book, "Book detail fetched successfuly"))
})

const updateBook = asyncHandler(async (req, res) => {
    const { bookName, author, publishedYear, genre, description, price, category } = req.body
    const { id } = req.params

    const coverImageLocalPath = req.file?.path

    const existingBook = await Book.findById(id)

    if (!existingBook) {
        return res.status(404)
            .json(new ApiResponse(404, "Book not found"))
    }

    const updateData = {}

    if (bookName) updateData.bookName = bookName
    if (author) updateData.author = author
    if (publishedYear) updateData.publishedYear = publishedYear
    if (genre) updateData.genre = genre
    if (price) updateData.price = price
    if (category) updateData.category = category

    const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImageUrl.url) {
        return res.status(400)
            .json(new ApiResponse(400, "Error while uploading image on cloudinary"))
        //throw new ApiError(400, "Error while uploading image on cloudinary")
    }

    updateData.coverImage = coverImageUrl.url

    const updatedBook = await Book.findByIdAndUpdate(
        id,
        {
            $set: updateData
        },
        {
            new: true
        }
    )

    if (!updatedBook) {
        throw new ApiError(404, "Book not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedBook, "Book update successfully"))
})

const deleteBook = asyncHandler(async (req, res) => {
    const { id } = req.params

    const deletedBook = await Book.findByIdAndDelete(id)

    if (!deletedBook) {
        throw new ApiError(404, "Book not found or already exist")
    }

    res.status(200)
        .json(new ApiResponse(200, {}, "Book deleted successfully"))
})

const getOverallAverageRating = asyncHandler(async (req, res) => {
    const result = await Book.aggregate([
        {
            $group: {
                _id: null, // No grouping field, calculates for all books
                avgRating: { $avg: "$rating" } // Calculate average rating
            }
        }
    ]);
    const overallAverageRating = result.length > 0 ? result[0].avgRating : 0;

    if (!overallAverageRating) {
        return res.status(500).json(new ApiResponse(500,{overallAverageRating},"Failed to calculate overall average rating"))
    }

    return res.status(200).json(new ApiResponse(200, { overallAverageRating }, "Overall average rating calculated successfully"))
})

export {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    getOverallAverageRating
}