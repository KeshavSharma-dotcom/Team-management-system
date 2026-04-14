const express = require("express")

require("dotenv").config()
const connectDB = require("./config/db")
const app = express()

const AuthRoute = require("./routes/authRoutes")
const teamRoutes = require("./routes/teamRoutes")
const taskRoutes = require("./routes/taskRoutes")
const cors = require("cors")
const errorHandler = require("./middlewares/errorHandler")
const notFound = require("./middlewares/notFound")

const port = process.env.PORT || 5000

connectDB()
app.use(cors())
app.use(express.json())

app.use("/api/v1/auth", AuthRoute)
app.use("/api/v1/teams", teamRoutes)
app.use("/api/v1/tasks", taskRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server live on http://localhost:${port}`)
})