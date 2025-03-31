import mongoose, { Schema } from "mongoose";

const profileImageSchema = new Schema(
    {
        image: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }, { timestamps: true })

export const ProfileImage = mongoose.model("ProfileImage", profileImageSchema)