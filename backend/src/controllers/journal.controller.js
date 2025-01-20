import { Journal } from "../models/Journal.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_URL = "https://api.gemini.com/assist";

// Create a new journal entry
export const createJournalEntry = async (req, res) => {
  try {
    const { userId, entryText, topic, moodScore } = req.body;

    if (!userId || !entryText) {
      return res.status(400).json({ message: "User ID and journal entry text are required" });
    }

    // Create the journal entry
    const newJournal = new Journal({
      user: userId,
      entryText,
      topic: topic || "No specific topic",
      entryDate: new Date(),
      moodScore: moodScore || 5,
    });

    await newJournal.save();

    res.status(201).json({
      message: "Journal entry saved successfully",
      journal: newJournal,
    });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({ message: "An error occurred while saving the journal entry." });
  }
};

// AI-assisted journal writing
export const aiAssistedJournal = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const response = await axios.post(
      GEMINI_API_URL,
      {
        prompt: `Help me write a journal entry on the topic "${topic}". Provide suggestions for what to include and how to structure it.`,
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiSuggestions = response.data.choices[0]?.text;

    res.status(200).json({
      message: "AI suggestions generated successfully",
      topic,
      suggestions: aiSuggestions,
    });
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    res.status(500).json({ message: "Error generating AI suggestions", error: error.message });
  }
};

// Suggest journal topics
export const suggestJournalTopics = async (req, res) => {
  try {
    const { preferences, recentEntries } = req.body;

    let prompt = "Suggest unique and engaging journal topics for a user.";
    if (preferences) {
      prompt += ` The user's interests are: ${preferences.join(", ")}.`;
    }
    if (recentEntries && recentEntries.length > 0) {
      prompt += ` Avoid topics related to their recent entries: ${recentEntries.join(", ")}.`;
    }

    const response = await axios.post(
      GEMINI_API_URL,
      {
        prompt,
        max_tokens: 100,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const suggestions = response.data.choices[0]?.text.split("\n").filter(Boolean);

    res.status(200).json({
      message: "Journal topics suggested successfully",
      topics: suggestions,
    });
  } catch (error) {
    console.error("Error suggesting journal topics:", error);
    res.status(500).json({ message: "Error suggesting journal topics", error: error.message });
  }
};
