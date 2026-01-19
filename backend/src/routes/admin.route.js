import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getAdminFeed } from "../controllers/admin.controller.js";
import { updateIssueStatus } from "../controllers/admin.controller.js";
import { uploadIssueProof } from "../controllers/admin.controller.js";
import { upload } from "../utils/upload.js";

const router = express.Router();

router.get("/issues", protectRoute, getAdminFeed);
router.patch(
  "/issues/:issueId/status",
  protectRoute,
  updateIssueStatus
);
router.post(
  "/issues/:issueId/proof",
  protectRoute,
  upload.single("file"),
  uploadIssueProof
);

export default router;
