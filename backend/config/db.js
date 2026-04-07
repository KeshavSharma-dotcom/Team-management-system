const mongoose = require("mongoose")

const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.DB_URL)
        console.log(`mongoose connected : ${conn.Connection.host}`)
    }catch(err){
        console.log(err.message)
        process.exit(1)
    }
}

module.exports = connectDB;