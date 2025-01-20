import express from "express";
import { createJournalEntry } from "../controllers/journal.controller.js";
import { aiAssistedJournal, suggestJournalTopics } from "../controllers/journal.controller.js";

const router = express.Router();

router.post("/create", createJournalEntry);

router.get("/assist", aiAssistedJournal);
router.post("/suggest", suggestJournalTopics);

export default router;