import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema(
    {
        bookName: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        author: {
            type: String,
            required: true,
            trim: true
        },
        publishedYear: {
            type: String,
            required: true
        },
        genre: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            default: 0,
            required: true
        },
        coverImage: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        }
    }, { timestamps: true })

export const Book = mongoose.model("Book", bookSchema)