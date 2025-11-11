const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getMyProfile, updateProfile, updatePassword } = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

module.exports = router;
