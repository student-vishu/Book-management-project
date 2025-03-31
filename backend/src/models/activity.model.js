import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
    {
        description: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }, { timestamps: true })

export const Activity = mongoose.model("Activity", activitySchema)