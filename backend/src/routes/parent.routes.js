import express from "express";
import { parent_verifyJWT } from "../middleware/auth.middleware.js";
import {
  registerParent,
  loginParent,
  logoutParent,
  getSessions,
  getJournals,
  getIssues,
  getStudentReport,
  checkMoodAndNotifyParent
} from "../controllers/parent.controller.js";

const router = express.Router();

router.post("/register-parent", registerParent);
router.get("/parent/report", parent_verifyJWT, getStudentReport);
router.post("/login", parent_verifyJWT,loginParent);

router.post("/logout", parent_verifyJWT, logoutParent);
router.get("/parent/sessions", parent_verifyJWT, getSessions);
router.get("/parent/journals", parent_verifyJWT, getJournals);
router.get("/parent/issues", parent_verifyJWT, getIssues);
router.get("/parent/mood-check", parent_verifyJWT, checkMoodAndNotifyParent);


export default router;
