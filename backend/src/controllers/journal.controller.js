const createJournalEntry = async (req, res) => {
    try {
      const { userId, entryText, topic, moodScore } = req.body;
  
      if (!userId || !entryText) {
        return res.status(400).json({ message: "User ID and journal entry text are required" });
      }
  
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
      });
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "An error occurred while saving the journal entry." });
    }
  };

  import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_URL = 'https://api.gemini.com/assist'; 

/**
 * AI-assisted journal writing controller
 */
export const aiAssistedJournal = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    // Make a request to the Gemini API for suggestions
    const response = await axios.post(
      GEMINI_API_URL,
      {
        prompt: `Help me write a journal entry on the topic "${topic}". Provide suggestions for what to include and how to structure it.`,
        max_tokens: 300, // Adjust based on the desired response length
        temperature: 0.7, // Adjust creativity level
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiSuggestions = response.data;

    // Respond with AI suggestions
    res.status(200).json({
      message: 'AI suggestions generated successfully',
      topic,
      suggestions: aiSuggestions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Error generating AI suggestions',
      error: error.message,
    });
  }
};

export const suggestJournalTopics = async (req, res) => {
    try {
      const { preferences, recentEntries } = req.body;
  
      // Construct the prompt for topic suggestions
      let prompt = 'Suggest unique and engaging journal topics for a user.';
      if (preferences) {
        prompt += ` The user's interests are: ${preferences.join(', ')}.`;
      }
      if (recentEntries && recentEntries.length > 0) {
        prompt += ` Avoid topics related to their recent entries: ${recentEntries.join(', ')}.`;
      }
  
      // Call the Gemini API to generate topic suggestions
      const response = await axios.post(
        GEMINI_API_URL,
        {
          prompt: prompt,
          max_tokens: 100, // Limit to a few topic suggestions
          temperature: 0.8, // Adjust creativity for diverse ideas
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const suggestions = response.data;
  
      // Respond with suggested topics
      res.status(200).json({
        message: 'Journal topics suggested successfully',
        topics: suggestions.choices[0]?.text.split('\n').filter(Boolean), // Split and filter suggestions
      });
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        message: 'Error suggesting journal topics',
        error: error.message,
      });
    }
  };

export { createJournalEntry };