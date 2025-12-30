import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getLeasePayments, getLeases } from "../controller/lease-controller.js";

const router = express.Router()


router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get("/:id/payments", authMiddleware(["manager", "tenant"]), getLeasePayments);

export default router