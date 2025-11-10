const projectMemberSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "editor", "viewer"], default: "editor" },
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProjectMember", projectMemberSchema);
