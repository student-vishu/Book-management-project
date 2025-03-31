import { ProfileImage } from "../models/profileImage.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadProfileImage = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if (!req.file) {
        return res.status(400).json(new ApiResponse(400, "No image uploaded"))
    }

    const profileImageLocalPath = req.file.path

    //upload on cloudinary
    const profileImageUrl = await uploadOnCloudinary(profileImageLocalPath)

    if (!profileImageUrl) {
        return res.status(500).json(new ApiResponse(500, "Error while uploading image on cloudinary"))
    }

    // Check if profile image already exists for the user
    let profileImage = await ProfileImage.findOne({ user: userId });
    if (profileImage) {
        // Update existing profile image
        profileImage.image = profileImageUrl?.url || "";
        await profileImage.save();
    } else {
        profileImage = await ProfileImage.create({
            image: profileImageUrl?.url || "",
            user: req.user._id
        })
    }


    res.status(201).json(new ApiResponse(201, profileImage, "Profile image upload successfully"))
})

const getProfileImage = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const profileImage = await ProfileImage.findOne({ user: userId })

    if (!profileImage) {
        return res.status(404).json(new ApiResponse(404, "Profile image not found"))
    }

    res.status(200).json(new ApiResponse(200, profileImage, "Profile image retrived successfully"))
})
export { uploadProfileImage, getProfileImage }