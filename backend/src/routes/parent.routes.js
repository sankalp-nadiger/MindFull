import express from "express";
import { parent_verifyJWT } from "../middleware/auth.middleware.js";
import {
  registerParent,
  loginParent,
  logoutParent
} from "../controllers/parent.controller.js";

const router = express.Router();

router.post("/register-parent", registerParent);
router.get("/parent/:parentId/report", getStudentReport);
router.post("/login", parent_verifyJWT,loginParent);

router.post("/logout", parent_verifyJWT, logoutParent);

export default router;
