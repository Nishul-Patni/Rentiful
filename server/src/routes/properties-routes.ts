import { Router } from "express"
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    getProperties,
    getProperty,
    createProperty
} from "../controller/properties-controller.js"


const storage = multer.memoryStorage();
const upload = multer({
    storage: storage
})

const router = Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", authMiddleware(["manager"]), upload.array("photos"), createProperty);


export default router;