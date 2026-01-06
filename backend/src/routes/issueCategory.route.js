import express from "express";
import { getIssueCategories } from "../controllers/issueCategory.contoller.js";

const router = express.Router();

router.get("/categories", getIssueCategories);

export default router;
