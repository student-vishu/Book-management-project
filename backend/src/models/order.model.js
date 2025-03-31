import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
    totalPrice: {
        type: Number,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    cartItems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart"
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'CANCELED', 'DELEVERED'],//enum (Enumeration) restricts values of the status field.The field can only store one of the following values
        default: 'PENDING'
    }
}, { timestamps: true })

export const Order = mongoose.model("Order", orderSchema)