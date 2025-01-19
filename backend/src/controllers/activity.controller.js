// Import necessary models and dependencies
import { Activity } from "../models/activity.model.js";

/**
 * Controller to handle activity recommendations.
 * This controller can both store the recommendations in the database and send them directly to the frontend.
 */

// Send activity recommendations directly to the frontend
export const getRecommendations = async (req, res) => {
  try {
    // Simulated ML-generated recommendations (replace with actual ML logic as needed)
    const recommendations = [
      { title: "Yoga for Beginners", type: "Exercise", content: "Start your day with simple yoga poses." },
      { title: "Mindfulness Meditation", type: "Mental Health", content: "Relax and focus with guided meditations." },
      { title: "Evening Walks", type: "Physical Activity", content: "Boost your mood with a 30-minute walk." },
    ];

    // Send recommendations directly to the frontend
    return res.status(200).json({
      success: true,
      message: "Activity recommendations fetched successfully.",
      data: recommendations,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations.",
    });
  }
};

// Store activity recommendations in the database
export const storeRecommendations = async (req, res) => {
  try {
    const recommendations = req.body.recommendations; // Assume recommendations are sent as an array in the request body

    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty recommendations provided.",
      });
    }

    // Validate and save each recommendation to the database
    const savedRecommendations = await Activity.insertMany(recommendations);

    return res.status(200).json({
      success: true,
      message: "Recommendations stored successfully.",
      data: savedRecommendations,
    });
  } catch (error) {
    console.error("Error storing recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to store recommendations.",
    });
  }
};

// Get stored activity recommendations from the database
export const fetchStoredRecommendations = async (req, res) => {
  try {
    const activities = await Activity.find(); // Fetch all activities from the database

    return res.status(200).json({
      success: true,
      message: "Stored recommendations fetched successfully.",
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching stored recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stored recommendations.",
    });
  }
};
