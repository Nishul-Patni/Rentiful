import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createApplication, listApplications, updateApplictaionStatus } from "../controller/application-controller.js";

const router = express.Router();

router.post("/", authMiddleware(["tenant"]), createApplication)
router.put("/:id/status", authMiddleware(["manager"]), updateApplictaionStatus)
router.get("/", authMiddleware(["manager", "tenant"]), listApplications);

export default router