const mongoose = require("mongoose")

const connectDB = async ()=>{
    const conectionString = process.env.MONGO_URL
    try{
        if(!conectionString){
            throw new Error("DB string is not connecting.")
        }
        const conn = await mongoose.connect(conectionString)
        console.log(`mongoose connected : ${conn.connection.host}`)
    }catch(err){
        console.log(err.message)
        process.exit(1)
    }
}

module.exports = connectDB;