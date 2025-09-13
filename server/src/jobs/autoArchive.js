import cron from "node-cron";
import Post from "../models/Post.js";

async function run() {
  const now = new Date();
  // Any active item whose date is past now becomes archived
  await Post.updateMany(
    { status: "active", date: { $lt: now } },
    { $set: { status: "archived" } }
  );
  // (Optional) You could also auto-activate future items scheduled for the future, etc.
}

export function startAutoArchive() {
  // every hour (change to "0 0 * * *" for once daily at midnight)
  cron.schedule("0 * * * *", () => {
    run().catch(console.error);
  });
  console.log("⏱️ Auto-archive job scheduled (hourly)");
}