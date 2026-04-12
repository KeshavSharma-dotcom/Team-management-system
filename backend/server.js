const express = require("express")
const connectDB = require("./config/db")
require("dotenv").config()
const app = express()
const AuthRoute = require("./routes/authRoutes")
const authMiddleware = require("./middlewares/auth")
const errorHandler = require("./middlewares/errorHandler")
const notFound = require("./middlewares/notFound")
const port = process.env.PORT || 5000
app.use(express.json())
connectDB()

app.use("/auth/api",AuthRoute)

app.use(notFound)
app.use(errorHandler)
app.listen(port, ()=>{
    console.log(`server live on http://localhost:${port}`)
})