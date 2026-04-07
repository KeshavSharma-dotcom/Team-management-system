const express = require("express")
const connectDB = require("./config/db")
const app = express()
.require("dotenv").config()
app.use(express.json())

connectDB();

