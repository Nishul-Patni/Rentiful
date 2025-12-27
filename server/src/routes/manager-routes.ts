import express from "express";
import { createManager, getManager, updateManager } from "../controller/manager-controller.js";

const router = express.Router()

router.get("/:cognitoId", getManager);
router.put("/:cognitoId", updateManager);
router.post("/", createManager);


export default router