import mongoose, { Schema } from "mongoose";

const catrgorySchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const Category = mongoose.model("Category", catrgorySchema)