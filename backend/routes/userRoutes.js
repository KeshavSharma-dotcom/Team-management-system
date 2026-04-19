const express = require("express")
const router = express.Router()
const {getMe,updateProfile, addSecondaryEmail, verifySecondaryEmail} = require("../controllers/userController")
const {authenticateUser} = require("../middlewares/authMiddleware")
 
router.get("/me", authenticateUser, getMe);
router.patch("/update", authenticateUser, updateProfile);
router.post("/add-secondary-email", authenticateUser, addSecondaryEmail);
router.post("/verify-secondary-email", authenticateUser, verifySecondaryEmail);

module.exports = router