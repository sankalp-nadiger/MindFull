import express from "express";
import { createJournalEntry } from "../controllers/journalController";
import { aiAssistedJournal, suggestJournalTopics } from "../controllers/journal.controller";

const router = express.Router();

router.post("/create", createJournalEntry);

router.get("/assist", aiAssistedJournal);
router.post("/suggest", suggestJournalTopics);

export default router;