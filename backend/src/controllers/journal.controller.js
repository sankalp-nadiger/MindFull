// controllers/journalController.js
import { Journal } from "../models/Journal";
import natural from "natural";

// Create new journal entry
const createJournalEntry = async (req, res) => {
  try {
    const { userId, entryText, topic, moodScore } = req.body;

    if (!userId || !entryText) {
      return res.status(400).json({ message: "User ID and journal entry text are required" });
    }

    // Generate suggestions based on the journal entry
    const suggestions = getSuggestions(entryText);

    // Prepare the journal entry with default date if not provided
    const newJournal = new Journal({
      user: userId, // Referring to the user
      entryText, 
      topic: topic || "No specific topic", // Default if no topic is provided
      entryDate: new Date(),
      moodScore: moodScore || 5, // Default mood score
    });

    // Save the journal entry to the database
    await newJournal.save();

    // Return the journal entry and suggestions in the response
    res.status(201).json({
      message: "Journal entry saved successfully",
      journal: newJournal,
      suggestions,
    });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({ message: "An error occurred while saving the journal entry." });
  }
};

export { createJournalEntry };
