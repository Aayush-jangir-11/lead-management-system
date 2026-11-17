const mongoose = require("mongoose")

const connectDb = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDb successfully connected")
    } catch (error) {
        console.log("MongoDb connection is failed", error)
        process.exit(1);
    }
}

module.exports = connectDb;