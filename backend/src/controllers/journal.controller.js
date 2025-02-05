import { Journal } from "../models/journal.model.js";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


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
    const prompt = `Help me write a journal entry on the topic "${topic}". Provide suggestions for what to include and how to structure it.`;

    const result = await model.generateContent(prompt);

    const aiSuggestions = result.response.text;
  
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
    const { topic, count = 5 } = req.body; // Get topic & count from request

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    let prompt = `Suggest ${count} unique and engaging journal topics for a user interested in ${topic}.`;

    const result = await model.generateContent(prompt);
    
    console.log("AI Response:", result); // Debugging

    const text = result?.response?.text || result?.text || result?.choices?.[0]?.text || "";
    const suggestions = typeof text === "string" ? text.split("\n").filter(Boolean).slice(0, count) : [];

    res.status(200).json({
      message: "Journal topics suggested successfully",
      topics: suggestions,
    });
  } catch (error) {
    console.error("Error suggesting journal topics:", error);
    res.status(500).json({ message: "Error suggesting journal topics", error: error.message });
  }
};

