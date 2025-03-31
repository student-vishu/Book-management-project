import mongoose, { Schema } from "mongoose";

const wishlistSchema = new Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
    }
}, { timestamps: true })

export const Wishlist = mongoose.model("Wishlist", wishlistSchema)