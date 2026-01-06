import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { createIssue } from "../controllers/issue.controller.js";
import { getCitizenFeed } from "../controllers/issue.controller.js";
import { getUniversalFeed } from "../controllers/issue.controller.js";
import { toggleUpvote } from "../controllers/issue.controller.js";
import { addComment } from "../controllers/issue.controller.js";
import { getComments } from "../controllers/issue.controller.js";
import { upload } from "../utils/upload.js";
import { uploadIssueMedia } from "../controllers/media.controller.js";
import { verifyIssue } from "../controllers/issue.controller.js";

const router = express.Router();

router.post("/", protectRoute, createIssue);
router.get("/feed", protectRoute, getCitizenFeed);
router.get("/explore", protectRoute, getUniversalFeed);
router.post(
  "/:issueId/media",
  protectRoute,
  upload.single("file"),
  uploadIssueMedia
);
router.post("/:issueId/upvote", protectRoute, toggleUpvote);
router.post("/:issueId/comments", protectRoute, addComment);
router.get("/:issueId/comments", protectRoute, getComments);
router.post(
  "/:issueId/verify",
  protectRoute,
  verifyIssue
);


export default router;
