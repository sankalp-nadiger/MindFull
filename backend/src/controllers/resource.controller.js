import {Resource} from '../models/resource.model.js';
import {Interest} from '../models/interests.models.js';
import {Issue} from '../models/Issues.model.js';

// Fetch recommendations dynamically
export const fetchRecommendations = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Fetch the user's watch history (already used recommendations)
    const watchHistory = await Recommendation.find({ user: userId, watched: true });

    const watchedIds = watchHistory.map((item) => item.referenceId);

    // Populate events in the database
    const eventIds = [];
    for (const event of events) {
      const existingEvent = await Event.findOne({ entryText: event.entryText });

      if (!existingEvent) {
        const newEvent = new Event({
          entryText: event.entryText,
          hostedBy: event.hostedBy,
          type: event.type,
          date: event.date,
          location: event.location,
          slots: event.slots,
          description: event.description,
        });

        const savedEvent = await newEvent.save();
        eventIds.push(savedEvent._id); // Track the event IDs
      } else {
        eventIds.push(existingEvent._id); // Use existing event ID
      }
    }

    // Fetch user's interests and goals
    const interests = await Interest.find({ _id: { $in: interestIds }, isGoal: false });
    const goals = await Interest.find({ user: userId, isGoal: true });

    // Fetch user's issues
    const issues = await Issue.find({ users: userId });

    // Call ML model for recommendations
    const mlResponse = await axios.post('http://django-ml-model-url/recommendations', {
      userId,
      interests,
      goals,
      issues,
      excludeIds: watchedIds,
    });

    const { books, videos, blogs, podcasts, events } = mlResponse.data;

    // Save recommendations to the database
    const resources = [
      ...books.map((item) => ({
        user: userId,
        type: "book",
        title: item.title,
        content: item.content,
        related_interest: interests.map((i) => i._id),
        related_issues: issues.map((i) => i._id),
        related_goals: goals.map((g) => g._id),
      })),
      ...videos.map((item) => ({
        user: userId,
        type: "video",
        title: item.title,
        content: item.content,
        related_interest: interests.map((i) => i._id),
        related_issues: issues.map((i) => i._id),
        related_goals: goals.map((g) => g._id),
      })),
      ...blogs.map((item) => ({
        user: userId,
        type: "blog",
        title: item.title,
        content: item.content,
        related_interest: interests.map((i) => i._id),
        related_issues: issues.map((i) => i._id),
        related_goals: goals.map((g) => g._id),
      })),
      ...podcasts.map((item) => ({
        user: userId,
        type: "podcast",
        title: item.title,
        content: item.content,
        related_interest: interests.map((i) => i._id),
        related_issues: issues.map((i) => i._id),
        related_goals: goals.map((g) => g._id),
      })),
      ...events.map((event) => ({
        user: userId,
        type: "event",
        title: event.entryText,
        content: event.description,
        related_interest: interests.map((i) => i._id),
        related_issues: issues.map((i) => i._id),
        related_goals: goals.map((g) => g._id),
      })),
    ];

    await Resource.insertMany(resources);

    res.status(200).json({
      message: "Recommendations fetched and saved successfully.",
      data: mlResponse.data,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations.", error: error.message });
  }
};

export const markRecommendationAsWatched = async (req, res) => {
  try {
    const { userId, recommendationId } = req.body;

    if (!userId || !recommendationId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const recommendation = await Recommendation.findOneAndUpdate(
      { user: userId, referenceId: recommendationId },
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
