import mongoose from "mongoose"

const connctDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL)
        console.log(`MongoDB conncected !! ${connect.connection.host}`);

    } catch (error) {
        console.log("Database not connected ", error);
    }
}

export default connctDB