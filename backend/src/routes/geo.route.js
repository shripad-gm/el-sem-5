import express from "express";
import {
  getCities,
  getZones,
  getLocalities
} from "../controllers/geo.controller.js";

const router = express.Router();

router.get("/cities", getCities);
router.get("/zones", getZones);
router.get("/localities", getLocalities);

export default router;
