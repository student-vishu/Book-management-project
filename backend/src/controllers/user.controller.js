import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Activity } from "../models/activity.model.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        //find the user
        const user = await User.findById(userId)

        //now this user through genrerate tokens
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //access token go to the user but refresh token we save in database , so now refresh token save in database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })//means validation nai lagavo, direct save karo db ma 

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    //get user detail from frontend
    const { name, email, password, contactNo, address, role } = req.body
    //console.log(req.body);

    //validation -not empty
    //.some() is an array method that checks if at least one item in the array meets a condition.
    if (
        [name, email, password, contactNo, address, role].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check for existeduser
    const existedUser = await User.findOne({
        $or: [{ contactNo }, { email }, { name }]
    })

    if (existedUser) {
        return res
            .status(200)
            .json(new ApiResponse(409, "User already exist"))
    }

    //create user-entry in db
    const user = await User.create({
        name,
        email,
        password,
        contactNo,
        address
    })

    // Insert activity log
    await Activity.create({
        description: `new user registered: ${user.name}`,
        user: user._id
    })
    const existedgAdmin = await User.findOne({ role: 'admin' })
    if (existedgAdmin) {
        // return res.status(202).json({ existedgAdmin })

    }

    if (!existedgAdmin) {
        const adminUser = await User.create({
            name: "admin",
            email: "admin@gmail.com",
            password: "Aa@123",
            contactNo: "7373737373",
            address: "teddjdj",
            role: "admin"
        })

        if (!adminUser) {
            throw new ApiError(500, "Something went wrong while registering admin");
        }
        console.log("Admin registered successfully:", adminUser);
        // return res.status(202).json({ existedgAdmin })

    }

    //check user creation
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    console.log(createdUser);


    if (!createdUser) {
        throw new ApiError(500, "something went wrong while register user")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "user register successfully")
    )


})

const loginUser = asyncHandler(async (req, res) => {
    //req body-data
    const { name, email, password, contactNo } = req.body

    //name or email check 
    if (!name && !email && !contactNo) {
        throw new ApiError(400, "Username or email is required")
    }
    //find user    
    const user = await User.findOne({
        $or: [{ name }, { email }, { contactNo }]
    })

    if (!user) {
        return res
            .status(200)
            .json(new ApiResponse(404, "User does not exist"))
    }

    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        return res.status(200).json(new ApiResponse(401, "Invalid Password"))
    }

    //create access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    //user ne badhi vastu mokalvani sivay pass and refreshtoken
    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")
    await Activity.create({
        description: `user logedin: ${user.name}`,
        user: user._id
    })
    //when we send cookies , we design option.
    //cookies bydefault anyone can modified on frontend , so when below 2 options "true" karie tyre khali server side j cookie modified thai sake.
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        //maxAge: 7 * 24 * 60 * 60 * 1000
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinUser
                },
                "User loggedin successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User Loged out.")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        //compare both tokens that store in db and send by the user
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("newRefreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current user fetched succesfully"))
})

const checkUser = asyncHandler(async (req, res) => {
    const { email, contactNo } = req.body

    const user = await User.findOne({
        $and: [{ email }, { contactNo }]
    })

    if (!user) {
        return res.status(404).json({ statusCode: 404, message: "User not found" })
    }

    return res.status(200)
        .json(new ApiResponse(200, { userId: user._id }, "user found"))
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { password } = req.body
    const { _id } = req.body

    if (!password) {
        return res.status(400).json({ statusCode: 400, message: "Please Enter Password" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.findByIdAndUpdate(
        _id,
        {
            $set: {
                password: hashedPassword
            }
        },
        {
            new: true
        }
    )

    return res.status(200)
        .json(new ApiResponse(200, user, "Password Successfully Update."))
})

const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, email, contactNo } = req.body
    const { userId } = req.params
    //console.log(userId);

    if (!userId) {
        throw new ApiError(404, "user id not found")
    }

    const updateData = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (contactNo) updateData.contactNo = contactNo

    const updateProfile = await User.findByIdAndUpdate(
        userId,
        {
            $set: updateData
        },
        {
            new: true
        }
    )

    return res.status(200).json(new ApiResponse(200, updateProfile, "User profile updated"))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    checkUser,
    forgotPassword, updateUserProfile
}