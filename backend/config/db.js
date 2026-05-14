const mongoose = require("mongoose")
const logger = require("../utils/logger")
const appConfig = require("./appConfig")

const connectDB = async ()=>{
    const connectionString = appConfig.database.mongoUrl
    try{
        if(!connectionString){
            throw new Error("MONGO_URL environment variable is not set.")
        }
        const conn = await mongoose.connect(connectionString)
        logger.info(`mongoose connected : ${conn.connection.host}`)
    }catch(err){
        logger.error(err.message)
        process.exit(1)
    }
}

module.exports = connectDB;
