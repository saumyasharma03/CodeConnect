const Project = require("../models/project");
const User = require("../models/User");

const saveProject = async (req, res) => {
  const { projectId, title, code, language } = req.body;

  try {
    // If project exists → update it
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });

      // Only owner or contributors can edit
      const isOwner = project.owner.toString() === req.user._id.toString();
      const isContributor = project.contributors.some(
        userId => userId.toString() === req.user._id.toString()
      );

      if (!isOwner && !isContributor) {
        return res.status(403).json({ message: "No permission to edit this project" });
      }

      if (title) project.title = title;
      project.code = code;
      project.language = language;
      project.lastEdited = Date.now();

      await project.save();
      return res.json({ message: "✅ Changes saved", project });
    }

    // If no projectId → Create new project
    const newProject = await Project.create({
      title,
      code,
      language,
      owner: req.user._id,
      contributors: [] // start empty
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { projectsOwned: newProject._id }
    });

    return res.status(201).json({ message: "✅ Project created", project: newProject });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { contributors: req.user._id }
      ]
    })
      .populate("owner", "name email")
      .populate("contributors", "name email");

    res.json(projects);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { contributors: req.user._id }
      ]
    }).populate("owner", "name email").populate("contributors", "name email");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addContributor = async (req, res) => {
  const { projectId, contributorEmail } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can add contributors" });
    }

    const user = await User.findOne({ email: contributorEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (project.contributors.includes(user._id)) {
      return res.status(400).json({ message: "User is already a contributor" });
    }

    project.contributors.push(user._id);
    await project.save();

    return res.json({ message: "✅ Contributor added", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { saveProject, getUserProjects, addContributor };
