import express from "express";
import { createJournalEntry } from "../controllers/journal.controller.js";
import { aiAssistedJournal, suggestJournalTopics } from "../controllers/journal.controller.js";
import { user_verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", user_verifyJWT, createJournalEntry);

router.post("/assist", aiAssistedJournal);
router.post("/suggest", suggestJournalTopics);

export default router;