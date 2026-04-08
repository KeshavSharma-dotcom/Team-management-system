const express = require("express")
const connectDB = require("./config/db")
require("dotenv").config()

const app = express()

const port = process.env.PORT || 5000
app.use(express.json())

connectDB();

app.listen(port, ()=>{
    console.log(`server live on http://localhost:${port}`)
})