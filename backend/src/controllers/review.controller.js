import { Review } from "../models/review.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Book } from "../models/book.model.js"

const createReview = asyncHandler(async (req, res) => {
    const { bookId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!bookId) {
        throw new ApiError(400, "Book ID is required.");
    }

    if (!rating && !comment) {
        throw new ApiError(400, "At least a rating or comment is required.");
    }

    const numericRating = parseFloat(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        throw new ApiError(400, "Rating must be a number between 1 and 5.");
    }

    // Find existing book's review document
    let reviewDoc = await Review.findOne({ book: bookId });

    if (!reviewDoc) {
        // If no review document exists, create one
        reviewDoc = await Review.create({
            book: bookId,
            review: []
        });
    }

    // Check if user has already reviewed
    const existingReview = reviewDoc.review.find(r => r.user.toString() === userId);
    if (existingReview) {
        throw new ApiError(409, "You have already reviewed this book.");
    }

    // Push new review to the array
    reviewDoc.review.push({
        user: userId,
        rating: numericRating,
        comment
    });

    // Save the updated review document
    await reviewDoc.save();

    // Calculate new average rating
    const totalRatings = reviewDoc.review.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = (totalRatings / reviewDoc.review.length).toFixed(1);

    // Update the book's rating
    await Book.findByIdAndUpdate(bookId, { rating: parseFloat(averageRating) });

    res.status(201).json(new ApiResponse(201, reviewDoc, "Review added successfully"));
});


const getReviews = asyncHandler(async (req, res) => {
    const { bookId } = req.params

    if (!bookId) {
        throw new ApiError(400, "BookId is required")
    }

    const reviews = await Review.findOne({ book: bookId }).populate("review.user", "name email")

    if (!reviews || reviews.review.length === 0) {
        //throw new ApiError(404, "No reviews found for this book")
        return res.status(404)
        .json(new ApiResponse(404, reviews, "No reviews found for this book"))    
    }

    return res.status(200)
        .json(new ApiResponse(200, reviews, "Reviews retrieved successfully"))
})


export { createReview, getReviews }