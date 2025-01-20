import express from "express";
import { parent_verifyJWT } from "../middleware/auth.middleware.js";
import {
  registerParent,
  loginParent,
  logoutParent,
  getSessions,
  getJournals,
  getIssues,
  getStudentReport
} from "../controllers/parent.controller.js";

const router = express.Router();

router.post("/register-parent", registerParent);
router.get("/parent/:parentId/report", getStudentReport);
router.post("/login", parent_verifyJWT,loginParent);

router.post("/logout", parent_verifyJWT, logoutParent);
router.get("/parent/:parentId/sessions", getSessions);
router.get("/parent/:parentId/journals", getJournals);
router.get("/parent/:parentId/issues", getIssues);

export default router;
