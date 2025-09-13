import Post from "../models/Post.js";

// ----------------------
// Build query from query params
// ----------------------
function buildFilter(q) {
  const filter = {};
  if (q.type && q.type !== "all") filter.type = q.type;
  if (q.level && q.level !== "all") filter.level = q.level;
  if (q.status && q.status !== "all") filter.status = q.status;

  if (q.search) {
    filter.$or = [
      { title: { $regex: q.search, $options: "i" } },
      { content: { $regex: q.search, $options: "i" } }
    ];
  }
  return filter;
}

// ----------------------
// GET /api/posts
// ----------------------
export async function listPosts(req, res, next) {
  try {
    const filter = buildFilter(req.query);
    const posts = await Post.find(filter).sort({ createdAt: -1 });

    res.json({ items: posts }); // ✅ always wrap in { items: [...] }
  } catch (e) {
    next(e);
  }
}

// ----------------------
// POST (create)
// ----------------------
export async function createPost(req, res, next) {
  try {
    const { title, content = "", type, level = "all", date } = req.body;

    const doc = new Post({
      title,
      content,
      type,
      level,
      status: "active",  // ✅ default status
      date: date ? new Date(date) : new Date(),
      fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await doc.save();
    res.status(201).json({ item: doc });
  } catch (e) {
    next(e);
  }
}

// ----------------------
// PUT (update)
// ----------------------
export async function updatePost(req, res, next) {
  try {
    const updates = { ...req.body };

    if (updates.date) updates.date = new Date(updates.date);
    // ✅ Just assign plain values – no need for new Title/Content/Level
    if (updates.title) updates.title = updates.title;
    if (updates.content) updates.content = updates.content;
    if (updates.level) updates.level = updates.level;

    if (req.file) updates.fileUrl = `/uploads/${req.file.filename}`;

    const doc = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ message: "Not found" });

    res.json({ item: doc });
  } catch (e) {
    console.error("UpdatePost Error:", e.message);
    next(e);
  }
}

// ----------------------
// PATCH status (manual archive/unarchive)
// ----------------------

export async function setStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!["active", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const doc = await Post.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!doc) return res.status(404).json({ message: "Not found" });

    res.json({ item: doc }); // ✅ consistent response
  } catch (e) {
    next(e);
  }
}

// ----------------------
// DELETE
// ----------------------
export async function removePost(req, res, next) {
  try {
    const ok = await Post.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" }); // ✅ consistent message
  } catch (e) {
    next(e);
  }
}