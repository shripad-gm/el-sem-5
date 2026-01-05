import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getMe, updateMe } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.patch("/me", protectRoute, updateMe);

export default router;
