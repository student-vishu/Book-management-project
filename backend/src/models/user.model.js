import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is requird"]
        },
        contactNo: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

//password encryption 
//bcrypt pre hooks aape, means password database ma save("save" event) thai eni pela (pre) password encrypt karvano che
//here callback function used , but arrow (()=>{}) function use nai karavano bcz arraow function pase "this" no reference nathi hoto , so we can use normal function (function (){})
//"this" pase badhi field no access hoi , so thats why "this.password"
//isModified("password") in this "password" is field name
//The 10 represents the salt rounds used in the hashing process.
//Salt rounds determine how many times the hashing algorithm runs internally.

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()//Move to the next step (saving user to DB)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//generate jwt tokens
//sign() method generate tokens
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            //payloads means kai kai information rakho 
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)