const Project = require("../models/project"); // correct import path

const saveProject = async (req, res) => {
  const { title, code, language } = req.body;

  try {
    const project = await Project.create({
      title,
      code,
      language,
      owner: req.user._id,
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveProject, getUserProjects };
