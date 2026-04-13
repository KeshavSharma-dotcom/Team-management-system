const express = require("express")
const connectDB = require("./config/db")
require("dotenv").config()

const app = express()

const AuthRoute = require("./routes/authRoutes")
const teamRoutes = require("./routes/teamRoutes")
const taskRoutes = require("./routes/taskRoutes")

const errorHandler = require("./middlewares/errorHandler")
const notFound = require("./middlewares/notFound")

const port = process.env.PORT || 5000

connectDB()

app.use(express.json())

app.use("/api/auth", AuthRoute)
app.use("/api/teams", teamRoutes)
app.use("/api/tasks", taskRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server live on http://localhost:${port}`)
})