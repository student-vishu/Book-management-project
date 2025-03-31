import { Activity } from "../models/activity.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getRecentActivity = asyncHandler(async (req, res) => {
    const recentActivity = await Activity.find().sort({ createdAt: -1 }).limit(5)

    if (!recentActivity) {
        throw new ApiError(404, "No recent activities found")
    }

    return res.status(200).json(new ApiResponse(200, recentActivity, "Recent activities fetched"))
})

export { getRecentActivity }