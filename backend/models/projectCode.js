// models/ProjectCode.js
import mongoose from "mongoose";

const projectCodeSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  userId: { type: String, required: true },
  code: { type: String, required: true },
}, { timestamps: true });

projectCodeSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export default mongoose.model("ProjectCode", projectCodeSchema);
