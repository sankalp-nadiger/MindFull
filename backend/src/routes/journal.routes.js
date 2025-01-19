// routes/journalRoutes.js
import express from "express";
import { createJournalEntry } from "../controllers/journalController";

const router = express.Router();

// Route to create a new journal entry
router.post("/create", createJournalEntry);

export default router;
