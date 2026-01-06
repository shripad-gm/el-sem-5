import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getAdminFeed } from "../controllers/admin.controller.js";
import { updateIssueStatus } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/issues", protectRoute, getAdminFeed);
router.patch(
  "/issues/:issueId/status",
  protectRoute,
  updateIssueStatus
);


export default router;
