import { Resource } from '../models/resource.model.js';
import { Interest } from '../models/interests.models.js';
import { Issue } from '../models/Issues.model.js';
import { fetchRecommendations } from './recommendations.controller.js';

export const fetchResourceRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Fetch all user data
    const interests = await Interest.find({ user: userId, isGoal: false });
    const goals = await Interest.find({ user: userId, isGoal: true });
    const issues = await Issue.find({ users: userId, severity: "High" });

    // Get user's watch history
    const watchHistory = await Resource.find({ user: userId, watched: true });
    const watchedUrls = watchHistory.map(item => item.url);

    // Prepare data for recommendations controller
    const recommendationData = {
      userId,
      watchedUrls,
      userPreferences: {
        interests: (interests || []).map(i => ({
          id: i?._id || null,
          name: i?.name || ""
        })),
        goals: (goals || []).map(g => ({
          id: g?._id || null,
          name: g?.name || ""
        })),
        issues: (issues || []).map(i => ({
          id: i?._id || null,
          name: i?.name || ""
        }))
      }
    };    

    // Get recommendations considering all user criteria
    const recommendations = await fetchRecommendations({
      body: recommendationData,
      user: req.user
    }, res);

    if (res.headersSent) return;

    res.status(200).json({
      message: "Resources fetched successfully.",
      data: topRecommendations
    });

  } catch (error) {
    console.error("Error fetching resources:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: "Error fetching resources.", 
        error: error.message 
      });
    }
  }
};
export const markRecommendationAsWatched = async (req, res) => {
  try {
    const userId = req.user._id;
    const { recommendationTitle } = req.body;  // Use title as identifier

    if (!userId || !recommendationTitle) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const recommendation = await Resource.findOneAndUpdate(
      { user: userId, title: recommendationTitle },  // Use title to find the resource
      { watched: true },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found.' });
    }

    res.status(200).json({
      message: 'Recommendation marked as watched.',
      data: recommendation,
    });
  } catch (error) {
    console.error('Error marking recommendation as watched:', error);
    res.status(500).json({ message: 'Error updating recommendation.', error: error.message });
  }
};


