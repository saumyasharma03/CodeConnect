const express = require('express');
const {protect}= require('../middlewares/authMiddleware');
const {saveProject, getUserProjects}= require("../controllers/projectController");
const router = express.Router();


router.post("/save", protect, saveProject);
router.get("/myprojects", protect, getUserProjects);
module.exports=router;