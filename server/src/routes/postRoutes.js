import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { upload } from "../utils/uploader.js";  // ✅ use custom uploader
import {
  listPosts, createPost, updatePost, setStatus, removePost
} from "../controllers/posts.controller.js";

const router = Router();

// Public reads
router.get("/", listPosts);

// Admin writes
router.post("/", requireAuth, upload.single("file"), createPost);
router.put("/:id", requireAuth, upload.single("file"), updatePost);
router.patch("/:id/status", requireAuth, setStatus);
router.delete("/:id", requireAuth, removePost);

export default router;