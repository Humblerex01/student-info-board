import mongoose from "mongoose";

/**
 * type: "announcement" | "event" | "timetable"
 * level: "all" | "100L" | "200L" | "300L" | "400L" | "500L"
 * date: main relevant date (event date, or timetable effective date, or announcement relevant date)
 * fileUrl: for timetables (optional)
 */
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: "" },
  type: { type: String, enum: ["announcement", "event", "timetable"], required: true },
  level: { type: String, enum: ["all","100L","200L","300L","400L","500L"], default: "all" },
  date: { type: Date, default: Date.now },
  postedOn: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "archived"], default: "active" },
  fileUrl: { type: String } // e.g. /uploads/abc.pdf
}, { timestamps: true });

export default mongoose.model("Post", PostSchema);