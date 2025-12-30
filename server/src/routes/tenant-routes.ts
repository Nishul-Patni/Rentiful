import express from "express";
import { addFavoriteProperty, createTenant, getTenant, getTenantProperties, removeFavoriteProperty, updateTenant } from "../controller/tenant-controller.js";

const router = express.Router()

router.get("/:cognitoId", getTenant);
router.put("/:cognitoId", updateTenant);
router.get("/:cognitoId/current-properties", getTenantProperties);
router.post("/", createTenant);
router.post("/:cognitoId/favorites/:propertyId", addFavoriteProperty);
router.delete("/:cognitoId/favorites/:propertyId", removeFavoriteProperty);


export default router;