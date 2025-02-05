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
    const { entryText, topic, moodScore } = req.body;
    const userId = req.user._id;
    if (!userId ) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!entryText) {
      return res.status(400).json({ message: "journal entry text are required" });
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
    const { topic, moodScore } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const prompt = `I want to write a journal on the topic "${topic}". Provide suggestions for what to include and how to structure it. Don't give me the whole journal entry, just suggest what I could write and things I can touch upon.
    Give me in brief. Don't exaggerate too much. My mood level out of 10 is "${moodScore}".  After a not describing text, end with : always. Keep Content Suggestions always if suggesting, don't append with anything else`;

    // Generate content using the model
    const result = await model.generateContent(prompt);

    // Extract the text (which may be a function or a string)
    let aiSuggestions = result.response.text;

    // If it's a function, invoke it to get the text
    if (typeof aiSuggestions === "function") {
      aiSuggestions = aiSuggestions();
    }

    // If it's a string, split it into individual topics and rejoin them as a single string
    const suggestions = typeof aiSuggestions === "string" 
      ? aiSuggestions.split("\n").filter(Boolean).join("\n") 
      : "";

    //console.log(suggestions); // Debugging

    res.status(200).json({
      message: "AI suggestions generated successfully",
      topic,
      suggestions, // Send as string now
    });
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    res.status(500).json({ message: "Error generating AI suggestions", error: error.message });
  }
};


// Suggest journal topics
export const suggestJournalTopics = async (req, res) => {
  try {
    const { count = 5, moodScore } = req.body; // Get topic & count from request

    let prompt = `Suggest ${count} unique and engaging journal topics for me. My mood level out of 10 is "${moodScore}". After a not describing text, end with : always`;

    const result = await model.generateContent(prompt);
    
    //console.log("AI Response:", result); // Debugging

    // Fixing text extraction from the function
    const textFunction = result?.response?.text || result?.text || result?.choices?.[0]?.text;
    const text = typeof textFunction === "function" ? textFunction() : textFunction;

    // If it's a string, split it into individual topics
    const suggestions = typeof text === "string" ? text.split("\n").filter(Boolean).slice(0, count) : [];
    
    //console.log(suggestions); // Debugging

    res.status(200).json({
      message: "Journal topics suggested successfully",
      topics: suggestions,
    });
  } catch (error) {
    console.error("Error suggesting journal topics:", error);
    res.status(500).json({ message: "Error suggesting journal topics", error: error.message });
  }
};

